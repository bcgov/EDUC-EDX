'use strict';

const config = require('./config/index');
const dotenv = require('dotenv');
const log = require('./components/logger');
const morgan = require('morgan');
const session = require('express-session');
const express = require('express');
const passport = require('passport');
const helmet = require('helmet');
const cors = require('cors');
const utils = require('./components/utils');
const auth = require('./components/auth');
const bodyParser = require('body-parser');
const connectRedis = require('connect-redis');
dotenv.config();

const scheduler = require('./schedulers/student-profile-scheduler');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const OidcStrategy = require('passport-openidconnect-kc-idp').Strategy;
const noCache = require('nocache');
const apiRouter = express.Router();
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const studentRequestRouter = require('./routes/studentRequest');
const penRequestRouter = require('./routes/penRequest');
const configRouter = require('./routes/config');
const promMid = require('express-prometheus-middleware');
const messageSubscriber = require('./messaging/message-subscriber');
messageSubscriber.init();
messageSubscriber.callbacks();
//initialize app
const app = express();
app.set('trust proxy', 1);
//sets security measures (headers, etc)
app.use(cors());
app.use(helmet());
app.use(noCache());
app.use(promMid({
  metricsPath: '/api/prometheus',
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 1.5]
}));
//tells the app to use json as means of transporting data
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb'
}));

const logStream = {
  write: (message) => {
    log.info(message);
  }
};




const Redis = require('./util/redis/redis-client');
Redis.init(); // call the init to initialize appropriate client, and reuse it across the app.
const RedisStore = connectRedis(session);
const dbSession = new RedisStore({
  client: Redis.getRedisClient(),
  prefix: 'student-profile-sess:',
});
const cookie = {
  secure: true,
  httpOnly: true,
  maxAge: 1800000 //30 minutes in ms. this is same as session time. DO NOT MODIFY, IF MODIFIED, MAKE SURE SAME AS SESSION TIME OUT VALUE.
};
if ('local' === config.get('environment')) {
  cookie.secure = false;
}
//sets cookies for security purposes (prevent cookie access, allow secure connections only, etc)
app.use(session({
  name: 'student_profile_cookie',
  secret: config.get('oidc:clientSecret'),
  resave: false,
  saveUninitialized: true,
  cookie: cookie,
  store: dbSession
}));
app.use(require('./routes/health-check').router);
//initialize routing and session. Cookies are now only reachable via requests (not js)
app.use(passport.initialize());
app.use(passport.session());

function addLoginPassportUse(discovery, strategyName, callbackURI, kc_idp_hint) {
  passport.use(strategyName, new OidcStrategy({
    issuer: discovery.issuer,
    authorizationURL: discovery.authorization_endpoint,
    tokenURL: discovery.token_endpoint,
    userInfoURL: discovery.userinfo_endpoint,
    clientID: config.get('oidc:clientId'),
    clientSecret: config.get('oidc:clientSecret'),
    callbackURL: callbackURI,
    scope: discovery.scopes_supported,
    kc_idp_hint: kc_idp_hint
  }, (_issuer, _sub, profile, accessToken, refreshToken, done) => {
    if ((typeof (accessToken) === 'undefined') || (accessToken === null) ||
      (typeof (refreshToken) === 'undefined') || (refreshToken === null)) {
      return done('No access token', null);
    }

    //set access and refresh tokens
    profile.jwtFrontend = auth.generateUiToken();
    profile.jwt = accessToken;
    profile.refreshToken = refreshToken;
    return done(null, profile);
  }));
}

//initialize our authentication strategy
utils.getOidcDiscovery().then(discovery => {
  //OIDC Strategy is used for authorization
  addLoginPassportUse(discovery, 'oidcBcsc', config.get('server:frontend') + '/api/auth/callback_bcsc', 'keycloak_bcdevexchange_bcsc');
  addLoginPassportUse(discovery, 'oidcBcscGMP', config.get('server:frontend') + '/api/auth/callback_bcsc_gmp', 'keycloak_bcdevexchange_bcsc');
  addLoginPassportUse(discovery, 'oidcBcscUMP', config.get('server:frontend') + '/api/auth/callback_bcsc_ump', 'keycloak_bcdevexchange_bcsc');
  addLoginPassportUse(discovery, 'oidcBceid', config.get('server:frontend') + '/api/auth/callback_bceid', 'keycloak_bcdevexchange_bceid');
  addLoginPassportUse(discovery, 'oidcBceidGMP', config.get('server:frontend') + '/api/auth/callback_bceid_gmp', 'keycloak_bcdevexchange_bceid');
  addLoginPassportUse(discovery, 'oidcBceidUMP', config.get('server:frontend') + '/api/auth/callback_bceid_ump', 'keycloak_bcdevexchange_bceid');

  //JWT strategy is used for authorization
  passport.use('jwt', new JWTStrategy({
    algorithms: ['RS256'],
    // Keycloak 7.3.0 no longer automatically supplies matching client_id audience.
    // If audience checking is needed, check the following SO to update Keycloak first.
    // Ref: https://stackoverflow.com/a/53627747
    audience: config.get('server:frontend'),
    issuer: config.get('tokenGenerate:issuer'),
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.get('tokenGenerate:publicKey'),
    ignoreExpiration: true
  }, (jwtPayload, done) => {
    if ((typeof (jwtPayload) === 'undefined') || (jwtPayload === null)) {
      return done('No JWT token', null);
    }

    done(null, {
      email: jwtPayload.email,
      familyName: jwtPayload.family_name,
      givenName: jwtPayload.given_name,
      jwt: jwtPayload,
      name: jwtPayload.name,
      user_guid: jwtPayload.user_guid,
      realmRole: jwtPayload.realm_role
    });
  }));
});
//functions for serializing/deserializing users
passport.serializeUser((user, next) => next(null, user));
passport.deserializeUser((obj, next) => next(null, obj));


// GetOK Base API Directory
apiRouter.get('/', (_req, res) => {
  res.status(200).json({
    endpoints: [
      '/api/auth',
      '/api/student'
    ],
    versions: [
      1
    ]
  });
});

app.use(morgan(config.get('server:morganFormat'), { 'stream': logStream }));
//set up routing to auth and main API
app.use(/(\/api)?/, apiRouter);

apiRouter.use('/auth', authRouter);
apiRouter.use('/user', userRouter);
apiRouter.use('/ump', studentRequestRouter);
apiRouter.use('/gmp', penRequestRouter);
apiRouter.use('/config',configRouter);

//Handle 500 error
app.use((err, _req, res, next) => {
  log.error(err?.stack);
  res?.redirect(config?.get('server:frontend') + '/error?message=500_internal_error');
  next();
});

// Handle 404 error
app.use((_req, res) => {
  log.error('404 Error');
  res.redirect(config?.get('server:frontend') + '/error?message=404_Page_Not_Found');
});

// Prevent unhandled errors from crashing application
process.on('unhandledRejection', err => {
  log.error('Unhandled Rejection at:', err?.stack || err);
  // res.redirect(config.get('server:frontend') + '/error?message=unhandled_rejection');
});
scheduler.draftToAbandonRequestJob.start();
module.exports = app;

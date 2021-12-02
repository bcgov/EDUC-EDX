'use strict';

const config = require('../config/index');
const passport = require('passport');
const express = require('express');
const auth = require('../components/auth');
const log = require('../components/logger');
const {v4: uuidv4} = require('uuid');
const {
  body,
  validationResult
} = require('express-validator');
const router = express.Router();


router.get('/', (_req, res) => {
  res.status(200).json({
    endpoints: [
      '/callback_bcsc',
      '/callback_bcsc_gmp',
      '/callback_bcsc_ump',
      '/callback_bceid',
      '/callback_bceid_gmp',
      '/callback_bceid_ump',
      '/login',
      '/logout',
      '/refresh',
      '/token'
    ]
  });
});

function addOIDCRouterGet(strategyName, callbackURI, redirectURL) {
  router.get(callbackURI,
    passport.authenticate(strategyName, {
      failureRedirect: 'error'
    }),
    (_req, res) => {
      res.redirect(redirectURL);
    }
  );
}

addOIDCRouterGet('oidcBcsc', '/callback_bcsc', config.get('server:frontend'));
addOIDCRouterGet('oidcBcscGMP', '/callback_bcsc_gmp', config.get('server:frontend') + '/gmp');
addOIDCRouterGet('oidcBcscUMP', '/callback_bcsc_ump', config.get('server:frontend') + '/ump');
addOIDCRouterGet('oidcBceid', '/callback_bceid', config.get('server:frontend'));
addOIDCRouterGet('oidcBceidGMP', '/callback_bceid_gmp', config.get('server:frontend') + '/gmp');
addOIDCRouterGet('oidcBceidUMP', '/callback_bceid_ump', config.get('server:frontend') + '/ump');

//a prettier way to handle errors
router.get('/error', (_req, res) => {
  res.redirect(config.get('server:frontend') + '/login-error');
});

function addBaseRouterGet(strategyName, callbackURI) {
  router.get(callbackURI, passport.authenticate(strategyName, {
    failureRedirect: 'error'
  }));
}

addBaseRouterGet('oidcBcsc', '/login_bcsc');
addBaseRouterGet('oidcBcscGMP', '/login_bcsc_gmp');
addBaseRouterGet('oidcBcscUMP', '/login_bcsc_ump');
addBaseRouterGet('oidcBceid', '/login_bceid');
addBaseRouterGet('oidcBceidGMP', '/login_bceid_gmp');
addBaseRouterGet('oidcBceidUMP', '/login_bceid_ump');

//removes tokens and destroys session
router.get('/logout', async (req, res) => {
  req.logout();
  req.session.destroy();
  let retUrl;
  if (req.query && req.query.sessionExpired) {
    retUrl = encodeURIComponent(config.get('logoutEndpoint') + '?post_logout_redirect_uri=' + config.get('server:frontend') + '/session-expired');
  } else if (req.query && req.query.loginError) {
    retUrl = encodeURIComponent(config.get('logoutEndpoint') + '?post_logout_redirect_uri=' + config.get('server:frontend') + '/login-error');
  } else if (req.query && req.query.loginBcsc) {
    retUrl = encodeURIComponent(config.get('logoutEndpoint') + '?post_logout_redirect_uri=' + config.get('server:frontend') + '/api/auth/login_bcsc');
  } else if (req.query && req.query.loginBcscGMP) {
    retUrl = encodeURIComponent(config.get('logoutEndpoint') + '?post_logout_redirect_uri=' + config.get('server:frontend') + '/api/auth/login_bcsc_gmp');
  } else if (req.query && req.query.loginBcscUMP) {
    retUrl = encodeURIComponent(config.get('logoutEndpoint') + '?post_logout_redirect_uri=' + config.get('server:frontend') + '/api/auth/login_bcsc_ump');
  } else if (req.query && req.query.loginBceid) {
    retUrl = encodeURIComponent(config.get('logoutEndpoint') + '?post_logout_redirect_uri=' + config.get('server:frontend') + '/api/auth/login_bceid');
  } else if (req.query && req.query.loginBceidGMP) {
    retUrl = encodeURIComponent(config.get('logoutEndpoint') + '?post_logout_redirect_uri=' + config.get('server:frontend') + '/api/auth/login_bceid_gmp');
  } else if (req.query && req.query.loginBceidUMP) {
    retUrl = encodeURIComponent(config.get('logoutEndpoint') + '?post_logout_redirect_uri=' + config.get('server:frontend') + '/api/auth/login_bceid_ump');
  } else {
    retUrl = encodeURIComponent(config.get('logoutEndpoint') + '?post_logout_redirect_uri=' + config.get('server:frontend') + '/logout');
  }
  res.redirect(config.get('siteMinder_logout_endpoint') + retUrl);
});

const UnauthorizedRsp = {
  error: 'Unauthorized',
  error_description: 'Not logged in'
};

//refreshes jwt on refresh if refreshToken is valid
router.post('/refresh', [
  body('refreshToken').exists()
], async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }
  if (!req['user'] || !req['user'].refreshToken || !req?.user?.jwt) {
    res.status(401).json(UnauthorizedRsp);
  } else {
    if (auth.isTokenExpired(req.user.jwt)) {
      if (req?.user?.refreshToken && auth.isRenewable(req.user.refreshToken)) {
        return generateTokens(req, res);
      } else {
        res.status(401).json(UnauthorizedRsp);
      }
    } else {
      const responseJson = {
        jwtFrontend: req.user.jwtFrontend
      };
      return res.status(200).json(responseJson);
    }
  }
});

//provides a jwt to authenticated users
router.get('/token', auth.refreshJWT, (req, res) => {
  if (req?.user && req.user?.jwtFrontend && req.user?.refreshToken) {
    if (req.session?.passport?.user?._json) {
      const correlationID = uuidv4();
      req.session.correlationID = correlationID;
      const correlation = {
        user_guid: req.session?.passport?.user?._json.user_guid,
        correlation_id: correlationID
      };
      log.info('created correlation id and stored in session', correlation);
    }
    const responseJson = {
      jwtFrontend: req.user.jwtFrontend
    };
    res.status(200).json(responseJson);
  } else {
    res.status(401).json(UnauthorizedRsp);
  }
});
async function generateTokens(req, res) {
  const result = await auth.renew(req.user.refreshToken);
  if (result && result.jwt && result.refreshToken) {
    req.user.jwt = result.jwt;
    req.user.refreshToken = result.refreshToken;
    req.user.jwtFrontend = auth.generateUiToken();
    const responseJson = {
      jwtFrontend: req.user.jwtFrontend
    };
    res.status(200).json(responseJson);
  } else {
    res.status(401).json(UnauthorizedRsp);
  }
}
router.get('/user-session-remaining-time', passport.authenticate('jwt', {session: false}), (req, res) => {
  if (req?.session?.cookie && req?.session?.passport?.user) {
    const remainingTime = req.session.cookie.maxAge;
    log.info(`session remaining time is :: ${remainingTime} for user`, req.session?.passport?.user?.displayName);
    return res.status(200).json(req.session.cookie.maxAge);
  } else {
    return res.sendStatus(401);
  }
});
module.exports = router;

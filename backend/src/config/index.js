'use strict';
const nconf = require('nconf');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const env = process.env.NODE_ENV || 'local';

nconf.argv()
  .env()
  .file({ file: path.join(__dirname, `${env}.json`) });

//injects environment variables into the json file
nconf.overrides({
  environment: env,

  server: {
    logLevel: process.env.LOG_LEVEL,
    morganFormat: 'dev',
    port: 8080
  }
});



nconf.defaults({
  environment: env,
  logoutEndpoint: process.env.SOAM_URL + '/auth/realms/master/protocol/openid-connect/logout',
  siteMinder_logout_endpoint: process.env.SITEMINDER_LOGOUT_ENDPOINT,
  server: {
    frontend: process.env.SERVER_FRONTEND,
    logLevel: process.env.LOG_LEVEL,
    morganFormat: 'dev',
    port: 8080
  },
  oidc: {
    publicKey: process.env.SOAM_PUBLIC_KEY,
    clientId: process.env.SOAM_CLIENT_ID,
    clientSecret: process.env.SOAM_CLIENT_SECRET,
    discovery: process.env.SOAM_DISCOVERY
  },
  studentRequest: {
    apiEndpoint: process.env.STUDENT_PROFILE_API_ENDPOINT,
    replicateTime: process.env.STUDENT_PROFILE_REPLICATE_TIME || 8,
    commentSagaEndpoint: '/student-profile-comment-saga'
  },
  penRequest: {
    apiEndpoint: process.env.PEN_REQUEST_API_ENDPOINT,
    replicateTime: process.env.PEN_REQUEST_REPLICATE_TIME || 8,
    commentSagaEndpoint: '/pen-request-comment-saga'
  },
  tokenGenerate: {
    privateKey: process.env.UI_PRIVATE_KEY,
    publicKey: process.env.UI_PUBLIC_KEY,
    audience: process.env.SERVER_FRONTEND,
    issuer: process.env.ISSUER
  },
  digitalID: {
    apiEndpoint: process.env.DIGITALID_API_ENDPOINT,
  },
  student: {
    apiEndpoint: process.env.STUDENT_API_ENDPOINT,
  },
  email: {
    apiEndpoint: process.env.STUDENT_PROFILE_EMAIL_API_ENDPOINT,
    secretKey: process.env.STUDENT_PROFILE_EMAIL_SECRET_KEY,
    tokenTTL: process.env.TOKEN_TTL_MINUTES
  },
  demographics: {
    apiEndpoint: process.env.STUDENT_DEMOG_API_ENDPOINT,
  },
  redis:{
    host:process.env.REDIS_HOST,
    port:process.env.REDIS_PORT,
    password:process.env.REDIS_PASSWORD
  },
  scheduler :{
    schedulerCronProfileRequestDraft:process.env.SCHEDULER_CRON_PROFILE_REQUEST_DRAFT,
    numDaysAllowedInDraftStatus:process.env.NUM_DAYS_ALLOWED_IN_DRAFT_STATUS,
    expectedDraftRequests: process.env.EXPECTED_DRAFT_REQUESTS,
    numDaysAllowedInReturnStatusBeforeEmail:process.env.NUM_DAYS_ALLOWED_IN_RETURN_STATUS_BEFORE_EMAIL,
    numDaysAllowedInReturnStatusBeforeAbandoned:process.env.NUM_DAYS_ALLOWED_IN_RETURN_STATUS_BEFORE_ABANDONED,
    schedulerCronStaleSagaRecordRedis: process.env.SCHEDULER_CRON_STALE_SAGA_RECORD_REDIS,
    minTimeBeforeSagaIsStaleInMinutes: process.env.MIN_TIME_BEFORE_SAGA_IS_STALE_IN_MINUTES
  },
  profileSagaAPIURL: process.env.PROFILE_REQUEST_SAGA_API_URL,
  messaging:{
    natsUrl:process.env.NATS_URL,
    natsCluster:process.env.NATS_CLUSTER
  }
});
module.exports = nconf;

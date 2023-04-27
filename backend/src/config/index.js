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
  secureExchange: {
    apiEndpoint: process.env.EDX_API_ENDPOINT,
    sagaApiEndpoint: process.env.EDX_API_ENDPOINT + '/saga',
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
  school: {
    apiEndpoint: process.env.SCHOOL_API_ENDPOINT,
  },
  student: {
    apiEndpoint: process.env.STUDENT_API_ENDPOINT,
  },
  email: {
    secretKey: process.env.EMAIL_SECRET_KEY,
    tokenTTL: process.env.TOKEN_TTL_MINUTES
  },
  redis:{
    host:process.env.REDIS_HOST,
    port:process.env.REDIS_PORT,
    password:process.env.REDIS_PASSWORD
  },
  scheduler :{
    schedulerCronStaleSagaRecordRedis: process.env.SCHEDULER_CRON_STALE_SAGA_RECORD_REDIS,
    minTimeBeforeSagaIsStaleInMinutes: process.env.MIN_TIME_BEFORE_SAGA_IS_STALE_IN_MINUTES
  },
  messaging:{
    natsUrl:process.env.NATS_URL,
    natsCluster:process.env.NATS_CLUSTER
  },
  edx: {
    rootURL: process.env.EDX_API_ENDPOINT,
    exchangeURL: process.env.EDX_API_ENDPOINT + '/exchange',
    exchangeStatusesURL: process.env.EDX_API_ENDPOINT + '/exchange/statuses',
    ministryTeamURL : process.env.EDX_API_ENDPOINT+ '/users/ministry-teams',
    edxUsersURL: process.env.EDX_API_ENDPOINT+ '/users',
    edxRolePermissionsURL: process.env.EDX_API_ENDPOINT+ '/users/roles',
    clearActiveUserSession: process.env.EDX_API_ENDPOINT+ '/users/clearActiveUserSession',
    edxActiveInstitution: process.env.EDX_API_ENDPOINT+ '/institute-selection',
    userActivationURL:process.env.EDX_API_ENDPOINT+ '/users/activation',
    updateActivationUrlClicked:process.env.EDX_API_ENDPOINT+'/users/activation-code/url',
    districtUserActivationInviteURL:process.env.EDX_API_ENDPOINT+ '/exchange/district-user-activation-invite-saga',
    schoolUserActivationInviteURL:process.env.EDX_API_ENDPOINT+ '/exchange/school-user-activation-invite-saga',
    activationCodeUrl: process.env.EDX_API_ENDPOINT + '/users/activation-code',
    schoolUserActivationRelink: process.env.EDX_API_ENDPOINT + '/exchange/school-user-activation-relink-saga',
    districtUserActivationRelink: process.env.EDX_API_ENDPOINT + '/exchange/district-user-activation-relink-saga'
  },
  institute:{
    rootURL: process.env.INSTITUTE_API_ENDPOINT,
    facilityTypeURL: process.env.INSTITUTE_API_ENDPOINT + '/facility-codes',
    categoryCodesURL: process.env.INSTITUTE_API_ENDPOINT + '/category-codes',
    organizationCodeURL: process.env.INSTITUTE_API_ENDPOINT + '/organization-codes',
    reportingRequirementCodesURL: process.env.INSTITUTE_API_ENDPOINT + '/reporting-requirement-codes',
    neighbourhoodLearningURL: process.env.INSTITUTE_API_ENDPOINT + '/neighborhood-learning-codes',
    gradeCodeURL: process.env.INSTITUTE_API_ENDPOINT + '/grade-codes',
    provinceCodesURL: process.env.INSTITUTE_API_ENDPOINT + '/province-codes',
    countryCodesURL: process.env.INSTITUTE_API_ENDPOINT + '/country-codes',
    schoolContactTypeCodesURL: process.env.INSTITUTE_API_ENDPOINT + '/school-contact-type-codes',
    districtContactTypeCodesURL: process.env.INSTITUTE_API_ENDPOINT + '/district-contact-type-codes'
  },
  sdc: {
    rootURL: process.env.SDC_API_ENDPOINT,
    schoolCollectionURL: process.env.SDC_API_ENDPOINT + '/sdcSchoolCollection',
    collectionURL: process.env.SDC_API_ENDPOINT + '/collection'
  }
});
module.exports = nconf;

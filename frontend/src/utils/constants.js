const baseRoot = '/api';
const authRoot = baseRoot + '/auth';
const edxRoot = baseRoot + '/edx';
let object;

object = {
  LOGIN: authRoot + '/login',
  LOGIN_BCEID: authRoot + '/logout?loginBceid=true',
  LOGOUT: authRoot + '/logout',
  SESSION_EXPIRED: authRoot + '/logout?sessionExpired=true',
  LOGIN_FAILED: authRoot + '/logout?loginError=true',
  REFRESH: authRoot + '/refresh',
  TOKEN: authRoot + '/token',
  SESSION_REMAINING_TIME: authRoot + '/user-session-remaining-time',
};
//Authentication endpoints
export const AuthRoutes = Object.freeze(object);

export const ApiRoutes = Object.freeze({
  USER: baseRoot + '/user',
  CONFIG: baseRoot + '/config',
  edx: {
    EXCHANGE: edxRoot + '/exchanges',
    EXCHANGE_URL:edxRoot + '/exchange',
    DOCUMENT_TYPE_CODES: edxRoot + '/document-type-codes',
    FILE_REQUIREMENTS: edxRoot + '/file-requirements',
    STATUSES_URL: edxRoot + '/exchange/statuses',
  }
});

export const PAGE_TITLES = Object.freeze(
  {
    DASHBOARD: 'Dashboard',
    EXCHANGE: 'Secure Exchange Inbox',
    NEW_EXCHANGE: 'New Message'
  });


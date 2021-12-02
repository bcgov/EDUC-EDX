const baseRoot = '/api';
const authRoot = baseRoot + '/auth';
const gmpRoot = baseRoot + '/gmp';
const umpRoot = baseRoot + '/ump';
let object;

object = {
  LOGIN:'/',
  LOGIN_BCSC: authRoot + '/logout?loginBcsc=true',
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
  studentRequest: {
    REQUEST: umpRoot + '/requests',
    CODES: umpRoot + '/codes',
    DOCUMENT_TYPE_CODES: umpRoot + '/document-type-codes',
    FILE_REQUIREMENTS: umpRoot + '/file-requirements',
  },
  penRequest: {
    REQUEST: gmpRoot + '/requests',
    CODES: gmpRoot + '/codes',
    DOCUMENT_TYPE_CODES: gmpRoot + '/document-type-codes',
    FILE_REQUIREMENTS: gmpRoot + '/file-requirements',
  }
});

export const RequestStatuses = Object.freeze({
  DRAFT: 'DRAFT',
  INITREV: 'INITREV',
  RETURNED: 'RETURNED',
  SUBSREV: 'SUBSREV',
  REJECTED: 'REJECTED',
  ABANDONED: 'ABANDONED'
});

export const StudentRequestStatuses = Object.freeze({
  ...RequestStatuses,
  COMPLETED: 'COMPLETED',
});

export const PenRequestStatuses = Object.freeze({
  ...RequestStatuses,
  AUTO: 'AUTO',
  MANUAL: 'MANUAL'
});

export const VerificationResults = Object.freeze({
  TOKEN_ERROR: 'token-error',
  SERVER_ERROR: 'server-error',
  EXPIRED: 'expired',
  OK: 'ok'
});

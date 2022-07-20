const baseRoot = '/api';
const authRoot = baseRoot + '/auth';
const edxRoot = baseRoot + '/edx';
const studentRequestRoot = baseRoot + '/student';

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
  school: {
    BASE_URL: baseRoot + '/schools'
  },
  edx: {
    EXCHANGE: edxRoot + '/exchanges',
    EXCHANGE_URL:edxRoot + '/exchange',
    EXCHANGE_COUNT_URL:edxRoot + '/exchange/count',
    DOCUMENT_TYPES_URL: edxRoot + '/document-types',
    FILE_REQUIREMENTS_URL: edxRoot + '/file-requirements',
    STATUSES_URL: edxRoot + '/exchange/statuses',
    MINISTRY_TEAM_URL: edxRoot + '/users/ministry-teams',
    USERS_URL: edxRoot + '/users',
    EXCHANGE_ACCESS_ROLES_URL: edxRoot + '/users/roles',
    INSTITUTE_SELECTION_URL: edxRoot + '/institute-selection',
    USER_ACTIVATION:edxRoot+'/user-activation',
    UPDATE_ACTIVATION_URL:edxRoot+'/activation-code/url',
    NEW_SCHOOL_USER_ACTIVATION_INVITE:edxRoot+'/school-user-activation-invite'
  },
  studentRequest: {
    ROOT_ENDPOINT: studentRequestRoot,
    SEARCH_URL: studentRequestRoot + '/',
  },
});

export const PAGE_TITLES = Object.freeze({
  ADMINISTRATION: 'Administration',
  DASHBOARD: 'Dashboard',
  EXCHANGE: 'Secure Messaging Inbox',
  VIEW_EXCHANGE: 'Secure Message',
  NEW_EXCHANGE: 'New Message',
  ACTIVATE_USER:'Activate User',
  EXCHANGE_USERS: 'User Management',
  SELECTION:'Institute Selection',
  LOGIN:'Login',
  NEW_USER_INVITE:'New User'
});

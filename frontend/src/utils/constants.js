const baseRoot = '/api';
const authRoot = baseRoot + '/auth';
const edxRoot = baseRoot + '/edx';
const schoolRoot = baseRoot + '/schools';
const studentRequestRoot = baseRoot + '/student';
const districtRequestRoot = baseRoot + '/institute/districts';
const schoolRequestRoot = baseRoot + '/institute/schools';

let object;

object = {
  LOGIN: authRoot + '/login',
  DASHBOARD: '/',
  LOGIN_BCEID: authRoot + '/logout?loginBceid=true',
  LOGOUT: authRoot + '/logout',
  SESSION_EXPIRED: authRoot + '/logout?sessionExpired=true',
  LOGIN_FAILED: authRoot + '/logout?loginError=true',
  REFRESH: authRoot + '/refresh',
  TOKEN: authRoot + '/token',
  SESSION_REMAINING_TIME: authRoot + '/user-session-remaining-time',
  INSTITUTE_SELECTION: '/institute-selection',
};
//Authentication endpoints
export const AuthRoutes = Object.freeze(object);

export const ApiRoutes = Object.freeze({
  USER: baseRoot + '/user',
  CONFIG: baseRoot + '/config',
  school: {
    BASE_URL: schoolRoot,
    SCHOOLS_LAST_UPDATED_DATE: schoolRoot + '/lastUpdated',
    ALL_DIS_SCHOOLS: schoolRoot + '/allSchools',
    ALL_CACHE_SCHOOLS: schoolRoot + '/allCachedSchools',
    SCHOOL_DETAILS_BY_ID: schoolRoot + '/schoolDetailsById',
  },
  DISTRICT_DATA_URL: districtRequestRoot,
  SCHOOL_DATA_URL: schoolRequestRoot,
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
    EXCHANGE_REMOVE_USER: edxRoot + '/users/remove',
    EXCHANGE_RELINK_USER: edxRoot + '/users/relink',
    INSTITUTE_SELECTION_URL: edxRoot + '/institute-selection',
    USER_ACTIVATION:edxRoot+'/user-activation',
    UPDATE_ACTIVATION_URL:edxRoot+'/activation-code/url',
    NEW_SCHOOL_USER_ACTIVATION_INVITE:edxRoot+'/school-user-activation-invite',
    PRIMARY_ACTIVATION_CODE_URL: edxRoot + '/users/activation-code/primary',
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
  SCHOOL_EXCHANGE_USERS: 'School User Management',
  DISTRICT_EXCHANGE_USERS: 'District User Management',
  SELECTION:'Institute Selection',
  LOGIN:'Login',
  NEW_USER_INVITE:'New User',
  SCHOOLS:'Schools',
  DISTRICT_DETAILS:'District Details',
  SCHOOL_CONTACTS:'School Contacts'
});


export const MINISTRY_NAME = 'Ministry of Education and Child Care';

export const EDX_SAGA_REQUEST_DELAY_MILLISECONDS = 2000;

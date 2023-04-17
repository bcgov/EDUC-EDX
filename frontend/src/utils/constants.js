const baseRoot = '/api';
const authRoot = baseRoot + '/auth';
const edxRoot = baseRoot + '/edx';
const schoolRoot = baseRoot + '/schools';
const districtRoot = baseRoot + '/districts';
const instituteRoot = baseRoot + '/institute';
const studentRequestRoot = baseRoot + '/student';
const districtRequestRoot = baseRoot + '/institute/districts';
const schoolRequestRoot = baseRoot + '/institute/schools';
const sldRoot = baseRoot + '/sld';

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
    ALL_SCHOOLS_BY_CRIT: schoolRoot + '/allSchools',
    SCHOOL_DETAILS_BY_ID: schoolRoot + '/schoolDetailsById',
    UPDATE_SCHOOL_CONTACT_URL: schoolRoot + '/update-contact'
  },
  sld: {
    BASE_URL: sldRoot,
    SLD_COLLECTION_BY_SCHOOL_ID: sldRoot + '/getCollectionBySchoolId'
  },
  district: {
    BASE_URL: districtRoot,
    CREATE_DISTRICT_CONTACT_URL: `${districtRoot}/createContact`,
    UPDATE_DISTRICT_CONTACT_URL: districtRoot + '/update-contact'
  },
  institute: {
    BASE_URL: instituteRoot,
    DISTRICT: instituteRoot + '/districts',
    PROVINCE_CODES_URL: instituteRoot + '/province-codes',
    COUNTRY_CODES_URL: instituteRoot + '/country-codes',
    FACILITY_TYPES_URL: instituteRoot + '/facility-types',
    SCHOOL_CATEGORY_TYPES_URL: instituteRoot + '/school-category-types',
    SCHOOL_CONTACT_TYPE_CODES: instituteRoot + '/school-contact-types',
    SCHOOL_ORGANIZATION_TYPES_URL: instituteRoot + '/school-organization-types',
    SCHOOL_REPORTING_REQUIREMENT_TYPES_URL: instituteRoot + '/reporting-requirement-codes',
    SCHOOL_NEIGHBORHOOD_LEARNING_TYPES_URL: instituteRoot + '/school-neighborhood-learning-types',
    SCHOOL_GRADE_TYPES_URL: instituteRoot + '/school-grade-types',
    DISTRICT_CONTACT_TYPE_CODES: instituteRoot +  '/district-contact-types',
    AUTHORITY_DATA_URL: instituteRoot + '/authority',
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
    NEW_DISTRICT_USER_ACTIVATION_INVITE: edxRoot + '/district-user-activation-invite',
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
  SCHOOL_CONTACTS:'School Contacts',
  SCHOOL_DETAILS:'School Details',
  DISTRICT_DETAILS:'District Details',
  DISTRICT_CONTACTS: 'District Contacts',
  SLD:'Student Level Data (1701)',
  DATA_COLLECTION: 'Data Collections'
});


export const MINISTRY_NAME = 'Ministry of Education and Child Care';

export const EDX_SAGA_REQUEST_DELAY_MILLISECONDS = 2000;

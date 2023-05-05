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
    SLD_COLLECTION_BY_SCHOOL_ID: sldRoot + '/getCollectionBySchoolId',
    SLD_SCHOOL_COLLECTION_STUDENT: sldRoot + '/sdcSchoolCollectionStudent',
    SDC_BAND_CODES: sldRoot + '/band-codes',
    SDC_CAREER_PROGRAM_CODES: sldRoot + '/career-program-codes',
    SDC_ENROLLED_GRADE_CODES: sldRoot + '/enrolled-grade-codes',
    SDC_ENROLLED_PROGRAM_CODES: sldRoot + '/enrolled-program-codes',
    SDC_HOME_LANGUAGE_SPOKEN_CODES: sldRoot + '/home-language-spoken-codes',
    SDC_SCHOOL_FUNDING_CODES: sldRoot + '/school-funding-codes',
    SDC_SPECIAL_ED_CODES: sldRoot + '/specialEducation-codes',
    SDC_VALIDATION_ISSUE_TYPE_CODES: sldRoot + '/validation-issue-type-codes',
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

export const SDC_VALIDATION_FIELD_MAPPINGS = Object.freeze({
  LOCAL_ID: {label: 'Local Id', key: 'localID', type: 'input', options: {}},
  STUDENT_PEN: {label: 'PEN', key: 'studentPen', type: 'input', options: {}},
  LEGAL_FIRST_NAME: {label: 'Legal First Name', key: 'legalFirstName', type: 'input', options: {}},
  LEGAL_MIDDLE_NAMES: {label: 'Legal Middle Name', key: 'legalMiddleNames', type: 'input', options: {}},
  LEGAL_LAST_NAME: {label: 'Legal Last Name', key: 'legalLastName', type: 'input', options: {}},
  USUAL_FIRST_NAME: {label: 'Usual First Name', key: 'usualFirstName', type: 'input', options: {}},
  USUAL_MIDDLE_NAMES: {label: 'Usual Middle Names', key: 'usualMiddleNames', type: 'input', options: {}},
  USUAL_LAST_NAME: {label: 'Usual Last Name', key: 'usualLastName', type: 'input', options: {}},
  DOB: {label: 'DOB', key: 'dob', type: 'datePicker', options: {}},
  GENDER_CODE: {label: 'Gender', key: 'gender', type: 'input', options: {}}, //TODO change this to select when we grab the gender drop down lists
  GRADE_CODE: {label: 'Grade Code', key: 'enrolledGradeCode', type: 'select', options: {items: 'enrolledGradeCodes', itemValue: 'enrolledGradeCode'}},
  SPECIAL_EDUCATION_CATEGORY_CODE: {label: 'Special Education Category', key: 'specialEducationCategoryCode', type: 'select', options: {items: 'specialEducationCategoryCodes', itemValue: 'specialEducationCategoryCode'}},
  SCHOOL_FUNDING_CODE: {label: 'School Funding', key: 'schoolFundingCode', type: 'select', options: {items: 'schoolFundingCodes', itemValue: 'schoolFundingCode'}},
  NATIVE_ANCESTRY_IND: {label: 'Native Ancestry', key: 'nativeAncestryInd', type: 'input', options: {}},
  HOME_LANGUAGE_SPOKEN_CODE: {label: 'Home Language Spoken Code', key: 'homeLanguageSpokenCode', type: 'select', options: {items: 'homeLanguageSpokenCodes', itemValue: 'homeLanguageSpokenCode'}},
  OTHER_COURSES: {label: 'Other Courses', key: 'otherCourses', type: 'input', options: {}},
  SUPPORT_BLOCKS: {label: 'Support Blocks', key: 'supportBlocks', type: 'input', options: {}},
  ENROLLED_GRADE_CODE: {label: 'Enrolled Grade Codes', key: 'enrolledGradeCode', type: 'select', options: {items: 'enrolledGradeCodes', itemValue: 'enrolledGradeCode'}},
  ENROLLED_PROGRAM_CODE: {label: 'Enrolled Program Codes', key: 'filteredEnrolledProgramCodes', type: 'multiselect', options: {items: 'enrolledProgramCodes', itemValue: 'enrolledProgramCode'}}, //TODO implement this after we solve check boxes
  CAREER_PROGRAM_CODE: {label: 'Career Program Code', key: 'careerProgramCode', type: 'select', options: {items: 'careerProgramCodes', itemValue: 'careerProgramCode'}},
  NUMBER_OF_COURSES: {label: 'Number of Courses', key: 'numberOfCourses', type: 'input', options: {}},
  BAND_CODE: {label: 'Band Codes', key: 'bandCode', type: 'select', options: {items: 'bandCodes', itemValue: 'bandCode'}},
  POSTAL_CODE: {label: 'Postal Code', key: 'postalCode', type: 'input', options: {}}
});

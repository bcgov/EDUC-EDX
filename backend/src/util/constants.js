const FILTER_OPERATION = Object.freeze(
  {
    /**
     * Equal filter operation.
     */
    EQUAL: 'eq',
    /**
     * Not equal filter operation.
     */
    NOT_EQUAL: 'neq',
    /**
     * Not equal column filter operation.
     */
    NOT_EQUAL_OTHER_COLUMN: 'neqc',
    /**
     * Greater than filter operation.
     */
    GREATER_THAN: 'gt',
    /**
     * Greater than or equal to filter operation.
     */
    GREATER_THAN_OR_EQUAL_TO: 'gte',
    /**
     * Less than filter operation.
     */
    LESS_THAN: 'lt',
    /**
     * Less than or equal to filter operation.
     */
    LESS_THAN_OR_EQUAL_TO: 'lte',
    /**
     * In filter operation.
     */
    IN: 'in',
    /**
     * Filter to return when none of the child records includes the values
     */
    NONE_IN: 'none_in',
    /**
     * Not in filter operation.
     */
    NOT_IN: 'nin',
    /**
     * Between filter operation.
     */
    BETWEEN: 'btn',
    /**
     * Contains filter operation.
     */
    CONTAINS: 'like',
    /**
     * Contains ignore case filter operation.
     */
    CONTAINS_IGNORE_CASE: 'like_ignore_case',
    /**
     * Starts with filter operation.
     */
    STARTS_WITH: 'starts_with',
    /**
     * Not starts with filter operation.
     */
    NOT_STARTS_WITH: 'not_starts_with',
    /**
     * Starts with ignore case filter operation.
     */
    STARTS_WITH_IGNORE_CASE: 'starts_with_ignore_case',
    /**
     * Ends with filter operation.
     */
    ENDS_WITH: 'ends_with',
    IN_LEFT_JOIN: 'in_left_join'
  }
);
const CONDITION = Object.freeze(
  {
    /**
     * And condition.
     */
    AND: 'AND',
    /**
     * Or condition.
     */
    OR: 'OR'
  }
);

const VALUE_TYPE = Object.freeze(
  {
    /**
     * String value type.
     */
    STRING: 'STRING',
    /**
     * Integer value type.
     */
    INTEGER: 'INTEGER',
    /**
     * Long value type.
     */
    LONG: 'LONG',
    /**
     * Date value type.
     */
    DATE: 'DATE',
    /**
     * Date time value type.
     */
    DATE_TIME: 'DATE_TIME',
    /**
     * Uuid value type.
     */
    UUID: 'UUID',

    BOOLEAN: 'BOOLEAN'
  }
);

const PEN_REQ_BATCH_STATUS_CODES = Object.freeze(
  {
    ARCHIVED: 'ARCHIVED',
    UNARCHIVED: 'UNARCHIVED',
    LOAD_FAIL: 'LOADFAIL',
    DELETED: 'DELETED',
    LOADED: 'LOADED'
  }
);
const EVENT_TYPE = Object.freeze({
  UPDATE_STUDENT: 'UPDATE_STUDENT',
  CREATE_STUDENT: 'CREATE_STUDENT',
  UPDATE_SCHOOL: 'UPDATE_SCHOOL',
  CREATE_SCHOOL: 'CREATE_SCHOOL',
  UPDATE_DISTRICT: 'UPDATE_DISTRICT',
  CREATE_DISTRICT: 'CREATE_DISTRICT',
  UPDATE_AUTHORITY: 'UPDATE_AUTHORITY',
  CREATE_AUTHORITY: 'CREATE_AUTHORITY',
  COPY_USERS_TO_NEW_SCHOOL: 'COPY_USERS_TO_NEW_SCHOOL'
});
const EVENT_OUTCOME = Object.freeze({
  STUDENT_UPDATED: 'STUDENT_UPDATED',
  STUDENT_CREATED: 'STUDENT_CREATED',
  USERS_TO_NEW_SCHOOL_COPIED: 'USERS_TO_NEW_SCHOOL_COPIED'
});
let cacheKeys;

cacheKeys = {
  EDX_SECURE_EXCHANGE_STATUS: 'edx_exchangeStatuses',
  EDX_MINISTRY_TEAMS:'edx_ministryTeams',
  EDX_ROLE_PERMISSIONS:'edx_rolePermissions',
  SCHOOL_FACILITY_TYPES:'school_facilityTypes',
  SCHOOL_CATEGORY_TYPES:'school_categoryTypes',
  SCHOOL_CONTACT_TYPE_CODES: 'school_contactTypeCodes',
  DISTRICT_CONTACT_TYPE_CODES: 'district_contactTypeCodes',
  SCHOOL_ORGANIZATION_TYPES: 'school_organizationTypes',
  SCHOOL_REPORTING_REQUIREMENT_CODES: 'institute_reportingRequirementCodes',
  SCHOOL_NEIGHBORHOOD_LEARNING_TYPES: 'school_neighborhoodTypes',
  SCHOOL_GRADE_TYPES: 'school_gradeTypes',
  EDX_SECURE_EXCHANGE_DOCUMENT_TYPES: 'edx_secureExchangeDocumentTypes',
  EDX_SECURE_EXChANGE_FILE_REQUIREMENTS: 'edx_secureExchangeFileRequirements',
  PROVINCE_CODES: 'institute_provinceCodes',
  COUNTRY_CODES: 'institute_countryCodes',
  SDC_BAND_CODES: 'sdc_band_codes',
  SDC_CAREER_PROGRAM_CODES: 'sdc_career_program_codes',
  SDC_ENROLLED_GRADE_CODES: 'sdc_enrolled_grade_codes',
  SDC_ENROLLED_PROGRAM_CODES: 'sdc_enrolled_program_codes',
  SDC_GENDER_CODES: 'sdc_gender_codes',
  SDC_HOME_LANGUAGE_SPOKEN_CODES: 'sdc_home_language_spoken_codes',
  SDC_SCHOOL_COLLECTION_STATUS_CODES: 'sdc_school_collection_status_codes',
  SDC_SCHOOL_FUNDING_CODES: 'sdc_school_funding_code',
  SDC_SPECIAL_ED_CODES: 'sdc_special_ed_codes',
  SDC_VALIDATION_ISSUE_TYPE_CODES: 'sdc_validation_issue_type_codes',
  SDC_PROGRAM_ELIGIBILITY_TYPE_CODES: 'sdc_program_eligibility_type_codes',
  SDC_ZERO_FTE_REASON_CODES: 'sdc_zero_fte_reason_codes',
  SDC_PROGRAM_DUPLICATE_TYPE_CODES: 'sdc_program_duplicate_type_codes',
  PRB_VALIDATION_ISSUE_TYPE_CODES: 'prb_validation_issue_type_codes',
  COLLECTION_TYPE_CODES: 'collection_type_codes',
};
const CACHE_KEYS = Object.freeze(cacheKeys);
const EVENT_WS_TOPIC = 'EVENT_WS_TOPIC';
const INSTITUTE_CACHE_REFRESH_TOPIC = 'INSTITUTE_CACHE_REFRESH_TOPIC';
const MOVE_SCHOOL_TOPIC = 'MOVE_SCHOOL_TOPIC';
const SDC_UPLOAD_TOPIC = 'SDC_UPLOAD_TOPIC';

const reportTypeValues = [
  ['ell', 'ELL_HEADCOUNT'],
  ['ell_dis', 'DIS_ELL_HEADCOUNT'],
  ['ell-per-school_dis', 'DIS_ELL_HEADCOUNT_PER_SCHOOL'],
  ['refugee-per-school_dis', 'DIS_REFUGEE_HEADCOUNT_PER_SCHOOL'],
  ['special-ed', 'SPECIAL_EDUCATION_HEADCOUNT'],
  ['special-ed_dis', 'DIS_SPECIAL_EDUCATION_HEADCOUNT'],
  ['special-ed-per-school_dis', 'DIS_SPECIAL_EDUCATION_HEADCOUNT_PER_SCHOOL'],
  ['special-ed-cat-per-school_dis', 'DIS_SPECIAL_EDUCATION_HEADCOUNT_CATEGORY_PER_SCHOOL'],
  ['indigenous', 'INDIGENOUS_HEADCOUNT'],
  ['indigenous_dis', 'DIS_INDIGENOUS_HEADCOUNT'],
  ['indigenous-per-school_dis', 'DIS_INDIGENOUS_HEADCOUNT_PER_SCHOOL'],
  ['band-codes', 'BAND_RESIDENCE_HEADCOUNT'],
  ['band-codes_dis', 'DIS_BAND_RESIDENCE_HEADCOUNT'],
  ['band-codes-per-school_dis', 'DIS_BAND_RESIDENCE_HEADCOUNT_PER_SCHOOL'],
  ['career', 'CAREER_HEADCOUNT'],
  ['french', 'FRENCH_HEADCOUNT'],
  ['french_dis', 'DIS_FRENCH_HEADCOUNT'],
  ['french-per-school_dis', 'DIS_FRENCH_HEADCOUNT_PER_SCHOOL'],
  ['enrollment', 'GRADE_ENROLLMENT_HEADCOUNT'], 
  ['enrollment_dis', 'DIS_GRADE_ENROLLMENT_HEADCOUNT'],
  ['grade-enrollment_dis', 'DIS_GRADE_ENROLLMENT_HEADCOUNT_PER_SCHOOL'],
  ['career_dis', 'DIS_CAREER_HEADCOUNT'],
  ['career-per-school_dis', 'DIS_CAREER_HEADCOUNT_PER_SCHOOL'],
  ['csv_school', 'ALL_STUDENT_SCHOOL_CSV'],
  ['csv_dis', 'ALL_STUDENT_DIS_CSV'],
  ['csv_school_errors_warns', 'ALL_STUDENT_ERRORS_WARNS_SCHOOL_CSV'],
  ['csv_dis_errors_warns', 'ALL_STUDENT_ERRORS_WARNS_DIS_CSV'],
  ['zero-fte-summary_dis','DIS_ZERO_FTE_SUMMARY']
];
const REPORT_TYPE_CODE_MAP = Object.freeze(new Map(reportTypeValues));

const ENROLLED_PROGRAM_TYPE_CODE_MAP = Object.freeze({
  FRENCH_ENROLLED_PROGRAM_CODES: ['11', '08', '14', '05'],
  CAREER_ENROLLED_PROGRAM_CODES: ['40', '41', '42', '43'],
  INDIGENOUS_ENROLLED_PROGRAM_CODES: ['29', '33', '36'],
  ENGLISH_ENROLLED_PROGRAM_CODES: ['17'],
});

const NOT_FOUND_PEN_MATCH_STATUSES = Object.freeze(['B0', 'C0', 'D0', 'G0', 'F0']);
const VALID_PEN_MATCH_STATUSES = Object.freeze(['AA', 'B1', 'C1', 'D1']);
const MULTI_PEN_MATCH_STATUSES = Object.freeze(['BM', 'CM', 'DM']);

const DUPLICATE_TYPE_CODES = Object.freeze({
  ENROLLMENT: 'ENROLLMENT',
  PROGRAM: 'PROGRAM'
});

const STUDENT_TYPE_CODES = Object.freeze({
  SCHOOL_AGED: 'isSchoolAged',
  ADULT: 'isAdult',
  PRESCHOOL_AGED: 'isUnderSchoolAged'
});

module.exports = {
  FILTER_OPERATION,
  CONDITION,
  REPORT_TYPE_CODE_MAP,
  VALUE_TYPE,
  PEN_REQ_BATCH_STATUS_CODES,
  EVENT_TYPE,
  EVENT_OUTCOME,
  EVENT_WS_TOPIC,
  INSTITUTE_CACHE_REFRESH_TOPIC,
  CACHE_KEYS,
  MOVE_SCHOOL_TOPIC,
  ENROLLED_PROGRAM_TYPE_CODE_MAP,
  DUPLICATE_TYPE_CODES,
  STUDENT_TYPE_CODES,
  SDC_UPLOAD_TOPIC,
  VALID_PEN_MATCH_STATUSES,
  MULTI_PEN_MATCH_STATUSES,
  NOT_FOUND_PEN_MATCH_STATUSES
};
/**
 * Test comment
 */

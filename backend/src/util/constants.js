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
    UUID: 'UUID'
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
};
const CACHE_KEYS = Object.freeze(cacheKeys);
const EVENT_WS_TOPIC = 'EVENT_WS_TOPIC';
const INSTITUTE_CACHE_REFRESH_TOPIC = 'INSTITUTE_CACHE_REFRESH_TOPIC';
const MOVE_SCHOOL_TOPIC = 'MOVE_SCHOOL_TOPIC';

module.exports = {
  FILTER_OPERATION,
  CONDITION,
  VALUE_TYPE,
  PEN_REQ_BATCH_STATUS_CODES,
  EVENT_TYPE,
  EVENT_OUTCOME,
  EVENT_WS_TOPIC,
  INSTITUTE_CACHE_REFRESH_TOPIC,
  CACHE_KEYS,
  MOVE_SCHOOL_TOPIC
};
/**
 * Test comment
 */

let cacheKeys;

cacheKeys = {
  EDX_SECURE_EXCHANGE_STATUS: 'edx_exchangeStatuses',
  EDX_MINISTRY_TEAMS:'edx_ministryTeams',
  EDX_ROLE_PERMISSIONS:'edx_rolePermissions',
  SCHOOL_FACILITY_TYPES:'school_facilityTypes',
  SCHOOL_CATEGORY_TYPES:'school_categoryTypes',
  SCHOOL_CONTACT_TYPE_CODES: 'school_contactTypeCodes',
  EDX_SECURE_EXCHANGE_DOCUMENT_TYPES: 'edx_secureExchangeDocumentTypes',
  EDX_SECURE_EXChANGE_FILE_REQUIREMENTS: 'edx_secureExchangeFileRequirements'
};
const CACHE_KEYS = Object.freeze(cacheKeys);

module.exports = {
  CACHE_KEYS
};

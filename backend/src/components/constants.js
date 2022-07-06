let cacheKeys;

cacheKeys = {
  EDX_SECURE_EXCHANGE_STATUS: 'edx_exchangeStatuses',
  EDX_MINISTRY_TEAMS:'edx_ministryTeams',
  EDX_ROLE_PERMISSIONS:'edx_rolePermissions'
};
const CACHE_KEYS = Object.freeze(cacheKeys);

module.exports = {
  CACHE_KEYS
};

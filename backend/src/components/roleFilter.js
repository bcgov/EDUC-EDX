'use strict';
const cacheService = require('./cache-service');

function filterSchoolRoles(schoolID, data) {
    const school = cacheService.getSchoolBySchoolID(schoolID);
    if(!school?.canIssueTranscripts) {
      return data.filter(role => role.edxRoleCode !== 'GRAD_SCH_ADMIN');
    }
    return data;
  }


  const roleFilter = {
    filterSchoolRoles
  };
  
  module.exports = roleFilter;
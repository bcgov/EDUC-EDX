'use strict';
const cacheService = require('./cache-service');

function filterSchoolRoles(req, data) {
    const school = cacheService.getSchoolBySchoolID(req.session.activeInstituteIdentifier);
    if(!school?.canIssueTranscripts) {
      return data.filter(role => role.edxRoleCode !== 'GRAD_SCH_ADMIN');
    }
    return data;
  }


  const roleFilter = {
    filterSchoolRoles
  };
  
  module.exports = roleFilter;
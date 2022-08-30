'use strict';
const { logApiError, errorResponse} = require('./utils');
const cacheService = require('./cache-service');

async function getSchoolBySchoolId(req, res) {
  try {
    if (!req.query.schoolId) {
      let allActiveSchools = cacheService.getAllActiveSchoolsJSON();
      return res.status(200).json(allActiveSchools ? allActiveSchools : []);
    }
    let school = cacheService.getSchoolBySchoolId(req.query.schoolId);
    if (!school) {
      return res.status(200).json();
    }
    return res.status(200).json(school);
  } catch (e) {
    logApiError(e, 'getSchoolBySchoolId', 'Error occurred while attempting to GET school entity.');
    return errorResponse(res);
  }
}

module.exports = {
  getSchoolBySchoolId
};

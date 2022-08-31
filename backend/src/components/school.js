'use strict';
const { logApiError, errorResponse} = require('./utils');
const cacheService = require('./cache-service');

async function getSchoolBySchoolID(req, res) {
  try {
    if (!req.query.schoolID) {
      let allActiveSchools = cacheService.getAllActiveSchoolsJSON();
      return res.status(200).json(allActiveSchools ? allActiveSchools : []);
    }
    let school = cacheService.getSchoolBySchoolID(req.query.schoolID);
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
  getSchoolBySchoolID
};

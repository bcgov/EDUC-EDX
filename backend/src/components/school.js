'use strict';
const { logApiError, errorResponse} = require('./utils');
const cacheService = require('./cache-service');

async function getSchoolByMincode(req, res) {
  try {
    if (!req.query.mincode) {
      let allActiveSchools = cacheService.getAllActiveSchoolsJSON();
      return res.status(200).json(allActiveSchools ? allActiveSchools : []);
    }
    let schoolName = cacheService.getSchoolNameJSONByMincode(req.query.mincode);
    if (!schoolName) {
      return res.status(200).json();
    }
    return res.status(200).json(schoolName);
  } catch (e) {
    logApiError(e, 'getSchoolByMincode', 'Error occurred while attempting to GET school entity.');
    return errorResponse(res);
  }
}

module.exports = {
  getSchoolByMincode
};

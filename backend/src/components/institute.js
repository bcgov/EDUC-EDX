'use strict';
const { logApiError, errorResponse} = require('./utils');
const HttpStatus = require('http-status-codes');
const cacheService = require('./cache-service');


function getDistricts(_req, res) {
  try {
    return res.status(HttpStatus.OK).json(cacheService.getAllDistrictsJSON());
  } catch (e) {
    logApiError(e, 'getDistricts', 'Error occurred while attempting to GET all districtsMap.');
    return errorResponse(res);
  }
}
function getDistrictByDistrictId(req, res) {
  try {
    const districtId = req.params.districtId;
    return res.status(HttpStatus.OK).json(cacheService.getDistrictJSONByDistrictID(districtId));
  } catch (e) {
    logApiError(e, 'getDistrictByDistrictId', 'Error occurred while attempting to GET district by district Id.');
    return errorResponse(res);
  }
}
function getSchools(_req, res) {
  try {
    return res.status(HttpStatus.OK).json(cacheService.getAllSchoolsJSON());
  } catch (e) {
    logApiError(e, 'getSchools', 'Error occurred while attempting to GET all schoolsMap.');
    return errorResponse(res);
  }
}

module.exports = {
  getDistricts,
  getDistrictByDistrictId,
  getSchools
};

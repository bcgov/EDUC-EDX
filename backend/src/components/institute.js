'use strict';
const { logApiError, errorResponse} = require('./utils');
const HttpStatus = require('http-status-codes');
const cacheService = require('./cache-service');


function getDistricts(req, res) {
  try {
    const districts = req.query.active === 'true' ? cacheService.getAllActiveDistrictsJSON() : cacheService.getAllDistrictsJSON();
    return res.status(HttpStatus.OK).json(districts);
  } catch (e) {
    logApiError(e, 'getDistricts', 'Error occurred while attempting to GET all districtsMap.');
    return errorResponse(res);
  }
}
function getDistrictByDistrictId(req, res) {
  try {
    const districtID = req.params.districtID;
    return res.status(HttpStatus.OK).json(cacheService.getDistrictJSONByDistrictID(districtID));
  } catch (e) {
    logApiError(e, 'getDistrictByDistrictId', 'Error occurred while attempting to GET district by district Id.');
    return errorResponse(res);
  }
}
function getSchools(req, res) {
  try {
    let schools = req.query.active === 'true' ? cacheService.getAllActiveSchoolsJSON() : cacheService.getAllSchoolsJSON();
    return res.status(HttpStatus.OK).json(schools);
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

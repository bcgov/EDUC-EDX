'use strict';
const {errorResponse, getAccessToken, getDataWithParams} = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config');
const log = require('./logger');
const cacheService = require('./cache-service');

async function getStudentByPEN(req, res) {
  try {
    const accessToken = getAccessToken(req);
    const result = await getDataWithParams(accessToken, config.get('student:apiEndpoint'), {params: {pen: req.query.pen}}, req.session?.correlationID);
    if (result && result[0] && result[0].studentID) {
      const studentMincode = result[0].mincode;
      let instituteHasStudent = false;
      if(req.session.activeInstituteType === 'DISTRICT'){
        let district = cacheService.getDistrictByDistrictID(req.session.activeInstituteIdentifier);
        instituteHasStudent = district.districtNumber === studentMincode.substring(0,3);
      }else if(req.session.activeInstituteType === 'SCHOOL'){
        let school = cacheService.getSchoolBySchoolID(req.session.activeInstituteIdentifier);
        instituteHasStudent = school.mincode === studentMincode;
      }

      if (instituteHasStudent) {
        const body = {
          studentID: result[0].studentID,
          pen:result[0].pen,
          firstName: result[0].legalFirstName,
          middleName: result[0].legalMiddleNames,
          lastName: result[0].legalLastName,
          gender: result[0].genderCode,
          doB: result[0].dob,
          localID: result[0].localID
        };
        return res.status(200).json(body);
      }
      return res.status(200).json({studentID: result[0].studentID, pen:result[0].pen});
    } else {
      const message = 'PEN must be a valid PEN associated with a student at the Ministry of Education and Childcare';
      log.error(message);
      return errorResponse(res, message, HttpStatus.NOT_FOUND);
    }

  } catch (e) {
    log.error(e, 'getStudentByPEN', 'Error occurred while attempting to GET Student details.');
    return errorResponse(res);
  }
}

module.exports = {
  getStudentByPEN
};

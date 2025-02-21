'use strict';
const {errorResponse, getAccessToken, getDataWithParams, formatDate, postData, getCreateOrUpdateUserValue} = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config');
const log = require('./logger');
const cacheService = require('./cache-service');
const {v4: uuidv4} = require('uuid');

async function getStudentByPEN(req, res, bypassInstituteHasStudent = false) {
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

      if (instituteHasStudent || bypassInstituteHasStudent) {
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

async function getStudentByPENForGrad(req, res){
  await getStudentByPEN(req, res, true);
}

/**
 * This method first checks if a transaction ID is stored in session for previous attempt to create a new student,
 * if so it reuses the same transaction ID or else generate a new guid. transaction ID must be a GUID.
 * after getting the PEN NUMBER from SERVICES API call student api to create student with associations.
 */
async function createNewStudent(req, res) {
  try {
    let transactionID;
    if (req.session.create_new_student_transactionID) {
      transactionID = req.session.create_new_student_transactionID;
    } else {
      transactionID = uuidv4();
      req.session.create_new_student_transactionID = transactionID; // store it in session so that it can be reused when the api call to create student fails.
    }
    const params = {
      params: {
        transactionID
      }
    };
    const token = getAccessToken(req);
    const penNumber = await getDataWithParams(token, config.get('penServices:nextPenURL'), params, null);
    const student = req.body.student;
    student.dob = formatDate(student.dob?.replace(/\D/g, ''));
    student.pen = penNumber;
    let school = cacheService.getSchoolBySchoolID(res.locals.requestedSdcSchoolCollection.schoolID);
    student.mincode = school.mincode;
    student.genderCode = student.gender;
    student.gradeCode = student.enrolledGradeCode;
    student.sexCode = student.genderCode; // sex code is mandatory in API.
    student.historyActivityCode = student.historyActivityCode || 'REQNEW';
    student.emailVerified = student.emailVerified || 'N';
    student.demogCode = student.demogCode || 'A';
    student.statusCode = student.statusCode || 'A';
    student.createDate = null;
    student.updateDate = null;
    let user = getCreateOrUpdateUserValue(req);
    student.createUser = user;
    student.updateUser = user;
    const result = await postData(token, student, config.get('student:apiEndpoint'), null);
    delete req.session.create_new_student_transactionID; // delete it when student is created successfully.
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    log.error(e, 'createNewStudent', 'Error occurred while attempting to create a new student.');
    return errorResponse(res);
  }
}
module.exports = {
  getStudentByPEN,
  getStudentByPENForGrad,
  createNewStudent
};

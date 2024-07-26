'use strict';
const {logApiError, getAccessToken} = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const {postData} = require('./utils');
const {v4: uuidv4} = require('uuid');
const cacheService = require('./cache-service');

async function validateStudentDemogData(req, res) {
  try {
    const student = req.body.student;
    Object.keys(student).forEach(key => {
      student[key] = student[key] || ''; // send empty string than null or undefined.
    });

    let school = cacheService.getSchoolBySchoolID(res.locals.requestedSdcSchoolCollection.schoolID);
    student.mincode = school.mincode;
    student.genderCode = student.gender;
    student.gradeCode = student.enrolledGradeCode;
    student.isInteractive = true;
    student.transactionID = uuidv4();
    const token = getAccessToken(req);

    const dataResponse = await postData(token, student, config.get('penServices:validateDemographicsURL'));
    return res.status(200).json(dataResponse);

  } catch (e) {
    await logApiError(e, 'validateStudentDemogData', 'Error occurred while attempting to call pen validation services api.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  }
}


module.exports = {
  validateStudentDemogData
};


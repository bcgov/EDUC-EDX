'use strict';
const { logApiError, getAccessToken, getData, putData, postData, deleteData, getCreateOrUpdateUserValue,  getDataWithParams, handleExceptionResponse} = require('../utils');
const HttpStatus = require('http-status-codes');
const config = require('../../config');
const cacheService = require('../cache-service');
const { createMoreFiltersSearchCriteria } = require('./studentFilters');
const moment = require('moment');
const {DateTimeFormatter, LocalDate, LocalDateTime} = require("@js-joda/core");

async function getAssessmentSessions(req, res) {
  try {
    const url = `${config.get('eas:assessmentSessionsURL')}`;
    const token = getAccessToken(req);
    const data = await getData(token, url);
    const today = LocalDate.now();
    const formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    data.forEach(session => {
      const activeFromDate = LocalDate.parse(session.activeFromDate, formatter);
      const activeUntilDate = LocalDate.parse(session.activeUntilDate, formatter);
      session.isOpen = activeFromDate.isBefore(today) && activeUntilDate.isAfter(today);
    });

    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getAssessmentSessions', 'Error occurred while attempting to GET assessment sessions.');
    return handleExceptionResponse(e, res);
  }
}

async function getActiveAssessmentSessions(req, res) {
  try {
    const url = `${config.get('eas:assessmentSessionsURL')}/active`;
    const token = getAccessToken(req);
    const data = await getData(token, url);
    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getActiveAssessmentSessions', 'Error occurred while attempting to GET active assessment sessions.');
    return handleExceptionResponse(e, res);
  }
}

async function getAssessmentSessionsBySchoolYear(req, res) {
  try {
    const url = `${config.get('eas:assessmentSessionsURL')}/school-year/${req.params.schoolYear}`;
    const token = getAccessToken(req);
    let data = await getData(token, url);

    const now = LocalDateTime.now();

    data.forEach(session => {
      const activeFrom = LocalDateTime.parse(session.activeFromDate);
      const activeUntil = LocalDateTime.parse(session.activeUntilDate);
      session.isOpen = activeFrom.isBefore(now) && activeUntil.isAfter(now);

      session.assessments.forEach(assessment => {
        let assessmentType = cacheService.getAssessmentTypeByCode(assessment.assessmentTypeCode);
        assessment.assessmentTypeName = assessmentType.label + ' (' + assessment.assessmentTypeCode + ')';
        assessment.displayOrder = assessmentType.displayOrder;
      });
    });

    return res.status(200).json(data);
  } catch (e) {
    logApiError(e, 'getSessions', 'Error occurred while attempting to GET sessions by school year.');
    return handleExceptionResponse(e, res);
  }
}

async function getAssessmentStudentsPaginated(req, res) {
  try {
    const search = [];
    
    if (req.query.searchParams?.['moreFilters']) {
      let criteriaArray = createMoreFiltersSearchCriteria(req.query.searchParams['moreFilters']);
      criteriaArray.forEach(criteria => {
        search.push(criteria);
      });
    }

    const params = {
      params: {
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
        sort: JSON.stringify(req.query.sort),
        searchCriteriaList: JSON.stringify(search),
      }
    };

    const token = getAccessToken(req);
    let data = await getDataWithParams(token,`${config.get('eas:assessmentStudentsURL')}/paginated`, params);

    if (req?.query?.returnKey) {
      let result = data?.content.map((student) => student[req?.query?.returnKey]);
      return res.status(HttpStatus.OK).json(result);
    }
    data?.content.forEach(value => {
      includeAssessmentStudentProps(value);
    });
    return res.status(200).json(data);
  } catch (e) {
    if (e?.status === 404) {
      res.status(HttpStatus.OK).json(null);
    } else {
      await logApiError(e, 'Error getting eas assessment student paginated list');
      return handleExceptionResponse(e, res);
    }
  }
}

async function postAssessmentStudent(req, res){
  try {
    req.body.districtID = cacheService.getSchoolBySchoolID(req.body.schoolID).districtID;
    const payload = {
      ...req.body,
      updateUser: getCreateOrUpdateUserValue(req),
      updateDate: null,
      createDate: null
    };
    const token = getAccessToken(req);
    const result = await postData(token, payload, `${config.get('eas:assessmentStudentsURL')}`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    await logApiError(e, 'postAssessmentStudent', 'Error occurred while attempting to create the assessment student registration.');
    return handleExceptionResponse(e, res);
  }
}

async function getAssessmentStudentByID(req, res) {
  try {  
    const token = getAccessToken(req);
    let data = await getData(token, `${config.get('eas:assessmentStudentsURL')}/${req.params.assessmentStudentID}`);
    return res.status(200).json(includeAssessmentStudentProps(data));
  } catch (e) {
    if (e?.status === 404) {
      res.status(HttpStatus.OK).json(null);
    } else {
      await logApiError(e, 'Error getting eas assessment student');
      return handleExceptionResponse(e, res);
    }
  }
}

async function deleteAssessmentStudentByID(req, res) {  
  try {
    const token = getAccessToken(req);
    const result = await deleteData(token, `${config.get('eas:assessmentStudentsURL')}/${req.params.assessmentStudentID}`);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'deleteAssessmentStudentByID', 'Error occurred while attempting to delete the assessment student registration.');
    return handleExceptionResponse(e, res);
  }
}

function includeAssessmentStudentProps(assessmentStudent) {
  if(assessmentStudent) {
    let school = cacheService.getSchoolBySchoolID(assessmentStudent.schoolID);
    let assessmentCenter = cacheService.getSchoolBySchoolID(assessmentStudent.assessmentCenterID);
    let district = cacheService.getDistrictJSONByDistrictID(school.districtID);

    if(school && district) {
      assessmentStudent.schoolName_desc = getSchoolName(school);
      assessmentStudent.districtID = school.districtID;
      assessmentStudent.districtName_desc = getDistrictName(district);
    }
    
    if(assessmentCenter) {
      assessmentStudent.assessmentCenterName_desc = getSchoolName(assessmentCenter);
    }    

    assessmentStudent.assessmentTypeName_desc = cacheService.getAssessmentTypeByCode(assessmentStudent.assessmentTypeCode).label+' ('+assessmentStudent.assessmentTypeCode+')';
    assessmentStudent.provincialSpecialCaseName_desc = assessmentStudent.provincialSpecialCaseCode ? cacheService.getSpecialCaseTypeLabelByCode(assessmentStudent.provincialSpecialCaseCode) : null;
    assessmentStudent.sessionName_desc = moment(assessmentStudent.courseMonth, 'MM').format('MMMM') +' '+assessmentStudent.courseYear;
  }
  return assessmentStudent;
}

async function updateAssessmentStudentByID(req, res) {
  if (req.params.assessmentStudentID !== req.body.assessmentStudentID) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'The assessmentStudentID in the URL didn\'t match the assessmentStudentID in the request body.'
    });
  }
  try {
    const token = getAccessToken(req);
    const payload = req.body;
    payload.updateUser =  getCreateOrUpdateUserValue(req);
    payload.updateDate = null;
    payload.createDate = null;
    const result = await putData(token, payload, `${config.get('eas:assessmentStudentsURL')}/${req.params.assessmentStudentID}`, getCreateOrUpdateUserValue(req));
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'updateAssessmentStudent', 'Error occurred while attempting to save the changes to the assessment student registration.');
    return handleExceptionResponse(e, res);
  }
}

function getSchoolName(school) {
  return school.mincode + ' - ' + school.schoolName;
}

function getDistrictName(district) {
  return district.districtNumber + ' - ' + district.name;
}

function getAssessmentSpecialCases(req, res) {  
  try {
    const codes = cacheService.getAllAssessmentSpecialCases();
    return res.status(HttpStatus.OK).json(Object.fromEntries(codes));
  } catch (e) {
    logApiError(e, 'getAssessmentSpecialCases', 'Error occurred while attempting to get specialcase types.');
    return handleExceptionResponse(e, res);
  }
}

module.exports = {
  getAssessmentSessions,
  getActiveAssessmentSessions,
  getAssessmentSessionsBySchoolYear,
  getAssessmentStudentsPaginated,
  getAssessmentStudentByID,
  updateAssessmentStudentByID,
  deleteAssessmentStudentByID,
  getAssessmentSpecialCases,
  postAssessmentStudent
};

'use strict';
const {
  logApiError,
  getAccessToken,
  getData,
  putData,
  postData,
  getCreateOrUpdateUserValue,
  getDataWithParams,
  handleExceptionResponse
} = require('../utils');
const HttpStatus = require('http-status-codes');
const config = require('../../config');
const cacheService = require('../cache-service');
const {createMoreFiltersSearchCriteria} = require('./studentFilters');
const moment = require('moment');
const {DateTimeFormatter, LocalDate, LocalDateTime} = require('@js-joda/core');
const {FILTER_OPERATION, VALUE_TYPE, CONDITION} = require('../../util/constants');
const log = require('../logger');

async function getAssessmentSessions(req, res) {
  try {
    const url = `${config.get('assessments:assessmentSessionsURL')}`;
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
    const url = `${config.get('assessments:assessmentSessionsURL')}/active`;
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
    const url = `${config.get('assessments:assessmentSessionsURL')}/school-year/${req.params.schoolYear}`;
    const token = getAccessToken(req);
    let data = await getData(token, url);

    const now = LocalDateTime.now();

    data.forEach(session => {
      const activeFrom = LocalDateTime.parse(session.activeFromDate);
      const activeUntil = LocalDateTime.parse(session.activeUntilDate);
      session.isOpen = activeFrom.isBefore(now) && activeUntil.isAfter(now);

      session.assessments.forEach(assessment => {
        let assessmentType = cacheService.getAssessmentTypeByCode(assessment.assessmentTypeCode);
        assessment.assessmentTypeName = assessment.assessmentTypeCode;
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
    const search = req.query.searchParams?.['moreFilters'] ? createMoreFiltersSearchCriteria(req.query.searchParams['moreFilters']) : [];

    const instituteFilter = {
      condition: CONDITION.AND,
      searchCriteriaList: [{
        key: req.session.activeInstituteType === 'SCHOOL' ? 'schoolOfRecordSchoolID' : 'districtID',
        value: req.session.activeInstituteIdentifier,
        operation: FILTER_OPERATION.EQUAL,
        valueType: VALUE_TYPE.UUID,
        condition: CONDITION.AND
      }]
    };
    search.push(instituteFilter);

    const params = {
      params: {
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
        sort: JSON.stringify(req.query.sort),
        searchCriteriaList: JSON.stringify(search),
      }
    };

    const token = getAccessToken(req);
    let data = await getDataWithParams(token, `${config.get('assessments:assessmentStudentsURL')}/paginated`, params);

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
      await logApiError(e, 'Error getting assessment student paginated list');
      return handleExceptionResponse(e, res);
    }
  }
}

async function postAssessmentStudent(req, res) {
  try {
    const payload = {
      ...req.body,
      updateUser: getCreateOrUpdateUserValue(req),
      updateDate: null,
      createDate: null
    };
    const token = getAccessToken(req);
    const result = await postData(token, payload, `${config.get('assessments:assessmentStudentsURL')}`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    await logApiError(e, 'postAssessmentStudent', 'Error occurred while attempting to create the assessment student registration.');
    return handleExceptionResponse(e, res);
  }
}

async function getAssessmentStudentByID(req, res) {
  try {
    const token = getAccessToken(req);
    let assessmentStudent = await getAssessmentStudent(req.params.assessmentStudentID, res, token, req.session?.correlationID);
    return res.status(200).json(includeAssessmentStudentProps(assessmentStudent));
  } catch (e) {
    if (e?.status === 404) {
      res.status(HttpStatus.OK).json(null);
    } else {
      await logApiError(e, 'Error getting assessment student');
      return handleExceptionResponse(e, res);
    }
  }
}

async function removeAssessmentStudents(req, res) {
  try {
    const token = getAccessToken(req);
    const result = await postData(token, req.body, `${config.get('assessments:assessmentStudentsURL')}/delete-students`, req.session?.correlationID);
    return res.status(HttpStatus.NO_CONTENT).json(result);
  } catch (e) {
    logApiError(e, 'removeAssessmentStudents', 'Error occurred while attempting to delete the assessment student registrations.');
    return handleExceptionResponse(e, res);
  }
}

function includeAssessmentStudentProps(assessmentStudent) {
  if (assessmentStudent) {
    let school = cacheService.getSchoolBySchoolID(assessmentStudent.schoolOfRecordSchoolID);
    let assessmentCenter = cacheService.getSchoolBySchoolID(assessmentStudent.assessmentCenterID);

    if (school) {
      assessmentStudent.schoolName_desc = getSchoolName(school);
    }

    if (assessmentCenter) {
      assessmentStudent.assessmentCenterName_desc = getSchoolName(assessmentCenter);
    }

    assessmentStudent.assessmentTypeName_desc = assessmentStudent.assessmentTypeCode;
    assessmentStudent.provincialSpecialCaseName_desc = assessmentStudent.provincialSpecialCaseCode ? cacheService.getSpecialCaseTypeLabelByCode(assessmentStudent.provincialSpecialCaseCode) : null;
    assessmentStudent.sessionName_desc = moment(assessmentStudent.courseMonth, 'MM').format('MMMM') + ' ' + assessmentStudent.courseYear;
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
    payload.updateUser = getCreateOrUpdateUserValue(req);
    payload.updateDate = null;
    payload.createDate = null;
    const result = await putData(token, payload, `${config.get('assessments:assessmentStudentsURL')}/${req.params.assessmentStudentID}`, getCreateOrUpdateUserValue(req));
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'updateAssessmentStudent', 'Error occurred while attempting to save the changes to the assessment student registration.');
    return handleExceptionResponse(e, res);
  }
}

async function downloadXamFile(req, res) {
  try {
    const token = getAccessToken(req);
    const url = `${config.get('assessments:rootURL')}/report/${req.params.sessionID}/school/${req.params.schoolID}/XAM_FILE/download`;

    const data = await getData(token, url);

    const fileName = `${data?.reportType || 'SessionResults.xam'}`;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    if (data && data.documentData) {
      const buffer = Buffer.from(data.documentData, 'base64');
      return res.send(buffer);
    } else {
      const emptyBuffer = Buffer.from('');
      return res.send(emptyBuffer);
    }
  } catch (e) {
    log.error(e, 'downloadXamFile', 'Error occurred while attempting to download XAM file.');
    return handleExceptionResponse(e, res);
  }
}

async function downloadAssessmentSessionResultsCSVFile(req, res) {
  try {
    const token = getAccessToken(req);
    const url = `${config.get('assessments:rootURL')}/report/${req.params.sessionID}/school/${req.params.schoolID}/SESSION_RESULTS/download`;

    const data = await getData(token, url);

    const fileName = `${data?.reportType || 'SessionResults.csv'}`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    if (data && data.documentData) {
      const buffer = Buffer.from(data.documentData, 'base64');
      return res.send(buffer);
    } else {
      const emptyBuffer = Buffer.from('');
      return res.send(emptyBuffer);
    }
  } catch (e) {
    log.error(e, 'downloadAssessmentSessionResultsCSVFile', 'An error occurred while attempting to download the Assessment Session Results CSV file.');
    return handleExceptionResponse(e, res);
  }
}

function getSchoolName(school) {
  return school.mincode + ' - ' + school.schoolName;
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

async function getAssessmentStudent(assessmentStudentID, res, token, correlationID) {
  if (res.locals.requestedAssessmentStudent && res.locals.requestedAssessmentStudent.assessmentStudentID === assessmentStudentID) {
    return res.locals.requestedAssessmentStudent;
  }
  return getData(token, `${config.get('assessments:assessmentStudentsURL')}/${assessmentStudentID}`, correlationID);
}

module.exports = {
  getAssessmentSessions,
  getActiveAssessmentSessions,
  getAssessmentSessionsBySchoolYear,
  getAssessmentStudentsPaginated,
  getAssessmentStudentByID,
  updateAssessmentStudentByID,
  removeAssessmentStudents,
  getAssessmentSpecialCases,
  postAssessmentStudent,
  downloadXamFile,
  downloadAssessmentSessionResultsCSVFile
};


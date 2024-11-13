'use strict';
const { logApiError, getAccessToken, getData, errorResponse, handleExceptionResponse } = require('../utils');
const HttpStatus = require('http-status-codes');
const config = require('../../config');
const cacheService = require('../cache-service');
const { createMoreFiltersSearchCriteria } = require('./studentFilters');
const moment = require('moment');

async function getAssessmentSessions(req, res) {
  try {
    const url = `${config.get('eas:assessmentSessionsURL')}`;
    const token = getAccessToken(req);
    const data = await getData(token, url);
    data.forEach(session => {
      session.isOpen =  new Date(session.activeFromDate) <= new Date() && new Date(session.activeUntilDate) >= new Date() ? true: false;      
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
    let data = await getData(url);
    data.forEach(session => {
      session.assessments.forEach(assessment => {
        assessment.assessmentTypeName = cacheService.getAssessmentTypeLabelByCode(assessment.assessmentTypeCode)+' ('+assessment.assessmentTypeCode+')';
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

    let data = await getData(`${config.get('server:eas:assessmentStudentsURL')}/paginated`, params);

    if (req?.query?.returnKey) {
      let result = data?.content.map((student) => student[req?.query?.returnKey]);
      return res.status(HttpStatus.OK).json(result);
    }
    data?.content.forEach(value => {
      let school = cacheService.getSchoolBySchoolID(value.schoolID);
      let assessmentCenter = cacheService.getSchoolBySchoolID(value.assessmentCenterID);
      let district = cacheService.getDistrictJSONByDistrictId(school.districtID);

      value.schoolNumber = school.mincode;
      value.schoolName = getSchoolName(school);
      value.districtID = school.districtID;
      value.districtNumber = district.districtNumber;
      value.districtName = getDistrictName(district);    
      value.assessmentCenterNumber = assessmentCenter.mincode;
      value.assessmentCenterName = getSchoolName(assessmentCenter);

      value.assessmentTypeName = cacheService.getAssessmentTypeLabelByCode(value.assessmentTypeCode)+' ('+value.assessmentTypeCode+')';
      value.provincialSpecialCaseName = cacheService.getSpecialCaseTypeLabelByCode(value.provincialSpecialCaseCode);
      value.sessionName = moment(value.courseMonth, 'MM').format('MMMM') +' '+value.courseYear;

    });
    return res.status(200).json(data);
  } catch (e) {
    if (e?.status === 404) {
      res.status(HttpStatus.OK).json(null);
    } else {
      await logApiError(e, 'Error getting eas assessment student paginated list');
      return errorResponse(res);
    }
  }
}

function getSchoolName(school) {
  return school.mincode + ' - ' + school.schoolName;
}

function getDistrictName(district) {
  return district.districtNumber + ' - ' + district.name;
}

module.exports = {
  getAssessmentSessions,
  getActiveAssessmentSessions,
  getAssessmentSessionsBySchoolYear,
  getAssessmentStudentsPaginated
};

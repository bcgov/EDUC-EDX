'use strict';
const { logApiError, errorResponse, getAccessToken, getDataWithParams} = require('./utils');
const cacheService = require('./cache-service');
const log = require('./logger');
const config = require('../config');
const {FILTER_OPERATION, VALUE_TYPE} = require('../util/constants');
const HttpStatus = require('http-status-codes');

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

async function getAllCachedSchools(req, res){
  try {
    let allActiveSchools = cacheService.getAllActiveSchoolsJSON();
    return res.status(200).json(allActiveSchools ? allActiveSchools : []);
  } catch (e) {
    logApiError(e, 'getAllCachedSchools', 'Error occurred while attempting to GET school entity.');
    return errorResponse(res);
  }
}

async function getAllSchoolDetails(req, res){
  const token = getAccessToken(req);
  validateAccessToken(token);

  return Promise.all([
    getSchoolsPaginated(req, res)
  ])
    .then(async ([dataResponse]) => {
      return res.status(200).json(dataResponse);
    }).catch(e => {
      log.error(e, 'getAllSchoolDetails', 'Error getting paginated list of school details.');
      return errorResponse(res);
    });
}

async function getSchoolsPaginated(req, res){

  const accessToken = getAccessToken(req);
  validateAccessToken(accessToken, res);

  if (!req.session.activeInstituteIdentifier) {
    return Promise.reject('getSchoolsPaginated error: User activeInstituteIdentifier does not exist in session');
  }

  let parsedParams = '';
  if (req.query.searchParams) {
    parsedParams = JSON.parse(req.query.searchParams);
  }

  const schoolSearchCriteria = [{
    condition: null,
    searchCriteriaList: createSchoolSearchCriteria(parsedParams),
  }];

  const schoolSearchParam = {
    params: {
      pageNumber: req.query.pageNumber,
      pageSize: req.query.pageSize,
      sort: req.query.sort,
      searchCriteriaList: JSON.stringify(schoolSearchCriteria)
    }
  };

  return getDataWithParams(accessToken, config.get('instituteAPIURL') + '/school/paginated', schoolSearchParam, req.session?.correlationID);
}

function createSchoolSearchCriteria(searchParams){

  let searchCriteriaList = [];

  Object.keys(searchParams).forEach(function(key){
    let pValue = searchParams[key];
    if(key === 'status'){
      let currentDate = new Date().toISOString().substring(0,19);

      if(pValue === 'Open'){
        searchCriteriaList.push({key: 'openedDate', operation: FILTER_OPERATION.LESS_THAN_OR_EQUAL_TO, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: null});
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.EQUAL, value: null, valueType: VALUE_TYPE.DATE_TIME, condition: null});
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.GREATER_THAN, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: null});
      } else if (pValue === 'Opening'){
        searchCriteriaList.push({key: 'openedDate', operation: FILTER_OPERATION.GREATER_THAN, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: null});
      } else if (pValue === 'Closing'){
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.GREATER_THAN, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: null});
      } else if (pValue === 'Closed'){
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.LESS_THAN, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: null});
      }
    }
    if(key === 'schoolNumber'){

      searchCriteriaList.push({key: 'schoolNumber', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.STRING, condition: null});
    }
    if(key === 'category'){

      searchCriteriaList.push({key: 'schoolCategoryCode', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.STRING, condition: null});
    }
    if(key === 'type'){

      searchCriteriaList.push({key: 'facilityTypeCode', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.STRING, condition: null});
    }
  });

  return searchCriteriaList;
}

function validateAccessToken(token, res) {
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }
}

module.exports = {
  getSchoolBySchoolID,
  getAllCachedSchools,
  getAllSchoolDetails
};

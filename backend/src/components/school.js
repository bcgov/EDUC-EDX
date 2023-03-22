'use strict';
const { logApiError, errorResponse, getAccessToken, getDataWithParams, getData,
  checkEDXUserAccessForSchoolAdminFunctions, putData, postData, handleExceptionResponse
} = require('./utils');
const cacheService = require('./cache-service');
const log = require('./logger');
const config = require('../config');
const {FILTER_OPERATION, VALUE_TYPE, CONDITION} = require('../util/constants');
const HttpStatus = require('http-status-codes');
const _ = require('lodash');
const {LocalDate, DateTimeFormatter} = require('@js-joda/core');

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

async function updateSchool(req, res){
  try{
    const token = getAccessToken(req);
    validateAccessToken(token);
    checkEDXUserAccessForSchoolAdminFunctions(req, req.body.schoolId);

    const payload = req.body;

    payload.addresses.forEach(function(addy) {
      addy.updateDate = null;
      addy.createDate = null;
    });

    payload.notes.forEach(function(note) {
      note.updateDate = null;
      note.createDate = null;
    });

    payload.contacts.forEach(function(contact) {
      contact.updateDate = null;
      contact.createDate = null;
    });

    payload.createDate = null;
    payload.updateDate = null;
    const nlcObjectsArray = [];
    const gradesObjectArray = [];

    for(const nlcCode of payload.neighborhoodLearning){
      //when there is an update in frontend to neigborhoodlearning system adds array of codes to the payload
      if(_.isString(nlcCode)){
        nlcObjectsArray.push({
          neighborhoodLearningTypeCode:nlcCode,
          schoolId: payload.schoolId
        });
      }else{
        //if neighborhood learning was not changed as part of edit , it will be passed as an array of objects from frontend.
        nlcObjectsArray.push({
          neighborhoodLearningTypeCode:nlcCode.neighborhoodLearningTypeCode,
          schoolId: payload.schoolId
        });
      }

      for (const gradeCode of payload.grades) {
        //when there is an update in frontend to grades system adds array of codes to the payload
        if (_.isString(gradeCode)) {
          gradesObjectArray.push({
            schoolGradeCode: gradeCode,
            schoolId: payload.schoolId
          });
        } else {
          //if grades was not changed as part of edit , it will be passed as an array of objects from frontend.
          gradesObjectArray.push({
            schoolGradeCode: gradeCode.schoolGradeCode,
            schoolId: payload.schoolId
          });
        }
      }

    }
    payload.neighborhoodLearning = nlcObjectsArray;
    payload.grades = gradesObjectArray;

    const result = await putData(token, payload, config.get('institute:rootURL') + '/school/' + payload.schoolId, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    log.error(e, 'updateSchool', 'Error occurred while attempting to update a school.');
    return handleExceptionResponse(e, res);
  }
}

async function addSchoolContact(req, res) {
  try {
    const token = getAccessToken(req);
    validateAccessToken(token, res);

    checkEDXUserAccessForSchoolAdminFunctions(req, req.params.schoolID);

    const url = `${config.get('institute:rootURL')}/school/${req.params.schoolID}/contact`;

    const formatter = DateTimeFormatter.ofPattern('yyyy-MM-dd\'T\'HH:mm:ss');

    const payload = {
      schoolContactTypeCode: req.body.schoolContactTypeCode,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      jobTitle: req.body.jobTitle,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      phoneExtension: req.body.phoneExtension,
      alternatePhoneNumber: req.body.alternatePhoneNumber,
      alternatePhoneExtension: req.body.alternatePhoneExtension,
      effectiveDate: req.body.effectiveDate ? LocalDate.parse(req.body.effectiveDate).atStartOfDay().format(formatter) : null,
      expiryDate: req.body.expiryDate ? LocalDate.parse(req.body.expiryDate).atStartOfDay().format(formatter) : null
    };

    const data = await postData(token, payload, url, req.session?.correlationID);

    return res.status(HttpStatus.OK).json(data);
  }catch (e) {
    log.error('Create School Contact Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function updateSchoolContact(req, res) {
  try {
    const token = getAccessToken(req);
    validateAccessToken(token, res);

    checkEDXUserAccessForSchoolAdminFunctions(req, req.body.schoolID);

    const formatter = DateTimeFormatter.ofPattern('yyyy-MM-dd\'T\'HH:mm:ss');

    const params = req.body;
    params.updateDate = null;
    params.createDate = null;
    params.effectiveDate = params.effectiveDate ? LocalDate.parse(req.body.effectiveDate).atStartOfDay().format(formatter) : null;
    params.expiryDate = req.body.expiryDate ? LocalDate.parse(req.body.expiryDate).atStartOfDay().format(formatter) : null;

    const result = await putData(token, params,`${config.get('institute:rootURL')}/school/${req.body.schoolID}/contact/${req.body.schoolContactId}`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    logApiError(e, 'updateSchoolContact', 'Error occurred while attempting to update a school contact.');
    return errorResponse(res);
  }
}

async function getAllCachedSchools(_req, res){
  try {
    let allActiveSchools = cacheService.getAllActiveSchoolsJSON();
    return res.status(200).json(allActiveSchools ? allActiveSchools : []);
  } catch (e) {
    logApiError(e, 'getAllCachedSchools', 'Error occurred while attempting to GET school entity.');
    return errorResponse(res);
  }
}

async function getFullSchoolDetails(req, res){
  const token = getAccessToken(req);
  validateAccessToken(token);

  return Promise.all([
    getData(token, `${config.get('institute:rootURL')}/school/${req.params.schoolID}`, req.session?.correlationID),
  ])
    .then(async ([dataResponse]) => {
      return res.status(200).json(dataResponse);
    }).catch(e => {
      log.error(e, 'getFullSchoolDetails', 'Error getting school details by ID from API.');
      return errorResponse(res);
    });
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

  let parsedParams = req.query.searchParams;

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

  return getDataWithParams(accessToken, config.get('institute:rootURL') + '/school/paginated', schoolSearchParam, req.session?.correlationID);
}

function createSchoolSearchCriteria(searchParams){

  let searchCriteriaList = [];

  Object.keys(searchParams).forEach(function(key){
    let pValue = searchParams[key];
    if(key === 'status'){
      let currentDate = new Date().toISOString().substring(0,19);

      if(pValue === 'Open'){
        searchCriteriaList.push({key: 'openedDate', operation: FILTER_OPERATION.LESS_THAN_OR_EQUAL_TO, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.AND});
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.EQUAL, value: null, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
      } else if (pValue === 'Opening'){
        searchCriteriaList.push({key: 'openedDate', operation: FILTER_OPERATION.GREATER_THAN, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.AND});
      } else if (pValue === 'Closing'){
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.GREATER_THAN, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.AND});
      } else if (pValue === 'NotClosed'){
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.GREATER_THAN, value: currentDate, valueType: VALUE_TYPE.DATE_TIME, condition: CONDITION.OR});
        searchCriteriaList.push({key: 'closedDate', operation: FILTER_OPERATION.EQUAL, value: null, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR});
      }
    }
    if(key === 'pubEarlyLearning'){
      searchCriteriaList.push({key: 'schoolCategoryCode', operation: FILTER_OPERATION.IN, value: 'EAR_LEARN,PUBLIC', valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
    }
    if(key === 'schoolID'){
      searchCriteriaList.push({key: 'schoolId', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND});
    }
    if(key === 'districtID'){
      searchCriteriaList.push({key: 'districtID', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND});
    }
    if(key === 'type'){
      searchCriteriaList.push({key: 'facilityTypeCode', operation: FILTER_OPERATION.EQUAL, value: pValue, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
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
  getAllSchoolDetails,
  getFullSchoolDetails,
  updateSchool,
  addSchoolContact,
  updateSchoolContact
};

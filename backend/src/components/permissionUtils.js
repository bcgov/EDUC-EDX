'use strict';

const HttpStatus = require('http-status-codes');
const {doesSchoolBelongToDistrict} = require('./institute-cache');
const {getAccessToken, getData, SecureExchangeStatuses, getDataWithParams} = require('./utils');
const {filterSchoolRoles} = require('./roleFilter');
const config = require('../config');
const log = require('./logger');
const {v4: validate } = require('uuid');
const {FILTER_OPERATION, VALUE_TYPE, CONDITION} = require('../util/constants');

//Common checks
function checkEDXUserAccessToRequestedInstitute(req, res, next) {
  if (!req.session.activeInstituteType || !req.session.activeInstituteIdentifier) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'User\'s active institution is unknown.'
    });
  }
  if (!res.locals.requestedInstituteType || !res.locals.requestedInstituteIdentifier) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'The requested institution type and identifier wasn\'t found in the request.'
    });
  }
  if (!edxUserHasAccessToInstitute(req.session.activeInstituteType, res.locals.requestedInstituteType, req.session.activeInstituteIdentifier, res.locals.requestedInstituteIdentifier)) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'User doesn\'t have access to the requested institution.'
    });
  }
  return next();
}

function checkEdxUserPermission(permission) {
  return function(req, res, next) {
    if (!req.session.activeInstitutePermissions.includes(permission)) {
      console.log('Marco' + req.session.activeInstitutePermissions);
      return res.status(HttpStatus.FORBIDDEN).json({
        message: 'User doesn\'t have permission.'
      });
    }
    return next();
  };
}

function checkPermissionForRequestedInstitute(districtPermission, schoolPermission) {
  return function(req, res, next) {
    if (!res.locals.requestedInstituteType) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'The requested institution type wasn\'t found in the request.'
      });
    }
    let permissionToCheck;
    switch (res.locals.requestedInstituteType) {
    case 'DISTRICT':
      permissionToCheck = districtPermission;
      break;
    case 'SCHOOL':
      permissionToCheck = schoolPermission;
      break;
    default:
      permissionToCheck = null;
      break;
    }
    if (!permissionToCheck) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'The appropriate permission to check couldn\'t be determined for this action.'
      });
    }
    if (!req.session.activeInstitutePermissions.includes(permissionToCheck)) {
      return res.status(HttpStatus.FORBIDDEN).json({
        message: 'User doesn\'t have permission.'
      });
    }
    return next();
  };
}

function verifyQueryParamValueMatchesBodyValue(paramKey, bodyKey) {
  return function(req, res, next) {
    if (!req.params[paramKey] || !req?.body?.[bodyKey] || req.params[paramKey] !== req.body[bodyKey]) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: `The values specified for the query parameter ${paramKey} and the body parameter ${bodyKey} didn't match.`
      });
    }
    return next();
  };
}

function validateAccessToken(req, res, next) {
  const token = getAccessToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'The request didn\'t contain a valid access token.'
    });
  }
  return next();
}

//School checks

//Secure Exchange checks
function checkSecureExchangeAccess(req, res, next) {
  if (!res.locals.requestedSecureExchange) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'The requested Secure Exchange wasn\'t found in the request.'
    });
  }
  if (res.locals.requestedSecureExchange.secureExchangeContactTypeCode !== req.session.activeInstituteType || res.locals.requestedSecureExchange.contactIdentifier !== req.session.activeInstituteIdentifier) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'User doesn\'t have access to the requested Secure Exchange.'
    });
  }
  return next();
}

function conflictActionOnClosedSecureExchange(req, res, next) {
  if (!res.locals.requestedSecureExchange) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'The requested Secure Exchange wasn\'t found in the request.'
    });
  }
  if (res.locals.requestedSecureExchange.secureExchangeStatusCode === SecureExchangeStatuses.CLOSED) {
    return res.status(HttpStatus.CONFLICT).json({
      message: 'This action cannot be performed on closed Secure Exchanges.'
    });
  }
  return next();
}

//SDC School Collection checks
function checkSdcSchoolCollectionAccess(req, res, next) {
  if (!res.locals.requestedSdcSchoolCollection) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'The requested SDC School Collection was not found in the request.'
    });
  }
  if(edxUserHasAccessToInstitute(req.session.activeInstituteType, 'SCHOOL', req.session.activeInstituteIdentifier, res.locals.requestedSdcSchoolCollection.schoolID)) {
    return next();
  } else {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'User does not have access to the requested sdc school collection.'
    });
  }
}

function loadInstituteCollection(req, res, next) {
  if (res.locals.requestedInstituteType === 'SCHOOL') {
    return loadSdcSchoolCollection(req, res, next);
  } else {
    return loadSdcDistrictCollection(req, res, next);
  }
}

function checkInstituteCollectionAccess(req, res, next) {
  if (res.locals.requestedInstituteType === 'SCHOOL') {
    return checkSdcSchoolCollectionAccess(req, res, next);
  } else {
    return checkSdcDistrictCollectionAccess(req, res, next);
  }
}

function checkSdcDistrictCollectionAccess(req, res, next) {
  if (!res.locals.requestedSdcDistrictCollection) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'The requested SDC District Collection was not found in the request.'
    });
  }
  if (req.session.activeInstituteType !== 'DISTRICT' || res.locals.requestedSdcDistrictCollection.districtID !== req.session.activeInstituteIdentifier) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'User does not have access to the requested sdc district collection.'
    });
  }
  return next();
}

function checkAnyEdxUserSignoffPermission(permissions) {
  return function(req, res, next) {
    const hasPermission = permissions.some(permission => req.session.activeInstitutePermissions.includes(permission));
    if (!hasPermission) {
      return res.status(HttpStatus.FORBIDDEN).json({
        message: 'User doesn\'t have permission.'
      });
    }
    return next();
  };
}

function checkPermissionForSignOff(req, res, next) {
  if (!req.session.activeInstitutePermissions.includes(req.body.districtSignatoryRole)) {
    return res.status(HttpStatus.FORBIDDEN).json({
      message: 'User doesn\'t have permission.'
    });
  }
  return next();
}

//Find Institute IDs
function findInstituteInformation_query(req, res, next) {
  res.locals.requestedInstituteType = req.query.schoolID ? 'SCHOOL' : 'DISTRICT';
  res.locals.requestedInstituteIdentifier = req.query.schoolID ?? req.query.districtID;
  return next();
}

function findInstituteInformation_body_params(req, res, next) {
  res.locals.requestedInstituteType = req.body.params.schoolID ? 'SCHOOL' : 'DISTRICT';
  res.locals.requestedInstituteIdentifier = req.body.params.schoolID ?? req.body.params.districtID;
  return next();
}

function findInstituteType_params(req, res, next) {
  let validInstituteTypes = ['SCHOOL', 'DISTRICT'];
  let requestedInstituteType = req.params.instituteType.toUpperCase();
  res.locals.requestedInstituteType = validInstituteTypes.includes(requestedInstituteType) ? requestedInstituteType : null;
  return next();
}

function findInstituteIdentifier_params(req, res, next) {
  res.locals.requestedInstituteIdentifier = req.params.instituteIdentifier;
  return next();
}

//Find School IDs
function findSchoolID_query(req, res, next) {
  res.locals.requestedInstituteType = 'SCHOOL';
  res.locals.requestedInstituteIdentifier = req.query.schoolID;
  return next();
}

function findSchoolID_params(req, res, next) {
  res.locals.requestedInstituteType = 'SCHOOL';
  res.locals.requestedInstituteIdentifier = req.params.schoolID;
  return next();
}

function findSchoolID_body(req, res, next) {
  res.locals.requestedInstituteType = 'SCHOOL';
  res.locals.requestedInstituteIdentifier = req.body.schoolID;
  return next();
}

function findSchoolContactId_body(req, res, next) {
  res.locals.requestedSchoolContactId = req.body.schoolContactId;
  return next();
}

function findSchoolContactId_params(req, res, next) {
  res.locals.requestedSchoolContactId = req.params.contactID;
  return next();
}

function findSchoolID_body_params(req, res, next) {
  res.locals.requestedInstituteType = 'SCHOOL';
  res.locals.requestedInstituteIdentifier = req.body.params.schoolID;
  return next();
}

//Find District IDs
function findDistrictID_query(req, res, next) {
  res.locals.requestedInstituteType = 'DISTRICT';
  res.locals.requestedInstituteIdentifier = req.query.districtID;
  return next();
}

function findDistrictID_params(req, res, next) {
  res.locals.requestedInstituteType = 'DISTRICT';
  res.locals.requestedInstituteIdentifier = req.params.districtID;
  return next();
}

function findDistrictID_body(req, res, next) {
  res.locals.requestedInstituteType = 'DISTRICT';
  res.locals.requestedInstituteIdentifier = req.body.districtID;
  return next();
}

function findDistrictId_body(req, res, next) {
  res.locals.requestedInstituteType = 'DISTRICT';
  res.locals.requestedInstituteIdentifier = req.body.districtId;
  return next();
}

function findDistrictContactId_body(req, res, next) {
  res.locals.requestedDistrictContactId = req.body.districtContactId;
  return next();
}

function findDistrictContactId_params(req, res, next) {
  res.locals.requestedDistrictContactId = req.params.contactID;
  return next();
}

function findDistrictID_querySearchParams(req, res, next) {
  res.locals.requestedInstituteType = 'DISTRICT';
  res.locals.requestedInstituteIdentifier = req.query.searchParams.districtID;
  return next();
}

function findDistrictID_body_params(req, res, next) {
  res.locals.requestedInstituteType = 'DISTRICT';
  res.locals.requestedInstituteIdentifier = req.body.params.districtID;
  return next();
}

//Find Secure Exchange
function findSecureExchange_id_params(req, res, next) {
  res.locals.requestedSecureExchangeID = req.params.id;
  return next();
}

async function loadSecureExchange(req, res, next) {
  if (!res.locals.requestedSecureExchangeID) {
    return next();
  }
  const token = getAccessToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Token is unavailable.'
    });
  }
  try {
    res.locals.requestedSecureExchange = await getData(token, `${config.get('edx:exchangeURL')}/${res.locals.requestedSecureExchangeID}`, req.session?.correlationID);
  } catch (e) {
    log.error('Unable to load the Secure Exchange in loadSecureExchange.', e.stack);
  }
  return next();
}

//Find SDC School Collection
function findSdcSchoolCollectionID_params(req, res, next) {
  res.locals.requestedSdcSchoolCollectionID = req.params.sdcSchoolCollectionID;
  return next();
}

function findSdcDistrictCollectionID_params(req, res, next) {
  res.locals.requestedSdcDistrictCollectionID = req.params.sdcDistrictCollectionID;
  return next();
}

function findSInstituteTypeCollectionID_body(req, res, next) {
  if(req.session.activeInstituteType === 'DISTRICT') {
    res.locals.requestedInstituteType = 'DISTRICT';
    res.locals.requestedSdcDistrictCollectionID = req.body.sdcDistrictCollectionID;
    return next();
  } else {
    res.locals.requestedInstituteType = 'SCHOOL';
    res.locals.requestedSdcSchoolCollectionID = req.body.sdcSchoolCollectionID;
    return next();
  }
}

function checkStudentBelongsInCollection(req, res, next) {
  if (!res.locals.requestedSdcSchoolCollectionStudentID) {
    return next();
  }
  if(res.locals.requestedInstituteType === 'DISTRICT') {
    return checkIfStudentBelongsInDistrictCollection(req, res, next);
  } else {
    return checkIfStudentBelongsInSchoolCollection(req, res, next);
  }
}

function checkUserHasAccessToIncomingFileset(req, res, next){
  if (req.session.activeInstituteType === 'DISTRICT' && res.locals.requestedIncomingFileset.districtID !== req.session.activeInstituteIdentifier){
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'District user does not have access to school.'
    });
  }else if(req.session.activeInstituteType === 'SCHOOL' && res.locals.requestedIncomingFileset.schoolID !== req.session.activeInstituteIdentifier){
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'User does not have access to school.'
    });
  }
  return next();
}

function checkIfStudentBelongsInDistrictCollection(req, res, next) {
  if (!res.locals.requestedSdcSchoolCollectionStudent) {
    return res.status(HttpStatus.NOT_FOUND).json({
      message: 'Student not found.'
    });
  } else if(res.locals.requestedSdcDistrictCollectionID !== res.locals.requestedSdcSchoolCollectionStudent.sdcDistrictCollectionID) {
    return res.status(HttpStatus.FORBIDDEN).json({
      message: 'Student doesn\'t belong in the district.'
    });
  }
  return next();
}

function checkIfStudentBelongsInSchoolCollection(req, res, next) {
  if (!res.locals.requestedSdcSchoolCollectionStudent) {
    return res.status(HttpStatus.NOT_FOUND).json({
      message: 'Student not found.'
    });
  } else if(res.locals.requestedSdcSchoolCollectionID !== res.locals.requestedSdcSchoolCollectionStudent.sdcSchoolCollectionID) {
    return res.status(HttpStatus.FORBIDDEN).json({
      message: 'Student doesn\'t belong in the school.'
    });
  }
  return next();
}

function findSdcSchoolCollectionID_fromRequestedSdcSchoolCollectionStudent(req, res, next) {
  if (!res.locals.requestedSdcSchoolCollectionStudent) {
    return next();
  }
  res.locals.requestedSdcSchoolCollectionID = res.locals.requestedSdcSchoolCollectionStudent.sdcSchoolCollectionID;
  return next();
}

async function loadIncomingFileset(req, res, next) {
  const token = getAccessToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Token is unavailable.'
    });
  }
  try {
    const url = `${config.get('grad:rootURL')}/metrics/${req.params.activeIncomingFilesetID}/submission`;

    res.locals.requestedIncomingFileset = await getData(token, url);
  } catch (e) {
    log.error('Unable to load the incoming fileset with ID: ' + req.params.activeIncomingFilesetID, e.stack);
  }
  return next();
}


async function loadSdcSchoolCollection(req, res, next) {
  if (!res.locals.requestedSdcSchoolCollectionID) {
    return next();
  }
  const token = getAccessToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Token is unavailable.'
    });
  }
  try {
    res.locals.requestedSdcSchoolCollection = await getData(token, `${config.get('sdc:rootURL')}/sdcSchoolCollection/${res.locals.requestedSdcSchoolCollectionID}`, req.session?.correlationID);
  } catch (e) {
    log.error('Unable to load the SDC School Collection in loadSdcSchoolCollection.', e.stack);
  }
  return next();
}

async function loadSdcDistrictCollection(req, res, next) {
  if (!res.locals.requestedSdcDistrictCollectionID) {
    return next();
  }
  const token = getAccessToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Token is unavailable.'
    });
  }
  try {
    res.locals.requestedSdcDistrictCollection = await getData(token, `${config.get('sdc:rootURL')}/sdcDistrictCollection/${res.locals.requestedSdcDistrictCollectionID}`, req.session?.correlationID);
  } catch (e) {
    log.error('Unable to load the SDC District Collection in loadSdcDistrictCollection.', e.stack);
  }
  return next();
}

//Find SDC School Collection Student
function findSdcSchoolCollectionStudentID_params(req, res, next) {
  res.locals.requestedSdcSchoolCollectionStudentID = req.params.sdcSchoolCollectionStudentID;
  return next();
}

function findSdcSchoolCollectionStudentID_body(req, res, next) {
  res.locals.requestedSdcSchoolCollectionStudentID = req.body.sdcSchoolCollectionStudentID;
  return next();
}

function findSdcSchoolCollectionStudentIDs_body(req, res, next) {
  res.locals.requestedSdcSchoolCollectionStudentIDs = Array.isArray(req.body) ? req.body : null;
  return next();
}

async function loadSdcSchoolCollectionStudent(req, res, next) {
  if (!res.locals.requestedSdcSchoolCollectionStudentID) {
    return next();
  }
  const token = getAccessToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Token is unavailable.'
    });
  }
  try {
    res.locals.requestedSdcSchoolCollectionStudent = await getData(token, `${config.get('sdc:schoolCollectionStudentURL')}/${res.locals.requestedSdcSchoolCollectionStudentID}`, req.session?.correlationID);
  } catch (e) {
    log.error('Unable to load the SDC School Collection Student in loadSdcSchoolCollectionStudent.', e.stack);
  }
  return next();
}

async function loadRequestedSdcSchoolCollectionStudents(req, res, next) {
  if (!Array.isArray(res.locals.requestedSdcSchoolCollectionStudentIDs)) {
    return next();
  }
  let requestedSdcSchoolCollectionStudentIDs = Array.isArray(res.locals.requestedSdcSchoolCollectionStudentIDs) ? res.locals.requestedSdcSchoolCollectionStudentIDs : [];
  if (requestedSdcSchoolCollectionStudentIDs.length <= 0) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Zero SDC School Collection Student IDs were requested.'
    });
  }
  if (requestedSdcSchoolCollectionStudentIDs.length > 15) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Too many SDC School Collection Student IDs were requested.'
    });
  }
  const token = getAccessToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Token is unavailable.'
    });
  }
  let searchCriteria = [{
    condition: CONDITION.OR,
    searchCriteriaList: requestedSdcSchoolCollectionStudentIDs.map((rsscsid) => {
      return {
        key: 'sdcSchoolCollectionStudentID',
        value: rsscsid,
        operation: FILTER_OPERATION.EQUAL,
        valueType: VALUE_TYPE.UUID,
        condition: CONDITION.OR
      };
    })
  }];
  searchCriteria[0].searchCriteriaList.push({
    key: 'sdcSchoolCollectionStudentID',
    value: '0a617e77-8ccb-1623-818c-d0a4b9dc0474',
    operation: FILTER_OPERATION.EQUAL,
    valueType: VALUE_TYPE.UUID,
    condition: CONDITION.OR
  });
  const searchParameters = {
    params: {
      pageNumber: 0,
      pageSize: requestedSdcSchoolCollectionStudentIDs.length,
      sort: JSON.stringify({'sdcSchoolCollectionStudentID': 'ASC'}),
      searchCriteriaList: JSON.stringify(searchCriteria),
    }
  };
  try {
    let response = await getDataWithParams(token,`${config.get('sdc:schoolCollectionStudentURL')}/paginated`, searchParameters);
    res.locals.requestedSdcSchoolCollectionStudents = response.content;
  } catch (e) {
    log.error('Unable to load the requested SDC School Collection Students in loadRequestedSdcSchoolCollectionStudents.', e.stack);
  }
  return next();
}

async function checkIfRequestedSdcSchoolCollectionStudentsBelongToRequestedSdcSchoolCollection(req, res, next) {
  if (!Array.isArray(res.locals.requestedSdcSchoolCollectionStudentIDs)) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'The requested SDC School Collection Student IDs were not found in the request.'
    });
  }
  if (!Array.isArray(res.locals.requestedSdcSchoolCollectionStudents)) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'The requested SDC School Collection Students were not found in the request.'
    });
  }
  if (!res.locals.requestedSdcSchoolCollection) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'The requested SDC School Collection was not found in the request.'
    });
  }
  let requestedSdcSchoolCollectionStudentIDs = Array.isArray(res.locals.requestedSdcSchoolCollectionStudentIDs) ? res.locals.requestedSdcSchoolCollectionStudentIDs : [];
  let requestedSdcSchoolCollectionStudents = Array.isArray(res.locals.requestedSdcSchoolCollectionStudents) ? res.locals.requestedSdcSchoolCollectionStudents : [];
  if (requestedSdcSchoolCollectionStudentIDs.length !== requestedSdcSchoolCollectionStudents.length) {
    return res.status(HttpStatus.FORBIDDEN).json({
      message: 'One or more of the requested SDC School Collection Students were not found.'
    });
  }
  requestedSdcSchoolCollectionStudents.forEach((sdcSchoolCollectionStudent) => {
    if (sdcSchoolCollectionStudent.sdcSchoolCollectionID !== res.locals.requestedSdcSchoolCollection.sdcSchoolCollectionID) {
      return res.status(HttpStatus.FORBIDDEN).json({
        message: 'One or more of the requested Assessment Students are not accessible by the user.'
      });
    }
  });
  return next();
}

//Find Assessments
function findAssessmentStudentID_params(req, res, next) {
  res.locals.requestedAssessmentStudentID = req.params.assessmentStudentID;
  return next();
}

function findAssessmentStudentIDs_body(req, res, next) {
  res.locals.requestedAssessmentStudentIDs = Array.isArray(req.body) ? req.body : null;
  return next();
}

async function loadRequestedAssessmentStudent(req, res, next) {
  if (!res.locals.requestedAssessmentStudentID) {
    return next();
  }
  const token = getAccessToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Token is unavailable.'
    });
  }
  try {
    res.locals.requestedAssessmentStudent = await getData(token, `${config.get('assessments:assessmentStudentsURL')}/${res.locals.requestedAssessmentStudentID}`, req.session?.correlationID);
  } catch (e) {
    log.error('Unable to load the requested Assessment Student in loadRequestedAssessmentStudent.', e.stack);
  }
  return next();
}

async function loadRequestedAssessmentStudents(req, res, next) {
  if (!Array.isArray(res.locals.requestedAssessmentStudentIDs)) {
    return next();
  }
  let requestedAssessmentStudentIDs = Array.isArray(res.locals.requestedAssessmentStudentIDs) ? res.locals.requestedAssessmentStudentIDs : [];
  if (requestedAssessmentStudentIDs.length <= 0) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Zero Assessment Student IDs were requested.'
    });
  }
  if (requestedAssessmentStudentIDs.length > 15) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Too many Assessment Student IDs were requested.'
    });
  }
  const token = getAccessToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Token is unavailable.'
    });
  }
  let searchCriteria = [{
    condition: CONDITION.OR,
    searchCriteriaList: requestedAssessmentStudentIDs.map((rasid) => {
      return {
        key: 'assessmentStudentID',
        value: rasid,
        operation: FILTER_OPERATION.EQUAL,
        valueType: VALUE_TYPE.UUID,
        condition: CONDITION.OR
      };
    })
  }];
  const searchParameters = {
    params: {
      pageNumber: 0,
      pageSize: requestedAssessmentStudentIDs.length,
      sort: JSON.stringify({'assessmentStudentID': 'ASC'}),
      searchCriteriaList: JSON.stringify(searchCriteria),
    }
  };
  try {
    let response = await getDataWithParams(token,`${config.get('assessments:assessmentStudentsURL')}/paginated`, searchParameters);
    res.locals.requestedAssessmentStudents = response.content;
  } catch (e) {
    log.error('Unable to load the requested Assessment Students in loadRequestedAssessmentStudents.', e.stack);
  }
  return next();
}

function checkCurrentUserAccessToRequestedAssessmentStudent(req, res, next) {
  if (!res.locals.requestedAssessmentStudent) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'The requested Assessment Student was not found in the request.'
    });
  }
  if (!edxUserHasAccessToInstitute(req.session.activeInstituteType, 'SCHOOL', req.session.activeInstituteIdentifier, res.locals.requestedAssessmentStudent.schoolOfRecordSchoolID)) {
    return res.status(HttpStatus.FORBIDDEN).json({
      message: 'User does not have access to the requested Assessment Student.'
    });
  }
  return next();
}

function checkCurrentUserAccessToRequestedAssessmentStudents(req, res, next) {
  if (!Array.isArray(res.locals.requestedAssessmentStudentIDs)) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'The requested Assessment Student IDs were not found in the request.'
    });
  }
  if (!Array.isArray(res.locals.requestedAssessmentStudents)) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'The requested Assessment Students were not found in the request.'
    });
  }
  let requestedAssessmentStudentIDs = Array.isArray(res.locals.requestedAssessmentStudentIDs) ? res.locals.requestedAssessmentStudentIDs : [];
  let requestedAssessmentStudents = Array.isArray(res.locals.requestedAssessmentStudents) ? res.locals.requestedAssessmentStudents : [];
  if (requestedAssessmentStudentIDs.length !== requestedAssessmentStudents.length) {
    return res.status(HttpStatus.FORBIDDEN).json({
      message: 'One or more of the requested Assessment Students were not found.'
    });
  }
  requestedAssessmentStudents.forEach((assessmentStudent) => {
    if (!edxUserHasAccessToInstitute(req.session.activeInstituteType, 'SCHOOL', req.session.activeInstituteIdentifier, assessmentStudent.schoolOfRecordSchoolID)) {
      return res.status(HttpStatus.FORBIDDEN).json({
        message: 'One or more of the requested Assessment Students are not accessible by the user.'
      });
    }
  });
  return next();
}

function checkCurrentUserAccessToSchoolSpecifiedOnAssessmentStudent(req, res, next) {
  if (!req.body.schoolOfRecordSchoolID) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'The schoolOfRecordSchoolID was not specified in the request.'
    });
  }
  if (!edxUserHasAccessToInstitute(req.session.activeInstituteType, 'SCHOOL', req.session.activeInstituteIdentifier, req.body.schoolOfRecordSchoolID)) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'The current user does not have access to the specified school.'
    });
  }
  return next();
}

//Common logic
function edxUserHasAccessToInstitute(activeInstituteType, requestedInstituteType, activeInstituteID, requestedInstituteID) {
  if (activeInstituteType === 'DISTRICT' && requestedInstituteType === 'SCHOOL') {
    return doesSchoolBelongToDistrict(requestedInstituteID, activeInstituteID);
  }
  return activeInstituteType === requestedInstituteType && activeInstituteID === requestedInstituteID;
}

async function checkSdcDuplicateAccess(req, res, next) {
  const token = getAccessToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Token is unavailable.'
    });
  }

  let sdcDupStudents = [req?.body?.duplicate?.sdcSchoolCollectionStudent1Entity, req?.body?.duplicate?.sdcSchoolCollectionStudent2Entity];
  res.locals.sdcSchoolCollectionStudentsToUpdate = sdcDupStudents?.filter(dupStudent => req.body.students?.map(student => student.sdcSchoolCollectionStudentID)?.includes(dupStudent.sdcSchoolCollectionStudentID));
  if(res.locals.sdcSchoolCollectionStudentsToUpdate?.length !== req.body.students?.length) {
    return res.status(HttpStatus.FORBIDDEN).json({
      message: 'Student does not belong to this duplicate.'
    });
  }
  
  return next();
}

function findSdcSchoolCollectionsInDuplicate(req, res, next) {
  res.locals.requestedInstituteType = 'SCHOOL';
  res.locals.requestedSdcSchoolCollectionIDs = res.locals.sdcSchoolCollectionStudentsToUpdate.map(student => student.sdcSchoolCollectionID);
  return next();
}

async function checkUserAccessToDuplicateSdcSchoolCollections(req, res, next) {
  if (!res.locals.requestedSdcSchoolCollectionIDs) {
    return next();
  }
  const token = getAccessToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Token is unavailable.'
    });
  }
  try {
    let promises = [];
    res.locals.requestedSdcSchoolCollectionIDs.forEach(id => {
      promises.push(getData(token, `${config.get('sdc:rootURL')}/sdcSchoolCollection/${id}`, req.session?.correlationID));
    });
    res.locals.requestedSdcSchoolCollections = await Promise.all(promises);

    res.locals.requestedSdcSchoolCollections.forEach(schoolCollection => {
      if(!edxUserHasAccessToInstitute(req.session.activeInstituteType, 'SCHOOL', req.session.activeInstituteIdentifier, schoolCollection.schoolID)) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'User does not have access to the requested sdc school collection.'
        });
      }
    });
    return next();
  } catch (e) {
    log.error('Unable to load the SDC School Collection in loadSdcSchoolCollection.', e.stack);
  }
  return next();
}

async function checkDistrictBelongsInSdcDistrictCollection(req, res, next) {
  if (!res.locals.requestedSdcDistrictCollection) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'SdcDistrictCollectionID is required.'
    });
  }
  if (!res.locals.requestedInstituteIdentifier) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'DistrictID is required.'
    });
  }
  if(res.locals.requestedSdcDistrictCollection.districtID !== res.locals.requestedInstituteIdentifier) {
    return res.status(HttpStatus.FORBIDDEN).json({
      message: 'District does not belong to this sdc district collection.'
    });
  }
  return next();
}

function checkActiveInstituteIdentifier(req, res, next) {
  if (!req.session.activeInstituteIdentifier) {
    return res.status(HttpStatus.FORBIDDEN).json({
      message: 'Institute does not exist in session.'
    });
  }
  return next();
}

async function checkIfRoleIsAllowedForSchool(req, res, next) {
  let schoolID = req?.body?.params?.schoolID;
  let isRoleAllowed = await checkValidRoles(req, req.body.params.selectedRoles, schoolID);
  if(!isRoleAllowed) {
    return res.status(HttpStatus.FORBIDDEN).json({
      message: 'Role is not allowed.'
    });
  }
  return next();
}


async function checkUserRoleForNewUser(req, res, next) {
  let schoolID = req?.body?.schoolID;
  let isRoleAllowed = await checkValidRoles(req, req.body.edxActivationRoleCodes, schoolID);
  if(!isRoleAllowed) {
    return res.status(HttpStatus.FORBIDDEN).json({
      message: 'Role is not allowed.'
    });
  }
  return next();
}

function isValidUUIDParam(paramName) {
  return function(req, res, next) {
    if (!req.params[paramName]) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'No request parameter was provided.'
      });
    }

    if (!validate(req.params[paramName])) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Not a valid UUID provided for request parameter.'
      });
    }
    return next();
  };
}


async function checkValidRoles(req, incomingRoles, schoolID) {
  const token = getAccessToken(req);
  const params = {
    params: req.query
  };
  let data = await getDataWithParams(token, `${config.get('edx:rootURL')}/users/roles`, params, req.session?.correlationID);
  let allowedRoles = filterSchoolRoles(schoolID, data);
  return incomingRoles.every(role => {
    return allowedRoles.filter(allowed => allowed.edxRoleCode === role).length > 0;
  });
}

const permUtils = {
  isValidUUIDParam,
  checkIfRoleIsAllowedForSchool,
  checkUserRoleForNewUser,
  checkEDXUserAccessToRequestedInstitute,
  checkEdxUserPermission,
  checkPermissionForRequestedInstitute,
  verifyQueryParamValueMatchesBodyValue,
  validateAccessToken,
  checkSecureExchangeAccess,
  conflictActionOnClosedSecureExchange,
  checkSdcSchoolCollectionAccess,
  checkSdcDistrictCollectionAccess,
  findInstituteInformation_query,
  findInstituteInformation_body_params,
  findInstituteType_params,
  findInstituteIdentifier_params,
  findSchoolID_query,
  findSchoolID_params,
  findSchoolID_body,
  findSchoolID_body_params,
  findDistrictID_query,
  findDistrictID_params,
  findDistrictID_body,
  findDistrictId_body,
  findDistrictID_querySearchParams,
  findDistrictID_body_params,
  findSecureExchange_id_params,
  loadSecureExchange,
  findSdcSchoolCollectionID_params,
  findSdcDistrictCollectionID_params,
  findSdcSchoolCollectionID_fromRequestedSdcSchoolCollectionStudent,
  loadSdcSchoolCollection,
  loadSdcDistrictCollection,
  findDistrictContactId_body,
  findSdcSchoolCollectionStudentID_params,
  loadSdcSchoolCollectionStudent,
  checkInstituteCollectionAccess,
  findSInstituteTypeCollectionID_body,
  loadInstituteCollection,
  findSchoolContactId_body,
  findDistrictContactId_params,
  checkStudentBelongsInCollection,
  findSdcSchoolCollectionStudentID_body,
  findSdcSchoolCollectionStudentIDs_body,
  loadRequestedSdcSchoolCollectionStudents,
  checkIfRequestedSdcSchoolCollectionStudentsBelongToRequestedSdcSchoolCollection,
  edxUserHasAccessToInstitute,
  findSchoolContactId_params,
  findSdcSchoolCollectionsInDuplicate,
  checkSdcDuplicateAccess,
  checkUserAccessToDuplicateSdcSchoolCollections,
  checkDistrictBelongsInSdcDistrictCollection,
  checkAnyEdxUserSignoffPermission,
  checkPermissionForSignOff,
  checkActiveInstituteIdentifier,
  loadIncomingFileset,
  checkUserHasAccessToIncomingFileset,
  findAssessmentStudentID_params,
  findAssessmentStudentIDs_body,
  loadRequestedAssessmentStudent,
  loadRequestedAssessmentStudents,
  checkCurrentUserAccessToRequestedAssessmentStudent,
  checkCurrentUserAccessToRequestedAssessmentStudents,
  checkCurrentUserAccessToSchoolSpecifiedOnAssessmentStudent
};

module.exports = permUtils;

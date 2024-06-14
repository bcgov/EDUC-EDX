'use strict';

const HttpStatus = require('http-status-codes');
const {doesSchoolBelongToDistrict} = require('./institute-cache');
const {getAccessToken, getData, SecureExchangeStatuses} = require('./utils');
const config = require('../config');
const log = require('./logger');

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
  if(res.locals.requestedSdcDistrictCollectionID){
    return next();
  }
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

function checkIfCreateorUpdateSDCStudentIsAllowed(req, res, next) {
  if (res.locals.requestedInstituteType === 'DISTRICT' && req.body.sdcSchoolCollectionStudentID === null) {
    return res.status(HttpStatus.FORBIDDEN).json({
      message: 'User doesn\'t have permission.'
    });
  }
  return next();
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

function findSearchAll_query(req, res, next) {
  if (req.query.sdcDistrictCollectionID){
    res.locals.requestedSdcDistrictCollectionID = req.query.sdcDistrictCollectionID;
  }
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

async function loadSdcSchoolCollection(req, res, next) {
  if (!res.locals.requestedSdcSchoolCollectionID || res.locals.requestedSdcDistrictCollectionID) {
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
    console.log("res.locals.requestedSdcSchoolCollectionID>>>>>>>>>>>>>>>", res.locals.requestedSdcSchoolCollectionID)
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

async function loadRelevantCollection(req, res, next){
  if(res.locals.requestedSdcDistrictCollectionID){
    await loadSdcDistrictCollection(req, res, next);
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

//Common logic
function edxUserHasAccessToInstitute(activeInstituteType, requestedInstituteType, activeInstituteID, requestedInstituteID) {
  if (activeInstituteType === 'DISTRICT' && requestedInstituteType === 'SCHOOL') {
    return doesSchoolBelongToDistrict(requestedInstituteID, activeInstituteID);
  }
  return activeInstituteType === requestedInstituteType && activeInstituteID === requestedInstituteID;
}

const permUtils = {
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
  findSdcSchoolCollectionStudentID_params,
  loadSdcSchoolCollectionStudent,
  checkInstituteCollectionAccess,
  checkIfCreateorUpdateSDCStudentIsAllowed,
  findSInstituteTypeCollectionID_body,
  loadInstituteCollection,
  checkStudentBelongsInCollection,
  findSdcSchoolCollectionStudentID_body,
  findSearchAll_query,
  loadRelevantCollection
};

module.exports = permUtils;

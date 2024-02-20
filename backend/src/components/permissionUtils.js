'use strict';

const HttpStatus = require('http-status-codes');
const {doesSchoolBelongToDistrict, isSchoolAnOffshoreSchool} = require('./institute-cache');

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

//School checks
function forbidActionOnOffshoreSchools(req, res, next) {
  if (!res.locals.requestedInstituteType || !res.locals.requestedInstituteIdentifier) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'The requested institution type and identifier wasn\'t found in the request.'
    });
  }
  if (res.locals.requestedInstituteType !== 'SCHOOL') {
    return next();
  }
  if (!isSchoolAnOffshoreSchool(res.locals.requestedInstituteIdentifier)) {
    return next();
  }
  return res.status(HttpStatus.FORBIDDEN).json({
    message: 'This action cannot be performed for offshore schools.'
  });
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

//Find District IDs
function findDistrictID_querySearchParams(req, res, next) {
  res.locals.requestedInstituteType = 'DISTRICT';
  res.locals.requestedInstituteIdentifier = req.query.searchParams.districtID;
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
  verifyQueryParamValueMatchesBodyValue,
  forbidActionOnOffshoreSchools,
  findSchoolID_query,
  findSchoolID_params,
  findSchoolID_body,
  findDistrictID_querySearchParams
};

module.exports = permUtils;

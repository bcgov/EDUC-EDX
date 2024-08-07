'use strict';
const { errorResponse, getAccessToken, getData, putData, postData, handleExceptionResponse, getCreateOrUpdateUserValue} = require('./utils');
const log = require('./logger');
const config = require('../config');
const HttpStatus = require('http-status-codes');
const {LocalDate, DateTimeFormatter} = require('@js-joda/core');

async function getDistrictByDistrictID(req, res){
  const token = getAccessToken(req);
  return Promise.all([
    getData(token, `${config.get('institute:rootURL')}/district/${res.locals.requestedInstituteIdentifier}`, req.session?.correlationID),
  ])
    .then(async ([dataResponse]) => {
      return res.status(200).json(dataResponse);
    }).catch(e => {
      log.error(e, 'getDistrictByDistrictID', 'Error getting district details by ID from API.');
      return errorResponse(res);
    });
}

async function updateDistrict(req, res){
  try{
    const params = req.body;
    params.addresses.forEach(function(addy) {
      addy.updateDate = null;
      addy.createDate = null;
      addy.updateUser = getCreateOrUpdateUserValue(req);
    });
    params.contacts = null;
    params.createDate = null;
    params.updateDate = null;
    params.updateUser = getCreateOrUpdateUserValue(req);

    const token = getAccessToken(req);
    const result = await putData(token, params, `${config.get('institute:rootURL')}/district/${res.locals.requestedInstituteIdentifier}`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    log.error(e, 'updateDistrict', 'Error occurred while attempting to update a district.');
    return handleExceptionResponse(e, res);
  }
}

async function createDistrictContact(req, res) {
  let createUpdateUser = getCreateOrUpdateUserValue(req);
  const payload = {
    districtContactTypeCode: req.body.districtContactTypeCode,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    jobTitle: req.body.jobTitle,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    phoneExtension: req.body.phoneExtension,
    alternatePhoneNumber: req.body.alternatePhoneNumber,
    alternatePhoneExtension: req.body.alternatePhoneExtension,
    effectiveDate: req.body.effectiveDate ? req.body.effectiveDate : null,
    expiryDate: req.body.expiryDate ? req.body.expiryDate : null,
    createUser: createUpdateUser,
    updateUser: createUpdateUser
  };

  const token = getAccessToken(req);
  return Promise.all([
    postData(token, payload, `${config.get('institute:rootURL')}/district/${res.locals.requestedInstituteIdentifier}/contact`, req.session?.correlationID),
  ])
    .then(async ([dataResponse]) => {
      return res.status(200).json(dataResponse);
    }).catch(e => {
      log.error(e, 'createDistrictContact', 'Error creating district contact with API.');
      return errorResponse(res);
    });
}

async function updateDistrictContact(req, res) {
  try {
    const payload = req.body;
    payload.updateDate = null;
    payload.createDate = null;
    payload.effectiveDate = payload.effectiveDate ? req.body.effectiveDate : null;
    payload.expiryDate = payload.expiryDate ? req.body.expiryDate : null;
    payload.updateUser = getCreateOrUpdateUserValue(req);

    const token = getAccessToken(req);
    const result = await putData(token, payload,`${config.get('institute:rootURL')}/district/${res.locals.requestedInstituteIdentifier}/contact/${res.locals.requestedDistrictContactId}` , req.session?.correlationID);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    log.error(e, 'updateDistrictContact', 'Error occurred while attempting to update a district contact.');
    return errorResponse(res);
  }
}

async function removeDistrictContact(req, res) {
  try {
    const token = getAccessToken(req);
    const contact = await getData(token, `${config.get('institute:rootURL')}/district/${res.locals.requestedInstituteIdentifier}/contact/${res.locals.requestedDistrictContactId}`);
    if (!contact) {
      log.error('Contact not found');
      return errorResponse(res);
    }

    contact.createDate = null;
    contact.updateDate = null;
    contact.expiryDate = LocalDate.now().atStartOfDay().format(DateTimeFormatter.ofPattern('yyyy-MM-dd\'T\'HH:mm:ss')).toString();
    contact.updateUser = getCreateOrUpdateUserValue(req);

    const result = await putData(token, contact,`${config.get('institute:rootURL')}/district/${res.locals.requestedInstituteIdentifier}/contact/${res.locals.requestedDistrictContactId}` , req.session?.correlationID);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    log.error(e, 'removeDistrictContact', 'Error occurred while attempting to remove a district contact.');
    return errorResponse(res);
  }
}

module.exports = {
  getDistrictByDistrictID,
  updateDistrict,
  createDistrictContact,
  updateDistrictContact,
  removeDistrictContact
};

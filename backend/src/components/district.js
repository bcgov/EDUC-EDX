'use strict';
const { errorResponse, getAccessToken, getData, checkEDXUserAccess,checkEDXUserDistrictAdminPermission, putData, postData, handleExceptionResponse} = require('./utils');
const log = require('./logger');
const config = require('../config');
const HttpStatus = require('http-status-codes');
const {LocalDate, DateTimeFormatter} = require('@js-joda/core');

async function getDistrictByDistrictID(req, res){
  const token = getAccessToken(req);
  validateAccessToken(token);
  checkEDXUserAccess(req, 'DISTRICT', req.params.districtID);

  return Promise.all([
    getData(token, `${config.get('institute:rootURL')}/district/${req.params.districtID}`, req.session?.correlationID),
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
    const token = getAccessToken(req);
    validateAccessToken(token);
    checkEDXUserAccess(req, 'DISTRICT', req.params.districtID);
    checkEDXUserDistrictAdminPermission(req);

    const params = req.body;

    params.addresses.forEach(function(addy) {
      addy.updateDate = null;
      addy.createDate = null;
    });

    params.notes.forEach(function(note) {
      note.updateDate = null;
      note.createDate = null;
    });

    params.contacts.forEach(function(contact) {
      contact.updateDate = null;
      contact.createDate = null;
    });

    params.createDate = null;
    params.updateDate = null;
    const result = await putData(token, params, config.get('institute:rootURL') + '/district/' + req.params.districtID, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    log.error(e, 'updateDistrict', 'Error occurred while attempting to update a district.');
    return handleExceptionResponse(e, res);
  }
}

async function createDistrictContact(req, res) {
  const token = getAccessToken(req);
  validateAccessToken(token);
  checkEDXUserAccess(req, 'DISTRICT', req.params.districtID);

  const formatter = DateTimeFormatter.ofPattern('yyyy-MM-dd\'T\'HH:mm:ss');

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
    effectiveDate: req.body.effectiveDate ? LocalDate.parse(req.body.effectiveDate).atStartOfDay().format(formatter) : null,
    expiryDate: req.body.expiryDate ? LocalDate.parse(req.body.expiryDate).atStartOfDay().format(formatter) : null
  };

  return Promise.all([
    postData(token, payload, `${config.get('institute:rootURL')}/district/${req.params.districtID}/contact`, req.session?.correlationID),
  ])
    .then(async ([dataResponse]) => {
      return res.status(200).json(dataResponse);
    }).catch(e => {
      log.error(e, 'createDistrictContact', 'Error creating district contact with API.');
      return errorResponse(res);
    });
}

function validateAccessToken(token, res) {
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }
}

async function updateDistrictContact(req, res) {
  try {
    const token = getAccessToken(req);
    validateAccessToken(token);
    checkEDXUserAccess(req, 'DISTRICT', req.body.districtId);
    checkEDXUserDistrictAdminPermission(req);
    const formatter = DateTimeFormatter.ofPattern('yyyy-MM-dd\'T\'HH:mm:ss');


    const payload = req.body;
    payload.updateDate = null;
    payload.createDate = null;
    payload.effectiveDate = payload.effectiveDate ? LocalDate.parse(req.body.effectiveDate).atStartOfDay().format(formatter) : null;
    payload.expiryDate = payload.expiryDate ? LocalDate.parse(req.body.expiryDate).atStartOfDay().format(formatter) : null;

    const result = await putData(token, payload,`${config.get('institute:rootURL')}/district/${req.body.districtId}/contact/${req.body.districtContactId}` , req.session?.correlationID);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    log.error(e, 'updateDistrictContact', 'Error occurred while attempting to update a district contact.');
    return errorResponse(res);
  }
}

module.exports = {
  getDistrictByDistrictID,
  updateDistrict,
  createDistrictContact,
  updateDistrictContact
};

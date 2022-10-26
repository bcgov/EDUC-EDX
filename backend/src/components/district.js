'use strict';
const { errorResponse, getAccessToken, getData, checkEDXUserAccess,checkEDXUserDistrictAdminPermission, putData, postData, handleExceptionResponse} = require('./utils');
const log = require('./logger');
const config = require('../config');
const HttpStatus = require('http-status-codes');

async function getDistrictByDistrictID(req, res){
  const token = getAccessToken(req);
  validateAccessToken(token);
  checkEDXUserAccess(req, res, 'DISTRICT', req.params.districtID);

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
    checkEDXUserAccess(req, res, 'DISTRICT', req.params.districtID);
    checkEDXUserDistrictAdminPermission(req);

    const params = req.body;
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
  checkEDXUserAccess(req, res, 'DISTRICT', req.body.districtId);

  return Promise.all([
    postData(token, req.body, `${config.get('institute:rootURL')}/district/${req.body.districtId}/contact`, req.session?.correlationID),
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

module.exports = {
  getDistrictByDistrictID,
  updateDistrict,
  createDistrictContact
};

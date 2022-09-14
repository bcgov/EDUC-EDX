'use strict';
const { errorResponse, getAccessToken, getData, checkEDXUserAccess} = require('./utils');
const log = require('./logger');
const config = require('../config');
const HttpStatus = require('http-status-codes');

async function getDistrictByDistrictID(req, res){
  const token = getAccessToken(req);
  validateAccessToken(token);
  checkEDXUserAccess(req, res, 'DISTRICT', req.params.districtID);

  return Promise.all([
    getData(token, `${config.get('instituteAPIURL')}/district/${req.params.districtID}`, req.session?.correlationID),
  ])
    .then(async ([dataResponse]) => {
      return res.status(200).json(dataResponse);
    }).catch(e => {
      log.error(e, 'getDistrictByDistrictID', 'Error getting district details by ID from API.');
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
  getDistrictByDistrictID
};

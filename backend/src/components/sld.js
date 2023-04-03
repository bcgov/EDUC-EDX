'use strict';
const { getAccessToken, 
  checkEDXCollectionPermission, postData, handleExceptionResponse, getData
} = require('./utils');
const HttpStatus = require('http-status-codes');
const log = require('./logger');
const config = require('../config');

async function getCollectionBySchoolId(req, res) {
    try {
      const token = getAccessToken(req);
      validateAccessToken(token, res);
      checkEDXCollectionPermission(req);

      const data = await getData(token, `${config.get('sdc:collectionBySchoolIdURL')}/${req.params.schoolID}`, req.session?.correlationID);
      return res.status(HttpStatus.OK).json(data);
    }catch (e) {
      if(e?.status === 404){
        res.status(HttpStatus.OK).json(null);
      } else {
        log.error('Error getting collection for this school', e.stack);
        return handleExceptionResponse(e, res);
      }
      
    }
  }

  function validateAccessToken(token, res) {
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }
  }

  module.exports = {
    getCollectionBySchoolId
  }
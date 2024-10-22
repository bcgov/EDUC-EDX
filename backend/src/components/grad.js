'use strict';
const { getAccessToken, handleExceptionResponse, getData, postData, putData, getDataWithParams, deleteData, formatNumberOfCourses, stripNumberFormattingNumberOfCourses,
  getCreateOrUpdateUserValue} = require('./utils');
const HttpStatus = require('http-status-codes');
const log = require('./logger');
const config = require('../config');
const broadcastUtil = require('../socket/broadcast-utils');
const CONSTANTS = require('../util/constants');

async function uploadFile(req, res) {
    try {
      let createUpdateUser = getCreateOrUpdateUserValue(req);
      const payload = {
        fileContents: req.body.fileContents,
        fileName: req.body.fileName,
        fileType: req.body.fileType,
        createUser: createUpdateUser,
        updateUser: createUpdateUser
      };
      const token = getAccessToken(req);
      let data = await postData(token, payload, `${config.get('grad:rootURL')}/${req.params.schoolID}/file`, req.session?.correlationID);  
      return res.status(HttpStatus.OK).json(data);
    } catch (e) {
      console.log(JSON.stringify(e));
      if (e.status === 400) {
        return res.status(HttpStatus.BAD_REQUEST).json(e.data.subErrors[0].message);
      }
      log.error('uploadFile Error', e.stack);
      return handleExceptionResponse(e, res);
    }
  }
  
  async function getSdcFileProgress(req, res) {
    try {
      const token = getAccessToken(req);
      const data = await getData(token, `${config.get('grad:rootURL')}/${req.params.schoolID}/file`, req.session?.correlationID);
      return res.status(HttpStatus.OK).json(data);
    } catch (e) {
      log.error('getSdcFileProgress Error', e.stack);
      return handleExceptionResponse(e, res);
    }
  }

  module.exports = {
    uploadFile,
    getSdcFileProgress
  };
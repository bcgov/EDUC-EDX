'use strict';
const { getAccessToken, checkEDXCollectionPermission,checkEDXUserAccess, handleExceptionResponse, getData, postData, putData} = require('./utils');
const HttpStatus = require('http-status-codes');
const log = require('./logger');
const config = require('../config');

async function getCollectionBySchoolId(req, res) {
  try {
    const token = getAccessToken(req);
    validateAccessToken(token, res);
    checkEDXCollectionPermission(req);
    checkEDXUserAccess(req,'SCHOOL', req.params.schoolID);

    const data = await getData(token, `${config.get('sdc:schoolCollectionURL')}/search/${req.params.schoolID}`, req.session?.correlationID);
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

async function uploadFile(req, res) {
  try {
    const token = getAccessToken(req);
    validateAccessToken(token);
    checkEDXCollectionPermission(req);
    await validateEdxUserAccess(token, req, res, req.params.sdcSchoolCollectionID);

    const payload = {
      fileContents: req.body.fileContents,
      fileName: req.body.fileName,
      createUser: 'edx/' + req.session.edxUserData.edxUserID
    };
    const url = `${config.get('sdc:rootURL')}/${req.params.sdcSchoolCollectionID}/file`;
    const data = await postData(token, payload, url, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    console.log(JSON.stringify(e));
    if(e.status === 400){
      return res.status(HttpStatus.BAD_REQUEST).json(e.data.subErrors[0].message);
    }
    log.error('uploadFile Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getSdcFileProgress(req, res) {
  try {
    const token = getAccessToken(req);
    validateAccessToken(token);
    checkEDXCollectionPermission(req);

    await validateEdxUserAccess(token, req, res, req.params.sdcSchoolCollectionID);

    const url = `${config.get('sdc:rootURL')}/${req.params.sdcSchoolCollectionID}/file`;
    const data = await getData(token, url, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('getSdcFileProgress Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function updateSchoolCollection(req, res) {
  try {
    const token = getAccessToken(req);
    validateAccessToken(token);
    checkEDXCollectionPermission(req);
    await validateEdxUserAccess(token, req, res, req.params.sdcSchoolCollectionID);

    const payload = req.body.schoolCollection;
    payload.createDate = null;
    payload.createUser = null;
    payload.updateDate = null;
    payload.updateUser = null;

    payload.sdcSchoolCollectionStatusCode = req.body.status;
    
    const data = await putData(token, payload, `${config.get('sdc:schoolCollectionURL')}/${req.params.sdcSchoolCollectionID}`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('Error updating the school collection record', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getSchoolCollectionById(req, res) {
  try {
    const token = getAccessToken(req);
    validateAccessToken(token);
    checkEDXCollectionPermission(req);
    await validateEdxUserAccess(token, req, res, req.params.sdcSchoolCollectionID);

    const data = await getData(token, `${config.get('sdc:schoolCollectionURL')}/${req.params.sdcSchoolCollectionID}`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('Error retrieving the school collection record', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function validateEdxUserAccess(token, req, res, sdcSchoolCollectionID){
  const urlGetCollection = `${config.get('sdc:rootURL')}/sdcSchoolCollection/${sdcSchoolCollectionID}`;
  const sdcSchoolCollection = await getData(token, urlGetCollection, null);
  if(!sdcSchoolCollection){
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No SDC school collection found of ID'
    });
  }

  checkEDXUserAccess(req,'SCHOOL',sdcSchoolCollection.schoolID);
}

function validateAccessToken(token, res) {
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }
}

module.exports = {
  getCollectionBySchoolId,
  uploadFile,
  getSdcFileProgress,
  updateSchoolCollection,
  getSchoolCollectionById
};

'use strict';
const { getAccessToken, checkEDXCollectionPermission,checkEDXUserAccess, handleExceptionResponse, getData, postData, putData, getDataWithParams} = require('./utils');
const HttpStatus = require('http-status-codes');
const log = require('./logger');
const config = require('../config');
const {FILTER_OPERATION, VALUE_TYPE, CONDITION} = require('../util/constants');

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

async function getSDCSchoolCollectionStudentPaginated(req, res) {
  try {
    const token = getAccessToken(req);
    validateAccessToken(token);
    checkEDXCollectionPermission(req);
    await validateEdxUserAccess(token, req, res, req.params.sdcSchoolCollectionID);

    const search = [{
      condition: null,
      searchCriteriaList: [{key: 'sdcSchoolCollectionID', value: req.params.sdcSchoolCollectionID, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID}]
    }, {
      condition: CONDITION.AND,
      searchCriteriaList: createSearchCriteria(req.body.searchParams)
    }];

    const params = {
      params: {
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
        sort: req.query.sort,
        searchCriteriaList: JSON.stringify(search),
      }
    };

    let data = await getDataWithParams(token, config.get('sdc:schoolCollectionStudentURL') + '/paginated', params, req.session?.correlationID);

    return res.status(HttpStatus.OK).json(data);
  }catch (e) {
    if(e?.status === 404){
      res.status(HttpStatus.OK).json(null);
    } else {
      log.error('Error getting sdc school collection student paginated list', e.stack);
      return handleExceptionResponse(e, res);
    }
  }
}

async function getSDCSchoolCollectionStudentSummaryCounts (req, res) {
  try {
    const token = getAccessToken(req);
    validateAccessToken(token);
    checkEDXCollectionPermission(req);
    await validateEdxUserAccess(token, req, res, req.params.sdcSchoolCollectionID);

    let errorCriteria = [{key: 'sdcSchoolCollectionID', value: req.params.sdcSchoolCollectionID, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND}];
    errorCriteria.push({key: 'sdcSchoolCollectionStudentStatusCode', value: 'ERROR', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});

    let warningCriteria = [{key: 'sdcSchoolCollectionID', value: req.params.sdcSchoolCollectionID, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND}];
    warningCriteria.push({key: 'sdcSchoolCollectionStudentStatusCode', value: 'WARNING', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});

    const errorParams = {
      params: {
        pageNumber: 1,
        pageSize: 1,
        searchCriteriaList: JSON.stringify([{condition: null, searchCriteriaList: errorCriteria}]),
      }
    };

    const warningParams = {
      params: {
        pageNumber: 1,
        pageSize: 1,
        searchCriteriaList: JSON.stringify([{condition: null, searchCriteriaList: warningCriteria}]),
      }
    };

    let errorData = await getDataWithParams(token, config.get('sdc:schoolCollectionStudentURL') + '/paginated', errorParams, req.session?.correlationID);
    let warningData = await getDataWithParams(token, config.get('sdc:schoolCollectionStudentURL') + '/paginated', warningParams, req.session?.correlationID);

    return res.status(HttpStatus.OK).json({warnings: warningData.totalElements, errors: errorData.totalElements});
  }catch (e) {
    if(e?.status === 404){
      res.status(HttpStatus.OK).json(null);
    } else {
      log.error('Error getting sdc school collection student count summaries', e.stack);
      return handleExceptionResponse(e, res);
    }
  }
}

async function getSDCSchoolCollectionStudentDetail (req, res) {
  try {
    const token = getAccessToken(req);
    validateAccessToken(token);
    checkEDXCollectionPermission(req);
    await validateEdxUserAccess(token, req, res, req.params.sdcSchoolCollectionID);

    let sdcSchoolCollectionStudentData = await getData(token,`${config.get('sdc:schoolCollectionStudentURL')}/${req.params.sdcSchoolCollectionStudentID}`, req.session?.correlationID);

    sdcSchoolCollectionStudentData.enrolledProgramCodes = sdcSchoolCollectionStudentData?.enrolledProgramCodes.match(/.{1,2}/g);

    return res.status(HttpStatus.OK).json(sdcSchoolCollectionStudentData);
  }catch (e) {
    if(e?.status === 404){
      res.status(HttpStatus.OK).json(null);
    } else {
      log.error('Error getting sdc school collection student detail', e.stack);
      return handleExceptionResponse(e, res);
    }
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

/**
 * Returns an object that has the following properties key, value, operation, valueType
 * Helper function when building search params for querying SDC API
 *
 * @param searchParams key value pair of what we are searching for
 */
function createSearchCriteria(searchParams = []) {
  let searchCriteriaList = [];

  Object.keys(searchParams).forEach(function(key){
    let pValue = searchParams[key];
    if (key === 'studentPen') {
      searchCriteriaList.push({key: key, operation: FILTER_OPERATION.CONTAINS_IGNORE_CASE, value: pValue, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
    }
    if (key === 'sdcSchoolCollectionStudentStatusCode') {
      searchCriteriaList.push({key: key, operation: FILTER_OPERATION.IN, value: pValue, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND});
    }
  });

  return searchCriteriaList;
}

module.exports = {
  getCollectionBySchoolId,
  uploadFile,
  getSdcFileProgress,
  updateSchoolCollection,
  getSchoolCollectionById,
  getSDCSchoolCollectionStudentPaginated,
  getSDCSchoolCollectionStudentSummaryCounts,
  getSDCSchoolCollectionStudentDetail
};
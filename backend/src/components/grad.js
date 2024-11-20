'use strict';
const { getAccessToken, handleExceptionResponse, getData, postData, getCreateOrUpdateUserValue, getDataWithParams} = require('./utils');
const HttpStatus = require('http-status-codes');
const log = require('./logger');
const config = require('../config');
const { FILTER_OPERATION, VALUE_TYPE} = require('../util/constants');
const cacheService = require('./cache-service');

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
  
async function getFileProgress(req, res) {
  try {
    const token = getAccessToken(req);
    const data = await getData(token, `${config.get('grad:rootURL')}/${req.params.schoolID}/file`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('getSdcFileProgress Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getErrorFilesetStudentPaginated(req, res) {
  try {
    const search = [];
    if(req.params.schoolID) {
      search.push({
        condition: null,
        searchCriteriaList: [{ key: 'incomingFileset.schoolID', value: req.params.schoolID, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID }]
      });
    } 
    // search.push({
    //   condition: CONDITION.AND,
    //   searchCriteriaList: createSearchCriteria(req.query.searchParams)
    // });
  
    const params = {
      params: {
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
        sort: JSON.stringify(req.query.sort),
        searchCriteriaList: JSON.stringify(search),
      }
    };
    const token = getAccessToken(req);
    let data = await getDataWithParams(token, `${config.get('grad:filesetURL')}/paginated`, params, req.session?.correlationID);

    data.content = data?.content.map(error => toTableRow(error));
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('Error getting error fileset student paginated list', e.stack);
    return handleExceptionResponse(e, res);
  }
}

function toTableRow(validationIssues) {
  let validationCodes = cacheService.getGradDataCollectionValidationIssueCodes();
  let updatedValidationIssues = [];
  for(let errorRow of validationIssues?.errorFilesetStudentValidationIssues) {
    errorRow.validationIssueCodeDesc = validationCodes.find(error => error?.validationIssueTypeCode === errorRow?.validationIssueCode)?.message;
    updatedValidationIssues.push(errorRow);
  }
  validationIssues.errorFilesetStudentValidationIssues = updatedValidationIssues;
  return validationIssues;
}

module.exports = {
  uploadFile,
  getFileProgress,
  getErrorFilesetStudentPaginated
};

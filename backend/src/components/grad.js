'use strict';
const { getAccessToken, handleExceptionResponse, postData, getCreateOrUpdateUserValue, getDataWithParams, getData} = require('./utils');
const HttpStatus = require('http-status-codes');
const log = require('./logger');
const config = require('../config');
const { FILTER_OPERATION, VALUE_TYPE, CONDITION} = require('../util/constants');
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

async function downloadErrorReport(req, res) {
  try {
    const token = getAccessToken(req);
    const url = `${config.get('grad:rootURL')}/reportGeneration/errorReport/${req.params.schoolID}`;

    const resData = await getData(token, url);

    res.setHeader('Content-Disposition', 'attachment; filename=StudentErrorReport.csv');
    res.setHeader('Content-Type', 'text/csv');
    const buffer = Buffer.from(resData.documentData, 'base64');
    return res.status(HttpStatus.OK).send(buffer);
  } catch (e) {
    log.error('downloadErrorReport Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getFilesetsPaginated(req, res) {
  try {
    const search = [];
    if(req.params.schoolID) {
      search.push({
        condition: null,
        searchCriteriaList: [{ key: 'schoolID', value: req.params.schoolID, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID }]
      });
    } 

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
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('Error getting error fileset student paginated list', e.stack);
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

    if (req.query.searchParams?.['moreFilters']) {
      let criteriaArray = createMoreFiltersSearchCriteria(req.query.searchParams['moreFilters']);
      criteriaArray.forEach(criteria => {
        search.push(criteria);
      });
    }
    console.log(JSON.stringify(search))

    const params = {
      params: {
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
        sort: JSON.stringify(req.query.sort),
        searchCriteriaList: JSON.stringify(search),
      }
    };
    const token = getAccessToken(req);
    let data = await getDataWithParams(token, `${config.get('grad:errorFilesetURL')}/paginated`, params, req.session?.correlationID);

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

function createMoreFiltersSearchCriteria(searchFilter = []) {
  let penLocalIdFilter = [];
  let nameFilter = [];
  for (const [key, filter] of Object.entries(searchFilter)) {
    let pValue = filter ? filter.map(filter => filter.value) : null;
    if (key === 'pen' && pValue) {
      let penLocalIdCriteria = createPenLocalIdCriteria(key, pValue.toString());
      penLocalIdFilter = [...penLocalIdFilter, ...penLocalIdCriteria];
    }
    if (key === 'localID' && pValue) {
      let penLocalIdCriteria = createPenLocalIdCriteria(key, pValue.toString());
      penLocalIdFilter = [...penLocalIdFilter, ...penLocalIdCriteria];
    }
    if (key === 'lastName' && pValue) {
      let nameCriteria = createNameCriteria(key, pValue.toString());
      nameFilter = [...nameFilter, ...nameCriteria];
    }
    if (key === 'firstName' && pValue) {
      let nameCriteria = createNameCriteria(key, pValue.toString());
      nameFilter = [...nameFilter, ...nameCriteria];
    }
  }
  const search = [];
  if (penLocalIdFilter.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: penLocalIdFilter
    });
  }
  if (nameFilter.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: nameFilter
    });
  }
  return search;
}

function createPenLocalIdCriteria(key, idString) {
  const searchCriteriaList = [];
  searchCriteriaList.push({
    key: key,
    operation: FILTER_OPERATION.EQUAL,
    value: idString,
    valueType: VALUE_TYPE.STRING,
    condition: CONDITION.AND
  });
  return searchCriteriaList;
}

function createNameCriteria(nameString) {
  const nameParts = nameString.split(/\s+/);
  const fieldNames = [
    'lastName',
    'firstName'
  ];

  const searchCriteriaList = [];
  for (const part of nameParts) {
    for (const fieldName of fieldNames) {
      searchCriteriaList.push({
        key: fieldName,
        operation: FILTER_OPERATION.CONTAINS_IGNORE_CASE,
        value: `%${part}%`,
        valueType: VALUE_TYPE.STRING,
        condition: CONDITION.OR
      });
    }
  }
  return searchCriteriaList;
}

module.exports = {
  uploadFile,
  getErrorFilesetStudentPaginated,
  getFilesetsPaginated,
  downloadErrorReport
};

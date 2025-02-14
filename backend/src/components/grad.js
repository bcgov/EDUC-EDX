'use strict';
const { getAccessToken, handleExceptionResponse, postData, getCreateOrUpdateUserValue, getDataWithParams, getData} = require('./utils');
const HttpStatus = require('http-status-codes');
const log = require('./logger');
const config = require('../config');
const { FILTER_OPERATION, VALUE_TYPE, CONDITION} = require('../util/constants');
const cacheService = require('./cache-service');
const {DateTimeFormatterBuilder, ResolverStyle, LocalDateTime, LocalDate} = require("@js-joda/core");

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
    let data;
    if (req.params.schoolID){
      data = await postData(token, payload, `${config.get('grad:rootURL')}/${req.params.schoolID}/file`, req.session?.correlationID);
    } else {
      data = await postData(token, payload, `${config.get('grad:rootURL')}/district/${req.params.districtID}/file`, req.session?.correlationID);
    }
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
    const url = `${config.get('grad:rootURL')}/reportGeneration/errorReport/${req.params.activeIncomingFilesetID}`;

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
    } else if(req.params.districtID) {
      search.push({
        condition: null,
        searchCriteriaList: [{ key: 'districtID', value: req.params.districtID, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID }]
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

    if(req?.params?.districtID){
      data?.content.forEach(value => {
        value.schoolName = getSchoolName(cacheService.getSchoolBySchoolID(value.schoolID));
      });
      data?.content.sort((a,b) =>  {
        if (a.schoolName > b.schoolName) {
          return 1;
        } else if (a.schoolName < b.schoolName) {
          return -1;
        }
        return 0;
      });
    }

    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('Error getting error fileset student paginated list', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getErrorFilesetStudentPaginated(req, res) {
  try {
    const search = [];
    if(req.params.activeIncomingFilesetID) {
      search.push({
        condition: null,
        searchCriteriaList: [{ key: 'incomingFileset.incomingFilesetID', value: req.params.activeIncomingFilesetID, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID }]
      });
    } 

    if (req.query.searchParams?.['moreFilters']) {
      let criteriaArray = createMoreFiltersSearchCriteria(req.query.searchParams['moreFilters']);
      criteriaArray.forEach(criteria => {
        search.push(criteria);
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
    let data = await getDataWithParams(token, `${config.get('grad:errorFilesetURL')}/paginated`, params, req.session?.correlationID);

    data.content = data?.content.map(error => toTableRow(error));
    data.content.forEach(item => {
      item.birthdate = formatDateTime(item.birthdate);
    })

    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('Error getting error fileset student paginated list', e.stack);
    return handleExceptionResponse(e, res);
  }
}

function toTableRow(validationIssues) {
  let fieldCodes = cacheService.getGradDataCollectionValidationFieldCodes();
  let updatedFieldCodes = [];
  for(let errorRow of validationIssues.errorFilesetStudentValidationIssues) {
    errorRow.validationIssueFieldCodeDescription = fieldCodes.find(field => field?.code === errorRow.validationIssueFieldCode).description;
    updatedFieldCodes.push(errorRow);
  }
  validationIssues.errorFilesetStudentValidationIssues = updatedFieldCodes;
  return validationIssues;
}

function createMoreFiltersSearchCriteria(searchFilter = []) {
  let penLocalIdFilter = [];
  let nameFilter = [];
  let fileTypeList = [];
  let warningList = [];
  let fieldCodeList = [];
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
      let nameCriteria = createNameCriteria(pValue.toString());
      nameFilter = [...nameFilter, ...nameCriteria];
    }
    if (key === 'firstName' && pValue) {
      let nameCriteria = createNameCriteria(pValue.toString());
      nameFilter = [...nameFilter, ...nameCriteria];
    }
    if (key === 'fileType' && pValue) {
      let filterValue = pValue.toString();
      if(filterValue === 'DEM-ERROR') {
        fileTypeList.push({ key: 'demographicStudentEntities.demographicStudentValidationIssueEntities', value: 'DEM-ERROR', operation: FILTER_OPERATION.CUSTOM_CHILD_JOIN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
      } else if(filterValue === 'CRS-ERROR') {
        fileTypeList.push({ key: 'courseStudentEntities.courseStudentValidationIssueEntities', value: 'CRS-ERROR', operation: FILTER_OPERATION.CUSTOM_CHILD_JOIN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
      } else if(filterValue === 'XAM-ERROR') {
        fileTypeList.push({ key: 'assessmentStudentEntities.assessmentStudentValidationIssueEntities', value: 'XAM-ERROR', operation: FILTER_OPERATION.CUSTOM_CHILD_JOIN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
      }
      if(warningList.length > 0) {
        let warningValue = warningList[0].value;
        warningList = createSeverityFilter(warningValue);
      }
    }
    if (key === 'warnings' && pValue) {
      if(fileTypeList.length > 0) {
        let fileTypeValue = fileTypeList[0].value;
        warningList = createSeverityFilter(fileTypeValue, pValue);
      } else {
        warningList.push({ key: 'demographicStudentEntities.demographicStudentValidationIssueEntities.validationIssueSeverityCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
        warningList.push({ key: 'courseStudentEntities.courseStudentValidationIssueEntities.validationIssueSeverityCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
        warningList.push({ key: 'assessmentStudentEntities.assessmentStudentValidationIssueEntities.validationIssueSeverityCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
      }
    }
    if(key === 'fieldCode' && pValue) {
      fieldCodeList.push({ key: 'demographicStudentEntities.demographicStudentValidationIssueEntities.validationIssueFieldCode', value: pValue.toString(), operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
      fieldCodeList.push({ key: 'courseStudentEntities.courseStudentValidationIssueEntities.validationIssueFieldCode', value: pValue.toString(), operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
      fieldCodeList.push({ key: 'assessmentStudentEntities.assessmentStudentValidationIssueEntities.validationIssueFieldCode', value: pValue.toString(), operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
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
  if(warningList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: warningList
    });
  }
  if(fileTypeList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: fileTypeList
    });
  }
  if(fieldCodeList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: fieldCodeList
    });
  }
  return search;
}

function getSchoolName(school) {
  return school.mincode + ' - ' + school.schoolName;
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

function getDateFormatter(pattern) {
  return (new DateTimeFormatterBuilder)
      .appendPattern(pattern)
      .toFormatter(ResolverStyle.STRICT);
}
function formatDateTime(datetime, from='uuuuMMdd', to='MM/dd/uuuu', hasTimePart=false) {
  const fromFormatter = getDateFormatter(from);
  const toFormatter = getDateFormatter(to);
  let result = datetime;
  const localDateTime = hasTimePart ? LocalDateTime : LocalDate;
  if (datetime && datetime.length > 0) {
    try {
      const date = localDateTime.parse(datetime, fromFormatter);
      result = date.format(toFormatter);
    } catch (err) {
      console.info(`could not parse date ${datetime}: ${from} to ${to} as date provided is invalid`);
    }
  }
  return result;
}

function createSeverityFilter(fileType, pValue) {
  let warningList = [];
  if(fileType === 'DEM-ERROR') {
    warningList.push({ key: 'demographicStudentEntities.demographicStudentValidationIssueEntities.validationIssueSeverityCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
  } else if(fileType === 'CRS-ERROR') {
    warningList.push({ key: 'courseStudentEntities.courseStudentValidationIssueEntities.validationIssueSeverityCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
  } else if(fileType === 'XAM-ERROR') {
    warningList.push({ key: 'assessmentStudentEntities.assessmentStudentValidationIssueEntities.validationIssueSeverityCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR }); 
  }
  return warningList;
}

module.exports = {
  uploadFile,
  getErrorFilesetStudentPaginated,
  getFilesetsPaginated,
  downloadErrorReport
};

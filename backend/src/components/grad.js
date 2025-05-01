'use strict';
const { getAccessToken, handleExceptionResponse, postData, getCreateOrUpdateUserValue, getDataWithParams, getData
} = require('./utils');
const HttpStatus = require('http-status-codes');
const log = require('./logger');
const config = require('../config');
const { FILTER_OPERATION, VALUE_TYPE, CONDITION} = require('../util/constants');
const cacheService = require('./cache-service');
const {DateTimeFormatterBuilder, ResolverStyle, LocalDateTime, LocalDate} = require('@js-joda/core');
const CONSTANTS = require('../util/constants');
const broadcastUtil = require('../socket/broadcast-utils');

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

    if (req.query.fileOverride){
      payload.courseSessionOverride = true;
    }

    const token = getAccessToken(req);
    let data;
    if (req.params.schoolID){
      data = await postData(token, payload, `${config.get('grad:rootURL')}/${req.params.schoolID}/file`, req.session?.correlationID);
    } else {
      data = await postData(token, payload, `${config.get('grad:rootURL')}/district/${req.params.districtID}/file`, req.session?.correlationID);
    }
    data.eventType = CONSTANTS.EVENT_TYPE.GDC_FILE_UPLOAD_EVENT;
    broadcastUtil.publishGdcEvents(data, CONSTANTS.GDC_UPLOAD_TOPIC);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    if (e.status === 400) {
      return res.status(HttpStatus.BAD_REQUEST).json(e.data.subErrors[0].message);
    }else if (e.status === 428) {
      return res.status(HttpStatus.PRECONDITION_REQUIRED).json('NT');
    }
    log.error('uploadFile Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getActiveReportingPeriod(req, res) {
  try {
    const token = getAccessToken(req);
    const url = `${config.get('grad:rootURL')}/reporting-period/active`;
    const data = await getData(token, url);
    return res.status(200).json(data);
  } catch (e) {
    log.error(e, 'getActiveReportingPeriod', 'Error occurred while attempting to GET GDC Active Reporting Period.');
    return handleExceptionResponse(e, res);
  }
}

async function uploadFileXLS(req, res) {
  try {
    let createUpdateUser = getCreateOrUpdateUserValue(req);
    const payload = {
      fileContents: req.body.fileContents,
      fileName: req.body.fileName,
      fileType: req.body.fileType,
      createUser: createUpdateUser,
      updateUser: createUpdateUser
    };

    if (req.query.fileOverride){
      payload.courseSessionOverride = true;
    }

    const token = getAccessToken(req);
    let data;
    if (req.params.schoolID){
      data = await postData(token, payload, `${config.get('grad:rootURL')}/${req.params.schoolID}/excel-upload`, req.session?.correlationID);
    } else {
      data = await postData(token, payload, `${config.get('grad:rootURL')}/district/${req.params.districtID}/excel-upload`, req.session?.correlationID);
    }
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    if (e.status === 400) {
      return res.status(HttpStatus.BAD_REQUEST).json(e.data.subErrors[0].message);
    }
    log.error('uploadFileXLS Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function processSummerStudents(req, res) {
  try {
    let createUpdateUser = getCreateOrUpdateUserValue(req);
    const payload = {
      fileName: req.body.fileName,
      summerStudents: req.body.summerStudents,
      createUser: createUpdateUser,
      updateUser: createUpdateUser
    };
    const token = getAccessToken(req);
    let data;
    if (req.params.schoolID){
      data = await postData(token, payload, `${config.get('grad:rootURL')}/${req.params.schoolID}/process`, req.session?.correlationID);
    } else {
      data = await postData(token, payload, `${config.get('grad:rootURL')}/district/${req.params.districtID}/process`, req.session?.correlationID);
    }
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    if (e.status === 400) {
      return res.status(HttpStatus.BAD_REQUEST).json(e.data.subErrors[0].message);
    }
    log.error('processSummerStudents Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function downloadErrorReport(req, res) {
  try {
    const token = getAccessToken(req);
    const url = `${config.get('grad:rootURL')}/reportGeneration/errorReport/${req.params.activeIncomingFilesetID}`;

    const resData = await getData(token, url);

    res.setHeader('Content-Disposition', `attachment; filename=${resData?.reportName}.csv`);
    res.setHeader('Content-Type', 'text/csv');
    const buffer = Buffer.from(resData.documentData, 'base64');
    return res.status(HttpStatus.OK).send(buffer);
  } catch (e) {
    log.error('downloadErrorReport Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getStudentFilesetByPenFilesetId(req, res) {
  try {
    const params = {
      params: {
        pen: req.params.pen,
        incomingFilesetID: req.query?.incomingFilesetID,
        schoolID: req.query?.schoolID,
      }
    };

    const token = getAccessToken(req);
    let data = await getDataWithParams(token, `${config.get('grad:filesetURL')}/get-student`, params, req.session?.correlationID);

    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('Error getting error fileset object', e.stack);
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
      if (req.query?.searchParams?.schoolID) {
        search.push({
          condition: 'AND',
          searchCriteriaList: [{ key: 'schoolID', value: req.query.searchParams.schoolID, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID }]
        });
      }
    }

    if (req.query?.searchParams?.pen) {
      search.push({
        condition: 'AND',
        searchCriteriaList: [
          { key: 'demographicStudentEntities.pen', value: req.query?.searchParams?.pen, operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING },
        ]
      });
    }

    if (req.query.searchParams?.collectionObject) {
      search.push({
        condition: 'AND',
        searchCriteriaList: [{
          key: 'reportingPeriod.reportingPeriodID',
          value: req.query.searchParams.collectionObject.reportingPeriodID,
          operation: FILTER_OPERATION.EQUAL,
          valueType: VALUE_TYPE.UUID
        }]
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

    if (data.content && data.content.length > 0) {
      data.content = data.content.map(fileset => {
        if (req?.params?.districtID) {
          const school = cacheService.getSchoolBySchoolID(fileset.schoolID);
          fileset.schoolName = `${school.mincode} - ${school.schoolName}`.trim();
        }
        if (fileset.updateUser && fileset.updateUser.startsWith('EDX/')) {
          const userID = fileset.updateUser.slice(4);
          const user = cacheService.getEdxUserByID(userID);
          if (user) {
            fileset.updateUser = user.displayName;
          }
        }
        return fileset;
      });
    }

    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('Error getting error fileset paginated list', e.stack);
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
      let criteriaArray = createMoreFiltersErrorFilesetSearchCriteria(req.query.searchParams['moreFilters']);
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
    });

    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('Error getting error fileset student paginated list', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getSubmissionMetrics(req, res){
  try {
    const resData = res.locals.requestedIncomingFileset;

    if (resData.updateUser && resData.updateUser.startsWith('EDX/')) {
      const userID = resData.updateUser.slice(4);
      const user = cacheService.getEdxUserByID(userID);
      if (user) {
        resData.updateUser = user.displayName;
      }
    }
    return res.status(HttpStatus.OK).send(resData);
  } catch (e) {
    log.error('getSubmissionMetrics Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getErrorMetrics(req, res){
  try {
    const token = getAccessToken(req);
    const url = `${config.get('grad:rootURL')}/metrics/${req.params.activeIncomingFilesetID}/errors`;

    const resData = await getData(token, url);

    return res.status(HttpStatus.OK).send(resData);
  } catch (e) {
    log.error('getErrorMetrics Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getGradSchoolDetails(req, res){
  try {
    const token = getAccessToken(req);
    const url = `${config.get('gradSchool:rootURL')}/search/${req.params.schoolID}`;

    const resData = await getData(token, url);

    return res.status(HttpStatus.OK).send(resData);
  } catch (e) {
    log.error('getGradSchoolDetails Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getCurrentGradStudentsPaginated(req, res){
  if (!req.session.activeInstituteIdentifier) {
    return Promise.reject('getCurrentGradStudentsPaginated error: User activeInstituteIdentifier does not exist in session');
  }

  const search = [];

  if(req.params.schoolID) {
    search.push({
      condition: null,
      searchCriteriaList: [{ key: 'schoolOfRecordId', value: req.params.schoolID, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND },
        { key: 'studentStatus', value: 'CUR', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND }]
    });
  }

  if (req.query.searchParams?.['moreFilters']) {
    let criteriaArray = createMoreFiltersCurrentStudentsSearchCriteria(req.query.searchParams['moreFilters']);
    criteriaArray.forEach(criteria => {
      search.push(criteria);
    });
  }

  const studentSearchParam = {
    params: {
      pageNumber: req.query.pageNumber,
      pageSize: req.query.pageSize,
      sort: req.query.sort,
      searchCriteriaList: JSON.stringify(search)
    }
  };

  const accessToken = getAccessToken(req);
  let data = await getDataWithParams(accessToken, `${config.get('gradCurrentStudents:rootURL')}/grad/student/search`, studentSearchParam, req.session?.correlationID);

  data.content.forEach(item => {
    if(item.schoolAtGradId){
      const school = cacheService.getSchoolBySchoolID(item.schoolAtGradId);
      item.schoolAtGraduationName = school.schoolName;
    }else{
      item.schoolAtGraduationName = '-';
    }

    if(item.honorsStanding && item.honorsStanding === 'Y'){
      item.honorsStanding = 'Yes';
    }else if(item.honorsStanding && item.honorsStanding === 'N'){
      item.honorsStanding = 'No';
    }else {
      item.honorsStanding = '-';
    }

    item.dob = item.dob.replaceAll('-', '/');
  });

  return res.status(HttpStatus.OK).json(data);
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

function createMoreFiltersCurrentStudentsSearchCriteria(searchFilter = []) {
  let search = [];
  for (const [key, filter] of Object.entries(searchFilter)) {
    let pValue = filter ? filter.map(filter => filter.value) : null;
    if (key === 'grade' && pValue) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: [{ key: 'studentGrade', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND }]
      });
    }else if (key === 'pen' && pValue) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: [{ key: 'pen', value: pValue.toString(), operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND }]
      });
    }else if (key === 'firstName' && pValue) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: [{ key: 'firstName', value: pValue.toString(), operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND }]
      });
    }else if (key === 'lastName' && pValue) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: [{ key: 'lastName', value: pValue.toString(), operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND }]
      });
    }else if (key === 'localID' && pValue) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: [{ key: 'localID', value: pValue.toString(), operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND }]
      });
    }else if (key === 'programCode' && pValue) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: [{ key: 'programCode', value: pValue.toString(), operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND }]
      });
    }else if (key === 'programComplete') {
      let pValueID = filter ? filter.map(filter => filter.id) : null;
      if(pValueID.toString() === 'programComplete'){
        search.push({
          condition: CONDITION.AND,
          searchCriteriaList: [{ key: 'programCompletionDate', value: null, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND }]
        });
      }else{
        search.push({
          condition: CONDITION.AND,
          searchCriteriaList: [{ key: 'programCompletionDate', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND }]
        });
      }
    }
  }
  return search;
}

function createMoreFiltersErrorFilesetSearchCriteria(searchFilter = []) {
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
        warningList.push({ key: 'demographicStudentEntities.demographicStudentValidationIssueEntities.validationIssueSeverityCode', value: pValue.toString(), operation: FILTER_OPERATION.EQUAL_WITH_LEFT_JOIN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
        warningList.push({ key: 'courseStudentEntities.courseStudentValidationIssueEntities.validationIssueSeverityCode', value: pValue.toString(), operation: FILTER_OPERATION.EQUAL_WITH_LEFT_JOIN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
        warningList.push({ key: 'assessmentStudentEntities.assessmentStudentValidationIssueEntities.validationIssueSeverityCode', value: pValue.toString(), operation: FILTER_OPERATION.EQUAL_WITH_LEFT_JOIN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
      }
    }
    if(key === 'fieldCode' && pValue) {
      fieldCodeList.push({ key: 'demographicStudentEntities.demographicStudentValidationIssueEntities.validationIssueFieldCode', value: pValue.toString(), operation: FILTER_OPERATION.EQUAL_WITH_LEFT_JOIN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
      fieldCodeList.push({ key: 'courseStudentEntities.courseStudentValidationIssueEntities.validationIssueFieldCode', value: pValue.toString(), operation: FILTER_OPERATION.EQUAL_WITH_LEFT_JOIN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
      fieldCodeList.push({ key: 'assessmentStudentEntities.assessmentStudentValidationIssueEntities.validationIssueFieldCode', value: pValue.toString(), operation: FILTER_OPERATION.EQUAL_WITH_LEFT_JOIN, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
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

function getGradSchools(req, res) {
  try {
    let schools = cacheService.getGradSchoolsList();
    return res.status(HttpStatus.OK).json(schools);
  } catch (e) {
    log.error('getGradSchools Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

module.exports = {
  uploadFile,
  getErrorFilesetStudentPaginated,
  getFilesetsPaginated,
  downloadErrorReport,
  getStudentFilesetByPenFilesetId,
  getCurrentGradStudentsPaginated,
  getSubmissionMetrics,
  getErrorMetrics,
  uploadFileXLS,
  getActiveReportingPeriod,
  processSummerStudents,
  getGradSchoolDetails,
  getGradSchools
};

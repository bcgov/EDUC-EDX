'use strict';
const { getAccessToken, handleExceptionResponse, getData, postData, putData, getDataWithParams, deleteData} = require('./utils');
const HttpStatus = require('http-status-codes');
const log = require('./logger');
const config = require('../config');
const { FILTER_OPERATION, VALUE_TYPE, CONDITION, ENROLLED_PROGRAM_TYPE_CODE_MAP} = require('../util/constants');
const {createMoreFiltersSearchCriteria} = require('./studentFilters');
const {REPORT_TYPE_CODE_MAP} = require('../util/constants');
const cacheService = require('./cache-service');

async function getCollectionBySchoolId(req, res) {
  try {
    const token = getAccessToken(req);
    const data = await getData(token, `${config.get('sdc:schoolCollectionURL')}/search/${req.params.schoolID}`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    if (e?.status === 404) {
      res.status(HttpStatus.OK).json(null);
    } else {
      log.error('Error getting collection for this school', e.stack);
      return handleExceptionResponse(e, res);
    }
  }
}

async function getCollectionByDistrictId(req, res) {
  try {
    const token = getAccessToken(req);
    const data = await getData(token, `${config.get('sdc:districtCollectionURL')}/search/${req.params.districtID}`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    if (e?.status === 404) {
      res.status(HttpStatus.OK).json(null);
    } else {
      log.error('Error getting collection for this school', e.stack);
      return handleExceptionResponse(e, res);
    }
  }
}

async function uploadFile(req, res) {
  try {
    const payload = {
      fileContents: req.body.fileContents,
      fileName: req.body.fileName,
      createUser: 'EDX/' + req.session.edxUserData.edxUserID,
      updateUser: 'EDX/' + req.session.edxUserData.edxUserID
    };
    const token = getAccessToken(req);
    const data = await postData(token, payload, `${config.get('sdc:rootURL')}/${req.params.sdcSchoolCollectionID}/file`, req.session?.correlationID);
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
    const payload = req.body.schoolCollection;
    payload.createDate = null;
    payload.createUser = null;
    payload.updateDate = null;
    payload.updateUser = 'EDX/' + req.session.edxUserData.edxUserID;
    payload.sdcSchoolCollectionStatusCode = req.body.status;
    const token = getAccessToken(req);
    const data = await putData(token, payload, `${config.get('sdc:schoolCollectionURL')}/${req.params.sdcSchoolCollectionID}`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('Error updating the school collection record', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getDistrictCollectionById(req, res) {
  try {
    const token = getAccessToken(req);
    const data = await getSdcDistrictCollection(req.params.sdcDistrictCollectionID, res, token, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('Error retrieving the district collection record', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getSchoolCollectionById(req, res) {
  try {
    const token = getAccessToken(req);
    const data = await getSdcSchoolCollection(req.params.sdcSchoolCollectionID, res, token, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('Error retrieving the school collection record', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getSDCSchoolCollectionStudentPaginated(req, res) {
  try {
    const search = [];
    if(req.params.sdcSchoolCollectionID) {
      search.push({
        condition: null,
        searchCriteriaList: [{ key: 'sdcSchoolCollection.sdcSchoolCollectionID', value: req.params.sdcSchoolCollectionID, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID }]
      });
    } else if(req.params.sdcDistrictCollectionID) {
      search.push({
        condition: null,
        searchCriteriaList: [{ key: 'sdcSchoolCollection.sdcDistrictCollectionID', value: req.params.sdcDistrictCollectionID, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID }]   
      });
    }
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: createSearchCriteria(req.query.searchParams)
    });

    if(req.query.searchParams['tabFilter']) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: createTabFilter(req.query.searchParams['tabFilter'])
      });
    }

    if (req.query.searchParams['multiFieldName']) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: createMultiFieldNameSearchCriteria(req.query.searchParams['multiFieldName'])
      });
    }
    if (req.query.searchParams['penLocalIdNumber']) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: createLocalIdPenSearchCriteria(req.query.searchParams['penLocalIdNumber'])
      });
    }
    if (req.query.searchParams['moreFilters']) {
      let criteriaArray = createMoreFiltersSearchCriteria(req.query.searchParams['moreFilters']);
      criteriaArray.forEach(criteria => {
        search.push(criteria);
      });
    }

    const params = {
      params: {
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
        sort: req.query.sort,
        searchCriteriaList: JSON.stringify(search),
      }
    };
    const token = getAccessToken(req);
    let data = await getDataWithParams(token, `${config.get('sdc:schoolCollectionStudentURL')}/paginated`, params, req.session?.correlationID);
    if (req?.query?.returnKey) {
      let result = data?.content.map((student) => student[req?.query?.returnKey]);
      return res.status(HttpStatus.OK).json(result);
    }

    if(req?.query?.tableFormat){
      data.content = data?.content.map(toTableRow);
    }

    if(req?.params?.sdcDistrictCollectionID){
      data?.content.forEach(value => {
        value.schoolName = cacheService.getSchoolBySchoolID(value.schoolID)?.schoolName;
        value.mincode = cacheService.getSchoolBySchoolID(value.schoolID)?.mincode;
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
    if (e?.status === 404) {
      res.status(HttpStatus.OK).json(null);
    } else {
      log.error('Error getting sdc school collection student paginated list', e.stack);
      return handleExceptionResponse(e, res);
    }
  }
}

async function getSDCSchoolCollectionStudentSummaryCounts(req, res) {
  try {
    const token = getAccessToken(req);
    let errorWarningCount = await getData(token, `${config.get('sdc:schoolCollectionStudentURL')}/stats/error-warning-count/${req.params.sdcSchoolCollectionID}`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(errorWarningCount);
  } catch (e) {
    if (e?.status === 404) {
      res.status(HttpStatus.OK).json(null);
    } else {
      log.error('Error getting sdc school collection student count summaries', e.stack);
      return handleExceptionResponse(e, res);
    }
  }
}

async function getSDCSchoolCollectionStudentDetail(req, res) {
  try {
    const token = getAccessToken(req);
    let sdcSchoolCollectionStudentData = await getSdcSchoolCollectionStudent(req.params.sdcSchoolCollectionStudentID, res, token, req.session?.correlationID);
    if (sdcSchoolCollectionStudentData?.enrolledProgramCodes) {
      sdcSchoolCollectionStudentData.enrolledProgramCodes = sdcSchoolCollectionStudentData?.enrolledProgramCodes.match(/.{1,2}/g);
    }

    return res.status(HttpStatus.OK).json(sdcSchoolCollectionStudentData);
  } catch (e) {
    log.error('Error getting sdc school collection student detail', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function markSdcSchoolCollectionStudentAsDifferent(req, res) {
  try {
    const payload = req.body;
    payload.createDate = null;
    payload.createUser = null;
    payload.updateDate = null;
    payload.updateUser = 'EDX/' + req.session.edxUserData.edxUserID;
    
    payload.assignedPen = null;
    payload.assignedStudentId = null;
    payload.penMatchResult = null;
  
    const token = getAccessToken(req);
    const data = await postData(token, payload, `${config.get('sdc:schoolCollectionStudentURL')}/mark-for-review`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('Error updating sdc school collection student detail', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function updateAndValidateSdcSchoolCollectionStudent(req, res) {
  try {
    const payload = req.body;
    payload.createDate = null;
    payload.createUser = null;
    payload.updateDate = null;
    payload.updateUser = 'EDX/' + req.session.edxUserData.edxUserID;

    if (payload?.enrolledProgramCodes) {
      payload.enrolledProgramCodes = payload.enrolledProgramCodes.join('');
    }

    payload.sdcSchoolCollectionStudentValidationIssues = null;
    payload.sdcSchoolCollectionStudentEnrolledPrograms = null;

    const token = getAccessToken(req);
    const data = await postData(token, payload, config.get('sdc:schoolCollectionStudentURL'), req.session?.correlationID);
    if (data?.enrolledProgramCodes) {
      data.enrolledProgramCodes = data?.enrolledProgramCodes.match(/.{1,2}/g);
    }
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('Error updating sdc school collection student detail', e.stack);
    return handleExceptionResponse(e, res);
  }

}

async function deleteSDCSchoolCollectionStudent(req, res) {
  try {
    log.info('EDX User :: ' + req.session.edxUserData.edxUserID + ' is removing SDC student :: ' + req.params.sdcSchoolCollectionStudentID);
    const token = getAccessToken(req);
    let deletedSdcSchoolCollectionStudentData = await deleteData(token, `${config.get('sdc:schoolCollectionStudentURL')}/${req.params.sdcSchoolCollectionStudentID}`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(deletedSdcSchoolCollectionStudentData);
  } catch (e) {
    log.error('Error deleting SDC School Collection Student.', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function removeSDCSchoolCollectionStudents(req, res) {
  try {
    log.info('EDX User :: ' + req.session.edxUserData.edxUserID + ' is removing SDC students :: ' + JSON.stringify(req.body));
    const token = getAccessToken(req);
    let deletedSdcSchoolCollectionStudentData = await postData(token, req.body, `${config.get('sdc:schoolCollectionStudentURL')}/soft-delete-students`);
    return res.status(HttpStatus.OK).json(deletedSdcSchoolCollectionStudentData);
  } catch (e) {
    log.error('Error deleting SDC School Collection Students.', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getSchoolStudentDuplicates(req, res) {
  try {
    const token = getAccessToken(req);
    let studentDuplicates = await getData(token, `${config.get('sdc:schoolCollectionURL')}/${req.params.sdcSchoolCollectionID}/duplicates`, req.session?.correlationID);

    let dupsMap = new Map();
    studentDuplicates.forEach((dup) => {
      if(dupsMap.has(dup.assignedPen)){
        dupsMap.get(dup.assignedPen).push(toTableRow(dup));
      }else{
        dupsMap.set(dup.assignedPen, [toTableRow(dup)]);
      }
    });

    let resultArray = [];

    dupsMap.forEach(function(items,key){
      resultArray.push({assignedPen: key, items});
    });

    return res.status(HttpStatus.OK).json(resultArray);
  } catch (e) {
    log.error('Error getting Student duplicates.', e.stack);
    return handleExceptionResponse(e, res);
  }
}

function toTableRow(student) {
  let bandCodesMap = cacheService.getAllActiveBandCodesMap();
  let careerProgramCodesMap = cacheService.getActiveCareerProgramCodesMap();
  let schoolFundingCodesMap = cacheService.getActiveSchoolFundingCodesMap();
  let specialEducationCodesMap = cacheService.getActiveSpecialEducationCodesMap();

  student.mappedSpedCode = specialEducationCodesMap.get(student.specialEducationCategoryCode) !== undefined ? `${specialEducationCodesMap.get(student.specialEducationCategoryCode)?.description} (${specialEducationCodesMap.get(student.specialEducationCategoryCode)?.specialEducationCategoryCode})` : null;
  student.mappedAncestryIndicator = student.nativeAncestryInd === null ? null : nativeAncestryInd(student);
  student.mappedFrenchEnrolledProgram = enrolledProgramMapping(student, ENROLLED_PROGRAM_TYPE_CODE_MAP.FRENCH_ENROLLED_PROGRAM_CODES);
  student.mappedEllEnrolledProgram = enrolledProgramMapping(student, ENROLLED_PROGRAM_TYPE_CODE_MAP.ENGLISH_ENROLLED_PROGRAM_CODES);
  student.mappedLanguageEnrolledProgram = enrolledProgramMapping(student, [...ENROLLED_PROGRAM_TYPE_CODE_MAP.ENGLISH_ENROLLED_PROGRAM_CODES, ...ENROLLED_PROGRAM_TYPE_CODE_MAP.FRENCH_ENROLLED_PROGRAM_CODES]);
  student.mappedCareerProgram = enrolledProgramMapping(student, ENROLLED_PROGRAM_TYPE_CODE_MAP.CAREER_ENROLLED_PROGRAM_CODES);
  student.mappedIndigenousEnrolledProgram = enrolledProgramMapping(student, ENROLLED_PROGRAM_TYPE_CODE_MAP.INDIGENOUS_ENROLLED_PROGRAM_CODES);
  student.mappedBandCode = bandCodesMap.get(student.bandCode) !== undefined ? `${bandCodesMap.get(student.bandCode)?.description} (${bandCodesMap.get(student.bandCode)?.bandCode})` : null;
  student.mappedCareerProgramCode = careerProgramCodesMap.get(student.careerProgramCode) !== undefined ? `${careerProgramCodesMap.get(student.careerProgramCode)?.description} (${careerProgramCodesMap.get(student.careerProgramCode)?.careerProgramCode})` : null;
  student.mappedSchoolFunding = schoolFundingCodesMap.get(student.schoolFundingCode) !== undefined ? `${schoolFundingCodesMap.get(student.schoolFundingCode)?.description} (${schoolFundingCodesMap.get(student.schoolFundingCode)?.schoolFundingCode})` : null;
  student.indProgramEligible = student.indigenousSupportProgramNonEligReasonCode !== null ? 'No' : 'Yes';
  student.frenchProgramEligible = student.frenchProgramNonEligReasonCode !== null ? 'No' : 'Yes';
  student.ellProgramEligible = student.ellNonEligReasonCode !== null ? 'No' : 'Yes';
  student.careerProgramEligible = student.careerProgramNonEligReasonCode !== null ? 'No' : 'Yes';
  student.spedProgramEligible = student.specialEducationNonEligReasonCode !== null ? 'No' : 'Yes';
  student.mappedNoOfCourses = student.numberOfCoursesDec !== null ? student.numberOfCoursesDec.toFixed(2) : '0';
  return student;
}

function enrolledProgramMapping(student, enrolledProgramFilter) {
  let enrolledProgramCodesMap = cacheService.getEnrolledProgramCodesMap();
  if(!student.enrolledProgramCodes) {
    return '';
  }
  return student.enrolledProgramCodes
    .match(/.{1,2}/g)
    .filter(programCode => enrolledProgramFilter.includes(programCode))
    .map(programCode => {
      const enrolledProgram = enrolledProgramCodesMap.get(programCode);
      return enrolledProgram ? `${enrolledProgram.description} (${programCode})` : programCode;
    })
    .join(',');
}

function nativeAncestryInd(student) {
  return student.nativeAncestryInd === 'Y' ? 'Yes' : 'No';
}

async function getStudentHeadcounts(req, res) {
  try {
    const params = {
      params: {
        type: req.query.type,
        compare: req.query.compare
      }
    };
    const token = getAccessToken(req);
    let headCounts = await getDataWithParams(token, `${config.get('sdc:schoolCollectionStudentURL')}/headcounts/${req.params.sdcSchoolCollectionID}`, params, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(headCounts);
  } catch (e) {
    log.error('Error getting Student headcount.', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getSdcDistrictCollection(sdcDistrictCollectionID, res, token, correlationID) {
  if (res.locals.requestedSdcDistrictCollection && res.locals.requestedSdcDistrictCollection.sdcDistrictCollectionID === sdcDistrictCollectionID) {
    return res.locals.requestedSdcDistrictCollection;
  }
  return getData(token, `${config.get('sdc:districtCollectionURL')}/${sdcDistrictCollectionID}`, correlationID);
}

async function getSdcSchoolCollection(sdcSchoolCollectionID, res, token, correlationID) {
  if (res.locals.requestedSdcSchoolCollection && res.locals.requestedSdcSchoolCollection.sdcSchoolCollectionID === sdcSchoolCollectionID) {
    return res.locals.requestedSdcSchoolCollection;
  }
  return getData(token, `${config.get('sdc:schoolCollectionURL')}/${sdcSchoolCollectionID}`, correlationID);
}

async function getSdcSchoolCollectionStudent(sdcSchoolCollectionStudentID, res, token, correlationID) {
  if (res.locals.requestedSdcSchoolCollectionStudent && res.locals.requestedSdcSchoolCollectionStudent.sdcSchoolCollectionStudentID === sdcSchoolCollectionStudentID) {
    return res.locals.requestedSdcSchoolCollectionStudent;
  }
  return await getData(token, `${config.get('sdc:schoolCollectionStudentURL')}/${sdcSchoolCollectionStudentID}`, correlationID);
}

/**
 * Returns an object that has the following properties key, value, operation, valueType
 * Helper function when building search params for querying SDC API
 *
 * @param searchParams key value pair of what we are searching for
 */
function createSearchCriteria(searchParams = []) {
  let searchCriteriaList = [];
  let fundingWarningCategories = [
    {
      categoryCode: 'NOPROGFUNDINGHS',
      validationErrors: ['PROGRAMCODEHSLANG', 'PROGRAMCODEHSIND', 'PROGRAMCODEHSSPED']
    },
    {
      categoryCode: 'ZEROCOURSE',
      validationErrors: ['ADULTZEROCOURSEH', 'SCHOOLAGEDZEROCOURSEH']
    },
    {
      categoryCode: 'STUDTOOYOUNG',
      validationErrors: ['AGELESSTHANFIVE']
    },
    {
      categoryCode: 'NOINDIGFUND',
      validationErrors: ['PROGRAMCODEIND']
    },
    {
      categoryCode: 'NOPROGFUNDINGOOP',
      validationErrors: ['ENROLLEDCODEFUNDINGERR', 'ENROLLEDCODEINDERR', 'ENROLLEDCODECAREERERR']
    },
    {
      categoryCode: 'NOFUNDSUPPORT',
      validationErrors: ['SUPPORTFACILITYNA', 'ADULTSUPPORTERR', 'CHANGEME']
    },
    {
      categoryCode: 'NOFUNDGRADADULT',
      validationErrors: ['CHANGEME']
    }
  ];

  Object.keys(searchParams).forEach(function(key) {
    let pValue = searchParams[key];

    if (key === 'studentPen') {
      searchCriteriaList.push({ key: key, operation: FILTER_OPERATION.CONTAINS_IGNORE_CASE, value: pValue, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }
    if (key === 'sdcSchoolCollectionStudentStatusCode') {
      searchCriteriaList.push({ key: key, operation: FILTER_OPERATION.IN, value: pValue, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }
    if (key === 'fundingWarningCategory') {
      let fundingCat = fundingWarningCategories.filter(function(fund) {
        return fund.categoryCode === pValue;
      });
      if (fundingCat) {
        searchCriteriaList.push({ key: 'sdcStudentValidationIssueEntities.validationIssueCode', operation: FILTER_OPERATION.IN, value: fundingCat[0].validationErrors.toString(), valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
      }
    }
  });
  return searchCriteriaList;
}

async function downloadSdcReport(req, res) {
  try {
    let reportType = REPORT_TYPE_CODE_MAP.get(req.params.reportTypeCode);
    if (!reportType) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Invalid report type provided'
      });
    }
    const token = getAccessToken(req);
    let resData =  await getData(token, `${config.get('sdc:rootURL')}/reportGeneration/${req.params.sdcSchoolCollectionID}/${reportType}`);

    if(reportType === 'ALL_STUDENT_SCHOOL_CSV' || reportType === 'ALL_STUDENT_DIS_CSV') {
      res.setHeader('Content-Disposition', 'inline; attachment; filename="allStudents.csv"');
      res.setHeader('Content-Type', 'text/csv');
      let returnedCSV = Buffer.from(resData.documentData, 'base64');
      return res.status(HttpStatus.OK).send(returnedCSV);
    }

    res.setHeader('Content-disposition', 'inline; attachment; filename=gradeEnrollmentFTE.pdf');
    res.setHeader('Content-type', 'application/pdf');
    let returnedPDF = Buffer.from(resData.documentData, 'base64');
    return res.status(HttpStatus.OK).send(returnedPDF);
  } catch (e) {
    log.error('downloadSdcReport Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

function createTabFilter(searchParams) {
  let searchCriteriaList = [];
  let tableKey = 'sdcStudentEnrolledProgramEntities.enrolledProgramCode';

  if (searchParams.label === 'FRENCH_PR') {
    searchCriteriaList.push({ key: tableKey, operation: FILTER_OPERATION.IN, value: '05,08,11,14', valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  }
  if (searchParams.label === 'CAREER_PR') {
    searchCriteriaList.push({ key: tableKey, operation: FILTER_OPERATION.IN, value: '40,41,42,43', valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  }
  if (searchParams.label === 'ELL_PR') {
    searchCriteriaList.push({ key: tableKey, operation: FILTER_OPERATION.IN, value: '17', valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  }
  if(searchParams.label === 'INDSUPPORT_PR') {
    searchCriteriaList.push({ key: 'bandCode', value: null, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
    searchCriteriaList.push({ key: 'nativeAncestryInd', value: 'Y', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
    searchCriteriaList.push({ key: tableKey, operation: FILTER_OPERATION.IN_LEFT_JOIN, value: '29,33,36', valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
  }
  if (searchParams.label === 'SPECIALED_PR') {
    searchCriteriaList.push({ key: 'specialEducationCategoryCode', operation: FILTER_OPERATION.IN, value: 'A,B,C,D,E,F,G,H,K,P,Q,R', valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
  }

  return searchCriteriaList;

}

function createMultiFieldNameSearchCriteria(nameString) {
  const nameParts = nameString.split(/\s+/);
  const fieldNames = [
    'legalFirstName',
    'legalMiddleNames',
    'legalLastName',
    'usualFirstName',
    'usualMiddleNames',
    'usualLastName'
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

function createLocalIdPenSearchCriteria(value) {
  let searchCriteriaList = [];
  searchCriteriaList.push({
    key: 'studentPen',
    operation: FILTER_OPERATION.EQUAL,
    value: value,
    valueType: VALUE_TYPE.STRING,
    condition: CONDITION.OR
  });
  searchCriteriaList.push({
    key: 'localID',
    operation: FILTER_OPERATION.EQUAL,
    value: value,
    valueType: VALUE_TYPE.STRING,
    condition: CONDITION.OR
  });
  return searchCriteriaList;
}

async function getSdcSchoolCollectionMonitoringBySdcDistrictCollectionId(req, res) {
  try {
    const token = getAccessToken(req);
    const data = await getData(token, `${config.get('sdc:districtCollectionURL')}/${res.locals.requestedSdcDistrictCollection.sdcDistrictCollectionID}/monitorSdcSchoolCollections`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('Error retrieving the district collection record', e.stack);
    return handleExceptionResponse(e, res);
  }
}

module.exports = {
  getCollectionBySchoolId,
  uploadFile,
  getSdcFileProgress,
  getSchoolStudentDuplicates,
  removeSDCSchoolCollectionStudents,
  updateSchoolCollection,
  getDistrictCollectionById,
  getSchoolCollectionById,
  getCollectionByDistrictId,
  downloadSdcReport,
  getSDCSchoolCollectionStudentPaginated,
  getSDCSchoolCollectionStudentSummaryCounts,
  getSDCSchoolCollectionStudentDetail,
  updateAndValidateSdcSchoolCollectionStudent,
  deleteSDCSchoolCollectionStudent,
  markSdcSchoolCollectionStudentAsDifferent,
  getStudentHeadcounts,
  getSdcSchoolCollectionMonitoringBySdcDistrictCollectionId
};

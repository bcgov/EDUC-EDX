'use strict';
const { getAccessToken, handleExceptionResponse, getData, postData, putData, getDataWithParams, deleteData, formatNumberOfCourses, stripNumberFormattingNumberOfCourses,
  getCreateOrUpdateUserValue
} = require('./utils');
const { edxUserHasAccessToInstitute } = require('./permissionUtils');
const HttpStatus = require('http-status-codes');
const log = require('./logger');
const config = require('../config');
const { FILTER_OPERATION, VALUE_TYPE, CONDITION, ENROLLED_PROGRAM_TYPE_CODE_MAP, DUPLICATE_TYPE_CODES} = require('../util/constants');
const {createMoreFiltersSearchCriteria} = require('./studentFilters');
const {REPORT_TYPE_CODE_MAP} = require('../util/constants');
const cacheService = require('./cache-service');
const { pick } = require('lodash');
const redisUtil = require('../util/redis/redis-utils');

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
    let createUpdateUser = getCreateOrUpdateUserValue(req);
    const payload = {
      fileContents: req.body.fileContents,
      fileName: req.body.fileName,
      createUser: createUpdateUser,
      updateUser: createUpdateUser
    };
    const token = getAccessToken(req);
    let data;
    if (req.params.sdcSchoolCollectionID){
      data = await postData(token, payload, `${config.get('sdc:rootURL')}/${req.params.sdcSchoolCollectionID}/file`, req.session?.correlationID);
    } else {
      data = await postData(token, payload, `${config.get('sdc:rootURL')}/district/${req.params.sdcDistrictCollectionID}/file`, req.session?.correlationID);
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

async function getDistrictSdcFileProgress(req, res){
  try {
    const token = getAccessToken(req);
    const url = `${config.get('sdc:districtCollectionURL')}/${req.params.sdcDistrictCollectionID}/fileProgress`;
    const data = await getData(token, url, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('getDistrictSdcFileProgress Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function updateDistrictCollection(req, res) {
  try {
    const payload = req.body.districtCollection;
    payload.createDate = null;
    payload.createUser = null;
    payload.updateDate = null;
    payload.updateUser = getCreateOrUpdateUserValue(req);
    payload.sdcDistrictCollectionStatusCode = req.body.status;
    const token = getAccessToken(req);
    const data = await putData(token, payload, `${config.get('sdc:districtCollectionURL')}/${req.params.sdcDistrictCollectionID}`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('Error updating the school collection record', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function updateSchoolCollection(req, res) {
  try {
    const payload = req.body.schoolCollection;
    payload.createDate = null;
    payload.createUser = null;
    payload.updateDate = null;
    payload.updateUser = getCreateOrUpdateUserValue(req);
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

    if (sdcSchoolCollectionStudentData?.numberOfCourses) {
      sdcSchoolCollectionStudentData.numberOfCourses = formatNumberOfCourses(sdcSchoolCollectionStudentData?.numberOfCourses);
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
    payload.updateUser = getCreateOrUpdateUserValue(req);
    
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
    const token = getAccessToken(req);
    let sdcSchoolCollectionStudentID = req.body.sdcSchoolCollectionStudentID;
    let currentStudent = await getData(token, `${config.get('sdc:schoolCollectionStudentURL')}/${sdcSchoolCollectionStudentID}`, req.session?.correlationID);
    if(req.body.updateDate !== currentStudent.updateDate){
      throw new Error(HttpStatus.CONFLICT.toString());
    }
    let studentLock = await redisUtil.lockSdcStudentBeingProcessedInRedis(sdcSchoolCollectionStudentID);

    const payload = req.body;
    payload.createDate = null;
    payload.createUser = null;
    payload.updateDate = null;
    payload.updateUser = getCreateOrUpdateUserValue(req);

    if (payload?.enrolledProgramCodes) {
      payload.enrolledProgramCodes = payload.enrolledProgramCodes.join('');
    }

    if (payload?.numberOfCourses) {
      payload.numberOfCourses = stripNumberFormattingNumberOfCourses(payload.numberOfCourses);
    }

    payload.sdcSchoolCollectionStudentValidationIssues = null;
    payload.sdcSchoolCollectionStudentEnrolledPrograms = null;

    const data = await postData(token, payload, config.get('sdc:schoolCollectionStudentURL'), req.session?.correlationID);
    await redisUtil.unlockSdcStudentBeingProcessedInRedis(studentLock);
    if (data?.enrolledProgramCodes) {
      data.enrolledProgramCodes = data?.enrolledProgramCodes.match(/.{1,2}/g);
    }

    if (data?.numberOfCourses) {
      data.numberOfCourses = formatNumberOfCourses(data?.numberOfCourses);
    }
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    if (e.message === '409' || e.status === '409' || e.status === 409) {
      return res.status(HttpStatus.CONFLICT).json({
        status: HttpStatus.CONFLICT,
        message: 'The student you are attempting to update is already being saved by another user. Please refresh your screen and try again.'
      });
    }
    log.error('Error updating sdc school collection student detail', e.stack);
    return handleExceptionResponse(e, res);
  }

}

async function deleteSDCSchoolCollectionStudent(req, res) {
  try {
    log.info('User :: ' + getCreateOrUpdateUserValue(req) + ' is removing SDC student :: ' + req.params.sdcSchoolCollectionStudentID);
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
    log.info('EDX User :: ' + getCreateOrUpdateUserValue(req) + ' is removing SDC students :: ' + JSON.stringify(req.body));
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
  let homeLanguageSpokenCodesMap = cacheService.getHomeLanguageSpokenCodesMap();

  student.mappedSpedCode = student.specialEducationCategoryCode !== '' && specialEducationCodesMap.get(student.specialEducationCategoryCode) !== undefined ? `${specialEducationCodesMap.get(student.specialEducationCategoryCode)?.description} (${specialEducationCodesMap.get(student.specialEducationCategoryCode)?.specialEducationCategoryCode})` : null;
  student.mappedAncestryIndicator = student.nativeAncestryInd === null ? null : nativeAncestryInd(student);
  student.mappedFrenchEnrolledProgram = enrolledProgramMapping(student, ENROLLED_PROGRAM_TYPE_CODE_MAP.FRENCH_ENROLLED_PROGRAM_CODES);
  student.mappedEllEnrolledProgram = enrolledProgramMapping(student, ENROLLED_PROGRAM_TYPE_CODE_MAP.ENGLISH_ENROLLED_PROGRAM_CODES);
  student.mappedLanguageEnrolledProgram = enrolledProgramMapping(student, [...ENROLLED_PROGRAM_TYPE_CODE_MAP.ENGLISH_ENROLLED_PROGRAM_CODES, ...ENROLLED_PROGRAM_TYPE_CODE_MAP.FRENCH_ENROLLED_PROGRAM_CODES]);
  student.mappedCareerProgram = enrolledProgramMapping(student, ENROLLED_PROGRAM_TYPE_CODE_MAP.CAREER_ENROLLED_PROGRAM_CODES);
  student.mappedIndigenousEnrolledProgram = enrolledProgramMapping(student, ENROLLED_PROGRAM_TYPE_CODE_MAP.INDIGENOUS_ENROLLED_PROGRAM_CODES);
  student.fundingEligibleRefugee = fundingEligibleRefugee(student);
  student.mappedBandCode = student.bandCode !== '' && bandCodesMap.get(student.bandCode) !== undefined ? `${bandCodesMap.get(student.bandCode)?.description} (${bandCodesMap.get(student.bandCode)?.bandCode})` : null;
  student.mappedCareerProgramCode = student.careerProgramCode !== '' && careerProgramCodesMap.get(student.careerProgramCode) !== undefined ? `${careerProgramCodesMap.get(student.careerProgramCode)?.description} (${careerProgramCodesMap.get(student.careerProgramCode)?.careerProgramCode})` : null;
  student.mappedSchoolFunding = student.schoolFundingCode !== '' && schoolFundingCodesMap.get(student.schoolFundingCode) !== undefined ? `${schoolFundingCodesMap.get(student.schoolFundingCode)?.description} (${schoolFundingCodesMap.get(student.schoolFundingCode)?.schoolFundingCode})` : null;
  student.indProgramEligible = student.indigenousSupportProgramNonEligReasonCode !== null ? 'No' : 'Yes';
  student.frenchProgramEligible = student.frenchProgramNonEligReasonCode !== null ? 'No' : 'Yes';
  student.ellProgramEligible = student.ellNonEligReasonCode !== null ? 'No' : 'Yes';
  student.careerProgramEligible = student.careerProgramNonEligReasonCode !== null ? 'No' : 'Yes';
  student.spedProgramEligible = student.specialEducationNonEligReasonCode !== null ? 'No' : 'Yes';
  student.mappedNoOfCourses = student.numberOfCoursesDec ? student.numberOfCoursesDec.toFixed(2) : '0';
  student.mappedHomelanguageCode = student.homeLanguageSpokenCode !== '' && homeLanguageSpokenCodesMap.get(student.homeLanguageSpokenCode) !== undefined ? `${homeLanguageSpokenCodesMap.get(student.homeLanguageSpokenCode)?.description} (${homeLanguageSpokenCodesMap.get(student.homeLanguageSpokenCode)?.homeLanguageSpokenCode})` : null;
  
  return student;
}

function fundingEligibleRefugee(student) {
  const hasIssue = student?.sdcSchoolCollectionStudentValidationIssues?.some(issue => issue.validationIssueCode === 'REFUGEEINPREVCOL');
  return hasIssue ? 'No' : 'Yes';
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

async function getDistrictHeadcounts(req, res) {
  try {
    const params = {
      params: {
        type: req.query.type,
        compare: req.query.compare
      }
    };
    const token = getAccessToken(req);
    let headCounts = await getDataWithParams(token, `${config.get('sdc:rootURL')}/headcounts/${req.params.sdcDistrictCollectionID}`, params, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(headCounts);
  } catch (e) {
    log.error('Error getting District headcount.', e.stack);
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

async function getSdcSchoolCollections(req, res) {
  try {
    const token = getAccessToken(req);

    if (res.locals.requestedSdcDistrictCollection) {
      let url = `${config.get('sdc:districtCollectionURL')}/${res.locals.requestedSdcDistrictCollectionID}/sdcSchoolCollections`;

      let data = await getData(token, url, req.session?.correlationID);
      data?.forEach(value => {
        value.schoolName = getSchoolName(cacheService.getSchoolBySchoolID(value.schoolID));
      });
      return res.status(HttpStatus.OK).json(data);
    } else {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'No Sdc District Collection ID provided.'
      });
    }
  } catch (e) {
    if (e?.response?.status === 404) {
      return res.status(HttpStatus.OK).json(null);
    }
    else {
      log.error('Error getting sdc school collections', e.stack);
      handleExceptionResponse(e, res);
    }
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
    const reportType = REPORT_TYPE_CODE_MAP.get(req.params.reportTypeCode);
    if (!reportType) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Invalid report type provided'
      });
    }

    const token = getAccessToken(req);

    let mincode;
    let collectionId;
    if(req.params.sdcDistrictCollectionID){
      mincode = cacheService.getDistrictByDistrictID(res.locals.requestedSdcDistrictCollection.districtID).districtNumber;
      collectionId = req.params.sdcDistrictCollectionID;
    }else{
      mincode = cacheService.getSchoolBySchoolID(res.locals.requestedSdcSchoolCollection.schoolID).mincode;
      collectionId = req.params.sdcSchoolCollectionID;
    }

    const resData = await getData(token, `${config.get('sdc:rootURL')}/reportGeneration/${collectionId}/${reportType}`);
    const fileDetails = getFileDetails(reportType, mincode);

    setResponseHeaders(res, fileDetails);
    const buffer = Buffer.from(resData.documentData, 'base64');
    return res.status(HttpStatus.OK).send(buffer);
  } catch (e) {
    log.error('downloadSdcReport Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

function getFileDetails(reportType, mincode) {
  const mappings = {
    'ALL_STUDENT_DIS_CSV': { filename: `AllDistrictStudents_${mincode}.csv`, contentType: 'text/csv' },
    'ALL_STUDENT_SCHOOL_CSV': { filename: `AllSchoolStudents_${mincode}.csv`, contentType: 'text/csv' },
    'ELL_HEADCOUNT': { filename: `ELLHeadcount_${mincode}.pdf`, contentType: 'application/pdf' },
    'REFUGEE_HEADCOUNT': { filename: `RefugeeHeadcount_${mincode}.pdf`, contentType: 'application/pdf' },
    'SPECIAL_EDUCATION_HEADCOUNT': { filename: `SpecialEdHeadcount_${mincode}.pdf`, contentType: 'application/pdf' },
    'INDIGENOUS_HEADCOUNT': { filename: `IndigenousHeadcount_${mincode}.pdf`, contentType: 'application/pdf' },
    'BAND_RESIDENCE_HEADCOUNT': { filename: `BandOfResidenceHeadcount_${mincode}.pdf`, contentType: 'application/pdf' },
    'CAREER_HEADCOUNT': { filename: `CareerProgramsHeadcount_${mincode}.pdf`, contentType: 'application/pdf' },
    'FRENCH_HEADCOUNT': { filename: `FrenchProgramsHeadcount_${mincode}_School.pdf`, contentType: 'application/pdf' },
    'DIS_FRENCH_HEADCOUNT': { filename: `FrenchProgramsHeadcount_${mincode}_Dis.pdf`, contentType: 'application/pdf' },
    'DIS_FRENCH_HEADCOUNT_PER_SCHOOL': { filename: `FrenchProgramsHeadcount_${mincode}_DisPerSchool.pdf`, contentType: 'application/pdf' },
    'GRADE_ENROLLMENT_HEADCOUNT': { filename: `GradeEnrollmentHeadcount_${mincode}_School.pdf`, contentType: 'application/pdf' },
    'DIS_GRADE_ENROLLMENT_HEADCOUNT': { filename: `GradeEnrollmentHeadcount_${mincode}_Dis.pdf`, contentType: 'application/pdf' },
    'DIS_GRADE_ENROLLMENT_HEADCOUNT_PER_SCHOOL': { filename: `GradeEnrollmentHeadcount_${mincode}_DisPerSchool.pdf`, contentType: 'application/pdf' },
    'DIS_CAREER_HEADCOUNT': { filename: `CareerProgramsHeadcount_${mincode}_Dis.pdf`, contentType: 'application/pdf' },
    'DIS_CAREER_HEADCOUNT_PER_SCHOOL': { filename: `CareerProgramsHeadcount_${mincode}_DisPerSchool.pdf`, contentType: 'application/pdf' },
    'DEFAULT': { filename: 'download.pdf', contentType: 'application/pdf' }
  };
  return mappings[reportType] || mappings['DEFAULT'];
}

function setResponseHeaders(res, { filename, contentType }) {
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.setHeader('Content-Type', contentType);
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
  if (searchParams.label === 'REFUGEE') {
    searchCriteriaList.push({ key: 'schoolFundingCode', operation: FILTER_OPERATION.IN, value: '16', valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
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

function setDuplicateResponsePayload(req, sdcDuplicates, isProvincialDuplicate = false) {
  const result = {
    enrollmentDuplicates: {
      NON_ALLOW: [],
      ALLOWABLE: [],
      RESOLVED: []
    },
    programDuplicates: {
      NON_ALLOW: [],
      RESOLVED: []
    }
  };
  sdcDuplicates.forEach(sdcDuplicate => {
    const school1 = cacheService.getSchoolBySchoolID(sdcDuplicate.sdcSchoolCollectionStudent1Entity?.schoolID);
    const school2 = cacheService.getSchoolBySchoolID(sdcDuplicate.sdcSchoolCollectionStudent2Entity?.schoolID);

    sdcDuplicate.sdcSchoolCollectionStudent1Entity.schoolName = getSchoolName(school1);
    sdcDuplicate.sdcSchoolCollectionStudent2Entity.schoolName = getSchoolName(school2);
    toTableRow(sdcDuplicate.sdcSchoolCollectionStudent1Entity);
    toTableRow(sdcDuplicate.sdcSchoolCollectionStudent2Entity);

    if (sdcDuplicate?.duplicateTypeCode === DUPLICATE_TYPE_CODES.ENROLLMENT && sdcDuplicate.duplicateResolutionCode) {
      setStudentResolvedMessage(sdcDuplicate);
      result.enrollmentDuplicates.RESOLVED.push(sdcDuplicate);
    }
    else if (sdcDuplicate?.duplicateTypeCode === DUPLICATE_TYPE_CODES.ENROLLMENT) {
      setIfOnlineStudentAndCanChangeGrade(sdcDuplicate, school1, school2);
      setCanMoveToCrossEnrollment(sdcDuplicate);
      result.enrollmentDuplicates[sdcDuplicate.duplicateSeverityCode].push(sdcDuplicate);
    }
    else if (sdcDuplicate?.duplicateTypeCode === DUPLICATE_TYPE_CODES.PROGRAM && sdcDuplicate.duplicateResolutionCode) {
      result.programDuplicates.RESOLVED.push(sdcDuplicate);
    }
    else if (sdcDuplicate?.duplicateTypeCode === DUPLICATE_TYPE_CODES.PROGRAM) {
      setProgramDuplicateTypeMessage(sdcDuplicate);
      result.programDuplicates.NON_ALLOW.push(sdcDuplicate);
    }
    if (isProvincialDuplicate) {
      updateProvincialDuplicateResponse(req, sdcDuplicate, school1, school2);
    }
  });
  return result;
}

async function getInDistrictDuplicates(req, res) {
  try {
    const token = getAccessToken(req);
    let sdcDuplicates = await getData(token, `${config.get('sdc:districtCollectionURL')}/${req.params.sdcDistrictCollectionID}/in-district-duplicates`, req.session?.correlationID);
    res.status(HttpStatus.OK).json(setDuplicateResponsePayload(req, sdcDuplicates));
  } catch (e) {
    log.error('Error retrieving the in district duplicates', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getProvincialDuplicates(req, res) {
  try {
    const token = getAccessToken(req);
    let sdcDuplicates = await getData(token, `${config.get('sdc:districtCollectionURL')}/${req.params.sdcDistrictCollectionID}/provincial-duplicates`, req.session?.correlationID);
    res.status(HttpStatus.OK).json(setDuplicateResponsePayload(req, sdcDuplicates, true));
  } catch (e) {
    log.error('Error retrieving the in district duplicates', e.stack);
    return handleExceptionResponse(e, res);
  }
}

function updateProvincialDuplicateResponse(req, sdcDuplicate, school1, school2) {
  const district1 = cacheService.getDistrictByDistrictID(school1.districtID);
  const district2 = cacheService.getDistrictByDistrictID(school2.districtID);
  sdcDuplicate.sdcSchoolCollectionStudent1Entity.districtName = getDistrictName(district1);
  sdcDuplicate.sdcSchoolCollectionStudent2Entity.districtName = getDistrictName(district2);
  if(!edxUserHasAccessToInstitute(req.session.activeInstituteType, 'SCHOOL', req.session.activeInstituteIdentifier, sdcDuplicate.sdcSchoolCollectionStudent1Entity.schoolID)) {
    sdcDuplicate.sdcSchoolCollectionStudent1Entity = pick(sdcDuplicate.sdcSchoolCollectionStudent1Entity, ['districtName', 'schoolName', 'fte', 'mappedNoOfCourses', 'assignedPen', 'sdcSchoolCollectionID', 'sdcDistrictCollectionID']);
    delete sdcDuplicate.sdcSchoolCollectionStudent1Entity.sdcSchoolCollectionID;
  }
  if(!edxUserHasAccessToInstitute(req.session.activeInstituteType, 'SCHOOL', req.session.activeInstituteIdentifier, sdcDuplicate.sdcSchoolCollectionStudent2Entity.schoolID)) {
    sdcDuplicate.sdcSchoolCollectionStudent2Entity = pick(sdcDuplicate.sdcSchoolCollectionStudent2Entity, ['districtName', 'schoolName', 'fte', 'mappedNoOfCourses', 'assignedPen', 'sdcSchoolCollectionID', 'sdcDistrictCollectionID']);
    delete sdcDuplicate.sdcSchoolCollectionStudent2Entity.sdcSchoolCollectionID;
  }
}

function getDistrictName(district) {
  return district.districtNumber + ' - ' + district.name;
}

function getSchoolName(school) {
  return school.mincode + ' - ' + school.schoolName;
}

function setStudentResolvedMessage(sdcDuplicate) {
  const resolutionCodes = cacheService.getAllDuplicateResolutionCodesMap();
  const retainedId = sdcDuplicate.retainedSdcSchoolCollectionStudentEntity?.sdcSchoolCollectionStudentID;
  if (sdcDuplicate.sdcSchoolCollectionStudent1Entity.sdcSchoolCollectionStudentID === retainedId) {
    sdcDuplicate.sdcSchoolCollectionStudent1Entity.resolution = resolutionCodes.get(sdcDuplicate.duplicateResolutionCode) !== undefined ? resolutionCodes.get(sdcDuplicate.duplicateResolutionCode)?.message : null;
  }
  else if (sdcDuplicate.sdcSchoolCollectionStudent2Entity.sdcSchoolCollectionStudentID === retainedId) {
    sdcDuplicate.sdcSchoolCollectionStudent2Entity.resolution = resolutionCodes.get(sdcDuplicate.duplicateResolutionCode) !== undefined ? resolutionCodes.get(sdcDuplicate.duplicateResolutionCode)?.message : null;
  }
}

function setIfOnlineStudentAndCanChangeGrade(sdcDuplicate, school1, school2) {
  if(['DIST_LEARN', 'DISTONLINE'].includes(school1.facilityTypeCode) && ['08', '09'].includes(sdcDuplicate.sdcSchoolCollectionStudent1Entity.enrolledGradeCode)) {
    sdcDuplicate.sdcSchoolCollectionStudent1Entity.canChangeGrade = true;
  }
  if(['DIST_LEARN', 'DISTONLINE'].includes(school2.facilityTypeCode) && ['08', '09'].includes(sdcDuplicate.sdcSchoolCollectionStudent2Entity.enrolledGradeCode)) {
    sdcDuplicate.sdcSchoolCollectionStudent2Entity.canChangeGrade = true;
  }
}

function setCanMoveToCrossEnrollment(sdcDuplicate) {
  if (['08', '09'].includes(sdcDuplicate.sdcSchoolCollectionStudent1Entity.enrolledGradeCode)) {
    sdcDuplicate.sdcSchoolCollectionStudent1Entity.canMoveToCrossEnrollment = true;
  }
  if (['08', '09'].includes(sdcDuplicate.sdcSchoolCollectionStudent2Entity.enrolledGradeCode)) {
    sdcDuplicate.sdcSchoolCollectionStudent1Entity.canMoveToCrossEnrollment = true;
  }
}

function setProgramDuplicateTypeMessage(sdcDuplicate) {
  const programDuplicateTypeCodes = cacheService.getAllProgramDuplicateTypeCodesMap();
  sdcDuplicate.programDuplicateTypeCodeDescription = programDuplicateTypeCodes.get(sdcDuplicate.programDuplicateTypeCode)?.label;
}

async function unsubmitSdcSchoolCollection(req, res) {
  try {
    const payload = {
      'updateUser': getCreateOrUpdateUserValue(req),
      'sdcSchoolCollectionID': req.params.sdcSchoolCollectionID
    };
    const token = getAccessToken(req);
    const data = await postData(token, payload, `${config.get('sdc:schoolCollectionURL')}/unsubmit`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('Error unsubmitting the school collection record', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function resolveDistrictDuplicates(req, res) {
  try {
    const token = getAccessToken(req);
    let sdcDuplicateID = req.body.duplicate.sdcDuplicateID;
    let currentDuplicate = await getData(token, `${config.get('sdc:schoolCollectionURL')}/duplicate/${sdcDuplicateID}`, req.session?.correlationID);
    if(req.body.duplicate.updateDate !== currentDuplicate.updateDate){
      throw new Error(HttpStatus.CONFLICT.toString());
    }

    let duplicateLock = await redisUtil.lockSdcDuplicateBeingProcessedInRedis(sdcDuplicateID);
    const payload = req.body.students;
    payload.forEach(student => {
      student.createDate = null;
      student.createUser = null;
      student.updateDate = null;
      student.updateUser = 'EDX/' + req.session.edxUserData.edxUserID;

      if (student?.enrolledProgramCodes && Array.isArray(student?.enrolledProgramCodes)) {
        student.enrolledProgramCodes = student.enrolledProgramCodes.join('');
      }

      if (student?.numberOfCourses) {
        student.numberOfCourses = stripNumberFormattingNumberOfCourses(student.numberOfCourses);
      }

      student.sdcSchoolCollectionStudentValidationIssues = null;
      student.sdcSchoolCollectionStudentEnrolledPrograms = null;
    });

    const data = await postData(token, payload, `${config.get('sdc:districtCollectionURL')}/${req.params.sdcDistrictCollectionID}/in-district-duplicates/${req.params.sdcDuplicateID}/type/${req.params.type}`, req.session?.correlationID);
    await redisUtil.unlockSdcDuplicateBeingProcessedInRedis(duplicateLock);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    if (e.message === '409' || e.status === '409' || e.status === 409) {
      return res.status(HttpStatus.CONFLICT).json({
        status: HttpStatus.CONFLICT,
        message: 'The duplicate you are attempting to update is already being saved by another user. Please refresh your screen and try again.'
      });
    }
    log.error('Error resolving district duplicates.', e.stack);
    return handleExceptionResponse(e, res);
  }
}

module.exports = {
  getCollectionBySchoolId,
  uploadFile,
  getSdcFileProgress,
  getDistrictSdcFileProgress,
  getSchoolStudentDuplicates,
  removeSDCSchoolCollectionStudents,
  updateDistrictCollection,
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
  getSdcSchoolCollectionMonitoringBySdcDistrictCollectionId,
  getDistrictHeadcounts,
  getInDistrictDuplicates,
  unsubmitSdcSchoolCollection,
  resolveDistrictDuplicates,
  getSdcSchoolCollections,
  getProvincialDuplicates
};

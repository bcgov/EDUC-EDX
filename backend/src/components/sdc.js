'use strict';
const { getAccessToken, handleExceptionResponse, getData, postData, putData, getDataWithParams, formatNumberOfCourses, stripNumberFormattingNumberOfCourses,
  getCreateOrUpdateUserValue} = require('./utils');
const { edxUserHasAccessToInstitute } = require('./permissionUtils');
const HttpStatus = require('http-status-codes');
const log = require('./logger');
const config = require('../config');
const { FILTER_OPERATION, VALUE_TYPE, CONDITION, ENROLLED_PROGRAM_TYPE_CODE_MAP, DUPLICATE_TYPE_CODES} = require('../util/constants');
const {createMoreFiltersSearchCriteria} = require('./studentFilters');
const {REPORT_TYPE_CODE_MAP} = require('../util/constants');
const cacheService = require('./cache-service');
const redisUtil = require('../util/redis/redis-utils');
const broadcastUtil = require('../socket/broadcast-utils');
const CONSTANTS = require('../util/constants');
const {LocalDate} = require('@js-joda/core');

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
    broadcastUtil.publishSdcEvents(data, CONSTANTS.SDC_UPLOAD_TOPIC);

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

    if(req.query.searchParams?.['tabFilter']) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: createTabFilter(req.query.searchParams['tabFilter'])
      });
    }

    if (req.query.searchParams?.['multiFieldName']) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: createMultiFieldNameSearchCriteria(req.query.searchParams['multiFieldName'])
      });
    }
    if (req.query.searchParams?.['penLocalIdNumber']) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: createLocalIdPenSearchCriteria(req.query.searchParams['penLocalIdNumber'])
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

    let token = getAccessToken(req);    
    
    let collectionData = null;
    if(req.params.sdcDistrictCollectionID) {
      collectionData = await getSdcDistrictCollection(req.params.sdcDistrictCollectionID, res, token, req.session?.correlationID);
    } else if(req.params.sdcSchoolCollectionID) {
      collectionData = await getSdcSchoolCollection(req.params.sdcSchoolCollectionID, res, token, req.session?.correlationID);
    }
    token = getAccessToken(req);        
    let data = await getDataWithParams(token, `${config.get('sdc:schoolCollectionStudentURL')}/paginated`, params, req.session?.correlationID);
    if (req?.query?.returnKey) {
      let result = data?.content.map((student) => student[req?.query?.returnKey]);
      return res.status(HttpStatus.OK).json(result);
    }

    if(req?.query?.tableFormat) {
      data.content = data?.content.map(student => toTableRow(student, collectionData?.collectionTypeCode));
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

    if (payload?.numberOfCourses) {
      payload.numberOfCourses = stripNumberFormattingNumberOfCourses(payload.numberOfCourses);
    }

    const token = getAccessToken(req);
    const data = await postData(token, payload, `${config.get('sdc:sdcDuplicateURL')}/mark-for-review`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('Error updating sdc school collection student detail', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function updateAndValidateSdcSchoolCollectionStudent(req, res) {
  try {
    let studentLock;
    const token = getAccessToken(req);
    if(req.body.sdcSchoolCollectionStudentID) {
      let sdcSchoolCollectionStudentID = req.body.sdcSchoolCollectionStudentID;
      let currentStudent = await getData(token, `${config.get('sdc:schoolCollectionStudentURL')}/${sdcSchoolCollectionStudentID}`, req.session?.correlationID);
      if (req.body.updateDate !== currentStudent.updateDate) {
        throw new Error(HttpStatus.CONFLICT.toString());
      }
      studentLock = await redisUtil.lockSdcStudentBeingProcessedInRedis(sdcSchoolCollectionStudentID);
    }

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
    if(studentLock) {
      await redisUtil.unlockSdcStudentBeingProcessedInRedis(studentLock);
    }
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
    } else if (e.status === 400 && e.data.message === 'SdcSchoolCollectionStudent was not saved to the database because it would create provincial duplicate.') {
      return res.status(HttpStatus.CONFLICT).json({
        status: HttpStatus.CONFLICT,
        message: 'Student was not saved because it would create provincial duplicate.'
      });
    }
    log.error('Error updating sdc school collection student detail', e.stack);
    return handleExceptionResponse(e, res);
  }

}

async function removeSDCSchoolCollectionStudents(req, res) {
  try {
    const token = getAccessToken(req);
    let payload = {
      softDeleteStudentIDs: req.body,
      updateUser: getCreateOrUpdateUserValue(req)
    }
    log.info('EDX User :: ' + getCreateOrUpdateUserValue(req) + ' is removing SDC students :: ' + JSON.stringify(payload));
    let deletedSdcSchoolCollectionStudentData = await postData(token, payload, `${config.get('sdc:schoolCollectionStudentURL')}/soft-delete-students`);
    return res.status(HttpStatus.OK).json(deletedSdcSchoolCollectionStudentData);
  } catch (e) {
    log.error('Error deleting SDC School Collection Students.', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getSchoolStudentDuplicates(req, res) {
  try {
    const token = getAccessToken(req);
    let studentDuplicates = await getData(token, `${config.get('sdc:sdcDuplicateURL')}/sdcSchoolCollection/${req.params.sdcSchoolCollectionID}/duplicates`, req.session?.correlationID);

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

async function getSchoolSdcDuplicates(req, res) {
  try {
    const token = getAccessToken(req);
    let sdcDuplicates = await getData(token, `${config.get('sdc:sdcDuplicateURL')}/sdcSchoolCollection/${req.params.sdcSchoolCollectionID}/sdc-duplicates`, req.session?.correlationID);

    res.status(HttpStatus.OK).json(setDuplicateResponsePayload(req, sdcDuplicates, false, false));
  } catch (e) {
    log.error('Error getting Student duplicates.', e.stack);
    return handleExceptionResponse(e, res);
  }
}

function toTableRow(student, collectionType = null) {
  
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
  student.indProgramEligible = getProgramEligibleValue('IND', student.indigenousSupportProgramNonEligReasonCode, collectionType, student.schoolID);
  student.frenchProgramEligible = getProgramEligibleValue('FRENCH', student.frenchProgramNonEligReasonCode, collectionType, student.schoolID);
  student.ellProgramEligible = getProgramEligibleValue('ELL', student.ellNonEligReasonCode, collectionType, student.schoolID);
  student.careerProgramEligible = getProgramEligibleValue('CAREER', student.careerProgramNonEligReasonCode, collectionType, student.schoolID);
  student.spedProgramEligible = getProgramEligibleValue('SPED',student.specialEducationNonEligReasonCode, collectionType, student.schoolID);
  student.mappedNoOfCourses = student.numberOfCoursesDec ? student.numberOfCoursesDec.toFixed(2) : '0';
  student.mappedHomelanguageCode = student.homeLanguageSpokenCode !== '' && homeLanguageSpokenCodesMap.get(student.homeLanguageSpokenCode) !== undefined ? `${homeLanguageSpokenCodesMap.get(student.homeLanguageSpokenCode)?.description} (${homeLanguageSpokenCodesMap.get(student.homeLanguageSpokenCode)?.homeLanguageSpokenCode})` : null;
  
  return student;
}

function getProgramEligibleValue(type, reasonCode, collectionType, schoolID) {
  let school = cacheService.getSchoolBySchoolID(schoolID); 
  if('JULY' === collectionType) {    
    return 'SUMMER' === school.facilityTypeCode ? ['FRENCH','CAREER'].includes(type) ? 'No' :  reasonCode !== null ? 'No' : 'Yes' : 'No';
  }
  return reasonCode !== null ? 'No' : 'Yes';
}

function fundingEligibleRefugee(student) {
  const hasIssue = student?.sdcSchoolCollectionStudentValidationIssues?.some(issue =>
    issue.validationIssueCode === 'REFUGEEINPREVCOL' || issue.validationIssueCode === 'REFUGEEISADULT'
  );
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
  let fundingWarningCategories = cacheService.getAllStudentValidationIssueCodes();

  Object.keys(searchParams).forEach(function(key) {
    let pValue = searchParams[key];

    if (key === 'studentPen') {
      searchCriteriaList.push({ key: key, operation: FILTER_OPERATION.CONTAINS_IGNORE_CASE, value: pValue, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }
    if (key === 'sdcSchoolCollectionStudentStatusCode') {
      searchCriteriaList.push({ key: key, operation: FILTER_OPERATION.IN, value: pValue, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }
    if (key === 'notSdcSchoolCollectionStudentStatusCode') {
      searchCriteriaList.push({ key: 'sdcSchoolCollectionStudentStatusCode', operation: FILTER_OPERATION.NONE_IN, value: pValue, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }
    if (key === 'fundingWarningCategory') {
      let fundingCat = fundingWarningCategories.filter(function(fund) {
        return fund.validationIssueTypeCode === pValue;
      });
      if (fundingCat) {
        searchCriteriaList.push({ key: 'sdcStudentValidationIssueEntities.validationIssueCode', operation: FILTER_OPERATION.EQUAL, value: fundingCat[0].validationIssueTypeCode, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
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
    let url;
    if(req.params.sdcDistrictCollectionID){
      mincode = cacheService.getDistrictByDistrictID(res.locals.requestedSdcDistrictCollection.districtID).districtNumber;
      url = `${config.get('sdc:rootURL')}/reportGeneration/sdcDistrictCollection/${req.params.sdcDistrictCollectionID}/${reportType}`;
    }else{
      mincode = cacheService.getSchoolBySchoolID(res.locals.requestedSdcSchoolCollection.schoolID).mincode;
      url = `${config.get('sdc:rootURL')}/reportGeneration/sdcSchoolCollection/${req.params.sdcSchoolCollectionID}/${reportType}`;
    }

    const resData = await getData(token, url);
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
    'ALL_STUDENT_ERRORS_WARNS_SCHOOL_CSV': { filename: `AllSchoolStudentsWithErrorsWarns_${mincode}.csv`, contentType: 'text/csv' },
    'ALL_STUDENT_ERRORS_WARNS_DIS_CSV': { filename: `AllDistrictStudentsWithErrorsWarns_${mincode}.csv`, contentType: 'text/csv' },
    'ALL_STUDENT_DIS_CSV': { filename: `AllDistrictStudents_${mincode}.csv`, contentType: 'text/csv' },
    'ALL_STUDENT_SCHOOL_CSV': { filename: `AllSchoolStudents_${mincode}.csv`, contentType: 'text/csv' },
    'ELL_HEADCOUNT': { filename: `ELLHeadcount_School_${mincode}.pdf`, contentType: 'application/pdf' },
    'DIS_ELL_HEADCOUNT': { filename: `ELLHeadcount_District_${mincode}.pdf`, contentType: 'application/pdf' },
    'DIS_ELL_HEADCOUNT_PER_SCHOOL': { filename: `ELLHeadcount_District_${mincode}_PerSchool.pdf`, contentType: 'application/pdf' },
    'DIS_REFUGEE_HEADCOUNT_PER_SCHOOL': { filename: `RefugeeHeadcount_District_${mincode}.pdf`, contentType: 'application/pdf' },
    'SPECIAL_EDUCATION_HEADCOUNT': { filename: `InclusiveEdHeadcount_School_${mincode}.pdf`, contentType: 'application/pdf' },
    'DIS_SPECIAL_EDUCATION_HEADCOUNT': { filename: `InclusiveEdHeadcount_District_${mincode}.pdf`, contentType: 'application/pdf' },
    'DIS_SPECIAL_EDUCATION_HEADCOUNT_PER_SCHOOL': { filename: `InclusiveEdHeadcount_District_${mincode}_PerSchool.pdf`, contentType: 'application/pdf' },
    'DIS_SPECIAL_EDUCATION_HEADCOUNT_CATEGORY_PER_SCHOOL': { filename: `InclusiveEdCategoryHeadcount_District_${mincode}_PerSchool.pdf`, contentType: 'application/pdf' },
    'INDIGENOUS_HEADCOUNT': { filename: `IndigenousHeadcount_School_${mincode}.pdf`, contentType: 'application/pdf' },
    'DIS_INDIGENOUS_HEADCOUNT': { filename: `IndigenousHeadcount_District_${mincode}.pdf`, contentType: 'application/pdf' },
    'DIS_INDIGENOUS_HEADCOUNT_PER_SCHOOL': { filename: `IndigenousHeadcount_District_${mincode}_PerSchool.pdf`, contentType: 'application/pdf' },
    'BAND_RESIDENCE_HEADCOUNT': { filename: `BandOfResidenceHeadcount_School_${mincode}.pdf`, contentType: 'application/pdf' },
    'DIS_BAND_RESIDENCE_HEADCOUNT': { filename: `BandOfResidenceHeadcount_District_${mincode}.pdf`, contentType: 'application/pdf' },
    'DIS_BAND_RESIDENCE_HEADCOUNT_PER_SCHOOL': { filename: `BandOfResidenceHeadcount_District_${mincode}_PerSchool.pdf`, contentType: 'application/pdf' },
    'CAREER_HEADCOUNT': { filename: `CareerProgramsHeadcount_School_${mincode}.pdf`, contentType: 'application/pdf' },
    'FRENCH_HEADCOUNT': { filename: `FrenchProgramsHeadcount_School_${mincode}.pdf`, contentType: 'application/pdf' },
    'DIS_FRENCH_HEADCOUNT': { filename: `FrenchProgramsHeadcount_District_${mincode}.pdf`, contentType: 'application/pdf' },
    'DIS_FRENCH_HEADCOUNT_PER_SCHOOL': { filename: `FrenchProgramsHeadcount_District_${mincode}_PerSchool.pdf`, contentType: 'application/pdf' },
    'GRADE_ENROLLMENT_HEADCOUNT': { filename: `GradeEnrollmentHeadcount_School_${mincode}.pdf`, contentType: 'application/pdf' },
    'DIS_GRADE_ENROLLMENT_HEADCOUNT': { filename: `GradeEnrollmentHeadcount_District_${mincode}.pdf`, contentType: 'application/pdf' },
    'DIS_GRADE_ENROLLMENT_HEADCOUNT_PER_SCHOOL': { filename: `GradeEnrollmentHeadcount_District_${mincode}_PerSchool.pdf`, contentType: 'application/pdf' },
    'DIS_CAREER_HEADCOUNT': { filename: `CareerProgramsHeadcount_District_${mincode}.pdf`, contentType: 'application/pdf' },
    'DIS_CAREER_HEADCOUNT_PER_SCHOOL': { filename: `CareerProgramsHeadcount_District_${mincode}_PerSchool.pdf`, contentType: 'application/pdf' },
    'DIS_ZERO_FTE_SUMMARY': { filename: `Non-FundedStudentsHeadcount_District_${mincode}.pdf`, contentType: 'application/pdf' },
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

async function getStudentDifferencesByInstituteCollectionId(req, res) {
  try {
    const search = [];
    if(res.locals.requestedSdcSchoolCollection) {
      search.push({
        condition: null,
        searchCriteriaList: [{ key: 'sdcSchoolCollection.sdcSchoolCollectionID', value: res.locals.requestedSdcSchoolCollection.sdcSchoolCollectionID, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID }]
      });
    } else if(res.locals.requestedSdcDistrictCollection) {
      search.push({
        condition: null,
        searchCriteriaList: [{ key: 'sdcSchoolCollection.sdcDistrictCollectionID', value: res.locals.requestedSdcDistrictCollection.sdcDistrictCollectionID, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID }]
      });
    }

    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: [{ key: 'originalDemogHash,currentDemogHash', value: 'N/A', operation: FILTER_OPERATION.NOT_EQUAL_OTHER_COLUMN, valueType: VALUE_TYPE.STRING }]
    });

    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: createSearchCriteria(req.query.searchParams)
    });

    if(req.query.searchParams?.['tabFilter']) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: createTabFilter(req.query.searchParams['tabFilter'])
      });
    }

    if (req.query.searchParams?.['multiFieldName']) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: createMultiFieldNameSearchCriteria(req.query.searchParams['multiFieldName'])
      });
    }
    if (req.query.searchParams?.['penLocalIdNumber']) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: createLocalIdPenSearchCriteria(req.query.searchParams['penLocalIdNumber'])
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
        sort: req.query.sort,
        searchCriteriaList: JSON.stringify(search),
      }
    };

    const token = getAccessToken(req);
    let data = await getDataWithParams(token, `${config.get('sdc:rootURL')}/reportGeneration/differences`, params, req.session?.correlationID);

    data = data?.map(pair => ({
      currentStudent: toTableRow(pair.currentStudent),
      originalStudent: toTableRow(pair.originalStudent)
    }));

    data.forEach(difference => {
      difference.currentStudent.schoolName = getSchoolName(cacheService.getSchoolBySchoolID(difference.currentStudent.schoolID));
      difference.originalStudent.type = 'Original';
      difference.currentStudent.type = 'Current';
    });

    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    if (e?.status === 404) {
      res.status(HttpStatus.OK).json(null);
    } else {
      log.error('Error retrieving the district student differences', e.stack);
      return handleExceptionResponse(e, res);
    }
  }
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

function setDuplicateResponsePayload(req, sdcDuplicates, isProvincialDuplicate, isSchoolDuplicate) {
  const result = {
    enrollmentDuplicates: {
      NON_ALLOW: [],
    },
    programDuplicates: {
      NON_ALLOW: [],
    }
  };
  sdcDuplicates?.forEach(sdcDuplicate => {
    const school1 = cacheService.getSchoolBySchoolID(sdcDuplicate.sdcSchoolCollectionStudent1Entity?.schoolID);
    const school2 = cacheService.getSchoolBySchoolID(sdcDuplicate.sdcSchoolCollectionStudent2Entity?.schoolID);

    sdcDuplicate.sdcSchoolCollectionStudent1Entity.schoolName = getSchoolName(school1);
    sdcDuplicate.sdcSchoolCollectionStudent2Entity.schoolName = getSchoolName(school2);
    toTableRow(sdcDuplicate.sdcSchoolCollectionStudent1Entity);
    toTableRow(sdcDuplicate.sdcSchoolCollectionStudent2Entity);

    if (sdcDuplicate?.duplicateTypeCode === DUPLICATE_TYPE_CODES.ENROLLMENT) {
      setIfOnlineStudentAndCanChangeGrade(sdcDuplicate, school1, school2);
      setCanMoveToCrossEnrollment(sdcDuplicate);
      if(sdcDuplicate.duplicateSeverityCode === 'NON_ALLOW') {
        result.enrollmentDuplicates[sdcDuplicate.duplicateSeverityCode].push(sdcDuplicate);
      }
    }
    else if (sdcDuplicate?.duplicateTypeCode === DUPLICATE_TYPE_CODES.PROGRAM) {
      setProgramDuplicateTypeMessage(sdcDuplicate);
      result.programDuplicates.NON_ALLOW.push(sdcDuplicate);
    }
    if (isProvincialDuplicate) {
      updateProvincialDuplicateResponse(req, sdcDuplicate, school1, school2);
    }
    if(isSchoolDuplicate) {
      removeSchoolLinks(sdcDuplicate);
    }
  });
  return result;
}

async function getUserWithSdcRole(req, sdcDuplicates) {
  const token = getAccessToken(req);

  for(let sdcDuplicate of sdcDuplicates) {
    if(sdcDuplicate.duplicateSeverityCode === 'NON_ALLOW' && sdcDuplicate.duplicateTypeCode === 'ENROLLMENT') {
      const school1 = cacheService.getSchoolBySchoolID(sdcDuplicate.sdcSchoolCollectionStudent1Entity?.schoolID);
      const school2 = cacheService.getSchoolBySchoolID(sdcDuplicate.sdcSchoolCollectionStudent2Entity?.schoolID);
      if(!edxUserHasAccessToInstitute(req.session.activeInstituteType, 'SCHOOL', req.session.activeInstituteIdentifier, sdcDuplicate.sdcSchoolCollectionStudent1Entity.schoolID)) {
        let responseEntity1 = await getDataWithParams(token, config.get('edx:edxUsersURL'), {params: {schoolID: sdcDuplicate.sdcSchoolCollectionStudent1Entity.schoolID}}, req.session.correlationID);
        let sdcUser1 = responseEntity1?.find(user => {
          return user?.edxUserSchools.find(school => school?.schoolID === sdcDuplicate?.sdcSchoolCollectionStudent1Entity?.schoolID && school.edxUserSchoolRoles.some(role => role?.edxRoleCode === 'SCHOOL_SDC'));
        });

        if(sdcUser1 !== undefined) {
          let school1Details = await getData(token, `${config.get('institute:rootURL')}/school/${sdcDuplicate.sdcSchoolCollectionStudent1Entity.schoolID}`, req.session?.correlationID);
          sdcDuplicate.sdcSchoolCollectionStudent1Entity.contactInfo = {isSchoolContact: true, phoneNumber: school1Details?.phoneNumber};
        } else {
          let districtDetails = await getData(token, `${config.get('institute:rootURL')}/district/${school1.districtID}`, req.session?.correlationID);
          sdcDuplicate.sdcSchoolCollectionStudent1Entity.contactInfo = {isSchoolContact: false, phoneNumber: districtDetails?.phoneNumber};
        }
      }

      if(!edxUserHasAccessToInstitute(req.session.activeInstituteType, 'SCHOOL', req.session.activeInstituteIdentifier, sdcDuplicate.sdcSchoolCollectionStudent2Entity.schoolID)) {
        let responseEntity2 = await getDataWithParams(token, config.get('edx:edxUsersURL'), {params: {schoolID: sdcDuplicate.sdcSchoolCollectionStudent2Entity.schoolID}}, req.session.correlationID);
        let sdcUser2 = responseEntity2?.find(user => {
          return user?.edxUserSchools.find(school => school?.schoolID === sdcDuplicate?.sdcSchoolCollectionStudent2Entity?.schoolID && school.edxUserSchoolRoles.some(role => role?.edxRoleCode === 'SCHOOL_SDC'));
        });

        if(sdcUser2 !== undefined) {
          let school1Details = await getData(token, `${config.get('institute:rootURL')}/school/${sdcDuplicate.sdcSchoolCollectionStudent1Entity.schoolID}`, req.session?.correlationID);
          sdcDuplicate.sdcSchoolCollectionStudent2Entity.contactInfo = {isSchoolContact: true, phoneNumber: school1Details?.phoneNumber};
        } else {
          let districtDetails = await getData(token, `${config.get('institute:rootURL')}/district/${school2.districtID}`, req.session?.correlationID);
          sdcDuplicate.sdcSchoolCollectionStudent2Entity.contactInfo = {isSchoolContact: false, phoneNumber: districtDetails?.phoneNumber};
        }
      }
    }
  }
  return sdcDuplicates;
}

async function getInDistrictDuplicates(req, res) {
  try {
    const token = getAccessToken(req);
    let sdcDuplicates = await getData(token, `${config.get('sdc:districtCollectionURL')}/${req.params.sdcDistrictCollectionID}/in-district-duplicates`, req.session?.correlationID);
    res.status(HttpStatus.OK).json(setDuplicateResponsePayload(req, sdcDuplicates, false, false));
  } catch (e) {
    log.error('Error retrieving the in district duplicates', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getProvincialDuplicates(req, res) {
  try {
    const token = getAccessToken(req);
    let sdcDuplicates = await getData(token, `${config.get('sdc:districtCollectionURL')}/${req.params.sdcDistrictCollectionID}/provincial-duplicates`, req.session?.correlationID);
    let updatedDupes = await getUserWithSdcRole(req, sdcDuplicates);
    let responseDupe = setDuplicateResponsePayload(req, updatedDupes, true, false);
    res.status(HttpStatus.OK).json(responseDupe);
  } catch (e) {
    log.error('Error retrieving the in district duplicates', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getProvincialDuplicatesForSchool(req, res) {
  try {
    const token = getAccessToken(req);
    let sdcDuplicates = await getData(token, `${config.get('sdc:sdcDuplicateURL')}/sdcSchoolCollection/${req.params.sdcSchoolCollectionID}/provincial-duplicates`, req.session?.correlationID);
    let updatedDupes = await getUserWithSdcRole(req, sdcDuplicates);
    let responseDupe = setDuplicateResponsePayload(req, updatedDupes, true, true);
    res.status(HttpStatus.OK).json(responseDupe);
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
    delete sdcDuplicate.sdcSchoolCollectionStudent1Entity.sdcSchoolCollectionStudentID;
    delete sdcDuplicate.sdcSchoolCollectionStudent1Entity.sdcSchoolCollectionID;
    sdcDuplicate.sdcSchoolCollectionStudent1Entity.showContact = true;
  }

  if(!edxUserHasAccessToInstitute(req.session.activeInstituteType, 'SCHOOL', req.session.activeInstituteIdentifier, sdcDuplicate.sdcSchoolCollectionStudent2Entity.schoolID)) {
    delete sdcDuplicate.sdcSchoolCollectionStudent2Entity.sdcSchoolCollectionStudentID;
    delete sdcDuplicate.sdcSchoolCollectionStudent2Entity.sdcSchoolCollectionID;
    sdcDuplicate.sdcSchoolCollectionStudent2Entity.showContact = true;
  }
  delete sdcDuplicate.retainedSdcSchoolCollectionStudentEntity;
}

function removeSchoolLinks(sdcDuplicate) {
  sdcDuplicate.sdcSchoolCollectionStudent1Entity.schoolNameNoLink = sdcDuplicate.sdcSchoolCollectionStudent1Entity.schoolName;
  sdcDuplicate.sdcSchoolCollectionStudent2Entity.schoolNameNoLink = sdcDuplicate.sdcSchoolCollectionStudent2Entity.schoolName;
  delete sdcDuplicate.sdcSchoolCollectionStudent1Entity.schoolName;
  delete sdcDuplicate.sdcSchoolCollectionStudent2Entity.schoolName;
  return sdcDuplicate;
}

function getDistrictName(district) {
  return district.districtNumber + ' - ' + district.name;
}

function getSchoolName(school) {
  return school.mincode + ' - ' + school.schoolName;
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

async function startFromPriorSeptCollection(req, res) {
  try {
    const payload = {
      'updateUser': getCreateOrUpdateUserValue(req),
      'sdcSchoolCollectionID': req.params.sdcSchoolCollectionID
    };
    const token = getAccessToken(req);
    const data = await postData(token, payload, `${config.get('sdc:schoolCollectionURL')}/priorCollection`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('startFromPriorSeptCollection Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function reportZeroEnrollment(req, res) {
  try {
    const payload = {
      'updateUser': getCreateOrUpdateUserValue(req),
      'sdcSchoolCollectionID': req.params.sdcSchoolCollectionID
    };
    const token = getAccessToken(req);
    const data = await postData(token, payload, `${config.get('sdc:schoolCollectionURL')}/reportZeroEnrollment`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('reportZeroEnrollment Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function resolveDuplicates(req, res) {
  try {
    const token = getAccessToken(req);

    let duplicateLock = await redisUtil.lockSdcDuplicateBeingProcessedInRedis(res.locals.sdcSchoolCollectionStudentsToUpdate.sdcSchoolCollectionStudentID);
    const payload = req.body.students;
    payload.forEach(student => {
      student.createDate = null;
      student.createUser = null;
      student.updateDate = null;

      student.updateUser = getCreateOrUpdateUserValue(req);

      if (student?.enrolledProgramCodes && Array.isArray(student?.enrolledProgramCodes)) {
        student.enrolledProgramCodes = student.enrolledProgramCodes.join('');
      }

      if (student?.numberOfCourses) {
        student.numberOfCourses = stripNumberFormattingNumberOfCourses(student.numberOfCourses);
      }

      student.sdcSchoolCollectionStudentValidationIssues = null;
      student.sdcSchoolCollectionStudentEnrolledPrograms = null;
    });

    const data = await postData(token, payload, `${config.get('sdc:sdcDuplicateURL')}/type/${req.params.type}`, req.session?.correlationID);
    await redisUtil.unlockSdcDuplicateBeingProcessedInRedis(duplicateLock);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('Error resolving district duplicates.', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getStudentValidationIssueCodes(req, res) {
  try {
    const token = getAccessToken(req);
    let studentValidationIssueCodes = await getData(token, `${config.get('sdc:schoolCollectionURL')}/${req.params.sdcSchoolCollectionID}/student-validation-issue-codes`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(studentValidationIssueCodes);
  } catch (e) {
    log.error('Error getting Student validation issue codes.', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function submitDistrictSignature(req, res) {
  try {
    const token = getAccessToken(req);
    let signatureLock = await redisUtil.lockSdcDistrictWhileSignatureIsBeingProcessedInRedis(req.params.sdcDistrictCollectionID);

    const payload = await getSdcDistrictCollection(req.params.sdcDistrictCollectionID, res, token, req.session?.correlationID);
    let signatures = Array.from(payload?.submissionSignatures);

    const newSignature = {
      districtSignatoryRole: req.body.districtSignatoryRole,
      sdcDistrictCollectionID: req.params.sdcDistrictCollectionID,
      districtSignatoryUserID: getCreateOrUpdateUserValue(req),
      updateUser: getCreateOrUpdateUserValue(req),
      signatureDate: null,
      updateDate: null,
      createUser: null,
      createDate: null
    };

    signatures.push(newSignature);
    payload.submissionSignatures = signatures;

    const data = await postData(token, payload, `${config.get('sdc:districtCollectionURL')}/${req.params.sdcDistrictCollectionID}/sign-off`, req.session?.correlationID);
    await redisUtil.unlockSdcDistrictWhileSignatureIsBeingProcessedInRedis(signatureLock);

    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('Error submitting district signature for sign-off', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getSdcSchoolCollectionPaginated(req, res) {
  try {
    const token = getAccessToken(req);
    const search = [];
    search.push({
      condition: null,
      searchCriteriaList: [{ key: 'schoolID', value: res.locals.requestedInstituteIdentifier, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID }]
    });

    addHistoricCollectionSearchCriteria(search, req);

    const params = {
      params: {
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
        sort: JSON.stringify(req.query.sort),
        searchCriteriaList: JSON.stringify(search),
      }
    };

    let data = await getDataWithParams(token, `${config.get('sdc:schoolCollectionURL')}/paginated`, params, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    if (e?.status === 404) {
      res.status(HttpStatus.OK).json(null);
    } else {
      log.error('Error getting collection paginated list', e.stack);
      return handleExceptionResponse(e, res);
    }
  }
}

function addHistoricCollectionSearchCriteria(search, req) {
  search.push({
    condition: CONDITION.AND,
    searchCriteriaList: [{ key: 'collectionEntity.collectionStatusCode', value: 'COMPLETED', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING }]
  });

  if(req.query.searchParams?.['collectionType']) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: [{ key: 'collectionEntity.collectionTypeCode', value: req.query.searchParams?.['collectionType'], operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING }]
    });
  }

  if(req.query.searchParams?.['year']) {
    const yearStart = LocalDate.of(req.query.searchParams?.['year'], 1, 1);
    const yearEnd = LocalDate.of(req.query.searchParams?.['year'], 12, 31);
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: [{ key: 'collectionEntity.submissionDueDate', value: `${yearStart},${yearEnd}`, operation: FILTER_OPERATION.BETWEEN, valueType: VALUE_TYPE.DATE }]
    });
  }
}

async function getSdcDistrictCollectionPaginated(req, res) {
  try {
    const token = getAccessToken(req);
    const search = [];
    search.push({
      condition: null,
      searchCriteriaList: [{ key: 'districtID', value: res.locals.requestedInstituteIdentifier, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID }]
    });

    addHistoricCollectionSearchCriteria(search, req);

    const params = {
      params: {
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
        sort: JSON.stringify(req.query.sort),
        searchCriteriaList: JSON.stringify(search),
      }
    };

    let data = await getDataWithParams(token, `${config.get('sdc:districtCollectionURL')}/paginated`, params, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    if (e?.status === 404) {
      res.status(HttpStatus.OK).json(null);
    } else {
      log.error('Error getting collection paginated list', e.stack);
      return handleExceptionResponse(e, res);
    }
  }
}

module.exports = {
  getCollectionBySchoolId,
  uploadFile,
  reportZeroEnrollment,
  getSdcFileProgress,
  getDistrictSdcFileProgress,
  getSchoolStudentDuplicates,
  getSchoolSdcDuplicates,
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
  markSdcSchoolCollectionStudentAsDifferent,
  getStudentHeadcounts,
  getSdcSchoolCollectionMonitoringBySdcDistrictCollectionId,
  getDistrictHeadcounts,
  getInDistrictDuplicates,
  unsubmitSdcSchoolCollection,
  resolveDuplicates,
  getSdcSchoolCollections,
  getProvincialDuplicates,
  getProvincialDuplicatesForSchool,
  getStudentValidationIssueCodes,
  submitDistrictSignature,
  getStudentDifferencesByInstituteCollectionId,
  getSdcDistrictCollectionPaginated,
  getSdcSchoolCollectionPaginated,
  startFromPriorSeptCollection
};

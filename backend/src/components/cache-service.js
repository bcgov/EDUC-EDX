'use strict';
const config = require('../config/index');
const log = require('../components/logger');
const {getApiCredentials} = require('../components/auth');
const {getData} = require('../components/utils');
const retry = require('async-retry');
const {generateSchoolObject, isSchoolActive} = require('./schoolUtils');
const {generateDistrictObject, isDistrictActive,generateAuthorityObject,isAuthorityActive} = require('./districtUtils');
const {LocalDate, DateTimeFormatter} = require('@js-joda/core');
const constants = require('../util/constants');

let staffDistrictPermissions = ['EDX_DISTRICT_VIEW', 'EDX_SCHOOL_VIEW', 'DIS_SDC_EDIT', 'DIS_SDC_VIEW', 'SCH_SDC_EDIT', 'SCH_SDC_VIEW'];
let staffSchoolPermissions = ['EDX_SCHOOL_VIEW', 'SCH_SDC_EDIT', 'SCH_SDC_VIEW'];
let schoolMap = new Map();
let schools = [];
let districts = [];
let districtsMap = new Map();
let districtsNumber_ID_Map = new Map();
let mincode_school_ID_Map = new Map();
let activeSchools = [];
let activeDistricts = [];
let activeAuthorities = [];
let authorities = [];
let authoritiesMap = new Map();
let bandCodesMap = new Map();
let enrolledProgramCodesMap = new Map();
let careerProgramCodesMap = new Map();
let programDuplicateTypeCodesMap = new Map();
let schoolFundingCodesMap = new Map();
let schoolCollectionStatusCodesMap = new Map();
let specialEducationCodesMap = new Map();
let homeLanguageSpokenCodesMap = new Map();
let rolePermissionsMap = new Map();
let documentTypeCodesMap = new Map();
let documentTypeCodes = [];
const cachedData = {};

const cacheService = {

  async loadAllSchoolsToMap() {
    log.debug('Loading all schoolsMap');
    await retry(async () => {
      // if anything throws, we retry
      const data = await getApiCredentials(); // get the tokens first to make api calls.
      const schoolsResponse = await getData(data.accessToken, `${config.get('institute:rootURL')}/school`);
      schools = []; // reset the value.
      schoolMap.clear();// reset the value.
      mincode_school_ID_Map.clear();
      activeSchools = [];
      if (schoolsResponse && schoolsResponse.length > 0) {
        for (const school of schoolsResponse) {
          const schoolObject = generateSchoolObject(school);
          schoolMap.set(schoolObject.schoolID, schoolObject);
          mincode_school_ID_Map.set(schoolObject.mincode, schoolObject.schoolID);
          schools.push(schoolObject);
          if (isSchoolActive(schoolObject)) {
            activeSchools.push(schoolObject);
          }
        }
      }
      log.info(`Loaded ${schoolMap.size} schools.`);
      log.info(`Loaded ${activeSchools.length} active schools.`);
    }, {
      retries: 50
    });
  },
  getAllSchoolsJSON() {
    return schools;
  },
  getSchoolBySchoolID(schoolID) {
    return schoolMap.get(schoolID);
  },
  getDistrictByDistrictID(districtID) {
    return districtsMap.get(districtID);
  },
  getAllActiveSchoolsJSON() {
    return activeSchools;
  },
  async loadAllAuthoritiesToMap() {
    log.debug('Loading all authorities during start up');
    await retry(async () => {
      const data = await getApiCredentials();
      const authoritiesResponse = await getData(data.accessToken, `${config.get('institute:rootURL')}/authority`);
      // reset the value.
      authorities = [];
      activeAuthorities = [];
      authoritiesMap.clear();
      if (authoritiesResponse && authoritiesResponse.length > 0) {
        for (const authority of authoritiesResponse) {
          const authorityData = generateAuthorityObject(authority);
          authoritiesMap.set(authority.independentAuthorityId, authorityData);
          authorities.push(authorityData);
          if(isAuthorityActive(authorityData)){
            activeAuthorities.push(authorityData);
          }
        }
      }
      log.info(`Loaded ${authoritiesMap.size} authorities.`);
      log.info(`Loaded ${activeAuthorities.length} active authorities.`);
    }, {
      retries: 50
    });

  },
  getAllActiveAuthoritiesJSON(){
    return activeAuthorities;
  },
  getAllAuthoritiesJSON() {
    return authorities;
  },
  getAllStaffSchoolPermissions() {
    return staffSchoolPermissions;
  },
  getAllStaffDistrictPermissions() {
    return staffDistrictPermissions;
  },
  getPermissionsForRole(role) {
    return rolePermissionsMap.get(role);
  },
  async loadAllRolePermissionsToMap() {
    log.debug('Loading all role permissions during start up');
    await retry(async () => {
      // if anything throws, we retry
      const data = await getApiCredentials(); // get the tokens first to make api calls.
      const roles = await getData(data.accessToken, `${config.get('edx:edxRolePermissionsURL')}`);
      rolePermissionsMap.clear();// reset the value.
      if (roles && roles.length > 0) {
        for (const role of roles) {
          rolePermissionsMap.set(`${role.edxRoleCode}`, role.edxRolePermissions.map(perm => {
            return perm.edxPermissionCode;
          }));
        }
      }
      log.info(`Loaded ${rolePermissionsMap.size} roles.`);
    }, {
      retries: 50
    });
  },
  async loadAllDistrictsToMap() {
    log.debug('Loading all districtsMap');
    await retry(async () => {
      const data = await getApiCredentials();
      const districtsResponse = await getData(data.accessToken, `${config.get('institute:rootURL')}/district`);
      // reset the value.
      districts = [];
      activeDistricts = [];
      districtsMap.clear();
      districtsNumber_ID_Map.clear();
      if (districtsResponse && districtsResponse.length > 0) {
        for (const district of districtsResponse) {
          const districtData = generateDistrictObject(district);
          districtsMap.set(district.districtId, districtData);
          districtsNumber_ID_Map.set(district.districtNumber, district.districtId);
          districts.push(districtData);
          if(isDistrictActive(districtData)){
            activeDistricts.push(districtData);
          }
        }
      }
      log.info(`loaded ${districtsMap.size} districts.`);
      log.info(`loaded ${activeDistricts.length} active districts.`);
    }, {
      retries: 50
    });

  },
  getAllDistrictsJSON() {
    return districts;
  },
  getAllActiveDistrictsJSON(){
    return activeDistricts;
  },
  getAuthorityJSONByAuthorityID(authorityID) {
    return authoritiesMap.get(authorityID);
  },
  getDistrictJSONByDistrictID(districtID) {
    return districtsMap.get(districtID);
  },
  getDistrictIdByDistrictNumber(districtNumber) {
    return districtsNumber_ID_Map.get(districtNumber);
  },
  getSchoolIdByMincode(mincode) {
    return mincode_school_ID_Map.get(mincode);
  },
  async loadAllDocumentTypeCodesToMap() {
    log.debug('Loading all document type codes during start up');
    await retry(async () => {
      // if anything throws, we retry
      const data = await getApiCredentials(); // get the tokens first to make api calls.
      const documentTypeCodesList = await getData(data.accessToken, `${config.get('edx:exchangeURL')}/document-types`);
      documentTypeCodes = []; // reset the value.
      documentTypeCodesMap.clear();// reset the value.
      if (documentTypeCodesList && documentTypeCodesList.length > 0) {
        for (const documentTypeCode of documentTypeCodesList) {
          const docTypeCode = {
            secureExchangeDocumentTypeCode: documentTypeCode.secureExchangeDocumentTypeCode,
            label: documentTypeCode.label,
            description: documentTypeCode.description,
            effectiveDate: documentTypeCode.effectiveDate,
            expiryDate: documentTypeCode.expiryDate,
          };
          documentTypeCodesMap.set(documentTypeCode.secureExchangeDocumentTypeCode, docTypeCode);
          documentTypeCodes.push(docTypeCode);
        }
      }
      log.info(`Loaded ${documentTypeCodesMap.size} document type codes.`);
    }, {
      retries: 50
    });
  },
  getDocumentTypeCodeLabelByCode(code) {
    return documentTypeCodesMap.get(code);
  },
  isActiveRecord(record) {
    const currentTime = LocalDate.now();
    const openedDate = record?.effectiveDate;
    const closedDate = record?.expiryDate;
    return !(!record || !openedDate || currentTime.isBefore(LocalDate.parse(openedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME)) || (closedDate && currentTime.isAfter(LocalDate.parse(closedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME))));
  },
  async loadDataToCache(cacheKey,url){
    log.debug(` loading all ${cacheKey} during start up`);
    await retry(async () => {
      const tokenData = await getApiCredentials();
      const responseData = await getData(tokenData.accessToken, config.get(url));
      // reset the value.
      const records = [];
      const activeRecords = [];
      if (responseData && responseData.length > 0) {
        for (const data of responseData) {
          records.push(data);
          if(this.isActiveRecord(data)){
            activeRecords.push(data);
          }
        }
        cachedData[`${cacheKey}`]={
          'activeRecords':activeRecords,
          'records':records
        };
      }
      log.info(`Loaded ${responseData.length} ${cacheKey} types.`);
    }, {
      retries: 50
    });
  },
  getCachedData(){
    return cachedData;
  },
  getAllActiveBandCodesMap() {
    let bandCodesRaw = cachedData[constants.CACHE_KEYS.SDC_BAND_CODES].activeRecords;
    let bandCodes = bandCodesRaw.map(item => {
      return {...item, dropdownText: `${item.description} (${item.bandCode})`};
    });

    bandCodes.unshift({'bandCode': '', 'dropdownText': 'No Band Code'});
    bandCodes.forEach(bandCode => {
      bandCodesMap.set(bandCode.bandCode, bandCode);
    });
    return bandCodesMap;
  },
  getActiveCareerProgramCodesMap() {
    let careerProgramCodesRaw = cachedData[constants.CACHE_KEYS.SDC_CAREER_PROGRAM_CODES].activeRecords;
    let careerProgramCodes = careerProgramCodesRaw.map(item => {
      return {...item, dropdownText: `${item.description} (${item.careerProgramCode})`};
    });
    careerProgramCodes.unshift({'careerProgramCode': '', 'dropdownText': 'No Career Code'});
    careerProgramCodes.forEach(careerProgramCode => {
      careerProgramCodesMap.set(careerProgramCode.careerProgramCode, careerProgramCode);
    });
    return careerProgramCodesMap;
  },
  getHomeLanguageSpokenCodesMap() {
    let homeLanguageSpokenCodeList = cachedData[constants.CACHE_KEYS.SDC_HOME_LANGUAGE_SPOKEN_CODES].activeRecords;
    let homeLanguageSpokenCodes = homeLanguageSpokenCodeList.map(item => {
      return {...item, dropdownText: `${item.description} (${item.homeLanguageSpokenCode})`};
    });
    homeLanguageSpokenCodes.unshift({'homeLanguageSpokenCode': null, 'dropdownText': 'No Home Language Code'});
    homeLanguageSpokenCodes.forEach(homeLanguageSpokenCode => {
      homeLanguageSpokenCodesMap.set(homeLanguageSpokenCode.homeLanguageSpokenCode, homeLanguageSpokenCode);
    });
    return homeLanguageSpokenCodesMap;
  },
  getAllProgramDuplicateTypeCodesMap() {
    let programDuplicateTypeCodes = cachedData[constants.CACHE_KEYS.SDC_PROGRAM_DUPLICATE_TYPE_CODES].records;
    programDuplicateTypeCodes.forEach(programDuplicateTypeCode => {
      programDuplicateTypeCodesMap.set(programDuplicateTypeCode.programDuplicateTypeCode, programDuplicateTypeCode);
    });
    return programDuplicateTypeCodesMap;
  },
  getEnrolledProgramCodesMap() {
    let enrolledProgramCodesRaw = cachedData[constants.CACHE_KEYS.SDC_ENROLLED_PROGRAM_CODES].activeRecords;
    let enrolledProgramCodes = enrolledProgramCodesRaw.map(item => {
      return {...item, dropdownText: `${item.description} (${item.enrolledProgramCode})`};
    });
    enrolledProgramCodes.forEach(enrolledProgramCode => {
      enrolledProgramCodesMap.set(enrolledProgramCode.enrolledProgramCode, enrolledProgramCode);
    });
    return enrolledProgramCodesMap;
  },
  getActiveSchoolFundingCodesMap() {
    let schoolFundingCodesRaw = cachedData[constants.CACHE_KEYS.SDC_SCHOOL_FUNDING_CODES].activeRecords;
    let schoolFundingCodes = schoolFundingCodesRaw.map(item => {
      return {...item, dropdownText: `${item.description} (${item.schoolFundingCode})`};
    });
    schoolFundingCodes.unshift({'schoolFundingCode': '', 'dropdownText': 'No Funding Code'});
    schoolFundingCodes.forEach(schoolFundingCode => {
      schoolFundingCodesMap.set(schoolFundingCode.schoolFundingCode, schoolFundingCode);
    });
    return schoolFundingCodesMap;
  },
  getActiveSpecialEducationCodesMap() {
    let specialEducationCodesRaw = cachedData[constants.CACHE_KEYS.SDC_SPECIAL_ED_CODES].activeRecords;
    let specialEducationCodes = specialEducationCodesRaw.map(item => {
      return {...item, dropdownText: `${item.description} (${item.specialEducationCategoryCode})`};
    });
    specialEducationCodesMap = new Map();
    specialEducationCodes.unshift({'specialEducationCategoryCode': '', 'dropdownText': 'No Inclusive Ed Category Code'});
    specialEducationCodes.forEach(specialEducationCategoryCode => {
      specialEducationCodesMap.set(specialEducationCategoryCode.specialEducationCategoryCode, specialEducationCategoryCode);
    });
    return specialEducationCodesMap;
  },
  getActiveSchoolCollectionStatusCodesMap(){
    let schoolCollectionStatusCodesRaw = cachedData[constants.CACHE_KEYS.SDC_SCHOOL_COLLECTION_STATUS_CODES].records;
    let schoolCollectionStatusCodes = schoolCollectionStatusCodesRaw.map(item => {
      return {...item, dropdownText:`${item.label}`};
    });
    schoolCollectionStatusCodes.forEach((statusCode => {
      schoolCollectionStatusCodesMap.set(statusCode, statusCode.label);
    }));
    return schoolCollectionStatusCodesMap;
  },
  getActiveEnrolledGradeCodes() {
    return cachedData[constants.CACHE_KEYS.SDC_ENROLLED_GRADE_CODES].activeRecords;
  },
  getActiveSchoolFundingCodes() {
    return cachedData[constants.CACHE_KEYS.SDC_SCHOOL_FUNDING_CODES].activeRecords;
  },
  getActiveCareerProgramCodes() {
    return cachedData[constants.CACHE_KEYS.SDC_CAREER_PROGRAM_CODES].activeRecords;
  },
  getActiveEnrolledProgramCodes() {
    return cachedData[constants.CACHE_KEYS.SDC_ENROLLED_PROGRAM_CODES].activeRecords;
  },
  getActiveSpecialEducationCodes() {
    return cachedData[constants.CACHE_KEYS.SDC_SPECIAL_ED_CODES].activeRecords;
  },
  getAllStudentValidationIssueCodes() {
    return cachedData[constants.CACHE_KEYS.SDC_VALIDATION_ISSUE_TYPE_CODES].records;
  }
};

module.exports = cacheService;

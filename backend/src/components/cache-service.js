'use strict';
const config = require('../config/index');
const log = require('../components/logger');
const {getApiCredentials} = require('../components/auth');
const {getData} = require('../components/utils');
const retry = require('async-retry');
const {generateMincodeSchool, isSchoolActive} = require('./schoolUtils');

let mincodeSchoolMap = new Map();
let mincodeSchools = [];
let districts = [];
let districtsMap = new Map();
let districtsNumber_Id_Map = new Map();
let mincode_school_id_Map = new Map();
let activeMincodeSchools = [];
let rolePermissionsMap = new Map();
let documentTypeCodesMap = new Map();
let documentTypeCodes = [];

const cacheService = {

  async loadAllSchoolsToMap() {
    log.debug('Loading all schools during start up');
    await retry(async () => {
      // if anything throws, we retry
      const data = await getApiCredentials(); // get the tokens first to make api calls.
      const schools = await getData(data.accessToken, `${config.get('school:apiEndpoint')}`);
      mincodeSchools = []; // reset the value.
      mincodeSchoolMap.clear();// reset the value.
      mincode_school_id_Map.clear();
      if (schools && schools.length > 0) {
        for (const school of schools) {
          const mincodeSchool = generateMincodeSchool(school);
          mincodeSchoolMap.set(mincodeSchool.mincode, mincodeSchool);
          mincode_school_id_Map.set(mincodeSchool.mincode, mincodeSchool.schoolId);
          mincodeSchools.push(mincodeSchool);
          if (isSchoolActive(mincodeSchool)) {
            activeMincodeSchools.push(mincodeSchool);
          }
        }
      }
      log.info(`Loaded ${mincodeSchoolMap.size} schools.`);
      log.info(`Loaded ${activeMincodeSchools.length} active schools.`);
    }, {
      retries: 50
    });
  },
  getAllSchoolsJSON() {
    return mincodeSchools;
  },
  getSchoolNameJSONByMincode(mincode) {
    return mincodeSchoolMap.get(mincode);
  },
  getAllActiveSchoolsJSON() {
    return activeMincodeSchools;
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
    log.debug('loading all districts during start up');
    await retry(async () => {
      const data = await getApiCredentials();
      const districtsResponse = await getData(data.accessToken, `${config.get('server:instituteAPIURL')}/district`);
      // reset the value.
      districts = [];
      districtsMap.clear();
      districtsNumber_Id_Map.clear();
      if (districtsResponse && districtsResponse.length > 0) {
        for (const district of districtsResponse) {
          const districtData = {
            districtId: district.districtId,
            districtNumber: district.districtNumber,
            name: district.displayName,
            districtRegionCode: district.districtRegionCode,
            districtStatusCode: district.districtStatusCode,
          };
          districtsMap.set(district.districtId, districtData);
          districtsNumber_Id_Map.set(district.districtNumber, district.districtId);
          districts.push(districtData);
        }
      }
      log.info(`loaded ${districtsMap.size} districts.`);
    }, {
      retries: 50
    });

  },
  getAllDistrictsJSON() {
    return districts;
  },
  getDistrictJSONByDistrictId(districtId) {
    return districtsMap.get(districtId);
  },
  getDistrictIdByDistrictNumber(districtNumber) {
    return districtsNumber_Id_Map.get(districtNumber);
  },
  getSchoolIdByMincode(mincode) {
    return mincode_school_id_Map.get(mincode);
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
  getAllDocumentTypeCodesJSON() {
    return documentTypeCodes;
  },
  getDocumentTypeCodeLabelByCode(code) {
    return documentTypeCodesMap.get(code);
  }
};

module.exports = cacheService;

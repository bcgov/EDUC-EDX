//revert comment remove me after
'use strict';
const config = require('../config/index');
const log = require('../components/logger');
const {getApiCredentials} = require('../components/auth');
const {getData} = require('../components/utils');
const retry = require('async-retry');

let mincodeSchoolMap = new Map();
let mincodeSchools = [];
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
      if (schools && schools.length > 0) {
        for (const school of schools) {
          const mincodeSchool = {
            mincode: `${school.distNo}${school.schlNo}`,
            schoolName: school.schoolName,
            effectiveDate: school.dateOpened,
            expiryDate: school.dateClosed,
          };
          mincodeSchoolMap.set(`${school.distNo}${school.schlNo}`, mincodeSchool);
          mincodeSchools.push(mincodeSchool);
        }
      }
      log.info(`Loaded ${mincodeSchoolMap.size} schools.`);
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
          rolePermissionsMap.set(`${role.edxRoleCode}`, role.edxRolePermissions.map(perm => {return perm.edxPermissionCode;}));
        }
      }
      log.info(`Loaded ${rolePermissionsMap.size} roles.`);
    }, {
      retries: 50
    });
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

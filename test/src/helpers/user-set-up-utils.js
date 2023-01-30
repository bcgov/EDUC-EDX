import EdxUserSchool from '../model/EdxUserSchool';

const {getToken} = require('./oauth-utils');
const {getSchoolIDBySchoolCode, getDistrictIdByDistrictNumber} = require('../services/institute-api-service');
const {getAllEdxUserRoleForInstitute, getEdxUserFromFirstNameLastName} = require('../services/edx-api-service');


const constants = require('../config/constants');
const restUtils = require('./rest-utils');
import EdxUser from '../model/EdxUser';
import EdxUserSchoolRole from '../model/EdxUserSchoolRole';
import EdxUserDistrict from '../model/EdxUserDistrict';
import EdxUserDistrictRole from '../model/EdxUserDistrictRole';


const userSetUpUtils = {

  async setUpEdxUserWithAllAvailableRoles(schoolCodes, districtNumbers) {
    await userSetUpUtils.deleteSetUpEdxUser();
    const data = await getToken();
    const token = data.access_token;
    const schoolIDs = await userSetUpUtils.getInstituteIds('SCHOOL', schoolCodes);
    const districtIDs = await userSetUpUtils.getInstituteIds('DISTRICT', districtNumbers);
    const schoolRoles = await getAllEdxUserRoleForInstitute(token, 'SCHOOL');
    const districtRoles = await getAllEdxUserRoleForInstitute(token, 'DISTRICT');
    return await userSetUpUtils.createEdxUserObject(token, constants.credentials.adminCredentials.digitalID, schoolIDs, schoolRoles, districtIDs, districtRoles);

  },

  async setUpEdxSchoolUserWithAllAvailableRoles(schoolCodes) {
    await userSetUpUtils.deleteSetUpEdxUser();
    const data = await getToken();
    const token = data.access_token;
    const instituteIDs = await userSetUpUtils.getInstituteIds('SCHOOL', schoolCodes);
    const roles = await getAllEdxUserRoleForInstitute(token, 'SCHOOL');
    return await userSetUpUtils.createEdxUserObject(token, constants.credentials.adminCredentials.digitalID, instituteIDs, roles, '', '');
  },

  async setUpEdxDistrictUserWithAllAvailableRoles(districtNumbers) {
    await userSetUpUtils.deleteSetUpEdxUser();
    const data = await getToken();
    const token = data.access_token;
    const instituteIDs = await userSetUpUtils.getInstituteIds('DISTRICT', districtNumbers);
    const roles = await getAllEdxUserRoleForInstitute(token, 'DISTRICT');
    return await userSetUpUtils.createEdxUserObject(token, constants.credentials.adminCredentials.digitalID, '', '', instituteIDs, roles);
  },

  async setUpEdxDistrictUserWithSpecificDigitalUserIdAndAllAvailableRoles(digitalUserID, districtNumbers) {
    const data = await getToken();
    const token = data.access_token;
    const instituteIDs = await userSetUpUtils.getInstituteIds('DISTRICT', districtNumbers);
    const roles = await getAllEdxUserRoleForInstitute(token, 'DISTRICT');
    return await userSetUpUtils.createEdxUserObject(token, digitalUserID, '', '', instituteIDs, roles);
  },

  async setUpEdxSchoolUserWithSpecificSchoolUserIdAndAllAvailableRoles(schoolUserID, schoolCodes) {
    const data = await getToken();
    const token = data.access_token;
    const instituteIDs = await userSetUpUtils.getInstituteIds('SCHOOL', schoolCodes);
    const roles = await getAllEdxUserRoleForInstitute(token, 'SCHOOL');
    return await userSetUpUtils.createEdxUserObject(token, schoolUserID, instituteIDs, roles, '', '');
  },

  async getInstituteIds(instituteTypeCode, instituteCodes) {
    let instituteIds = [];
    if (instituteTypeCode.toString().toUpperCase() === 'SCHOOL') {
      for (const schoolCode of instituteCodes) {
        instituteIds.push(await getSchoolIDBySchoolCode(schoolCode));
      }
    } else if (instituteTypeCode.toString().toUpperCase() === 'DISTRICT') {
      for (const districtNumber of instituteCodes) {
        instituteIds.push(await getDistrictIdByDistrictNumber(districtNumber));
      }
    }
    return instituteIds;
  },

  async createEdxUserObject(token, digitalId, schoolIDs, schoolRoles, districtIDs, districtRoles) {
    const edxUser = new EdxUser();
    edxUser.email = 'edx-noreply@gov.bc.ca';
    edxUser.firstName = 'TESTAUTOMATIONUSERFIRSTNAME';
    edxUser.lastName = 'TESTAUTOMATIONUSERLASTNAME';
    edxUser.digitalIdentityID = digitalId;
    edxUser.createUser = 'Test-automation';
    edxUser.updateUser = 'Test-automation';
    await userSetUpUtils.createEdxUserSchoolWithRoles(edxUser, schoolIDs, schoolRoles);
    await userSetUpUtils.createEdxUserDistrictWithRoles(edxUser, districtIDs, districtRoles);
    const url = `${constants.edx_api_base_url}api/v1/edx/users`;
    return await restUtils.postData(token, url, edxUser);
  },
  async createEdxUserSchoolWithRoles(edxUser, schoolIDs, schoolRoles) {
    if (schoolIDs.length > 0 && schoolRoles.length > 0) {
      const edxUserSchools = [];
      for (const schoolID of schoolIDs) {
        const edxUserSchool = new EdxUserSchool();
        for (const schoolRole of schoolRoles) {
          const edxSchoolRole = new EdxUserSchoolRole();
          edxSchoolRole.edxRoleCode = schoolRole.edxRoleCode;
          edxSchoolRole.createUser = 'Test-automation';
          edxSchoolRole.updateUser = 'Test-automation';
          edxUserSchool.addEdxUserSchoolRoles(edxSchoolRole);
        }
        edxUserSchool.schoolID = schoolID;
        edxUserSchool.createUser = 'Test-automation';
        edxUserSchool.updateUser = 'Test-automation';
        edxUserSchools.push(edxUserSchool);
      }
      edxUser.setEdxUserSchools(edxUserSchools);
    }
  },

  async createEdxUserDistrictWithRoles(edxUser, districtIDs, districtRoles) {
    if (districtIDs.length > 0 && districtRoles.length > 0) {
      const edxUserDistricts = [];
      for (const districtID of districtIDs) {
        const edxUserDistrict = new EdxUserDistrict();
        for (const districtRole of districtRoles) {
          const edxUserDistrictRole = new EdxUserDistrictRole();
          edxUserDistrictRole.edxRoleCode = districtRole.edxRoleCode;
          edxUserDistrictRole.createUser = 'Test-automation';
          edxUserDistrictRole.updateUser = 'Test-automation';
          edxUserDistrict.addEdxUserDistrictRoles(edxUserDistrictRole);
        }
        edxUserDistrict.districtID = districtID;
        edxUserDistrict.createUser = 'Test-automation';
        edxUserDistrict.updateUser = 'Test-automation';
        edxUserDistricts.push(edxUserDistrict);
      }
      edxUser.setEdxUserDistricts(edxUserDistricts);
    }
  },

  async deleteSetUpEdxUser() {
    const data = await getToken();
    const token = data.access_token;
    const edxUser = await getEdxUserFromFirstNameLastName(token, 'TESTAUTOMATIONUSERFIRSTNAME', 'TESTAUTOMATIONUSERLASTNAME');
    if (!edxUser) {
      return;
    }
    const url = `${constants.edx_api_base_url}api/v1/edx/users/${edxUser?.edxUserID}`;
    await restUtils.deleteData(token, url);
  },

  async deleteSpecificEdxUser(edxUserID) {
    const data = await getToken();
    const token = data.access_token;
    const url = `${constants.edx_api_base_url}api/v1/edx/users/${edxUserID}`;
    await restUtils.deleteData(token, url);
  }

};

module.exports = userSetUpUtils;

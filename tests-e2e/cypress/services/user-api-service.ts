import {RestUtils} from '../helpers/rest-utils-ts';
import {EdxUser} from '../model/EdxUser';
import {EdxUserSchool} from '../model/EdxUserSchool';
import {EdxUserDistrict} from '../model/EdxUserDistrict';
import {EdxUserRole} from '../model/EdxUserRole';
import {EdxApiService} from './edx-api-service';
import {InstituteApiService} from './institute-api-service';

export class UserApiService {

  config: Cypress.PluginConfigOptions;
  restUtils: RestUtils;
  edxApi: EdxApiService;
  instituteApi: InstituteApiService;

  constructor(conf: any) {
    this.config = conf;
    this.restUtils = new RestUtils(this.config);
    this.edxApi = new EdxApiService(this.config);
    this.instituteApi = new InstituteApiService(this.config);
  }

  async deleteSetUpEdxUser() {
    const edxUser = await this.edxApi.getEdxUserFromFirstNameLastName('TESTAUTOMATIONUSERFIRSTNAME', 'TESTAUTOMATIONUSERLASTNAME');
    if (!edxUser) {
      return;
    }
    const url = `${this.config.env.edx.base_url}/api/v1/edx/users/${edxUser?.edxUserID}`;
    await this.restUtils.deleteData(url);
  }

  async getInstituteIds(instituteTypeCode: string, instituteCodes: string[]) {
    let instituteIds: string[] = [];
    if (instituteTypeCode.toString().toUpperCase() === 'SCHOOL') {
      for (const schoolCode of instituteCodes) {
        instituteIds.push(await this.instituteApi.getSchoolIDBySchoolCode(schoolCode));
      }
    } else if (instituteTypeCode.toString().toUpperCase() === 'DISTRICT') {
      for (const districtNumber of instituteCodes) {
        const districtId = await this.instituteApi.getDistrictIdByDistrictNumber(districtNumber);
        if (districtId === undefined) {
          console.log(`Failed to find district ID for district number ${districtNumber}`);
          continue;
        }
        instituteIds.push(districtId);
      }
    }
    return instituteIds;
  }

  async getAllEdxUserRoleForInstitute() {
    return this.edxApi.getAllEdxUserRoleForInstitute('SCHOOL');
  }

  async createEdxUserObject(digitalId: string, schoolIDs: any, schoolRoles: any, districtIDs: any, districtRoles: any) {
    let edxUser: EdxUser = {
      email: 'edx-noreply@gov.bc.ca',
      firstName: 'TESTAUTOMATIONUSERFIRSTNAME',
      lastName: 'TESTAUTOMATIONUSERLASTNAME',
      digitalIdentityID: digitalId,
      createUser: 'Test-automation',
      updateUser: 'Test-automation',
    }

    if (schoolIDs.length > 0) {
      edxUser.edxUserSchools = await this.createEdxUserSchoolWithRoles(schoolIDs, schoolRoles);
    }

    if (districtIDs.length > 0) {
      edxUser.edxUserDistricts = await this.createEdxUserDistrictWithRoles(districtIDs, districtRoles);
    }

    const url = `${this.config.env.edx.base_url}/api/v1/edx/users`;
    return await this.restUtils.postData(url, edxUser);
  }

  async createEdxUserSchoolWithRoles(schoolIDs: string[], schoolRoles: any) {
    if (schoolIDs.length > 0 && schoolRoles.length > 0) {
      const edxUserSchools: EdxUserSchool[] = [];
      const edxUserSchoolRoles = [];
      for (const schoolID of schoolIDs) {
        for (const schoolRole of schoolRoles) {
          const edxSchoolRole: EdxUserRole = {
            edxRoleCode: schoolRole.edxRoleCode,
            createUser: 'Test-automation',
            updateUser: 'Test-automation'
          }
          edxUserSchoolRoles.push(edxSchoolRole);
        }
        let edxUserSchool: EdxUserSchool = {
          schoolID: schoolID,
          createUser: 'Test-automation',
          updateUser: 'Test-automation',
          edxUserSchoolRoles: edxUserSchoolRoles
        };
        edxUserSchools.push(edxUserSchool);
      }
      return edxUserSchools;
    }
  }

  async createEdxUserDistrictWithRoles(districtIDs: string[], districtRoles: string[]) {
    if (districtIDs.length > 0 && districtRoles.length > 0) {
      const edxUserDistricts: EdxUserDistrict[] = [];
      const edxUserDistrictRoles = [];
      for (const districtID of districtIDs) {
        for (const districtRole of districtRoles) {
          const edxDistrictRole: EdxUserRole = {
            edxRoleCode: districtRole,
            createUser: 'Test-automation',
            updateUser: 'Test-automation'
          }
          edxUserDistrictRoles.push(edxDistrictRole);
        }
        let edxUserDistrict: EdxUserDistrict = {
          districtID: districtID,
          createUser: 'Test-automation',
          updateUser: 'Test-automation',
          edxUserDistrictRoles: edxUserDistrictRoles
        };
        edxUserDistricts.push(edxUserDistrict);
      }
      return edxUserDistricts;
    }
  }
}

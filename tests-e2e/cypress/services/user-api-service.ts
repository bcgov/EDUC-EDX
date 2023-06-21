import {RestUtils} from '../helpers/rest-utils-ts';
import {EdxApiService} from './edx-api-service';
import {InstituteApiService} from './institute-api-service';

type EdxUserPayload = {
  email: string,
  firstName: string,
  lastName: string,
  digitalIdentityID: string,
  createUser: string,
  updateUser: string,
}

type EdxUserRolePayload = {
  edxRoleCode: string;
  createUser: string
  updateUser: string,
}

type EdxUserSchoolPayload = {
  schoolID: string;
  edxUserID: string;
  createUser: string;
  updateUser: string;
  edxUserSchoolRoles: EdxUserRolePayload[]
}

type EdxUserDistrictPayload = {
  districtID: string;
  edxUserID: string;
  createUser: string;
  updateUser: string;
  edxUserDistrictRoles: EdxUserRolePayload[]
}

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

  async refreshEdxUser(digitalId: string) {
    const edxUser = await this.edxApi.getEdxUserWithDigitalId(digitalId);
    if (!edxUser) {
      console.log('edxUser not found - creating new user');
      const newEdxUser: EdxUserPayload = {
        email: 'edx-noreply@gov.bc.ca',
        firstName: 'TESTAUTOMATIONUSERFIRSTNAME',
        lastName: 'TESTAUTOMATIONUSERLASTNAME',
        digitalIdentityID: digitalId,
        createUser: 'Test-automation',
        updateUser: 'Test-automation',
      };
      let createdEdxUser = await this.restUtils.postData<EdxUserEntity>(`${this.config.env.edx.base_url}/api/v1/edx/users`, newEdxUser);
      return createdEdxUser;
    }

    console.log('edxUser found - removing existing roles');

    if (edxUser.edxUserSchools) {
      for (let each of edxUser.edxUserSchools) {
        await this.restUtils.deleteData(`${this.config.env.edx.base_url}/api/v1/edx/users/${edxUser.edxUserID}/school/${each.edxUserSchoolID}`);
      }
    }

    if (edxUser.edxUserDistricts) {
      for (let each of edxUser.edxUserDistricts) {
        await this.restUtils.deleteData(`${this.config.env.edx.base_url}/api/v1/edx/users/${edxUser.edxUserID}/district/${each.edxUserDistrictID}`);
      }
    }

    console.log('existing roles for edxUser removed');
    return edxUser;
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

  async createEdxInstituteUserWithRoles(schoolIDs: any, schoolRoles: any, districtIDs: any, districtRoles: any, edxUserID: string) {

    if (schoolIDs.length > 0) {
      return await this.createEdxUserSchoolWithRoles(schoolIDs, schoolRoles, edxUserID);
    }

    if (districtIDs.length > 0) {
      return await this.createEdxUserDistrictWithRoles(districtIDs, districtRoles, edxUserID);
    }

  }

  async createEdxUserSchoolWithRoles(schoolIDs: string[], schoolRoles: any[], edxUserID: string) {
    if (schoolIDs.length > 0 && schoolRoles.length > 0) {
      const edxUserSchoolRoles: EdxUserRolePayload[] = [];
      for (const schoolID of schoolIDs) {
        console.log(`creating edxUserSchool with ${schoolRoles.length} roles`);
        for (const schoolRole of schoolRoles) {
          const edxSchoolRole: EdxUserRolePayload = {
            edxRoleCode: schoolRole.edxRoleCode,
            createUser: 'Test-automation',
            updateUser: 'Test-automation'
          }
          edxUserSchoolRoles.push(edxSchoolRole);
        }
        let edxUserSchool: EdxUserSchoolPayload = {
          schoolID: schoolID,
          edxUserID: edxUserID,
          createUser: 'Test-automation',
          updateUser: 'Test-automation',
          edxUserSchoolRoles: edxUserSchoolRoles
        };

        return await this.restUtils.postData(`${this.config.env.edx.base_url}/api/v1/edx/users/${edxUserID}/school`, edxUserSchool);
      }
    }
  }

  async createEdxUserDistrictWithRoles(districtIDs: string[], districtRoles: string[], edxUserID: string) {
    if (districtIDs.length > 0 && districtRoles.length > 0) {
      const edxUserDistrictRoles: EdxUserRolePayload[] = [];
      for (const districtID of districtIDs) {
        console.log(`creating edxUserDistrict with ${districtRoles.length} roles`);
        for (const districtRole of districtRoles) {
          const edxDistrictRole = {
            edxRoleCode: districtRole,
            createUser: 'Test-automation',
            updateUser: 'Test-automation'
          }
          edxUserDistrictRoles.push(edxDistrictRole);
        }
        let edxUserDistrict: EdxUserDistrictPayload = {
          districtID: districtID,
          edxUserID: edxUserID,
          createUser: 'Test-automation',
          updateUser: 'Test-automation',
          edxUserDistrictRoles: edxUserDistrictRoles
        };

        return await this.restUtils.postData(`${this.config.env.edx.base_url}/api/v1/edx/users/${edxUserID}/district`, edxUserDistrict);
      }
    }
  }
}

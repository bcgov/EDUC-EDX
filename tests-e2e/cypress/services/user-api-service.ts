import {RestUtils} from "../helpers/rest-utils-ts";
import { EdxUser } from "../model/EdxUser";
import { EdxUserSchool } from "../model/EdxUserSchool";
import { EdxUserSchoolRole } from "../model/EdxUserSchoolRole";
import {EdxApiService} from "../services/edx-api-service";
import {InstituteApiService} from "./institute-api-service";

export class UserApiService {

    config: any;
    restUtils: any;
    edxApi: any;
    instituteApi: any;
  
    constructor(conf: any) {
      this.config = conf;
      this.restUtils = new RestUtils(this.config);
      this.edxApi = new EdxApiService(this.config);
      this.instituteApi =  new InstituteApiService(this.config);
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
        let instituteIds = [];
        if (instituteTypeCode.toString().toUpperCase() === 'SCHOOL') {
        for (const schoolCode of instituteCodes) {
            instituteIds.push(await this.instituteApi.getSchoolIDBySchoolCode(schoolCode));
        }
        } else if (instituteTypeCode.toString().toUpperCase() === 'DISTRICT') {
        for (const districtNumber of instituteCodes) {
            instituteIds.push(await this.instituteApi.getDistrictIdByDistrictNumber(districtNumber));
        }
        }
        return instituteIds;
    }

    async getAllEdxUserRoleForInstitute() {
        return this.edxApi.getAllEdxUserRoleForInstitute('SCHOOL');
    }

    async createEdxUserObject(digitalId: string, schoolIDs: any, schoolRoles: any, districtIDs: any, districtRoles: any) {
        const userSchools = await this.createEdxUserSchoolWithRoles(schoolIDs, schoolRoles);
        let edxUser: EdxUser =  {
            email: 'edx-noreply@gov.bc.ca',
            firstName: 'TESTAUTOMATIONUSERFIRSTNAME',
            lastName: 'TESTAUTOMATIONUSERLASTNAME',
            digitalIdentityID: digitalId,
            createUser: 'Test-automation',
            updateUser: 'Test-automation',
            edxUserSchools: userSchools
        }
        
        
        // await this.createEdxUserDistrictWithRoles(edxUser, districtIDs, districtRoles);
        const url = `${this.config.env.edx.base_url}/api/v1/edx/users`;
        return await this.restUtils.postData(url, edxUser);
      }

      async createEdxUserSchoolWithRoles(schoolIDs: any, schoolRoles: any) {
        if (schoolIDs.length > 0 && schoolRoles.length > 0) {
          const edxUserSchools: EdxUserSchool[] = [];
          const edxUserSchoolRoles = [];
          for (const schoolID of schoolIDs) {
            for (const schoolRole of schoolRoles) {
              const edxSchoolRole :EdxUserSchoolRole = {
                edxRoleCode: schoolRole.edxRoleCode,
                createUser: 'Test-automation',
                updateUser: 'Test-automation'
              }
              edxUserSchoolRoles.push(edxSchoolRole);
            }
            let edxUserSchool : EdxUserSchool = {
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
}
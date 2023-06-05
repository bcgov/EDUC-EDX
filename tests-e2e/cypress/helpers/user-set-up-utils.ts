import {UserApiService} from "../services/user-api-service";

export class UserSetupUtils {

    config: Cypress.PluginConfigOptions;
    userApi: UserApiService;

    constructor(config: Cypress.PluginConfigOptions) {
        this.config = config;
        this.userApi = new UserApiService(config);
    }

    async setupSchoolUser(schoolCodes: string[]) {
        let edxUserID = await this.userApi.refreshEdxUser(this.config.env.adminCredential.digitalID);
        const instituteIDs = await this.userApi.getInstituteIds('SCHOOL', schoolCodes);
        const roles = await this.userApi.getAllEdxUserRoleForInstitute();
        return await this.userApi.createEdxInstituteUserWithRoles(instituteIDs, roles, '', '', edxUserID);
    }

    async setupDistrictUser(districtUserOptions: DistrictUserOptions) {
        let edxUserID = await this.userApi.refreshEdxUser(this.config.env.adminCredential.digitalID);
        const districtIDs = await this.userApi.getInstituteIds('DISTRICT', districtUserOptions.districtCodes);
        return await this.userApi.createEdxInstituteUserWithRoles('', '', districtIDs, districtUserOptions.districtRoles, edxUserID);
    }

}

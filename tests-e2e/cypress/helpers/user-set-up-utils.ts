import {UserApiService} from "../services/user-api-service";

export class UserSetupUtils {

    config: Cypress.PluginConfigOptions;
    userApi: UserApiService;

    constructor(config: Cypress.PluginConfigOptions) {
        this.config = config;
        this.userApi = new UserApiService(config);
    }

    async setupSchoolUser(schoolCodes: string[]) {
        await this.userApi.deleteSetUpEdxUser();
        const instituteIDs = await this.userApi.getInstituteIds('SCHOOL', schoolCodes);
        const roles = await this.userApi.getAllEdxUserRoleForInstitute();
        return await this.userApi.createEdxUserObject(this.config.env.adminCredential.digitalID, instituteIDs, roles, '', '');
    }

    async setupDistrictUser(districtUserOptions: DistrictUserOptions) {
        await this.userApi.deleteSetUpEdxUser();
        const districtIDs = await this.userApi.getInstituteIds('DISTRICT', districtUserOptions.districtCodes);
        return await this.userApi.createEdxUserObject(this.config.env.adminCredential.digitalID, '', '', districtIDs, districtUserOptions.districtRoles);
    }

    async deleteSetUpEdxUser() {
        return await this.userApi.deleteSetUpEdxUser();
    }

}

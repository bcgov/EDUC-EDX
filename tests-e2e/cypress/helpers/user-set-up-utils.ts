import {UserApiService} from "../services/user-api-service";

export class UserSetupUtils {

    config: Cypress.PluginConfigOptions;
    userApi: any;

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

    async deleteSetUpEdxUser() {
        return await this.userApi.deleteSetUpEdxUser();
    }

}

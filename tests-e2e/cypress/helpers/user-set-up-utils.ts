import {UserApiService} from "../services/user-api-service";

export class UserSetupUtils {

    config: Cypress.PluginConfigOptions;
    userApi: UserApiService;

    constructor(config: Cypress.PluginConfigOptions) {
        this.config = config;
        this.userApi = new UserApiService(config);
    }

    async setupSchoolUser(schoolUserOptions: SchoolUserOptions) {
        const digitalId = schoolUserOptions.digitalId || this.config.env.adminCredential.digitalID as string;
        const edxUser = await this.userApi.refreshEdxUser(digitalId);
        const instituteIDs = await this.userApi.getInstituteIds('SCHOOL', schoolUserOptions.schoolCodes);
        const roles = await this.userApi.getAllEdxUserRoleForInstitute();
        await this.userApi.createEdxInstituteUserWithRoles(instituteIDs, roles, '', '', edxUser.edxUserID);
        return edxUser;
    }

    async setupDistrictUser(districtUserOptions: DistrictUserOptions) {
        const digitalId = districtUserOptions.digitalId || this.config.env.adminCredential.digitalID as string;
        const edxUser = await this.userApi.refreshEdxUser(digitalId);
        const districtIDs = await this.userApi.getInstituteIds('DISTRICT', districtUserOptions.districtCodes);
        await this.userApi
            .createEdxInstituteUserWithRoles('', '', districtIDs, districtUserOptions.districtRoles, edxUser.edxUserID);
        return edxUser;
    }

}

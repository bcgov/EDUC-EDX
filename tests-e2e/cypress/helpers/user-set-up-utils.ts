import {UserApiService} from "../services/user-api-service";
import {EdxApiService, EdxUserActivationFixture} from "../services/edx-api-service";

export class UserSetupUtils {

    config: Cypress.PluginConfigOptions;
    userApi: UserApiService;
    edxApi: EdxApiService;

    constructor(config: Cypress.PluginConfigOptions) {
        this.config = config;
        this.userApi = new UserApiService(config);
        this.edxApi = new EdxApiService(config);
    }

    async setupSchoolUser(schoolUserOptions: SchoolUserOptions) {
        const digitalId = schoolUserOptions.digitalId || this.config.env.adminCredential.digitalID as string;
        const edxUser = await this.userApi.refreshEdxUser(digitalId);
        const instituteIDs = await this.userApi.getInstituteIds('SCHOOL', schoolUserOptions.schoolCodes);
        let roles = await this.userApi.getAllEdxUserRoleForInstitute();
        if (schoolUserOptions.schoolRoles) { // @ts-ignore
            roles = roles.filter(role => schoolUserOptions.schoolRoles.includes(role.edxRoleCode));}
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

    async setupEdxUser(userActivationOptions: UserActivationOptions): Promise<EdxUserActivationFixture> {
        const digitalId: string = this.config.env.adminCredential.digitalID as string;
        const [refreshedEdxUser, setUpDataEdxUser] = await Promise.all([
            // Promise all is used since we want to refresh the existing user data and then create a new user
            this.userApi.refreshEdxUser(digitalId),
            this.edxApi.setUpDataForUserActivation(userActivationOptions)
        ]);
        const edxUser: EdxUserActivationFixture = setUpDataEdxUser;
        return edxUser;
    }
}

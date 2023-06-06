import {
    InstituteApiService,
    InstituteOptions,
    SchoolContactPayload,
    SchoolOptions
} from "../services/institute-api-service";
import {EdxApiService} from "../services/edx-api-service";

export class InstituteSetupUtils {

    config: Cypress.PluginConfigOptions;
    instituteApi: InstituteApiService;
    edxApi: EdxApiService;

    constructor(conf: Cypress.PluginConfigOptions) {
        this.config = conf;
        this.instituteApi = new InstituteApiService(this.config);
        this.edxApi = new EdxApiService(this.config);
    }

    async setupInstituteEntities({ districtOptions = {}, schoolOptions = {} }: InstituteOptions) {
        console.log('setupInstituteEntities started');
        await this.instituteApi.createAuthorityWithContactToTest();
        let district = await this.instituteApi.createDistrictWithContactToTest(districtOptions);
        let school = await this.instituteApi.createSchoolWithContactToTest(district.districtId, schoolOptions);
        await this.edxApi.verifyInstituteActivationCodes(district.districtId, school.schoolId);
        console.log('setupInstituteEntities completed')
        return {
            district: district,
            school: school
        }
    };

    async recreateSchool(schoolOptions: SchoolOptions) {
        let districtID = await this.instituteApi.getDistrictIdOfTestDistrict();
        if (districtID === undefined) {
            return;
        }
        return await this.instituteApi.createSchoolWithContactToTest(districtID, schoolOptions);
    }

    async addContactToSchool(school: SchoolEntity, contact: SchoolContactPayload) {
        console.log('addContactToSchool called.');
        let newContact = await this.instituteApi.setupSchoolContact(school, contact);
        console.log('addContactToSchool completed.');
        return newContact;
    }

    async clearSchoolContacts(school: SchoolEntity) {
        console.log('clearSchoolContacts called.');
        await this.instituteApi.clearSchoolContacts(school);
        console.log('clearSchoolContacts completed.');
    }

}

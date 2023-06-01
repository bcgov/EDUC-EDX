import {InstituteApiService, SchoolContactPayload} from "../services/institute-api-service";
import {EdxApiService} from "../services/edx-api-service";

export interface InstituteSetupOptions {
    includeDistrictAddress?: boolean;
    includeSchoolAddress?: boolean;
    includeTombstoneValues?: boolean;
    includeSchoolContact?: boolean;
}

export class InstituteSetupUtils {

    config: Cypress.PluginConfigOptions;
    instituteApi: InstituteApiService;
    edxApi: EdxApiService;

    constructor(conf: Cypress.PluginConfigOptions) {
        this.config = conf;
        this.instituteApi = new InstituteApiService(this.config);
        this.edxApi = new EdxApiService(this.config);
    }

    async setupInstituteEntities({
        includeDistrictAddress = true,
        includeSchoolAddress = true,
        includeTombstoneValues = true,
        includeSchoolContact = true
    }: InstituteSetupOptions = {}) {
        console.log('setupInstituteEntities started');
        await this.instituteApi.createAuthorityWithContactToTest();
        let district = await this.instituteApi.createDistrictWithContactToTest({includeDistrictAddress});
        let school = await this.instituteApi.createSchoolWithContactToTest(district.districtId, {
            includeSchoolAddress,
            includeTombstoneValues,
            includeSchoolContact
        });
        await this.edxApi.verifyInstituteActivationCodes(district.districtId, school.schoolId);
        console.log('setupInstituteEntities completed')
        return {
            district: district,
            school: school
        }
    };

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

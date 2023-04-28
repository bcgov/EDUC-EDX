import {InstituteApiService} from "../services/institute-api-service";
import {EdxApiService} from "../services/edx-api-service";

export class InstituteSetupUtils {

    config: any;
    instituteApi: any;
    edxApi: any;

    constructor(conf: any) {
        this.config = conf;
        this.instituteApi = new InstituteApiService(this.config);
        this.edxApi = new EdxApiService(this.config);
    }

    async setupInstituteEntities({
                                     includeDistrictAddress = true,
                                     includeSchoolAddress = true,
                                     includeTombstoneValues = true,
                                     includeSchoolContact = true
                                 } = {}) {
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

    async addContactToSchool(school: any, contact: any) {
        console.log('addContactToSchool called.');
        let newContact = await this.instituteApi.setupSchoolContact(school, contact);
        console.log('addContactToSchool completed.');
        return newContact;
    }

    async clearSchoolContacts(school: any) {
        console.log('clearSchoolContacts called.');
        await this.instituteApi.clearSchoolContacts(school);
        console.log('clearSchoolContacts completed.');
    }

}

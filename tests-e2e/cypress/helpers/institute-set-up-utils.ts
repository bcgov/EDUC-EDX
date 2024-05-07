import {
  InstituteApiService,
  InstituteOptions,
  SchoolContactPayload,
  SchoolOptions
} from '../services/institute-api-service';
import {EdxApiService} from '../services/edx-api-service';

export class InstituteSetupUtils {

  config: Cypress.PluginConfigOptions;
  instituteApi: InstituteApiService;
  edxApi: EdxApiService;

  constructor(conf: Cypress.PluginConfigOptions) {
    this.config = conf;
    this.instituteApi = new InstituteApiService(this.config);
    this.edxApi = new EdxApiService(this.config);
  }

  async setupInstituteEntities({ districtOptions = {}, schoolOptions = [{}] }: InstituteOptions) {
    console.log('setupInstituteEntities started');
    await this.instituteApi.createAuthorityWithContactToTest();
    const district = await this.instituteApi.createDistrictWithContactToTest(districtOptions);
    const schoolPromises = schoolOptions.map(async (schoolOption) => {
      return this.instituteApi.createSchoolWithContactToTest(district.districtId, schoolOption);
    });

    const schoolResponses = await Promise.all(schoolPromises);

    districtOptions?.withPrimaryActivationCode ?
      await this.edxApi.verifyDistrictActivationCodes(district.districtId) :
      await this.edxApi.deletePrimaryActivationCode('DISTRICT', district.districtId);

    const activationCodePromises = schoolResponses.map(async (schoolResponse, index) => {
      if (schoolOptions[index]?.withPrimaryActivationCode) {
        return this.edxApi.verifySchoolActivationCodes(schoolResponse.schoolId);
      } else {
        return this.edxApi.deletePrimaryActivationCode('SCHOOL', schoolResponse.schoolId);
      }
    });
    await Promise.all(activationCodePromises);

    console.log('setupInstituteEntities completed');
    return {
      district: district,
      schools: schoolResponses
    };
  }

  async recreateSchool(schoolOptions: SchoolOptions) {
    const districtID = await this.instituteApi.getDistrictIdOfTestDistrict();
    if (districtID === undefined) {
      return;
    }
    return await this.instituteApi.createSchoolWithContactToTest(districtID, schoolOptions);
  }

  async addContactToSchool(school: SchoolEntity, contact: SchoolContactPayload) {
    console.log('addContactToSchool called.');
    const newContact = await this.instituteApi.setupSchoolContact(school, contact);
    console.log('addContactToSchool completed.');
    return newContact;
  }

  async clearSchoolContacts(school: SchoolEntity) {
    console.log('clearSchoolContacts called.');
    await this.instituteApi.clearSchoolContacts(school);
    console.log('clearSchoolContacts completed.');
  }

}

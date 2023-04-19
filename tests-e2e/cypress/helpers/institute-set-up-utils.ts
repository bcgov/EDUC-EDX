import {instituteApiService} from '../services/institute-api-service.cy';
import {edxApiService} from "../services/edx-api-service.cy";

class InstituteSetupUtils {

    async setUpDistrictAndSchool(){
        const instituteApi =  new instituteApiService();
        await instituteApi.deleteInstituteSetUp();
        let districtID = await instituteApi.createDistrict();
        console.log('AT district created');
        await instituteApi.createSchool(districtID);
        console.log('AT school created');
        return null;
    }

    async setupInstituteEntities(includeDistrictAddress=true, includeSchoolAddress=true, includeTombstoneValues=true){
        const instituteApi =  new instituteApiService();
        const edxApi =  new edxApiService();
        console.log('setupInstituteEntities started')
        await instituteApi.createAuthorityWithContactToTest();
        let district = await instituteApi.createDistrictWithContactToTest(includeDistrictAddress);
        let school = await instituteApi.createSchoolWithContactToTest(district.districtId, includeSchoolAddress, includeTombstoneValues);
        await edxApi.verifyInstituteActivationCodes(district.districtId,school.schoolId);
        console.log('setupInstituteEntities completed')
        return {
            district: district,
            school: school
        }
    }

    async addContactToSchool(school: any, contact: any) {
        const instituteApi =  new instituteApiService();
        console.log('addContactToSchool called.');
        let newContact = await instituteApi.setupSchoolContact(school, contact);
        console.log('addContactToSchool completed.');
        return newContact;
    }

    async clearSchoolContacts(school: any) {
        const instituteApi =  new instituteApiService();
        console.log('clearSchoolContacts called.');
        await instituteApi.clearSchoolContacts(school);
        console.log('clearSchoolContacts completed.');
    }
}

export default InstituteSetupUtils;

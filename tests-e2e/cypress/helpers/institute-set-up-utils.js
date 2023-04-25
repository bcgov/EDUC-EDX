import {instituteApiService} from '../services/institute-api-service.cy';
import {sldCollectionApiService} from '../services/sld-collection-api-service.cy';
import {edxApiService} from "../services/edx-api-service.cy";

export async function setUpSchoolCollection(schoolID, config){
    const sldCollectionApi =  new sldCollectionApiService();
    let sdcSchoolCollectionID = await sldCollectionApi.createSchoolCollection(schoolID, config);
    return null;
};

export async function setupInstituteEntities(config, includeDistrictAddress=true, includeSchoolAddress=true, includeTombstoneValues=true){
    const instituteApi =  new instituteApiService();
    const edxApi =  new edxApiService();
    console.log('setupInstituteEntities started');
    await instituteApi.createAuthorityWithContactToTest(config);
    let district = await instituteApi.createDistrictWithContactToTest(includeDistrictAddress, config);
    let school = await instituteApi.createSchoolWithContactToTest(district.districtId, includeSchoolAddress, includeTombstoneValues, config);
    await edxApi.verifyInstituteActivationCodes(district.districtId,school.schoolId, config);
    console.log('setupInstituteEntities completed')
    return {
        district: district,
        school: school
    }
};

export async function addContactToSchool(school, contact, config) {
    const instituteApi =  new instituteApiService();
    console.log('addContactToSchool called.');
    let newContact = await instituteApi.setupSchoolContact(school, contact, config);
    console.log('addContactToSchool completed.');
    return newContact;
};

export async function clearSchoolContacts(school, config) {
    const instituteApi =  new instituteApiService();
    console.log('clearSchoolContacts called.');
    await instituteApi.clearSchoolContacts(school, config);
    console.log('clearSchoolContacts completed.');
};

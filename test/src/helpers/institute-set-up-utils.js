const {getToken} = require('./oauth-utils');
const {deleteInstituteSetUp,createDistrict,createSchool,createAuthorityWithContactToTest,createDistrictWithContactToTest,createSchoolWithContactToTest, clearSchoolContacts, setupSchoolContact} = require('../services/institute-api-service');
const {verifyInstituteActivationCodes} = require('../services/edx-api-service');
const constants = require('../config/constants');
const restUtils = require('./rest-utils');
import log from 'npmlog';

const instituteSetupUtils = {

    async setUpDistrictAndSchool(){
        await instituteSetupUtils.deleteInstituteSetUp();
        const districtID = await createDistrict();
        log.info('AT district created');
        const school = await createSchool(districtID);
        log.info('AT school created');
        return school?.schoolNumber;
    },

    async deleteInstituteSetUp(){

        await deleteInstituteSetUp();
        log.info('AT institute set up deleted')
    },

    async setupInstituteEntities(includeDistrictAddress=true, includeSchoolAddress=true, includeTombstoneValues=true){
        log.info('setupInstituteEntities started')
        await createAuthorityWithContactToTest();
        let district = await createDistrictWithContactToTest(includeDistrictAddress);
        let school = await createSchoolWithContactToTest(district.districtId, includeSchoolAddress, includeTombstoneValues);
        await verifyInstituteActivationCodes(district.districtId,school.schoolId);
        log.info('setupInstituteEntities completed')
        return {
            district: district,
            school: school
        }
    },

    async addContactToSchool(school, contact) {
        log.info('addContactToSchool called.');
        await setupSchoolContact(school, contact);
        log.info('addContactToSchool completed.');
    },

    async clearSchoolContacts(school) {
        log.info('clearSchoolContacts called.');
        await clearSchoolContacts(school);
        log.info('clearSchoolContacts completed.');
    }
};

module.exports = instituteSetupUtils;

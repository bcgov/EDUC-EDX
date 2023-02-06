const {getToken} = require('./oauth-utils');
const {deleteInstituteSetUp,createDistrict,createSchool,createAuthorityWithContactToTest,createDistrictWithContactToTest,createSchoolWithContactToTest} = require('../services/institute-api-service');
import { verifyInstituteActivationCodes } from '../services/edx-api-service';
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

    async setupInstituteEntities(includeDistrictAddress=true, includeSchoolAddress=true){
        log.info('setupInstituteEntities started')
        await createAuthorityWithContactToTest();
        let district = await createDistrictWithContactToTest(includeDistrictAddress);
        let school = await createSchoolWithContactToTest(district.districtId, includeSchoolAddress);
        await verifyInstituteActivationCodes(district.districtId,school.schoolId);
        log.info('setupInstituteEntities completed')
    },
};

module.exports = instituteSetupUtils;

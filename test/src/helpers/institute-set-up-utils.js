const {getToken} = require('./oauth-utils');
const {deleteInstituteSetUp,createDistrict,createSchool} = require('../services/institute-api-service');

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
    }
};

module.exports = instituteSetupUtils;

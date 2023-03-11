//const {deleteInstituteSetUp,createDistrict,createSchool,createAuthorityWithContactToTest,createDistrictWithContactToTest,createSchoolWithContactToTest, clearSchoolContacts, setupSchoolContact} = require('../services/institute-api-service');
import {OAuthUtil} from '../services/institute-api-service.cy';
const instituteSetupUtils = {

    async setUpDistrictAndSchool(){
        debugger
        await instituteSetupUtils.deleteInstituteSetUp();
        //const districtID = await createDistrict();
        console.log('AT district created');
        // const school = await createSchool(districtID);
        console.log('AT school created');
        return null;
    },

    async deleteInstituteSetUp(){
        const data =  new OAuthUtil();
        const token =  data.makeOAuthRequest();
        //  const school =  await instituteApiService.getSchoolBySchoolDisplayName('EDX AT School');

    }


};

module.exports = instituteSetupUtils;

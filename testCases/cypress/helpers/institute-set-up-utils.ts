//const {deleteInstituteSetUp,createDistrict,createSchool,createAuthorityWithContactToTest,createDistrictWithContactToTest,createSchoolWithContactToTest, clearSchoolContacts, setupSchoolContact} = require('../services/institute-api-service');
import {OAuthUtil} from '../services/institute-api-service.cy';
class InstituteSetupUtils {

    async setUpDistrictAndSchool(){
        debugger
        this.deleteInstituteSetUp();
        //const districtID = await createDistrict();
        console.log('AT district created');
        // const school = await createSchool(districtID);
        console.log('AT school created');
        return null;
    }

    async deleteInstituteSetUp(){
        const data =  new OAuthUtil();
        const token =  data.makeOAuthRequest();
        //  const school =  await instituteApiService.getSchoolBySchoolDisplayName('EDX AT School');

    }


};

export default InstituteSetupUtils;

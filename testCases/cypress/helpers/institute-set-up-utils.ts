import {OAuthUtil} from '../services/OauthUtil.cy';
import {instituteApiService} from '../services/institute-api-service.cy';
class InstituteSetupUtils {

    async setUpDistrictAndSchool(){
        debugger
        await this.deleteInstituteSetUp();
        //const districtID = await createDistrict();
        console.log('AT district created');
        // const school = await createSchool(districtID);
        console.log('AT school created');
        return null;
    }

    async deleteInstituteSetUp(){
        const data =  new OAuthUtil();
        const token =  data.makeOAuthRequest();
        const api =  new instituteApiService();
        await api.getAllSchools();
        debugger
        await  api.getSchoolIDBySchoolCode('99998')

        //  const school =  await instituteApiService.getSchoolBySchoolDisplayName('EDX AT School');

    }


};

export default InstituteSetupUtils;

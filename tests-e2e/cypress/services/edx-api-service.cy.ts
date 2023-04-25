// @ts-ignore
import {deleteData, getData, postData} from "../helpers/rest-utils";
import generator from 'generate-password';
import EdxActivationCode from "../model/EdxActivationCode";
import EdxActivationRole from "../model/EdxActivationRole";
import {instituteApiService} from "./institute-api-service.cy";

const faker = require('faker');
const date = require('date-and-time');

export class edxApiService {


  async getPrimaryActivationCodeForInstitute(instituteTypeCode: string,instituteID: string, config: any) {
    try {
      const endpoint = 'api/v1/edx/users/activation-code/primary/'+instituteTypeCode.toString().toUpperCase()+'/' + instituteID;
      const url = `${config.env.edx.base_url}${endpoint}`;
      return await getData(url, null, config);
    }catch (e: any){
      if(e?.response?.status === 404){
        const generateEndpoint = 'api/v1/edx/users/activation-code/primary/'+instituteTypeCode.toString().toUpperCase()+'/' + instituteID;
        const edxActivationCode = this.createEdxActivationCode( true, '','',instituteTypeCode,instituteID);
        const url = `${config.env.edx.base_url}${generateEndpoint}`;
        return postData(url,edxActivationCode, null, config);
      }
    }
  }

  async createEdxActivationCodes(personalCode: string,instituteTypeCode: string,instituteID: string, config: any) {
    const endpoint = 'api/v1/edx/users/activation-code';
    const url = `${config.env.edx.base_url}${endpoint}`;
    const roles = await this.getAllEdxUserRoleForInstitute(instituteTypeCode, config);
    const edxActivationPersonalCode = this.createEdxActivationCode( false,roles,personalCode ,instituteTypeCode,instituteID);
    const edxActivationPrimaryCode = await this.getPrimaryActivationCodeForInstitute(instituteTypeCode,instituteID, config);
    const res1 = await postData(url, edxActivationPersonalCode, null, config);
    return [res1, edxActivationPrimaryCode];
  }

  async getAllEdxUserRoleForInstitute(instituteTypeCode: string, config: any) {
    const endpoint = 'api/v1/edx/users/roles?instituteType='+instituteTypeCode;
    const url = `${config.env.edx.base_url}${endpoint}`;
    return getData(url, null, config);
  }

  async findAllPaginated(params: any, config: any){
    const EXCHANGE_ENDPOINT = `${config.env.edx.base_url}api/v1/edx/exchange`;
    const EXCHANGE_ENDPOINT_PAGINATED = `${EXCHANGE_ENDPOINT}/paginated`;
    return getData(EXCHANGE_ENDPOINT_PAGINATED, params, config);
  }

  async createSecureExchange(secureExchange: any, config: any) {
    const EXCHANGE_ENDPOINT = `${config.env.edx.base_url}api/v1/edx/exchange`;
    return postData(EXCHANGE_ENDPOINT, secureExchange, '', config);
  }


  async deleteSecureExchange(secureExchangeID: string, config: any) {
    const EXCHANGE_ENDPOINT = `${config.env.edx.base_url}api/v1/edx/exchange`;
    const url = EXCHANGE_ENDPOINT + '/' + secureExchangeID;
    return deleteData(url, '', config);
  }

  async getAllMinistryTeams(config: any) {
    const endpoint = 'api/v1/edx/users/ministry-teams';
    const url = `${config.env.edx.base_url}${endpoint}`;
    return getData(url, '', config);
  }

  async createUserActivationUrl(personalCode: string,instituteTypeCode: string,instituteID: string, config: any) {
    const endpoint = '/api/edx/activate-user-verification?validationCode=';
    const activationCodes = await this.createEdxActivationCodes(personalCode,instituteTypeCode,instituteID, config);
    const activationUrl = `${config.env.edx.base_url}${endpoint}${activationCodes[0].validationCode}`;
    return [activationUrl, activationCodes[0], activationCodes[1]];
  }

  async deleteActivationCode(activationCodeId: string, config: any) {
    const endpoint = 'api/v1/edx/users/activation-code';
    const url = `${config.env.edx.base_url}${endpoint}/${activationCodeId}`;
    await deleteData(url,null, config);
  }
  async deleteEdxUser(firstName: string, lastName: string, config: any) {
    const edxUser = await this.getEdxUserFromFirstNameLastName(firstName, lastName, config);
    const endpoint = 'api/v1/edx/users';
    const url = `${config.env.edx.base_url}${endpoint}/${edxUser?.edxUserID}`;
    await deleteData(url, null, config);
  }
  async generateCode(){
    return  generator.generate({
      length: faker.datatype.number({ 'min': 7, 'max': 7 }),
      numbers: true,
      uppercase: true,
    });
  }

  async  createFixtureSetupForEdxUserActivation(ctx: any,personalCode:string,instituteTypeCode: string,instituteID: string, config: any) {
    try {
      ctx.activationUrl = await this.createUserActivationUrl(personalCode,instituteTypeCode,instituteID, config);
      ctx.acCode1 = ctx.activationUrl[1].edxActivationCodeId;
      ctx.acCode2 = ctx.activationUrl[2].edxActivationCodeId;
      ctx.primaryCode= ctx.activationUrl[2].activationCode;
      ctx.personalCode= personalCode;
    } catch (e) {
      console.error(e);
    }
  }

  async setUpDataForUserActivation(ctx: any,instituteTypeCode: string,instituteIdentifier: string, config: any){
    const instituteApi =  new instituteApiService();
    const code = await this.generateCode();
    let instituteID;
    if(instituteTypeCode.toString().toUpperCase()=== 'SCHOOL'){
      instituteID = await instituteApi.getSchoolIDBySchoolCode(instituteIdentifier, config);
    }else{
      instituteID = await instituteApi.getDistrictIdByDistrictNumber(instituteIdentifier, config);
    }
    await this.createFixtureSetupForEdxUserActivation(ctx,code,instituteTypeCode,instituteID, config);
  }

  async  getEdxUserFromFirstNameLastName(firstName: string, lastName: string, config: any) {
    const endpoint = 'api/v1/edx/users';
    const url = `${config.env.edx.base_url}${endpoint}`;

    const searchParams = {
      params: {
        firstName,
        lastName
      }
    };
    const responseBody = await getData(url, searchParams, config);

    return responseBody[0];
  }

  createEdxActivationCode(isPrimary: boolean, roles: any, activationCode: string, instituteTypeCode: string, instituteID: string) {
    const edxActivationCode = new EdxActivationCode();
    edxActivationCode.activationCode = activationCode;
    edxActivationCode.email = 'edx-noreply@gov.bc.ca';
    edxActivationCode.firstName = 'TESTAUTOMATIONUSERFIRSTNAME';
    edxActivationCode.lastName = 'TESTAUTOMATIONUSERLASTNAME';
    edxActivationCode.isPrimary = isPrimary;
    edxActivationCode.numberOfClicks = '0';
    edxActivationCode.createUser='Automation-Test'
    edxActivationCode.updateUser='Automation-Test'
    const now = new Date();

    //get only first 19 to avoid adding millisecond at the end.
    edxActivationCode.expiryDate = date.addDays(now, 1).toJSON().substring(0, 19);
    if (roles.length > 0) {
      for (const role of roles) {
        const activationRole = new EdxActivationRole();
        activationRole.edxRoleCode = role.edxRoleCode;
        edxActivationCode.addActivationRole(activationRole);
      }
    }

    if (instituteTypeCode.toString().toUpperCase() === 'SCHOOL') {
      edxActivationCode.schoolID = instituteID;
    } else if (instituteTypeCode.toString().toUpperCase() === 'DISTRICT') {
      edxActivationCode.districtID = instituteID;
    }
    return edxActivationCode;
  }

  /**
   * @param {string} userID
   * @returns {Promise<any>} Response data
   */
  async deleteUserActivationCodes(userID: string, config: any) {
    const endPoint = `${config.env.edx.base_url}api/v1/edx/users/activation-code/user/${userID}`;
    return await deleteData(endPoint, null, config);
  }
  
  async verifyInstituteActivationCodes(districtID: string,schoolID: string, config: any){
    const endpoint = 'api/v1/edx/users';
    const schoolActivationCodeUrl = `${config.env.edx.base_url}/${endpoint}/activation-code/primary/SCHOOL/${schoolID}`;
    try{
      await getData(schoolActivationCodeUrl, null, config);
      console.log('School activation code found');
    }catch (e: any){
      if(e.response.status === 404 ){
        //generate school activation code if it doesn't exist
        const schoolActivationCodePayload = {
          createUser: 'EDXAT',
          updateUser: 'EDXAT',
          createDate: null,
          updateDate: null,
          districtID: null,
          schoolID:schoolID,
        };
        await postData(schoolActivationCodeUrl,schoolActivationCodePayload,'', config);
        console.log('district Activation code created');
      }
    }

    const districtActivationCodeUrl = `${config.env.edx.base_url}/${endpoint}/activation-code/primary/DISTRICT/${districtID}`;
    try{
      await getData(districtActivationCodeUrl, null, config);
      console.log('district Activation code found');
    }catch (e: any){
      if(e.response.status === 404 ){
        //generate school activation code if it doesn't exist
        const districtActivationCodePayload = {
          createUser: 'EDXAT',
          updateUser: 'EDXAT',
          createDate: null,
          updateDate: null,
          districtID: districtID,
          schoolID: null,
        };
        await postData(districtActivationCodeUrl,districtActivationCodePayload, '', config);
        console.log('district Activation code created');
      }
    }
  }

}


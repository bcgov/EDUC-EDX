// @ts-ignore
import generator from 'generate-password';
import EdxActivationCode from "../model/EdxActivationCode";
import EdxActivationRole from "../model/EdxActivationRole";
import {InstituteApiService} from "./institute-api-service";
import {RestUtils} from "../helpers/rest-utils-ts";

const faker = require('faker');
const date = require('date-and-time');

export class EdxApiService {
  config: any;
  restUtils: any;

  constructor(conf: any) {
    this.config = conf;
    this.restUtils = new RestUtils(this.config);
  }

  async getPrimaryActivationCodeForInstitute(instituteTypeCode: string,instituteID: string) {
    try {
      const endpoint = 'api/v1/edx/users/activation-code/primary/'+instituteTypeCode.toString().toUpperCase()+'/' + instituteID;
      const url = `${this.config.env.edx.base_url}${endpoint}`;
      return await this.restUtils.getData(url, null);
    }catch (e: any){
      if(e?.response?.status === 404){
        const generateEndpoint = 'api/v1/edx/users/activation-code/primary/'+instituteTypeCode.toString().toUpperCase()+'/' + instituteID;
        const edxActivationCode = this.createEdxActivationCode( true, '','',instituteTypeCode,instituteID);
        const url = `${this.config.env.edx.base_url}${generateEndpoint}`;
        return this.restUtils.postData(url,edxActivationCode, null);
      }
    }
  }

  async createEdxActivationCodes(personalCode: string,instituteTypeCode: string,instituteID: string) {
    const endpoint = 'api/v1/edx/users/activation-code';
    const url = `${this.config.env.edx.base_url}${endpoint}`;
    const roles = await this.getAllEdxUserRoleForInstitute(instituteTypeCode);
    const edxActivationPersonalCode = this.createEdxActivationCode( false,roles,personalCode ,instituteTypeCode,instituteID);
    const edxActivationPrimaryCode = await this.getPrimaryActivationCodeForInstitute(instituteTypeCode,instituteID);
    const res1 = await this.restUtils.postData(url, edxActivationPersonalCode, null);
    return [res1, edxActivationPrimaryCode];
  }

  async getAllEdxUserRoleForInstitute(instituteTypeCode: string) {
    const endpoint = 'api/v1/edx/users/roles?instituteType='+instituteTypeCode;
    const url = `${this.config.env.edx.base_url}${endpoint}`;
    return this.restUtils.getData(url, null);
  }

  async findAllPaginated(params: any){
    const EXCHANGE_ENDPOINT = `${this.config.env.edx.base_url}api/v1/edx/exchange`;
    const EXCHANGE_ENDPOINT_PAGINATED = `${EXCHANGE_ENDPOINT}/paginated`;
    return this.restUtils.getData(EXCHANGE_ENDPOINT_PAGINATED, params);
  }

  async createSecureExchange(secureExchange: any) {
    const EXCHANGE_ENDPOINT = `${this.config.env.edx.base_url}api/v1/edx/exchange`;
    return this.restUtils.postData(EXCHANGE_ENDPOINT, secureExchange, '');
  }


  async deleteSecureExchange(secureExchangeID: string) {
    const EXCHANGE_ENDPOINT = `${this.config.env.edx.base_url}api/v1/edx/exchange`;
    const url = EXCHANGE_ENDPOINT + '/' + secureExchangeID;
    return this.restUtils.deleteData(url, '');
  }

  async getAllMinistryTeams() {
    const endpoint = 'api/v1/edx/users/ministry-teams';
    const url = `${this.config.env.edx.base_url}${endpoint}`;
    return this.restUtils.getData(url, '');
  }

  async createUserActivationUrl(personalCode: string,instituteTypeCode: string,instituteID: string) {
    const endpoint = '/api/edx/activate-user-verification?validationCode=';
    const activationCodes = await this.createEdxActivationCodes(personalCode,instituteTypeCode,instituteID);
    const activationUrl = `${this.config.env.edx.base_url}${endpoint}${activationCodes[0].validationCode}`;
    return [activationUrl, activationCodes[0], activationCodes[1]];
  }

  async deleteActivationCode(activationCodeId: string) {
    const endpoint = 'api/v1/edx/users/activation-code';
    const url = `${this.config.env.edx.base_url}${endpoint}/${activationCodeId}`;
    await this.restUtils.deleteData(url,null);
  }
  async deleteEdxUser(firstName: string, lastName: string) {
    const edxUser = await this.getEdxUserFromFirstNameLastName(firstName, lastName);
    const endpoint = 'api/v1/edx/users';
    const url = `${this.config.env.edx.base_url}${endpoint}/${edxUser?.edxUserID}`;
    await this.restUtils.deleteData(url, null);
  }
  async generateCode(){
    return  generator.generate({
      length: faker.datatype.number({ 'min': 7, 'max': 7 }),
      numbers: true,
      uppercase: true,
    });
  }

  async  createFixtureSetupForEdxUserActivation(ctx: any,personalCode:string,instituteTypeCode: string,instituteID: string) {
    try {
      ctx.activationUrl = await this.createUserActivationUrl(personalCode,instituteTypeCode,instituteID);
      ctx.acCode1 = ctx.activationUrl[1].edxActivationCodeId;
      ctx.acCode2 = ctx.activationUrl[2].edxActivationCodeId;
      ctx.primaryCode= ctx.activationUrl[2].activationCode;
      ctx.personalCode= personalCode;
    } catch (e) {
      console.error(e);
    }
  }

  async setUpDataForUserActivation(ctx: any,instituteTypeCode: string,instituteIdentifier: string){
    const instituteApi =  new InstituteApiService(this.config);
    const code = await this.generateCode();
    let instituteID;
    if(instituteTypeCode.toString().toUpperCase()=== 'SCHOOL'){
      instituteID = await instituteApi.getSchoolIDBySchoolCode(instituteIdentifier);
    }else{
      instituteID = await instituteApi.getDistrictIdByDistrictNumber(instituteIdentifier);
    }
    await this.createFixtureSetupForEdxUserActivation(ctx,code,instituteTypeCode,instituteID);
  }

  async  getEdxUserFromFirstNameLastName(firstName: string, lastName: string) {
    const endpoint = 'api/v1/edx/users';
    const url = `${this.config.env.edx.base_url}${endpoint}`;

    const searchParams = {
      params: {
        firstName,
        lastName
      }
    };
    const responseBody = await this.restUtils.getData(url, searchParams);

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
  async deleteUserActivationCodes(userID: string) {
    const endPoint = `${this.config.env.edx.base_url}api/v1/edx/users/activation-code/user/${userID}`;
    return await this.restUtils.deleteData(endPoint, null);
  }
  
  async verifyInstituteActivationCodes(districtID: string,schoolID: string){
    const endpoint = 'api/v1/edx/users';
    const schoolActivationCodeUrl = `${this.config.env.edx.base_url}/${endpoint}/activation-code/primary/SCHOOL/${schoolID}`;
    try{
      await this.restUtils.getData(schoolActivationCodeUrl, null);
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
        await this.restUtils.postData(schoolActivationCodeUrl,schoolActivationCodePayload,'');
        console.log('district Activation code created');
      }
    }

    const districtActivationCodeUrl = `${this.config.env.edx.base_url}/${endpoint}/activation-code/primary/DISTRICT/${districtID}`;
    try{
      await this.restUtils.getData(districtActivationCodeUrl, null);
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
        await this.restUtils.postData(districtActivationCodeUrl,districtActivationCodePayload, '');
        console.log('district Activation code created');
      }
    }
  }

}


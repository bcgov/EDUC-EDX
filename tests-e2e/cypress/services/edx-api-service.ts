import generator from "generate-password-ts";
import {InstituteApiService} from "./institute-api-service";
import {RestUtils} from "../helpers/rest-utils-ts";
import {faker} from '@faker-js/faker';

type EdxActivationRolePayload = {
  edxRoleCode?: string;
}

type EdxActivationCodePayload = {
  createUser: string;
  updateUser: string;
  schoolID?: string;
  districtID?: string;
  activationCode?: string;
  isPrimary?: boolean;
  expiryDate?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  numberOfClicks?: string;
  edxActivationRoles?: EdxActivationRolePayload[];
};

export type EdxUserActivationFixture = {
  activationUrl: string,
  primaryCode: string,
  personalCode: string,
  personalCodeId: string
}

export class EdxApiService {
  config: Cypress.PluginConfigOptions;
  restUtils: RestUtils;

  constructor(conf: Cypress.PluginConfigOptions) {
    this.config = conf;
    this.restUtils = new RestUtils(this.config);
  }

  async getPrimaryActivationCodeForInstitute(instituteTypeCode: string, instituteID: string) {
    try {
      const endpoint = '/api/v1/edx/users/activation-code/primary/'+instituteTypeCode.toString().toUpperCase()+'/' + instituteID;
      const url = `${this.config.env.edx.base_url}${endpoint}`;
      return await this.restUtils.getData(url, null);
    }catch (e: any){
      if(e?.response?.status === 404){
        const generateEndpoint = '/api/v1/edx/users/activation-code/primary/'+instituteTypeCode.toString().toUpperCase()+'/' + instituteID;
        const edxActivationCode = this.createEdxActivationCode( true, '','',instituteTypeCode,instituteID);
        const url = `${this.config.env.edx.base_url}${generateEndpoint}`;
        return this.restUtils.postData(url,edxActivationCode);
      }
    }
  }

  async createEdxActivationCodes(personalCode: string,instituteTypeCode: string,instituteID: string) {
    const endpoint = '/api/v1/edx/users/activation-code';
    const url = `${this.config.env.edx.base_url}${endpoint}`;
    const roles = await this.getAllEdxUserRoleForInstitute(instituteTypeCode);
    const edxActivationPersonalCode = this.createEdxActivationCode( false,roles,personalCode ,instituteTypeCode,instituteID);
    const edxActivationPrimaryCode = await this.getPrimaryActivationCodeForInstitute(instituteTypeCode,instituteID);
    const res1 = await this.restUtils.postData(url, edxActivationPersonalCode);
    return [res1, edxActivationPrimaryCode];
  }

  async getAllEdxUserRoleForInstitute(instituteTypeCode: string) {
    const endpoint = '/api/v1/edx/users/roles?instituteType='+instituteTypeCode;
    const url = `${this.config.env.edx.base_url}${endpoint}`;
    return this.restUtils.getData(url, null);
  }

  async findAllPaginated(params: any){
    const EXCHANGE_ENDPOINT = `${this.config.env.edx.base_url}/api/v1/edx/exchange`;
    const EXCHANGE_ENDPOINT_PAGINATED = `${EXCHANGE_ENDPOINT}/paginated`;
    return this.restUtils.getData(EXCHANGE_ENDPOINT_PAGINATED, params);
  }

  async createSecureExchange(secureExchange: any) {
    const EXCHANGE_ENDPOINT = `${this.config.env.edx.base_url}/api/v1/edx/exchange`;
    return this.restUtils.postData(EXCHANGE_ENDPOINT, secureExchange, '');
  }

  async deleteSecureExchange(secureExchangeID: string) {
    const EXCHANGE_ENDPOINT = `${this.config.env.edx.base_url}/api/v1/edx/exchange`;
    const url = EXCHANGE_ENDPOINT + '/' + secureExchangeID;
    return this.restUtils.deleteData(url, '');
  }

  async deleteAllSecureExchangeBySubject(subject: string) {
    console.log(`delete messages with subject:: ${subject}`)
    let params = {
      params: {
        searchCriteriaList: '[{"key": "subject", "value": "' + subject + '", "operation":' +
            ' "like_ignore_case", "valueType": "STRING"}]'
      }
    };
    let response = await this.findAllPaginated(params);

    console.log(`${response.content.length} messages found`);

    for (let message of response.content) {
      await this.deleteSecureExchange(message.secureExchangeID);
    }

    console.log('secure exchange message cleanup completed');
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

  async deleteActivationCode(identifier?:string, id?: string) {
    const endpoint = '/api/v1/edx/users/activation-code';
    if(id) {
      const districtActivationCodeUrl = `${this.config.env.edx.base_url}/api/v1/edx/users/activation-code/primary/${identifier}/${id}`;
      this.restUtils.getData(districtActivationCodeUrl, null).then(async response => {
        let activationCodeId = response.edxActivationCodeId;
        const url = `${this.config.env.edx.base_url}${endpoint}/${activationCodeId}`;
        await this.restUtils.deleteData(url);
      })
      .catch(e => {
        if(e.status !== 404 ){
          console.log(e);
        }
      });
    }
  }

  async deleteEdxUser(edxUserID: string) {
    const endpoint = '/api/v1/edx/users';
    const url = `${this.config.env.edx.base_url}${endpoint}/${edxUserID}`;
    await this.restUtils.deleteData(url);
  }

  async generateCode(){
    return  generator.generate({
      length: faker.datatype.number({ 'min': 7, 'max': 7 }),
      numbers: true,
      uppercase: true,
    });
  }

  async createFixtureSetupForEdxUserActivation(ctx: any,personalCode:string,instituteTypeCode: string,instituteID: string) {
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

  async getEdxUserWithDigitalId(digitalId: string): Promise<EdxUserEntity|undefined> {
    const endpoint = '/api/v1/edx/users';
    const url = `${this.config.env.edx.base_url}${endpoint}`;

    const searchParams: EdxUsersSearchParams = {
      params: {
        digitalId
      }
    };

    const responseBody = await this.restUtils.getData<EdxUserEntity[]>(url, searchParams);
    return responseBody[0];
  }

  createEdxActivationCode(isPrimary: boolean, roles: any, activationCode: string, instituteTypeCode: string, instituteID: string) {
    const edxActivationCode: EdxActivationCodePayload = {
      activationCode,
      email: 'edx-noreply@gov.bc.ca',
      firstName: 'TESTAUTOMATIONUSERFIRSTNAME',
      lastName: 'TESTAUTOMATIONUSERLASTNAME',
      isPrimary,
      numberOfClicks: '0',
      createUser: 'Automation-Test',
      updateUser: 'Automation-Test'
    };
    const oneDayFrom = (date: Date) => {
      date.setDate(date.getDate() + 1);
      return date;
    }
    const now = new Date();

    //get only first 19 to avoid adding millisecond at the end.
    edxActivationCode.expiryDate = oneDayFrom(now).toISOString().substring(0, 19);
    if (roles.length > 0) {
      let roleArr: Array<EdxActivationRolePayload> = new Array<EdxActivationRolePayload>();
      for (const role of roles) {
        const activationRole: EdxActivationRolePayload = {edxRoleCode: role.edxRoleCode};
        roleArr.push(activationRole);
      }
      edxActivationCode.edxActivationRoles = roleArr;
    }

    if (instituteTypeCode.toString().toUpperCase() === 'SCHOOL') {
      edxActivationCode.schoolID = instituteID;
    } else if (instituteTypeCode.toString().toUpperCase() === 'DISTRICT') {
      edxActivationCode.districtID = instituteID;
    }
    return edxActivationCode;
  }

  async deleteUserActivationCodes(userID: string) {
    const endPoint = `${this.config.env.edx.base_url}/api/v1/edx/users/activation-code/user/${userID}`;
    return await this.restUtils.deleteData(endPoint);
  }

  async verifySchoolActivationCodes(schoolID: string) {
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
  }

  async verifyDistrictActivationCodes(districtID: string) {
    const endpoint = 'api/v1/edx/users';
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


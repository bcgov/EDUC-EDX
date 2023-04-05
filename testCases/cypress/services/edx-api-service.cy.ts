import {instituteApiService} from './institute-api-service.cy';
import generator from 'generate-password';
const constants = require('../config/constants');

const faker = require("faker");

const EXCHANGE_ENDPOINT = `${constants.edx_api_base_url}api/v1/edx/exchange`;
const EXCHANGE_ENDPOINT_PAGINATED = `${EXCHANGE_ENDPOINT}/paginated`;
//import createEdxActivationCode from '../helpers/user-activation-utils';

//import UserActivation from '../page_models/user-activation';
//import {getSchoolIDBySchoolCode,getDistrictIdByDistrictNumber} from './institute-api-service';

//const loginPage = new LoginPage();
//const userActivationPage = new UserActivation();



var response: any



async function getPrimaryActivationCodeForInstitute(this: any, instituteTypeCode: { toString: () => string; }, instituteID: string) {
  try {
    const endpoint = 'api/v1/edx/users/activation-code/primary/'+instituteTypeCode.toString().toUpperCase()+'/' + instituteID;
    const url = `${constants.edx_api_base_url}${endpoint}`;
    cy.makeAPIRequest(url, 'GET', {},{}).then((res) => {
      expect(res.status).to.be.equal(200)
      response = res.body
      debugger
      cy.log(response);
    })
    return response;
  }catch (e){
    // @ts-ignore
    if(e?.response.status === 404){
      const generateEndpoint = 'api/v1/edx/users/activation-code/primary/'+instituteTypeCode.toString().toUpperCase()+'/' + instituteID;
      const edxActivationCode = this.createEdxActivationCode( 'true', '','',instituteTypeCode,instituteID);
      const url = `${constants.edx_api_base_url}${generateEndpoint}`;
      cy.makeAPIRequest(url, 'POST', {},edxActivationCode).then((res) => {
        expect(res.status).to.be.equal(200)
        response = res.body
        debugger
        cy.log(response);
      })
      return response;
    }
  }
}



async function createEdxActivationCodes(this: any, personalCode: any, instituteTypeCode: { toString: () => string }, instituteID: string) {
  const endpoint = 'api/v1/edx/users/activation-code';
  const url = `${constants.edx_api_base_url}${endpoint}`;
  const roles = await edxApiService.getAllEdxUserRoleForInstitute(instituteTypeCode);
  const edxActivationPersonalCode = this.createEdxActivationCode( 'false',roles,personalCode ,instituteTypeCode,instituteID);
  const edxActivationPrimaryCode = await getPrimaryActivationCodeForInstitute(instituteTypeCode,instituteID);
  cy.makeAPIRequest(url, 'POST', {},edxActivationPersonalCode).then((res) => {
    expect(res.status).to.be.equal(200)
    response = res.body
    debugger
    cy.log(response);
  })
  return [response, edxActivationPrimaryCode];
}




/**
 * Exposes methods for communication with edx-api end-points
 * @type {{getAllMinistryTeams(*=): Promise<*>}}
 */
const edxApiService = {

  async getAllEdxUserRoleForInstitute(instituteTypeCode: { toString: () => string }) {
    const endpoint = 'api/v1/edx/users/roles?instituteType='+instituteTypeCode;
    const apiEndpoint = `${constants.edx_api_base_url}${endpoint}`;
    cy.makeAPIRequest(apiEndpoint, 'GET', {}, {}).then((res) => {
      expect(res.status).to.be.equal(200)
      response = res.body
      debugger
      cy.log(response);
    })
    return response;
  },

  async findAllPaginated(token: any, params: any){
    cy.makeAPIRequest(EXCHANGE_ENDPOINT_PAGINATED, 'GET', {}, {}).then((res) => {
      expect(res.status).to.be.equal(200)
      response = res.body
      debugger
      cy.log(response);
    })
    return response;
  },

  /**
   *
   * @param token
   * @param secureExchange
   * @returns {Promise<*>}
   */
  async createSecureExchange(token: any, secureExchange: {}) {
    cy.makeAPIRequest(EXCHANGE_ENDPOINT, 'POST', secureExchange, {}).then((res) => {
      expect(res.status).to.be.equal(200)
      response = res.body
      debugger
      cy.log(response);
    })
    return response;
  },


  async deleteSecureExchange(token: any, secureExchangeID: string) {
    const url = EXCHANGE_ENDPOINT + '/' + secureExchangeID;
    cy.makeAPIRequest(url, 'DELETE', {}, {}).then((res) => {
      expect(res.status).to.be.equal(200)
      response = res.body
      debugger
      cy.log(response);
    })
    return response;
  },

  /**
   * Retrieves ministry teams from the following endpoint:
   * /api/v1/edx/users/ministry-teams
   * @param token
   * @returns {Promise<*>}
   */
  async getAllMinistryTeams(token: any) {
    const endpoint = 'api/v1/edx/users/ministry-teams';
    const urlEndpoint = `${constants.edx_api_base_url}${endpoint}`;
    cy.makeAPIRequest(urlEndpoint, 'GET', {}, {}).then((res) => {
      expect(res.status).to.be.equal(200)
      response = res.body
      debugger
      cy.log(response);
    })
    return response;
  },

  /**
   * Retrieves all the Roles from API:
   */


  async createUserActivationUrl( personalCode: { toString: () => string; }, instituteTypeCode: string, instituteID: any) {
    const endpoint = '/api/edx/activate-user-verification?validationCode=';
    const activationCodes = await createEdxActivationCodes(personalCode,instituteTypeCode,instituteID);
    const activationUrl = `${constants.base_url}${endpoint}${activationCodes[0].validationCode}`;
    return [activationUrl, activationCodes[0], activationCodes[1]];
  },

  async deleteActivationCode(token: any, activationCodeId: any) {
    const endpoint = 'api/v1/edx/users/activation-code';
    const url = `${constants.edx_api_base_url}${endpoint}/${activationCodeId}`;
    cy.makeAPIRequest(url, 'DELETE', {}, {}).then((res) => {
      expect(res.status).to.be.equal(200)
      response = res.body
      debugger
      cy.log(response);
    })
    return response;
  },
  async deleteEdxUser(token: any, firstName: any, lastName: any) {
    const edxUser = await edxApiService.getEdxUserFromFirstNameLastName(token, firstName, lastName);
    const endpoint = 'api/v1/edx/users';
    const url = `${constants.edx_api_base_url}${endpoint}/${edxUser?.edxUserID}`;
    cy.makeAPIRequest(url, 'DELETE', {}, {}).then((res) => {
      expect(res.status).to.be.equal(200)
      response = res.body
      debugger
      cy.log(response);
    })
    return response;
  },
  async generateCode(){
    return  generator.generate({
      length: faker.datatype.number({ 'min': 7, 'max': 7 }),
      numbers: true,
      uppercase: true,
    });
  },
  /*async  login(t) {
    await t.navigateTo(t.fixtureCtx.activationUrl[0]);
    log.info(t.fixtureCtx.activationUrl[0]);
    log.info('EDX Login page loaded successfully!');
    // log in, assert return to baseurl
    const getLocation = ClientFunction(() => document.location.href);
    await t.typeText(loginPage.userNameInput(), credentials.activateUserCredentials.username, {timeout: 20000})
      .typeText(loginPage.passwordInput(), credentials.activateUserCredentials.password, {timeout: 20000})
      .click(loginPage.submitCredentialsButton());
    log.info('User could login successfully!');
    return getLocation;
  },*/

  async  createFixtureSetupForEdxUserActivation(ctx: { activationUrl: any[]; acCode1: any; acCode2: any; primaryCode: any; personalCode: any; }, personalCode: { toString: () => string; }, instituteTypeCode: string, instituteID: string) {
    try {

      ctx.activationUrl = await edxApiService.createUserActivationUrl(personalCode,instituteTypeCode,instituteID);
      ctx.acCode1 = ctx.activationUrl[1].edxActivationCodeId;
      ctx.acCode2 = ctx.activationUrl[2].edxActivationCodeId;
      ctx.primaryCode= ctx.activationUrl[2].activationCode;
      ctx.personalCode= personalCode;
    } catch (e) {
      console.error(e);
    }
  },

/*  async  submitDetailsOnUserActivationForm(t: { typeText: (arg0: any, arg1: any, arg2: { timeout: number; }) => { (): any; new(): any; typeText: { (arg0: any, arg1: any, arg2: { timeout: number; }): { (): any; new(): any; typeText: { (arg0: any, arg1: any, arg2: { timeout: number; }): { (): any; new(): any; click: { (arg0: any): any; new(): any; }; }; new(): any; }; }; new(): any; }; }; }, mincode: any, primaryActivationCode: any, personalActivationCode: any) {
    await t.typeText(userActivationPage.mincodeInput(), mincode, {timeout: 20000})
      .typeText(userActivationPage.primaryActivationCodeInput(), primaryActivationCode, {timeout: 20000})
      .typeText(userActivationPage.personalActivationCodeInput(), personalActivationCode, {timeout: 20000})
      .click(userActivationPage.submitUserActivationButton());
  },*/

  async setUpDataForUserActivation(ctx: { activationUrl: any[]; acCode1: any; acCode2: any; primaryCode: any; personalCode: any; }, instituteTypeCode: string, instituteIdentifier: any){
    const code = await edxApiService.generateCode();
    let instituteID ;

    let instituteAPI = new instituteApiService();
    if(instituteTypeCode.toString().toUpperCase()=== 'SCHOOL'){
      instituteID = await instituteAPI.getSchoolIDBySchoolCode(instituteIdentifier);
    }else{
      instituteID = await instituteAPI.getDistrictIdByDistrictNumber(instituteIdentifier);
    }
    await edxApiService.createFixtureSetupForEdxUserActivation(ctx,code,instituteTypeCode,instituteID);
  },

  async  getEdxUserFromFirstNameLastName(token: any, firstName: any, lastName: any) {
    const endpoint = 'api/v1/edx/users';
    const url = `${constants.edx_api_base_url}${endpoint}`;

    const searchParams = {
      params: {
        firstName,
        lastName
      }
    };
    cy.makeAPIRequest(url, 'GET', searchParams, {}).then((res) => {
      expect(res.status).to.be.equal(200)
      response = res.body
      debugger
      cy.log(response);
    })
    return response[0];
  },
  verifyInstituteActivationCodes: async function (districtID: any, schoolID: any) {
    const endpoint = 'api/v1/edx/users';
    const schoolActivationCodeUrl = `${constants.edx_api_base_url}${endpoint}/activation-code/primary/SCHOOL/${schoolID}`;
    try {
      cy.makeAPIRequest(schoolActivationCodeUrl, 'GET', {}, {}).then((res) => {
        expect(res.status).to.be.equal(200)
        response = res.body
        debugger
        cy.log(response);
      })
      cy.log('school Activation code found');
    } catch (e) {
      if ((e instanceof Error)) {
        //generate school activation code if it doesn't exist
        const schoolActivationCodePayload = {
          createUser: 'EDXAT',
          updateUser: 'EDXAT',
          createDate: null,
          updateDate: null,
          districtID: null,
          schoolID: schoolID,
        };
        cy.makeAPIRequest(schoolActivationCodeUrl, 'POST', {}, schoolActivationCodePayload).then((res) => {
          expect(res.status).to.be.equal(200)
          response = res.body
          debugger
          cy.log(response);
        })
        cy.log('district Activation code created');
      }
    }

    const districtActivationCodeUrl = `${constants.edx_api_base_url}${endpoint}/activation-code/primary/DISTRICT/${districtID}`;
    try {
      cy.makeAPIRequest(districtActivationCodeUrl, 'GET', {}, {}).then((res) => {
        expect(res.status).to.be.equal(200)
        response = res.body
        debugger
        cy.log(response);
      })
      console.log('district Activation code found');
    } catch (e) {
      if (e instanceof Error) {
        //generate school activation code if it doesn't exist
        const districtActivationCodePayload = {
          createUser: 'EDXAT',
          updateUser: 'EDXAT',
          createDate: null,
          updateDate: null,
          districtID: districtID,
          schoolID: null,
        };
        cy.makeAPIRequest(districtActivationCodeUrl, 'POST', {}, districtActivationCodePayload).then((res) => {
          expect(res.status).to.be.equal(200)
          response = res.body
          debugger
          cy.log(response);
        })
        cy.log('district Activation code created');
      }
    }
  }

};

module.exports = edxApiService;

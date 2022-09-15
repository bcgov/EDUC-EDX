import generator from 'generate-password';

const restUtils = require('../helpers/rest-utils');
const constants = require('../config/constants');
import faker from 'faker';
import {ClientFunction} from 'testcafe';
import {credentials} from '../config/constants';
import {getToken} from '../helpers/oauth-utils';
import {createEdxActivationCode} from '../helpers/user-activation-utils';

import LoginPage from '../page_models/login-page';
import UserActivation from '../page_models/user-activation';
import {getSchoolIDBySchoolCode,getDistrictIdByDistrictNumber} from './institute-api-service';
const loginPage = new LoginPage();
const userActivationPage = new UserActivation();

const log = require('npmlog');
const EXCHANGE_ENDPOINT = `${constants.edx_api_base_url}api/v1/edx/exchange`;
const EXCHANGE_ENDPOINT_PAGINATED = `${EXCHANGE_ENDPOINT}/paginated`;




async function getPrimaryActivationCodeForInstitute(token,instituteTypeCode,instituteID) {
  try {
    const endpoint = 'api/v1/edx/users/activation-code/primary/'+instituteTypeCode.toString().toUpperCase()+'/' + instituteID;
    const url = `${constants.edx_api_base_url}${endpoint}`;
    return await  restUtils.getData(token, url);
  }catch (e){
    if(e?.response?.status === 404){
      const generateEndpoint = 'api/v1/edx/users/activation-code/primary/'+instituteTypeCode.toString().toUpperCase()+'/' + instituteID;
      const edxActivationCode = createEdxActivationCode( 'true', '','',instituteTypeCode,instituteID);
      const url = `${constants.edx_api_base_url}${generateEndpoint}`;
      return restUtils.postData(token, url,edxActivationCode);
    }
  }
}



async function createEdxActivationCodes(token,personalCode,instituteTypeCode,instituteID) {
  const endpoint = 'api/v1/edx/users/activation-code';
  const url = `${constants.edx_api_base_url}${endpoint}`;
  const roles = await edxApiService.getAllEdxUserRoleForInstitute(token,instituteTypeCode);
  const edxActivationPersonalCode = createEdxActivationCode( 'false',roles,personalCode ,instituteTypeCode,instituteID);
  const edxActivationPrimaryCode = await getPrimaryActivationCodeForInstitute(token,instituteTypeCode,instituteID);
  const res1 = await restUtils.postData(token, url, edxActivationPersonalCode);
  return [res1, edxActivationPrimaryCode];
}




/**
 * Exposes methods for communication with edx-api end-points
 * @type {{getAllMinistryTeams(*=): Promise<*>}}
 */
const edxApiService = {

  async getAllEdxUserRoleForInstitute(token,instituteTypeCode) {
    const endpoint = 'api/v1/edx/users/roles?instituteType='+instituteTypeCode;
    const url = `${constants.edx_api_base_url}${endpoint}`;
    return restUtils.getData(token, url);
  },

  async findAllPaginated(token, params){
    return restUtils.getData(token, EXCHANGE_ENDPOINT_PAGINATED, params);
  },

  /**
   *
   * @param token
   * @param secureExchange
   * @returns {Promise<*>}
   */
  async createSecureExchange(token, secureExchange) {
    return restUtils.postData(token, EXCHANGE_ENDPOINT, secureExchange, '');
  },


  async deleteSecureExchange(token, secureExchangeID) {
    const url = EXCHANGE_ENDPOINT + '/' + secureExchangeID;
    return restUtils.deleteData(token, url, '');
  },

  /**
   * Retrieves ministry teams from the following endpoint:
   * /api/v1/edx/users/ministry-teams
   * @param token
   * @returns {Promise<*>}
   */
  async getAllMinistryTeams(token) {
    const endpoint = 'api/v1/edx/users/ministry-teams';
    const url = `${constants.edx_api_base_url}${endpoint}`;
    return restUtils.getData(token, url, '');
  },

  /**
   * Retrieves all the Roles from API:
   */


  async createUserActivationUrl(token,personalCode,instituteTypeCode,instituteID) {
    const endpoint = '/api/edx/activate-user-verification?validationCode=';
    const activationCodes = await createEdxActivationCodes(token,personalCode,instituteTypeCode,instituteID);
    const activationUrl = `${constants.base_url}${endpoint}${activationCodes[0].validationCode}`;
    return [activationUrl, activationCodes[0], activationCodes[1]];
  },

  async deleteActivationCode(token, activationCodeId) {
    const endpoint = 'api/v1/edx/users/activation-code';
    const url = `${constants.edx_api_base_url}${endpoint}/${activationCodeId}`;
    await restUtils.deleteData(token, url);
  },
  async deleteEdxUser(token, firstName, lastName) {
    const edxUser = await edxApiService.getEdxUserFromFirstNameLastName(token, firstName, lastName);
    log.info('edxUser found ::', edxUser);
    const endpoint = 'api/v1/edx/users';
    const url = `${constants.edx_api_base_url}${endpoint}/${edxUser?.edxUserID}`;
    await restUtils.deleteData(token, url);
  },
  async generateCode(){
    return  generator.generate({
      length: faker.datatype.number({ 'min': 7, 'max': 7 }),
      numbers: true,
      uppercase: true,
    });
  },
  async  login(t) {
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
  },

  async  createFixtureSetupForEdxUserActivation(ctx,personalCode,instituteTypeCode,instituteID) {
    try {
      const data = await getToken();
      ctx.activationUrl = await edxApiService.createUserActivationUrl(data.access_token,personalCode,instituteTypeCode,instituteID);
      ctx.acCode1 = ctx.activationUrl[1].edxActivationCodeId;
      ctx.acCode2 = ctx.activationUrl[2].edxActivationCodeId;
      ctx.primaryCode= ctx.activationUrl[2].activationCode;
      ctx.personalCode= personalCode;
    } catch (e) {
      console.error(e);
    }
  },

  async  submitDetailsOnUserActivationForm(t, mincode, primaryActivationCode, personalActivationCode) {
    await t.typeText(userActivationPage.mincodeInput(), mincode, {timeout: 20000})
      .typeText(userActivationPage.primaryActivationCodeInput(), primaryActivationCode, {timeout: 20000})
      .typeText(userActivationPage.personalActivationCodeInput(), personalActivationCode, {timeout: 20000})
      .click(userActivationPage.submitUserActivationButton());
  },

  async setUpDataForUserActivation(ctx,instituteTypeCode,instituteIdentifier){
    const code = await edxApiService.generateCode();
    let instituteID ='';
    if(instituteTypeCode.toString().toUpperCase()=== 'SCHOOL'){
      instituteID = await getSchoolIDBySchoolCode(instituteIdentifier);
    }else{
      instituteID = await getDistrictIdByDistrictNumber(instituteIdentifier);
    }
    await edxApiService.createFixtureSetupForEdxUserActivation(ctx,code,instituteTypeCode,instituteID);
  },

  async  getEdxUserFromFirstNameLastName(token, firstName, lastName) {
    const endpoint = 'api/v1/edx/users';
    const url = `${constants.edx_api_base_url}${endpoint}`;

    const searchParams = {
      params: {
        firstName,
        lastName
      }
    };
    const responseBody = await restUtils.getData(token, url, searchParams);

    return responseBody[0];
  }

};

module.exports = edxApiService;

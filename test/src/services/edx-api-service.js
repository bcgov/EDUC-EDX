const restUtils = require('../helpers/rest-utils');
const constants = require('../config/constants');
import { createEdxPersonalActivationCode, createEdxPrimaryActivationCode } from "../helpers/secure-exchange-utils";

const EXCHANGE_ENDPOINT = `${constants.edx_api_base_url}api/v1/edx/exchange`;

async function getAllEdxUserRoles(token) {
  const endpoint = 'api/v1/edx/users/roles';
  const url = `${constants.edx_api_base_url}${endpoint}`;
  return restUtils.getData(token, url);
}

async function createEdxActivationCodes(token) {
  const endpoint = 'api/v1/edx/users/activation-code';
  const url = `${constants.edx_api_base_url}${endpoint}`;
  const roles = await getAllEdxUserRoles(token);
  const edxActivationPersonalCode = createEdxPersonalActivationCode(roles);
  const edxActivationPrimaryCode = createEdxPrimaryActivationCode(roles);
  const res1 = await restUtils.postData(token,url,edxActivationPersonalCode);
  const res2 = await restUtils.postData(token, url, edxActivationPrimaryCode);
  return [res1, res2];
}
/**
 * Exposes methods for communication with edx-api end-points
 * @type {{getAllMinistryTeams(*=): Promise<*>}}
 */
const edxApiService = {

  /**
   *
   * @param token
   * @param secureExchange
   * @param params
   * @returns {Promise<*>}
   */
  async createSecureExchange(token, secureExchange) {
    const responseBody = await restUtils.postData(token, EXCHANGE_ENDPOINT, secureExchange, '');
    return responseBody;
  },

  async updateSecureExchange(token, secureExchange) {

  },

  async deleteSecureExchange(token, secureExchangeID) {
    const url = EXCHANGE_ENDPOINT + '/' + secureExchangeID;
    const responseBody = await restUtils.deleteData(token, url, '');
    return responseBody;
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
    const responseBody = await restUtils.getData(token, url, '');
    return responseBody;
  },

  /**
   * Retrieves all the Roles from API:
   */


  async createUserActivationUrl(token) {
    const endpoint = 'api/edx/activate-user-verification?validationCode=';
    const activationCodes = await createEdxActivationCodes(token);
    const activationUrl = `${constants.base_url}${endpoint}${activationCodes[0].validationCode}`;
    return [activationUrl,activationCodes[0],activationCodes[1]];
  },

  async deleteActivationCode(token,activationCodeId) {
    const endpoint = 'api/v1/edx/users/activation-code';
    const url = `${constants.edx_api_base_url}${endpoint}/${activationCodeId}`;
    await restUtils.deleteData(token, url);
  }
};

module.exports = edxApiService;

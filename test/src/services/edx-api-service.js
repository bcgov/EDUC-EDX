const restUtils = require('../helpers/rest-utils');
const constants = require('../config/constants');
import {getActivationCode} from '../helpers/secure-exchange-utils';
const log = require('npmlog');
const EXCHANGE_ENDPOINT = `${constants.edx_api_base_url}api/v1/edx/exchange`;

async function getAllEdxUserRoles(token) {
  const endpoint = 'api/v1/edx/users/roles';
  const url = `${constants.edx_api_base_url}${endpoint}`;
  return restUtils.getData(token, url);
}

async function createEdxActivationCodes(token,primaryCode,personalCode) {
  const endpoint = 'api/v1/edx/users/activation-code';
  const url = `${constants.edx_api_base_url}${endpoint}`;
  const roles = await getAllEdxUserRoles(token);
  const edxActivationPersonalCode = getActivationCode(personalCode, 'false', roles);
  const edxActivationPrimaryCode = getActivationCode(primaryCode, 'true', roles);
  const res1 = await restUtils.postData(token, url, edxActivationPersonalCode);
  const res2 = await restUtils.postData(token, url, edxActivationPrimaryCode);
  return [res1, res2];
}


async function getEdxUserFromFirstNameLastName(token, firstName, lastName) {
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


  async createUserActivationUrl(token,primaryCode,personalCode) {
    const endpoint = '/api/edx/activate-user-verification?validationCode=';
    const activationCodes = await createEdxActivationCodes(token,primaryCode,personalCode);
    const activationUrl = `${constants.base_url}${endpoint}${activationCodes[0].validationCode}`;
    return [activationUrl, activationCodes[0], activationCodes[1]];
  },

  async deleteActivationCode(token, activationCodeId) {
    const endpoint = 'api/v1/edx/users/activation-code';
    const url = `${constants.edx_api_base_url}${endpoint}/${activationCodeId}`;
    await restUtils.deleteData(token, url);
  },
  async deleteEdxUser(token, firstName, lastName) {
    const edxUser = await getEdxUserFromFirstNameLastName(token, firstName, lastName);
    log.info('edxUser found ::', edxUser);
    const endpoint = 'api/v1/edx/users';
    const url = `${constants.edx_api_base_url}${endpoint}/${edxUser.edxUserID}`;
    await restUtils.deleteData(token, url);
  }
};

module.exports = edxApiService;

const restUtils = require("../helpers/rest-utils");
const constants = require('../config/constants');

const EXCHANGE_ENDPOINT = '${constants.edx_api_base_url}api/v1/edx/exchange';

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
    async createSecureExchange(token, secureExchange, params) {
        const responseBody = await restUtils.postData(token, EXCHANGE_ENDPOINT, secureExchange, params);
        return responseBody;
    },

    async updateSecureExchange(token, secureExchange) {

    },

    async deleteSecureExchange(token, secureExchangeID) {
        const url = EXCHANGE_ENDPOINT+'/'+secureExchangeID;
        const responseBody = await restUtils.postData(token, url, '');
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
    }
}

module.exports = edxApiService;

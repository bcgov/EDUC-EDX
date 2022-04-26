const restUtils = require("../helpers/rest-utils")
const constants = require('../config/constants')

/**
 * Exposes methods for communication with edx-api end-points
 * @type {{getAllMinistryTeams(*=): Promise<*>}}
 */
const edxApiService = {

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

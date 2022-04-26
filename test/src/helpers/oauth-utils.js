'use strict';

const axios = require('axios');
const tokenData = require('../config/constants');

const oauthUtils = {
    async getToken() {
        const params = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        // TODO: no longer needed to test tokenData.token_environment as this will be evident using github secrets based on environment
        if (tokenData.token_environment == "dev") {
            const data = 'grant_type=client_credentials&client_id=' + tokenData.token_client_id + '&client_secret=' + tokenData.token_client_secret;
            const response = await axios.post(tokenData.getTokenUrl, data, params);
            return response.data;

        }

        if (tokenData.token_environment == "test") {
            const data = 'grant_type=client_credentials&client_id=' + tokenData.token_client_id_test + '&client_secret=' + tokenData.token_client_secret_test;
            const response = await axios.post(tokenData.getTokenUrl, data, params);
            return response.data;

        }

        if (tokenData.token_environment == "prod") {
            const data = 'grant_type=client_credentials&client_id=' + tokenData.token_client_id_pre_prod + '&client_secret=' + tokenData.token_client_secret_pre_prod;
            const response = await axios.post(tokenData.getTokenUrl, data, params);
            return response.data;

        }
    }
}
module.exports = oauthUtils;
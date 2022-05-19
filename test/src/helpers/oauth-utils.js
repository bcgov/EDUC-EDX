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
        const data = 'grant_type=client_credentials&client_id=' + tokenData.token_client_id + '&client_secret=' + tokenData.token_client_secret;
        const response = await axios.post(tokenData.token_endpoint, data, params);
        return response.data;
    }
};
module.exports = oauthUtils;
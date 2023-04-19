/**
 * REST utilities for interacting with RESTFUL apis
 * @type {{}}
 */
import axios from "axios";

const lodash = require('lodash');

const restService = {

    async getToken() {
        const params = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        const data = 'grant_type=client_credentials&client_id=' + Cypress.env('CLIENT_ID') + '&client_secret=' + Cypress.env('CLIENT_SECRET');
        const response = await axios.post(Cypress.env('TOKEN_URL'), data, params);
        return response.data.access_token;
    },

    async getData(url, params = {}) {
        try {
            params = setToken(params, await restService.getToken());
            const response = await axios.get(url, params);
            console.log('get Data Status', response.status);
            console.log('get Data StatusText', response.statusText);
            console.log('get Data Res', minify(response.data));
            return response.data;
        } catch (e) {
            logApiError(e, 'getData', 'Error during GET on ' + url);
            throw e;
        }
    },

    async postData(url, data, params = {}) {
        try {
            params = setToken(params, await restService.getToken());
            const response = await axios.post(url, data, params);
            console.log('post Data Status', response.status);
            console.log('post Data StatusText', response.statusText);
            return response.data;
        } catch (e) {
            logApiError(e, 'postData', 'Error during POST on ' + url);
            const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
            throw new Error('API POST Error: status=' + status );
        }
    },

    async putData(url, data, params = {}) {
        try {
            params = setToken(params, await restService.getToken());
            const response = await axios.put(url, data, params);
            console.log('put Data Status', response.status);
            console.log('put Data StatusText', response.statusText);
            return response.data;
        } catch (e) {
            logApiError(e, 'putData', 'Error during PUT on ' + url);
            const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
            throw new Error('API PUT Error: status=' + status );
        }
    },

    async deleteData(url, params = {}) {
        try {
            params = setToken(params, await restService.getToken());
            const response = await axios.delete(url, params);
            console.log('delete Data Status', response.status);
            console.log('delete Data StatusText', response.statusText);
            return response.data;
        } catch (e) {
            logApiError(e, 'deleteData', 'Error during DELETE on ' + url);
            const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
            throw new Error('API DELETE Error: status=' + status );
        }
    }
}

function logApiError(e, functionName, message) {
    if (message) {
        console.log(message);
    }
    console.log(functionName, ' Error', e.stack);
    if (e.response && e.response.data) {
        console.log(JSON.stringify(e.response.data));
    }
}

function minify(obj, keys = ['documentData']) {
    return lodash.transform(obj, (result, value, key) =>
        result[key] = keys.includes(key) && lodash.isString(value) ? value.substring(0, 1) + ' ...' : value);
}

function setToken(params, token) {
    if (params) {
        params.headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    } else {
        params = {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
    }
    return params;
}

module.exports = restService;

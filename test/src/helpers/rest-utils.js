/**
 * REST utilities for interacting with RESTFUL apis
 * @type {{}}
 */

const log = require('npmlog');
const axios = require('axios');
const lodash = require('lodash');

const restService = {

    /**
     * Basic GET request
     * @param token
     * @param url
     * @param params
     * @returns {Promise<any>}
     */
    async getData(token, url, params) {
        try {
            params = setToken(params, token);
            log.info('get Data Url', url);
            const response = await axios.get(url, params);
            log.info('get Data Status', response.status);
            log.info('get Data StatusText', response.statusText);
            log.verbose('get Data Res', minify(response.data));
            return response.data;
        } catch (e) {
            logApiError(e, 'getData', 'Error during GET on ' + url);
            const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
            throw new ApiError(status, { message: 'API Get error' }, e);
        }
    },

    /**
     * Basic POST
     * @param token
     * @param url
     * @param data
     * @param params
     * @returns {Promise<any>}
     */
    async postData(token, url, data, params) {
        try {
            params = setToken(params, token);
            log.info('post Data Url', url);
            log.verbose('post Data Req', minify(data));
            const response = await axios.post(url, data, params);
            log.info('post Data Status', response.status);
            log.info('post Data StatusText', response.statusText);
            log.verbose('post Data Res', response.data);
            return response.data;
        } catch (e) {
            logApiError(e, 'postData', 'Error during POST on ' + url);
            const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
            throw new ApiError(status, { message: 'API Post error' }, e);
        }
    },

    /**
     * Basic PUT
     * @param token
     * @param url
     * @param data
     * @param params
     * @returns {Promise<any>}
     */
    async putData(token, url, data, params) {
        try {
            params = setToken(params, token);
            log.info('put Data Url', url);
            log.verbose('put Data Req', data);
            const response = await axios.put(url, data, params);
            log.info('put Data Status', response.status);
            log.info('put Data StatusText', response.statusText);
            log.verbose('put Data Res', response.data);
            return response.data;
        } catch (e) {
            logApiError(e, 'putData', 'Error during PUT on ' + url);
            const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
            throw new ApiError(status, { message: 'API Put error' }, e);
        }
    },

    /**
     * Basic DELETE
     * @param token
     * @param url
     * @param params
     * @returns {Promise<any>}
     */
    async deleteData(token, url, params) {
        try {
            params = setToken(params, token);
            log.info('Delete Data Url', url);
            const response = await axios.delete(url, params);
            log.info('delete Data Status', response.status);
            log.info('delete Data StatusText', response.statusText);
            return response.data;
        } catch (e) {
            logApiError(e, 'deleteData', 'Error during DELETE on ' + url);
            const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
            throw new ApiError(status, { message: 'API DELETE error' }, e);
        }
    }
}

function logApiError(e, functionName, message) {
    if (message) {
        log.error(message);
    }
    log.error(functionName, ' Error', e.stack);
    if (e.response && e.response.data) {
        log.error(JSON.stringify(e.response.data));
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
        };
    } else {
        params = {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        };
    }
    return params;
}

module.exports = restService;

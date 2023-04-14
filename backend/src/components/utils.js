'use strict';

const axios = require('axios');
const config = require('../config/index');
const log = require('./logger');
const HttpStatus = require('http-status-codes');
const lodash = require('lodash');
const {ApiError} = require('./error');
const jsonwebtoken = require('jsonwebtoken');
const {v4: uuidv4} = require('uuid');
const {LocalDateTime, DateTimeFormatter} = require('@js-joda/core');
const {Locale} = require('@js-joda/locale_en');
let discovery = null;
const cache = require('memory-cache');
let memCache = new cache.Cache();
const fsStringify = require('fast-safe-stringify');

axios.interceptors.request.use((axiosRequestConfig) => {
  axiosRequestConfig.headers['X-Client-Name'] = 'PEN-EDX';
  return axiosRequestConfig;
});
// Returns OIDC Discovery values
async function getOidcDiscovery() {
  if (!discovery) {
    try {
      const response = await axios.get(config.get('oidc:discovery'));
      discovery = response.data;
    } catch (error) {
      log.error('getOidcDiscovery', `OIDC Discovery failed - ${error.message}`);
    }
  }
  return discovery;
}

function minify(obj, keys = ['documentData']) {
  return lodash.transform(obj, (result, value, key) =>
    result[key] = keys.includes(key) && lodash.isString(value) ? value.substring(0, 1) + ' ...' : value);
}

function getSessionUser(req) {
  log.verbose('getSessionUser', req.session);
  const session = req.session;
  return session && session.passport && session.passport.user;
}

function getAccessToken(req) {
  const user = getSessionUser(req);
  return user && user.jwt;
}

async function deleteData(token, url, correlationID) {
  try {
    const delConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
        correlationID: correlationID || uuidv4()
      }
    };

    log.info('delete Data Url', url);
    const response = await axios.delete(url, delConfig);
    log.info(`delete Data Status for url ${url} :: is :: `, response.status);
    log.info(`delete Data StatusText for url ${url}  :: is :: `, response.statusText);
    log.verbose(`delete Data Response for url ${url}  :: is :: `, minify(response.data));

    return response.data;
  } catch (e) {
    log.error('deleteData Error', e.response ? e.response.status : e.message);
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, {message: 'API Delete error'}, e);
  }
}

async function forwardGetReq(req, res, url) {
  try {
    const accessToken = getAccessToken(req);
    if (!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    const params = {
      params: req.query
    };

    log.info('forwardGetReq Url', url);
    const data = await getDataWithParams(accessToken, url, params, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('forwardGetReq Error', e.stack);
    return res.status(e.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Forward Get error'
    });
  }
}

async function getData(token, url, correlationID) {
  try {
    const getDataConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
        correlationID: correlationID || uuidv4()
      }
    };

    log.info('get Data Url', url);
    const response = await axios.get(url, getDataConfig);
    log.info(`get Data Status for url ${url} :: is :: `, response.status);
    log.info(`get Data StatusText for url ${url}  :: is :: `, response.statusText);
    log.verbose(`get Data Response for url ${url}  :: is :: `, minify(response.data));

    return response.data;
  } catch (e) {
    log.error('getData Error', e.response ? e.response.status : e.message);
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, {message: 'API Get error'}, e);
  }
}

async function getDataWithParams(token, url, params, correlationID) {
  try {
    params.headers = {
      Authorization: `Bearer ${token}`,
      correlationID: correlationID || uuidv4()
    };

    log.info('get Data Url', url);
    const response = await axios.get(url, params);
    log.info(`get Data Status for url ${url} :: is :: `, response.status);
    log.info(`get Data StatusText for url ${url}  :: is :: `, response.statusText);
    log.verbose(`get Data Response for url ${url}  :: is :: `, minify(response.data));

    return response.data;
  } catch (e) {
    log.error('getDataWithParams Error', e.response ? e.response.status : e.message);
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, {message: 'API Get error'}, e);
  }
}

async function forwardPostReq(req, res, url) {
  try {
    const accessToken = getAccessToken(req);
    if (!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No session data'
      });
    }

    const data = await postData(accessToken, req.body, url, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('forwardPostReq Error', e.stack);
    return res.status(e.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Forward Post error'
    });
  }
}

async function postData(token, data, url, correlationID) {
  try {
    const postDataConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
        correlationID: correlationID || uuidv4()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    };

    log.info('post Data Url', url);
    log.verbose('post Data Req', minify(data));
    if(!data.createUser){
      data.createUser = 'EDX';
    }
    if(!data.updateUser){
      data.updateUser = 'EDX';
    }

    const response = await axios.post(url, data, postDataConfig);

    log.info(`post Data Status for url ${url} :: is :: `, response.status);
    log.info(`post Data StatusText for url ${url}  :: is :: `, response.statusText);
    log.verbose(`post Data Response for url ${url}  :: is :: `, typeof response.data === 'string' ? response.data : minify(response.data));

    return response.data;
  } catch (e) {
    log.error('postData Error', e.response ? e.response.status : e.message);
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    let responseData;
    if (e?.response?.data) {
      responseData = e.response.data;
    } else {
      responseData = {message: `API POST error, on ${url}`};
    }
    throw new ApiError(status, responseData, e);

  }
}

async function putData(token, data, url, correlationID) {
  try {
    const putDataConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
        correlationID: correlationID || uuidv4()
      }
    };

    log.info('put Data Url', url);
    log.verbose('put Data Req', data);
    data.updateUser = 'EDX';
    const response = await axios.put(url, data, putDataConfig);

    log.info(`put Data Status for url ${url} :: is :: `, response.status);
    log.info(`put Data StatusText for url ${url}  :: is :: `, response.statusText);
    log.verbose(`put Data Response for url ${url}  :: is :: `, minify(response.data));

    return response.data;
  } catch (e) {
    log.error('putData Error', e.response ? e.response.status : e.message);
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, {message: 'API Put error'}, e);
  }
}

const SecureExchangeStatuses = Object.freeze({
  NEW: 'NEW',
  INPROG: 'INPROG',
  CLOSED: 'CLOSED'
});

function generateJWTToken(jwtid, subject, issuer, algorithm, payload) {

  const tokenTTL = config.get('email:tokenTTL'); // this should be in minutes
  const jwtSecretKey = config.get('email:secretKey');
  let sign_options_schema = {
    expiresIn: tokenTTL * 60,
    algorithm: algorithm,
    issuer: issuer,
    jwtid: jwtid,
    subject: subject
  };

  return jsonwebtoken.sign(payload, jwtSecretKey, sign_options_schema);
}

function formatCommentTimestamp(time) {
  const timestamp = LocalDateTime.parse(time);
  return timestamp.format(DateTimeFormatter.ofPattern('yyyy-MM-dd h:mma').withLocale(Locale.CANADA));
}

function errorResponse(res, msg, code) {
  return res.status(code || HttpStatus.INTERNAL_SERVER_ERROR).json({
    message: msg || 'INTERNAL SERVER ERROR',
    code: code || HttpStatus.INTERNAL_SERVER_ERROR
  });
}

function handleExceptionResponse(e, res) {
  if (e.message === '404' || e.status === '404' || e.status === 404) {
    return res.status(HttpStatus.NOT_FOUND).json();
  } else if(e.message === '403') {
    return res.status(HttpStatus.FORBIDDEN).json({
      status: HttpStatus.FORBIDDEN,
      message: 'You do not have permission to access this information'
    });
  } else if(e.message === '401'){
    return res.status(HttpStatus.UNAUTHORIZED).json({
      status: HttpStatus.UNAUTHORIZED,
      message: 'Token is not valid'
    });
  } else {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR',
      code: HttpStatus.INTERNAL_SERVER_ERROR
    });
  }
}

function getCodeTable(token, key, url, useCache = true) {
  try {
    let cacheContent = useCache && memCache.get(key);
    if (cacheContent) {
      return cacheContent;
    } else {
      const getDataConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      };
      log.info('get Data Url', url);

      return axios.get(url, getDataConfig)
        .then(response => {
          useCache && memCache.put(key, response.data);
          return response.data;
        })
        .catch(e => {
          log.error(e, 'getCodeTable', 'Error during get on ' + url);
          const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
          throw new ApiError(status, {message: 'API get error'}, e);
        });
    }
  } catch (e) {
    throw new Error(`getCodeTable error, ${e}`);
  }
}

function getCodes(urlKey, cacheKey, extraPath, useCache = true) {
  return async function getCodesHandler(req, res) {
    try {
      const token = getBackendToken(req);
      if (!token) {
        return unauthorizedError(res);
      }
      const url = config.get(urlKey);
      const codes = await getCodeTable(token, cacheKey, extraPath ? `${url}${extraPath}` : url, useCache);

      return res.status(HttpStatus.OK).json(codes);

    } catch (e) {
      log.error(e, 'getCodes', `Error occurred while attempting to GET ${cacheKey}.`);
      return errorResponse(res);
    }
  };
}

function cacheMiddleware() {
  return (req, res, next) => {
    let key = '__express__' + req.originalUrl || req.url;
    let cacheContent = memCache.get(key);
    if (cacheContent) {
      res.send(cacheContent);
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        if (res.statusCode < 300 && res.statusCode >= 200) {
          memCache.put(key, body);
        }
        res.sendResponse(body);
      };
      next();
    }
  };
}
function getBackendToken(req) {
  const thisSession = req.session;
  return thisSession && thisSession['passport'] && thisSession['passport'].user && thisSession['passport'].user.jwt;
}
function unauthorizedError(res) {
  return res.status(HttpStatus.UNAUTHORIZED).json({
    message: 'No access token'
  });
}

function checkEDXUserSchoolAdminPermission(req) {
  let permission = req.session.activeInstitutePermissions.includes('EDX_USER_SCHOOL_ADMIN');
  if (!permission) {
    throw new Error('403');
  }
}

function checkEDXUserDistrictAdminPermission(req) {
  let permission = req.session.activeInstitutePermissions.includes('EDX_USER_DISTRICT_ADMIN');
  if (!permission) {
    throw new Error('403');
  }
}

function checkEDXCollectionPermission(req) {
  let permission = req.session.activeInstitutePermissions.includes('STUDENT_DATA_COLLECTION');
  if (!permission) {
    throw new Error('403');
  }
}

function checkEDXUserAccess(req, instituteType, instituteIdentifier) {
  if (req.session.activeInstituteIdentifier !== instituteIdentifier || req.session.activeInstituteType !== instituteType) {
    throw new Error('403');
  }
}

function checkSchoolBelongsToEDXUserDistrict(req, schoolID) {
  const cacheService = require('./cache-service');

  let school = cacheService.getSchoolBySchoolID(schoolID);

  if (req.session.activeInstituteType !== 'DISTRICT') {
    log.warn('checkSchoolBelongstoEDXUserDistrict should only be used for District EDX users');
  }

  if (!school) {
    log.error('unable to find school checkEDXUserSchoolBelongsToDistrict');
    throw new Error('404');
  }

  if (school.districtID !== req.session.activeInstituteIdentifier) {
    throw new Error('403');
  }
}

/**
 * Helper function that combines all the permissions and security checks for
 * school admin operations. ex. editing school details.
 * @param {Object} req
 * @param {String} instituteIdentifier - SchoolID or DistrictID
 * @returns void
 * @throws Error
 */
function checkEDXUserAccessForSchoolAdminFunctions(req, instituteIdentifier) {
  checkEDXUserSchoolAdminPermission(req);

  if (req.session.activeInstituteType === 'SCHOOL') {
    checkEDXUserAccess(req, 'SCHOOL', instituteIdentifier);
  } else {
    checkSchoolBelongsToEDXUserDistrict(req, instituteIdentifier);
  }
}

async function logApiError(e, functionName, message) {
  if (e?.response?.status === 404) {
    log.info('Entity not found', e);
  } else if (e?.response?.data) {
    log.error(fsStringify(e.response.data));
  } else if (message) {
    log.error(message);
    log.error(functionName, ' Error', e.stack);
  } else {
    log.error(functionName, ' Error', e.stack);
  }
}

const utils = {
  getOidcDiscovery,
  prettyStringify: (obj, indent = 2) => JSON.stringify(obj, null, indent),
  getSessionUser,
  getAccessToken,
  deleteData,
  forwardGetReq,
  getDataWithParams,
  getData,
  forwardPostReq,
  postData,
  putData,
  SecureExchangeStatuses,
  generateJWTToken,
  formatCommentTimestamp,
  errorResponse,
  handleExceptionResponse,
  getCodes,
  cacheMiddleware,
  getCodeTable,
  checkEDXUserSchoolAdminPermission,
  checkEDXUserDistrictAdminPermission,
  checkEDXUserAccess,
  checkSchoolBelongsToEDXUserDistrict,
  checkEDXUserAccessForSchoolAdminFunctions,
  logApiError,
  checkEDXCollectionPermission
};

module.exports = utils;

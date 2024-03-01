'use strict';

const axios = require('axios');
const config = require('../config/index');
const log = require('./logger');
const HttpStatus = require('http-status-codes');
const {ApiError} = require('./error');
const {v4: uuidv4} = require('uuid');
let discovery = null;
const cache = require('memory-cache');
let memCache = new cache.Cache();
const fsStringify = require('fast-safe-stringify');

axios.interceptors.request.use((axiosRequestConfig) => {
  axiosRequestConfig.headers['X-Client-Name'] = 'EDX-APP';
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

    return response.data;
  } catch (e) {
    log.error('getDataWithParams Error', e.response ? e.response.status : e.message);
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, {message: 'API Get error'}, e);
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
    if(!data.createUser){
      data.createUser = 'EDX';
    }
    if(!data.updateUser){
      data.updateUser = 'EDX';
    }

    const response = await axios.post(url, data, postDataConfig);

    log.info(`post Data Status for url ${url} :: is :: `, response.status);
    log.info(`post Data StatusText for url ${url}  :: is :: `, response.statusText);

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
    if(!data.updateUser) {
      data.updateUser = 'EDX';
    }
    const response = await axios.put(url, data, putDataConfig);

    log.info(`put Data Status for url ${url} :: is :: `, response.status);
    log.info(`put Data StatusText for url ${url}  :: is :: `, response.statusText);

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

function getBackendToken(req) {
  const thisSession = req.session;
  return thisSession && thisSession['passport'] && thisSession['passport'].user && thisSession['passport'].user.jwt;
}
function unauthorizedError(res) {
  return res.status(HttpStatus.UNAUTHORIZED).json({
    message: 'No access token'
  });
}

function checkEDXUserHasPermission(req, permission) {
  let hasPermission = req.session.activeInstitutePermissions.includes(permission);
  if (!hasPermission) {
    throw new Error('403');
  }
}

function checkEDXUserSchoolAdminPermission(req) {
  checkEDXUserHasPermission(req, 'EDX_USER_SCHOOL_ADMIN');
}

function checkEDXUserDistrictAdminPermission(req) {
  checkEDXUserHasPermission(req, 'EDX_USER_DISTRICT_ADMIN');
}

function checkEDXCollectionPermission(req) {
  let permission = req.session.activeInstitutePermissions.includes('SCHOOL_SDC');
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
 * Verify that a query param and request body param are both present and match
 * each-other in value.
 *
 * @param {Express.Request} req
 * @param {String} paramKey
 * @param {String} bodyKey
 * @throws Bad Request
 */
function verifyQueryParamValueMatchesBodyValue(req, paramKey, bodyKey) {
  if (!req?.params?.[paramKey]
    || !req?.body?.[bodyKey]
    || req.params[paramKey] !== req.body[bodyKey]) throw new Error('400');
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

function checkEDXUserCanViewSchoolData(req, instituteIdentifier) {
  if (req.session.activeInstituteType === 'SCHOOL') {
    checkEDXUserAccess(req, 'SCHOOL', instituteIdentifier);
  } else {
    checkSchoolBelongsToEDXUserDistrict(req, instituteIdentifier);
  }
}

function checkEDXUserAccessForSchoolEditFunctions(req, instituteIdentifier) {
  checkEDXUserHasPermission(req, 'EDX_SCHOOL_EDIT');

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

function isPdf(document){
  return (
    'fileName' in document &&
    typeof document.fileName === 'string' &&
    document.fileName.toLowerCase().endsWith('.pdf')
  );
}

function isImage(document) {
  let imageTypes = ['.jpg','.jpeg','.jpe','.jfif','.jif','.jfi', '.png'];
  return (
    'fileName' in document &&
    typeof document.fileName === 'string' &&
    imageTypes.includes(getFileExtensionWithDot(document.fileName.toLowerCase()))
  );
}

function getFileExtensionWithDot(fileName) {
  const extension = fileName.slice((fileName.lastIndexOf('.') - 1 >>> 0) + 2);
  return (extension.length > 0 ? ('.' + extension) : '');
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
  postData,
  putData,
  SecureExchangeStatuses,
  errorResponse,
  handleExceptionResponse,
  getCodes,
  getCodeTable,
  checkEDXUserDistrictAdminPermission,
  checkEDXUserAccess,
  checkSchoolBelongsToEDXUserDistrict,
  checkEDXUserAccessForSchoolAdminFunctions,
  checkEDXUserAccessForSchoolEditFunctions,
  checkEDXUserCanViewSchoolData,
  checkEDXUserHasPermission,
  verifyQueryParamValueMatchesBodyValue,
  logApiError,
  checkEDXCollectionPermission,
  isPdf,
  isImage
};

module.exports = utils;

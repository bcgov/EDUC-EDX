'use strict';
const {FILTER_OPERATION, VALUE_TYPE} = require('../util/constants');
const { getSessionUser, getAccessToken, deleteData, getData, postData, SecureExchangeStatuses, errorResponse } = require('./utils');
const config = require('../config/index');
const log = require('./logger');
const lodash = require('lodash');
const HttpStatus = require('http-status-codes');
const { ServiceError } = require('./error');
const {LocalDateTime} = require('@js-joda/core');

let codes = null;

function verifyRequest(req, res, next) {
  const userInfo = getSessionUser(req);
  if(!userInfo) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      status: HttpStatus.UNAUTHORIZED,
      message: 'you are not authorized to access this page'
    });
  }

  const secureExchangeID = req.params.id;
  if(!req || !req.session || !req.session['secureExchange'] || req.session['secureExchange']['secureExchangeID'] !== secureExchangeID) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Wrong secureExchangeID'
    });
  }

  next();
}

async function getDigitalIdData(token, digitalID, correlationID) {
  try {
    return await getData(token, config.get('digitalID:apiEndpoint') + `/${digitalID}`, correlationID);
  } catch (e) {
    throw new ServiceError('getDigitalIdData error', e);
  }
}

async function getUserInfo(req, res) {
  const userInfo = getSessionUser(req);
  const correlationID = req.session?.correlationID;
  if(!userInfo || !userInfo.jwt || !userInfo._json || !userInfo._json.digitalIdentityID) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No session data'
    });
  }

  const accessToken = userInfo.jwt;
  const digitalID = userInfo._json.digitalIdentityID;

  return Promise.all([
    getDigitalIdData(accessToken, digitalID, correlationID),
    getServerSideCodes(accessToken, correlationID),
  ]).then(async ([digitalIdData, codesData]) => {

    const identityType = lodash.find(codesData.identityTypes, ['identityTypeCode', digitalIdData.identityTypeCode]);
    if(! identityType) {
      log.error('getIdentityType Error identityTypeCode', digitalIdData.identityTypeCode);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Wrong identityTypeCode'
      });
    }

    if(req && req.session){
      req.session.digitalIdentityData = digitalIdData;
      req.session.digitalIdentityData.identityTypeLabel = identityType.label;
    } else {
      throw new ServiceError('userInfo error: session does not exist');
    }
    let resData = {
      displayName: userInfo._json.displayName,
      accountType: userInfo._json.accountType,
      identityTypeLabel: identityType.label,
    };

    return res.status(HttpStatus.OK).json(resData);
  }).catch(e => {
    log.error('getUserInfo Error', e.stack);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Get userInfo error',
      errorSource: e.errorSource
    });
  });
}

async function getServerSideCodes(accessToken, correlationID) {
  if(!codes) {
    try{
      const codeUrls = [
        `${config.get('student:apiEndpoint')}/sex-codes`,
        `${config.get('digitalID:apiEndpoint')}/identityTypeCodes`
      ];

      const [sexCodes, identityTypes] = await Promise.all(codeUrls.map(url => getData(accessToken, url), correlationID));
      codes = {sexCodes, identityTypes};
    } catch(e) {
      throw new ServiceError('getServerSideCodes error', e);
    }
  }
  return codes;
}

async function uploadFile(req, res) {
  try{
    const accessToken = getAccessToken(req);
    if(!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    if(!req.session['secureExchange'] || req.session['secureExchange']['secureExchangeStatusCode'] === SecureExchangeStatuses.CLOSED) {
      return res.status(HttpStatus.CONFLICT).json({
        message: 'Upload secureExchange file not allowed'
      });
    }

    const endpoint = config.get('secureExchange:apiEndpoint');
    const url = `${endpoint}/${req.params.id}/documents`;

    const data = await postData(accessToken, req.body, url, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch(e) {
    log.error('uploadFile Error', e.stack);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Upload secureExchange file error'
    });
  }
}

async function uploadFileWithoutRequest(req, res) {
  try{
    const accessToken = getAccessToken(req);
    if(!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    const endpoint = config.get('secureExchange:apiEndpoint');
    const url = `${endpoint}/documents`;

    const data = await postData(accessToken, req.body, url, req.session?.correlationID);

    //save documentID to session
    req.session['secureExchangeDocumentIDs'] = (req.session['secureExchangeDocumentIDs'] || []).concat(data.documentID);
    return res.status(HttpStatus.OK).json(data);
  } catch(e) {
    log.error('uploadFileWithoutRequest Error', e.stack);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Upload secureExchange file error'
    });
  }
}

async function getDocument(token, secureExchangeID, documentID, includeDocData = 'Y') {
  try {
    const endpoint = config.get('secureExchange:apiEndpoint');
    return await getData(token, `${endpoint}/${secureExchangeID}/documents/${documentID}?includeDocData=${includeDocData}`);
  } catch (e) {
    throw new ServiceError('getDocument error', e);
  }
}

async function deleteDocument(req, res) {
  try{
    const accessToken = getAccessToken(req);
    if(!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    let resData = await getDocument(accessToken, req.params.id, req.params.documentId, 'N');

    if(!req.session['secureExchange'] || resData.createDate <= req.session['secureExchange'].statusUpdateDate ||
      req.session['secureExchange']['secureExchangeStatusCode'] === SecureExchangeStatuses.CLOSED) {
      return res.status(HttpStatus.CONFLICT).json({
        message: 'Delete secureExchange file not allowed'
      });
    }

    const endpoint = config.get('secureExchange:apiEndpoint');
    const url = `${endpoint}/${req.params.id}/documents/${req.params.documentId}`;
    await deleteData(accessToken, url);
    return res.status(HttpStatus.OK).json();
  } catch (e) {
    log.error('deleteDocument Error', e.stack);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Delete secureExchange document error',
      errorSource: e.errorSource
    });
  }
}

async function downloadFile(req, res) {
  try{
    const accessToken = getAccessToken(req);
    if(!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    let resData = await getDocument(accessToken, req.params.id, req.params.documentId, 'Y');

    res.setHeader('Content-disposition', 'attachment; filename=' + resData.fileName?.replace(/ /g, '_').replace(/,/g, '_').trim());
    res.setHeader('Content-type', resData.fileExtension);

    return res.status(HttpStatus.OK).send(Buffer.from(resData.documentData, 'base64'));
  } catch (e) {
    log.error('downloadFile Error', e.stack);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Download secureExchange file error',
      errorSource: e.errorSource
    });
  }
}

async function getExchanges(req, res) {

  const params = {
    params: {
      pageNumber: req.query.pageNumber,
      pageSize: req.query.pageSize,
      sort: req.query.sort,
      searchCriteriaList: req.query.searchParams?JSON.stringify(buildSearchParams(req.query.searchParams)):'[]',
    }
  };

  try {
    const token = getAccessToken(req);

    const response = await getData(token, config.get('edx:exchangeURL')+'/paginated', params);
    return res.status(HttpStatus.OK).json(response);
  } catch (e) {
    log.error(e, 'getExchanges', 'Error getting paginated list of secure exchanges.');
    return errorResponse(res);
  }
}

/**
 * Returns an array of search criteria objects to query EDX API
 *
 * @param searchParams object with keys of the columns we are searching for
 */
const buildSearchParams = (searchParams) => {
  return Object.entries(JSON.parse(searchParams))
    .map(([key, value]) => createSearchParamObject(key, value));
};

/**
 * Returns an object that has the following properties key, value, operation, valueType
 * Helper function when building search params for querying EDX API
 *
 * @param key of what we are searching in
 * @param value of what we are searching for
 */
const createSearchParamObject = (key, value) => {
  let operation = FILTER_OPERATION.CONTAINS_IGNORE_CASE;
  let valueType = VALUE_TYPE.STRING;

  if (key === 'sequenceNumber') {
    operation = FILTER_OPERATION.EQUAL;
  }

  if (key === 'createDate') {
    value.forEach((date, index) => {
      value[index] = date + 'T00:00:01';
    });
    if (value.length === 1) {
      value.push(LocalDateTime.now().toString());
    }
    value = value.join(',');
    operation = FILTER_OPERATION.BETWEEN;
    valueType = VALUE_TYPE.DATE_TIME;
  }
  return {key, value, operation, valueType};
};

module.exports = {
  getUserInfo,
  verifyRequest,
  deleteDocument,
  downloadFile,
  uploadFile,
  uploadFileWithoutRequest,
  getExchanges
};

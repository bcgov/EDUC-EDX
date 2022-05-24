'use strict';
const {FILTER_OPERATION, VALUE_TYPE} = require('../util/constants');
const {
  getSessionUser,
  getAccessToken,
  deleteData,
  getData,
  postData,
  putData,
  SecureExchangeStatuses,
  errorResponse,
  getCodeTable,
  getDataWithParams
} = require('./utils');
const config = require('../config/index');
const log = require('./logger');

const HttpStatus = require('http-status-codes');
const {ServiceError} = require('./error');
const {LocalDateTime, DateTimeFormatter} = require('@js-joda/core');
const {CACHE_KEYS} = require('./constants');
const cacheService = require('./cache-service');

function verifyRequest(req, res, next) {
  const userInfo = getSessionUser(req);
  if (!userInfo) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      status: HttpStatus.UNAUTHORIZED,
      message: 'you are not authorized to access this page'
    });
  }

  const secureExchangeID = req.params.id;
  if (!req || !req.session || !req.session['secureExchange'] || req.session['secureExchange']['secureExchangeID'] !== secureExchangeID) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Wrong secureExchangeID'
    });
  }

  next();
}


async function uploadFile(req, res) {
  try {
    const accessToken = getAccessToken(req);
    if (!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    if (!req.session['secureExchange'] || req.session['secureExchange']['secureExchangeStatusCode'] === SecureExchangeStatuses.CLOSED) {
      return res.status(HttpStatus.CONFLICT).json({
        message: 'Upload secureExchange file not allowed'
      });
    }

    const endpoint = config.get('secureExchange:apiEndpoint');
    const url = `${endpoint}/${req.params.id}/documents`;

    const data = await postData(accessToken, req.body, url, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('uploadFile Error', e.stack);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Upload secureExchange file error'
    });
  }
}

async function uploadFileWithoutRequest(req, res) {
  try {
    const accessToken = getAccessToken(req);
    if (!accessToken) {
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
  } catch (e) {
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
  try {
    const accessToken = getAccessToken(req);
    if (!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    let resData = await getDocument(accessToken, req.params.id, req.params.documentId, 'N');

    if (!req.session['secureExchange'] || resData.createDate <= req.session['secureExchange'].statusUpdateDate ||
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
  try {
    const accessToken = getAccessToken(req);
    if (!accessToken) {
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

function getCriteria(key, value, operation, valueType) {
  return {key, value, operation, valueType};
}

async function getExchangesPaginated(req) {
  if (!req.session.userMinCodes) {//this implementation has to change when registration part is added.
    return Promise.reject('getExchangesPaginated error: User Mincodes does not exist in session');
  }
  let criteria = [];
  if (req.query.searchParams) {
    criteria = buildSearchParams(req.query.searchParams);
  }
  //This needs to change when we have school selection
  criteria.push(getCriteria('contactIdentifier', req.session.userMinCodes[0], FILTER_OPERATION.EQUAL, VALUE_TYPE.STRING));
  criteria.push(getCriteria('secureExchangeContactTypeCode', 'SCHOOL', FILTER_OPERATION.EQUAL, VALUE_TYPE.STRING));
  const params = {
    params: {
      pageNumber: req.query.pageNumber,
      pageSize: req.query.pageSize,
      sort: req.query.sort,
      searchCriteriaList: JSON.stringify(criteria),
    }
  };

  return getDataWithParams(getAccessToken(req), config.get('edx:exchangeURL') + '/paginated', params);
}

async function createExchange(req, res) {
  try {
    const token = getAccessToken(req);
    const edxUserInfo = req.session.edxUserData[0];
    const message = req.body;
    const payload = {
      contactIdentifier: req.session.userMinCodes[0],
      secureExchangeContactTypeCode: 'SCHOOL',
      ministryOwnershipTeamID: message.ministryOwnershipTeamID,
      subject: message.subject,
      secureExchangeStatusCode: 'NEW',
      isReadByMinistry: false,
      isReadByExchangeContact: true,
      commentsList: [
        {
          commentUserName: edxUserInfo.firstName + ' ' + edxUserInfo.lastName,
          content: message.content
        }
      ]
    };

    const result = await postData(token, payload, config.get('edx:exchangeURL'), null);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    log.error(e, 'createExchange', 'Error occurred while attempting to create a new exchange.');
    return errorResponse(res);
  }
}

async function getExchanges(req, res) {
  const token = getAccessToken(req);
  if (!token && req.session.userMinCodes) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }
  return Promise.all([
    getCodeTable(token, CACHE_KEYS.EDX_SECURE_EXCHANGE_STATUS, config.get('edx:exchangeStatusesURL')),
    getCodeTable(token, CACHE_KEYS.EDX_MINISTRY_TEAMS, config.get('edx:ministryTeamURL')),
    getExchangesPaginated(req)
  ])
    .then(async ([statusCodeResponse, ministryTeamCodeResponse, dataResponse]) => {
      if (statusCodeResponse && ministryTeamCodeResponse && dataResponse?.content) {
        dataResponse['content'].forEach((element) => {
          if (element['secureExchangeStatusCode']) {
            let tempStatus = statusCodeResponse.find(codeStatus => codeStatus['secureExchangeStatusCode'] === element['secureExchangeStatusCode']);
            if (tempStatus?.label) {
              element['secureExchangeStatusCode'] = tempStatus.label;
            }
          }
          if (element['ministryOwnershipTeamID']) {
            let tempMinTeam = ministryTeamCodeResponse.find(minstryTeam => minstryTeam['ministryOwnershipTeamId'] === element['ministryOwnershipTeamID']);
            if (tempMinTeam?.teamName) {
              element['contactIdentifierName'] = tempMinTeam.teamName;
            }
          }
          if (element['createDate']) {
            element['createDate'] = LocalDateTime.parse(element['createDate']).format(DateTimeFormatter.ofPattern('uuuu/MM/dd'));
          }
        });
      }
      return res.status(200).json(dataResponse);
    }).catch(e => {
      log.error(e, 'getExchanges', 'Error getting paginated list of secure exchanges.');
      return errorResponse(res);
    });

}

async function getExchange(req, res) {
  const accessToken = getAccessToken(req);
  if (!accessToken) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }
  return Promise.all([
    getCodeTable(accessToken, CACHE_KEYS.EDX_SECURE_EXCHANGE_STATUS, config.get('edx:exchangeStatusesURL')),
    getCodeTable(accessToken, CACHE_KEYS.EDX_MINISTRY_TEAMS, config.get('edx:ministryTeamURL')),
    getData(accessToken, config.get('edx:exchangeURL')+`/${req.params.secureExchangeID}`)
  ])
    .then(async ([statusCodeResponse, ministryTeamCodeResponse, dataResponse]) => {
      if (statusCodeResponse && dataResponse['secureExchangeStatusCode']) {
        let tempStatus = statusCodeResponse.find(codeStatus => codeStatus['secureExchangeStatusCode'] === dataResponse['secureExchangeStatusCode']);
        dataResponse['secureExchangeStatusCode'] = tempStatus?.label ? tempStatus.label : dataResponse['secureExchangeStatusCode'];
      }
      dataResponse['ministryOwnershipTeamName'] = 'Unknown Team';
      if (ministryTeamCodeResponse && dataResponse['ministryOwnershipTeamID']) {
        let tempMinTeam = ministryTeamCodeResponse.find(ministryTeam => ministryTeam['ministryOwnershipTeamId'] === dataResponse['ministryOwnershipTeamID']);
        dataResponse['ministryOwnershipTeamName'] = tempMinTeam?.teamName ? tempMinTeam.teamName : dataResponse['ministryOwnershipTeamName'];
      }
      dataResponse['createDate'] = dataResponse['createDate'] ? LocalDateTime.parse(dataResponse['createDate']).format(DateTimeFormatter.ofPattern('uuuu/MM/dd')) : 'Unknown Date';
      dataResponse['commentsList'] =  dataResponse['commentsList'] ?  dataResponse['commentsList'] : [];
      let school = cacheService.getSchoolNameJSONByMincode(dataResponse['contactIdentifier']);
      dataResponse['activities'] = [];
      dataResponse['commentsList'].forEach((comment) => {
        let activity = {};
        activity['type'] = 'message';
        activity['timestamp'] = comment['commentTimestamp'] ? LocalDateTime.parse(comment['commentTimestamp']) : '';
        activity['actor'] = comment.edxUserID ? school.schoolName : dataResponse['ministryOwnershipTeamName'];
        activity['title'] =  comment.edxUserID ? school.schoolName : dataResponse['ministryOwnershipTeamName'];
        activity['displayDate'] = comment['commentTimestamp'] ? LocalDateTime.parse(comment['commentTimestamp']).format(DateTimeFormatter.ofPattern('uuuu/MM/dd')) : 'Unknown Date';
        activity['content'] = comment['content'];
        activity['secureExchangeID'] = comment['secureExchangeID'];
        dataResponse['activities'].push(activity);
      });
      dataResponse['activities'].sort((activity1, activity2) => { return activity2.timestamp.compareTo(activity1.timestamp); });
      return res.status(HttpStatus.OK).json(dataResponse);
    }).catch(e => {
      log.error(e, 'getExchange', 'Error getting a secure exchange message.');
      return errorResponse(res);
    });
}

async function markAs(req, res) {
  const accessToken = getAccessToken(req);
  if (!accessToken) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }
  let validReadStatuses = ['read', 'unread'];
  let readStatus = req.params.readStatus;
  if (validReadStatuses.indexOf(readStatus) === -1) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Invalid read status. Please specify read or unread.'
    });
  }
  let isReadByExchangeContact = readStatus === 'read';
  try {
    const currentExchange = await getData(accessToken, config.get('edx:exchangeURL') + `/${req.params.secureExchangeID}`);
    if (currentExchange.isReadByExchangeContact === isReadByExchangeContact) {
      return res.status(HttpStatus.NOT_MODIFIED).json({
        message: `The status is already marked as ${readStatus}.`
      });
    }
    currentExchange.isReadByExchangeContact = isReadByExchangeContact;
    currentExchange.createDate = null;
    currentExchange.updateDate = null;
    const result = await putData(accessToken, currentExchange, `${config.get('edx:exchangeURL')}`);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    log.error(e, 'markAs', 'Error with updating the read status of an exchange.');
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
      value[index] = date + 'T00:00:00';
    });
    if (value.length === 1) {
      value.push(LocalDateTime.parse(value[0]).plusHours(23).plusMinutes(59).plusSeconds(59));
    }
    value = value.join(',');
    operation = FILTER_OPERATION.BETWEEN;
    valueType = VALUE_TYPE.DATE_TIME;
  }
  if (key === 'secureExchangeStatusCode') {
    value = value.join(',');
    operation = FILTER_OPERATION.IN;
  }
  return {key, value, operation, valueType};
};

module.exports = {
  verifyRequest,
  deleteDocument,
  downloadFile,
  uploadFile,
  uploadFileWithoutRequest,
  createExchange,
  getExchanges,
  getExchange,
  markAs
};

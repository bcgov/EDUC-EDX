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
const {getApiCredentials} = require('./auth');
const cacheService = require('./cache-service');
const user = require('../components/user');

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

    const endpoint = config.get('edx:exchangeURL');
    const url = `${endpoint}/${req.params.id}/documents`;

    const edxUserInfo = req.session.edxUserData;
    if (!edxUserInfo) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No EDX User Info token'
      });
    }

    req.body.edxUserID = edxUserInfo.edxUserID;

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

    const endpoint = config.get('edx:exchangeURL');
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

async function getDocument(token, secureExchangeID, documentID) {
  try {
    const endpoint = config.get('edx:exchangeURL');
    return await getData(token, `${endpoint}/${secureExchangeID}/documents/${documentID}`);
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

    let resData = await getDocument(accessToken, req.params.id, req.params.documentId);

    if (!req.session['secureExchange'] || resData.createDate <= req.session['secureExchange'].statusUpdateDate ||
      req.session['secureExchange']['secureExchangeStatusCode'] === SecureExchangeStatuses.CLOSED) {
      return res.status(HttpStatus.CONFLICT).json({
        message: 'Delete secureExchange file not allowed'
      });
    }

    const endpoint = config.get('edx:exchangeURL');
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

    let resData = await getDocument(accessToken, req.params.id, req.params.documentId);

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
  if (!req.session.activeInstituteIdentifier) {
    return Promise.reject('getExchangesPaginated error: User activeInstituteIdentifier does not exist in session');
  }
  let criteria = [];
  if (req.query.searchParams) {
    criteria = buildSearchParams(req.query.searchParams);
  }
  //This needs to change when we have school selection
  criteria.push(getCriteria('contactIdentifier', req.session.activeInstituteIdentifier, FILTER_OPERATION.EQUAL, VALUE_TYPE.STRING));
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

async function getExchangesCountPaginated(req) {
  if (!req.session.activeInstituteIdentifier) {
    return Promise.reject('getExchangesCountPaginated error: User activeInstituteIdentifier does not exist in session');
  }
  const params = {
    params: {
      pageNumber: req.query.pageNumber,
      pageSize: req.query.pageSize,
      sort: '',
      searchCriteriaList: '[{"key":"secureExchangeStatusCode","value":"OPEN","operation":"in","valueType":"STRING"},{"key":"contactIdentifier","value":"'+req.session.activeInstituteIdentifier+'","operation":"eq","valueType":"STRING"},{"key":"secureExchangeContactTypeCode","value":"SCHOOL","operation":"eq","valueType":"STRING"}]'
    }
  };

  return getDataWithParams(getAccessToken(req), config.get('edx:exchangeURL') + '/paginated', params);
}

async function createExchange(req, res) {
  try {
    const token = getAccessToken(req);
    const edxUserInfo = req.session.edxUserData;
    const message = req.body;

    const documentPayload = message.secureExchangeDocuments.map(document => {
      return {...document, edxUserID: edxUserInfo.edxUserID};
    });
    const studentPayload = message.secureExchangeStudents.map(student => {
      return {
        studentId: student.studentID,
        edxUserID: edxUserInfo.edxUserID
      };
    });

    const payload = {
      contactIdentifier: req.session.activeInstituteIdentifier,
      secureExchangeContactTypeCode: 'SCHOOL',
      ministryOwnershipTeamID: message.ministryOwnershipTeamID,
      subject: message.subject,
      secureExchangeStatusCode: 'OPEN',
      isReadByMinistry: false,
      isReadByExchangeContact: true,
      commentsList: [
        {
          edxUserID: edxUserInfo.edxUserID,
          commentUserName: edxUserInfo.firstName + ' ' + edxUserInfo.lastName,
          content: message.content
        }
      ],
      documentList: documentPayload,
      studentList: studentPayload
    };

    const result = await postData(token, payload, config.get('edx:exchangeURL'), null);

    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    log.error(e, 'createExchange', 'Error occurred while attempting to create a new exchange.');
    return errorResponse(res);
  }
}

async function instituteSelection(req, res) {
  if (req.session.userMinCodes.includes(req.body.params.mincode)) {
    setSessionInstituteIdentifiers(req, req.body.params.mincode, 'SCHOOL');
    return res.status(200).json('OK');
  } else {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No session data'
    });
  }
}

async function clearActiveSession(req) {
  req.session.activeInstituteIdentifier = '';
  req.session.activeInstituteType = '';
  req.session.activeInstitutePermissions= '';
  req.session.activeInstituteTitle= '';
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
    getData(accessToken, config.get('edx:exchangeURL') + `/${req.params.secureExchangeID}`)
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
      dataResponse['commentsList'] = dataResponse['commentsList'] ? dataResponse['commentsList'] : [];
      let school = cacheService.getSchoolNameJSONByMincode(dataResponse['contactIdentifier']);
      dataResponse['activities'] = [];
      dataResponse['commentsList'].forEach((comment) => {
        let activity = {};
        activity['type'] = 'message';
        activity['isSchool'] = comment.edxUserID ? true : false;
        activity['timestamp'] = comment['commentTimestamp'] ? LocalDateTime.parse(comment['commentTimestamp']) : '';
        activity['actor'] = comment.edxUserID ? school.schoolName : dataResponse['ministryOwnershipTeamName'];
        activity['title'] = comment.edxUserID ? school.schoolName : dataResponse['ministryOwnershipTeamName'];
        activity['displayDate'] = comment['commentTimestamp'] ? LocalDateTime.parse(comment['commentTimestamp']).format(DateTimeFormatter.ofPattern('uuuu/MM/dd HH:mm')) : 'Unknown Date';
        activity['content'] = comment['content'];
        activity['secureExchangeID'] = comment['secureExchangeID'];
        activity['secureExchangeCommentID'] = comment['secureExchangeCommentID'];
        dataResponse['activities'].push(activity);
      });

      if (dataResponse['documentList']) {
        dataResponse['documentList'].forEach((document) => {
          let activity = {};
          activity['type'] = 'document';
          activity['isSchool'] = document.edxUserID ? true : false;
          activity['timestamp'] = document['createDate'] ? LocalDateTime.parse(document['createDate']) : '';
          activity['actor'] = document.edxUserID ? document.edxUserID : document.staffUserIdentifier;
          activity['title'] = document.edxUserID ? school.schoolName : dataResponse['ministryOwnershipTeamName'];
          activity['fileName'] = document.fileName;
          activity['documentType'] = cacheService.getDocumentTypeCodeLabelByCode(document.documentTypeCode);
          activity['displayDate'] = document['createDate'] ? LocalDateTime.parse(document['createDate']).format(DateTimeFormatter.ofPattern('uuuu/MM/dd HH:mm')) : 'Unknown Date';
          activity['documentID'] = document['documentID'];
          dataResponse['activities'].push(activity);
        });
      }
      dataResponse['activities'].sort((activity1, activity2) => {
        return activity2.timestamp.compareTo(activity1.timestamp);
      });

      req.session.secureExchange = dataResponse;

      return res.status(HttpStatus.OK).json(dataResponse);
    }).catch(e => {
      log.error(e, 'getExchange', 'Error getting a secure exchange message.');
      return errorResponse(res);
    });
}

async function getExchangesCount(req, res) {
  const token = getAccessToken(req);
  if (!token && req.session.userMinCodes) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }
  return Promise.all([
    getCodeTable(token, CACHE_KEYS.EDX_SECURE_EXCHANGE_STATUS, config.get('edx:exchangeStatusesURL')),
    getCodeTable(token, CACHE_KEYS.EDX_MINISTRY_TEAMS, config.get('edx:ministryTeamURL')),
    getExchangesCountPaginated(req)
  ])
    .then(async ([statusCodeResponse, ministryTeamCodeResponse, dataResponse]) => {
      let urExchangeCount = 0;
      let exchangeCount = 0;
      if (statusCodeResponse && ministryTeamCodeResponse && dataResponse?.content) {
        dataResponse['content'].forEach((element) => {
          if (!element['isReadByExchangeContact']) {
            urExchangeCount++;
          }
          exchangeCount++;
        });
      }
      return res.status(200).json({
        exchangeCount: exchangeCount,
        unreadExchangeCount: urExchangeCount,
      });
    }).catch(e => {
      log.error(e, 'getExchanges', 'Error getting paginated list of secure exchanges.');
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
      return res.status(HttpStatus.OK).json({
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

async function updateEdxUserRoles(req, res) {
  try {
    const token = getAccessToken(req);
    let response = await getData(token, config.get('edx:edxUsersURL') + '/' + req.body.params.edxUserID);

    let selectedUserSchool = response.edxUserSchools.filter(school => school.mincode === req.body.params.mincode);

    let rolesToBeRemoved = [];

    //Determine roles to be removed
    selectedUserSchool[0].edxUserSchoolRoles.forEach(function (userSchoolRole) {
      if (!req.body.params.selectedRoles.filter(value => userSchoolRole.edxRoleCode === value).length > 0) {
        rolesToBeRemoved.push(userSchoolRole.edxRoleCode);
      }
    });

    selectedUserSchool[0].edxUserSchoolRoles = selectedUserSchool[0].edxUserSchoolRoles.filter(value => !rolesToBeRemoved.includes(value.edxRoleCode));

    //Roles to be added
    req.body.params.selectedRoles.forEach(function (role) {
      if (!selectedUserSchool[0].edxUserSchoolRoles.filter(value => role === value.edxRoleCode).length > 0) {
        let newRole = {};
        newRole.edxUserSchoolID = selectedUserSchool[0].edxUserSchoolID;
        newRole.edxRoleCode = role;
        selectedUserSchool[0].edxUserSchoolRoles.push(newRole);
      }
    });

    selectedUserSchool[0].updateDate = null;
    selectedUserSchool[0].createDate = null;

    const payload = {
      ...selectedUserSchool[0]
    };

    const result = await putData(token, payload, config.get('edx:edxUsersURL') + '/' + selectedUserSchool[0].edxUserID + '/school', req.session.correlationID);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    log.error(e, 'updateEdxUserRoles', 'Error occurred while attempting to update user roles.');
    return errorResponse(res);
  }
}

async function activateSchoolUser(req, res) {
  const token = getAccessToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }
  const numberOfRetries = req.session[`${req.body.validationCode}`];
  if (numberOfRetries && numberOfRetries >= 5) {
    return errorResponse(res, 'You have exceeded the number of activation attempts allowed. Please contact your administrator for a new activation code.', HttpStatus.TOO_MANY_REQUESTS);
  }
  const payload = {
    digitalId: req.session.digitalIdentityData.digitalID,
    ...req.body
  };
  try {
    const response = await postData(token, payload, config.get('edx:userActivationURL'), req.session.correlationID);
    req.session.userMinCodes = response.edxUserSchools?.map(el => el.mincode);
    getAndSetupEDXUserAndRedirect(req, res, token, req.session.digitalIdentityData.digitalID, req.session.correlationID);
  } catch (e) {
    const msg = mapEdxUserActivationErrorMessage(e?.data?.message);
    log.error(e, 'activateSchoolUser', 'Error getting activated user');
    if (e?.status > 399 && e?.status < 410) {
      if (numberOfRetries && numberOfRetries <= 4) {
        req.session[`${req.body.validationCode}`] = numberOfRetries + 1;
      } else {
        req.session[`${req.body.validationCode}`] = 1;
      }
    }
    return errorResponse(res, msg);
  }
}

async function getEdxUsers(req, res) {
  const token = getAccessToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }

  try {
    let response = await getDataWithParams(token, config.get('edx:edxUsersURL'), {params: req.query}, req.session.correlationID);
    let filteredResponse = [];

    //if we search by mincode strip out other school and district information for the frontend
    if (req.query.mincode) {
      filteredResponse = response.map(schoolUser => {
        return {
          ...schoolUser,
          edxUserDistricts: [],
          edxUserSchools: schoolUser.edxUserSchools.filter(school => school.mincode === req.query.mincode)
        };
      });
    }

    return res.status(HttpStatus.OK).json(filteredResponse);
  } catch (e) {
    log.error(e, 'getEdxUsers', 'Error getting EDX users');
    return errorResponse(res);
  }
}

async function schoolUserActivationInvite(req, res) {
  const token = getAccessToken(req);
  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }
  const payload = {
    ...req.body
  };
  try {
    const response = await postData(token, payload, config.get('edx:schoolUserActivationInviteURL'), req.session.correlationID);
    return res.status(200).json(response);
  } catch (e) {
    log.error(e, 'schoolUserActivationInvite', 'Error occurred while sending user activation invite');
    return errorResponse(res);
  }

}

async function createSecureExchangeComment(req, res) {
  try {
    const token = getAccessToken(req);
    const edxUserInfo = req.session.edxUserData;
    const message = req.body;
    const payload = {
      secureExchangeID: req.params.secureExchangeID,
      edxUserID: edxUserInfo.edxUserID,
      commentUserName: edxUserInfo.firstName + ' ' + edxUserInfo.lastName,
      content: message.content,
      commentTimestamp: LocalDateTime.now().toJSON(),
    };

    const result = await postData(token, payload, config.get('edx:exchangeURL') + `/${req.params.secureExchangeID}` + '/comments', req.session.correlationID);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    log.error(e, 'createExchangeComment', 'Error occurred while attempting to create a new exchange comment.');
    return errorResponse(res);
  }
}

function mapEdxUserActivationErrorMessage(message) {
  const msg = message || 'INTERNAL SERVER ERROR';
  if (msg.includes('EdxActivationCode was not found for parameters')) {
    return 'Incorrect activation details have been entered. Please try again.';
  } else if (msg.includes('This Activation Code has expired')) {
    return 'Your activation code has expired. Please contact your administrator for a new activation code.';
  } else if (msg.includes('This User Activation Link has expired')) {
    return 'Your activation link is expired; the activation link should only be usable one time. Please contact your administrator for a new activation code.';
  } else if (msg.includes('This user is already associated to the school')) {
    return 'This user account is already associated to the mincode';
  }
  return msg;
}

async function verifyActivateUserLink(req, res) {
  const baseUrl = config.get('server:frontend');
  if (!req.query.validationCode) {
    return res.redirect(baseUrl + '/activation-error?errorMessage=Invalid URL, please click the link provided in your email to activate your account.');
  }
  const payload = {
    validationCode: req.query.validationCode
  };
  try {
    let data = await getApiCredentials(config.get('oidc:clientId'), config.get('oidc:clientSecret'));
    await postData(data.accessToken, payload, config.get('edx:updateActivationUrlClicked'), req.session?.correlationID);
    return res.redirect(baseUrl + '/api/auth/login_bceid_activate_user');
  } catch (e) {
    let msg = 'Error Occurred please retry with the link provided in the email';
    if (e.status === 400) {
      msg = 'Invalid link clicked. Please click the link provided in your email';
    } else if (e.status === 410) {
      msg = 'Your activation link is expired; the activation link should only be usable one time. Please contact your administrator for a new activation code.';
    }
    log.error(e, 'verifyValidationCode', 'Error verifying Validation Code ');
    return res.redirect(baseUrl + `/activation-error?errorMessage= ${msg}`);
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

  if (key === 'ministryOwnershipTeamID') {
    valueType = VALUE_TYPE.UUID;
    operation = FILTER_OPERATION.EQUAL;
  }
  return {key, value, operation, valueType};
};

function setMincodesAndRedirect(req, res, activatedMincode) {
  if (req.session.userMinCodes.length === 1) {
    setSessionInstituteIdentifiers(req, req.session.userMinCodes[0], 'SCHOOL');
    res.redirect(config.get('server:frontend'));
  } else if (activatedMincode) {
    setSessionInstituteIdentifiers(req, activatedMincode, 'SCHOOL');
    res.redirect(config.get('server:frontend'));
  } else if (req.session.userMinCodes.length > 1) {
    res.redirect(config.get('server:frontend') + '/institute-selection');
  }
}

function getAndSetupEDXUserAndRedirect(req, res, accessToken, digitalID, correlationID, activatedMincode) {
  user.getEdxUserByDigitalId(accessToken, digitalID, correlationID).then(async ([edxUserMinCodeData]) => {
    if (edxUserMinCodeData) {
      req.session.userMinCodes = edxUserMinCodeData.edxUserSchools?.flatMap(el => el.mincode); //this is list of mincodes associated to the user
      if (Array.isArray(edxUserMinCodeData)) {
        req.session.edxUserData = edxUserMinCodeData[0];
      } else {
        req.session.edxUserData = edxUserMinCodeData;
      }
      setMincodesAndRedirect(req, res, activatedMincode);
    } else {
      res.redirect(config.get('server:frontend') + '/unauthorized');
    }
  });
}

function setSessionInstituteIdentifiers(req, activeInstituteIdentifier, activeInstituteType) {
  req.session.activeInstituteIdentifier = activeInstituteIdentifier;
  req.session.activeInstituteType = activeInstituteType;

  let selectedUserSchool = req.session.edxUserData.edxUserSchools.filter(school => school.mincode === activeInstituteIdentifier);
  let permissionsArray = [];
  selectedUserSchool[0].edxUserSchoolRoles.forEach(function (role) {
    permissionsArray.push(...cacheService.getPermissionsForRole(role.edxRoleCode));
  });
  req.session.activeInstitutePermissions = permissionsArray;
}


module.exports = {
  verifyRequest,
  deleteDocument,
  downloadFile,
  uploadFile,
  uploadFileWithoutRequest,
  createExchange,
  getExchanges,
  getExchange,
  markAs,
  activateSchoolUser,
  verifyActivateUserLink,
  instituteSelection,
  getEdxUsers,
  schoolUserActivationInvite,
  updateEdxUserRoles,
  createSecureExchangeComment,
  clearActiveSession,
  setSessionInstituteIdentifiers,
  getAndSetupEDXUserAndRedirect,
  getExchangesCount,
  getExchangesCountPaginated
};

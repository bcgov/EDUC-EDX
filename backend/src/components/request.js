'use strict';

const { getSessionUser, getAccessToken, deleteData, getDataWithParams, getData, postData, putData, RequestStatuses, VerificationResults, EmailVerificationStatuses, RequestApps, generateJWTToken, formatCommentTimestamp } = require('./utils');
const { getApiCredentials } = require('./auth');
const config = require('../config/index');
const log = require('./logger');
const lodash = require('lodash');
const HttpStatus = require('http-status-codes');
const jsonwebtoken = require('jsonwebtoken');
const redisUtil = require('../util/redis/redis-utils');
const localDateTime = require('@js-joda/core').LocalDateTime;
const { ServiceError, ConflictStateError } = require('./error');
const { setPenRequestReplicateStatus } = require('./penRequest');
const { setStudentRequestReplicateStatus } = require('./studentRequest');

let codes = null;

function verifyRequest(requestType) {
  return function getRequestHandler(req, res, next) {
    const userInfo = getSessionUser(req);
    if(!userInfo) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        message: 'you are not authorized to access this page'
      });
    }

    const requestID = req.params.id;
    if(!req || !req.session || !req.session[requestType] || req.session[requestType][`${requestType}ID`] !== requestID) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Wrong requestID'
      });
    }

    next();
  };
}
function verifyPostCommentRequest(requestType) {
  return function getRequestHandler(req, res, next) {
    const userInfo = getSessionUser(req);
    if(!userInfo._json || !userInfo._json.digitalIdentityID){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No session data'
      });
    }
    const accessToken = getAccessToken(req);
    if(!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }
    const requestID = req.params.id;
    if(!req || !req.session || !req.session[requestType] || req.session[requestType][`${requestType}ID`] !== requestID || req.session[requestType][`${requestType}StatusCode`] !== RequestStatuses.RETURNED) {
      return res.status(HttpStatus.CONFLICT).json({
        message: `Post ${requestType} comment not allowed`
      });
    }
    req.userInfo = userInfo;
    req.accessToken = accessToken;

    next();
  };
}

async function getDigitalIdData(token, digitalID, correlationID) {
  try {
    return await getData(token, config.get('digitalID:apiEndpoint') + `/${digitalID}`, correlationID);
  } catch (e) {
    throw new ServiceError('getDigitalIdData error', e);
  }
}

function getStudent(userInfo, sexCodes) {
  const student = {
    studentID: userInfo._json.studentID,
    pen: userInfo._json.pen,
    legalLastName: userInfo._json.legalLastName,
    legalFirstName: userInfo._json.legalFirstName || null,
    legalMiddleNames: userInfo._json.legalMiddleNames || null,
    email: userInfo._json.email || null,
    sexCode: userInfo._json.sexCode,
    genderCode: userInfo._json.sexCode,
    dob: new Date(userInfo._json.dob).toJSON().slice(0, 10),
  };
  const sexInfo = lodash.find(sexCodes, ['sexCode', student.sexCode]);
  if (!sexInfo) {
    throw new ServiceError(`Wrong sexCode: ${student.sexCode}`);
  }
  student.sexLabel = sexInfo.label;
  return student;
}

async function getLatestRequest(token, digitalID, requestType, setReplicateStatus, correlationID) {
  let request = null;
  let sagaInProgress = false;
  const url = config.get(`${requestType}:apiEndpoint`);
  try {
    let data = await getData(token, `${url}/?digitalID=${digitalID}`, correlationID);
    request = lodash.maxBy(data, 'statusUpdateDate') || null;
    if(request) {
      sagaInProgress = await redisUtil.isSagaInProgressForDigitalID(request.digitalID);
      request.digitalID = null;
      request = setReplicateStatus(request);
      request.sagaInProgress = sagaInProgress;
    }
  } catch(e) {
    if(!e.status || e.status !== HttpStatus.NOT_FOUND) {
      throw new ServiceError('getLatestRequest error', e);
    }
  }

  return request;
}

function getDefaultBcscInput(userInfo) {
  let givenArray = (userInfo._json.givenNames).split(' ');
  givenArray.shift();
  let middleNames = givenArray.join(' ');
  return {
    legalLastName: userInfo._json.surname,
    legalFirstName: userInfo._json.givenName,
    legalMiddleNames: middleNames,
    gender: userInfo._json.gender,
    email: userInfo._json.email,
    dob: userInfo._json.birthDate
  };
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
    getLatestRequest(accessToken, digitalID, 'penRequest', setPenRequestReplicateStatus, correlationID),
    getLatestRequest(accessToken, digitalID, 'studentRequest', setStudentRequestReplicateStatus, correlationID),
  ]).then(async ([digitalIdData, codesData, penRequest, studentRequest]) => {

    const identityType = lodash.find(codesData.identityTypes, ['identityTypeCode', digitalIdData.identityTypeCode]);
    if(! identityType) {
      log.error('getIdentityType Error identityTypeCode', digitalIdData.identityTypeCode);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Wrong identityTypeCode'
      });
    }

    let student = null;
    if(userInfo?._json?.studentID) {
      student = getStudent(userInfo, codesData.sexCodes);
    }

    if(req && req.session){
      req.session.digitalIdentityData = digitalIdData;
      req.session.digitalIdentityData.identityTypeLabel = identityType.label;
      req.session.studentRequest = studentRequest;
      req.session.penRequest = penRequest;
    } else {
      throw new ServiceError('userInfo error: session does not exist');
    }
    let resData = {
      displayName: userInfo._json.displayName,
      accountType: userInfo._json.accountType,
      identityTypeLabel: identityType.label,
      ...(userInfo._json.accountType === 'BCSC' ? getDefaultBcscInput(userInfo) : {}),
      studentRequest,
      penRequest,
      student,
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

function getCodes(requestType) {
  return async function getCodesHandler(req, res) {
    try{
      const accessToken = getAccessToken(req);
      if(!accessToken) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'No access token'
        });
      }
      const correlationID = req.session?.correlationID;
      const endpoint = config.get(`${requestType}:apiEndpoint`);
      const codeUrls = [
        `${endpoint}/gender-codes`,
        `${endpoint}/statuses`,
      ];

      let [genderCodes, statusCodes] = await Promise.all(codeUrls.map(url => getData(accessToken, url, correlationID)));
      if(genderCodes){
        // forcing sort if API did not return in sorted order.
        const curDate = localDateTime.now();
        genderCodes = genderCodes.filter(d => curDate.isAfter(localDateTime.parse(d.effectiveDate)) && curDate.isBefore(localDateTime.parse(d.expiryDate)));
        genderCodes.sort((a,b)=> a.displayOrder - b.displayOrder);
      }
      return res.status(HttpStatus.OK).json({genderCodes, statusCodes});
    } catch (e) {
      log.error('getCodes Error', e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Get codes error'
      });
    }
  };
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

async function sendVerificationEmail(accessToken, emailAddress, requestId, identityTypeLabel, requestType, correlationID) {
  const verificationUrl = config.get('server:frontend') + `/api/${RequestApps[requestType]}/verification?verificationToken`;
  const reqData = {
    emailAddress,
    [`${requestType}Id`]: requestId,
    identityTypeLabel,
    verificationUrl: verificationUrl
  };
  log.info('sendVerificationEmail reqData', reqData);
  const url = config.get('email:apiEndpoint') + `/${RequestApps[requestType]}/verify`;
  try {
    const payload = {
      SCOPE: 'VERIFY_EMAIL'
    };
    reqData.jwtToken = await generateJWTToken(requestId, emailAddress, 'VerifyEmailAPI', 'HS256', payload);
    return await postData(accessToken, reqData, url, correlationID);
  } catch (e) {
    throw new ServiceError('sendVerificationEmail error', e);
  }
}

async function getAutoMatchResults(accessToken, userInfo, correlationID) {
  try {
    const url = config.get('demographics:apiEndpoint');

    let params = {
      params: {
        studSurName: userInfo['surname'],
        studGiven: userInfo['givenName'],
        studMiddle: userInfo['givenNames'] && userInfo['givenNames'].replace(userInfo['givenName'],'').trim(),
        studBirth: userInfo['birthDate'] && userInfo['birthDate'].split('-').join(''),
        studSex: userInfo['gender'] && userInfo['gender'].charAt(0)
      }
    };

    const autoMatchResults = await getDataWithParams(accessToken, url, params, correlationID);
    let bcscAutoMatchOutcome;
    let bcscAutoMatchDetails;
    if(autoMatchResults.length < 1) {
      bcscAutoMatchOutcome = 'ZEROMATCHES';
      bcscAutoMatchDetails = 'Zero PEN records found by BCSC auto-match';
    }
    else if(autoMatchResults.length > 1) {
      bcscAutoMatchOutcome = 'MANYMATCHES';
      bcscAutoMatchDetails = autoMatchResults.length + ' PEN records found by BCSC auto-match';
    }
    else {
      bcscAutoMatchOutcome = 'ONEMATCH';
      const lastName = autoMatchResults[0]['studSurname'] ? autoMatchResults[0]['studSurname'] : '(none)';
      const firstName = autoMatchResults[0]['studGiven'] ? autoMatchResults[0]['studGiven'] : '(none)';
      const middleName = autoMatchResults[0]['studMiddle'] ? autoMatchResults[0]['studMiddle'] : '(none)';
      bcscAutoMatchDetails = `${autoMatchResults[0].pen} ${lastName}, ${firstName}, ${middleName}`;
    }

    return {
      bcscAutoMatchOutcome: bcscAutoMatchOutcome,
      bcscAutoMatchDetails: bcscAutoMatchDetails
    };
  } catch(e) {
    throw new ServiceError('getAutoMatchResults error', e);
  }
}

async function postRequest(accessToken, reqData, userInfo, requestType, correlationID) {
  try{
    const url = config.get(`${requestType}:apiEndpoint`) + '/';

    if(userInfo.accountType === 'BCSC') {
      const autoMatchResults = await getAutoMatchResults(accessToken, userInfo, correlationID);
      reqData.bcscAutoMatchOutcome = autoMatchResults.bcscAutoMatchOutcome;
      reqData.bcscAutoMatchDetails = autoMatchResults.bcscAutoMatchDetails;
    }
    if(!reqData.emailVerified){
      reqData.emailVerified = EmailVerificationStatuses.NOT_VERIFIED;
    }
    reqData.digitalID = userInfo.digitalIdentityID;
    let resData = await postData(accessToken, reqData, url, correlationID);
    resData.digitalID = null;

    return resData;
  } catch(e) {
    throw new ServiceError('postRequest error', e);
  }
}

function submitRequest(requestType, verifyRequestStatus) {
  return async function submitRequestHandler(req, res) {
    try{
      const userInfo = getSessionUser(req);
      if(!userInfo) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'No session data'
        });
      }

      const accessToken = userInfo.jwt;

      if(req && req.session && req.session[requestType] && verifyRequestStatus(req.session[requestType])) {
        return res.status(HttpStatus.CONFLICT).json({
          message: `Submit ${requestType} not allowed`
        });
      }
      const correlationID = req.session?.correlationID;

      const resData = await postRequest(accessToken, req.body, userInfo._json, requestType, correlationID);

      req.session[requestType] = resData;
      if(req.body.email && req.body.email !== req.body.recordedEmail) {
        sendVerificationEmail(accessToken, req.body.email, resData[`${requestType}ID`], req.session.digitalIdentityData.identityTypeLabel, requestType, correlationID).catch(e =>
          log.error('sendVerificationEmail Error', e.stack)
        );
      }

      return res.status(HttpStatus.OK).json(resData);
    } catch(e) {
      log.error('submitRequest Error', e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `Submit ${requestType} error`,
        errorSource: e.errorSource
      });
    }
  };
}

function postComment(requestType, createCommentPayload, createCommentEvent, correlationID) {
  return async function postCommentHandler(req, res) {
    try{
      const userInfo = req.userInfo;
      const accessToken = req.accessToken;
      const url = config.get('profileSagaAPIURL') + config.get(`${requestType}:commentSagaEndpoint`);
      const payload = createCommentPayload(req.params.id, req.body.content);
      const sagaId = await postData(accessToken, payload, url, correlationID);
      const event = createCommentEvent(sagaId, req.params.id, userInfo._json.digitalIdentityID);

      log.info(`going to store event object in redis for ${requestType} comment saga :: `, event);
      await redisUtil.createProfileRequestSagaRecordInRedis(event);
      return res.status(HttpStatus.OK).json();
    } catch(e) {
      log.error('postComment Error', e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `Post ${requestType} comment error`
      });
    }
  };
}

function getComments(requestType) {
  return async function getCommentsHandler(req, res) {
    try{
      const userInfo = getSessionUser(req);
      if(!userInfo) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'No session data'
        });
      }

      const accessToken = userInfo.jwt;
      const endpoint = config.get(`${requestType}:apiEndpoint`);
      const url = `${endpoint}/${req.params.id}/comments`;
      const apiResData = await getData(accessToken, url, req.session?.correlationID);

      let response = {
        participants: [],
        myself: {
          name: userInfo._json.displayName,
          id: '1'
        },
        messages: []
      };
      apiResData.sort((a,b) => (a.commentTimestamp > b.commentTimestamp) ? 1 : ((b.commentTimestamp > a.commentTimestamp) ? -1 : 0));

      apiResData.forEach(element => {
        const participant = {
          name: (element.staffMemberName ? element.staffMemberName : 'Student'),
          id: (element.staffMemberIDIRGUID ? element.staffMemberIDIRGUID : '1')
        };

        if (participant && participant.id && participant.id.toUpperCase() !== response.myself.id.toUpperCase()) {
          const index = response.participants.findIndex((e) => e.id === participant.id);

          if (index === -1) {
            response.participants.push(participant);
          }
        }

        response.messages.push({
          content: element.commentContent,
          participantId: (element.staffMemberIDIRGUID ? element.staffMemberIDIRGUID : '1'),
          myself: participant.id.toUpperCase() === response.myself.id.toUpperCase(),
          timestamp: element.commentTimestamp,
          readableTime: formatCommentTimestamp(element.commentTimestamp)
        });
      });

      return res.status(HttpStatus.OK).json(response);
    } catch (e) {
      log.error('getComments Error', e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `${requestType} Comments Get error`
      });
    }
  };
}

function beforeUpdateRequestAsInitrev(request, requestType) {
  if(request[`${requestType}StatusCode`] !== RequestStatuses.DRAFT) {
    throw new ConflictStateError(`Current ${requestType} Status: ` + request[`${requestType}StatusCode`]);
  }

  if(request.emailVerified !== EmailVerificationStatuses.NOT_VERIFIED) {
    throw new ConflictStateError(`Current ${requestType} Email Verification Status: ` + request.emailVerified);
  }

  request.initialSubmitDate = localDateTime.now().toString();
  request.emailVerified = EmailVerificationStatuses.VERIFIED;

  return request;
}

async function setRequestAsInitrev(requestID, requestType, correlationID) {
  let data = await getApiCredentials(config.get('oidc:clientId'), config.get('oidc:clientSecret'));
  const accessToken = data.accessToken;

  return updateRequestStatus(accessToken, requestID, RequestStatuses.INITREV, requestType, beforeUpdateRequestAsInitrev, correlationID);
}

function verifyEmailToken(token) {
  try{
    const tokenPayload = jsonwebtoken.verify(token, config.get('email:secretKey'));
    if(tokenPayload.SCOPE !== 'VERIFY_EMAIL') {
      log.error('verifyEmailToken Error', `Invalid SCOPE: ${tokenPayload.SCOPE}`);
      return [{name: 'JsonWebTokenError'}, null];
    }

    if(! tokenPayload.jti) {
      log.error('verifyEmailToken Error', 'Invalid Request ID');
      return [{name: 'JsonWebTokenError'}, null];
    }

    return [null, tokenPayload.jti];
  }catch(e){
    log.error('verifyEmailToken Err', e.stack);
    return [e, null];
  }
}

function verifyEmail(requestType) {
  return async function verifyEmailHandler(req, res) {
    const loggedin = getSessionUser(req);
    const baseUrl = config.get('server:frontend');
    const appUrl = `${baseUrl}/${RequestApps[requestType]}`;
    const verificationUrl = `${baseUrl}/${RequestApps[requestType]}/verification/`;

    if(! req.query.verificationToken) {
      return res.redirect(verificationUrl + VerificationResults.TOKEN_ERROR);
    }

    try{
      const [error, requestID] = verifyEmailToken(req.query.verificationToken);
      if(error && error.name === 'TokenExpiredError') {
        return res.redirect(loggedin ? appUrl : (verificationUrl + VerificationResults.EXPIRED));
      } else if (error) {
        return res.redirect(verificationUrl + VerificationResults.TOKEN_ERROR);
      }

      const data = await setRequestAsInitrev(requestID, requestType, req.session?.correlationID);
      if(loggedin) {
        req.session[requestType] = data;
      }

      return res.redirect(loggedin ? appUrl : (verificationUrl + VerificationResults.OK));
    }catch(e){
      if(e instanceof ConflictStateError) {
        return res.redirect(loggedin ? appUrl : (verificationUrl + VerificationResults.OK));
      } else {
        log.error('verifyEmail Error', e.stack);
        return res.redirect(verificationUrl + VerificationResults.SERVER_ERROR);
      }
    }
  };
}

async function updateRequestStatus(accessToken, requestID, requestStatus, requestType, beforeUpdate, correlationID) {
  try {
    const endpoint = config.get(`${requestType}:apiEndpoint`);
    let data = await getData(accessToken, `${endpoint}/${requestID}`, correlationID);

    let request = beforeUpdate(data, requestType);
    request[`${requestType}StatusCode`] = requestStatus;
    request.statusUpdateDate = localDateTime.now().toString();

    data = await putData(accessToken, request, endpoint, correlationID);
    data.digitalID = null;

    return data;
  } catch (e) {
    if(e instanceof ConflictStateError) {
      throw e;
    } else {
      throw new ServiceError('updateRequestStatus error', e);
    }
  }
}

function beforeUpdateRequestAsSubsrev(request, requestType) {
  if(request[`${requestType}StatusCode`] !== RequestStatuses.RETURNED) {
    throw new ConflictStateError(`Current ${requestType} Status: ` + request[`${requestType}StatusCode`]);
  }

  return request;
}

function setRequestAsSubsrev(requestType) {
  return async function setRequestAsSubsrevHandler(req, res) {
    try{
      const accessToken = getAccessToken(req);
      if(!accessToken) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'No access token'
        });
      }

      const requestID = req.params.id;
      const requestStatus = req.body[`${requestType}StatusCode`];

      if(! requestStatus) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: `No ${requestType}StatusCode data`
        });
      }

      if(requestStatus !== RequestStatuses.SUBSREV) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: `Wrong ${requestType}StatusCode`
        });
      }

      let data = await updateRequestStatus(accessToken, requestID, requestStatus, requestType, beforeUpdateRequestAsSubsrev);
      req.session[requestType] = data;

      return res.status(HttpStatus.OK).json(data);
    } catch(e) {
      log.error('setRequestAsSubsrev Error', e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `Set ${requestType} as subsrev error`,
        errorSource: e.errorSource
      });
    }
  };
}

function resendVerificationEmail(requestType) {
  return async function resendVerificationEmailHandler(req, res) {
    try{
      const accessToken = getAccessToken(req);
      if(!accessToken) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'No access token'
        });
      }

      if(req.session[requestType][`${requestType}StatusCode`] !== RequestStatuses.DRAFT) {
        return res.status(HttpStatus.CONFLICT).json({
          message: `Resend ${requestType} verification email not allowed`
        });
      }

      const data = await sendVerificationEmail(accessToken, req.session[requestType].email, req.session[requestType][`${requestType}ID`],
        req.session.digitalIdentityData.identityTypeLabel, requestType);

      return res.status(HttpStatus.OK).json(data);
    } catch(e) {
      log.error('resendVerificationEmail Error', e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `Resend ${requestType} verification email error`,
        errorSource: e.errorSource
      });
    }
  };
}

function uploadFile(requestType) {
  return async function uploadFileHandler(req, res) {
    try{
      const accessToken = getAccessToken(req);
      if(!accessToken) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'No access token'
        });
      }

      if(!req.session[requestType] || req.session[requestType][`${requestType}StatusCode`] !== RequestStatuses.RETURNED) {
        return res.status(HttpStatus.CONFLICT).json({
          message: `Upload ${requestType} file not allowed`
        });
      }

      const endpoint = config.get(`${requestType}:apiEndpoint`);
      const url = `${endpoint}/${req.params.id}/documents`;

      const data = await postData(accessToken, req.body, url, req.session?.correlationID);
      return res.status(HttpStatus.OK).json(data);
    } catch(e) {
      log.error('uploadFile Error', e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `Upload ${requestType} file error`
      });
    }
  };
}

async function getDocument(token, requestID, documentID, requestType, includeDocData = 'Y') {
  try {
    const endpoint = config.get(`${requestType}:apiEndpoint`);
    return await getData(token, `${endpoint}/${requestID}/documents/${documentID}?includeDocData=${includeDocData}`);
  } catch (e) {
    throw new ServiceError('getDocument error', e);
  }
}

function deleteDocument(requestType) {
  return async function deleteDocumentHandler(req, res) {
    try{
      const accessToken = getAccessToken(req);
      if(!accessToken) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'No access token'
        });
      }

      let resData = await getDocument(accessToken, req.params.id, req.params.documentId, requestType, 'N');

      if(!req.session[requestType] || resData.createDate <= req.session[requestType].statusUpdateDate ||
        req.session[requestType][`${requestType}StatusCode`] !== RequestStatuses.RETURNED) {
        return res.status(HttpStatus.CONFLICT).json({
          message: `Delete ${requestType} file not allowed`
        });
      }

      const endpoint = config.get(`${requestType}:apiEndpoint`);
      const url = `${endpoint}/${req.params.id}/documents/${req.params.documentId}`;

      await deleteData(accessToken, url);
      return res.status(HttpStatus.OK).json();
    } catch (e) {
      log.error('deleteDocument Error', e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `Delete ${requestType} document error`,
        errorSource: e.errorSource
      });
    }
  };
}

function downloadFile(requestType) {
  return async function downloadFileHandler(req, res) {
    try{
      const accessToken = getAccessToken(req);
      if(!accessToken) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'No access token'
        });
      }

      let resData = await getDocument(accessToken, req.params.id, req.params.documentId, requestType, 'Y');

      res.setHeader('Content-disposition', 'attachment; filename=' + resData.fileName?.replace(/ /g, '_').replace(/,/g, '_').trim());
      res.setHeader('Content-type', resData.fileExtension);

      return res.status(HttpStatus.OK).send(Buffer.from(resData.documentData, 'base64'));
    } catch (e) {
      log.error('downloadFile Error', e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `Download ${requestType} file error`,
        errorSource: e.errorSource
      });
    }
  };
}

module.exports = {
  getUserInfo,
  getCodes,
  submitRequest,
  postComment,
  getComments,
  verifyEmail,
  verifyEmailToken,
  setRequestAsSubsrev,
  resendVerificationEmail,
  verifyRequest,
  verifyPostCommentRequest,
  deleteDocument,
  downloadFile,
  uploadFile
};

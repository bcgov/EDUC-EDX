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
  handleExceptionResponse,
  getCodeTable,
  getDataWithParams,
  checkEDXUserAccess,
  checkEDXUserDistrictAdminPermission,
  checkEDXUserAccessForSchoolAdminFunctions
} = require('./utils');
const config = require('../config/index');
const log = require('./logger');

const HttpStatus = require('http-status-codes');
const {ServiceError} = require('./error');
const {LocalDateTime, DateTimeFormatter} = require('@js-joda/core');
const {CACHE_KEYS} = require('../util/constants');
const {getApiCredentials} = require('./auth');
const cacheService = require('./cache-service');
const user = require('../components/user');
const {isSchoolActive} = require('./schoolUtils');
const {isDistrictActive} = require('./districtUtils');

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
    const token = getAccessToken(req);
    validateAccessToken(token);
    let secureExchangeData = await getData(token, config.get('edx:exchangeURL') + `/${req.params.id}`, req.session?.correlationID);
    checkSecureExchangeAccess(req, res, secureExchangeData);

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

    const data = await postData(token, req.body, url, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('uploadFile Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getDocument(token, secureExchangeID, documentID, correlationID) {
  try {
    const endpoint = config.get('edx:exchangeURL');
    return await getData(token, `${endpoint}/${secureExchangeID}/documents/${documentID}`, correlationID);
  } catch (e) {
    throw new ServiceError('getDocument error', e);
  }
}

async function deleteDocument(req, res) {
  try {
    const token = getAccessToken(req);
    validateAccessToken(token);

    let resData = await getDocument(token, req.params.id, req.params.documentId, req.session?.correlationID);
    let secureExchangeData = await getData(token, config.get('edx:exchangeURL') + `/${req.params.id}`, req.session?.correlationID);
    checkSecureExchangeAccess(req, res, secureExchangeData);

    if (!resData || secureExchangeData['secureExchangeStatusCode'] === 'CLOSED') {
      return res.status(HttpStatus.CONFLICT).json({
        message: 'Delete secureExchange file not allowed'
      });
    }

    const endpoint = config.get('edx:exchangeURL');
    const url = `${endpoint}/${req.params.id}/documents/${req.params.documentId}`;
    await deleteData(token, url, req.session?.correlationID);
    return res.status(HttpStatus.OK).json();
  } catch (e) {
    log.error('deleteDocument Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function downloadFile(req, res) {
  try {
    const token = getAccessToken(req);
    validateAccessToken(token);

    let resData = await getDocument(token, req.params.id, req.params.documentId, req.session?.correlationID);

    res.setHeader('Content-disposition', 'inline; filename=' + resData.fileName?.replace(/ /g, '_').replace(/,/g, '_').trim());
    res.setHeader('Content-type', resData.fileExtension);

    return res.status(HttpStatus.OK).send(Buffer.from(resData.documentData, 'base64'));
  } catch (e) {
    log.error('downloadFile Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

function getCriteria(key, value, operation, valueType) {
  return {key, value, operation, valueType};
}

async function getExchangesPaginated(req) {
  const accessToken = getAccessToken(req);
  validateAccessToken(accessToken);

  if (!req.session.activeInstituteIdentifier) {
    return Promise.reject('getExchangesPaginated error: User activeInstituteIdentifier does not exist in session');
  }
  let criteria = [];
  let parsedParams = '';
  if (req.query.searchParams) {
    parsedParams = req.query.searchParams;
    if (parsedParams.studentPEN) {
      let studentDetail = await getData(accessToken, config.get('student:apiEndpoint') + '?pen=' + parsedParams.studentPEN);
      if (studentDetail[0]) {
        parsedParams.studentId = studentDetail[0].studentID;
        delete parsedParams.studentPEN;
      } else {
        return '';
      }
    }
  }
  criteria = buildSearchParams(JSON.stringify(parsedParams));

  //This needs to change when we have school selection
  criteria.push(getCriteria('contactIdentifier', req.session.activeInstituteIdentifier, FILTER_OPERATION.EQUAL, VALUE_TYPE.STRING));
  if(req.session.activeInstituteType === 'SCHOOL') {
    criteria.push(getCriteria('secureExchangeContactTypeCode', 'SCHOOL', FILTER_OPERATION.EQUAL, VALUE_TYPE.STRING));
  } else {
    criteria.push(getCriteria('secureExchangeContactTypeCode', 'DISTRICT', FILTER_OPERATION.EQUAL, VALUE_TYPE.STRING));
  }

  const params = {
    params: {
      pageNumber: req.query.pageNumber,
      pageSize: req.query.pageSize,
      sort: req.query.sort,
      searchCriteriaList: JSON.stringify(criteria),
    }
  };

  return getDataWithParams(accessToken, config.get('edx:exchangeURL') + '/paginated', params, req.session?.correlationID);
}

async function getExchangesCountPaginated(req) {
  const accessToken = getAccessToken(req);
  validateAccessToken(accessToken);
  checkSecureExchangePermission(req);

  if (!req.session.activeInstituteIdentifier) {
    return Promise.reject('getExchangesCountPaginated error: User activeInstituteIdentifier does not exist in session');
  }
  let criteria = [];
  let parsedParams = '';
  if (req.query.searchParams) {
    parsedParams = JSON.parse(req.query.searchParams);
  }
  criteria = buildSearchParams(JSON.stringify(parsedParams));

  criteria.push(getCriteria('contactIdentifier', req.session.activeInstituteIdentifier, FILTER_OPERATION.EQUAL, VALUE_TYPE.STRING));
  if(req.session.activeInstituteType === 'SCHOOL') {
    criteria.push(getCriteria('secureExchangeContactTypeCode', 'SCHOOL', FILTER_OPERATION.EQUAL, VALUE_TYPE.STRING));
  } else {
    criteria.push(getCriteria('secureExchangeContactTypeCode', 'DISTRICT', FILTER_OPERATION.EQUAL, VALUE_TYPE.STRING));
  }

  const params = {
    params: {
      pageNumber: req.query.pageNumber,
      pageSize: req.query.pageSize,
      sort: '',
      searchCriteriaList: JSON.stringify(criteria),
    }
  };

  return getDataWithParams(accessToken, config.get('edx:exchangeURL') + '/paginated', params, req.session?.correlationID);
}

async function createExchange(req, res) {
  try {
    const token = getAccessToken(req);
    validateAccessToken(token);
    checkSecureExchangePermission(req);

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
      secureExchangeContactTypeCode: req.session.activeInstituteType,
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

    const result = await postData(token, payload, config.get('edx:exchangeURL'), req.session?.correlationID);

    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    log.error(e, 'createExchange', 'Error occurred while attempting to create a new exchange.');
    return handleExceptionResponse(e, res);
  }
}

async function instituteSelection(req, res) {
  const token = getAccessToken(req);
  validateAccessToken(token);
  if (req.session.userSchoolIDs.includes(req.body.params.schoolID)) {
    setSessionInstituteIdentifiers(req, req.body.params.schoolID, 'SCHOOL');
    return res.status(200).json('OK');
  }else if(req.session.userDistrictIDs.includes(req.body.params.districtID)){
    setSessionInstituteIdentifiers(req, req.body.params.districtID, 'DISTRICT');
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
  req.session.activeInstitutePermissions = '';
  req.session.activeInstituteTitle = '';
}

async function getExchanges(req, res) {
  const token = getAccessToken(req);
  try{
    validateAccessToken(token);
    checkSecureExchangePermission(req);
  } catch (e) {
    return handleExceptionResponse(e, res);
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

          //we need to remove references to notesList since the school/district should not have access to this information.
          delete element.noteList;
        });
      }
      return res.status(200).json(dataResponse);
    }).catch(e => {
      log.error(e, 'getExchanges', 'Error getting paginated list of secure exchanges.');
      return errorResponse(res);
    });

}

async function getExchange(req, res) {
  const token = getAccessToken(req);
  try{
    validateAccessToken(token);
    checkSecureExchangePermission(req);
  } catch (e) {
    return handleExceptionResponse(e, res);
  }

  return Promise.all([
    getCodeTable(token, CACHE_KEYS.EDX_SECURE_EXCHANGE_STATUS, config.get('edx:exchangeStatusesURL')),
    getCodeTable(token, CACHE_KEYS.EDX_MINISTRY_TEAMS, config.get('edx:ministryTeamURL')),
    getData(token, `${config.get('edx:exchangeURL')}/${req.params.secureExchangeID}`, req.session?.correlationID)
  ])
    .then(async ([statusCodeResponse, ministryTeamCodeResponse, dataResponse]) => {
      checkSecureExchangeAccess(req, res, dataResponse);
      let school = {};
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

      if(req.session.activeInstituteType === 'SCHOOL') {
        school = cacheService.getSchoolBySchoolID(dataResponse['contactIdentifier']);
      }
      dataResponse['activities'] = [];
      dataResponse['commentsList'].forEach((comment) => {
        let activity = {};
        activity['type'] = 'message';
        activity['isSchool'] = !!comment.edxUserID;
        activity['timestamp'] = comment['commentTimestamp'] ? LocalDateTime.parse(comment['commentTimestamp']) : '';

        if(req.session.activeInstituteType === 'SCHOOL') {
          activity['actor'] = comment.edxUserID ? school.schoolName : dataResponse['ministryOwnershipTeamName'];
          activity['title'] = comment.edxUserID ? school.schoolName : dataResponse['ministryOwnershipTeamName'];
        }
        
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
          activity['isSchool'] = !!document.edxUserID;
          activity['timestamp'] = document['createDate'] ? LocalDateTime.parse(document['createDate']) : '';
          activity['actor'] = document.edxUserID ? document.edxUserID : document.staffUserIdentifier;
          if(req.session.activeInstituteType === 'SCHOOL') {
            activity['title'] = document.edxUserID ? school.schoolName : dataResponse['ministryOwnershipTeamName'];
          }
          activity['fileName'] = document.fileName;
          activity['documentType'] = cacheService.getDocumentTypeCodeLabelByCode(document.documentTypeCode);
          activity['displayDate'] = document['createDate'] ? LocalDateTime.parse(document['createDate']).format(DateTimeFormatter.ofPattern('uuuu/MM/dd HH:mm')) : 'Unknown Date';
          activity['documentID'] = document['documentID'];
          dataResponse['activities'].push(activity);
        });
      }
      if (dataResponse['studentsList']) {
        for (const student of dataResponse['studentsList']) {
          let studentDetail = await getData(token, `${config.get('student:apiEndpoint')}/${student.studentId}`, req.session?.correlationID);
          let includeDemographicDetails = false;
          if(req.session.activeInstituteType === 'SCHOOL') {
            includeDemographicDetails = studentDetail.mincode === school.mincode;
          }
          let activity = {};
          activity['type'] = 'student';
          activity['isSchool'] = !!student.edxUserID;
          activity['studentID'] = student.studentId;
          activity['secureExchangeStudentId'] = student.secureExchangeStudentId;
          activity['studentPEN'] = studentDetail.pen;
          activity['studentLocalID'] = includeDemographicDetails ? studentDetail.localID : null;
          activity['studentSurname'] = includeDemographicDetails ? studentDetail.legalLastName : null;
          activity['studentGiven'] = includeDemographicDetails ? studentDetail.legalFirstName : null;
          activity['studentMiddle'] = includeDemographicDetails ? studentDetail.legalMiddleNames : null;
          activity['studentDOB'] = includeDemographicDetails ? studentDetail.dob : null;
          activity['studentGender'] = includeDemographicDetails ? studentDetail.genderCode : null;
          activity['timestamp'] = student['createDate'] ? LocalDateTime.parse(student['createDate']) : '';
          activity['actor'] = student.edxUserID ? student.edxUserID : student.staffUserIdentifier;
          if(req.session.activeInstituteType === 'SCHOOL') {
            activity['title'] = student.edxUserID ? school.schoolName : dataResponse['ministryOwnershipTeamName'];
          }
          activity['displayDate'] = student['createDate'] ? LocalDateTime.parse(student['createDate']).format(DateTimeFormatter.ofPattern('uuuu/MM/dd HH:mm')) : 'Unknown Date';
          dataResponse['activities'].push(activity);
        }
      }

      dataResponse['activities'].sort((activity1, activity2) => {
        return activity2.timestamp.compareTo(activity1.timestamp);
      });

      //school users should not have access to notes list
      delete dataResponse.noteList;

      req.session.secureExchange = dataResponse;

      return res.status(HttpStatus.OK).json(dataResponse);
    }).catch(e => {
      log.error(e, 'getExchange', 'Error getting a secure exchange message.');
      return errorResponse(res);
    });
}

async function getExchangesCount(req, res) {
  const token = getAccessToken(req);
  validateAccessToken(token);
  checkSecureExchangePermission(req);
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
  const token = getAccessToken(req);
  try {
    validateAccessToken(token);
    let validReadStatuses = ['read', 'unread'];
    let readStatus = req.params.readStatus;
    if (validReadStatuses.indexOf(readStatus) === -1) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Invalid read status. Please specify read or unread.'
      });
    }
    let isReadByExchangeContact = readStatus === 'read';

    const currentExchange = await getData(token, config.get('edx:exchangeURL') + `/${req.params.secureExchangeID}`, req.session?.correlationID);
    checkSecureExchangeAccess(req, res, currentExchange);
    checkSecureExchangePermission(req);

    if (currentExchange.isReadByExchangeContact === isReadByExchangeContact) {
      return res.status(HttpStatus.OK).json({
        message: `The status is already marked as ${readStatus}.`
      });
    }
    currentExchange.isReadByExchangeContact = isReadByExchangeContact;
    currentExchange.createDate = null;
    currentExchange.updateDate = null;
    const result = await putData(token, currentExchange, config.get('edx:exchangeURL'), req.session?.correlationID);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    log.error(e, 'markAs', 'Error with updating the read status of an exchange.');
    return handleExceptionResponse(e, res);
  }
}

async function createSecureExchangeStudent(req, res) {
  const accessToken = getAccessToken(req);
  try {
    validateAccessToken(accessToken);
    checkSecureExchangePermission(req);

    const edxUserInfo = req.session.edxUserData;
    if (!edxUserInfo) {
      return errorResponse(res, 'No EDX User Info token.', HttpStatus.UNAUTHORIZED);
    }

    const exchangeURL = config.get('edx:exchangeURL');
    const secureExchangeStudent = {
      edxUserID: edxUserInfo.edxUserID,
      studentId: req.body.studentID
    };

    const secureExchange = await getData(accessToken, `${exchangeURL}/${req.params.secureExchangeID}`, req.session?.correlationID);
    checkSecureExchangeAccess(req, res, secureExchange);

    const attachedSecureExchangeStudents = await getData(accessToken, `${exchangeURL}/${req.params.secureExchangeID}/students`, req.session?.correlationID);
    if (attachedSecureExchangeStudents && attachedSecureExchangeStudents?.some((student) => student.studentId === req.body.studentID)) {
      return errorResponse(res, 'Error adding student to an existing secure exchange. Student already attached.', HttpStatus.CONFLICT);
    }

    console.log('Access RToken: ' + JSON.stringify(secureExchangeStudent));
    const result = await postData(accessToken, secureExchangeStudent, `${exchangeURL}/${req.params.secureExchangeID}/students`, req.session?.correlationID);
    return res.status(HttpStatus.CREATED).json(result);
  } catch (e) {
    log.error(e, 'createSecureExchangeStudent', 'Error adding a student to an existing Secure Exchange.');
    return handleExceptionResponse(e, res);
  }
}

async function removeSecureExchangeStudent(req, res) {
  try {
    const token = getAccessToken(req);
    validateAccessToken(token);
    checkSecureExchangePermission(req);

    const secureExchange = await getData(token, `${config.get('edx:exchangeURL')}/${req.params.secureExchangeID}`, req.session?.correlationID);
    checkSecureExchangeAccess(req, res, secureExchange);

    const result = await deleteData(token, config.get('edx:exchangeURL') + `/${req.params.secureExchangeID}/students/${req.params.studentID}`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(result);

  } catch (e) {
    log.error(e, 'removeSecureExchangeStudent', 'Error occurred while attempting to remove a secure exchange student.');
    return handleExceptionResponse(e, res);
  }
}

async function updateEdxUserRoles(req, res) {
  try {
    const token = getAccessToken(req);
    validateAccessToken(token);
    checkEDXUserAccessForSchoolAdminFunctions(req, req.body.params.schoolID);

    let response = await getData(token, config.get('edx:edxUsersURL') + '/' + req.body.params.edxUserID, req.session?.correlationID);

    let selectedUserSchool = response.edxUserSchools.filter(school => school.schoolID === req.body.params.schoolID);

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

    const result = await putData(token, payload, config.get('edx:edxUsersURL') + '/' + selectedUserSchool[0].edxUserID + '/school', req.session?.correlationID);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    log.error(e, 'updateEdxUserRoles', 'Error occurred while attempting to update user roles.');
    return handleExceptionResponse(e, res);
  }
}

async function activateEdxUser(req, res) {
  const token = getAccessToken(req);
  try {
    validateAccessToken(token);
    const numberOfRetries = req.session['activationAttempts'];
    if (numberOfRetries && numberOfRetries >= 3) {
      return errorResponse(res, 'You have exceeded the number of activation attempts allowed. Please contact your administrator for a new activation code.', HttpStatus.TOO_MANY_REQUESTS);
    }
    const payload = {
      digitalId: req.session.digitalIdentityData.digitalID,
      personalActivationCode: req.body.personalActivationCode.trim(),
      primaryEdxCode: req.body.primaryEdxCode.trim(),
    };
    let districtID;
    let schoolID;
    if (req.body.districtNumber) {
      districtID = cacheService.getDistrictIdByDistrictNumber(String(req.body.districtNumber.trim()).padStart(3, '0'));
      if (!districtID) {
        incrementNumberOfRetriesCounter(req);
        return errorResponse(res, 'Incorrect activation details have been entered. Please try again.', HttpStatus.BAD_REQUEST);
      }
      payload.districtID = districtID;
    }
    else if (req.body.mincode) {//this remains as mincode as user will input mincode
      schoolID = cacheService.getSchoolIdByMincode(req.body.mincode);
      if (!schoolID) {
        incrementNumberOfRetriesCounter(req);
        return errorResponse(res, 'Incorrect activation details have been entered. Please try again.', HttpStatus.BAD_REQUEST);
      }
      payload.schoolID = schoolID;
    }

    if(!payload.schoolID && !payload.districtID){
      incrementNumberOfRetriesCounter(req);
      return errorResponse(res, 'Incorrect activation details have been entered. Please try again.', HttpStatus.BAD_REQUEST);
    }

    const response = await postData(token, payload, config.get('edx:userActivationURL'), req.session.correlationID);
    log.info('User Activation Successful');
    req.session.userSchoolIDs = response.edxUserSchools?.map(el => el.schoolID);
    req.session.userDistrictIDs = response.edxUserDistricts?.map(el => el.districtID);
    getAndSetupEDXUserAndRedirect(req, res, token, req.session.digitalIdentityData.digitalID, req.session.correlationID);
  } catch (e) {
    const msg = mapEdxUserActivationErrorMessage(e?.data?.message);
    log.error(e, 'activateSchoolUser', 'Error getting activated user');
    if (e?.status > 399 && e?.status < 410) {
      incrementNumberOfRetriesCounter(req);
    }
    return errorResponse(res, msg);
  }
}

function incrementNumberOfRetriesCounter(req) {
  if (req.session['activationAttempts']) {
    req.session['activationAttempts']++;
  } else {
    req.session['activationAttempts'] = 1;
  }
}
async function getEdxUsers(req, res) {
  const token = getAccessToken(req);
  try {
    validateAccessToken(token);
    if(req.query.schoolID){
      checkEDXUserAccessForSchoolAdminFunctions(req, req.query.schoolID);
    }else{
      checkEDXUserDistrictAdminPermission(req);
      checkEDXUserAccess(req, 'DISTRICT', req.query.districtID);
    }

    let response = await getDataWithParams(token, config.get('edx:edxUsersURL'), {params: req.query}, req.session.correlationID);
    let filteredResponse = [];

    //if we search by schoolID strip out other school and district information for the frontend
    if (req.query.schoolID) {
      filteredResponse = response.map(schoolUser => {
        return {
          ...schoolUser,
          edxUserDistricts: [],
          edxUserSchools: schoolUser.edxUserSchools.filter(school => school.schoolID === req.query.schoolID)
        };
      });
    }else if(req.query.districtID){
      filteredResponse = response.map(districtUser => {
        return {
          ...districtUser,
          edxUserDistricts: districtUser.edxUserDistricts.filter(district => district.districtID === req.query.districtID),
          edxUserSchools: []
        };
      });
    }

    return res.status(HttpStatus.OK).json(filteredResponse);
  } catch (e) {
    log.error(e, 'getEdxUsers', 'Error getting EDX users');
    return handleExceptionResponse(e, res);
  }
}

async function districtUserActivationInvite(req, res) {
  checkEDXUserDistrictAdminPermission(req);
  checkEDXUserAccess(req, 'DISTRICT', req.body.districtID);
  const token = getAccessToken(req);
  try {
    validateAccessToken(token);
    const payload = {
      ...req.body
    };
    const response = await postData(token, payload, config.get('edx:districtUserActivationInviteURL'), req.session.correlationID);
    return res.status(200).json(response);
  } catch (e) {
    log.error(e, 'districtUserActivationInvite', 'Error occurred while sending user activation invite');
    return handleExceptionResponse(e, res);
  }
}

async function schoolUserActivationInvite(req, res) {
  try {
    checkEDXUserAccessForSchoolAdminFunctions(req, req.body.schoolID);

    const token = getAccessToken(req);
    validateAccessToken(token);
    const payload = {
      ...req.body
    };

    const response = await postData(token, payload, config.get('edx:schoolUserActivationInviteURL'), req.session.correlationID);
    return res.status(200).json(response);
  } catch (e) {
    log.error(e, 'schoolUserActivationInvite', 'Error occurred while sending user activation invite');
    return handleExceptionResponse(e, res);
  }
}

function validateAccessToken(token) {
  if (!token) {
    throw new Error('401');
  }
}

async function removeUserSchoolOrDistrictAccess(req, res) {
  try {
    const token = getAccessToken(req);
    validateAccessToken(token);
    if (req.body.params.userSchoolID) {
      checkEDXUserAccessForSchoolAdminFunctions(req, req.body.params.schoolID);
    } else {
      checkEDXUserDistrictAdminPermission(req);
      checkEDXUserAccess(req, 'DISTRICT', req.body.params.districtID);
    }
    let edxUserInstituteType = req.body.params.userSchoolID ? 'school' : 'district';
    let edxUserInstituteID = req.body.params.userSchoolID ?? req.body.params.edxUserDistrictID;
    await deleteData(token, `${config.get('edx:edxUsersURL')}/${req.body.params.userToRemove}/${edxUserInstituteType}/${edxUserInstituteID}`, req.session.correlationID);
    return res.status(HttpStatus.OK).json('');
  } catch (e) {
    log.error(e, 'removeUserSchoolOrDistrictAccess', 'Error occurred while attempting to remove user school or district access.');
    return errorResponse(res);
  }
}

async function relinkUserAccess(req, res) {
  try {
    const token = getAccessToken(req);
    validateAccessToken(token);
    if(req.body.params.schoolID) {
      checkEDXUserAccessForSchoolAdminFunctions(req, req.body.params.schoolID);
    } else {
      checkEDXUserDistrictAdminPermission(req);
      checkEDXUserAccess(req, 'DISTRICT', req.body.params.districtID);
    }
    let edxUserDetails = await getData(token, config.get('edx:edxUsersURL') + '/' + req.body.params.userToRelink, req.session?.correlationID);

    const payload = createRelinkPayload(req.body.params.schoolID, edxUserDetails, req.body.params);
    const postUrl = req.body.params.schoolID ? config.get('edx:schoolUserActivationRelink') : config.get('edx:districtUserActivationRelink');
    await postData(token, payload, postUrl, req.session?.correlationID);

    return res.status(HttpStatus.OK).json('');
  } catch (e) {
    log.error(e, 'relinkUserAccess', 'Error occurred while attempting to relink user access.');
    return handleExceptionResponse(e, res);
  }
}

function createRelinkPayload(schoolID, edxUserDetails, requestParams) {
  if(schoolID) {
    let userSchool = edxUserDetails.edxUserSchools.find(school => school.schoolID === requestParams.schoolID);
    let activationRoles = userSchool.edxUserSchoolRoles.map(role => role.edxRoleCode);

    return {
      schoolID: requestParams.schoolID,
      schoolName: cacheService.getSchoolBySchoolID(requestParams.schoolID)?.schoolName,
      edxActivationRoleCodes: activationRoles,
      firstName: edxUserDetails.firstName,
      lastName: edxUserDetails.lastName,
      email: edxUserDetails.email,
      edxUserId: requestParams.userToRelink,
      edxUserSchoolID: requestParams.userSchoolID,
    };
  } else {
    let userDistrict = edxUserDetails.edxUserDistricts.find(district => district.districtID === requestParams.districtID);
    let activationRoles = userDistrict.edxUserDistrictRoles.map(role => role.edxRoleCode);

    return {
      districtID: requestParams.districtID,
      districtName: cacheService.getDistrictJSONByDistrictID(requestParams.districtID)?.name,
      edxActivationRoleCodes: activationRoles,
      firstName: edxUserDetails.firstName,
      lastName: edxUserDetails.lastName,
      email: edxUserDetails.email,
      edxUserId: requestParams.userToRelink,
      edxUserDistrictID: requestParams.edxUserDistrictID,
    };
  }
}

async function createSecureExchangeComment(req, res) {
  try {
    const token = getAccessToken(req);
    validateAccessToken(token);

    const secureExchange = await getData(token, `${config.get('edx:exchangeURL')}/${req.params.secureExchangeID}`, req.session?.correlationID);
    checkSecureExchangeAccess(req, res, secureExchange);

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
    return handleExceptionResponse(e, res);
  }
}

function mapEdxUserActivationErrorMessage(message) {
  const msg = message || 'INTERNAL SERVER ERROR';
  if (msg.includes('EdxActivationCode was not found for parameters')) {
    return 'Incorrect activation details have been entered. Please try again.';
  } else if (msg.includes('This Activation Code has expired')) {
    return 'Your activation code has expired. Please contact your administrator for a new activation code.';
  } else if (msg.includes('This User Activation Link has expired')) {
    return 'Your activation link has expired. Please contact your administrator for a new activation code.';
  } else if (msg.includes('This user is already associated to the school')) {
    return 'This user account is already associated to the school';
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
    const result = await postData(data.accessToken, payload, config.get('edx:updateActivationUrlClicked'), req.session?.correlationID);
    if (result === 'SCHOOL') {
      return res.redirect(baseUrl + '/api/auth/logout?loginBceidActivateUser=true');
    }
    return res.redirect(baseUrl + '/api/auth/logout?loginBceidActivateDistrictUser=true');
  } catch (e) {
    let msg = 'Error Occurred please retry with the link provided in the email';
    if (e.status === 400) {
      msg = 'Invalid link clicked. Please click the link provided in your email';
    } else if (e.status === 410) {
      msg = 'Your activation link has expired. Please contact your administrator for a new activation code.';
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
  if (key === 'studentId') {
    key = 'secureExchangeStudents.studentId';
    operation = FILTER_OPERATION.EQUAL;
    valueType = VALUE_TYPE.UUID;
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

function setInstituteTypeIdentifierAndRedirect(req, res) {
  log.info('Set InstituteTypeIdentifier And Redirect called');
  if (req.session.userSchoolIDs?.length === 1 && req.session.userDistrictIDs?.length === 0) {
    log.info('User associated to 1 School Redirecting to School Dashboard');
    setSessionInstituteIdentifiers(req, req.session.userSchoolIDs[0], 'SCHOOL');
    res.redirect(config.get('server:frontend'));
  }else if (req.session.userSchoolIDs?.length === 0 && req.session.userDistrictIDs?.length === 1) {
    log.info('User associated to 1 District Redirecting to District Dashboard');
    setSessionInstituteIdentifiers(req, req.session.userDistrictIDs[0], 'DISTRICT');
    res.redirect(config.get('server:frontend'));
  } else if (req.session.userSchoolIDs?.length >= 1 || req.session.userDistrictIDs?.length >= 1) {
    log.info('User associated to multiple schools and or districts redirecting to Institute Selection');
    res.redirect(config.get('server:frontend') + '/institute-selection');
  } else {
    log.info('User has no associated schools or districts redirecting to Unauthorized Page');
    res.redirect(config.get('server:frontend') + '/unauthorized');
  }
}

function getAndSetupEDXUserAndRedirect(req, res, accessToken, digitalID, correlationID) {
  log.info('User Set Up and Redirect called');

  Promise.all([
    cacheService.loadAllSchoolsToMap(),
    cacheService.loadAllDistrictsToMap()
  ]).then(() => {
    user.getEdxUserByDigitalId(accessToken, digitalID, correlationID).then(async ([edxUserData]) => {
      if (edxUserData) {
        req.session.userSchoolIDs = edxUserData.edxUserSchools?.filter((el) => {
          return !!isSchoolActive(cacheService.getSchoolBySchoolID(el.schoolID));
        }).flatMap(el => el.schoolID);//this is list of active schoolIDs associated to the user
        req.session.userDistrictIDs = edxUserData.edxUserDistricts?.filter((el) => {
          return !!isDistrictActive(cacheService.getDistrictJSONByDistrictID(el.districtID));
        }).flatMap(el => el.districtID);//this is list of active districtIDs associated to the user
        if (Array.isArray(edxUserData)) {
          req.session.edxUserData = edxUserData[0];
        } else {
          req.session.edxUserData = edxUserData;
        }
        setInstituteTypeIdentifierAndRedirect(req, res);
      } else {
        log.info('User Set Up and Redirect called No User Data redirecting to Unauthorized Page');
        res.redirect(config.get('server:frontend') + '/unauthorized');
      }
    });
  });
}

function setSessionInstituteIdentifiers(req, activeInstituteIdentifier, activeInstituteType) {
  req.session.activeInstituteIdentifier = activeInstituteIdentifier;
  req.session.activeInstituteType = activeInstituteType;
  let permissionsArray = [];
  if(activeInstituteType === 'SCHOOL'){
    let selectedUserSchool = req.session.edxUserData.edxUserSchools.filter(school => school.schoolID === activeInstituteIdentifier);
    selectedUserSchool[0].edxUserSchoolRoles.forEach(function (role) {
      permissionsArray.push(...cacheService.getPermissionsForRole(role.edxRoleCode));
    });
  }else{
    let selectedUserDistrict = req.session.edxUserData.edxUserDistricts.filter(district => district.districtID === activeInstituteIdentifier);
    selectedUserDistrict[0].edxUserDistrictRoles.forEach(function (role) {
      permissionsArray.push(...cacheService.getPermissionsForRole(role.edxRoleCode));
    });
  }
  req.session.activeInstitutePermissions = permissionsArray;
}

async function findPrimaryEdxActivationCode(req, res) {
  const token = getAccessToken(req);

  try {
    validateAccessToken(token);
    let instituteType = req.params.instituteType.toUpperCase();

    if(instituteType === 'SCHOOL'){
      checkEDXUserAccessForSchoolAdminFunctions(req, req.params.instituteIdentifier);
    }else{
      checkEDXUserDistrictAdminPermission(req);
      checkEDXUserAccess(req, instituteType, req.params.instituteIdentifier);
    }

    const data = await getData(token, `${config.get('edx:activationCodeUrl')}/primary/${instituteType}/${req.params.instituteIdentifier}`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error(e, 'findPrimaryEdxActivationCode', 'Error getting findPrimaryEdxActivationCode.');
    return handleExceptionResponse(e, res);
  }
}

async function generateOrRegeneratePrimaryEdxActivationCode(req, res) {
  try {
    const token = getAccessToken(req);
    validateAccessToken(token);
    const instituteType = req.params.instituteType.toUpperCase();
    const payload = {
      schoolID: instituteType === 'SCHOOL' ? req.params.instituteIdentifier : null,
      districtID: instituteType === 'DISTRICT' ? req.params.instituteIdentifier : null
    };

    if(instituteType === 'SCHOOL'){
      checkEDXUserAccessForSchoolAdminFunctions(req, req.params.instituteIdentifier);
    }else{
      checkEDXUserDistrictAdminPermission(req);
      checkEDXUserAccess(req, instituteType, req.params.instituteIdentifier);
    }

    const result = await postData(token, payload, `${config.get('edx:activationCodeUrl')}/primary/${instituteType}/${req.params.instituteIdentifier}`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    log.error(e, 'generateOrRegeneratePrimaryEdxActivationCode', 'Error occurred while attempting to generate a Primary Activation Code.');
    return handleExceptionResponse(e, res);
  }
}

function checkSecureExchangeAccess(req, _res, secureExchange) {
  if (secureExchange.secureExchangeContactTypeCode !== req.session.activeInstituteType || secureExchange.contactIdentifier !== req.session.activeInstituteIdentifier) {
    throw new Error('403');
  }
}

function checkSecureExchangePermission(req) {
  if (!req.session.activeInstitutePermissions.includes('SECURE_EXCHANGE')) {
    throw new Error('403');
  }
}

module.exports = {
  verifyRequest,
  deleteDocument,
  downloadFile,
  uploadFile,
  createExchange,
  getExchanges,
  getExchange,
  markAs,
  createSecureExchangeStudent,
  activateEdxUser,
  verifyActivateUserLink,
  instituteSelection,
  getEdxUsers,
  districtUserActivationInvite,
  schoolUserActivationInvite,
  updateEdxUserRoles,
  createSecureExchangeComment,
  clearActiveSession,
  getAndSetupEDXUserAndRedirect,
  getExchangesCount,
  removeUserSchoolOrDistrictAccess,
  relinkUserAccess,
  findPrimaryEdxActivationCode,
  removeSecureExchangeStudent,
  generateOrRegeneratePrimaryEdxActivationCode
};

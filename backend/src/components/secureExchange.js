'use strict';
const {FILTER_OPERATION, VALUE_TYPE} = require('../util/constants');
const {
  getAccessToken,
  deleteData,
  getData,
  postData,
  putData,
  errorResponse,
  handleExceptionResponse,
  getCodeTable,
  getDataWithParams,
  isPdf,
  isImage, getCreateOrUpdateUserValue
} = require('./utils');
const {filterSchoolRoles} = require('./roleFilter');
const config = require('../config/index');
const log = require('./logger');
const HttpStatus = require('http-status-codes');
const {ServiceError} = require('./error');
const {LocalDateTime, DateTimeFormatter} = require('@js-joda/core');
const {CACHE_KEYS} = require('../util/constants');
const {getApiCredentials} = require('./auth');
const cacheService = require('./cache-service');
const user = require('../components/user');
const {isDistrictActive} = require('./districtUtils');
const {isSchoolActive} = require('./schoolUtils');

async function uploadFile(req, res) {
  try {
    const edxUserInfo = req.session.edxUserData;

    req.body.edxUserID = edxUserInfo.edxUserID;
    req.body.updateUser = getCreateOrUpdateUserValue(req);

    const token = getAccessToken(req);
    const data = await postData(token, req.body, `${config.get('edx:exchangeURL')}/${req.params.id}/documents`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('uploadFile Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getDocument(token, secureExchangeID, documentID, correlationID) {
  try {
    const endpoint = config.get('edx:exchangeURL');
    log.info('About to call for document');
    let resDoc = await getData(token, `${endpoint}/${secureExchangeID}/documents/${documentID}`, correlationID);
    log.info('Document returned');
    return resDoc;
  } catch (e) {
    throw new ServiceError('getDocument error', e);
  }
}

async function deleteDocument(req, res) {
  try {
    const token = getAccessToken(req);
    const endpoint = config.get('edx:exchangeURL');
    const url = `${endpoint}/${req.params.id}/documents/${req.params.documentId}`;
    log.info('EDX User :: ' + req.session.edxUserData.edxUserID + ' is removing document:: ' + req.params.documentId);
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

    let resData = await getDocument(token, req.params.id, req.params.documentId, req.session?.correlationID);
    if(!isImage(resData) && !isPdf(resData)) {
      res.setHeader('Content-disposition', 'attachment; filename=' + resData.fileName?.replace(/ /g, '_').replace(/,/g, '_').trim());
      res.setHeader('Content-type', resData.fileExtension);
      return res.status(HttpStatus.OK).send(Buffer.from(resData.documentData, 'base64'));
    } else {
      res.setHeader('Content-disposition', 'inline; filename=' + resData.fileName?.replace(/ /g, '_').replace(/,/g, '_').trim());
      res.setHeader('Content-type', resData.fileExtension);
      return res.status(HttpStatus.OK).send(Buffer.from(resData.documentData, 'base64'));
    }
    
  } catch (e) {
    log.error('downloadFile Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

function getCriteria(key, value, operation, valueType) {
  return {key, value, operation, valueType};
}

async function getExchangesPaginated(req) {
  if (!req.session.activeInstituteIdentifier) {
    return Promise.reject('getExchangesPaginated error: User activeInstituteIdentifier does not exist in session');
  }
  const accessToken = getAccessToken(req);
  let criteria = [];
  let parsedParams = '';
  if (req.query.searchParams) {
    parsedParams = req.query.searchParams;
    if (parsedParams.studentPEN) {
      let studentDetail = await getData(accessToken, `${config.get('student:apiEndpoint')}?pen=${parsedParams.studentPEN}`);
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

  return getDataWithParams(accessToken, `${config.get('edx:exchangeURL')}/paginated`, params, req.session?.correlationID);
}

async function getExchangesCountPaginated(req) {
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
  const accessToken = getAccessToken(req);
  return getDataWithParams(accessToken, `${config.get('edx:exchangeURL')}/paginated`, params, req.session?.correlationID);
}

async function createExchange(req, res) {
  try {
    const edxUserInfo = req.session.edxUserData;
    const message = req.body;
    let createUpdateUser = getCreateOrUpdateUserValue(req);
    const documentPayload = message.secureExchangeDocuments.map(document => {
      return {...document, edxUserID: edxUserInfo.edxUserID, updateUser: createUpdateUser, createUser: createUpdateUser};
    });
    const studentPayload = message.secureExchangeStudents.map(student => {
      return {
        studentId: student.studentID,
        edxUserID: edxUserInfo.edxUserID,
        createUser: createUpdateUser
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
          content: message.content,
          updateUser: createUpdateUser,
          createUser: createUpdateUser
        }
      ],
      documentList: documentPayload,
      studentList: studentPayload,
      updateUser: createUpdateUser,
      createUser: createUpdateUser
    };

    const token = getAccessToken(req);
    const result = await postData(token, payload, config.get('edx:exchangeURL'), req.session?.correlationID);

    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    log.error(e, 'createExchange', 'Error occurred while attempting to create a new exchange.');
    return handleExceptionResponse(e, res);
  }
}

async function instituteSelection(req, res) {
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
  return Promise.all([
    getCodeTable(token, CACHE_KEYS.EDX_SECURE_EXCHANGE_STATUS, config.get('edx:exchangeStatusesURL')),
    getCodeTable(token, CACHE_KEYS.EDX_MINISTRY_TEAMS, config.get('edx:ministryTeamURL')),
    getSecureExchange(req.params.id, res, token, req.session?.correlationID)
  ])
    .then(async ([statusCodeResponse, ministryTeamCodeResponse, dataResponse]) => {
      let school = {};
      let district = {};
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
      }else{
        district = cacheService.getDistrictByDistrictID(dataResponse['contactIdentifier']);
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
        }else if(req.session.activeInstituteType === 'DISTRICT') {
          activity['actor'] = comment.edxUserID ? district.name : dataResponse['ministryOwnershipTeamName'];
          activity['title'] = comment.edxUserID ? district.name : dataResponse['ministryOwnershipTeamName'];
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
          } else if(req.session.activeInstituteType === 'DISTRICT') {
            activity['title'] = document.edxUserID ? district.name : dataResponse['ministryOwnershipTeamName'];
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
          } else if(req.session.activeInstituteType === 'DISTRICT') {
            let studentSchoolId = cacheService.getSchoolIdByMincode(studentDetail.mincode);
            let studentSchool = cacheService.getSchoolBySchoolID(studentSchoolId);
            includeDemographicDetails = studentSchool.districtID === dataResponse['contactIdentifier'];
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
          } else if(req.session.activeInstituteType === 'DISTRICT') {
            activity['title'] = student.edxUserID ? district.name : dataResponse['ministryOwnershipTeamName'];
          }
          activity['displayDate'] = student['createDate'] ? LocalDateTime.parse(student['createDate']).format(DateTimeFormatter.ofPattern('uuuu/MM/dd HH:mm')) : 'Unknown Date';
          dataResponse['activities'].push(activity);
        }
      }

      //school users should not have access to notes list
      delete dataResponse.noteList;

      dataResponse['activities'].sort((activity1, activity2) => {
        return activity2.timestamp.compareTo(activity1.timestamp);
      });

      return res.status(HttpStatus.OK).json(dataResponse);
    }).catch(e => {
      log.error(e, 'getExchange', 'Error getting a secure exchange message.');
      return errorResponse(res);
    });
}

async function getExchangesCount(req, res) {
  const token = getAccessToken(req);
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
  try {
    let validReadStatuses = ['read', 'unread'];
    let readStatus = req.params.readStatus;
    if (validReadStatuses.indexOf(readStatus) === -1) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Invalid read status. Please specify read or unread.'
      });
    }
    let isReadByExchangeContact = readStatus === 'read';

    const token = getAccessToken(req);
    const currentExchange = await getSecureExchange(req.params.id, res, token, req.session?.correlationID);

    if (currentExchange.isReadByExchangeContact === isReadByExchangeContact) {
      return res.status(HttpStatus.OK).json({
        message: `The status is already marked as ${readStatus}.`
      });
    }
    currentExchange.isReadByExchangeContact = isReadByExchangeContact;
    currentExchange.createDate = null;
    currentExchange.updateDate = null;
    currentExchange.updateUser = getCreateOrUpdateUserValue(req);
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

    const edxUserInfo = req.session.edxUserData;

    const exchangeURL = config.get('edx:exchangeURL');
    const secureExchangeStudent = {
      edxUserID: edxUserInfo.edxUserID,
      studentId: req.body.studentID,
      createUser: getCreateOrUpdateUserValue(req)
    };

    const attachedSecureExchangeStudents = await getData(accessToken, `${exchangeURL}/${req.params.id}/students`, req.session?.correlationID);
    if (attachedSecureExchangeStudents && attachedSecureExchangeStudents?.some((student) => student.studentId === req.body.studentID)) {
      return errorResponse(res, 'Error adding student to an existing secure exchange. Student already attached.', HttpStatus.CONFLICT);
    }

    const result = await postData(accessToken, secureExchangeStudent, `${exchangeURL}/${req.params.id}/students`, req.session?.correlationID);
    return res.status(HttpStatus.CREATED).json(result);
  } catch (e) {
    log.error(e, 'createSecureExchangeStudent', 'Error adding a student to an existing Secure Exchange.');
    return handleExceptionResponse(e, res);
  }
}

async function removeSecureExchangeStudent(req, res) {
  try {
    const token = getAccessToken(req);
    log.info('EDX User :: ' + req.session.edxUserData.edxUserID + ' is removing student:: ' + req.params.studentID);
    const result = await deleteData(token, `${config.get('edx:exchangeURL')}/${req.params.id}/students/${req.params.studentID}`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(result);

  } catch (e) {
    log.error(e, 'removeSecureExchangeStudent', 'Error occurred while attempting to remove a secure exchange student.');
    return handleExceptionResponse(e, res);
  }
}

async function updateEdxUserSchool(req, res) {
  try {
    const token = getAccessToken(req);
    let edxUser = await getData(token, `${config.get('edx:edxUsersURL')}/${req.body.params.edxUserID}`, req.session?.correlationID);
    let selectedUserSchools = edxUser.edxUserSchools.filter(school => school.edxUserSchoolID === req.body.params.edxUserSchoolID);

    let schoolAlreadyPresentForUser = edxUser.edxUserSchools.some(school => school.edxUserSchoolID !== req.body.params.edxUserSchoolID && school.schoolID === req.body.params.schoolID);

    if (schoolAlreadyPresentForUser) {
      return errorResponse(res, edxUser.firstName + ' ' + edxUser.lastName + ' is already registered to ' + cacheService.getSchoolBySchoolID(req.body.params.schoolID).schoolName, HttpStatus.CONFLICT);
    }

    if (!selectedUserSchools[0]) {
      return errorResponse(res, 'A user school entry was not found for the selected user.', HttpStatus.NOT_FOUND);
    }

    let selectedUserSchool = selectedUserSchools[0];
    let existingUserSchoolRoles = new Map(selectedUserSchool.edxUserSchoolRoles.map(edxUserSchoolRole => [edxUserSchoolRole.edxRoleCode, edxUserSchoolRole]));
    let createUpdateUser = getCreateOrUpdateUserValue(req);
    selectedUserSchool.edxUserSchoolRoles = [];
    req.body.params.selectedRoles.forEach(function (role) {
      if (existingUserSchoolRoles.has(role)) {
        selectedUserSchool.edxUserSchoolRoles.push(existingUserSchoolRoles.get(role));
        return;
      }
      let newRole = {};
      newRole.edxUserSchoolID = selectedUserSchool.edxUserSchoolID;
      newRole.edxRoleCode = role;
      newRole.createUser = createUpdateUser;
      newRole.updateUser = createUpdateUser;
      selectedUserSchool.edxUserSchoolRoles.push(newRole);
    });

    selectedUserSchool.schoolID = req.body.params.schoolID;
    selectedUserSchool.updateDate = null;
    selectedUserSchool.createDate = null;
    selectedUserSchool.expiryDate = req.body.params.expiryDate ? req.body.params.expiryDate : null;
    selectedUserSchool.updateUser = createUpdateUser;

    const result = await putData(token, selectedUserSchool, `${config.get('edx:edxUsersURL')}/${selectedUserSchool.edxUserID}/school`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    log.error(e, 'updateEdxUserSchool', 'Error occurred while attempting to update user school.');
    return handleExceptionResponse(e, res);
  }
}

async function updateEdxUserSchoolRoles(req, res) {
  try {
    const token = getAccessToken(req);
    let edxUser = await getData(token, `${config.get('edx:edxUsersURL')}/${req.body.params.edxUserID}`, req.session?.correlationID);

    let selectedUserSchools = edxUser.edxUserSchools.filter(school => school.schoolID === req.body.params.schoolID);
    if (!selectedUserSchools[0]) {
      return errorResponse(res, 'A user school entry was not found for the selected user.', HttpStatus.NOT_FOUND);
    }
    if (selectedUserSchools.length > 1) {
      return errorResponse(res, 'Too many user school entries have been found for the selected user.', HttpStatus.CONFLICT);
    }
    let selectedUserSchool = selectedUserSchools[0];
    let existingUserSchoolRoles = new Map(selectedUserSchool.edxUserSchoolRoles.map(edxUserSchoolRole => [edxUserSchoolRole.edxRoleCode, edxUserSchoolRole]));
    let createUpdateUser = getCreateOrUpdateUserValue(req);
    selectedUserSchool.edxUserSchoolRoles = [];
    req.body.params.selectedRoles.forEach(function (role) {
      if (existingUserSchoolRoles.has(role)) {
        selectedUserSchool.edxUserSchoolRoles.push(existingUserSchoolRoles.get(role));
        return;
      }
      let newRole = {};
      newRole.edxUserSchoolID = selectedUserSchool.edxUserSchoolID;
      newRole.edxRoleCode = role;
      newRole.createUser = createUpdateUser;
      newRole.updateUser = createUpdateUser;
      selectedUserSchool.edxUserSchoolRoles.push(newRole);
    });

    selectedUserSchool.updateDate = null;
    selectedUserSchool.createDate = null;
    selectedUserSchool.expiryDate = req.body.params.expiryDate ? req.body.params.expiryDate : null;
    selectedUserSchool.updateUser = createUpdateUser;
    const result = await putData(token, selectedUserSchool, `${config.get('edx:edxUsersURL')}/${selectedUserSchool.edxUserID}/school`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    log.error(e, 'updateEdxUserSchoolRoles', 'Error occurred while attempting to update user roles.');
    return handleExceptionResponse(e, res);
  }
}

async function updateEdxUserDistrictRoles(req, res) {
  try {
    const token = getAccessToken(req);
    let edxUser = await getData(token, `${config.get('edx:edxUsersURL')}/${req.body.params.edxUserID}`, req.session?.correlationID);
    let selectedUserDistricts = edxUser.edxUserDistricts.filter(district => district.districtID === req.body.params.districtID);
    if (!selectedUserDistricts[0]) {
      return errorResponse(res, 'A user district entry was not found for the selected user.', HttpStatus.NOT_FOUND);
    }
    if (selectedUserDistricts.length > 1) {
      return errorResponse(res, 'Too many user district entries have been found for the selected user.', HttpStatus.CONFLICT);
    }
    let selectedUserDistrict = selectedUserDistricts[0];
    let existingUserDistrictRoles = new Map(selectedUserDistrict.edxUserDistrictRoles.map(edxUserDistrictRole => [edxUserDistrictRole.edxRoleCode, edxUserDistrictRole]));
    let createUpdateUser = getCreateOrUpdateUserValue(req);
    selectedUserDistrict.edxUserDistrictRoles = [];
    req.body.params.selectedRoles.forEach(function (role) {
      if (existingUserDistrictRoles.has(role)) {
        selectedUserDistrict.edxUserDistrictRoles.push(existingUserDistrictRoles.get(role));
        return;
      }
      let newRole = {};
      newRole.edxUserDistrictID = selectedUserDistrict.edxUserDistrictID;
      newRole.edxRoleCode = role;
      newRole.createUser = createUpdateUser;
      newRole.updateUser = createUpdateUser;
      selectedUserDistrict.edxUserDistrictRoles.push(newRole);
    });

    selectedUserDistrict.updateDate = null;
    selectedUserDistrict.createDate = null;
    selectedUserDistrict.updateUser = createUpdateUser;
    selectedUserDistrict.expiryDate = req.body.params.expiryDate ? req.body.params.expiryDate : null;

    const result = await putData(token, selectedUserDistrict, `${config.get('edx:edxUsersURL')}/${selectedUserDistrict.edxUserID}/district`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    log.error(e, 'updateEdxUserDistrictRoles', 'Error occurred while attempting to update user roles.');
    return handleExceptionResponse(e, res);
  }
}

async function activateEdxUser(req, res) {
  try {
    log.debug('Attempting activation');
    const numberOfRetries = req.session['activationAttempts'];
    if (numberOfRetries && numberOfRetries >= 3) {
      return errorResponse(res, 'You have exceeded the number of activation attempts allowed. Please contact your administrator for a new activation code.', HttpStatus.TOO_MANY_REQUESTS);
    }
    const payload = {
      digitalId: req.session.digitalIdentityData.digitalID,
      personalActivationCode: req.body.personalActivationCode.trim(),
      primaryEdxCode: req.body.primaryEdxCode.trim()
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
    const token = getAccessToken(req);
    const response = await postData(token, payload, config.get('edx:userActivationURL'), req.session.correlationID);
    log.info('User Activation Successful');
    req.session.userSchoolIDs = response.edxUserSchools?.map(el => el.schoolID);
    req.session.userDistrictIDs = response.edxUserDistricts?.map(el => el.districtID);
    await getAndSetupEDXUserAndRedirect(req, res, token, req.session.digitalIdentityData.digitalID, req.session.correlationID);
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

async function getAllDistrictSchoolEdxUsers(req, res) {
  try {
    const token = getAccessToken(req);
    let response = await getData(token, `${config.get('edx:edxUsersURL')}/districtSchools/${req.query.districtID}`, req.session.correlationID);
    return res.status(HttpStatus.OK).json(response);
  } catch (e) {
    log.error(e, 'getAllDistrictSchoolEdxUsers', 'Error getting all district school EDX users');
    return handleExceptionResponse(e, res);
  }
}

async function getEdxUsers(req, res) {
  try {
    const token = getAccessToken(req);
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
  try {
    const token = getAccessToken(req);
    if(!await checkIfPrimaryCodeExists(req,res,token,'DISTRICT', req.session.activeInstituteIdentifier)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No primary code exists for this district'
      });
    }
    let createUpdateUser = getCreateOrUpdateUserValue(req);
    const payload = {
      ...req.body,
      updateUser: createUpdateUser,
      createUser: createUpdateUser,
      edxUserExpiryDate: req.body.edxUserExpiryDate ? req.body.edxUserExpiryDate : null
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
    const token = getAccessToken(req);
    if(!await checkIfPrimaryCodeExists(req,res,token, 'SCHOOL' , req.body.schoolID)){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No primary code exists for this school'
      });
    }
    let createUpdateUser = getCreateOrUpdateUserValue(req);
    const payload = {
      ...req.body,
      updateUser: createUpdateUser,
      createUser: createUpdateUser,
      edxUserExpiryDate: req.body.edxUserExpiryDate ? req.body.edxUserExpiryDate : null
    };

    const response = await postData(token, payload, config.get('edx:schoolUserActivationInviteURL'), req.session.correlationID);
    return res.status(200).json(response);
  } catch (e) {
    log.error(e, 'schoolUserActivationInvite', 'Error occurred while sending user activation invite');
    return handleExceptionResponse(e, res);
  }
}

async function removeUserSchoolOrDistrictAccess(req, res) {
  try {
    let edxUserInstituteType = req.body.params.userSchoolID ? 'school' : 'district';
    let edxUserInstituteID = req.body.params.userSchoolID ?? req.body.params.edxUserDistrictID;
    log.info('EDX User :: ' + req.session.edxUserData.edxUserID + ' is removing '+edxUserInstituteType+' access for:: ' + req.body.params.userToRemove);
    const token = getAccessToken(req);
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
    let edxUserDetails = await getData(token, `${config.get('edx:edxUsersURL')}/${req.body.params.userToRelink}`, req.session?.correlationID);
    const payload = createRelinkPayload(req, req.body.params.schoolID, edxUserDetails, req.body.params);
    const postUrl = req.body.params.schoolID ? config.get('edx:schoolUserActivationRelink') : config.get('edx:districtUserActivationRelink');
    await postData(token, payload, postUrl, req.session?.correlationID);
    return res.status(HttpStatus.OK).json('');
  } catch (e) {
    log.error(e, 'relinkUserAccess', 'Error occurred while attempting to relink user access.');
    return handleExceptionResponse(e, res);
  }
}

function createRelinkPayload(req, schoolID, edxUserDetails, requestParams) {
  let createUpdateUser = getCreateOrUpdateUserValue(req);
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
      edxUserExpiryDate: requestParams.edxUserExpiryDate,
      updateUser: createUpdateUser,
      createUser: createUpdateUser
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
      edxUserExpiryDate: requestParams.edxUserExpiryDate,
      updateUser: createUpdateUser,
      createUser: createUpdateUser
    };
  }
}

async function createSecureExchangeComment(req, res) {
  try {
    let createUpdateUser = getCreateOrUpdateUserValue(req);
    const token = getAccessToken(req);
    const edxUserInfo = req.session.edxUserData;
    const payload = {
      secureExchangeID: req.params.id,
      edxUserID: edxUserInfo.edxUserID,
      commentUserName: `${edxUserInfo.firstName} ${edxUserInfo.lastName}`,
      content: req.body.content,
      commentTimestamp: LocalDateTime.now().toJSON(),
      updateUser: createUpdateUser,
      createUser: createUpdateUser
    };

    const result = await postData(token, payload, `${config.get('edx:exchangeURL')}/${req.params.id}/comments`, req.session.correlationID);
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
  } else if (msg.includes('Invalid code provided.')) {
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
      return res.redirect(baseUrl + '/invite-selection?type=SCHOOL');
    }
    return res.redirect(baseUrl + '/invite-selection?type=DISTRICT');
  } catch (e) {
    let msg = 'Error occurred please retry with the link provided in the email';
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

async function setInstituteTypeIdentifierAndRedirect(req, res) {
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

async function setStaffInstituteTypeIdentifierAndRedirectToSchool(req, res, schoolID, sdcSchoolCollectionID, directToGrad) {
  log.info('Set InstituteTypeIdentifierAndRedirectToSchool And Redirect called');

  if(sdcSchoolCollectionID && schoolID){
    log.info('Staff user logged in, redirecting to selected school');
    setSDCStaffSessionInstituteIdentifiers(req, schoolID, 'SCHOOL');
    res.redirect(config.get('server:frontend') + '/open-school-collection-summary/' + schoolID);
  }else if(directToGrad && schoolID){
    log.info('Staff user logged in, redirecting to selected school');
    setGradStaffSessionInstituteIdentifiers(req, schoolID, 'SCHOOL');
    res.redirect(config.get('server:frontend') + '/graduation/' + schoolID);
  }else {
    log.info('User has no associated schools or districts redirecting to Unauthorized Page');
    res.redirect(config.get('server:frontend') + '/unauthorized');
  }
}

async function setInstituteTypeIdentifierAndRedirectToDistrict(req, res, districtID, sdcDistrictCollectionID) {
  log.info('Set InstituteTypeIdentifierAndRedirectToDistrict And Redirect called');

  if(sdcDistrictCollectionID && districtID){
    log.info('Staff user logged in, redirecting to selected school');
    setSessionInstituteIdentifiers(req, districtID, 'DISTRICT');
    res.redirect(config.get('server:frontend') + '/open-district-collection-summary/' + districtID);
  }else {
    log.info('User has no associated schools or districts redirecting to Unauthorized Page');
    res.redirect(config.get('server:frontend') + '/unauthorized');
  }
}

function getAndSetupStaffUserAndRedirectWithSchoolCollectionLink(req, res, accessToken, schoolID, sdcSchoolCollectionID, directToGrad) {
  let roles = req.session.passport.user._json.realm_access.roles;
  if(roles.includes('STUDENT_DATA_COLLECTION') && sdcSchoolCollectionID){
    Promise.all([
      getData(accessToken, config.get('edx:edxUsersURL') + '/user-schools', req.session.correlationID),
      getData(accessToken, config.get('edx:edxUsersURL') + '/user-districts', req.session.correlationID)
    ])
      .then(async ([userSchools, userDistricts]) => {
        req.session.userSchoolIDs = userSchools?.filter((el) => {
          return !!isSchoolActive(cacheService.getSchoolBySchoolID(el));
        });//this is list of active schoolIDs associated to the user

        req.session.userDistrictIDs = userDistricts?.filter((el) => {
          return !!isDistrictActive(cacheService.getDistrictJSONByDistrictID(el));
        });//this is list of active districtIDs associated to the user

        if(!req.session.userSchoolIDs.includes(schoolID)) {
          log.info('IDIR User attempting to log into closed or non-existent school: ' + schoolID);
          res.redirect(config.get('server:frontend') + '/unauthorizedNoEDXUser');
          return;
        }
        await setStaffInstituteTypeIdentifierAndRedirectToSchool(req, res, schoolID, sdcSchoolCollectionID, directToGrad);
      });
  }else if(roles.includes('GRAD_DATA_COLLECTION_ADMIN') && directToGrad){
    Promise.all([
      getData(accessToken, config.get('edx:edxUsersURL') + '/user-schools', req.session.correlationID)
    ])
      .then(async ([userSchools]) => {
        req.session.userSchoolIDs = userSchools?.filter((el) => {
          if(el.schoolID === schoolID){
            return cacheService.getSchoolBySchoolID(el);
          }
        });

        await setStaffInstituteTypeIdentifierAndRedirectToSchool(req, res, schoolID, sdcSchoolCollectionID, directToGrad);
      });
  }else{
    log.info('IDIR user logged in without EDX_ADMIN role; redirecting to Unauthorized Page');
    res.redirect(config.get('server:frontend') + '/unauthorized');
  }
}

function getAndSetupStaffUserAndRedirectWithDistrictCollectionLink(req, res, accessToken, districtID, sdcDistrictCollectionID) {
  let roles = req.session.passport.user._json.realm_access.roles;
  if(roles.includes('EDX_ADMIN')){
    Promise.all([
      getData(accessToken, config.get('edx:edxUsersURL') + '/user-schools', req.session.correlationID),
      getData(accessToken, config.get('edx:edxUsersURL') + '/user-districts', req.session.correlationID)
    ])
      .then(async ([userSchools, userDistricts]) => {
        req.session.userSchoolIDs = userSchools?.filter((el) => {
          return !!isSchoolActive(cacheService.getSchoolBySchoolID(el));
        });//this is list of active schoolIDs associated to the user

        req.session.userDistrictIDs = userDistricts?.filter((el) => {
          return !!isDistrictActive(cacheService.getDistrictJSONByDistrictID(el));
        });//this is list of active districtIDs associated to the user

        if(!req.session.userDistrictIDs.includes(districtID)) {
          log.info('IDIR User attempting to log into closed or non-existent district: ' + districtID);
          res.redirect(config.get('server:frontend') + '/unauthorizedNoEDXUser');
          return;
        }
        await setInstituteTypeIdentifierAndRedirectToDistrict(req, res, districtID, sdcDistrictCollectionID);
      });
  }else{
    log.info('IDIR user logged in without EDX_ADMIN role; redirecting to Unauthorized Page');
    res.redirect(config.get('server:frontend') + '/unauthorized');
  }
}

function getAndSetupEDXUserAndRedirect(req, res, accessToken, digitalID, correlationID, isValidTenant='true', isIDIRUser= 'false') {
  if(!isValidTenant || isValidTenant !== 'true'){
    log.info('Not a valid tenant, redirecting to Unauthorized Page');
    res.redirect(config.get('server:frontend') + '/unauthorized');
  }else if(!isIDIRUser || isIDIRUser !== 'true'){
    user.getEdxUserByDigitalId(accessToken, digitalID, correlationID).then(async ([edxUserData]) => {
      if (edxUserData) {
        req.session.userSchoolIDs = edxUserData.edxUserSchools?.filter((el) => {
          if(el?.expiryDate === null || LocalDateTime.now().isBefore(LocalDateTime.parse(el?.expiryDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME))) {
            return cacheService.getSchoolBySchoolID(el.schoolID);
          }
        }).flatMap(el => el.schoolID);//this is list of active schoolIDs associated to the user
        req.session.userDistrictIDs = edxUserData.edxUserDistricts?.filter((el) => {
          return !!isDistrictActive(cacheService.getDistrictJSONByDistrictID(el.districtID));
        }).flatMap(el => el.districtID);//this is list of active districtIDs associated to the user
        if (Array.isArray(edxUserData)) {
          req.session.edxUserData = edxUserData[0];
        } else {
          req.session.edxUserData = edxUserData;
          req.session.edxUserData = edxUserData;
        }
        await setInstituteTypeIdentifierAndRedirect(req, res);
      } else {
        log.info('User Set Up and Redirect called No User Data redirecting to Unauthorized Page');
        res.redirect(config.get('server:frontend') + '/unauthorized');
      }
    });
  }else{
    let roles = req.session.passport.user._json.realm_access.roles;
    if(roles.includes('EDX_ADMIN')){
      Promise.all([
        getData(accessToken, config.get('edx:edxUsersURL') + '/user-schools', req.session.correlationID),
        getData(accessToken, config.get('edx:edxUsersURL') + '/user-districts', req.session.correlationID)
      ])
        .then(async ([userSchools, userDistricts]) => {
          req.session.userSchoolIDs = userSchools?.filter((el) => {
            if(el?.expiryDate === null || LocalDateTime.now().isBefore(LocalDateTime.parse(el?.expiryDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME))) {
              return cacheService.getSchoolBySchoolID(el);
            }
          });//this is list of active schoolIDs associated to the user

          req.session.userDistrictIDs = userDistricts?.filter((el) => {
            return !!isDistrictActive(cacheService.getDistrictJSONByDistrictID(el));
          });//this is list of active districtIDs associated to the user

          await setInstituteTypeIdentifierAndRedirect(req, res);
        });
    }else{
      log.info('IDIR user logged in without EDX_ADMIN role; redirecting to Unauthorized Page');
      res.redirect(config.get('server:frontend') + '/unauthorized');
    }
  }
}

function setGradStaffSessionInstituteIdentifiers(req, activeInstituteIdentifier, activeInstituteType) {
  req.session.activeInstituteIdentifier = activeInstituteIdentifier;
  req.session.activeInstituteType = activeInstituteType;
  let permissionsArray = [];

  if(req.session.passport.user._json.idir_guid){
    permissionsArray = cacheService.getGradStaffSchoolPermissions();
  }

  req.session.activeInstitutePermissions = permissionsArray;
}

function setSDCStaffSessionInstituteIdentifiers(req, activeInstituteIdentifier, activeInstituteType) {
  req.session.activeInstituteIdentifier = activeInstituteIdentifier;
  req.session.activeInstituteType = activeInstituteType;
  let permissionsArray = [];

  if(activeInstituteType === 'SCHOOL'){
    if(req.session.passport.user._json.idir_guid){
      if(activeInstituteType === 'SCHOOL') {
        permissionsArray = cacheService.getSDCStaffSchoolPermissions();
      }else{
        permissionsArray = cacheService.getSDCStaffDistrictPermissions();
      }
    }
  }

  req.session.activeInstitutePermissions = permissionsArray;
}

function setSessionInstituteIdentifiers(req, activeInstituteIdentifier, activeInstituteType) {
  req.session.activeInstituteIdentifier = activeInstituteIdentifier;
  req.session.activeInstituteType = activeInstituteType;
  let permissionsArray = [];

  if(activeInstituteType === 'SCHOOL'){
    if(req.session.passport.user._json.idir_guid){
      permissionsArray = cacheService.getSDCStaffSchoolPermissions();
    }else{
      let selectedUserSchool = req.session.edxUserData.edxUserSchools.filter(school => school.schoolID === activeInstituteIdentifier);
      selectedUserSchool[0].edxUserSchoolRoles.forEach(function (role) {
        permissionsArray.push(...cacheService.getPermissionsForRole(role.edxRoleCode));
      });
    }
  }else{
    if(req.session.passport.user._json.idir_guid){
      permissionsArray = cacheService.getSDCStaffDistrictPermissions();
    }else {
      let selectedUserDistrict = req.session.edxUserData.edxUserDistricts.filter(district => district.districtID === activeInstituteIdentifier);
      selectedUserDistrict[0].edxUserDistrictRoles.forEach(function (role) {
        permissionsArray.push(...cacheService.getPermissionsForRole(role.edxRoleCode));
      });
    }
  }

  req.session.activeInstitutePermissions = permissionsArray;
}

async function findPrimaryEdxActivationCode(req, res) {
  try {
    const token = getAccessToken(req);
    const data = await getData(token, `${config.get('edx:activationCodeUrl')}/primary/${req.params.instituteType.toUpperCase()}/${req.params.instituteIdentifier}`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    if (e.message === '404' || e.status === '404' || e.status === 404) {
      return handleExceptionResponse(e, res);
    }
    log.error(e, 'findPrimaryEdxActivationCode', 'Error getting findPrimaryEdxActivationCode.');
    return handleExceptionResponse(e, res);
  }
}

async function checkIfPrimaryCodeExists(req,res, token, instituteType, instituteIdentifier){
  try {
    await getData(token, `${config.get('edx:activationCodeUrl')}/primary/${instituteType}/${instituteIdentifier}`, req.session?.correlationID);
    return true;
  } catch (e) {
    return false;
  }
}

async function generateOrRegeneratePrimaryEdxActivationCode(req, res) {
  try {
    let createUpdateUser = getCreateOrUpdateUserValue(req);
    const instituteType = req.params.instituteType.toUpperCase();
    const payload = {
      schoolID: instituteType === 'SCHOOL' ? req.params.instituteIdentifier : null,
      districtID: instituteType === 'DISTRICT' ? req.params.instituteIdentifier : null,
      updateUser: createUpdateUser,
      createUser: createUpdateUser
    };
    const token = getAccessToken(req);
    const result = await postData(token, payload, `${config.get('edx:activationCodeUrl')}/primary/${instituteType}/${req.params.instituteIdentifier}`, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(result);
  } catch (e) {
    log.error(e, 'generateOrRegeneratePrimaryEdxActivationCode', 'Error occurred while attempting to generate a Primary Activation Code.');
    return handleExceptionResponse(e, res);
  }
}

async function getRolesByInstituteType(req, res) {
  try {
    const token = getAccessToken(req);
    const params = {
      params: req.query
    };
    let data = await getDataWithParams(token, `${config.get('edx:rootURL')}/users/roles`, params, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(filterSchoolRoles(req, data));
  } catch (e) {
    log.error('Error getting roles', e.stack);
    return handleExceptionResponse(e, res);
  }
}

async function getSecureExchange(secureExchangeID, res, token, correlationID) {
  if (res.locals.requestedSecureExchange && res.locals.requestedSecureExchange.secureExchangeID === secureExchangeID) {
    return res.locals.requestedSecureExchange;
  }
  return getData(token, `${config.get('edx:exchangeURL')}/${secureExchangeID}`, correlationID);
}

module.exports = {
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
  getAllDistrictSchoolEdxUsers,
  schoolUserActivationInvite,
  updateEdxUserSchoolRoles,
  updateEdxUserDistrictRoles,
  updateEdxUserSchool,
  createSecureExchangeComment,
  clearActiveSession,
  getAndSetupEDXUserAndRedirect,
  getExchangesCount,
  removeUserSchoolOrDistrictAccess,
  relinkUserAccess,
  findPrimaryEdxActivationCode,
  removeSecureExchangeStudent,
  generateOrRegeneratePrimaryEdxActivationCode,
  getAndSetupStaffUserAndRedirectWithSchoolCollectionLink,
  getAndSetupStaffUserAndRedirectWithDistrictCollectionLink,
  setGradSessionInstituteIdentifiers: setGradStaffSessionInstituteIdentifiers,
  setSDCStaffSessionInstituteIdentifiers,
  getRolesByInstituteType
};

'use strict';
const {getData, getSessionUser, getDataWithParams} = require('./utils');
const config = require('../config');
const {ServiceError} = require('./error');
const HttpStatus = require('http-status-codes');
const lodash = require('lodash');
const log = require('./logger');
const cacheService = require('./cache-service');
let codes = null;

async function getEdxUserByDigitalId(accessToken, digitalID, correlationID) {
  try {
    const params = {
      params: {
        digitalId: digitalID,
      }
    };
    return await getDataWithParams(accessToken, config.get('edx:edxUsersURL'), params, correlationID);
  } catch (e) {
    throw new ServiceError('getEdxUserByDigitalId error', e);
  }
}

function isDistrictOrSchoolAlreadyInUserSession(req) {
  return (req.session.userSchoolIDs && req.session.userSchoolIDs.length > 0) || (req.session.userDistrictIDs && req.session.userDistrictIDs.length > 0);
}

async function getUserInfo(req, res) {
  const userInfo = getSessionUser(req);
  const correlationID = req.session?.correlationID;
  if (!userInfo || !userInfo.jwt || !userInfo._json || !userInfo._json.digitalIdentityID) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No session data'
    });
  }
  let activeInstituteTitle;
  switch (req.session.activeInstituteType) {
  case 'SCHOOL':
    activeInstituteTitle = cacheService.getSchoolBySchoolID(req.session.activeInstituteIdentifier)?.schoolName;
    break;
  case 'DISTRICT':
    activeInstituteTitle = cacheService.getDistrictJSONByDistrictID(req.session.activeInstituteIdentifier)?.name;
    break;
  default:
    break;
  }

  if (req.session.digitalIdentityData && isDistrictOrSchoolAlreadyInUserSession(req) && req.session.edxUserData) {
    let resData = {
      displayName: `${req.session.edxUserData?.firstName} ${req.session.edxUserData?.lastName}`,
      accountType: userInfo._json.accountType,
      userSchoolIDs: req.session.userSchoolIDs,
      userDistrictIDs:req.session.userDistrictIDs,
      activeInstituteIdentifier: req.session.activeInstituteIdentifier,
      activeInstituteType: req.session.activeInstituteType,
      activeInstituteTitle: activeInstituteTitle,
      identityTypeLabel: req.session.digitalIdentityData.identityTypeLabel,
      activeInstitutePermissions: req.session.activeInstitutePermissions,
      edxUserID: req.session.edxUserData?.edxUserID,
    };
    return res.status(HttpStatus.OK).json(resData);
  }

  const accessToken = userInfo.jwt;
  const digitalID = userInfo._json.digitalIdentityID;

  return Promise.all([
    getDigitalIdData(accessToken, digitalID, correlationID),
    getServerSideCodes(accessToken, correlationID),
    getEdxUserByDigitalId(accessToken, digitalID, correlationID),
  ]).then(async ([digitalIdData, codesData, edxUserData]) => {
    const identityType = lodash.find(codesData.identityTypes, ['identityTypeCode', digitalIdData.identityTypeCode]);
    if (!identityType) {
      log.error('getIdentityType Error identityTypeCode', digitalIdData.identityTypeCode);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Wrong identityTypeCode'
      });
    }

    if (req && req.session) {
      req.session.digitalIdentityData = digitalIdData;
      req.session.digitalIdentityData.identityTypeLabel = identityType.label;
      if(Array.isArray(edxUserData)){
        req.session.edxUserData = edxUserData[0];
      }else{
        req.session.edxUserData = edxUserData;
      }
    } else {
      throw new ServiceError('userInfo error: session does not exist');
    }

    let resData = {
      //edx user name may not exist yet in case of relink or activation. If so, fallback to BCeid displayName
      displayName: req.session.edxUserData?.firstName && req.session.edxUserData?.lastName ? `${req.session.edxUserData.firstName} ${req.session.edxUserData.lastName}` : userInfo._json.displayName,
      accountType: userInfo._json.accountType,
      userSchoolIDs: req.session.userSchoolIDs,
      userDistrictIDs: req.session.userDistrictIDs,
      activeInstituteIdentifier: req.session.activeInstituteIdentifier,
      activeInstituteType: req.session.activeInstituteType,
      activeInstituteTitle: activeInstituteTitle,
      identityTypeLabel: identityType.label,
      activeInstitutePermissions: req.session.activeInstitutePermissions,
      edxUserID: req.session.edxUserData?.edxUserID,
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

async function getDigitalIdData(token, digitalID, correlationID) {
  try {
    return await getData(token, config.get('digitalID:apiEndpoint') + `/${digitalID}`, correlationID);
  } catch (e) {
    throw new ServiceError('getDigitalIdData error', e);
  }
}


async function getServerSideCodes(accessToken, correlationID) {
  if (!codes) {
    try {
      const codeUrls = [
        `${config.get('digitalID:apiEndpoint')}/identityTypeCodes`
      ];

      const [identityTypes] = await Promise.all(codeUrls.map(url => getData(accessToken, url), correlationID));
      codes = {identityTypes};
    } catch (e) {
      throw new ServiceError('getServerSideCodes error', e);
    }
  }
  return codes;
}

module.exports = {
  getUserInfo,
  getEdxUserByDigitalId
};

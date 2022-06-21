'use strict';
const {getData, getSessionUser, getDataWithParams} = require('./utils');
const config = require('../config');
const {ServiceError} = require('./error');
const HttpStatus = require('http-status-codes');
const lodash = require('lodash');
const log = require('./logger');
let codes = null;

async function getEdxUserMinCodeByDigitalId(accessToken, digitalID, correlationID) {
  try {
    const params = {
      params: {
        digitalId: digitalID,
      }
    };
    return await getDataWithParams(accessToken, config.get('edx:edxUsersURL'), params, correlationID);
  } catch (e) {
    throw new ServiceError('getEdxUserMinCodeByDigitalId error', e);
  }
}

async function getUserInfo(req, res) {
  const userInfo = getSessionUser(req);
  const correlationID = req.session?.correlationID;
  if (!userInfo || !userInfo.jwt || !userInfo._json || !userInfo._json.digitalIdentityID) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No session data'
    });
  }
  if (req.session.digitalIdentityData && req.session.userMinCodes) {
    let resData = {
      displayName: userInfo._json.displayName,
      accountType: userInfo._json.accountType,
      mincode: req.session.userMinCodes[0],
      userMinCodes:req.session.userMinCodes,
      activeInstituteIdentifier: req.session.activeInstituteIdentifier,
      activeInstituteType: req.session.activeInstituteType,
      identityTypeLabel: req.session.digitalIdentityData.identityTypeLabel
    };
    return res.status(HttpStatus.OK).json(resData);
  }

  const accessToken = userInfo.jwt;
  const digitalID = userInfo._json.digitalIdentityID;

  return Promise.all([
    getDigitalIdData(accessToken, digitalID, correlationID),
    getServerSideCodes(accessToken, correlationID),
    getEdxUserMinCodeByDigitalId(accessToken, digitalID, correlationID),
  ]).then(async ([digitalIdData, codesData, edxUserMinCodeData]) => {

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
      req.session.userMinCodes = edxUserMinCodeData?.flatMap(user=> user.edxUserSchools?.flatMap(el=>el.mincode)); //this is list of mincodes associated to the user
      req.session.edxUserData = edxUserMinCodeData;
    } else {
      throw new ServiceError('userInfo error: session does not exist');
    }
    let resData = {
      displayName: userInfo._json.displayName,
      accountType: userInfo._json.accountType,
      identityTypeLabel: identityType.label,
      userMinCodes:req.session.userMinCodes,
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
  getEdxUserMinCodeByDigitalId
};

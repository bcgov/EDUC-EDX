'use strict';
const HttpStatus = require('http-status-codes');
const NATS = require('../messaging/message-pub-sub');
const {v4: guid} = require('uuid');
const log = require('./logger');
const cacheService = require('./cache-service');
const {VALID_PEN_MATCH_STATUSES, MULTI_PEN_MATCH_STATUSES, NOT_FOUND_PEN_MATCH_STATUSES} = require('../util/constants');

async function getPenMatch(req, res) {
  try {
    Object.keys(req.body).forEach(key => {
      req.body[key] = req.body[key] || null; // send null than empty string
    });
    if (req.body.dob) {
      req.body.dob = req.body.dob.replace(/\//g, '');
    }
    req.body.usualGivenName = req.body.usualGiven || null; // the match api expects usualGivenName
    delete req.body.usualGiven;
    req.body.mincode = cacheService.getSchoolBySchoolID(res.locals.requestedSdcSchoolCollection.schoolID).mincode;

    const event = {
      sagaId: guid(), // this should be a guid, otherwise it would break
      eventType: 'PROCESS_PEN_MATCH',
      eventPayload: JSON.stringify(req.body)
    };
    log.info('Calling pen match via NATS', event);
    // since router times out at 30 seconds on vue side, lets timeout at 29 seconds here.
    const result = await NATS.requestMessage('PEN_MATCH_API_TOPIC', JSON.stringify(event), 29000);
    const parsedEvent = JSON.parse(result);
    log.info('Got result from NATS', parsedEvent);

    let returnPayload;
    const eventPayload = JSON.parse(parsedEvent.eventPayload);

    if(eventPayload?.penStatus && VALID_PEN_MATCH_STATUSES.includes(eventPayload.penStatus)){
    //   returnPayload = {
    //     bestMatchPEN: eventPayload.matchingRecords[0].matchingPEN,
    //     bestMatchStudentID: eventPayload.matchingRecords[0].studentID,
    //     status: 'MATCH'
    //   };
    // }else if(eventPayload?.penStatus && MULTI_PEN_MATCH_STATUSES.includes(eventPayload.penStatus)){
    //   returnPayload = {
    //     status: 'MULTI'
    //   };
    // }else if(eventPayload?.penStatus && NOT_FOUND_PEN_MATCH_STATUSES.includes(eventPayload.penStatus)){
      returnPayload = {
        status: 'NEW'
      };
    }

    return res.status(200).json(returnPayload);
  } catch (e) {
    log.info(e, 'getPenMatch', 'Error occurred while attempting to get pen matches.');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'INTERNAL SERVER ERROR'
    });
  }
}


module.exports = {
  getPenMatch
};

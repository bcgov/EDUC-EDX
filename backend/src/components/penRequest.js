'use strict';

const { RequestStatuses } = require('./utils');
const config = require('../config/index');
const localDateTime = require('@js-joda/core').LocalDateTime;
const ChronoUnit = require('@js-joda/core').ChronoUnit;

function setPenRequestReplicateStatus(penRequest) {
  if (penRequest.penRequestStatusCode === PenRequestStatuses.AUTO || penRequest.penRequestStatusCode === PenRequestStatuses.MANUAL) {
    let updateTime = localDateTime.parse(penRequest.statusUpdateDate);
    let replicateTime = updateTime.truncatedTo(ChronoUnit.HOURS).withHour(config.get('penRequest:replicateTime'));
    if (config.get('penRequest:replicateTime') <= updateTime.hour()) {
      replicateTime = replicateTime.plusDays(1);
    }
    penRequest.tomorrow = penRequest.demogChanged === 'Y' && replicateTime.isAfter(localDateTime.now());
  }
  return penRequest;
}

function verifyPenRequestStatus(penRequest) {
  return penRequest.penRequestStatusCode !== PenRequestStatuses.REJECTED && 
    penRequest.penRequestStatusCode !== PenRequestStatuses.ABANDONED;
}


const PenRequestStatuses = Object.freeze({
  ...RequestStatuses,
  AUTO: 'AUTO',
  MANUAL: 'MANUAL',
});

function createPenRequestCommentPayload(requestID, commentContent) {
  return {
    penRetrievalRequestID: requestID,
    commentContent: commentContent,
    commentTimestamp: localDateTime.now().toString().substr(0, 19),
    penRequestStatusCode: RequestStatuses.SUBSREV
  };
}

function createPenRequestCommentEvent(sagaID, requestID, digitalID) {
  return {
    sagaId: sagaID,
    penRequestID: requestID,
    digitalID: digitalID,
    appType: 'GMP',
    sagaStatus: 'INITIATED',
    initiateTime: localDateTime.now().toString()
  };
}
module.exports = {
  setPenRequestReplicateStatus,
  verifyPenRequestStatus,
  createPenRequestCommentPayload,
  createPenRequestCommentEvent,
  PenRequestStatuses
};

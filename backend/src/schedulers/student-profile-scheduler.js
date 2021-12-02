'use strict';
const CronJob = require('cron').CronJob;
const config = require('../config/index');
const log = require('../components/logger');
const {getApiCredentials} = require('../components/auth');
const {getDataWithParams, putData, getData, postData} = require('../components/utils');
const localDateTime = require('@js-joda/core').LocalDateTime;
const redisUtil = require('../util/redis/redis-utils');
const schedulerCronPenRequestDraft = config.get('scheduler:schedulerCronProfileRequestDraft');
const numDaysAllowedInDraftStatus = config.get('scheduler:numDaysAllowedInDraftStatus');
const expectedDraftRequests = config.get('scheduler:expectedDraftRequests');
const numDaysAllowedInReturnedStatusBeforeEmail = config.get('scheduler:numDaysAllowedInReturnStatusBeforeEmail');
const numDaysAllowedInReturnedStatusBeforeAbandoned = config.get('scheduler:numDaysAllowedInReturnStatusBeforeAbandoned');

function getSearchCriteriaList(requestType, dateTime, statusCodeValue) {
  let searchListCriteria = [];
  searchListCriteria.push({key: `${requestType}StatusCode`, operation: 'eq', value: statusCodeValue, valueType: 'STRING'});
  searchListCriteria.push({
    key: 'statusUpdateDate',
    operation: 'lt',
    value: dateTime.toString(),
    valueType: 'DATE_TIME'
  });
  return searchListCriteria;
}

function getSearchListCriteriaForDraftRequests(requestType) {
  const dateTime = localDateTime.now().minusDays(numDaysAllowedInDraftStatus);
  return getSearchCriteriaList(requestType, dateTime, 'DRAFT');
}

function getSearchListCriteriaForAbandoningReturnedRequests(requestType) {
  const dateTime = localDateTime.now().minusDays(numDaysAllowedInReturnedStatusBeforeAbandoned);
  return getSearchCriteriaList(requestType, dateTime, 'RETURNED');
}

function getSearchListCriteriaForSendingEmailForReturnedRequests(requestType) {
  const dateTime = localDateTime.now().minusDays(numDaysAllowedInReturnedStatusBeforeEmail);
  return getSearchCriteriaList(requestType, dateTime, 'RETURNED');
}

function getSearchCriteriaParam(searchListCriteria) {
  return {
    params: {
      pageSize: expectedDraftRequests, // maximum value assumed, may not be the ideal value.
      searchCriteriaList: JSON.stringify(searchListCriteria)
    }
  };
}

async function findAndMoveRequestsToAbandoned(searchListCriteria, token, requestType, updateReqResult) {
  const params = getSearchCriteriaParam(searchListCriteria);
  const result = await getDataWithParams(token, config.get(`${requestType}:apiEndpoint`) + '/paginated', params);
  if (result['content'] && result['content'].length > 0) {
    result['content'].forEach(element => {
      element.statusUpdateDate = localDateTime.now().toString();
      element[`${requestType}StatusCode`] = 'ABANDONED';
      const putDataResult = putData(token, element, config.get(`${requestType}:apiEndpoint`));
      updateReqResult.push(putDataResult);
    });
  }
}

const draftToAbandonRequestJob = new CronJob(schedulerCronPenRequestDraft, async () => {
  const redLock = redisUtil.getRedLock();
  try {
    await redLock.lock('locks:student-profile-request:draft-abandoned', 6000); // no need to release the lock as it will auto expire after 6000 ms.
    const data = await getApiCredentials(config.get('oidc:clientId'), config.get('oidc:clientSecret'));
    await Promise.allSettled([
      findAndUpdateDraftRequestsToAbandoned('penRequest', data.accessToken),
      findAndUpdateDraftRequestsToAbandoned('studentRequest', data.accessToken),
      findAndUpdateReturnedRequestsToAbandoned('penRequest', data.accessToken),
      findAndUpdateReturnedRequestsToAbandoned('studentRequest', data.accessToken),
      findAndSendEmailForStaleReturnedRequests('penRequest', data.accessToken),
      findAndSendEmailForStaleReturnedRequests('studentRequest', data.accessToken)
    ]);
  } catch (e) {
    log.debug(`locks:student-profile-request:draft-abandoned, check other pods. ${e}`);
  }
});


async function findAndUpdateDraftRequestsToAbandoned(requestType, token) {
  try {
    const updateReqResult = [];
    log.info(`starting job for moving ${requestType}s in draft status for more than ${numDaysAllowedInDraftStatus} days to abandon status based on cron ${schedulerCronPenRequestDraft}, ${process.pid}`);
    let searchListCriteria = getSearchListCriteriaForDraftRequests(requestType);
    await findAndMoveRequestsToAbandoned(searchListCriteria, token, requestType, updateReqResult);
    await Promise.allSettled(updateReqResult);
  } catch (e) {
    log.error(`Error occurred while executing findAndUpdateDraftProfileRequestsToAbandoned ${e}`);
  }

}


async function findAndUpdateReturnedRequestsToAbandoned(requestType, token) {
  try {
    const updateReqResult = [];
    log.info(`starting job for moving ${requestType}s in returned status for more than ${numDaysAllowedInReturnedStatusBeforeAbandoned} days to abandon status based on cron ${schedulerCronPenRequestDraft}, ${process.pid}`);
    let searchListCriteria = getSearchListCriteriaForAbandoningReturnedRequests(requestType);
    await findAndMoveRequestsToAbandoned(searchListCriteria, token, requestType, updateReqResult);
    await Promise.allSettled(updateReqResult);
  } catch (e) {
    log.error(`Error occurred while executing findAndUpdateDraftProfileRequestsToAbandoned ${e}`);
  }
}

async function findAndSendEmailForStaleReturnedRequests(requestType, token) {
  try {
    const urlPath = requestType === 'penRequest' ? 'gmp' : 'ump';
    const sendEmailNotifications = [];
    const emailRequests = [];
    log.info(`starting job for triggering email for ${requestType}s in returned status for more than ${numDaysAllowedInReturnedStatusBeforeEmail} days based on cron ${schedulerCronPenRequestDraft}, ${process.pid}`);
    let searchListCriteria = getSearchListCriteriaForSendingEmailForReturnedRequests(requestType);
    const params = getSearchCriteriaParam(searchListCriteria);
    const result = await getDataWithParams(token, config.get(`${requestType}:apiEndpoint`) + '/paginated', params);
    if (result['content'] && result['content'].length > 0) {
      for (const element of result['content']) {
        const emailRequest = {
          emailAddress: element.email
        };
        try {
          const getDataResult = await getData(token, `${config.get('digitalID:apiEndpoint')}/${element.digitalID}`);
          emailRequest.identityType = getDataResult.identityTypeCode;
        } catch (e) {
          log.error('error getting data from Digital ID API', e); // just log the message and continue.
          continue;
        }
        emailRequests.push(emailRequest);
      }
      if (emailRequests.length > 0) {
        emailRequests.forEach(element => {
          const postEmail = postData(token, element, `${config.get('email:apiEndpoint')}/${urlPath}/notify-stale-return`);
          sendEmailNotifications.push(postEmail);
        });
      }
      await Promise.allSettled(sendEmailNotifications);
    }
  } catch (e) {
    log.error(`Error occurred while executing findAndUpdateDraftProfileRequestsToAbandoned ${e}`);
  }
}

const scheduler = {
  draftToAbandonRequestJob: draftToAbandonRequestJob
};
module.exports = scheduler;


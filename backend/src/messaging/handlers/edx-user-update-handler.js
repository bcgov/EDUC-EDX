'use strict';
const log = require('../../components/logger');
const CONSTANTS = require('../../util/constants');
const NATS = require('../message-pub-sub');
const cacheService = require('../../components/cache-service');

async function subscribeToEdxUserCacheRefreshTopic(nats) {
  const opts = {};

  const sub = nats.subscribe(CONSTANTS.EDX_USER_CACHE_REFRESH_TOPIC, opts);
  log.info(`Service listening to ${CONSTANTS.EDX_USER_CACHE_REFRESH_TOPIC}`);
  for await (const msg of sub) {
    log.info(`Received message, on ${msg.subject} , Subscription Id ::  [${msg.sid}], Reply to ::  [${msg.reply}] ::`);
    try {
      const payload = JSON.parse(new TextDecoder().decode(msg.data));
      if (payload && payload.edxUserID && payload.firstName && payload.lastName) {
        cacheService.updateEdxUser(payload.edxUserID, payload.firstName, payload.lastName);
      } else {
        log.error(`Invalid EDX user cache refresh payload received on ${msg.subject}: ${new TextDecoder().decode(msg.data)}`);
      }
    } catch (e) {
      log.error(`Failed to process EDX user cache refresh message on ${msg.subject} :: ${e}`);
    }
  }
}

const EdxUserUpdateHandler = {
  subscribe() {
    subscribeToEdxUserCacheRefreshTopic(NATS.getConnection());
  },

};

module.exports = EdxUserUpdateHandler;

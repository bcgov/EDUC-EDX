'use strict';
const log = require('../../components/logger');
const CONSTANTS = require('../../util/constants');
const NATS = require('../message-pub-sub');
const {StringCodec} = require('nats');
const cacheService = require('../../components/cache-service');
const sc = StringCodec();

async function subscribeToEdxAPIMessageTopic(nats) {
  const opts = {};
  const sub = nats.subscribe(CONSTANTS.MOVE_SCHOOL_TOPIC, opts);
  log.info(`listening to ${CONSTANTS.MOVE_SCHOOL_TOPIC}`);
  for await (const msg of sub) {
    const dataStr = sc.decode(msg.data);
    const data = JSON.parse(dataStr);
    log.debug(`Received message, on ${msg.subject} , Subscription Id ::  [${msg.sid}], Reply to ::  [${msg.reply}] :: Data ::`, data);
    await cacheService.loadAllSchoolsToMap();
    await cacheService.loadAllDistrictsToMap();
  }
}


const EdxSagaMessageHandler = {
  subscribe() {
    subscribeToEdxAPIMessageTopic(NATS.getConnection());
  },

};

module.exports = EdxSagaMessageHandler;

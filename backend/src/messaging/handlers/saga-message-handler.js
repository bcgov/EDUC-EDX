'use strict';
const log = require('../../components/logger');
const redisUtil = require('../../util/redis/redis-utils');
const SagaTopics = [];

function subscribeSagaMessages(nats, topic, handleMessage) {
  const opts = {
    queue : 'edx-saga-queue-group'
  };
  nats.subscribe(topic, opts, (msg, reply, subject, sid) => {
    log.info(`Received message, on ${subject} , Subscription Id ::  [${sid}], Reply to ::  [${reply}] :: Data ::`, JSON.parse(msg));
    handleMessage(msg);
  });
}

async function handleSagaMessage(msg) {
  const event = JSON.parse(msg); // it is always a JSON string of Event object.
  if('COMPLETED' === event.sagaStatus || 'FORCE_STOPPED' === event.sagaStatus){
    await redisUtil.removeSagaRecordFromRedis(event);
  }
}



const EdxSagaMessageHandler = {
  subscribe(nats) {
    SagaTopics.forEach((topic) => {
      subscribeSagaMessages(nats, topic, handleSagaMessage);
    });
  },

};

module.exports = EdxSagaMessageHandler;

const NATS = require('../messaging/message-pub-sub');
const safeStringify = require('fast-safe-stringify');
const logger = require('../components/logger');
const {StringCodec} = require('nats');

async function publishSdcEvents(data, topic) {
  NATS.getConnection();
  logger.debug('Received sdc message: ' + JSON.stringify(data));
  NATS.publishMessage(topic, StringCodec().encode(safeStringify(data))).then(() => { // publish the message only if key was present in redis, otherwise just acknowledge to STAN.
    logger.info(`Message published to ${topic}`, data);
  });
}

async function publishGdcEvents(data, topic) {
  NATS.getConnection();
  logger.debug('Received sdc message: ' + JSON.stringify(data));
  NATS.publishMessage(topic, StringCodec().encode(safeStringify(data))).then(() => { // publish the message only if key was present in redis, otherwise just acknowledge to STAN.
    logger.info(`Message published to ${topic}`, data);
  });
}

module.exports = {
  publishSdcEvents,
  publishGdcEvents
};

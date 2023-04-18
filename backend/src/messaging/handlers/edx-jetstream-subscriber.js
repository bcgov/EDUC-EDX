'use strict';
const TOPICS = ['EDX_EVENT_TOPIC'];
const logger = require('../../components/logger');
const CONSTANTS = require('../../util/constants');
const NATS = require('../../messaging/message-pub-sub');
const {AckPolicy, DeliverPolicy, StringCodec} = require('nats');
const safeStringify = require('fast-safe-stringify');

const handleJetStreamMessage = async (err, msg) => {
  if (err) {
    logger.error(err);
    return;
  }
  const data = JSON.parse(StringCodec().decode(msg.data)); // it would always be a JSON string. ii will always be choreographed event.
  logger.debug(`Received message, on ${msg.subject} , Sequence ::  [${msg.seq}], sid ::  [${msg.sid}], redelivered ::  [${msg.redelivered}] :: Data ::`, data);
  try {
    if (data.eventType === CONSTANTS.EVENT_TYPE.COPY_USERS_TO_NEW_SCHOOL && data.eventOutcome === CONSTANTS.EVENT_OUTCOME.USERS_TO_NEW_SCHOOL_COPIED) {
      await handleEdxMoveEvent(data);
    }
    msg.ack(); // acknowledge to JetStream
  } catch (e) {
    logger.error('Error while handling school data from update school event', e);
  }
};

async function handleEdxMoveEvent(data) {
  logger.info('Received edx message: ' + JSON.stringify(data.eventPayload));
  NATS.publishMessage(CONSTANTS.MOVE_SCHOOL_TOPIC, StringCodec().encode(safeStringify(data))).then(() => { // publish the message only if key was present in redis, otherwise just acknowledge to STAN.
    logger.info(`Message published to ${CONSTANTS.MOVE_SCHOOL_TOPIC}`, data);
  });
}

const subscribe = () => {
  const jetStream = NATS.getConnection().jetstream();
  TOPICS.forEach(async (key) => {

    const consumerOpts = {
      config: {
        name: 'edx-edx-api',
        durable_name: 'edx-edx-api-node-durable',
        ack_policy: AckPolicy.Explicit,
        deliver_policy: DeliverPolicy.New,
        deliver_subject: 'EDX_EVENTS_STUDENT_EDX_NODE'
      },
      mack: true,
      queue: 'edx-edx-api-node-js-queue-group',
      stream: 'EDX_EVENTS',
      callbackFn: handleJetStreamMessage,
    };

    await jetStream.subscribe(key, consumerOpts);
  });

};
module.exports = {
  subscribe
};

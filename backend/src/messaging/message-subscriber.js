'use strict';
const config = require('../config/index');
const log = require('../components/logger');
const SagaMessageHandler = require('./handlers/profile-request-saga-message-handler');
let connection={};
const server = config.get('messaging:natsUrl');
const nats = require('nats');
let connectionClosed = false;
const natsOptions = {
  url: server,
  servers: [server],
  maxReconnectAttempts: 60,
  name: 'STUDENT-PROFILE-NODE',
  reconnectTimeWait: 5000, // wait 5 seconds before retrying...
  waitOnFirstConnect: true,
  pingInterval: 5000
};

const NATS = {
  init(){
    try {
      connection = nats.connect(server, natsOptions);
    }catch (e) {
      log.error(`error ${e}`);
    }
  },
  callbacks(){
    connection.on('connect', function () {
      log.info('NATS connected!', connection?.currentServer?.url?.host);
      SagaMessageHandler.subscribe(connection);
    });

    connection.on('error', function (reason) {
      log.error(`error on NATS ${reason}`);
    });
    connection.on('connection_lost', (error) => {
      log.error('disconnected from NATS', error);
    });
    connection.on('close', (error) => {
      log.error('NATS closed', error);
      connectionClosed = true;
    });
    connection.on('reconnecting', () => {
      log.error('NATS reconnecting');
    });
    connection.on('reconnect', () => {
      log.info('NATS reconnected');
    });
  },
  close(){
    if(connection){
      connection.close();
    }
  },
  isConnectionClosed() {
    return connectionClosed;
  },

};

module.exports = NATS;

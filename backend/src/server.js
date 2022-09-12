'use strict';

const config = require('./config/index');
const http = require('http');
const log = require('./components/logger');
const localDateTime = require('@js-joda/core').LocalDateTime;
//Add timestamp to log
Object.defineProperty(log, 'heading', { get: () => { return localDateTime.now().toString(); } });

const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(config.get('server:port'));
app.set('port', port);
const server = http.createServer(app);
const NATS = require('./messaging/message-subscriber');
if(process.env.NODE_ENV !== 'test'){  //do not cache for test environment to stop GitHub Actions test from hanging.
  const cacheService = require('./components/cache-service');
  cacheService.loadAllSchoolsToMap().then(() => {
    log.info('Loaded school data to memory');
  }).catch((e) => {
    log.error('Error loading schoolsMap during boot .', e);
  });
  cacheService.loadAllRolePermissionsToMap().then(() => {
    log.info('Loaded roles and permissions data to memory');
  }).catch((e) => {
    log.error('Error loading roles during boot .', e);
  });
  cacheService.loadAllDistrictsToMap().then(() => {
    log.info('Loaded districts data to memory');
  }).catch((e) => {
    log.error('Error loading districtsMap data codes during boot .', e);
  });
  cacheService.loadAllDocumentTypeCodesToMap().then(() => {
    log.info('Loaded document type codes to memory');
  }).catch((e) => {
    log.error('Error loading document type codes during boot .', e);
  });

  require('./schedulers/cache-service-scheduler');
}

require('./schedulers/saga-check-scheduler');

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const portNum = parseInt(val, 10);

  if (isNaN(portNum)) {
    // named pipe
    return val;
  }

  if (portNum >= 0) {
    // port number
    return portNum;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ?
    'Pipe ' + port :
    'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
  case 'EACCES':
    log.error(bind + ' requires elevated privileges');
    break;
  case 'EADDRINUSE':
    log.error(bind + ' is already in use');
    break;
  default:
    throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ?
    'pipe ' + addr :
    'port ' + addr.port;
  log.info('Listening on ' + bind);
}

process.on('SIGINT',() => {
  NATS.close();
  server.close(() => {
    log.info('process terminated');
  });
});

process.on('SIGTERM', () => {
  NATS.close();
  server.close(() => {
    log.info('process terminated');
  });
});
//exports are purely for testing
module.exports = {
  normalizePort,
  onError,
  onListening,
  server
};

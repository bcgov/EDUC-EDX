'use strict';

const config = require('./config/index');
const http = require('http');
const constants = require('./util/constants');
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
const NATS = require('./messaging/message-pub-sub');
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
  cacheService.loadAllAuthoritiesToMap().then(() => {
    log.info('Loaded authority data to memory');
  }).catch((e) => {
    log.error('Error loading authoritiesMap data codes during boot .', e);
  });
  cacheService.loadAllDocumentTypeCodesToMap().then(() => {
    log.info('Loaded document type codes to memory');
  }).catch((e) => {
    log.error('Error loading document type codes during boot .', e);
  });
  cacheService.loadDataToCache( constants.CACHE_KEYS.SCHOOL_FACILITY_TYPES, 'institute:facilityTypeURL').then(() => {
    log.info('Loaded FACILITY_TYPES data to memory');
  }).catch((e) => {
    log.error('Error loading FACILITY_TYPES data during boot .', e);
  });
  cacheService.loadDataToCache( constants.CACHE_KEYS.SCHOOL_CATEGORY_TYPES, 'institute:categoryCodesURL').then(() => {
    log.info('Loaded SCHOOL_CATEGORY_TYPES data to memory');
  }).catch((e) => {
    log.error('Error loading SCHOOL_CATEGORY_TYPES data during boot .', e);
  });
  cacheService.loadDataToCache( constants.CACHE_KEYS.SCHOOL_ORGANIZATION_TYPES, 'institute:organizationCodeURL').then(() => {
    log.info('Loaded SCHOOL_ORGANIZATION_TYPES data to memory');
  }).catch((e) => {
    log.error('Error loading SCHOOL_ORGANIZATION_TYPES data during boot .', e);
  });

  cacheService.loadDataToCache(
    constants.CACHE_KEYS.SCHOOL_REPORTING_REQUIREMENT_CODES,
    'institute:reportingRequirementCodesURL'
  ).then(() => {
    log.info('Loaded SCHOOL_REPORTING_REQUIREMENT_TYPES data to memory');
  }).catch((e) => {
    log.error('Error loading SCHOOL_REPORTING_REQUIREMENT_TYPES data during boot .', e);
  });

  cacheService.loadDataToCache( constants.CACHE_KEYS.SCHOOL_NEIGHBORHOOD_LEARNING_TYPES, 'institute:neighbourhoodLearningURL').then(() => {
    log.info('Loaded SCHOOL_NEIGHBOURHOOD_LEARNING_TYPES data to memory');
  }).catch((e) => {
    log.error('Error loading SCHOOL_NEIGHBOURHOOD_LEARNING_TYPES data during boot .', e);
  });
  cacheService.loadDataToCache( constants.CACHE_KEYS.SCHOOL_GRADE_TYPES, 'institute:gradeCodeURL').then(() => {
    log.info('Loaded GRADE_CODES data to memory');
  }).catch((e) => {
    log.error('Error loading GRADE_CODES data during boot .', e);
  });
  cacheService.loadDataToCache( constants.CACHE_KEYS.PROVINCE_CODES, 'institute:provinceCodesURL').then(() => {
    log.info('Loaded PROVINCE_CODES data to memory');
  }).catch((e) => {
    log.error('Error loading PROVINCE_CODES data during boot .', e);
  });
  cacheService.loadDataToCache( constants.CACHE_KEYS.COUNTRY_CODES, 'institute:countryCodesURL').then(() => {
    log.info('Loaded COUNTRY_CODES data to memory');
  }).catch((e) => {
    log.error('Error loading COUNTRY_CODES data during boot .', e);
  });
  cacheService.loadDataToCache( constants.CACHE_KEYS.SCHOOL_CONTACT_TYPE_CODES, 'institute:schoolContactTypeCodesURL').then(() => {
    log.info('Loaded SCHOOL_CONTACT_TYPES data to memory');
  }).catch((e) => {
    log.error('Error loading SCHOOL_CONTACT_TYPES data during boot .', e);
    require('./schedulers/cache-service-scheduler');
  });
  cacheService.loadDataToCache( constants.CACHE_KEYS.DISTRICT_CONTACT_TYPE_CODES, 'institute:districtContactTypeCodesURL').then(() => {
    log.info('Loaded DISTRICT_CONTACT_TYPES data to memory');
  }).catch((e) => {
    log.error('Error loading DISTRICT_CONTACT_TYPES data during boot .', e);
    require('./schedulers/cache-service-scheduler');
  });
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

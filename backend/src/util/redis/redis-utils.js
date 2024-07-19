'use strict';
const Redis = require('./redis-client');
const log = require('../../components/logger');
const sagaEventKey = 'EDX_SAGA_EVENTS';
const safeStringify = require('fast-safe-stringify');
const RedLock = require('redlock');
const {LocalDateTime} = require('@js-joda/core');
const HttpStatus = require('http-status-codes');
let redLock;
let redLockNoRetry;
const redisUtil = {
  /**
   *
   * @param event the event object to be stored , this contains sagaId, penRequestId,digitalId, eventPayload etc..
   * @returns {Promise<void>}
   */
  async createSagaRecordInRedis(event) {
    try {
      const redisClient = Redis.getRedisClient();
      if (redisClient) {
        if (event) {
          event.createDateTime = LocalDateTime.now().toString(); // store the timestamp so that it can be checked through scheduler.
        }
        await this.addElementToSagaRecordInRedis(event.sagaId, event);
      } else {
        log.error('Redis client is not available, this should not have happened');
      }
    } catch (e) {
      log.error(`Error ${e}`);
    }
  },
  async removeSagaRecordFromRedis(event) {
    let recordFoundFromRedis = false;
    const redisClient = Redis.getRedisClient();
    if (redisClient) {
      try {
        const result = await redisClient.smembers(sagaEventKey);
        if (result && result.length > 0) {
          for (const element of result) {
            const eventArrayElement = JSON.parse(element);
            if ((eventArrayElement.sagaId && event.sagaId && eventArrayElement.sagaId === event.sagaId) && ('COMPLETED' === event.sagaStatus || 'FORCE_STOPPED' === event.sagaStatus)) {
              log.info(`going to delete this event record as it is completed or force stopped. SAGA ID :: ${eventArrayElement.sagaId} AND STATUS :: ${event.sagaStatus}`);
              recordFoundFromRedis = true;
              await this.removeElementfromSagaRecordInRedis(event.sagaId, eventArrayElement);
              log.info(`Event record deleted from REDIS. SAGA ID :: ${eventArrayElement.sagaId} AND STATUS :: ${event.sagaStatus}`);
              break;
            }
          }
        }
      } catch (e) {
        log.error(`Error ${e}`);
      }
    } else {
      log.error('Redis client is not available, this should not have happened');
    }
    return recordFoundFromRedis;
  },
  async getSagaEvents() {
    const redisClient = Redis.getRedisClient();
    if (redisClient) {
      return redisClient.smembers(sagaEventKey);
    } else {
      log.error('Redis client is not available, this should not have happened');
    }
  },
  async removeElementfromSagaRecordInRedis(sagaId, eventToDelete) {
    const redisClient = Redis.getRedisClient();
    try {
      await this.getRedLock().lock(`locks:edx-saga:deleteFromSet-${sagaId}`, 600);
      await redisClient.srem(sagaEventKey, safeStringify(eventToDelete));
    } catch (e) {
      log.info(`this pod could not acquire lock for locks:edx-saga:deleteFromSet-${sagaId}, check other pods. ${e}`);
    }
  },
  async lockSdcDuplicateBeingProcessedInRedis(sdcSchoolStudentID) {
    try {
      return await this.getRedLockNoRetry().acquire(`locks:edx-sdc-duplicate:${sdcSchoolStudentID}`, 6000);
    } catch (e) {
      log.info(`This pod could not acquire lock for locks:edx-sdc-duplicate:${sdcSchoolStudentID}, check other pods. ${e}`);
      throw new Error(HttpStatus.CONFLICT.toString());
    }
  },
  async unlockSdcDuplicateBeingProcessedInRedis(lock) {
    try {
      await this.getRedLockNoRetry().unlock(lock);
    } catch (e) {
      log.info(`This pod could not release lock for: ${lock}, check other pods. ${e}`);
    }
  },
  async lockSdcStudentBeingProcessedInRedis(sdcSchoolStudentID) {
    try {
      return await this.getRedLockNoRetry().acquire(`locks:edx-sdc-student:${sdcSchoolStudentID}`, 6000);
    } catch (e) {
      log.info(`This pod could not acquire lock for locks:edx-sdc-student:${sdcSchoolStudentID}, check other pods. ${e}`);
      throw new Error(HttpStatus.CONFLICT.toString());
    }
  },
  async unlockSdcStudentBeingProcessedInRedis(lock) {
    try {
      await this.getRedLockNoRetry().unlock(lock);
    } catch (e) {
      log.info(`This pod could not release lock for: ${lock}, check other pods. ${e}`);
    }
  },
  async lockSdcDistrictWhileSignatureIsBeingProcessedInRedis(sdcDistrictcollectionID) {
    try {
      return await this.getRedLockNoRetry().acquire(`locks:edx-sdc-district-collection:${sdcDistrictcollectionID}`, 6000);
    } catch (e) {
      log.info(`This pod could not acquire lock for locks:edx-sdc-district-collection:${sdcDistrictcollectionID}, check other pods. ${e}`);
      throw new Error(HttpStatus.CONFLICT.toString());
    }
  },
  async unlockSdcDistrictWhileSignatureIsBeingProcessedInRedis(lock) {
    try {
      await this.getRedLockNoRetry().unlock(lock);
    } catch (e) {
      log.info(`This pod could not release lock for: ${lock}, check other pods. ${e}`);
    }
  },
  async addElementToSagaRecordInRedis(sagaId, eventToAdd) {
    const redisClient = Redis.getRedisClient();
    try {
      await this.getRedLock().lock(`locks:edx-saga:addToSet-${sagaId}`, 600);
      await redisClient.sadd(sagaEventKey, safeStringify(eventToAdd));
    } catch (e) {
      log.info(`this pod could not acquire lock for locks:edx-saga:addToSet-${sagaId}, check other pods. ${e}`);
    }
  },
  getRedLock() {
    if (redLock) {
      return redLock; // reusable red lock object.
    } else {
      redLock = new RedLock(
        [Redis.getRedisClient()],
        {
          // the expected clock drift; for more details
          // see http://redis.io/topics/distlock
          driftFactor: 0.01, // time in ms

          // the max number of times Redlock will attempt
          // to lock a resource before erroring
          retryCount: 6,

          // the time in ms between attempts
          retryDelay: 50, // time in ms

          // the max time in ms randomly added to retries
          // to improve performance under high contention
          // see https://www.awsarchitectureblog.com/2015/03/backoff.html
          retryJitter: 25 // time in ms
        }
      );
    }
    redLock.on('clientError', function (err) {
      log.error('A redis connection error has occurred in getRedLock of redis-util:', err);
    });
    return redLock;
  },
  getRedLockNoRetry() {
    if (redLockNoRetry) {
      return redLockNoRetry; // reusable red lock object.
    } else {
      redLockNoRetry = new RedLock(
        [Redis.getRedisClient()],
        {
          // the expected clock drift; for more details
          // see http://redis.io/topics/distlock
          driftFactor: 0.01, // time in ms

          // the max number of times Redlock will attempt
          // to lock a resource before erroring
          retryCount: 0,

          // the time in ms between attempts
          retryDelay: 50, // time in ms

          // the max time in ms randomly added to retries
          // to improve performance under high contention
          // see https://www.awsarchitectureblog.com/2015/03/backoff.html
          retryJitter: 25 // time in ms
        }
      );
    }
    redLockNoRetry.on('clientError', function (err) {
      log.error('A redis connection error has occurred in getRedLock of redis-util:', err);
    });
    return redLockNoRetry;
  }

};

module.exports = redisUtil;

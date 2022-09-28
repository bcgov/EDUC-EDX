'use strict';

const HttpStatus = require('http-status-codes');


class ServiceError extends Error {
  constructor(errorSource, reason, ...params) {
    super(...params);

    this.name = 'ServiceError';
    this.errorSource = errorSource;

    if(reason) {
      this.stack += '\nCaused By:\n' + reason.stack;
    }
  }
}

class ConflictStateError extends Error {
  constructor(...params) {
    super(...params);

    this.name = 'ConflictStateError';
  }
}

module.exports = {
  ApiError,
  ServiceError,
  ConflictStateError
};

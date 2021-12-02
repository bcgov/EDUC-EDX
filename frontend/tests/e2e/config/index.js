'use strict';
const nconf = require('nconf');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const env = process.env.NODE_ENV;

nconf.argv()
  .env()
  .file({ file: path.join(__dirname, `${env}.json`) });

nconf.defaults({
  bceid: {
    user: process.env.BCEID_USER,
    pass: process.env.BCEID_PASS
  }
});

module.exports = nconf;

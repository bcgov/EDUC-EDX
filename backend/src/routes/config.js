const express = require('express');
const passport = require('passport');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const log = require('../components/logger');
const router = express.Router();
const {getAccessToken} = require('../components/utils');
const auth = require('../components/auth');
const isValidBackendToken= auth.isValidBackendToken();

router.get('/', passport.authenticate('jwt', {session: false}),isValidBackendToken, getConfig);


async function getConfig(req, res) {
  const disallowedConfigKeys = ['secret', 'key', 'pwd', 'password'];
  const accessToken = getAccessToken(req);
  if (!accessToken) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No access token'
    });
  }
  const configName = req.query.configName;
  log.silly(`query param for config is ${configName}`);
  if (configName) {
    const isBadConfigName = (element) => configName.includes(element);
    if (disallowedConfigKeys.some(isBadConfigName)) {
      return res.status(HttpStatus.BAD_REQUEST).json();
    }
    const resJson = {
      configValue: config.get(`${configName}`)
    };
    log.silly(`response for config is ${JSON.stringify(resJson)}`);
    return res.status(HttpStatus.OK).json(resJson);
  }
  return res.status(HttpStatus.OK).json(); // return blank response.

}

module.exports = router;

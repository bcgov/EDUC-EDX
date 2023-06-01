const express = require('express');
const passport = require('passport');
const HttpStatus = require('http-status-codes');
const router = express.Router();
const auth = require('../components/auth');
const config = require('../config');
const isValidBackendToken= auth.isValidBackendToken();

router.get('/', passport.authenticate('jwt', {session: false}), isValidBackendToken, getConfig);

async function getConfig(req, res) {
  const frontendConfig = config.get('frontendConfig');
  const frontConfig = {
    BANNER_ENVIRONMENT: frontendConfig.bannerEnvironment,
    BANNER_COLOR: frontendConfig.bannerColor
  };
  return res.status(HttpStatus.OK).json(frontConfig);
}

module.exports = router;

const express = require('express');
const HttpStatus = require('http-status-codes');
const router = express.Router();
const config = require('../config');

router.get('/', getConfig);

async function getConfig(req, res) {
  const frontendConfig = config.get('frontendConfig');
  const frontConfig = {
    BANNER_ENVIRONMENT: frontendConfig.bannerEnvironment,
    BANNER_COLOR: frontendConfig.bannerColor,
    DISABLE_SDC_FUNCTIONALITY: frontendConfig.disableSdcFunctionality,
    DISABLE_GRAD_FUNCTIONALITY: frontendConfig.disableGradFunctionality,
    TERMS_OF_USE_URL: frontendConfig.termsOfUseURL,
    HELP_URL: frontendConfig.helpURL,
    WEB_SOCKET_URL: frontendConfig.webSocketURL,
    SLD_MIGRATION_DATE: frontendConfig.sldMigrationDate
  };
  return res.status(HttpStatus.OK).json(frontConfig);
}

module.exports = router;

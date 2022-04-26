const config = require( '../config/index');

module.exports.base_url = config.get('url:base_url');
module.exports.edx_api_base_url = config.get('url:edx_api_base_url');
module.exports.api_html_status_threshold = config.get('test:api_html_status_threshold');
module.exports.credentials = Object.freeze({
    adminCredentials: {
      username: config.get('adminCredential:user'),
      password: config.get('adminCredential:pass')
    }
  });

//Token related config
module.exports.token_namespace = config.get('token:token_namespace');
module.exports.token_environment = config.get('token:token_environment');
module.exports.token_client_id = config.get('token:token_client_id');
module.exports.token_client_secret = config.get('token:token_client_secret');
module.exports.getTokenUrl = 'https://soam-'+ module.exports.token_environment +'.apps.silver.devops.gov.bc.ca/auth/realms/master/protocol/openid-connect/token';

// URLS
module.exports.edx_api_url = module.exports.base_url + config.get('url:edx_api_url');
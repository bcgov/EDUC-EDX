const config = require( '../config/index');

module.exports.base_url = config.get('url:base_url');
module.exports.edx_api_base_url = config.get('url:edx_api_base_url');
module.exports.api_html_status_threshold = config.get('test:api_html_status_threshold');
module.exports.credentials = Object.freeze({
    adminCredentials: {
      username: config.get('adminCredential:user'),
      password: config.get('adminCredential:pass'),
      digitalID:config.get('adminCredential:digitalID')
    },
    activateUserCredentials:{
        username: config.get('activateUserCredentials:user'),
        password: config.get('activateUserCredentials:pass')
    }
  });

//secure exchange
module.exports.student_penList = config.get('student:penList');
module.exports.contact_identifier = config.get('secureExchange:contactIdentifier');
module.exports.ministry_ownership_team_id = config.get('secureExchange:ministryOwnershipTeamID');

//Token related config
//module.exports.token_namespace = config.get('token:token_namespace');
//module.exports.token_environment = config.get('token:token_environment');
module.exports.token_client_id = config.get('token:token_client_id');
module.exports.token_client_secret = config.get('token:token_client_secret');
module.exports.token_endpoint = config.get('token:token_endpoint');

// URLS
module.exports.edx_api_url = module.exports.base_url + config.get('url:edx_api_url');
module.exports.institute_base_url = config.get('institute:base_url');

// PAGE Titles
module.exports.page_titles = Object.freeze({
    DASHBOARD: 'Dashboard',
    EXCHANGE: 'Secure Messaging Inbox',
    VIEW_EXCHANGE: 'Secure Message',
    NEW_EXCHANGE: 'New Message'
});

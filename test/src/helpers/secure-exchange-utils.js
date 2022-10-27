import SecureExchange from '../model/SecureExchange';
import SecureExchangeComment from '../model/SecureExchangeComment';
const date = require('date-and-time');
const {test_exchange_object} = require('../config/constants');



const secureExchangeUtils = {
  createTestExchange() {
    const userName = "EDX";
    let secureExchange = new SecureExchange();
    let comment = new SecureExchangeComment();
    secureExchange.contactIdentifier = "00899178";
    secureExchange.ministryOwnershipTeamID = "5bbdacff-1b36-4ce5-8f0a-8dab03b59715";
    secureExchange.secureExchangeContactTypeCode = "SCHOOL";
    secureExchange.createUser = userName;
    secureExchange.updateUser = userName;
    secureExchange.secureExchangeStatusCode = "OPEN";
    secureExchange.reviewer = "";
    secureExchange.subject = "Created by test automation";
    secureExchange.isReadByMinistry = false;
    secureExchange.isReadByExchangeContact = false;
    comment.commentUserName = userName;
    comment.content = "This was created using an automation test.";
    comment.createUser = userName;
    comment.updateUser = userName;
    secureExchange.addComment(comment);
    return secureExchange;
  },
};

module.exports = secureExchangeUtils;

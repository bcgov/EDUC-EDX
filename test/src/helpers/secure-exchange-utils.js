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
    secureExchange.ministryOwnershipTeamID = "9b4b71db-5093-4c3e-81ce-554972af3d48";
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

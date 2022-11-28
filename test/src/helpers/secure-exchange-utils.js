import SecureExchange from '../model/SecureExchange';
import SecureExchangeComment from '../model/SecureExchangeComment';
const {ministry_ownership_team_id, contact_identifier} = require('../config/constants');



const secureExchangeUtils = {
  createTestExchange() {
    const userName = "EDX";
    let secureExchange = new SecureExchange();
    let comment = new SecureExchangeComment();
    secureExchange.contactIdentifier = contact_identifier;
    secureExchange.ministryOwnershipTeamID = ministry_ownership_team_id;
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

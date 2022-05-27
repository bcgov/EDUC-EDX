import SecureExchange from "../model/SecureExchange";
import SecureExchangeComment from "../model/SecureExchangeComment";
const {test_exchange_object} = require("../config/constants");

const secureExchangeUtils = {
    createTestExchange() {
        let secureExchange = new SecureExchange();
        let comment = new SecureExchangeComment();
        secureExchange.contactIdentifier = test_exchange_object.contactIdentifier;
        secureExchange.ministryOwnershipTeamID = test_exchange_object.ministryOwnershipTeamID;
        secureExchange.secureExchangeContactTypeCode = test_exchange_object.secureExchangeContactTypeCode;
        secureExchange.createUser = test_exchange_object.userName;
        secureExchange.updateUser = test_exchange_object.userName;
        secureExchange.secureExchangeStatusCode = test_exchange_object.secureExchangeStatusCode;
        secureExchange.reviewer = test_exchange_object.reviewer;
        secureExchange.subject = test_exchange_object.subject;
        secureExchange.isReadByMinistry = test_exchange_object.isReadByMinistry;
        secureExchange.isReadByExchangeContact = test_exchange_object.isReadByExchangeContact;
        comment.commentUserName = test_exchange_object.userName;
        comment.content = test_exchange_object.commentContent;
        comment.createUser = test_exchange_object.userName;
        comment.updateUser = test_exchange_object.userName;
        secureExchange.addComment(comment);
        return secureExchange;
    }
}

module.exports = secureExchangeUtils;

import SecureExchange from '../model/SecureExchange';
import SecureExchangeComment from '../model/SecureExchangeComment';
import EdxActivationRole from '../model/EdxActivationRole';
import EdxActivationCode from '../model/EdxActivationCode';
const date = require('date-and-time');
const {test_exchange_object} = require('../config/constants');



const secureExchangeUtils = {
  createTestExchange() {
    const userName = "EDX";
    let secureExchange = new SecureExchange();
    let comment = new SecureExchangeComment();
    secureExchange.contactIdentifier = test_exchange_object.contactIdentifier;
    secureExchange.ministryOwnershipTeamID = test_exchange_object.ministryOwnershipTeamID;
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
  getActivationCode(activationCode, isPrimary, roles) {
    const edxActivationCode = new EdxActivationCode();
    edxActivationCode.activationCode = activationCode;
    edxActivationCode.email = 'test@test.com';
    edxActivationCode.firstName = 'UserActivationFirstName';
    edxActivationCode.lastName = 'UserActivationLastName';
    edxActivationCode.isPrimary = isPrimary;
    edxActivationCode.isUrlClicked = 'false';
    edxActivationCode.mincode = '00899178';
    const now = new Date();
    edxActivationCode.expiryDate = date.addDays(now, 1).toJSON().substring(0, 19); //get only first 19 to avoid adding millisecond at the end.
    const activationRole = new EdxActivationRole();
    activationRole.edxRoleId=roles[0].edxRoleID;
    edxActivationCode.addActivationRole(activationRole);
    return edxActivationCode;
  }
};

module.exports = secureExchangeUtils;

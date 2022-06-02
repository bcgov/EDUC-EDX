import SecureExchange from '../model/SecureExchange';
import SecureExchangeComment from '../model/SecureExchangeComment';
import EdxActivationRole from '../model/EdxActivationRole';
import EdxActivationCode from '../model/EdxActivationCode';
const date = require('date-and-time');
const {test_exchange_object} = require('../config/constants');

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
  },
  createEdxPersonalActivationCode(roles) {
    const edxActivationCode = new EdxActivationCode();
    edxActivationCode.email='test@test.com';
    edxActivationCode.activationCode='QWERTY';
    edxActivationCode.firstName='firstname';
    edxActivationCode.lastName='lastname';
    edxActivationCode.isPrimary ='false';
    edxActivationCode.isUrlClicked='false';
    edxActivationCode.mincode='00899178';
    const now = new Date();
    edxActivationCode.expiryDate=date.addDays(now,1).toJSON().substring(0,19); //get only first 19 to avoid adding millisecond at the end.
    const activationRole = new EdxActivationRole();
    activationRole.edxRoleId=roles[0].edxRoleID;
    edxActivationCode.addActivationRole(activationRole);
    return edxActivationCode;
  },
  createEdxPrimaryActivationCode(roles) {
    const edxActivationCode = new EdxActivationCode();
    edxActivationCode.activationCode='ASDFASDF';
    edxActivationCode.email='test@test.com';
    edxActivationCode.firstName='firstname';
    edxActivationCode.lastName='lastname';
    edxActivationCode.isPrimary='true';
    edxActivationCode.isUrlClicked='false';
    edxActivationCode.mincode='00899178';
    const now = new Date();
    edxActivationCode.expiryDate=date.addDays(now,1).toJSON().substring(0,19); //get only first 19 to avoid adding millisecond at the end.
    const activationRole = new EdxActivationRole();
    activationRole.edxRoleId=roles[0].edxRoleID;
    edxActivationCode.addActivationRole(activationRole);
    return edxActivationCode;
  },
};

module.exports = secureExchangeUtils;

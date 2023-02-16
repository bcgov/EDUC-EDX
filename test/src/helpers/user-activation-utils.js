import EdxActivationRole from '../model/EdxActivationRole';
import EdxActivationCode from '../model/EdxActivationCode';
import date from 'date-and-time';

const restUtils = require('../helpers/rest-utils');
const { getToken } = require('../helpers/oauth-utils');
const { edx_api_base_url } = require('../config/constants');

const userActivationUtils = {
  createEdxActivationCode(isPrimary, roles, activationCode, instituteTypeCode, instituteID) {
    const edxActivationCode = new EdxActivationCode();
    edxActivationCode.activationCode = activationCode;
    edxActivationCode.email = 'edx-noreply@gov.bc.ca';
    edxActivationCode.firstName = 'TESTAUTOMATIONUSERFIRSTNAME';
    edxActivationCode.lastName = 'TESTAUTOMATIONUSERLASTNAME';
    edxActivationCode.isPrimary = isPrimary;
    edxActivationCode.numberOfClicks = '0';
    edxActivationCode.createUser='Automation-Test'
    edxActivationCode.updateUser='Automation-Test'
    const now = new Date();

    //get only first 19 to avoid adding millisecond at the end.
    edxActivationCode.expiryDate = date.addDays(now, 1).toJSON().substring(0, 19);
    if (roles.length > 0) {
      for (const role of roles) {
        const activationRole = new EdxActivationRole();
        activationRole.edxRoleCode = role.edxRoleCode;
        edxActivationCode.addActivationRole(activationRole);
      }
    }

    if (instituteTypeCode.toString().toUpperCase() === 'SCHOOL') {
      edxActivationCode.schoolID = instituteID;
    } else if (instituteTypeCode.toString().toUpperCase() === 'DISTRICT') {
      edxActivationCode.districtID = instituteID;
    }
    return edxActivationCode;
  },

  /**
   * @param {string} userID
   * @returns {Promise<any>} Response data
   */
  async deleteUserActivationCodes(userID) {
    const { access_token } = await getToken();
    const endPoint = `${edx_api_base_url}api/v1/edx/users/activation-code/user/${userID}`;
    return await restUtils.deleteData(access_token, endPoint);
  }
};

module.exports = userActivationUtils;

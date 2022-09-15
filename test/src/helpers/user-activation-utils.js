import EdxActivationRole from '../model/EdxActivationRole';
import EdxActivationCode from '../model/EdxActivationCode';
const date = require('date-and-time');

const userActivationUtils = {

  createEdxActivationCode(isPrimary,roles,activationCode,instituteTypeCode,instituteID){
    const edxActivationCode = new EdxActivationCode();
    edxActivationCode.activationCode = activationCode;
    edxActivationCode.email = 'edx-noreply@gov.bc.ca';
    edxActivationCode.firstName = 'TESTAUTOMATIONUSERFIRSTNAME';
    edxActivationCode.lastName = 'TESTAUTOMATIONUSERLASTNAME';
    edxActivationCode.isPrimary = isPrimary;
    edxActivationCode.isUrlClicked = 'false';
    edxActivationCode.createUser='Automation-Test'
    edxActivationCode.updateUser='Automation-Test'
    const now = new Date();
    edxActivationCode.expiryDate = date.addDays(now, 1).toJSON().substring(0, 19); //get only first 19 to avoid adding millisecond at the end.
    if(roles.length>0){
      for(const role of roles){
        const activationRole = new EdxActivationRole();
        activationRole.edxRoleCode=role.edxRoleCode;
        edxActivationCode.addActivationRole(activationRole);
      }
    }

    if(instituteTypeCode.toString().toUpperCase()=== 'SCHOOL'){
      edxActivationCode.schoolID = instituteID;
    }else if(instituteTypeCode.toString().toUpperCase()=== 'DISTRICT'){
      edxActivationCode.districtID = instituteID;
    }
    return edxActivationCode;
  }
};


module.exports = userActivationUtils;

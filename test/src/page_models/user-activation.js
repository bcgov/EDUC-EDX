import {Selector} from 'testcafe';

/**
 * Represents the UserActivation page
 */
class UserActivation {

  constructor() {
    this.mincodeInput = Selector('#mincodeTextField');
    this.primaryActivationCodeInput = Selector('#primaryEdxCodeTextField');
    this.personalActivationCodeInput = Selector('#personalActivationCodeTextField');
    this.submitUserActivationButton = Selector('#edxUserActivationSubmitBtn');
    this.activationSnackBar = Selector('#activationSnackBar');
  }

}
export default UserActivation;

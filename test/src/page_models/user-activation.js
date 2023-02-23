import { Selector } from 'testcafe';

class UserActivation {

  constructor() {
    this.mincodeInput = Selector('#instituteIdentifierTextField');
    this.primaryActivationCodeInput = Selector('#primaryEdxCodeTextField');
    this.personalActivationCodeInput = Selector('#personalActivationCodeTextField');
    this.submitUserActivationButton = Selector('#edxUserActivationSubmitBtn');
    this.activationSnackBar = Selector('#activationSnackBar');
  }

}
export default UserActivation;

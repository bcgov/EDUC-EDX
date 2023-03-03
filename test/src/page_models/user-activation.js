import { Selector } from 'testcafe';
import FormWithFields from './common/formWithFields';

class UserActivation extends FormWithFields {

  constructor() {
    super('#edxUserActivationSubmitBtn');
    this.mincodeInput = Selector('#instituteIdentifierTextField');
    this.primaryActivationCodeInput = Selector('#primaryEdxCodeTextField');
    this.personalActivationCodeInput = Selector('#personalActivationCodeTextField');
    this.submitUserActivationButton = Selector('#edxUserActivationSubmitBtn');
    this.activationSnackBar = Selector('#activationSnackBar');
  }

}
export default UserActivation;

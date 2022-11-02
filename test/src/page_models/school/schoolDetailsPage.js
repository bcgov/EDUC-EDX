import { Selector, t } from 'testcafe';
import log from 'npmlog';

class SchoolDetailsPage {
  constructor() {
    this.schoolDetailsEditButton = Selector('#schoolDetailsEditButton');
    this.emailField =Selector('#schoolDetailsEmail');
    this.phoneNumberField = Selector('#schoolDetailsPhoneNumber');
    this.saveButton = Selector('#saveButton');

  }

  async clickEditButton(){
    await t.click(this.schoolDetailsEditButton);
    log.info('School Details Edit button clicked');
  }

  async clickSaveButton(){
    await t.click(this.saveButton());
    log.info('Edit School Details Save Button Clicked');
  }

  async editEmailAddress(emailId){
    await t.click(this.emailField);
    await t.selectText(this.emailField).pressKey('delete');
    await t.typeText(this.emailField,emailId);
    log.info('Email ID updated');
  }

  async editPhoneNumber(phoneNumber){
    await t.click(this.phoneNumberField)
    await t.selectText(this.phoneNumberField).pressKey('delete');
    await t.typeText(this.phoneNumberField,phoneNumber);
  }

}

export default SchoolDetailsPage;

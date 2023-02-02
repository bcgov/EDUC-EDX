import { Selector, t } from 'testcafe';
import log from 'npmlog';

class SchoolDetailsPage {
  constructor() {
    this.schoolDetailsEditButton = Selector('#schoolDetailsEditButton');
    this.emailField = Selector('#schoolDetailsEmail');
    this.phoneNumberField = Selector('#schoolDetailsPhoneNumber');
    this.faxNumberField = Selector('#schoolDetailsFaxNumber');
    this.websiteField = Selector('#schoolDetailsWebsite');
    this.saveButton = Selector('#saveButton');
    this.confirmationPromptHeader = Selector('.v-toolbar__title');
    this.confirmPublishChangesButton = Selector('#resolveBtn');
    this.nonEditableAlert = Selector('#nonEditableAlert');
    //Mailing Address fields
    this.mailAddressLine1 = Selector('#mailAddressLine1');
    this.mailAddressLine2 = Selector('#mailAddressLine2');
    this.mailAddressCity = Selector('#mailAddressCity');
    this.mailAddressProvince = Selector('#mailAddressProvince').parent('div[role="button"]');
    this.mailAddressCountry = Selector('#mailAddressCountry').parent('div[role="button"]');
    this.mailAddressPostal = Selector('#mailAddressPostal');
    //Physical Address fields
    this.physicalAddressLine1 = Selector('#physicalAddressLine1');
    this.physicalAddressLine2 = Selector('#physicalAddressLine2');
    this.physicalAddressCity = Selector('#physicalAddressCity');
    this.physicalAddressProvince = Selector('#physicalAddressProvince').parent('div[role="button"]');
    this.physicalAddressCountry = Selector('#physicalAddressCountry').parent('div[role="button"]');
    this.physicalAddressPostal = Selector('#physicalAddressPostal');
    //Same as Mailing checkbox
    this.sameAsMailingCheckbox = Selector('#sameAsMailingCheckbox').parent('div');
  }

  async clickEditButton(){
    await t.click(this.schoolDetailsEditButton);
    log.info('School Details Edit button clicked');
    await t.expect(this.nonEditableAlert.innerText).contains('Require updates to non-editable fields? Please contact');
    log.info('Non-Editable alert displayed');
  }

  async clickSaveButton(){
    await t.click(this.saveButton());
    log.info('Edit School Details Save Button Clicked');
  }

  async editEmailAddress(emailId){
    await t.click(this.emailField);
    await t.selectText(this.emailField).pressKey('delete');
    await t.typeText(this.emailField, emailId);
    log.info('Email ID updated');
  }

  async editPhoneNumber(phoneNumber){
    await t.click(this.phoneNumberField);
    await t.selectText(this.phoneNumberField).pressKey('delete');
    await t.typeText(this.phoneNumberField, phoneNumber);
  }

  async verifyConfirmation(){
    await t.expect(this.confirmationPromptHeader.withText('Confirm Updates to School Details').innerText).contains('Confirm Updates to School Details');
    log.info(`Confirmation prompt Verified`);
  }

  async confirmPublishChanges(){
    await t.click(this.confirmPublishChangesButton);
    log.info('Publish Changes confirmation clicked');
  }

  async verifyEditableFieldAlertIsNotDisplayed() {
    let schoolDetailsEditableFieldAlert = Selector('.v-alert__content');
    await t.expect(schoolDetailsEditableFieldAlert.exists).notOk();
    log.info('Verified Alert banner is not displayed');
  }

  async verifyEditableFieldAlertIsDisplayed() {
    let schoolDetailsEditableFieldAlert = Selector('.v-alert__content');
    await t.expect(schoolDetailsEditableFieldAlert.exists).ok();
    log.info('Verified Alert banner is displayed when Edit button is clicked');
  }

  async verifyEditableFieldAlertContent() {
    let schoolDetailsEditableFieldAlert = Selector('.v-alert__content').find('span');
    await t.expect(schoolDetailsEditableFieldAlert.withText('Require updates to non-editable fields? Please contact data.management@gov.bc.ca').exists).ok();
    log.info('Verified Alert banner is displaying the correct text');
  }

  async editFaxNumber(faxNumber) {
    await t.click(this.faxNumberField);
    await t.selectText(this.faxNumberField).pressKey('delete');
    await t.typeText(this.faxNumberField, faxNumber);
    log.info('Fax number updated');
  }

  async editSchoolWebsite(website) {
    await t.click(this.websiteField);
    await t.selectText(this.websiteField).pressKey('delete');
    await t.typeText(this.websiteField, website);
    log.info('School website updated');
  }

  async editNLCActivity(nlcDesc) {
    let nlcField = Selector("#schoolDetailsNlc");
    await t
      .click(nlcField)
      .click(Selector('div[role="listbox"]').find('div').withText(nlcDesc))
      .expect(nlcField.sibling('.v-select__selection').innerText)
      .eql(nlcDesc);
    log.info('NLC field updated');
  }

  async editMailingAddress(mailingAddress) {
    await t.click(this.mailAddressLine1);
    await t.selectText(this.mailAddressLine1).pressKey('delete');
    await t.typeText(this.mailAddressLine1, mailingAddress.addressLine1);
    log.info('Mailing address Line1 updated');

    await t.click(this.mailAddressLine2);
    await t.selectText(this.mailAddressLine2).pressKey('delete');
    await t.typeText(this.mailAddressLine2, mailingAddress.addressLine2);
    log.info('Mailing address Line1 updated');

    await t.click(this.mailAddressCity);
    await t.selectText(this.mailAddressCity).pressKey('delete');
    await t.typeText(this.mailAddressCity, mailingAddress.city);
    log.info('Mailing city updated');

    await t
    .click(this.mailAddressProvince)
    .click(Selector('div[role="listbox"]').find('div').withText(mailingAddress.provinceDescription));
    log.info('Mailing province updated');

    await t
    .click(this.mailAddressCountry)
    .click(Selector('div[role="listbox"]').find('div').withText(mailingAddress.countryDescription));
    log.info('Mailing country updated');

    await t.click(this.mailAddressPostal);
    await t.selectText(this.mailAddressPostal).pressKey('delete');
    await t.typeText(this.mailAddressPostal, mailingAddress.postal);
    log.info('Mailing postal code updated');
  }

  async editPhysicalAddress(physicalAddress) {
    if(this.sameAsMailingCheckbox) {
      await t.click(this.sameAsMailingCheckbox);
      log.info('Unchecked Same as Mailing address');
    }
    await t.click(this.physicalAddressLine1);
    await t.selectText(this.physicalAddressLine1).pressKey('delete');
    await t.typeText(this.physicalAddressLine1, physicalAddress.addressLine1);
    log.info('Physical address Line1 updated');

    await t.click(this.physicalAddressLine2);
    await t.selectText(this.physicalAddressLine2).pressKey('delete');
    await t.typeText(this.physicalAddressLine2, physicalAddress.addressLine2);
    log.info('Physical address Line2 updated');

    await t.click(this.physicalAddressCity);
    await t.selectText(this.physicalAddressCity).pressKey('delete');
    await t.typeText(this.physicalAddressCity, physicalAddress.city);
    log.info('Physical city updated');

    await t
    .click(this.physicalAddressProvince)
    .click(Selector('div[role="listbox"]').filterVisible().find('div').withText(physicalAddress.provinceDescription));
    log.info('Physical province updated');

    await t
    .click(this.physicalAddressCountry)
    .click(Selector('div[role="listbox"]').filterVisible().find('div').withText(physicalAddress.countryDescription));
    log.info('Physical country updated');

    await t.click(this.physicalAddressPostal);
    await t.selectText(this.physicalAddressPostal).pressKey('delete');
    await t.typeText(this.physicalAddressPostal, physicalAddress.postal);
    log.info('Physical postal code updated');
  }
}

export default SchoolDetailsPage;

import { Selector, t } from "testcafe";
import log from "npmlog";

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
    this.nonEditableAlert = Selector('#nonEditableAlert')
  }

  async clickEditButton() {
    await t.click(this.schoolDetailsEditButton);
    log.info('School Details Edit button clicked');
    await t.expect(this.nonEditableAlert.innerText).contains('Require updates to non-editable fields? Please contact');
    log.info('Non-Editable alert displayed');
  }

  async clickSaveButton() {
    await t.click(this.saveButton());
    log.info("Edit School Details Save Button Clicked");
  }

  async editEmailAddress(emailId) {
    await t.click(this.emailField);
    await t.selectText(this.emailField).pressKey("delete");
    await t.typeText(this.emailField, emailId);
    log.info("Email ID updated");
  }

  async editPhoneNumber(phoneNumber) {
    await t.click(this.phoneNumberField);
    await t.selectText(this.phoneNumberField).pressKey("delete");
    await t.typeText(this.phoneNumberField, phoneNumber);
  }

  async verifyConfirmation() {
    await t
      .expect(
        this.confirmationPromptHeader.withText(
          "Confirm Updates to School Details"
        ).innerText
      )
      .contains("Confirm Updates to School Details");
    log.info(`Confirmation prompt Verified`);
  }

  async confirmPublishChanges() {
    await t.click(this.confirmPublishChangesButton);
    log.info("Publish Changes confirmation clicked");
  }

  async verifyEditableFieldAlertIsNotDisplayed() {
    let schoolDetailsEditableFieldAlert = Selector(".v-alert__content");
    await t.expect(schoolDetailsEditableFieldAlert.exists).notOk();
    log.info("Verified Alert banner is not displayed");
  }

  async verifyEditableFieldAlertIsDisplayed() {
    let schoolDetailsEditableFieldAlert = Selector(".v-alert__content");
    await t.expect(schoolDetailsEditableFieldAlert.exists).ok();
    log.info("Verified Alert banner is displayed when Edit button is clicked");
  }

  async verifyEditableFieldAlertContent() {
    let schoolDetailsEditableFieldAlert =
      Selector(".v-alert__content").find("span");
    await t
      .expect(
        schoolDetailsEditableFieldAlert.withText(
          "Require updates to non-editable fields? Please contact data.management@gov.bc.ca"
        ).exists
      )
      .ok();
    log.info("Verified Alert banner is displaying the correct text");
  }

  async editFaxNumber(faxNumber) {
    await t.click(this.faxNumberField);
    await t.selectText(this.faxNumberField).pressKey("delete");
    await t.typeText(this.faxNumberField, faxNumber);
    log.info("Fax number updated");
  }

  async editSchoolWebsite(website) {
    await t.click(this.websiteField);
    await t.selectText(this.websiteField).pressKey("delete");
    await t.typeText(this.websiteField, website);
    log.info("School website updated");
  }

  async editNLCActivity(nlcDesc) {
    let nlcField = Selector("#schoolDetailsNlc");
    await t
      .click(nlcField)
      .click(Selector('div[role="listbox"]').find("div").withText(nlcDesc))
      .expect(nlcField.sibling(".v-select__selection").innerText)
      .eql(nlcDesc);
    log.info("NLC field updated");
  }
}

export default SchoolDetailsPage;

import {t, Selector} from 'testcafe';
import log from 'npmlog';

class AccessUsersPage {

  constructor() {
    this.newUserBtn = Selector('#new-user-button');
    this.navTitle = Selector('#navTitle');
    this.newUserVCard= Selector('#newUserInviteVCard');
    this.vCardTitle = Selector(('#newUserInviteVCardTitle'));
    this.primaryEdxActivationCode = Selector("#primaryEdxActivationCode");
    this.copyPrimaryEdxActivationCodeButton = Selector("#copyPrimaryEdxActivationCodeButton");
    this.schoolSearchSection = Selector('div').withText('Search a school below to manage their EDX Access');
    this.selectSchoolDropdown = Selector('#selectInstituteName');
    this.manageSchoolButton = Selector('#manageSchoolButton');
  }

  async clickNewUserButton() {
    await t.click(this.newUserBtn);
    log.info('New user button clicked')
  }

  async verifyUserByText(name) {
    await t.expect(this.vCardTitle.innerText).contains(name);
    log.info(`User found ${name}`);
  }

  async verifyPrimaryEdxActivationCodeHasValue() {
    await t.expect(this.primaryEdxActivationCode.innerText).notContains('Code Not Found');
    log.info('Verified that the Primary EDX Activation Code has a value.');
  }

  async verifyPrimaryEdxActivationCodeDoesNotHaveValue() {
    await t.expect(this.primaryEdxActivationCode.innerText).contains('Code Not Found');
    log.info('Verified that the Primary EDX Activation Code does not have a value.');
  }

  async verifyCopyPrimaryEdxActivationCodeButtonExists() {
    await t.expect(this.copyPrimaryEdxActivationCodeButton.exists).ok();
    log.info('Verified that the Copy Primary EDX Activation Code Button exists.');
  }

  async verifyCopyPrimaryEdxActivationCodeButtonDoesNotExist() {
    await t.expect(this.copyPrimaryEdxActivationCodeButton.exists).notOk();
    log.info('Verified that the Copy Primary EDX Activation Code Button does not exist.');
  }

  async verifyCopyPrimaryEdxActivationCodeButtonValueMatchesPrimaryEdxActivationCode() {
    let primaryEdxActivationCode = (await this.primaryEdxActivationCode.innerText).replace('Primary Activation Code:', '').trim();
    await t.expect(this.copyPrimaryEdxActivationCodeButton.withAttribute('title', `Copy ${primaryEdxActivationCode} to the clipboard.`).exists).ok();
    log.info('Verified that the Copy Primary EDX Activation Code Button\'s value matches the Primary Edx Activation Code.');
  }

  async verifySchoolSelectionCardExists() {
    await t.expect(this.schoolSearchSection.exists).ok();
    log.info('Verified school selection card exists');
  }

  async verifySchoolSelectDropdownExists() {
    await t.expect(this.selectSchoolDropdown.exists).ok();
    log.info('Verified search school dropdown exists');
  }

  async selectSchoolFromDropdown(schoolName) {
    await t
    .click(this.selectSchoolDropdown)
    .click(Selector('div[role="listbox"]').find('div').withText(schoolName))
    log.info('School Selected');
  }

  async clickManageSchoolButton(){
    await t.click(this.manageSchoolButton);
    log.info('Manage school button Clicked');
  }

}

export default AccessUsersPage;

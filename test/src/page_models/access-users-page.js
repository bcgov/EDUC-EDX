import {t, Selector} from 'testcafe';
import log from 'npmlog';

class AccessUsersPage {

  constructor() {
    this.newUserBtn = Selector('#new-user-button');
    this.navTitle = Selector('#navTitle');
    this.newUserVCard= Selector('#newUserInviteVCard');
    this.vCardTitle = Selector(('#newUserInviteVCardTitle'));
    this.primaryEdxActivationCodeChip = Selector("#primaryEdxActivationCodeChip");
    this.copyPrimaryEdxActivationCodeButton = Selector("#copyPrimaryEdxActivationCodeButton");
  }

  async clickNewUserButton() {
    await t.click(this.newUserBtn);
    log.info('New user button clicked')
  }

  async verifyUserByText(name) {
    await t.expect(this.vCardTitle.innerText).contains(name);
    log.info(`User found ${name}`);
  }

  async verifyPrimaryEdxActivationCodeChipHasValue() {
    await t.expect(this.primaryEdxActivationCodeChip.innerText).notContains('Code Not Found');
    log.info('Verified that the Primary EDX Activation Code has a value.');
  }

  async verifyPrimaryEdxActivationCodeChipDoesNotHaveValue() {
    await t.expect(this.primaryEdxActivationCodeChip.innerText).contains('Code Not Found');
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

  async verifyCopyPrimaryEdxActivationCodeButtonValueMatchesPrimaryEdxActivationCodeChip() {
    let primaryEdxActivationCode = (await this.primaryEdxActivationCodeChip.innerText).replace('Primary Activation Code:', '').trim();
    await t.expect(this.copyPrimaryEdxActivationCodeButton.withAttribute('title', `Copy ${primaryEdxActivationCode} to the clipboard.`).exists).ok();
    log.info('Verified that the Copy Primary EDX Activation Code Button does not exist.');
  }

}

export default AccessUsersPage;

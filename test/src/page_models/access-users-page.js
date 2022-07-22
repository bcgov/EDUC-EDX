import {t, Selector} from 'testcafe';
import log from 'npmlog';

class AccessUsersPage {

  constructor() {
    this.newUserBtn = Selector('#new-user-button');
    this.navTitle = Selector('#navTitle');
    this.newUserVCard= Selector('#newUserInviteVCard');
    this.vCardTitle = Selector(('#newUserInviteVCardTitle'));

  }

  async clickNewUserButton() {
    await t.click(this.newUserBtn);
    log.info('New user button clicked')
  }

  async verifyUserByText(name) {
    await t.expect(this.vCardTitle.innerText).contains(name);
    log.info(`User found ${name}`);
  }

}

export default AccessUsersPage;

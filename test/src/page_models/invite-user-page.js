import {Selector, t} from 'testcafe';
import log from 'npmlog'

class InviteUserPage {

  constructor() {
    this.firstNameInput = Selector('#newUserFirstName');
    this.lastNameInput = Selector('#newUserLastName');
    this.emailInput = Selector('#newUserEmail');
    this.rolesSelector = Selector('#instituteNewUserRolesSelect').parent('div[role="button"]');
    this.rolesSelectorBox = Selector('div[role="listbox"]');
    this.inviteBtn=Selector('#newUserInvitePostBtn');
  }

  async selectRole(roleName){
    await t.click(this.rolesSelector).wait(10);
    await t.expect(this.rolesSelectorBox.exists).ok();
    await t.click(this.rolesSelectorBox.find('div').withExactText(roleName));
    await t.click(this.emailInput());
  }

  async setFirstName(name){
    await t.typeText(this.firstNameInput, name);
    log.info('First name input');
  }

  async setLastName(name){
    await t.typeText(this.lastNameInput, name);
    log.info('Last name input');
  }

  async setEmail(email) {
    await t.typeText(this.emailInput, email);
    log.info('Email input')
  }

  async clickInviteBtn() {
    await t.click(this.inviteBtn());
    log.info('Invite button clicked');
  }

}

export default InviteUserPage;

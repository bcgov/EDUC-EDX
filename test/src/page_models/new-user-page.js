import {Selector, t} from 'testcafe';
import log from 'npmlog'

class NewUserPage {

  constructor() {
    this.firstNameInput = Selector('#newUserFirstName');
    this.lastNameInput = Selector('#newUserLastName');
    this.emailInput = Selector('#newUserEmail');
    this.schoolNameMincodeInput = Selector('#newUserSchool');
    this.rolesSelector = Selector('#newSchoolUserRolesSelect').parent('div[role="button"]');
    this.rolesSelectorBox = Selector('div[role="listbox"]');
    this.inviteBtn=Selector('#newUserInvitePostBtn');
  }

  async selectRole(roleName){
    await t.click(this.rolesSelector).wait(10);
    await t.expect(this.rolesSelectorBox.exists).ok();
    await t.click(this.rolesSelectorBox.find('div').withExactText(roleName));
    await t.click(this.emailInput());
  }

}

export default NewUserPage;

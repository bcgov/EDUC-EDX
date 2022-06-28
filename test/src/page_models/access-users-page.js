import {Selector} from 'testcafe';

class AccessUsersPage {

  constructor() {
    this.newUserBtn = Selector('#new-user-button');
    this.navTitle = Selector('#navTitle');
    this.newUserVCard= Selector('#newUserInviteVCard');
    this.vCardTitle = Selector(('#newUserInviteVCardTitle'));

  }

}

export default AccessUsersPage;

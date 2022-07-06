import {Role, Selector} from 'testcafe';


import studentAdmin from '../../auth/Roles';
import {base_url} from '../../config/constants';
import NewUserPage from '../../page_models/new-user-page';
import AccessUsersPage from '../../page_models/access-users-page';

const log = require('npmlog');
const {getToken} = require('../../helpers/oauth-utils');
let newUserInvitePage = new NewUserPage();
let accessUsersPage = new AccessUsersPage();

fixture`new-user-invite`
  .beforeEach(async t => {
    // log in as studentAdmin
    await t.useRole(studentAdmin);
    await t.maximizeWindow();
  }).afterEach(async t => {
  // logout
  await t.useRole(Role.anonymous());
});

test('test-school-user-activation-invite', async t => {

  await t.navigateTo(base_url + '/access');
  await t.expect(accessUsersPage.navTitle.innerText).contains('User Management');
  await t.click(accessUsersPage.newUserBtn);
  await t.expect(accessUsersPage.vCardTitle.innerText).contains('New User');

  await t.typeText(newUserInvitePage.firstNameInput(), 'TestUserFirstName', {timeout: 20000})
    .typeText(newUserInvitePage.lastNameInput(), 'TestUserLastName', {timeout: 20000})
    .typeText(newUserInvitePage.emailInput(), 'penemail@mailsac.com', {timeout: 2000});

  await newUserInvitePage.selectRole('Secure Exchange');
  await t.click(newUserInvitePage.inviteBtn());
  await t.expect(Selector('#mainSnackBar').innerText).contains('Success! The request is being processed.');

});

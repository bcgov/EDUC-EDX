import {Role} from 'testcafe';


import studentAdmin from '../../auth/Roles';
import {base_url, credentials} from '../../config/constants';
import NewUserPage from '../../page_models/new-user-page';
import AccessUsersPage from '../../page_models/access-users-page';
import HamburgerMenuPage from "../../page_models/common/hamburgerMenuPage";
import NavBarPage from "../../page_models/common/navBarPage";
import SnackBarPage from "../../page_models/common/snackBarPage";
const {setupInstituteEntities} =  require('../../helpers/institute-set-up-utils');
import LoginPage from '../../page_models/login-page';
const log = require('npmlog');
const {getToken} = require('../../helpers/oauth-utils');
const {setUpEdxSchoolUserWithAllAvailableRoles,deleteSetUpEdxUser} =  require('../../helpers/user-set-up-utils');
let newUserInvitePage = new NewUserPage();
let accessUsersPage = new AccessUsersPage();
const menu = new HamburgerMenuPage();
const navBar = new NavBarPage();
const snackBar = new SnackBarPage();
const loginPage = new LoginPage();

fixture`new-user-invite`
  .beforeEach(async t => {
    // log in as studentAdmin
    await setupInstituteEntities();
    await setUpEdxSchoolUserWithAllAvailableRoles(['99998'])
    await t.useRole(studentAdmin);
    await t.resizeWindow(1920, 1080);
  }).afterEach(async t => {
  // logout
//  await t.useRole(Role.anonymous());
 // const data = await getToken();
  await deleteSetUpEdxUser();
});

test('test-school-user-activation-invite', async t => {

  await t.navigateTo(base_url);
  await loginPage.login(credentials.adminCredentials);
  await menu.clickHamburgerMenu();
  await menu.clickAdministrationMenuOption();
  await menu.clickSchoolUserManagementSubMenuLink();
  await t.wait(3000);
  await navBar.verifyNavTitleByText('School User Management');

  await accessUsersPage.verifyPrimaryEdxActivationCodeHasValue();
  await accessUsersPage.verifyCopyPrimaryEdxActivationCodeButtonExists();
  await accessUsersPage.verifyCopyPrimaryEdxActivationCodeButtonValueMatchesPrimaryEdxActivationCode();

  await accessUsersPage.clickNewUserButton();
  await accessUsersPage.verifyUserByText('New User');

  await newUserInvitePage.setFirstName('TestUserFirstName');
  await newUserInvitePage.setLastName('TestUserLastName');
  await newUserInvitePage.setEmail('penemail@mailsac.com');
  await newUserInvitePage.selectRole('Secure Exchange');
  await newUserInvitePage.clickInviteBtn();

  await snackBar.verifySnackBarText('Success! The request is being processed.');

});

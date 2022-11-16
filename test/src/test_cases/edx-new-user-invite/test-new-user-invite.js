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
import InstituteSelectionPage from "../../page_models/institute-selection-page";
const log = require('npmlog');
const {getToken} = require('../../helpers/oauth-utils');
const {setUpEdxSchoolUserWithAllAvailableRoles,deleteSetUpEdxUser} =  require('../../helpers/user-set-up-utils');
let newUserInvitePage = new NewUserPage();
let accessUsersPage = new AccessUsersPage();
const menu = new HamburgerMenuPage();
const navBar = new NavBarPage();
const snackBar = new SnackBarPage();
const loginPage = new LoginPage();
const instituteSelectionPage = new InstituteSelectionPage();

fixture`new-user-invite`
  .beforeEach(async t => {
    // log in as studentAdmin
    await setupInstituteEntities();
    await setUpEdxSchoolUserWithAllAvailableRoles(['99998'])
    await loginPage.login(credentials.adminCredentials);
    await t.resizeWindow(1920, 1080);
  }).afterEach(async t => {
  // logout
    await t.navigateTo(base_url + '/logout');
    await deleteSetUpEdxUser();
});

test('test-school-user-activation-invite', async t => {

  await t.navigateTo(base_url);
  if(await instituteSelectionPage.isInstituteSelectionPage()){
    log.info('******** IS SELECTION PAGE! **********');
  }
  /*await menu.clickHamburgerMenu();
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

  await snackBar.verifySnackBarText('Success! The request is being processed.');*/

});

import log from 'npmlog';
import { base_url, credentials } from '../../config/constants';
import InviteUserPage from '../../page_models/invite-user-page';
import AccessUsersPage from '../../page_models/access-users-page';
import HamburgerMenuPage from '../../page_models/common/hamburgerMenuPage';
import NavBarPage from '../../page_models/common/navBarPage';
import SnackBarPage from '../../page_models/common/snackBarPage';
const { setupInstituteEntities } =  require('../../helpers/institute-set-up-utils');
import LoginPage from '../../page_models/login-page';
import InstituteSelectionPage from "../../page_models/institute-selection-page";

const {
  setUpEdxSchoolUserWithAllAvailableRoles,
  deleteSetUpEdxUser
} =  require('../../helpers/user-set-up-utils');

let newUserInvitePage = new InviteUserPage();
let accessUsersPage = new AccessUsersPage();
const menu = new HamburgerMenuPage();
const navBar = new NavBarPage();
const snackBar = new SnackBarPage();
const loginPage = new LoginPage();
const instituteSelectionPage = new InstituteSelectionPage();

fixture `new-user-invite`
  .beforeEach(async t => {
    await setupInstituteEntities();
    await setUpEdxSchoolUserWithAllAvailableRoles(['99998'])
    await loginPage.login(credentials.adminCredentials);
    await t.resizeWindow(1920, 1080);
  })
  .afterEach(async t => {
    await t.navigateTo(base_url + '/logout');
    await deleteSetUpEdxUser();
});

test('test-school-user-activation-invite', async t => {
  await t.navigateTo(base_url);

  if (await instituteSelectionPage.isInstituteSelectionPage()) {
    await instituteSelectionPage.clickItemFromSchoolDashboardBasedOnTitle('Camosun College');
  }

  await menu.clickHamburgerMenu();
  await menu.clickAdministrationMenuOption();
  await menu.clickSchoolUserManagementSubMenuLink();
  await t.wait(3000);
  await navBar.verifyNavTitleByText('School User Management');

  await accessUsersPage.verifyPrimaryEdxActivationCodeHasValue();
  await accessUsersPage.verifyCopyPrimaryEdxActivationCodeButtonExists();
  await accessUsersPage
    .verifyCopyPrimaryEdxActivationCodeButtonValueMatchesPrimaryEdxActivationCode();

  await accessUsersPage.clickNewUserButton();
  await accessUsersPage.verifyUserByText('New User');

  await newUserInvitePage.setFirstName('TestUserFirstName');
  await newUserInvitePage.setLastName('TestUserLastName');
  await newUserInvitePage.setEmail('penemail@mailsac.com');
  await newUserInvitePage.selectRole('Secure Exchange');
  await newUserInvitePage.clickInviteBtn();

  await snackBar.verifySnackBarText('Success! The request is being processed.');
});

test('test-school-user-invite-form-validation', async t => {
  const { firstNameInput, lastNameInput, emailInput, rolesSelector } = newUserInvitePage;

  log.info('test:', 'test-new-message-form-validation')

  await t.navigateTo(base_url);

  if (await instituteSelectionPage.isInstituteSelectionPage()) {
    await instituteSelectionPage.clickItemFromSchoolDashboardBasedOnTitle('Camosun College');
  }

  await menu.clickHamburgerMenu();
  await menu.clickAdministrationMenuOption();
  await menu.clickSchoolUserManagementSubMenuLink();
  await accessUsersPage.clickNewUserButton();

  log.info('phase 1:', 'All fields should be invalid, the post button should be disabled.');
  await newUserInvitePage.verifyFieldIsInvalid(firstNameInput, 'First name');
  await newUserInvitePage.verifyFieldIsInvalid(lastNameInput, 'Last name');
  await newUserInvitePage.verifyFieldIsInvalid(emailInput, 'Email');
  await newUserInvitePage.verifyFieldIsInvalid(rolesSelector, 'Role');
  await newUserInvitePage.verifySubmitIsDisabled();

  log.info('phase 2:', 'Ensure email field does not accept bogus input');
  await newUserInvitePage.setEmail('notAnEmail');
  await newUserInvitePage.verifyFieldIsInvalid(emailInput, 'Email');
  await newUserInvitePage.clearTextField(emailInput);

  log.info('phase 3:', 'Validate all fields and verify we can post');
  await newUserInvitePage.setFirstName('Valid');
  await newUserInvitePage.setLastName('LastName');
  await newUserInvitePage.setEmail('test@testing.ca');
  await newUserInvitePage.selectRole('Secure Exchange');

  await newUserInvitePage.verifyFieldIsValid(firstNameInput, 'First name');
  await newUserInvitePage.verifyFieldIsValid(lastNameInput, 'Last name');
  await newUserInvitePage.verifyFieldIsValid(emailInput, 'Email');
  await newUserInvitePage.verifyFieldIsValid(rolesSelector, 'Role');
  await newUserInvitePage.verifySubmitIsEnabled();

  log.info('phase 4:', 'Re-invalidate fields and make sure validators catch it.');
  await newUserInvitePage.clearTextField(firstNameInput, 'First name');
  await newUserInvitePage.clearTextField(lastNameInput, 'Last name');
  await newUserInvitePage.clearTextField(emailInput, 'Email');
  await newUserInvitePage.selectRole('Secure Exchange');
  await newUserInvitePage.verifySubmitIsDisabled();
});


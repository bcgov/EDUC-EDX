import HamburgerMenuPage from '../../page_models/common/hamburgerMenuPage';
import LoginPage from '../../page_models/login-page';
import { credentials, base_url } from '../../config/constants';
import log from 'npmlog';
import crypto from 'crypto';
import AccessUsersPage from '../../page_models/access-users-page';
import AccessUserCard from '../../page_models/access-user-card';

const {
  setUpEdxDistrictUserWithAllAvailableRoles,
  setUpEdxSchoolUserWithSpecificSchoolUserIdAndAllAvailableRoles,
  deleteSetUpEdxUser,
  deleteSpecificEdxUser,
} =  require('../../helpers/user-set-up-utils');


const loginPage = new LoginPage();
const usersPage = new AccessUsersPage();
const menu = new HamburgerMenuPage();

let userToRelink;

/** @type AccessUserCard */
let userToRelinkAccessCard;

fixture `school-user-relink`
  .before(async () => {
    log.info('stage:', 'setup');
    await setUpEdxDistrictUserWithAllAvailableRoles(['998']);

    userToRelink = await setUpEdxSchoolUserWithSpecificSchoolUserIdAndAllAvailableRoles(
      crypto.randomUUID(),
      ['99998']
    );

    userToRelinkAccessCard = new AccessUserCard(userToRelink.edxUserID);
  })
  .after(async () => {
    log.info('stage:', 'teardown');
    await deleteSetUpEdxUser();
    await deleteSpecificEdxUser(userToRelink.edxUserID);
  }).beforeEach(async t => {
    await loginPage.login(credentials.adminCredentials);
    await t.resizeWindow(1920, 1080);
  }).afterEach(async t => {
    log.info('stage:', 'after test');
    await t.navigateTo(`${base_url}/logout`)
  });

test('test-school-user-relink', async () => {
  log.info('start test:', 'test-school-user-relink');

  log.info('phase 1:', 'navigate to school users')
  await menu.clickHamburgerMenu();
  await menu.clickAdministrationMenuOption();
  await menu.clickSchoolUserManagementSubMenuLink();

  log.info('phase 2:', 'find user to relink')
  await usersPage.selectSchoolFromDropdown('EDX Automation');
  await usersPage.clickManageSchoolButton();
  await userToRelinkAccessCard.verifyRelinkEdxUserButtonExists();

  log.info('phase 3:', 'click relink, verify we have all the elements that we need');
  await userToRelinkAccessCard.clickRelinkEdxUserButton();
  await userToRelinkAccessCard.verifyRelinkConfirmationDialog();
  await userToRelinkAccessCard.verifyRelinkWarningMessage();
  await userToRelinkAccessCard.verifyRelinkConfirmationDialog();
  await userToRelinkAccessCard.verifyRelinkWarningMessage();
  await userToRelinkAccessCard.verifyRelinkCancelButton();
  await userToRelinkAccessCard.verifyRelinkActionButton();

  log.info('phase 4:', 'click relink button again, verify that the dialogue closed');
  await userToRelinkAccessCard.clickRelinkCancelButton();
  await userToRelinkAccessCard.verifyRelinkConfirmationDialogDoesNotExist();
  await userToRelinkAccessCard.verifyRelinkActionButtonDoesNotExist();
  await userToRelinkAccessCard.verifyRelinkCancelButtonDoesNotExist();

  log.info('phase 5:', 'click relink, then test the cancel button.');
  await userToRelinkAccessCard.clickRelinkEdxUserButton();
  await userToRelinkAccessCard.clickRelinkCancelButton();
  await userToRelinkAccessCard.verifyRelinkConfirmationDialogDoesNotExist();
  await userToRelinkAccessCard.verifyRelinkActionButtonDoesNotExist();
  await userToRelinkAccessCard.verifyRelinkCancelButtonDoesNotExist();

  log.info('phase 6:', 'click relink, then test the relink action button.');
  await userToRelinkAccessCard.clickRelinkEdxUserButton();
  await userToRelinkAccessCard.clickRelinkActionButton();
  await userToRelinkAccessCard.verifyEdxUserCardDoesNotExists();
});

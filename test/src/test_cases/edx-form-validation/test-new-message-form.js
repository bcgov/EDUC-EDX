import HamburgerMenuPage from '../../page_models/common/hamburgerMenuPage';
import LoginPage from '../../page_models/login-page';
import { credentials, base_url } from '../../config/constants';
import log from 'npmlog';
import NewMessagePage from '../../page_models/common/newMessagePage';

const {
  setUpEdxDistrictUserWithAllAvailableRoles,
  deleteSetUpEdxUser,
} =  require('../../helpers/user-set-up-utils');

const loginPage = new LoginPage();
const menu = new HamburgerMenuPage();
const newMessage = new NewMessagePage();

fixture `new-message-testing`
  .before(async () => {
    log.info('stage:', 'setup');
    await setUpEdxDistrictUserWithAllAvailableRoles(['998']);
  })
  .after(async () => {
    log.info('stage:', 'teardown');
    await deleteSetUpEdxUser();
  }).beforeEach(async t => {
    await loginPage.login(credentials.adminCredentials);
    await t.resizeWindow(1920, 1080);
  }).afterEach(async t => {
    log.info('stage:', 'after test');
    await t.navigateTo(`${base_url}/logout`)
  });

test('new-message-field-validation', () => {
  log.info('start test:', 'new-message-field-validation');
});

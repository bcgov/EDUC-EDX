'use strict';
import {getToken} from '../../helpers/oauth-utils';

import log from 'npmlog';
import {base_url,credentials} from '../../config/constants';
import LoginPage from '../../page_models/login-page';
import NavBarPage from '../../page_models/common/navBarPage';
import Dashboard from '../../page_models/dashboard';
import SchoolDetailsPage from '../../page_models/school/schoolDetailsPage';
import SnackBarPage from '../../page_models/common/snackBarPage';

const {setUpEdxSchoolUserWithSecureExchangeOnlyRole,deleteSetUpEdxUser} =  require('../../helpers/user-set-up-utils');
const {setupInstituteEntities} =  require('../../helpers/institute-set-up-utils');
const loginPage = new LoginPage();
const navBarPage = new NavBarPage();
const dashboard = new Dashboard();
const schoolDetailsPage = new SchoolDetailsPage();
const snackBarPage = new SnackBarPage();
let token = '';

fixture `school-details-edit-no-admin`
  .before(async () => {
    await setupInstituteEntities(true, false);
    await setUpEdxSchoolUserWithSecureExchangeOnlyRole(['99998'])
    getToken().then(async (data) => {
      token = data.access_token;
    }).catch((error => {
      log.error('Failure during test setup: ' + error);
    }));
  })
  .after(async () => {
    log.info('Performing tear-down operation');
    await deleteSetUpEdxUser();

  }) .beforeEach(async t => {
  // log in as studentAdmin
  await t.resizeWindow(1920, 1080)
  log.info("Resized the browser window")
  }).afterEach(async t => {
  // logout
  await t.navigateTo(base_url + '/logout');
});

test('test-edit-school-details-no-admin', async t => {
  await t.navigateTo(base_url+'/login');
  await loginPage.login(credentials.adminCredentials);
  await navBarPage.navTitle('EDX Automation Testing School');
  await dashboard.clickSchoolDetails();
  await schoolDetailsPage.confirmViewContactsButtonPresent();
  await schoolDetailsPage.verifyEditableFieldAlertIsNotDisplayed();
  await schoolDetailsPage.confirmAddAddressButtonMissing();
  await schoolDetailsPage.confirmEditButtonMissing();

  log.info('School Details with no admin completed successfully.');
});

'use strict';
import {getToken} from '../../helpers/oauth-utils';

import log from 'npmlog';
import {base_url,credentials} from '../../config/constants';
import LoginPage from '../../page_models/login-page';
import NavBarPage from '../../page_models/common/navBarPage';
import Dashboard from '../../page_models/dashboard';
import SchoolDetailsPage from '../../page_models/school/schoolDetailsPage';
import SnackBarPage from '../../page_models/common/snackBarPage';

const {setUpEdxSchoolUserWithAllAvailableRoles,deleteSetUpEdxUser} =  require('../../helpers/user-set-up-utils');
const {setupInstituteEntities} =  require('../../helpers/institute-set-up-utils');
const loginPage = new LoginPage();
const navBarPage = new NavBarPage();
const dashboard = new Dashboard();
const schoolDetailsPage = new SchoolDetailsPage();
const snackBarPage = new SnackBarPage();
let token = '';

fixture `school-details-edit`
  .before(async () => {
    await setupInstituteEntities(true, false);
    await setUpEdxSchoolUserWithAllAvailableRoles(['99998'])
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

test('test-edit-school-details', async t => {
  await t.navigateTo(base_url+'/login');
  await loginPage.login(credentials.adminCredentials);
  await navBarPage.navTitle('EDX Automation Testing School');
  await dashboard.clickSchoolDetails();
  await schoolDetailsPage.verifyEditableFieldAlertIsNotDisplayed();
  await schoolDetailsPage.clickAddAddressButton();
  await schoolDetailsPage.clickCancelButton();
  await schoolDetailsPage.clickEditButton();
  await schoolDetailsPage.verifyEditableFieldAlertIsDisplayed();
  await schoolDetailsPage.verifyEditableFieldAlertContent();
  await schoolDetailsPage.editEmailAddress('edxAT@gov.bc.ca');
  await schoolDetailsPage.editPhoneNumber('1234567890');
  await schoolDetailsPage.editFaxNumber('1234567890');
  await schoolDetailsPage.editSchoolWebsite('https://www.google.com/');
  await schoolDetailsPage.editNLCActivity('After School Programs');
  let mailingAddress = {
    addressLine1: '1234',
    addressLine2: 'Some Lane',
    city: 'Victoria',
    postal: 'v1v1v1',
    provinceDescription: 'Yukon',
    countryDescription: 'Canada'
  }

  await schoolDetailsPage.editMailingAddress(mailingAddress);
  await schoolDetailsPage.clickSaveButton();
  await schoolDetailsPage.verifyConfirmation();
  await schoolDetailsPage.confirmPublishChanges();
  await snackBarPage.verifySnackBarText('Success! The school details have been updated.')
  log.info('School Details Edited Successfully.');
});

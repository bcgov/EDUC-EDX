'use strict';
import {getToken} from '../../helpers/oauth-utils';

import log from "npmlog";
let token = '';
import LoginPage from "../../page_models/login-page";
import Dashboard from "../../page_models/dashboard";
import {base_url, credentials} from "../../config/constants";
import NavBarPage from "../../page_models/common/navBarPage";
import SnackBarPage from "../../page_models/common/snackBarPage";
import DistrictDetailsPage from "../../page_models/district/district-details-page";

const {setupInstituteEntities} =  require('../../helpers/institute-set-up-utils');
const {deleteSetUpEdxUser} =  require('../../helpers/user-set-up-utils');
const dashboard = new Dashboard();
const loginPage = new LoginPage();
const navBarPage = new NavBarPage();
const snackBarPage = new SnackBarPage();
const districtDetailsPage = new DistrictDetailsPage()

fixture `district-details-edit`
  .before(async async => {
    await setupInstituteEntities();
    getToken().then(async (data) => {
      token = data.access_token;
    }).catch((error => {
      log.error("Failure during test setup: " + error);
    }));
  })
  .after(async ctx => {
    log.info('Performing tear-down operation');
    await deleteSetUpEdxUser();

  }) .beforeEach(async t => {
  // log in as studentAdmin
  await t.resizeWindow(1920, 1080);
  await loginPage.login(credentials.adminCredentials);
  }).afterEach(async t => {
  // logout
  await t.navigateTo(base_url + '/logout');
});

test('test-edit-district-details', async t => {
  await navBarPage.navTitle('EDX Automation Testing School')
  await dashboard.clickDistrictDetails();
  await districtDetailsPage.clickDistrictEditButton();
  await districtDetailsPage.editEmailAddress('edxAT@gov.bc.ca');
  await districtDetailsPage.editPhoneNumber('1234567890');
  await districtDetailsPage.clickSaveButton();
  await snackBarPage.verifySnackBarText('Success! The district details have been updated.')
  log.info('District Details Edited Successfully.');
});

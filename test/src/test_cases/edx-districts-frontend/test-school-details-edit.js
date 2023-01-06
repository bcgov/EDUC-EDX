'use strict';
import {getToken} from '../../helpers/oauth-utils';

import log from 'npmlog';
import {base_url,credentials} from '../../config/constants';
import LoginPage from '../../page_models/login-page';
import Dashboard from '../../page_models/dashboard';
import SchoolDetailsPage from '../../page_models/school/schoolDetailsPage';
import SnackBarPage from '../../page_models/common/snackBarPage';
import SchoolListPage from "../../page_models/school/schoolsListPage";

const {setupInstituteEntities} =  require('../../helpers/institute-set-up-utils');
const {setUpEdxDistrictUserWithAllAvailableRoles,deleteSetUpEdxUser} =  require('../../helpers/user-set-up-utils');
const loginPage = new LoginPage();
const dashboard = new Dashboard();
const schoolList = new SchoolListPage();
const schoolDetailsPage = new SchoolDetailsPage();
const snackBarPage = new SnackBarPage();
let token = '';

fixture `district-school-details-edit`
  .before(async () => {
    await setUpEdxDistrictUserWithAllAvailableRoles(['998'])
    await setupInstituteEntities();
    getToken().then(async (data) => {
      token = data.access_token;
    }).catch((error => {
      log.error("Failure during test setup: " + error);
    }));
  })
  .after(async () => {
    log.info('Performing tear-down operation');
    await deleteSetUpEdxUser();

  }) .beforeEach(async t => {
    // log in as studentAdmin
    await loginPage.login(credentials.adminCredentials);
    await t.resizeWindow(1920, 1080)
    log.info("Resized the browser window")
  }).afterEach(async t => {
  // logout
  await t.navigateTo(base_url + '/logout');
});

test('view-school-details-as-district-user-and-edit', async t => {
  await dashboard.clickDistrictUserSchoolContactsCard();
  await schoolList.clickSchoolDetailsRow();
  await schoolDetailsPage.verifyEditableFieldAlertIsNotDisplayed();
  await schoolDetailsPage.clickEditButton();
  await schoolDetailsPage.verifyEditableFieldAlertIsDisplayed();
  await schoolDetailsPage.verifyEditableFieldAlertContent();
  await schoolDetailsPage.editEmailAddress('edxAT@gov.bc.ca');
  await schoolDetailsPage.editPhoneNumber('1234567890');
  await schoolDetailsPage.editFaxNumber('1234567890');
  await schoolDetailsPage.editSchoolWebsite('https://www.google.com/');

  let mailingAddress = {
    addressLine1: '1234',
    addressLine2: 'Some Lane',
    city: 'Victoria',
    postal: 'v1v1v1',
    provinceDescription: 'Yukon',
    countryDescription: 'Canada'
  }

  let physicalAddress = {
    addressLine1: '1235',
    addressLine2: 'Something Lane',
    city: 'Victoria',
    postal: 'v1v1v1',
    provinceDescription: 'British Columbia',
    countryDescription: 'Canada'
  }
  await schoolDetailsPage.editMailingAddress(mailingAddress);
  await schoolDetailsPage.editPhysicalAddress(physicalAddress);
  await schoolDetailsPage.clickSaveButton();
  await schoolDetailsPage.verifyConfirmation();
  await schoolDetailsPage.confirmPublishChanges();
  await snackBarPage.verifySnackBarText('Success! The school details have been updated.') 
  log.info('School Details Edited Successfully.');
});

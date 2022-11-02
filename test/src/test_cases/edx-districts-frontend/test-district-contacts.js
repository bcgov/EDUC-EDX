/**
 * Tests to run against the districts contact page
 */
import { credentials } from '../../config/constants';
import { Role } from 'testcafe';
import { getToken } from "../../helpers/oauth-utils";

import log from "npmlog";
let token = '';
import LoginPage from "../../page_models/login-page";
import DistrictContacts from "../../page_models/district/district-contacts-page";
import Dashboard from "../../page_models/dashboard";

const {setUpEdxDistrictUserWithAllAvailableRoles,deleteSetUpEdxUser} =  require('../../helpers/user-set-up-utils');
const loginPage = new LoginPage();
const districtContacts = new DistrictContacts();
const dashboard = new Dashboard();
const {deleteDistrictContact} = require('../../helpers/district-set-up-utils');

fixture `district-contacts`
    .before(async t => {
        await setUpEdxDistrictUserWithAllAvailableRoles(['006'])
        getToken().then(async (data) => {
            token = data.access_token;
        }).catch((error => {
            log.error("Failure during test setup: " + error);
        }));
    })
    .after(async ctx => {
        // find all test automation artifacts produced and remove them
        log.info("Performing tear-down operation");
        await deleteSetUpEdxUser();
    })
    .beforeEach(async t => {
        await t.maximizeWindow();
    }).afterEach(async t => {
    // logout
    await t.useRole(Role.anonymous());
});

test('new-district-contact', async t => {

    await loginPage.login(credentials.adminCredentials);
    await dashboard.clickDistrictContactsCard();
    await t.expect(districtContacts.navTitle.innerText).contains('District Contacts');

    await districtContacts.clickNewContactButton();
    await districtContacts.fillDistrictContactForm();
    await districtContacts.verifyDistrictContactDetails();

    await deleteDistrictContact('006');

});
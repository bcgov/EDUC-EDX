/**
 * Tests to run against the districts contact page
 */
import {base_url, credentials} from '../../config/constants';
import { getToken } from "../../helpers/oauth-utils";
let token = '';
import log from "npmlog";
import SchoolListPage from "../../page_models/school/schoolsListPage";
import SchoolContacts from "../../page_models/school/schoolContactsPage";
import LoginPage from '../../page_models/login-page';
import Dashboard from "../../page_models/dashboard";

const {setUpEdxDistrictUserWithAllAvailableRoles,deleteSetUpEdxUser} =  require('../../helpers/user-set-up-utils');

const schoolContacts = new SchoolContacts();
const schoolList = new SchoolListPage();
const loginPage = new LoginPage();
const dashboard = new Dashboard();

fixture `district-school-contacts`
    .before(async t => {
        await setUpEdxDistrictUserWithAllAvailableRoles(['998'])
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
        // log in as studentAdmin
      await loginPage.login(credentials.adminCredentials);
      await t.resizeWindow(1920, 1080);
    }).afterEach(async t => {
    // logout
      await t.navigateTo(base_url + '/logout');

});

test('view-school-contacts-as-district-user-and-edit', async t => {
    await dashboard.clickDistrictUserSchoolContactsCard();
    await schoolList.clickSchoolContactsButton();

    await schoolContacts.verifyPrincipalContact(99998);

    await schoolContacts.clickEditContactButton();
    await schoolContacts.editSchoolContact();
    await schoolContacts.verifyConfirmation();
    await schoolContacts.confirmPublishChanges();

    await schoolContacts.verifySchoolContactEditDetails();
});

/**
 * Tests to run against the districts contact page
 */
import { base_url } from '../../config/constants';
import { Role, Selector } from 'testcafe';
import { getToken } from "../../helpers/oauth-utils";
let token = '';
import log from "npmlog";
import studentAdmin from "../../auth/Roles";
import NavBarPage from "../../page_models/common/navBarPage";
import SchoolListPage from "../../page_models/school/schoolsListPage";
import SchoolContacts from "../../page_models/school/schoolContactsPage";

const {setUpEdxDistrictUserWithAllAvailableRoles,deleteSetUpEdxUser} =  require('../../helpers/user-set-up-utils');
const schoolsList = new SchoolListPage();
const schoolContacts = new SchoolContacts();

const navBar = new NavBarPage();

fixture `district-school-contacts`
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
        // log in as studentAdmin
        await t.useRole(studentAdmin);
    }).afterEach(async t => {
    // logout
    await t.useRole(Role.anonymous());
});

test('testPage', async t => {
    await t.navigateTo(base_url + '/schools');

    await schoolsList.clickSchoolContactsButton();
    await navBar.verifyNavTitleByText('School Contacts');

    await schoolContacts.verifyPrincipalContact('03005');


});

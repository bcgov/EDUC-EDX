import {getToken} from "../../helpers/oauth-utils";
import log from "npmlog";
import {base_url, credentials} from "../../config/constants";
import LoginPage from "../../page_models/login-page";
import crypto from "crypto";
import AccessUserCard from "../../page_models/access-user-card";
import HamburgerMenuPage from "../../page_models/common/hamburgerMenuPage";
import AccessUsersPage from '../../page_models/access-users-page';

const {deleteSetUpEdxUser,setUpEdxSchoolUserWithSpecificSchoolUserIdAndAllAvailableRoles,deleteSpecificEdxUser, setUpEdxDistrictUserWithAllAvailableRoles} =  require('../../helpers/user-set-up-utils');

const loginPage = new LoginPage();
const menu = new HamburgerMenuPage();
const accessUsersPage = new AccessUsersPage();
let createdEdxDistrictUser
let accessUserCard = null;
let token = '';

fixture `user-access-school-not-in-district`
    .before(async () => {
        await setUpEdxDistrictUserWithAllAvailableRoles(['997'])
        createdEdxDistrictUser = await setUpEdxSchoolUserWithSpecificSchoolUserIdAndAllAvailableRoles(crypto.randomUUID(), ['99998'])
        accessUserCard = new AccessUserCard(createdEdxDistrictUser.edxUserID);
        getToken().then(async (data) => {
            token = data.access_token;
            accessUserCard = new AccessUserCard(createdEdxDistrictUser.edxUserID);
        }).catch((error => {
            log.error("Failure during test setup: " + error);
        }));
    })
    .after(async () => {
        // find all test automation artifacts produced and remove them
        log.info("Performing tear-down operation");
        await deleteSpecificEdxUser(createdEdxDistrictUser.edxUserID);
        await deleteSetUpEdxUser();
    })
    .beforeEach(async t => {
        await loginPage.login(credentials.adminCredentials);
        await t.resizeWindow(1920, 1080);
    }).afterEach(async t => {
    // logout
    await t.navigateTo(base_url + '/logout');
});

test('user-access-school-not-in-dropdown', async t => {
    //School User Management
    await menu.clickHamburgerMenu();
    await menu.clickAdministrationMenuOption();
    await menu.clickSchoolUserManagementSubMenuLink();
    await t.wait(1000);

    await accessUsersPage.verifySchoolSelectionCardExists();
    await accessUsersPage.verifySchoolSelectDropdownExists();
    await accessUsersPage.verifySchoolSelectDropdownIsEmpty();
});
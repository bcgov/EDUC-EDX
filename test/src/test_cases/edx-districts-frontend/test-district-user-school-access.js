import {getToken} from "../../helpers/oauth-utils";
import log from "npmlog";
import {base_url, credentials} from "../../config/constants";
import LoginPage from "../../page_models/login-page";
import crypto from "crypto";
import AccessUserCard from "../../page_models/access-user-card";
import SnackBarPage from "../../page_models/common/snackBarPage";
import HamburgerMenuPage from "../../page_models/common/hamburgerMenuPage";
import InviteUserPage from '../../page_models/invite-user-page';
import AccessUsersPage from '../../page_models/access-users-page';

const {deleteSetUpEdxUser,setUpEdxSchoolUserWithSpecificSchoolUserIdAndAllAvailableRoles,deleteSpecificEdxUser, setUpEdxDistrictUserWithAllAvailableRoles} =  require('../../helpers/user-set-up-utils');

const loginPage = new LoginPage();
const snackBarPage = new SnackBarPage();
const menu = new HamburgerMenuPage();
const newUserInvitePage = new InviteUserPage();
const accessUsersPage = new AccessUsersPage();
let createdEdxDistrictUser
let accessUserCard = null;
let token = '';

fixture `district-users-access`
    .before(async () => {
        await setUpEdxDistrictUserWithAllAvailableRoles(['998'])
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

        //Select from hamburger menu
        await menu.clickHamburgerMenu();
        await menu.clickAdministrationMenuOption();
        await menu.clickSchoolUserManagementSubMenuLink();
        await t.wait(1000);
    
        //School User Management
        await accessUsersPage.verifySchoolSelectionCardExists();
        await accessUsersPage.verifySchoolSelectDropdownExists();
        await accessUsersPage.selectSchoolFromDropdown('EDX Automation Testing School');
        await accessUsersPage.clickManageSchoolButton();

    }).afterEach(async t => {
    // logout
    await t.navigateTo(base_url + '/logout');
});

test('school-access-add-new-user', async t => {
    // Add New User 
    await accessUsersPage.clickNewUserButton();
    await accessUsersPage.verifyUserByText('New User');

    await newUserInvitePage.setFirstName('TestUserFirstName');
    await newUserInvitePage.setLastName('TestUserLastName');
    await newUserInvitePage.setEmail('penemail@mailsac.com');
    await newUserInvitePage.selectRole('EDX School Administrator');
    await newUserInvitePage.clickInviteBtn();

    await snackBarPage.verifySnackBarText('Success! The request is being processed.');
    
});

test('school-access-edit-new-user', async t => {   
    //Click the edit button
    await accessUserCard.verifyEditEdxUserButtonExists();
    await accessUserCard.clickEditEdxUserButton();
    await accessUserCard.uncheckExistingRoleFromList();
    await accessUserCard.clickSaveRoleButton();

    await snackBarPage.verifySnackBarText('User roles have been updated.');
    
});

test('school-access-remove-new-user', async t => {   
    //Click the remove button and confirm cancelling the dialog.
    await accessUserCard.clickRemoveEdxUserButton();
    await accessUserCard.verifyDeleteEdxUserConfirmationDialogExists();
    await accessUserCard.verifyCancelUserDeleteButtonExists();
    await accessUserCard.verifyConfirmUserDeleteButtonExists();
    await accessUserCard.clickCancelUserDeleteButton();
    await accessUserCard.verifyDeleteEdxUserConfirmationDialogDoesNotExists();
    await accessUserCard.verifyCancelUserDeleteButtonDoesNotExists();
    await accessUserCard.verifyConfirmUserDeleteButtonDoesNotExists();

    //Click the remove button and remove the user.
    await accessUserCard.clickRemoveEdxUserButton();
    await accessUserCard.verifyDeleteEdxUserConfirmationDialogExists();
    await accessUserCard.verifyCancelUserDeleteButtonExists();
    await accessUserCard.verifyConfirmUserDeleteButtonExists();
    await accessUserCard.clickConfirmUserDeleteButton();
    await snackBarPage.verifySnackBarText('User has been removed.');
    await accessUserCard.verifyEdxUserCardDoesNotExists();
    
});
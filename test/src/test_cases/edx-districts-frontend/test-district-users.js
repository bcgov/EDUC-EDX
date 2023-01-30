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

const {setUpEdxDistrictUserWithAllAvailableRoles,deleteSetUpEdxUser,setUpEdxDistrictUserWithSpecificDigitalUserIdAndAllAvailableRoles,deleteSpecificEdxUser} =  require('../../helpers/user-set-up-utils');

const loginPage = new LoginPage();
const snackBarPage = new SnackBarPage();
const menu = new HamburgerMenuPage();
const newUserInvitePage = new InviteUserPage();
let createdEdxDistrictUser
let accessUserCard = null;
const accessUsersPage = new AccessUsersPage();
let token = '';

fixture `district-users`
    .before(async () => {
        await setUpEdxDistrictUserWithAllAvailableRoles(['998'])
        createdEdxDistrictUser = await setUpEdxDistrictUserWithSpecificDigitalUserIdAndAllAvailableRoles(crypto.randomUUID(), ['998'])
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
        // log in as studentAdmin
        await loginPage.login(credentials.adminCredentials);
        await t.resizeWindow(1920, 1080);

        //Select from hamburger menu
        await menu.clickHamburgerMenu();
        await menu.clickAdministrationMenuOption();
        await menu.clickDistrictUserManagementSubMenuLink();
        await t.wait(3000);
    }).afterEach(async t => {
    // logout
    await t.navigateTo(base_url + '/logout');
});

test('district-user-add-new-user-access', async t => {
    // Add New User 
    await accessUsersPage.clickNewUserButton();
    await accessUsersPage.verifyUserByText('New User');

    await newUserInvitePage.setFirstName('TestUserFirstName');
    await newUserInvitePage.setLastName('TestUserLastName');
    await newUserInvitePage.setEmail('penemail@mailsac.com');
    await newUserInvitePage.selectRole('EDX District Administrator');
    await newUserInvitePage.clickInviteBtn();

    await snackBarPage.verifySnackBarText('Success! The request is being processed.');
    
});

test('district-user-remove-other-district-user-access', async t => {
    //Confirm card state
    await accessUserCard.verifyEdxUserCardExists();
    await accessUserCard.verifyRemoveEdxUserButtonExists();
    await accessUserCard.verifyDeleteEdxUserConfirmationDialogDoesNotExists();
    await accessUserCard.verifyCancelUserDeleteButtonDoesNotExists();
    await accessUserCard.verifyConfirmUserDeleteButtonDoesNotExists();

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
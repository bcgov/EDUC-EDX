/**
 * Tests to run against the school contact page
 */
import {base_url, credentials} from '../../config/constants';
import NavBarPage from "../../page_models/common/navBarPage";
import SchoolContactsPage from "../../page_models/school/schoolContactsPage";
import Dashboard from "../../page_models/dashboard";
import SnackBarPage from "../../page_models/common/snackBarPage";
import crypto from "crypto";
import LoginPage from "../../page_models/login-page";

const {setUpEdxSchoolUserWithAllAvailableRoles} =  require('../../helpers/user-set-up-utils');
const {setupInstituteEntities} = require('../../helpers/institute-set-up-utils');
const loginPage = new LoginPage();
const navBar = new NavBarPage();
const dashboard = new Dashboard();
const schoolContactsPage = new SchoolContactsPage();
const snackBarPage = new SnackBarPage();

fixture `school-school-contacts`
    .before(async t => {
        await setUpEdxSchoolUserWithAllAvailableRoles(['99998']);
    })
    .beforeEach(async t => {
        await setupInstituteEntities();
        await t.resizeWindow(1920, 1080);
    }).afterEach(async t => {
    // logout
    await t.navigateTo(base_url + '/logout');
});

test('testPage', async t => {
    await loginPage.login(credentials.adminCredentials);
    await dashboard.clickSchoolContactsCard();
    await navBar.verifyNavTitleByText('School Contacts');
    await schoolContactsPage.verifyPrincipalContact('99998');

    //Test adding a contact.
    //Test the initial state of the new contact dialog.
    await schoolContactsPage.verifyAddSchoolContactButtonExists();
    await schoolContactsPage.verifyNewContactSheetDoesNotExist();
    await schoolContactsPage.clickAddSchoolContactButton();
    await schoolContactsPage.verifyNewContactSheetExists();
    await schoolContactsPage.verifyNewContactDropdownExists();
    await schoolContactsPage.verifyNewContactFirstNameInputExists();
    await schoolContactsPage.verifyNewContactLastNameInputExists();
    await schoolContactsPage.verifyNewContactEmailInputExists();
    await schoolContactsPage.verifyNewContactPhoneNumberInputExists();
    await schoolContactsPage.verifyNewContactPhoneExtensionInputExists();
    await schoolContactsPage.verifyNewContactAltPhoneNumberInputExists();
    await schoolContactsPage.verifyNewContactAltPhoneExtensionInputExists();
    await schoolContactsPage.verifyNewContactEffectiveDateTextFieldExists();
    await schoolContactsPage.verifyNewContactExpiryDateTextFieldExists();
    await schoolContactsPage.verifyCancelNewContactButtonExists();
    await schoolContactsPage.verifySaveNewContactButtonExists();
    await schoolContactsPage.verifySaveNewContactButtonDisabled();

    //Test closing the dialog.
    await schoolContactsPage.clickCancelNewContactButton();
    await schoolContactsPage.verifyNewContactSheetDoesNotExist();
    await schoolContactsPage.clickAddSchoolContactButton();
    await schoolContactsPage.verifyNewContactSheetExists();

    //Test completing and submitting the new contact dialog.
    let schoolContactToAdd = {
        contactType: 'Principal',
        firstName: 'Test',
        lastName: `McTest (${crypto.randomUUID()})`,
        emailAddress: 'tmctest@example.org',
        phoneNumber: '250-555-1234',
        phoneExtension: '555',
        altPhoneNumber: '250-555-2345',
        altPhoneExtension: '556'
    }
    await schoolContactsPage.completeNewContactForm(schoolContactToAdd)
    await schoolContactsPage.verifySaveNewContactButtonEnabled();
    await schoolContactsPage.clickSaveNewContactButton();
    await snackBarPage.verifySnackBarText('Success! The school contact has been created.');
    await schoolContactsPage.verifyNewContactAdded(schoolContactToAdd);
});


test('edit-school-contact', async t => {

    await loginPage.login(credentials.adminCredentials);
    await dashboard.clickSchoolContactsCard();
    await navBar.verifyNavTitleByText('School Contacts');

    await schoolContactsPage.clickEditContactButton();
    await schoolContactsPage.editSchoolContact();
    await schoolContactsPage.verifyConfirmation();
    await schoolContactsPage.confirmPublishChanges();

    await schoolContactsPage.verifySchoolContactEditDetails();
});

/**
 * Tests to run against the districts contact page
 */
import {base_url, credentials} from '../../config/constants';
import { getToken } from "../../helpers/oauth-utils";
let token = '';
import log from "npmlog";
import SchoolListPage from '../../page_models/school/schoolsListPage';
import SchoolContacts from '../../page_models/school/schoolContactsPage';
import LoginPage from '../../page_models/login-page';
import Dashboard from '../../page_models/dashboard';
import crypto from 'crypto';
import SnackBarPage from "../../page_models/common/snackBarPage";

const {setUpEdxDistrictUserWithAllAvailableRoles,deleteSetUpEdxUser} =  require('../../helpers/user-set-up-utils');

const schoolContacts = new SchoolContacts();
const schoolList = new SchoolListPage();
const loginPage = new LoginPage();
const dashboard = new Dashboard();
const snackBarPage = new SnackBarPage();

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

test('add-new-school-contact-as-district-user', async t => {
    await dashboard.clickDistrictUserSchoolContactsCard();
    await schoolList.clickSchoolContactsButton();

    await schoolContacts.verifyPrincipalContact(99998);

    //Test adding a contact.
    //Test the initial state of the new contact dialog.
    await schoolContacts.verifyAddSchoolContactButtonExists();
    await schoolContacts.verifyNewContactSheetDoesNotExist();
    await schoolContacts.clickAddSchoolContactButton();
    await schoolContacts.verifyNewContactSheetExists();
    await schoolContacts.verifyNewContactDropdownExists();
    await schoolContacts.verifyNewContactFirstNameInputExists();
    await schoolContacts.verifyNewContactLastNameInputExists();
    await schoolContacts.verifyNewContactEmailInputExists();
    await schoolContacts.verifyNewContactPhoneNumberInputExists();
    await schoolContacts.verifyNewContactPhoneExtensionInputExists();
    await schoolContacts.verifyNewContactAltPhoneNumberInputExists();
    await schoolContacts.verifyNewContactAltPhoneExtensionInputExists();
    await schoolContacts.verifyNewContactEffectiveDateTextFieldExists();
    await schoolContacts.verifyNewContactExpiryDateTextFieldExists();
    await schoolContacts.verifyCancelNewContactButtonExists();
    await schoolContacts.verifySaveNewContactButtonExists();
    await schoolContacts.verifySaveNewContactButtonDisabled();

    //Test closing the dialog.
    await schoolContacts.clickCancelNewContactButton();
    await schoolContacts.verifyNewContactSheetDoesNotExist();
    await schoolContacts.clickAddSchoolContactButton();
    await schoolContacts.verifyNewContactSheetExists();

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
    await schoolContacts.completeNewContactForm(schoolContactToAdd)
    await schoolContacts.verifySaveNewContactButtonEnabled();
    await schoolContacts.clickSaveNewContactButton();
    await snackBarPage.verifySnackBarText('Success! The school contact has been created.');
    await schoolContacts.verifyNewContactAdded(schoolContactToAdd);
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

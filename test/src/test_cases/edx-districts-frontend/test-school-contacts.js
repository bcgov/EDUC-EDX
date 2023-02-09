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

const {setupInstituteEntities, addContactToSchool, clearSchoolContacts} =  require('../../helpers/institute-set-up-utils');
const {setUpEdxDistrictUserWithAllAvailableRoles,deleteSetUpEdxUser} =  require('../../helpers/user-set-up-utils');
const httpUtils = require('../../helpers/http-utils');

const schoolContacts = new SchoolContacts();
const schoolList = new SchoolListPage();
const loginPage = new LoginPage();
const dashboard = new Dashboard();
const snackBarPage = new SnackBarPage();
let instituteDetails = null;

fixture `district-school-contacts`
    .before(async t => {
        await setUpEdxDistrictUserWithAllAvailableRoles(['998']);
        instituteDetails = await setupInstituteEntities();
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

test('verify-school-principal-name-in-school-list-as-district-user', async t => {
    await dashboard.clickDistrictUserSchoolContactsCard();
    log.info('Verifying base school list principal display name case (one active principal).');
    await schoolList.verifySchoolPrincipalName('EDXAutomation Testing');
    log.info('Verified base school list principal display name case (one active principal).');

    await clearSchoolContacts(instituteDetails.school);

    log.info('Verifying school list principal display name is empty with only expired principals.');
    await addContactToSchool(instituteDetails.school, {
        createUser: 'EDXAT',
        updateUser: null,
        createDate: null,
        updateDate: null,
        schoolContactId: null,
        schoolId: instituteDetails.school.schoolId,
        schoolContactTypeCode: 'PRINCIPAL',
        phoneNumber: '2506656585',
        phoneExtension: '123',
        alternatePhoneNumber: '2506544578',
        alternatePhoneExtension: '321',
        email: 'test@test.com',
        firstName: 'EDXAutomation',
        lastName: 'Testing',
        effectiveDate: '1900-01-01T00:00:00',
        expiryDate: '1900-01-02T00:00:00'
    });
    await httpUtils.refreshPage();
    await schoolList.verifySchoolPrincipalName('');
    log.info('Verified school list principal display name is empty with only expired principals.');
    log.info('Verifying school list principal display name is active principal\'s name.');
    await addContactToSchool(instituteDetails.school, {
        createUser: 'EDXAT',
        updateUser: null,
        createDate: null,
        updateDate: null,
        schoolContactId: null,
        schoolId: instituteDetails.school.schoolId,
        schoolContactTypeCode: 'PRINCIPAL',
        phoneNumber: '2506656585',
        phoneExtension: '123',
        alternatePhoneNumber: '2506544578',
        alternatePhoneExtension: '321',
        email: 'test@test.com',
        firstName: 'EDXAutomation Active',
        lastName: 'Testing Active',
        effectiveDate: '2000-01-01T00:00:00',
        expiryDate: null
    });
    await httpUtils.refreshPage();
    await schoolList.verifySchoolPrincipalName('EDXAutomation Active Testing Active');
    log.info('Verified school list principal display name is active principal\'s name.');
    log.info('Verifying school list principal display name is the oldest active principal\'s name.');
    await addContactToSchool(instituteDetails.school, {
        createUser: 'EDXAT',
        updateUser: null,
        createDate: null,
        updateDate: null,
        schoolContactId: null,
        schoolId: instituteDetails.school.schoolId,
        schoolContactTypeCode: 'PRINCIPAL',
        phoneNumber: '2506656585',
        phoneExtension: '123',
        alternatePhoneNumber: '2506544578',
        alternatePhoneExtension: '321',
        email: 'test@test.com',
        firstName: 'EDXAutomation Oldest Active',
        lastName: 'Testing Oldest Active',
        effectiveDate: '1950-01-01T00:00:00',
        expiryDate: null
    });
    await httpUtils.refreshPage();
    await schoolList.verifySchoolPrincipalName('EDXAutomation Oldest Active Testing Oldest Active');
    log.info('Verified school list principal display name is the oldest active principal\'s name.');
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

    await schoolContacts.verifySchoolContactEditDetails();
});

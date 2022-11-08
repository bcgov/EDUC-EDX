import { Selector, t } from 'testcafe';
import log from 'npmlog';
import {DateTimeFormatter, LocalDate} from "@js-joda/core";
import DistrictContacts from "../../page_models/district/district-contacts-page";

const {getSchoolPrincipalDetails} = require('../../helpers/school-set-up-utils');
const districtContacts = new DistrictContacts();

class SchoolContactsPage {
    constructor() {
        this.addSchoolContactButton = Selector('#addSchoolContactBtn');
        this.newContactSheet = Selector('#newContactVCard');
        this.newContactDropdown = Selector('#newContactDropdown');
        this.newContactFirstNameInput = Selector('#newContactFirstNameInput');
        this.newContactLastNameInput = Selector('#newContactLastNameInput');
        this.newContactEmailInput = Selector("#newContactEmailInput");
        this.newContactPhoneNumberInput = Selector('#newContactPhoneNumberInput');
        this.newContactPhoneExtensionInput = Selector('#newContactPhoneExtensionInput');
        this.newContactAltPhoneNumberInput = Selector('#newContactAltPhoneNumberInput')
        this.newContactAltPhoneExtensionInput = Selector('#newContactAltPhoneExtensionInput');
        this.newContactEffectiveDateTextField = Selector('#newContactEffectiveDateTextField');
        this.newContactExpiryDateTextField = Selector('#newContactExpiryDateTextField');
        this.cancelNewContactButton = Selector('#cancelNewContactBtn');
        this.saveNewContactButton = Selector('#newContactPostBtn');

        const now = new Date();
        this.selectionBox = Selector('div[role="listbox"]');
        this.datePickerDateNumber = Selector('div').child('.v-date-picker-table').find('.v-btn__content').withText(now.getDate().toString());

        this.principalContactName = Selector('strong');
        this.principalContactEmail = Selector('span');
        this.principalContactPhoneNumber = Selector('span');
        this.principalContactPhoneNumberExt = Selector('span');
        this.principalContactAltPhoneNumber = Selector('span');
        this.principalContactAltPhoneNumberExt = Selector('span');
        this.principalContactStartDate = Selector('span');
        this.editContactButton = Selector('#editContactButton');
        this.saveContactButton = Selector('#saveEditButton');

        this.editContactFirstName = Selector('#contactEditFirstName');
        this.editContactLastName = Selector('#contactEditLastName');
        this.editContactEmail = Selector('#contactEditEmail');
        this.editContactPhoneNumber = Selector('#contactEditPhoneNumber');
        this.editContactPhoneExt = Selector('#contactEditPhoneExt');
        this.editContactAltPhoneNumber = Selector('#contactEditAltPhoneNumber');
        this.editContactAltPhoneExt = Selector('#contactEditAltPhoneExt');
        this.editContactStartDate = Selector('#editContactEffectiveDateTextField');
        this.datePickerClickOne = Selector('.v-date-picker-header__value').child('div').child('button');
        this.datePickerYear = Selector('.v-date-picker-years').find('li').withText('2022');
        this.datePickerMonth = Selector('div').child('.v-date-picker-table').find('.v-btn__content').withText('Jan');
        this.datePickerDay = Selector('div').child('.v-date-picker-table').find('.v-btn__content').withText('1');
        
    }

    async verifyPrincipalContact(schoolNumber){
        //Verify the Principal and data is loaded
        await t.expect(districtContacts.superContactHeader.innerText).contains('Principal');
        let schoolPrincipalContacts = await getSchoolPrincipalDetails(schoolNumber);
        for (let schoolPrincipalContact of schoolPrincipalContacts) {
            let principalDisplayName = `${schoolPrincipalContact.firstName} ${schoolPrincipalContact.lastName}`;
            log.info(`Searching for ${principalDisplayName}.`);
            await t.expect(Selector('strong').withText(principalDisplayName).innerText).contains(principalDisplayName);
            log.info(`${principalDisplayName} entry found.`);
            let principalEffectiveDate = new LocalDate.parse(schoolPrincipalContact.effectiveDate, DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss')).toString();
            principalEffectiveDate = ' '+ principalEffectiveDate.replace(/-/g, '/');
            await t.expect(Selector('span').withText(principalEffectiveDate).innerText).contains(principalEffectiveDate);
        }
        log.info('Principal contact information verified.');
    }

    async verifyAddSchoolContactButtonExists() {
        await t.expect(this.addSchoolContactButton.exists).ok();
        log.info('Verified Add School Contact Button exists.');
    }

    async verifyAddSchoolContactButtonEnabled() {
        await t.expect(this.addSchoolContactButton.hasAttribute('disabled')).notOk();
        log.info('Verified Add School Contact Button is enabled.');
    }

    async verifyAddSchoolContactButtonDisabled() {
        await t.expect(this.addSchoolContactButton.hasAttribute('disabled')).ok();
        log.info('Verified Add School Contact Button is disabled.');
    }

    async clickAddSchoolContactButton() {
        await t.click(this.addSchoolContactButton);
        log.info('Add School Contact Button clicked.')
    }

    async verifyNewContactSheetExists() {
        await t.expect(this.newContactSheet.exists).ok();
        log.info('Verified New Contact Sheet exists.');
    }

    async verifyNewContactSheetDoesNotExist() {
        await t.expect(this.newContactSheet.exists).notOk();
        log.info('Verified New Contact Sheet does not exist.');
    }

    async verifyNewContactDropdownExists() {
        await t.expect(this.newContactDropdown.exists).ok();
        log.info('Verified New Contact Dropdown exists.');
    }

    async verifyNewContactDropdownValue(expectedValue) {
        await t.expect(this.newContactDropdown.sibling('.v-select__selection').innerText).eql(expectedValue);
        log.info('Verified New Contact Dropdown value.');
    }

    async setNewContactDropdownValue(value) {
        await t.click(this.newContactDropdown);
        log.info('The New Contact Dropdown has been clicked.');
        await t.expect(this.selectionBox.exists).ok();
        log.info('Verified that a dropdown selection box has been opened.');
        await t.click(this.selectionBox.find('div').withExactText(value));
        log.info('The value of the New Contact Dropdown has been set.');
    }

    async verifyNewContactFirstNameInputExists() {
        await t.expect(this.newContactFirstNameInput.exists).ok();
        log.info('Verified New Contact First Name Input exists.');
    }

    async verifyNewContactFirstNameInputValue(expectedValue) {
        await t.expect(this.newContactFirstNameInput.value).eql(expectedValue);
        log.info('Verified New Contact First Name Input value.');
    }

    async setNewContactFirstNameInputValue(value) {
        await t.typeText(this.newContactFirstNameInput, value);
        log.info('Typed text into the New Contact First Name Input.');
    }

    async verifyNewContactLastNameInputExists() {
        await t.expect(this.newContactLastNameInput.exists).ok();
        log.info('Verified New Contact Last Name Input exists.');
    }

    async verifyNewContactLastNameInputValue(expectedValue) {
        await t.expect(this.newContactLastNameInput.value).eql(expectedValue);
        log.info('Verified New Contact Last Name Input value.');
    }

    async setNewContactLastNameInputValue(value) {
        await t.typeText(this.newContactLastNameInput, value);
        log.info('Typed text into the New Contact Last Name Input.')
    }

    async verifyNewContactEmailInputExists() {
        await t.expect(this.newContactEmailInput.exists).ok();
        log.info('Verified New Contact Email Input exists.');
    }

    async verifyNewContactEmailInputValue(expectedValue) {
        await t.expect(this.newContactEmailInput.value).eql(expectedValue);
        log.info('Verified New Contact Email Input value.');
    }

    async setNewContactEmailInputValue(value) {
        await t.typeText(this.newContactEmailInput, value);
        log.info('Typed text into the New Contact Email Input Input.')
    }

    async verifyNewContactPhoneNumberInputExists() {
        await t.expect(this.newContactPhoneNumberInput.exists).ok();
        log.info('Verified New Contact Phone Number Input exists.');
    }

    async verifyNewContactPhoneNumberInputValue(expectedValue) {
        await t.expect(this.newContactPhoneNumberInput.value).eql(expectedValue);
        log.info('Verified New Contact Phone Number Input value.');
    }

    async setNewContactPhoneNumberInputValue(value) {
        await t.typeText(this.newContactPhoneNumberInput, value);
        log.info('Typed text into the New Contact Phone Number Input.')
    }

    async verifyNewContactPhoneExtensionInputExists() {
        await t.expect(this.newContactPhoneExtensionInput.exists).ok();
        log.info('Verified New Contact Phone Extension Input exists.');
    }

    async verifyNewContactPhoneExtensionInputValue(expectedValue) {
        await t.expect(this.newContactPhoneExtensionInput.value).eql(expectedValue);
        log.info('Verified New Contact Phone Extension Input value.');
    }

    async setNewContactPhoneExtensionInputValue(value) {
        await t.typeText(this.newContactPhoneExtensionInput, value);
        log.info('Typed text into the New Contact Phone Extension Input.')
    }

    async verifyNewContactAltPhoneNumberInputExists() {
        await t.expect(this.newContactAltPhoneNumberInput.exists).ok();
        log.info('Verified New Contact Alt Phone Number Input exists.');
    }

    async verifyNewContactAltPhoneNumberInputValue(expectedValue) {
        await t.expect(this.newContactAltPhoneNumberInput.value).eql(expectedValue);
        log.info('Verified New Contact Alt Phone Number Input value.');
    }

    async setNewContactAltPhoneNumberInputValue(value) {
        await t.typeText(this.newContactAltPhoneNumberInput, value);
        log.info('Typed text into the New Contact Alt Phone Number Input.')
    }

    async verifyNewContactAltPhoneExtensionInputExists() {
        await t.expect(this.newContactAltPhoneExtensionInput.exists).ok();
        log.info('Verified New Contact Alt Phone Extension Input exists.');
    }

    async verifyNewContactAltPhoneExtensionInputValue(expectedValue) {
        await t.expect(this.newContactAltPhoneExtensionInput.value).eql(expectedValue);
        log.info('Verified New Contact Alt Phone Extension Input value.');
    }

    async setNewContactAltPhoneExtensionInputValue(value) {
        await t.typeText(this.newContactAltPhoneExtensionInput, value);
        log.info('Typed text into the New Contact Alt Phone Extension Input.')
    }

    async verifyNewContactEffectiveDateTextFieldExists() {
        await t.expect(this.newContactEffectiveDateTextField.exists).ok();
        log.info('Verified New Contact Effective Date Picker exists.');
    }

    async verifyNewContactEffectiveDateTextFieldValue(expectedValue) {
        await t.expect(this.newContactEffectiveDateTextField.value).eql(expectedValue);
        log.info('Verified New Contact Effective Date Picker value.');
    }

    async setNewContactEffectiveDateTextFieldToCurrentDate() {
        await t.click(this.newContactEffectiveDateTextField);
        log.info('The New Contact Effective Date Picker has been clicked.');
        await t.expect(this.datePickerDateNumber.exists).ok();
        log.info('Verified that a date picker has been opened and the current date is available to be picked.');
        await t.click(this.datePickerDateNumber);
        log.info('The value of the New Contact Effective Date Picker has been set.');
    }

    async verifyNewContactExpiryDateTextFieldExists() {
        await t.expect(this.newContactExpiryDateTextField.exists).ok();
        log.info('Verified New Contact Expiry Date Picker exists.');
    }

    async verifyNewContactExpiryDateTextFieldValue(expectedValue) {
        await t.expect(this.newContactExpiryDateTextField.value).eql(expectedValue);
        log.info('Verified New Contact Expiry Date Picker value.');
    }

    async setNewContactExpiryDateTextFieldDate() {
        await t.click(this.newContactExpiryDateTextField);
        log.info('The New Contact Expiry Date Picker has been clicked.');
        await t.expect(this.datePickerDateNumber.exists).ok();
        log.info('Verified that a date picker has been opened and the current date is available to be picked.');
        await t.click(this.datePickerDateNumber);
        log.info('The value of the New Contact Expiry Date Picker has been set.');
    }

    async verifyCancelNewContactButtonExists() {
        await t.expect(this.cancelNewContactButton.exists).ok();
        log.info('Verified Cancel New Contact Button exists.');
    }

    async verifyCancelNewContactButtonEnabled() {
        await t.expect(this.cancelNewContactButton.hasAttribute('disabled')).notOk();
        log.info('Verified Cancel New Contact Button is enabled.');
    }

    async verifyCancelNewContactButtonDisabled() {
        await t.expect(this.cancelNewContactButton.hasAttribute('disabled')).ok();
        log.info('Verified Cancel New Contact Button is disabled.');
    }

    async clickCancelNewContactButton() {
        await t.click(this.cancelNewContactButton);
        log.info('Cancel New Contact Button clicked.')
    }

    async verifySaveNewContactButtonExists() {
        await t.expect(this.saveNewContactButton.exists).ok();
        log.info('Verified Save New Contact Button exists.');
    }

    async verifySaveNewContactButtonEnabled() {
        await t.expect(this.saveNewContactButton.hasAttribute('disabled')).notOk();
        log.info('Verified Save New Contact Button is enabled.');
    }

    async verifySaveNewContactButtonDisabled() {
        await t.expect(this.saveNewContactButton.hasAttribute('disabled')).ok();
        log.info('Verified Save New Contact Button is disabled.');
    }

    async clickSaveNewContactButton() {
        await t.click(this.saveNewContactButton);
        log.info('Save New Contact Button clicked.')
    }

    async clickEditContactButton() {
        await t.click(this.editContactButton);
        log.info('Edit Contact Button clicked.');
    }

    async editSchoolContact(){
        await t.typeText(this.editContactFirstName, 'Tony', { replace: true });
        await t.typeText(this.editContactLastName, 'Hawk', { replace: true });
        await t.typeText(this.editContactEmail, 'thawk@test.com', { replace: true });
        await t.typeText(this.editContactPhoneNumber, '2501234564', { replace: true });
        await t.typeText(this.editContactPhoneExt, '888', { replace: true });
        await t.typeText(this.editContactAltPhoneNumber, '2508854578', { replace: true });
        await t.typeText(this.editContactAltPhoneExt, '999', { replace: true });

        await this.selectStartDate();

        await t.click(this.saveContactButton);
        log.info("School Contact Edit Complete");
    }

    async selectStartDate() {
        await t.click(this.editContactStartDate);

        await t.click(this.datePickerClickOne()).wait(1000);
        await t.click(this.datePickerClickOne()).wait(1000);
        await t.click(this.datePickerYear()).wait(1000);
        await t.click(this.datePickerMonth());
        await t.click(this.datePickerDay());

        log.info("Contact start date selected")
    }

    async verifySchoolContactEditDetails() {

        await this.verifyContactEditName('Tony Hawk');
        await this.verifyContactEditEmail('thawk@test.com');
        await this.verifyContactEditPhoneNum('250-123-4564');
        await this.verifyContactEditPhoneNumExt('888');
        await this.verifyContactEditAltPhoneNum('250-885-4578');
        await this.verifyContactEditAltPhoneNumExt('999');
        await this.verifyContactEditStartDate('2022/01/01');
        log.info('Contact Verification Complete');
    }
    async verifyContactEditName(name){
        await t.expect(this.principalContactName.withText(name).innerText).contains(name);
        log.info(`Contact Name ${name} Verified`);
    }
    async verifyContactEditEmail(email){
        await t.expect(this.principalContactEmail.withText(email).innerText).contains(email);
        log.info(`Contact Email ${email} Verified`);
    }
    async verifyContactEditPhoneNum(phoneNumber){
        await t.expect(this.principalContactPhoneNumber.withText(phoneNumber).innerText).contains(phoneNumber);
        log.info(`Contact Phone Number ${phoneNumber} Verified`);
    }
    async verifyContactEditPhoneNumExt(phoneNumberExt){
        await t.expect(this.principalContactPhoneNumberExt.withText(phoneNumberExt).innerText).contains(phoneNumberExt);
        log.info(`Contact Phone Number Extension ${phoneNumberExt} Verified`);
    }
    async verifyContactEditAltPhoneNum(altPhoneNumber){
        await t.expect(this.principalContactAltPhoneNumber.withText(altPhoneNumber).innerText).contains(altPhoneNumber);
        log.info(`Contact Alternate Phone Number ${altPhoneNumber} Verified`);
    }
    async verifyContactEditAltPhoneNumExt(altPhoneNumberExt){
        await t.expect(this.principalContactAltPhoneNumberExt.withText(altPhoneNumberExt).innerText).contains(altPhoneNumberExt);
        log.info(`Contact Alternate Phone Number Extension ${altPhoneNumberExt} Verified`);
    }
    async verifyContactEditStartDate(startDate){
        await t.expect(this.principalContactStartDate.withText(startDate).innerText).contains(startDate);
        log.info(`Contact Start Date ${startDate} Verified`);
    }

    async completeNewContactForm(newContact) {
        await this.setNewContactDropdownValue(newContact.contactType);
        await this.setNewContactFirstNameInputValue(newContact.firstName);
        await this.setNewContactLastNameInputValue(newContact.lastName);
        await this.setNewContactEmailInputValue(newContact.emailAddress);
        await this.setNewContactPhoneNumberInputValue(newContact.phoneNumber.replace('-', ''));
        await this.setNewContactPhoneExtensionInputValue(newContact.phoneExtension);
        await this.setNewContactAltPhoneNumberInputValue(newContact.altPhoneNumber.replace('-', ''));
        await this.setNewContactAltPhoneExtensionInputValue(newContact.altPhoneExtension);
        await this.setNewContactEffectiveDateTextFieldToCurrentDate();
    }

    async verifyNewContactAdded(newContact) {
        let contactDetails = Selector('strong').withText(`${newContact.firstName} ${newContact.lastName}`).parent('div.v-card.v-sheet');
        await t.expect(contactDetails.exists).ok();
        log.info('Verified that the contact record was added and that the first and last names were set correctly.');
        await t.expect(contactDetails.find('span').withText(newContact.emailAddress).exists).ok();
        log.info('Verified that the email address of the new contact record was set correctly.');
        await t.expect(contactDetails.find('span').withText(newContact.phoneNumber).exists).ok();
        log.info('Verified that the phone number of the new contact record was set correctly.');
        await t.expect(contactDetails.find('span').withText(` ext. ${newContact.phoneExtension}`).exists).ok();
        log.info('Verified that the phone extension of the new contact record was set correctly.');
        await t.expect(contactDetails.find('span').withText(newContact.altPhoneNumber).exists).ok();
        log.info('Verified that the alt phone number of the new contact record was set correctly.');
        await t.expect(contactDetails.find('span').withText(` ext. ${newContact.altPhoneExtension}`).exists).ok();
        log.info('Verified that the alt phone extension of the new contact record was set correctly.');
    }

}

export default SchoolContactsPage;
import { Selector, t } from 'testcafe'
const log = require('npmlog')

class DistrictContactsPage {
    constructor() {
        this.navTitle = Selector('#navTitle');
        this.superContactHeader = Selector('.containerSetup').child('div').child('div')
            .child('div').child('h2');

        this.contactNameDisplay = Selector('strong');
        this.contactTitleDisplay = Selector('strong');
        this.contactEmailDisplay = Selector('span');
        this.contactPhoneNumberDisplay = Selector('span');
        this.contactPhoneNumberExtDisplay = Selector('span');
        this.contactAltPhoneNumberDisplay = Selector('span');
        this.contactAltPhoneNumberExtDisplay = Selector('span');
        this.contactStartDateDisplay = Selector('span');

        this.newContactButton = Selector('#newContactButton');
        this.contactTypeSelect = Selector('#newContactDropdown');
        this.contactTypeOption = Selector('.v-select-list').child('.v-list-item').find('div').find('div');

        this.contactFirstName = Selector('#newContactFirstNameInput');
        this.contactLastName = Selector('#newContactLastNameInput');
        this.contactJobTitle = Selector('#newContactJobTitle');
        this.contactEmail = Selector('#newContactEmailInput');
        this.contactPhoneNumber = Selector('#newContactPhoneNumberInput');
        this.contactPhExtension = Selector('#newContactPhoneExtensionInput');
        this.contactAltPhoneNumer = Selector('#newContactAltPhoneNumberInput');
        this.contactAltPhonenumberExtension = Selector('#newContactAltPhoneExtensionInput');
        this.contactStartDate = Selector('#newContactEffectiveDateTextField');

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
        this.saveContactButton = Selector('#newContactPostBtn');

        this.editContactButton = Selector('#editContactButton');
        this.confirmPublishChangesButton = Selector('#resolveBtn');
        this.confirmationPromptHeader = Selector('.v-toolbar__title');
        this.districtContactName = Selector('strong');
        this.districtContactEmail = Selector('span');
        this.districtContactPhoneNumber = Selector('span');
        this.districtContactPhoneNumberExt = Selector('span');
        this.districtContactAltPhoneNumber = Selector('span');
        this.districtContactAltPhoneNumberExt = Selector('span');
        this.districtContactStartDate = Selector('span');
        this.saveEditContactButton = Selector('#saveEditButton');
    }

    async clickNewContactButton(){
        await t.click(this.newContactButton());
        log.info('New Contact Button Clicked');
    }

    async fillDistrictContactForm(){

        await t.click(this.contactTypeSelect).click(this.contactTypeOption.withText('Superintendent'));

        await t.typeText(this.contactFirstName, 'Tony', { replace: true });
        await t.typeText(this.contactLastName, 'Hawk', { replace: true });
        await t.typeText(this.contactJobTitle, 'Executive Superintendent', { replace: true });
        await t.typeText(this.contactEmail, 'thawk@test.com', { replace: true });
        await t.typeText(this.contactPhoneNumber, '2501234564', { replace: true });
        await t.typeText(this.contactPhExtension, '888', { replace: true });
        await t.typeText(this.contactAltPhoneNumer, '2508854578', { replace: true });
        await t.typeText(this.contactAltPhonenumberExtension, '999', { replace: true });

        await this.selectStartDate();

        await t.click(this.saveContactButton);
        log.info("District Contact Edit Complete");
    }

    async selectStartDate() {
        await t.click(this.contactStartDate);

        await t.click(this.datePickerClickOne()).wait(1000);
        await t.click(this.datePickerClickOne()).wait(1000);
        await t.click(this.datePickerYear()).wait(1000);
        await t.click(this.datePickerMonth());
        await t.click(this.datePickerDay());

        log.info("Contact start date selected")
    }

    async verifyContactName(name){
        await t.expect(this.contactNameDisplay.withText(name).innerText).contains(name);
        log.info(`Contact Name ${name} Verified`);
    }
    async verifyContactTitle(title){
        await t.expect(this.contactTitleDisplay.withText(title).innerText).contains(title);
        log.info(`Contact Title ${title} Verified`);
    }
    async verifyContactEmail(email){
        await t.expect(this.contactEmailDisplay.withText(email).innerText).contains(email);
        log.info(`Contact Email ${email} Verified`);
    }
    async verifyContactPhoneNum(phoneNumber){
        await t.expect(this.contactPhoneNumberDisplay.withText(phoneNumber).innerText).contains(phoneNumber);
        log.info(`Contact Phone Number ${phoneNumber} Verified`);
    }
    async verifyContactPhoneNumExt(phoneNumberExt){
        await t.expect(this.contactPhoneNumberExtDisplay.withText(phoneNumberExt).innerText).contains(phoneNumberExt);
        log.info(`Contact Phone Number Extension ${phoneNumberExt} Verified`);
    }
    async verifyContactAltPhoneNum(altPhoneNumber){
        await t.expect(this.contactAltPhoneNumberDisplay.withText(altPhoneNumber).innerText).contains(altPhoneNumber);
        log.info(`Contact Alternate Phone Number ${altPhoneNumber} Verified`);
    }
    async verifyContactAltPhoneNumExt(altPhoneNumberExt){
        await t.expect(this.contactAltPhoneNumberExtDisplay.withText(altPhoneNumberExt).innerText).contains(altPhoneNumberExt);
        log.info(`Contact Alternate Phone Number Extension ${altPhoneNumberExt} Verified`);
    }
    async verifyContactStartDate(startDate){
        await t.expect(this.contactStartDateDisplay.withText(startDate).innerText).contains(startDate);
        log.info(`Contact Start Date ${startDate} Verified`);
    }

    async clickEditContactButton() {
        await t.click(this.editContactButton);
        log.info('Edit Contact Button clicked.');
    }

    async selectEditStartDate() {
        await t.click(this.editContactStartDate);

        await t.click(this.datePickerClickOne()).wait(1000);
        await t.click(this.datePickerClickOne()).wait(1000);
        await t.click(this.datePickerYear()).wait(1000);
        await t.click(this.datePickerMonth());
        await t.click(this.datePickerDay());

        log.info("Contact start date selected")
    }
    async editDistrictContact(){
        await t.typeText(this.editContactFirstName, 'Tony', { replace: true });
        await t.typeText(this.editContactLastName, 'Hawk', { replace: true });
        await t.typeText(this.editContactEmail, 'thawk@test.com', { replace: true });
        await t.typeText(this.editContactPhoneNumber, '2501234564', { replace: true });
        await t.typeText(this.editContactPhoneExt, '888', { replace: true });
        await t.typeText(this.editContactAltPhoneNumber, '2508854578', { replace: true });
        await t.typeText(this.editContactAltPhoneExt, '999', { replace: true });

        await this.selectEditStartDate();

        await t.click(this.saveEditContactButton);
        log.info("District Contact Edit Complete");
    }

    async verifyConfirmation(){
        await t.expect(this.confirmationPromptHeader.withText('Confirm Updates to District Contact').innerText).contains('Confirm Updates to District Contact');
        log.info(`Confirmation prompt Verified`);
    }
    async confirmPublishChanges(){
        await t.click(this.confirmPublishChangesButton);
        log.info('Publish Changes confirmation clicked');
    }

    async verifyContactEditName(name){
        await t.expect(this.districtContactName.withText(name).innerText).contains(name);
        log.info(`Contact Name ${name} Verified`);
    }
    async verifyContactEditEmail(email){
        await t.expect(this.districtContactEmail.withText(email).innerText).contains(email);
        log.info(`Contact Email ${email} Verified`);
    }
    async verifyContactEditPhoneNum(phoneNumber){
        await t.expect(this.districtContactPhoneNumber.withText(phoneNumber).innerText).contains(phoneNumber);
        log.info(`Contact Phone Number ${phoneNumber} Verified`);
    }
    async verifyContactEditPhoneNumExt(phoneNumberExt){
        await t.expect(this.districtContactPhoneNumberExt.withText(phoneNumberExt).innerText).contains(phoneNumberExt);
        log.info(`Contact Phone Number Extension ${phoneNumberExt} Verified`);
    }
    async verifyContactEditAltPhoneNum(altPhoneNumber){
        await t.expect(this.districtContactAltPhoneNumber.withText(altPhoneNumber).innerText).contains(altPhoneNumber);
        log.info(`Contact Alternate Phone Number ${altPhoneNumber} Verified`);
    }
    async verifyContactEditAltPhoneNumExt(altPhoneNumberExt){
        await t.expect(this.districtContactAltPhoneNumberExt.withText(altPhoneNumberExt).innerText).contains(altPhoneNumberExt);
        log.info(`Contact Alternate Phone Number Extension ${altPhoneNumberExt} Verified`);
    }
    async verifyContactEditStartDate(startDate){
        await t.expect(this.districtContactStartDate.withText(startDate).innerText).contains(startDate);
        log.info(`Contact Start Date ${startDate} Verified`);
    }

    async verifyDistrictContactEditDetails() {

        await this.verifyContactEditName('Tony Hawk');
        await this.verifyContactEditEmail('thawk@test.com');
        await this.verifyContactEditPhoneNum('250-123-4564');
        await this.verifyContactEditPhoneNumExt('888');
        await this.verifyContactEditAltPhoneNum('250-885-4578');
        await this.verifyContactEditAltPhoneNumExt('999');
        await this.verifyContactEditStartDate('2022/01/01');
        log.info('Contact Verification Complete');
    }

    async verifyDistrictContactDetails() {

        await this.verifyContactName('Tony Hawk');
        await this.verifyContactTitle('Executive Superintendent');
        await this.verifyContactEmail('thawk@test.com');
        await this.verifyContactPhoneNum('250-123-4564');
        await this.verifyContactPhoneNumExt('888');
        await this.verifyContactAltPhoneNum('250-885-4578');
        await this.verifyContactAltPhoneNumExt('999');
        await this.verifyContactStartDate('2022/01/01');
        log.info('Contact Verification Complete');
    }
}

export default DistrictContactsPage;

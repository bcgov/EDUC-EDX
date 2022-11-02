import { Selector, t } from 'testcafe'
const log = require('npmlog')
import {DateTimeFormatter, LocalDateTime} from '@js-joda/core';

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

        this.datePickerClickOne = Selector('.v-date-picker-header__value').child('div').child('button');
        this.datePickerYear = Selector('.v-date-picker-years').find('li').withText('2022');
        this.datePickerMonth = Selector('div').child('.v-date-picker-table').find('.v-btn__content').withText('Jan');
        this.datePickerDay = Selector('div').child('.v-date-picker-table').find('.v-btn__content').withText('1');
        this.saveContactButton = Selector('#newContactPostBtn');
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
        log.info("School Contact Edit Complete");
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

    async verifyDistrictContactDetails() {

        await this.verifyContactName();
        await this.verifyContactTitle('Executive Superintendent');
        await this.verifyContactEmail();
        await this.verifyContactPhoneNum();
        await this.verifyContactPhoneNumExt();
        await this.verifyContactAltPhoneNum();
        await this.verifyContactAltPhoneNumExt();
        await this.verifyContactStartDate();
        log.info('Contact Verification Complete');
    }
    async verifyContactName(name){
        await t.expect(this.contactNameDisplay.withText('Tony Hawk').innerText).contains('Tony Hawk');
        log.info("Contact Name Verified");
    }
    async verifyContactTitle(title){
        await t.expect(this.contactTitleDisplay.withText(title).innerText).contains(title);
        log.info("Contact Title Verified");
    }
    async verifyContactEmail(){
        await t.expect(this.contactEmailDisplay.withText('thawk@test.com').innerText).contains('thawk@test.com');
        log.info("Contact Email Verified");
    }
    async verifyContactPhoneNum(){
        await t.expect(this.contactPhoneNumberDisplay.withText('250-123-4564').innerText).contains('250-123-4564');
        log.info("Contact Phone Number Verified");
    }
    async verifyContactPhoneNumExt(){
        await t.expect(this.contactPhoneNumberExtDisplay.withText('888').innerText).contains('888');
        log.info("Contact Phone Number Extension Verified");
    }
    async verifyContactAltPhoneNum(){
        await t.expect(this.contactAltPhoneNumberDisplay.withText('250-885-4578').innerText).contains('250-885-4578');
        log.info("Contact Alternate Phone Number Verified");
    }
    async verifyContactAltPhoneNumExt(){
        await t.expect(this.contactAltPhoneNumberExtDisplay.withText('999').innerText).contains('999');
        log.info("Contact Alternate Phone Number Extension Verified");
    }
    async verifyContactStartDate(){
        await t.expect(this.contactStartDateDisplay.withText('2022/01/01').innerText).contains('2022/01/01');
        log.info("Contact Start Date Verified");
    }


}

export default DistrictContactsPage;
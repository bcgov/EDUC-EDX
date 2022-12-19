import { Selector, t } from 'testcafe'
const log = require('npmlog')

class DistrictDetailsPage {
    constructor() {
        this.editButton = Selector('#editButton');
        this.districtEmail =Selector('#districtEmail');
        this.districtPhone = Selector('#districtPhone');
        this.saveButton = Selector('#saveButton');
        this.confirmPublishChangesButton = Selector('#resolveBtn');
    }

    async editEmailAddress(emailId){
        await t.click(this.districtEmail);
        await t.selectText(this.districtEmail).pressKey('delete');
        await t.typeText(this.districtEmail,emailId);
        log.info('Email ID updated');
    }


    async editPhoneNumber(phoneNumber){
        await t.click(this.districtPhone)
        await t.selectText(this.districtPhone).pressKey('delete');
        await t.typeText(this.districtPhone,phoneNumber);
    }

    async clickSaveButton(){
        await t.click(this.saveButton());
        log.info('Edit District Details Save Button Clicked');
    }

    async clickDistrictEditButton() {
        await t.click(this.editButton);
        log.info('District Details Edit button clicked');
    }

    async clickConfirmPublishChanges(){
        await t.click(this.confirmPublishChangesButton);
        log.info('Publish Changes confirmation clicked');
    }
}

export default DistrictDetailsPage;
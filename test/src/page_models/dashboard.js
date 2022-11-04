import { Selector,  t } from 'testcafe';
import log from 'npmlog'

/**
 * Represents the Dashboard page
 */
class Dashboard {

    constructor() {
        this.navTitle = Selector('#navTitle');
        this.schoolInboxCard = Selector('#schoolInboxCard');
        this.secureMessageInboxCard = Selector('#secureMessageInboxCard');
        this.schoolDetailsCard=Selector('#schoolDetailsCard');
        this.schoolContactsCard = Selector('#schoolContactsCard');
        this.districtContactsCard = Selector('#districtContactsCard');
    }

    async clickSchoolInboxCard() {
        await t.click(this.schoolInboxCard);
        log.info('School inbox card clicked');
    }

    async clickSecureMessageInbox() {
        await t.click(this.secureMessageInboxCard);
        log.info('School inbox card clicked');
    }

    async clickSchoolDetails() {
        await t.click(this.schoolDetailsCard);
        log.info('School Details card clicked');
    }

    async verifySchoolContactsCardExists() {
        await t.expect(this.schoolContactsCard.exists).ok();
        log.info('Verified that the School Contacts Card exists.');
    }

    async verifySchoolContactsCardDoesNotExist() {
        await t.expect(this.schoolContactsCard.exists).notOk();
        log.info('Verified that the School Contacts Card does not exist.');
    }

    async clickSchoolContactsCard() {
        await t.click(this.schoolContactsCard);
        log.info('Clicked School')
    }
    
    async clickDistrictContactsCard() {
        await t.click(this.districtContactsCard);
        log.info('District Contacts card clicked');
    }

}
export default Dashboard;

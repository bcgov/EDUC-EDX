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
        this.districtContactsCard = Selector('#districtContactsCard');
    }

    async clickSchoolInboxCard() {
        await t.click(this.schoolInboxCard());
        log.info('School inbox card clicked');
    }

    async clickSecureMessageInbox() {
        await t.click(this.secureMessageInboxCard());
        log.info('School inbox card clicked');
    }

    async clickSchoolDetails() {
        await t.click(this.schoolDetailsCard);
        log.info('School Details card clicked');
    }

    async clickDistrictContactsCard() {
        await t.click(this.districtContactsCard);
        log.info('District Contacts card clicked');
    }

}
export default Dashboard;

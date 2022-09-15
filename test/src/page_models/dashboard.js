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
    }

    async clickSchoolInboxCard() {
        await t.click(this.schoolInboxCard());
        log.info('School inbox card clicked');
    }

    async clickSecureMessageInbox() {
        await t.click(this.secureMessageInboxCard());
        log.info('School inbox card clicked');
    }

}
export default Dashboard;

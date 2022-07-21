import { Selector, ClientFunction, t } from 'testcafe';
import log from 'npmlog'

/**
 * Represents the Dashboard page
 */
class Dashboard {

    constructor() {
        this.navTitle = Selector('#navTitle');
        this.schoolInboxCard = Selector('#schoolInboxCard');
    }

    async clickSchoolInboxCard() {
        await t.click(this.schoolInboxCard());
        log.info('School inbox card clicked');
    }

}
export default Dashboard;
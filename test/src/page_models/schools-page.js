import { Selector, t } from 'testcafe';
import log from 'npmlog';

class SchoolsPage {
    constructor() {
        this.navTitle = Selector('#navTitle');
        this.schoolContactsButton = Selector('#schoolContacts').nth(0);
    }

    async clickSchoolContactsButton(){
        await t.click(this.schoolContactsButton);
        log.info('School contacts button clicked');
    }
}

export default SchoolsPage;
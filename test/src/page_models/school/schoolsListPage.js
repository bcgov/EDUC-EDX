import { Selector, t } from 'testcafe';
import log from 'npmlog';

class SchoolsListPage {
    constructor() {
        this.schoolDetailsRow = Selector('.schoolDetailsRow').nth(0);
        this.schoolContactsButton = Selector('.schoolContactsButton').nth(0);
    }

    async clickSchoolDetailsRow() {
        await t.click(this.schoolDetailsRow);
        log.info('School Details row clicked.');
    }

    async clickSchoolContactsButton(){
        await t.click(this.schoolContactsButton);
        log.info('School contacts button clicked');
    }

}

export default SchoolsListPage;
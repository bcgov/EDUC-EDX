import { Selector, t } from 'testcafe';
import log from 'npmlog';

class SchoolsListPage {
    constructor() {
        this.schoolDetailsRow = Selector('.schoolDetailsRow').nth(0);
        this.schoolContactsButton = Selector('.schoolContactsButton').nth(0);
        this.schoolPrincipalName = Selector('.principalName').nth(0);
    }

    async clickSchoolDetailsRow() {
        await t.click(this.schoolDetailsRow);
        log.info('School Details row clicked.');
    }

    async clickSchoolContactsButton(){
        await t.click(this.schoolContactsButton);
        log.info('School contacts button clicked');
    }

    async verifySchoolPrincipalName(expectedPrincipalName) {
        await t.expect(this.schoolPrincipalName.innerText).eql(expectedPrincipalName);
        log.info('Verified the School Principal Name.');
    }

}

export default SchoolsListPage;
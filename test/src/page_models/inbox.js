import { Selector, ClientFunction, t } from 'testcafe';

/**
 * Represents the inbox page
 */
class Inbox {

    constructor() {
        this.navTitle = Selector('#navTitle');
        this.newMessageButton = Selector('#newMessageBtn');
        this.filtersToggle = Selector('#filtersToggle');
        this.subjectInput = Selector('#subjectInput');
    }

    async clickNewMessageButton(){
        await t.click(this.newMessageButton);
    }

    async clickFiltersToggle(){
        await t.click(this.filtersToggle);
    }

    async inputSubject(text){
        await t.typeText(this.subjectInput, text);
    }

}
export default Inbox;
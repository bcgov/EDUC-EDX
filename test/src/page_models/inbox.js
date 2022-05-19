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
        this.searchButton = Selector('#searchButton');
        this.clearSearchButton = Selector('#search-clear');
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

    async clickSearchButton(){
        await t.click(this.searchButton);
    }

    async clickClearSearchButton(){
        await t.click(this.clearSearchButton);
    }

}
export default Inbox;
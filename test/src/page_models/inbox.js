import { Selector, ClientFunction, t } from 'testcafe';

/**
 * Represents the inbox page
 */
class Inbox {

    constructor() {
        this.navTitle = Selector('#navTitle');
        this.newMessageButton = Selector('#newMessageBtn');
        this.filtersToggle = Selector('#filterid');
        this.subjectInput = Selector('#subjectInput');
        this.statusSelector = Selector('#statusSelector').parent('div[role="button"]');
        this.statusBox = Selector('div[role="listbox"]');
        this.searchButton = Selector('#searchButton');
        this.clearSearchButton = Selector('#search-clear');
        this.nextPageButton = Selector('button[aria-label="Next page"]');
        this.previousPageButton = Selector('button[aria-label="Previous page"]');
        this.paginationIndication = Selector('div.v-data-footer__pagination');
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

    async selectStatus(status){
        await t.click(this.statusSelector).wait(100);
        await t.expect(this.statusBox().exists).ok();
        await t.click(this.statusBox.find('span').withExactText(status).parent('div.row'));
    }

    async clickSearchButton(){
        await t.click(this.searchButton);
    }

    async clickClearSearchButton(){
        await t.click(this.clearSearchButton);
    }

    async clickNextPage(){
        await t.click(this.nextPageButton);
    }

    async clickPreviousPage(){
        await t.click(this.previousPageButton);
    }


}
export default Inbox;
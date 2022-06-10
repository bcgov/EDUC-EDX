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
        this.selectionBox = Selector('div[role="listbox"]');
        this.contactNameSelector = Selector("#contactNameSelect").parent('div[role="button"]');
        this.searchButton = Selector('#searchButton');
        this.clearSearchButton = Selector('#search-clear');
        this.nextPageButton = Selector('button[aria-label="Next page"]');
        this.previousPageButton = Selector('button[aria-label="Previous page"]');
        this.paginationIndication = Selector('div.v-data-footer__pagination');
        this.messageDateFilter = Selector('#messageDateTextField')
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
        await t.expect(this.selectionBox.exists).ok();
        await t.click(this.selectionBox.find('span').withExactText(status).parent('div.row'));
    }

    async selectContactName(name){
        await t.click(this.contactNameSelector).wait(100);
        await t.expect(this.selectionBox.exists).ok();
        await t.click(this.selectionBox.find('div').withExactText(name));
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
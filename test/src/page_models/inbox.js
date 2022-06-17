import { Selector, ClientFunction, t } from 'testcafe';
import log from "npmlog";

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
        this.messageDateFilter = Selector('#messageDateTextField');
        const now = new Date();
        this.messageDateNumber = Selector('div').child('.v-date-picker-table').find('.v-btn__content').withText(now.getDate().toString());
        this.messageIdInput = Selector('#messageIdInput');
        this.schoolNameTextField = Selector('#schoolNameTxtField');
        this.subjectTextField = Selector('#subjectTxtField');
        this.newMessageTextArea = Selector('#newMessageTextArea');
        this.newMessagePostBtn = Selector('#newMessagePostBtn');
        this.cancelMessage = Selector('#cancelMessage');
    }

    async clickNewMessagePostButton() {
        await t.click(this.newMessagePostBtn());
        log.info("New message Post button clicked");
    }

    async clickCancelSubmitButton(){
        await t.click(this.cancelMessage());
        log.info("Cancel message button clicked");
    }

    async clickNewMessageButton(){
        await t.click(this.newMessageButton);
        log.info("New message button clicked");
    }

    async selectMessageDate() {
        await t.click(this.messageDateFilter());
        await t.click(this.messageDateNumber());
        log.info("Message date selected");
    }

    async clickFiltersToggle(){
        await t.click(this.filtersToggle);
        log.info("Filters toggle selected");
    }

    async inputSubject(text){
        await t.typeText(this.subjectInput, text);
        log.info("Input subject");
    }

    async inputSchoolNameTextField(text){
        await t.typeText(this.schoolNameTextField, text);
        log.info("School name input");
    }

    async inputSubjectTextField(text){
        await t.typeText(this.subjectTextField, text);
        log.info("Subject input");
    }

    async inputNewMessage(text){
        await t.typeText(this.newMessageTextArea, text);
        log.info("Message input");
    }

    async inputMessageId(text){
        await t.typeText(this.messageIdInput, text);
        log.info("Input message id");
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
        log.info("Search button clicked");
    }

    async clickClearSearchButton(){
        await t.click(this.clearSearchButton);
        log.info("Clear search button clicked");
    }

    async clickNextPage(){
        await t.click(this.nextPageButton);
        log.info("Next page selected");
    }

    async clickPreviousPage(){
        await t.click(this.previousPageButton);
        log.info("Previous page selected");
    }


}
export default Inbox;
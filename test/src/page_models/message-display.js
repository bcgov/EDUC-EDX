import { Selector, t } from 'testcafe';
import log from 'npmlog';

class MessageDisplay {
    constructor() {
        this.navTitle = Selector('#navTitle');
        this.subjectHeading = Selector('#messageDisplaySubjectHeading');
        this.ministryOwnershipTeamName = Selector('#messageDisplayMinistryOwnershipTeamName');
        this.createDate = Selector('#messageDisplayCreateDate');
        this.secureExchangeStatusCode = Selector('#messageDisplayStatusCode');
        this.sequenceNumber = Selector('#messageDisplaySequenceNumber');
        this.editOptionsMenu = Selector('#editOptionsMenu');
        this.editOptionsMenuButton = Selector('#editOptionsMenuBtn');
        this.newMessageButton = Selector('#newMessageBtn');
        this.newMessagesubjectField = Selector('#subjectTxtField');
        this.newMessageTextArea = Selector ('#newMessageTextArea');
        this.sendMessageButton = Selector('#newMessagePostBtn');
        this.addStudentButton = Selector("#addStudentConvButton");
        this.addStudentDialog = Selector("#addStudentDialog");
        this.markAsButton = Selector('#markAsButton');
        this.markAsSpan = this.markAsButton.find('span.markAsSpan');
        this.lastActivity = Selector('.v-timeline:last-child');
        this.activityTitle = this.lastActivity.find('div.activityTitle');
        this.activityDisplayDate = this.lastActivity.find('div.activityDisplayDate');
        this.activityContent = this.lastActivity.find('div.activityContent');
        this.studentPensRaw = Selector('.studentPenRaw');
        this.addAttachmentMenuButton = Selector('#addAttachmentConvButton');
        this.imageCanvas = Selector('img[src*="data:image"]').parent('div[class="viewer-canvas"]');
        this.closeCanvasButton = Selector('.viewer-button.viewer-close');
        this.pdfCanvas = Selector('div.v-list-item__title').withText('Document Viewer');
        this.toNewMessageSelect = Selector('#schoolNameTxtField').parent('div[role="button"]');
        this.selectionBox = Selector('div[role="listbox"]');
    }

    async clickEditOptionsMenuButton() {
        await t.click(this.editOptionsMenuButton);
        log.info('Edit options menu button clicked');
    }

    async clickAddAttachmentMenuButton() {
        await t.click(this.addAttachmentMenuButton);
        log.info('Add attachment menu option button clicked');
    }

    async clickAddStudentMenuButton() {
        await t.click(this.addStudentButton);
        log.info('Add student menu option button clicked.');
    }

    async verifyAddStudentDialogIsAvailable() {
        await t.expect(this.addStudentDialog.exists).ok();
        log.info('Verified that the addStudentDialog is available.');
    }

    async verifyStudentAddedToMessageWithPEN(pen) {
        await t.expect(this.studentPensRaw.withExactText(pen).exists).ok();
        log.info('The student details have been added to the message.');
    }

    async verifyTimelineAttachmentByText(text) {
        await t.expect(Selector('.v-card__text')
        .withExactText(text).count)
        .eql(1, {timeout: 60000});
        log.info(`Exchange message with text - ${text} - found`);
    }

    async clickNewMessageButton(){
        await t.click(this.newMessageButton);
    }
    async clickDocumentToDisplayByName(text) {
        await t.click(Selector('a').withText(text));
        log.info(`Clicking document with title - ${text}`);
    }

    async verifySubjectHeadingByText(text) {
        await t.expect(this.subjectHeading.innerText).eql(text);
        log.info(`${text} found in subject header`);
    }

    async verifyImageCanvasDisplay(){
        await t.expect(this.imageCanvas.exists).ok();
        log.info('Image canvas displayed');
    }

    async clickCloseCanvasDisplay() {
        await t.click(this.closeCanvasButton);
        log.info('Close canvas button cLicked');
    }

    async verifyPDFCanvasDisplay(){
        await t.expect(this.pdfCanvas.exists).ok();
        log.info('PDF canvas displayed');
    }
    async enterNewMessageSubjectLine(text){
        await t.click(this.newMessagesubjectField()).typeText(this.newMessagesubjectField(), text, {timeout: 20000});
    }

    async enterTextForNewMessage(text){
        await t.click(this.newMessageTextArea).typeText(this.newMessageTextArea(), text, {timeout: 20000});
    }
    async clickNewMessageSend(){
        await t.click(this.sendMessageButton);
    }

    async selectToForNewMessage(name) {
        await t.click(this.toNewMessageSelect).wait(100);
        await t.expect(this.selectionBox.exists).ok();
        await t.click(this.selectionBox.find('div').withExactText(name));
    }

    async verifyMarkAsSpanText(text) {
        await t.expect(this.markAsSpan.innerText).eql(text);
        log.info(`Mark as span text verified as ${text}`);
    }

    async clickMarkAsButton() {
        await t.click(this.markAsButton);
        log.info('Mark as button clicked');
    }
}

export default MessageDisplay;

import { Selector, t } from 'testcafe';
import { findAllPaginated, deleteSecureExchange } from '../services/edx-api-service';
import log from 'npmlog';

const now = new Date();

class Inbox {

  constructor() {
    this.navTitle = Selector('#navTitle');
    this.newMessageButton = Selector('#newMessageBtn');
    this.filtersToggle = Selector('#filterid');
    this.subjectInput = Selector('#subjectInput');
    this.statusSelector = Selector('#statusSelector').parent('div[role="button"]');
    this.selectionBox = Selector('div[role="listbox"]');
    this.contactNameSelector = Selector('#contactNameSelect').parent('div[role="button"]');
    this.searchButton = Selector('#searchButton');
    this.clearSearchButton = Selector('#search-clear');
    this.nextPageButton = Selector('button[aria-label="Next page"]');
    this.previousPageButton = Selector('button[aria-label="Previous page"]');
    this.paginationIndication = Selector('div.v-data-footer__pagination');
    this.messageDateFilter = Selector('#messageDateTextField');
    this.messageDateNumber = Selector('div')
      .child('.v-date-picker-table')
      .find('.v-btn__content')
      .withText(now.getDate().toString());
    this.messageIdInput = Selector('#messageIdInput');
    this.schoolNameTextField = Selector('#schoolNameTxtField').parent('div[role="button"]');
    this.subjectTextField = Selector('#subjectTxtField');
    this.newMessageTextArea = Selector('#newMessageTextArea');
    this.newMessagePostBtn = Selector('#newMessagePostBtn');
    this.cancelMessage = Selector('#cancelMessage');

    this.newMessageStudentChips = Selector('.v-chip__content');
    this.addStudentButton = Selector('#addStudentID');
    this.newMessageDocumentChip = Selector('#documentChip');
    this.attachFileButton = Selector('#attachFileID')
  }

  async clickNewMessagePostButton() {
    await t.click(this.newMessagePostBtn());
    log.info('click:', 'New message Post button clicked');
  }

  async clickCancelSubmitButton() {
    await t.click(this.cancelMessage());
    log.info('click:', 'Cancel message button clicked');
  }

  async clickNewMessageButton() {
    await t.click(this.newMessageButton);
    log.info('click:', 'New message button clicked');
  }

  /**
   * Test a field to see if its parent v-input wrapper does not have an error class.
   *
   * @param {Selector} field - The message Selector field to test
   * @param {string} name - A name for the npmlog
   */
  async verifyFieldIsValid(field, name) {
    await t.expect(field.parent('div.v-input').hasClass('error--text')).notOk();
    log.info('pass:', name ? `${name} field is valid` : 'field is valid');
  }

  /**
   * Test a field to see if its parent v-input wrapper has an error class.
   *
   * @param {Selector} field - The message Selector field to test
   * @param {string} name - A name for the npmlog
   */
  async verifyFieldIsInvalid(field, name) {
    await t.expect(field.parent('div.v-input').hasClass('error--text')).ok();
    log.info('pass:', name ? `${name} field is invalid` : 'field is invalid');
  }

  async verifyPostMessageButtonIsDisabled() {
    await t.expect(this.newMessagePostBtn.hasAttribute('disabled')).ok();
    log.info('pass:', 'The post message button is disabled');
  }

  async verifyPostMessageButtonIsEnabled() {
    await t.expect(this.newMessagePostBtn.hasAttribute('disabled')).notOk();
    log.info('pass:', 'The post message button is disabled');
  }

  async selectMessageDate() {
    await t.click(this.messageDateFilter());
    await t.click(this.messageDateNumber());
    log.info('click:', 'Message date selected');
  }

  async clickFiltersToggle() {
    await t.click(this.filtersToggle);
    log.info('click:', 'Filters toggle selected');
  }

  async inputSubject(text) {
    await t.typeText(this.subjectInput, text);
    log.info('input:', 'Subject entered');
  }

  async clickAndSelectTeamNameFieldByText(name) {
    await t.click(this.schoolNameTextField).wait(100);
    log.info('click:', 'Select team option clicked');
    await t.expect(this.selectionBox.exists).ok();
    await t.click(this.selectionBox.find('div.row').withText(name));
    log.info('click:', `Clicked team name option ${name}`);
  }

  async inputSubjectTextField(text) {
    await t.typeText(this.subjectTextField, text);
    log.info('input:', 'Subject input');
  }

  async inputNewMessage(text) {
    await t.typeText(this.newMessageTextArea, text);
    log.info('input:', 'Message input');
  }

  async clearMessageTextField() {
    await t.selectText(this.newMessageTextArea).pressKey('delete');
    log.info('input:', 'Cleared message field');
  }

  async clearSubjectTextField() {
    await t.selectText(this.subjectTextField).pressKey('delete');
    log.info('input:', 'Cleared subject field');
  }

  async inputMessageId(text) {
    await t.typeText(this.messageIdInput, text);
    log.info('input:', 'Input message id');
  }

  async selectStatus(status) {
    await t.click(this.statusSelector).wait(100);
    await t.expect(this.selectionBox.exists).ok();
    await t.click(this.selectionBox.find('span').withExactText(status).parent('div.row'));
  }

  async selectContactName(name) {
    await t.click(this.contactNameSelector).wait(100);
    await t.expect(this.selectionBox.exists).ok();
    await t.click(this.selectionBox.find('div').withExactText(name));
  }

  async clickSearchButton() {
    await t.click(this.searchButton);
    log.info('click:', 'Search button clicked');
  }

  async clickClearSearchButton() {
    await t.click(this.clearSearchButton);
    log.info('click:', 'Clear search button clicked');
  }

  async clickNextPage() {
    await t.click(this.nextPageButton);
    log.info('click:', 'Next page selected');
  }

  async clickPreviousPage() {
    await t.click(this.previousPageButton);
    log.info('click:', 'Previous page selected');
  }

  async clickNthTableRow(index) {
    await t.click((Selector('tr')).nth(index))
    log.info('click:', `Row ${index} was clicked`)
  }

  async createANewMessage(testExchangeSubject) {
    await this.clickNewMessageButton();
    await this.inputSubjectTextField(testExchangeSubject);
    await this.inputNewMessage('This is a super awesome message.');
    await this.clickAndSelectTeamNameFieldByText('PEN Team');
    log.info('input', 'New message details input');
  }

  async clickOnAddStudentButtonInNewMessage() {
    await t.expect(this.addStudentButton.visible).ok().click(this.addStudentButton);
    log.info('click:', 'Add Student Button Clicked');
  }

  async studentAddedToNewMessageWithPen(pen) {
    await t.expect(this.newMessageStudentChips.withExactText(pen).exists).ok();
    log.info('pass:', 'Student details added to the new message');
  }

  async clickAttachFileButton() {
    await t.click(this.attachFileButton());
    log.info('click:', "Attach file button clicked");
  }

  /**
   * Returns a response object containing any messages by subject
   *
   * @param subject
   * @param token
   * @returns {Promise<*>}
   */
  async findMessagesBySubject(subject, token) {
    let params = {
      params: {
        searchCriteriaList: '[{"key": "subject", "value": "' + subject + '", "operation":' +
          ' "like_ignore_case", "valueType": "STRING"}]'
      }
    };
    return await findAllPaginated(token, params);

  }

  /**
   * Given a subject, will delete messages from the api which contain that subject
   *
   * @param subject
   * @param token
   * @returns {Promise<void>}
   */
  async deleteMessagesBySubject(subject, token) {
    let response = await this.findMessagesBySubject(subject, token);
    if (response != null) {
      for (const element of response.content) {
        await deleteSecureExchange(token, element.secureExchangeID);
        log.info('database:', 'Removing message by subject: ' + subject);
      }
    }
  }
}

export default Inbox;

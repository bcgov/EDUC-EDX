import selectors from "../../support/selectors";

function addDocumentToMessage() {
  cy.visit('/inbox');
  cy.get(selectors.secureExchangeInbox.secureExchangeResults).contains('EDX automation test').click();
  cy.get(selectors.secureExchangeDetail.editOptionsMenu).click();
  cy.get(selectors.secureExchangeDetail.addAttachmentConvButton).click();
  cy.get(selectors.documentUpload.uploadDocumentTypeCodeSelect).parent().click();
  cy.get(selectors.dropdown.listItem).contains('Canadian Birth Certificate').click();
  cy.get(selectors.documentUpload.selectFileInput).selectFile('./cypress/uploads/BC.jpg');
  cy.get(selectors.documentUpload.uploadDocumentButton).click();
  cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'Your document was uploaded successfully. Close');
  cy.get(selectors.secureExchangeDetail.timelineContent).contains('BC.jpg').should('exist');
}

function addStudentToMessage() {
  cy.visit('/inbox');
  cy.get(selectors.secureExchangeInbox.secureExchangeResults).contains('EDX automation test').click();
  cy.get(selectors.secureExchangeDetail.editOptionsMenu).click();
  cy.get(selectors.secureExchangeDetail.addStudentConvButton).click();
  cy.get(selectors.secureExchangeStudentUpload.studentPenTextField).type(Cypress.env('student').penList[0]);
  cy.get(selectors.secureExchangeStudentUpload.searchPenBtn).click();
  cy.get(selectors.secureExchangeStudentUpload.addStudentID).click();
  cy.get(selectors.secureExchangeDetail.timelineContent).contains(Cypress.env('student').penList[0]).should('exist');
}

function checkExistingMessageWithAttachments() {
  cy.visit('/inbox');
  cy.get(selectors.secureExchangeInbox.secureExchangeResults).contains('EDX automation test').click();
  cy.get(selectors.secureExchangeDetail.timelineContent).contains('BC.jpg').should('exist');
  cy.get(selectors.secureExchangeDetail.timelineContent).contains(Cypress.env('student').penList[0]).should('exist');
}

function createSecondNewMessage(){
  cy.visit('/');
  cy.get(selectors.dashboard.secureMessageTile).click();
  cy.get(selectors.secureExchangeInbox.newMessageButton).click();
  cy.get(selectors.secureExchangeNewMessage.toInputDropdown).parent().click();
  cy.get(selectors.dropdown.listItem).contains('PEN Team').click();
  cy.get(selectors.secureExchangeNewMessage.subjectTxtField).type('EDX automation test 2');
  cy.get(selectors.secureExchangeNewMessage.newMessageTextArea).type('This second message was created by an EDX automation test');
  cy.get(selectors.secureExchangeNewMessage.newMessagePostBtn).click();
  cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'Success! The message has been sent. Close');
}

function createNewMessageWithDocumentAndStudent() {
  cy.visit('/');
  cy.get(selectors.dashboard.secureMessageTile).click();
  cy.get(selectors.secureExchangeInbox.newMessageButton).click();

  // create new secure exchange message
  cy.get(selectors.secureExchangeNewMessage.toInputDropdown).parent().click();
  cy.get(selectors.dropdown.listItem).contains('PEN Team').click();
  cy.get(selectors.secureExchangeNewMessage.subjectTxtField).type('EDX automation test');
  cy.get(selectors.secureExchangeNewMessage.newMessageTextArea).type('This message was created by an EDX automation test');

  // add document
  cy.get(selectors.secureExchangeNewMessage.attachFileID).click();
  cy.get(selectors.documentUpload.uploadDocumentTypeCodeSelect).parent().click();
  cy.get(selectors.dropdown.listItem).contains('Canadian Birth Certificate').click();
  cy.get(selectors.documentUpload.selectFileInput).selectFile('./cypress/uploads/BC.jpg');
  cy.get(selectors.documentUpload.uploadDocumentButton).click();
  cy.get('.v-chip').contains('BC.jpg').should('exist');

  // add student
  const pen = Cypress.env('student').penList[0];
  cy.get(selectors.secureExchangeNewMessage.addStudentToNewMessageBtn).click();
  cy.get(selectors.secureExchangeStudentUpload.studentPenTextField).type(pen);
  cy.get(selectors.secureExchangeStudentUpload.searchPenBtn).click();
  cy.get(selectors.secureExchangeStudentUpload.addStudentID).click();
  cy.get('.v-chip').contains(pen).should('exist');

  // submit message
  cy.get(selectors.secureExchangeNewMessage.newMessagePostBtn).click();
  cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'Success! The message has been sent. Close');
  cy.get(selectors.secureExchangeInbox.secureExchangeResults).contains('EDX automation test').should('have.length', 1);
}

function removeExistingDocumentAndStudent() {
  cy.visit('/inbox');
  cy.get(selectors.secureExchangeInbox.secureExchangeResults).contains('EDX automation test').click();
  cy.get(selectors.secureExchangeDetail.timelineContent).contains('BC.jpg')
      .parentsUntil(selectors.secureExchangeDetail.timelineContent)
      .find(selectors.secureExchangeDetail.timelineRemoveButton).first().click();
  cy.get(selectors.secureExchangeDetail.timelineConfirmYesButton).contains('Yes').click();
  cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'Success! The document has been removed. Close');

  cy.get(selectors.secureExchangeDetail.timelineContent).contains(Cypress.env('student')
      .penList[0]).parentsUntil(selectors.secureExchangeDetail.timelineContent)
      .find(selectors.secureExchangeDetail.timelineRemoveButton).first().click();
  cy.get(selectors.secureExchangeDetail.timelineConfirmYesButton).contains('Yes').click();
  cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'Success! The document has been removed. Close');
}

function searchForMultipleMessages() {
  cy.visit('/inbox');
  cy.get(selectors.secureExchangeInbox.filtersButton).click();
  cy.get(selectors.secureExchangeInbox.filterSubjectInput).type(`EDX automation test`);
  cy.get(selectors.secureExchangeInbox.filterSearchButton).click();
  cy.get(selectors.secureExchangeInbox.secureExchangeResults).children('.v-row').should('have.length', 2);
}

function searchForSingleMessage() {
  cy.visit('/inbox');
  cy.get(selectors.secureExchangeInbox.filtersButton).click();
  cy.get(selectors.secureExchangeInbox.filterSubjectInput).type(`EDX automation test`);
  cy.get(selectors.secureExchangeInbox.filterSearchButton).click();
  cy.get(selectors.secureExchangeInbox.secureExchangeResults).contains('EDX automation').should('have.length', 1);
}

function testNewMessageForm() {
  beforeEach(() => {
    cy.visit('/inbox');
    cy.get(selectors.secureExchangeInbox.newMessageButton).click();
  });
  it('Checking if fields are invalid', () => {
    cy.get(selectors.secureExchangeNewMessage.toInputDropdown).should('be.empty');
    cy.get(selectors.secureExchangeNewMessage.toInputDropdown).parent().should('be.not.empty');
    cy.get(selectors.secureExchangeNewMessage.subjectTxtField).should('be.empty');
    cy.get(selectors.secureExchangeNewMessage.newMessageTextArea).should('be.empty');
    cy.get(selectors.secureExchangeNewMessage.newMessagePostBtn).should('be.disabled');
  });

  it('Validate some fields and verify we can\'t post a new message',() => {
    cy.get(selectors.secureExchangeNewMessage.subjectTxtField).type('EDX automation test');
    cy.get(selectors.secureExchangeNewMessage.newMessageTextArea).type('This message was created by an EDX automation test');
    cy.get(selectors.secureExchangeNewMessage.newMessagePostBtn).should('be.disabled');
  });

  it('Validate the fields and verify we can post a new message', () => {
    cy.get(selectors.secureExchangeNewMessage.toInputDropdown).parent().click();
    cy.get(selectors.dropdown.listItem).contains('PEN Team').click();
    cy.get(selectors.secureExchangeNewMessage.subjectTxtField).type('EDX automation test');
    cy.get(selectors.secureExchangeNewMessage.newMessageTextArea).type('This message was created by an EDX automation test');
    cy.get(selectors.secureExchangeNewMessage.newMessagePostBtn).should('be.enabled');
  });
}


describe('Exchange Inbox Page', () => {
  context('As a school User', () => {
    before(() => {
      cy.task('dataLoad').then(() => {
        cy.task('cleanup-secure-exchange', 'EDX automation test');
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', { schoolCodes: ['99998'] });
      });
    });
    beforeEach(() => cy.login());
    after(() => {
      cy.logout();
    });

    context('test new message form validation', testNewMessageForm);
    it('can create a new secure exchange message with a document and a student',createNewMessageWithDocumentAndStudent);
    it('has an existing message with attachments', checkExistingMessageWithAttachments);
    it('can search for the message', searchForSingleMessage);
    it('can remove the existing document and student from the message', removeExistingDocumentAndStudent);
    it('can add a document to the message', addDocumentToMessage);
    it('can add a student to the message', addStudentToMessage);
    it('creates second message', createSecondNewMessage);
    it('checks if the 2 messages show up in search feature', searchForMultipleMessages);
  });

  context('As an EDX district administrator', () => {
    before(() => {
      const districtUserOptions: DistrictUserOptions = {districtRoles: ['SECURE_EXCHANGE_DISTRICT'], districtCodes: ['998']};

      cy.task('dataLoad').then(() => {
        cy.task('cleanup-secure-exchange', 'EDX automation test');
        cy.task('setup-districtUser', districtUserOptions);
      });
    });
    beforeEach(() => cy.login());
    after(() => {
      cy.logout();
    });

    context('test new message form validation', testNewMessageForm);
    it('can create a new secure exchange message with a document and a student',createNewMessageWithDocumentAndStudent);
    it('has an existing message with attachments', checkExistingMessageWithAttachments);
    it('can search for the message', searchForSingleMessage);
    it('can remove the existing document and student from the message', removeExistingDocumentAndStudent);
    it('can add a document to the message', addDocumentToMessage);
    it('can add a student to the message', addStudentToMessage);
    it('creates second message', createSecondNewMessage);
    it('checks if the 2 messages show up in search feature', searchForMultipleMessages);
  });
});

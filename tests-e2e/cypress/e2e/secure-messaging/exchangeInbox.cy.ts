import selectors from "../../support/selectors";


describe('Exchange Inbox Page', () => {
  context('As an EDX district administrator', () => {
    before(() => {
      const districtUserOptions: DistrictUserOptions = {districtRoles: ['EDX_DISTRICT_ADMIN'], districtCodes: ['998']};

      cy.task('dataLoad').then(() => {
        cy.task('cleanup-secure-exchange', 'EDX automation test');
        cy.task('setup-districtUser', districtUserOptions);
      });
    });

    beforeEach(() => cy.login());

    after(() => {
      cy.logout();
    });

    it('can create a new secure exchange message with a document and a student', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing District');
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
    });

    it('has an existing message with attachments', () => {
      cy.visit('/inbox');
      cy.get(selectors.secureExchangeInbox.secureExchangeResults).contains('EDX automation test').click();
      cy.get(selectors.secureExchangeDetail.timelineContent).contains('BC.jpg').should('exist');
      cy.get(selectors.secureExchangeDetail.timelineContent).contains(Cypress.env('student').penList[0]).should('exist');
    });

    it('can search for the message', () => {
      cy.visit('/inbox');
      cy.get(selectors.secureExchangeInbox.filtersButton).click();
      cy.get(selectors.secureExchangeInbox.filterSubjectInput).type(`EDX automation test`);
      cy.get(selectors.secureExchangeInbox.filterSearchButton).click();
      cy.get(selectors.secureExchangeInbox.secureExchangeResults).contains('EDX automation test').should('have.length', 1);
    });

    it('can remove the existing document and student from the message', () => {
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
    });

    it('can add a document to the message', () => {
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
    });

    it('can add a student to the message', () => {
      cy.visit('/inbox');
      cy.get(selectors.secureExchangeInbox.secureExchangeResults).contains('EDX automation test').click();
      cy.get(selectors.secureExchangeDetail.editOptionsMenu).click();
      cy.get(selectors.secureExchangeDetail.addStudentConvButton).click();
      cy.get(selectors.secureExchangeStudentUpload.studentPenTextField).type(Cypress.env('student').penList[0]);
      cy.get(selectors.secureExchangeStudentUpload.searchPenBtn).click();
      cy.get(selectors.secureExchangeStudentUpload.addStudentID).click();
      cy.get(selectors.secureExchangeDetail.timelineContent).contains(Cypress.env('student').penList[0]).should('exist');
    });

  });
});

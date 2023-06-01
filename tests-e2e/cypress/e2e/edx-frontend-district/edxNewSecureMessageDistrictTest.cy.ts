import selectors from "../../support/selectors";

before(() => {
  cy.task('dataLoad').then((res: any) => {
    cy.task('cleanup-secure-exchange', 'EDX automation test');
    cy.task('setup-districtUser', {districtRoles: ['EDX_DISTRICT_ADMIN'], districtCodes: ['998']});
  });
})

after(() => {
  cy.visit(Cypress.env('url').base_url + '/logout')
})

describe('District new secure message test', () => {
  it('Load dashboard & access secure message & create new message', () => {
    cy.visit('/');
    cy.login();
    cy.get(selectors.dashboard.title, {timeout: 60000}).contains('Dashboard | EDX Automation Testing District');
    cy.get(selectors.dashboard.secureMessageTile).click();

    cy.get(selectors.secureExchangeInbox.newMessageButton).click();

    //create new secure exchange message
    cy.get(selectors.secureExchangeNewMessage.toInputDropdown).parent().click();
    cy.get(selectors.dropdown.listItem).contains('PEN Team').click();
    cy.get(selectors.secureExchangeNewMessage.subjectTxtField).type('EDX automation test');
    cy.get(selectors.secureExchangeNewMessage.newMessageTextArea).type('This message was created by an EDX automation test');
    cy.get(selectors.secureExchangeNewMessage.attachFileID).click();
    cy.get(selectors.documentUpload.uploadDocumentTypeCodeSelect).parent().click();
    cy.get(selectors.dropdown.listItem).contains('Canadian Birth Certificate').click();
    cy.get(selectors.documentUpload.selectFileInput).selectFile('./cypress/uploads/BC.jpg');
    cy.get(selectors.documentUpload.uploadDocumentButton).click();
    cy.get(selectors.secureExchangeNewMessage.addStudentToNewMessageBtn).click();
    cy.get(selectors.secureExchangeStudentUpload.studentPenTextField).type(Cypress.env('student').penList[0]);
    cy.get(selectors.secureExchangeStudentUpload.searchPenBtn).click();
    cy.get(selectors.secureExchangeStudentUpload.addStudentID).click();
    cy.get(selectors.secureExchangeNewMessage.newMessagePostBtn).click();

    cy.get(selectors.secureExchangeInbox.filtersButton).click();
    cy.get(selectors.secureExchangeInbox.filterSubjectInput).type(`EDX automation test`);
    cy.get(selectors.secureExchangeInbox.filterSearchButton).click();
    cy.get(selectors.secureExchangeInbox.secureExchangeResults).contains('EDX automation test').should('have.length', 1);
    cy.get(selectors.secureExchangeInbox.secureExchangeResults).contains('EDX automation test').click();

    //verify the attachments exists and then remove
    cy.get(selectors.secureExchangeDetail.timelineContent).contains('BC.jpg').should('exist');
    cy.get(selectors.secureExchangeDetail.timelineContent).contains('BC.jpg').children('.v-btn').click();
    cy.get(selectors.secureExchangeDetail.timelineContent).contains(Cypress.env('student').penList[0]).should('exist');






    cy.pause();
  })
})

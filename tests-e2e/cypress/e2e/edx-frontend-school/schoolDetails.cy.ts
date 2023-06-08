import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import { vInputParentOf } from 'tests-e2e/cypress/support/utils';

before(() => {
  cy.task<AppSetupData>('dataLoad').then(() => {
    cy.task('setup-schoolUser', ['99998']);
  });
  cy.login();
})

after(() => {
  cy.logout();
})

describe('School Details Interface Test', () => {
  it('Loads school details and checks field validation', () => {
    cy.visit('/')
    cy.get(selectors.dashboard.title, {timeout: 60000}).contains('Dashboard | EDX Automation Testing School');
    cy.get(selectors.dashboard.schoolDetailsCard).click();
    cy.get(selectors.schoolDetails.addWebsiteLink).click();

    const websiteField = () => cy.get(selectors.schoolDetails.schoolDetailsWebsite);
    const websiteWrapper = vInputParentOf(websiteField);
    const websiteErrorMessage = 'Website must be valid and secure (i.e., https)';

    websiteField().clear().type('http://www.nope.com');
    websiteWrapper().should('have.class', 'v-input--error');
    websiteWrapper().within(() =>
      cy.get('.v-messages__message').should('contain.text', websiteErrorMessage)
    );

    websiteField().clear().type('https://notawebsite');
    websiteWrapper().should('have.class', 'v-input--error');
    websiteWrapper().within(
      () => cy.get('.v-messages__message').should('contain.text', websiteErrorMessage)
    );

    websiteField().clear().type('https://saulgoodman.com');
    websiteWrapper().should('not.have.class', 'v-input--error');
    websiteWrapper().within(() => cy.get('.v-messags__message').should('not.exist'));
  });
});

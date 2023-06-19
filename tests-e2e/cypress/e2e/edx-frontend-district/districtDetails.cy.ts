import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import { vInputParentOf } from 'tests-e2e/cypress/support/utils';

describe('District Details Interface Test', () => {
  context('As an EDX district admin', () => {
    before(() => {
      cy.task<AppSetupData>('dataLoad').then(() => {
        cy.task('setup-districtUser', { districtRoles: ['EDX_DISTRICT_ADMIN'], districtCodes: ['998'] });
      });
    });
    beforeEach(() => cy.login());
    after(() => cy.logout());

    it('can load district details and checks field validation', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.title, {timeout: 3000}).contains('Dashboard | EDX Automation Testing District');
      cy.get(selectors.dashboard.districtDetailsCard).click();
      cy.get(selectors.districtDetails.editDetailsButton).click();

      const websiteField = () => cy.get(selectors.districtDetails.districtDetailsWebsite);
      const websiteWrapper = vInputParentOf(websiteField);
      const websiteErrorMessage = 'Website must be valid and secure (i.e., https)';

      websiteField().clear().type('http://www.nope.com');
      websiteWrapper().should('have.class', 'v-input--error');
      websiteWrapper().within(() =>
        cy.get('.v-messages__message').should('contain.text', websiteErrorMessage)
      );

      websiteField().clear().type('https://notawebsite');
      websiteWrapper().should('have.class', 'v-input--error');
      websiteWrapper().within(() =>
        cy.get('.v-messages__message').should('contain.text', websiteErrorMessage)
      );

      websiteField().clear().type('https://saulgoodman.com');
      websiteWrapper().should('not.have.class', 'v-input--error');
      websiteWrapper().within(() => cy.get('.v-messags__message').should('not.exist'));
    });
  });
});

import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import { InstituteOptions } from 'tests-e2e/cypress/services/institute-api-service';

before(() => {
  cy.task<InstituteOptions, AppSetupData>('dataLoad', { schoolOptions: { schoolStatus: 'Opening' } })
    .then(data => {
      console.log("DATA:", data);
      cy.task('setup-schoolUser', ['99998']);
    });
  cy.login();
})

after(() => {
  cy.logout();
})

describe('Access School Users Page', () => {
  it('Loads school details and checks field validation', () => {
    cy.visit('/');
    cy.get(selectors.dashboard.title, {timeout: 60000}).contains('Dashboard | EDX Automation Testing School');
    cy.get(selectors.hamburgerMenu.hamburgerMenuButton).click();
    cy.get(selectors.hamburgerMenu.schoolUserManagementOption).click();

    cy.get(selectors.newUserInvites.newUserButton, {timeout: 30000}).click();
    cy.get(selectors.newUserInvites.firstNameInput).type("Richard");
    cy.get(selectors.newUserInvites.lastNameInput).type("Stallman");
    cy.get(selectors.newUserInvites.emailInput).type("rms@gov.bc.ca");
    cy.get(selectors.newUserInvites.rolesSelectorDropdown).click({force: true});
    cy.get(selectors.newUserInvites.rolesSelectorBox).within(() => {
      cy.get('div[value="SECURE_EXCHANGE_SCHOOL"]').click();
    });

    cy.get(selectors.newUserInvites.sendInviteButton).click();
    cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'Success! The request is being processed.');
  });
});

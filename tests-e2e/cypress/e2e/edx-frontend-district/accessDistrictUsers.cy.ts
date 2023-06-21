import { AppSetupData } from "tests-e2e/cypress.config";
import { InstituteOptions } from "tests-e2e/cypress/services/institute-api-service";
import selectors from "../../support/selectors";

describe('Access District Users Page Tests', () => {
  context('As a district admin', () => {
    before(() => {
      cy.task<InstituteOptions, AppSetupData>('dataLoad');
      cy.task<DistrictUserOptions>('setup-districtUser', {
        districtRoles: ['EDX_DISTRICT_ADMIN'],
        districtCodes: ['998']
      });
    });
    beforeEach(() => cy.login());
    after(() => cy.logout());

    it('can generate a primary activation code', () => {
      cy.intercept(Cypress.env('interceptors').activation_code).as('activationCodeUpdate');

      cy.visit('/districtAccess');
      cy.wait('@activationCodeUpdate');

      cy.get(selectors.newUserInvites.primaryActivationCode).invoke('text').as('initialCode');
      cy.get('@initialCode').then(initialCode => {
        cy.get(selectors.newUserInvites.toggleGenerateNewCode).click();
        cy.get(selectors.newUserInvites.generateNewCode).click();

        cy.wait('@activationCodeUpdate').then(({response}) => {
          expect(response?.body.activationCode).not.null;
          expect(response?.body.activationCode).not.eq(initialCode);
        });

        cy.get(selectors.newUserInvites.primaryActivationCode).invoke("text").then(newCode => {
          cy.get(selectors.snackbar.mainSnackBar)
            .should('include.text', `The new Primary Activation Code is ${newCode}. Close`);
          expect(initialCode).not.eq(newCode);
        });
      });
    });

    it('checks if new user request can be created to district', () => {
      cy.visit('/districtAccess');
      cy.get(selectors.newUserInvites.newUserButton).click();
      cy.get(selectors.newUserInvites.firstNameInput).type('AT FIRST NAME');
      cy.get(selectors.newUserInvites.lastNameInput).type('AT LAST NAME');
      cy.get(selectors.newUserInvites.emailInput).type('edx-noreply@gov.bc.ca');
      cy.get(selectors.newUserInvites.rolesSelectorDropdown).parent().click();
      cy.get(selectors.dropdown.listItem).contains('Secure Exchange').click();
      cy.get(selectors.newUserInvites.sendInviteButton).click();
      cy.get(selectors.snackbar.mainSnackBar).should('contain', 'Success! The request is being processed.');
    });
  });
});

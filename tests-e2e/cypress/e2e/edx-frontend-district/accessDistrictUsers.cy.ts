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

    context('with a temporary user', () => {
      let tempUserId = '';
      let tempFirstName = '';

      before(() => {
        cy.task<DistrictUserOptions, EdxUserEntity>('setup-districtUser', {
          digitalId: crypto.randomUUID(),
          districtRoles: ['EDX_DISTRICT_ADMIN'],
          districtCodes: ['998']
        }).then((user: EdxUserEntity) => {
            tempUserId = user.edxUserID;
            tempFirstName = user.firstName;
          });
      });
      beforeEach(() => {
        cy.wrap(tempUserId).as('tempUserId');
        cy.wrap(tempFirstName).as('tempUserFirstName');
      });
      after(() => cy.get('@tempUserId').then(uid => cy.task('teardown-edxUser', uid)));

      it('will not save a user with no roles', () => {
        cy.visit('/districtAccess', {timeout: 3000});
        cy.get('@tempUserId').then(uid => {
          cy.get(`#edxUser-${uid}`).should('exist');
          cy.get(`#user-edit-button-${uid}`).click();
          cy.get(`#access-user-roles-${uid}`).should('exist').within(() => {
            cy.get('div[value="EDX_DISTRICT_ADMIN"]').click();
          });
          cy.get('@tempUserFirstName').then(fname => {
            cy.get(selectors.accessUsersPage.accessUserFeedback)
              .should('include.text', `Please select at least one role for ${fname}`);
          });
          cy.get(`#user-save-action-button-${uid}`).should('be.disabled');
        });
      });

      it('can cancel the edit user mode', () => {
        cy.visit('/districtAccess', {timeout:3000});
        cy.get('@tempUserId').then(uid => {
          cy.get(`#user-edit-button-${uid}`).click();
          cy.get(`#user-cancel-edit-button-${uid}`).should('exist').click();
          cy.get(`#access-user-roles-${uid}`).should('not.exist');
          cy.get(`#user-edit-button-${uid}`).click().click({timeout:200});
          cy.get(`#access-user-roles-${uid}`).should('not.exist');
        });
      });

      it('will only permit one role', () => {
        cy.visit('/districtAccess', {timeout: 3000});
        cy.get('@tempUserId').then(uid => {
          cy.get(`#user-edit-button-${uid}`).click();
          cy.get(`#access-user-roles-${uid}`).should('exist').within(() => {
            cy.get('div[value="SECURE_EXCHANGE_DISTRICT"] > .v-list-item')
              .should('have.class', 'v-list-item--disabled');
            cy.get('div[value="EDX_DISTRICT_ADMIN"]').click();
            cy.get('div[value="SECURE_EXCHANGE_DISTRICT"] input').click().should('be.checked');
            cy.get('div[value="EDX_DISTRICT_ADMIN"] > .v-list-item').should('not.have.class', '.v-list-item--disabled');
            cy.get('div[value="EDX_DISTRICT_ADMIN"]').click();
            cy.get('div[value="SECURE_EXCHANGE_DISTRICT"] input').should('not.be.checked');
            cy.get('div[value="EDX_DISTRICT_ADMIN"] > .v-list-item').should('not.have.class', '.v-list-item--disabled');
          });
        });
      });

      it('can update the user\'s role', () => {
        cy.visit('/districtAccess', {timeout:3000});
        cy.get('@tempUserId').then(uid => {
          cy.get(`#user-edit-button-${uid}`).click();
          cy.get(`#access-user-roles-${uid}`).should('exist').within(() => {
            cy.get('div[value="EDX_DISTRICT_ADMIN"]').click();
            cy.get('div[value="SECURE_EXCHANGE_DISTRICT"]').click();
          });
          cy.get(`#user-save-action-button-${uid}`).should('not.be.disabled').click();
          cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'User roles have been updated. Close');
          cy.get(`#access-user-roles-${uid}`, {timeout: 3000}).should('not.exist');
          cy.get(`#user-edit-button-${uid}`).click();
          cy.get(`#access-user-roles-${uid}`).should('exist').within(() => {
            cy.get('div[value="EDX_DISTRICT_ADMIN"] input').should('not.be.checked');
            cy.get('div[value="SECURE_EXCHANGE_DISTRICT"] input').should('be.checked');
          });
        });
      })

    });
  });
});

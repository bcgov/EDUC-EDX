import { AppSetupData } from "tests-e2e/cypress.config";
import { InstituteOptions } from "tests-e2e/cypress/services/institute-api-service";
import selectors from "../../support/selectors";

describe('Access District Users Page Tests', () => {
  context('As a district admin', () => {
    before(() => {
      cy.task<InstituteOptions, AppSetupData>('dataLoad', { });
      cy.task<DistrictUserOptions>('setup-districtUser', {
        districtRoles: ['EDX_DISTRICT_ADMIN'],
        districtCodes: ['998']
      });
    });
    beforeEach(() => cy.login());
    after(() => cy.logout());

    context('main district user admin', () => {

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
        cy.get(selectors.dropdown.listItem).contains('Secure Messaging').click();
        cy.get(selectors.newUserInvites.sendInviteButton).click();
        cy.get(selectors.snackbar.mainSnackBar).should('contain', 'Success! The request is being processed.');
      });

    });

    context('with a temporary user', () => {
      let tempUserId = '';
      let tempDisplayName = '';

      before(() => {
        cy.task<DistrictUserOptions, EdxUserEntity>('setup-districtUser', {
          digitalId: crypto.randomUUID(),
          districtRoles: ['EDX_DISTRICT_ADMIN'],
          districtCodes: ['998']
        }).then((user: EdxUserEntity) => {
            tempUserId = user.edxUserID;
            tempDisplayName = `${user.firstName} ${user.lastName}`.trim();
          });
      });
      beforeEach(() => {
        cy.wrap(tempUserId).as('tempUserId');
        cy.wrap(tempDisplayName).as('tempUserDisplayName');
      });
      after(() => cy.get('@tempUserId').then(uid => cy.task('teardown-edxUser', uid)));

      it('will not save a user with no roles', () => {
        cy.visit('/districtAccess');
        cy.get('@tempUserId').then(uid => {
          cy.get(`#edxUser-${uid}`).should('exist');
          cy.get(`#user-edit-button-${uid}`).click();
          cy.get(`#access-user-roles-${uid}`).should('exist').within(() => {
            cy.get('div[value="EDX_DISTRICT_ADMIN"]').click();
          });
          cy.get('@tempUserDisplayName').then(userDisplayName => {
            cy.get(selectors.accessUsersPage.accessUserFeedback)
              .should('include.text', `Please select at least one role for ${userDisplayName}`);
          });
          cy.get(`#user-save-action-button-${uid}`).should('be.disabled');
        });
      });

      it('can cancel the edit user mode', () => {
        cy.visit('/districtAccess');
        cy.get('@tempUserId').then(uid => {
          cy.get(`#user-edit-button-${uid}`).click();
          cy.get(`#user-cancel-edit-button-${uid}`).should('exist').click();
          cy.get(`#access-user-roles-${uid}`).should('not.exist');
        });
      });

      it('can update the user\'s role', () => {
        cy.visit('/districtAccess');
        cy.get('@tempUserId').then(uid => {
          cy.get(`#user-edit-button-${uid}`).click();
          cy.get(`#access-user-roles-${uid}`).should('exist').within(() => {
            cy.get('div[value="EDX_DISTRICT_ADMIN"]').click();
            cy.get('div[value="SECURE_EXCHANGE_DISTRICT"]').click();
          });
          cy.get(`#user-save-action-button-${uid}`).should('not.be.disabled').click();
          cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'User has been updated. Close');
          cy.get(`#access-user-roles-${uid}`).should('not.exist');
          cy.get(`#user-edit-button-${uid}`).click();
          cy.get(`#access-user-roles-${uid}`).should('exist').within(() => {
            cy.get('div[value="EDX_DISTRICT_ADMIN"] input').should('not.be.checked');
            cy.get('div[value="SECURE_EXCHANGE_DISTRICT"] input').should('be.checked');
            });
          });
        });

      it('can cancel relinking a user', () => {
        cy.visit('/districtAccess');
        cy.get('@tempUserId').then(uid => {
          cy.get(`#user-relink-button-${uid}`).click();
          cy.get(selectors.accessUsersPage.confirmationDialog).should('exist')
            .should('include.text', 'Re-linking an account will remove the current user and resend the activation code so that the user can set up EDX access with their new credentials.');
          cy.get(`#rejectBtn`).should('exist').click();
          cy.get(`#userRelinkWarningText`).should('not.exist');
        });
      })

      it('can relink a user', () => {
        cy.visit('/districtAccess');
        cy.get('@tempUserId').then(uid => {
          cy.get(`#user-relink-button-${uid}`).click();
          cy.get(selectors.accessUsersPage.confirmationDialog).should('exist')
            .should('include.text', 'Re-linking an account will remove the current user and resend the activation code so that the user can set up EDX access with their new credentials.');
          cy.get(`#resolveBtn`).should('exist').click();
          cy.get(selectors.snackbar.mainSnackBar)
            .should('contain', 'User has been removed, email sent with instructions to re-link. Close');
        });
      })

    });

    context('temporary user to be deleted', () => {
      let tempUserId = '';

      before(() => {
        cy.task<DistrictUserOptions, EdxUserEntity>('setup-districtUser', {
          digitalId: crypto.randomUUID(),
          districtRoles: ['EDX_DISTRICT_ADMIN'],
          districtCodes: ['998']
        }).then((user: EdxUserEntity) => {
          tempUserId = user.edxUserID;
        });

      });
      beforeEach(() => {
        cy.wrap(tempUserId).as('tempUserId');
      });
      after(() => {
        cy.get('@tempUserId').then(uid => cy.task('teardown-edxUser', uid));
        cy.logout()
      });

      it('can find delete option and cancel delete', () => {
        cy.visit('/districtAccess');
        cy.get('@tempUserId').then(uid => {
          cy.get(`#user-remove-button-${uid}`).click();
          cy.get(`#rejectBtn`).click();
        });
      });

      it('can find delete option and confirms delete', () => {
        cy.visit('/districtAccess');
        cy.get('@tempUserId').then(uid => {
          cy.get(`#user-remove-button-${uid}`).click();
          cy.get(`#resolveBtn`).click();
          cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'User has been removed. Close');
        });
      });

    });

  });
});

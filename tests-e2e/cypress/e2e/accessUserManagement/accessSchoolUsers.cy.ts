import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import { InstituteOptions } from 'tests-e2e/cypress/services/institute-api-service';

function navigateToAccessSchoolUsers() {
  cy.visit('/schoolAccess');
  cy.get(selectors.accessUsersPage.selectSchoolDropdown).click();
  cy.get(selectors.accessUsersPage.schoolSelectorBox).should('exist');
  cy.get(selectors.accessUsersPage.schoolSelectorBox).find('div')
    .contains('EDX Automation Testing School').click();
  cy.get(selectors.accessUsersPage.manageSchoolButton).click();
}


function testSendingNewUserInvites() {
  navigateToAccessSchoolUsers();

  cy.get(selectors.newUserInvites.newUserButton).click();
  cy.get(selectors.newUserInvites.newUserInviteVCard).should('exist');

  cy.get(selectors.newUserInvites.firstNameInput).type('TestUserFirstName');
  cy.get(selectors.newUserInvites.lastNameInput).type('TestUserLastName');
  cy.get(selectors.newUserInvites.emailInput).type('penemail@mailsac.com');
  cy.get(selectors.newUserInvites.rolesSelectorDropdown).click({force: true});
  cy.get(selectors.newUserInvites.rolesSelectorBox).should('exist');
  cy.get(selectors.newUserInvites.rolesSelectorBox).find('div').contains('EDX School Account Manager').click();
  cy.get(selectors.newUserInvites.sendInviteButton).click();
  cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'Success! The request is being processed.');
};

function testGeneratingActivationCode() {
  cy.intercept(Cypress.env("interceptors").activation_code).as(
    "activationCodeUpdate"
  );

  navigateToAccessSchoolUsers();
  cy.wait("@activationCodeUpdate");

  cy.get(selectors.newUserInvites.primaryActivationCode)
    .invoke("text")
    .as("initialCode");
  cy.get("@initialCode").then((initialCode) => {
    cy.get(selectors.newUserInvites.toggleGenerateNewCode).click();
    cy.get(selectors.newUserInvites.generateNewCode).click();

    cy.wait("@activationCodeUpdate").then(({ response }) => {
      expect(response?.body.activationCode).not.null;
      expect(response?.body.activationCode).not.eq(initialCode);
    });

    cy.get(selectors.newUserInvites.primaryActivationCode)
      .invoke("text")
      .then((newCode) => {
        cy.get(selectors.snackbar.mainSnackBar).should(
          "include.text",
          `The new Primary Activation Code is ${newCode}. Close`
        );
        expect(initialCode).not.eq(newCode);
      });
  });
};

function navigateToNewUserInvites() {
  cy.visit('/');
  cy.get(selectors.dashboard.title).should('exist').contains('Dashboard | EDX Automation Testing School');
  cy.get(selectors.hamburgerMenu.hamburgerMenuButton).click();
  cy.get(selectors.hamburgerMenu.administrationMenuOption).click();
  cy.get(selectors.hamburgerMenu.schoolUserManagementOption).click();
  cy.get(selectors.newUserInvites.newUserButton).click();
}
describe('Access School Users Page', () => {
  context('As a school user', () => {
    before(() => {
      cy.task<InstituteOptions, AppSetupData>('dataLoad', {
        schoolOptions: { schoolStatus: 'Opening', withPrimaryActivationCode: true }
      }).then(() => {
          cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', {schoolCodes: ['99998']});
        });
    });
    after(() => {
      cy.logout()
    });
    beforeEach(() => cy.login());

    it('Phase 1: Loads school details and checks if all fields are invalid', () => {
      navigateToNewUserInvites();
      cy.get(selectors.newUserInvites.firstNameInput).invoke('val').should('be.empty');
      cy.get(selectors.newUserInvites.lastNameInput).invoke('val').should('be.empty');
      cy.get(selectors.newUserInvites.emailInput).invoke('val').should('be.empty');
      cy.get(selectors.newUserInvites.rolesSelectorDropdown).parent().should('be.not.empty');
      cy.get(selectors.newUserInvites.sendInviteButton).should('be.disabled');
    });

    it('Phase 2: Ensure email field does not accept bogus input', () => {
      navigateToNewUserInvites();
      cy.get(selectors.newUserInvites.firstNameInput).clear().type('TESTFIRSTNAME');
      cy.get(selectors.newUserInvites.lastNameInput).clear().type('TESTLASTNAME');
      cy.get(selectors.newUserInvites.emailInput).clear().type('notAnEmail');
      cy.get(selectors.newUserInvites.sendInviteButton).should('be.disabled');
      cy.get(selectors.newUserInvites.emailInput).clear();
    });

    it('Phase 3: Loads school details and checks if all fields are valid', () => {
      navigateToNewUserInvites();
      cy.get(selectors.newUserInvites.firstNameInput).clear().type('TESTFIRSTNAME');
      cy.get(selectors.newUserInvites.lastNameInput).clear().type('TESTLASTNAME');
      cy.get(selectors.newUserInvites.emailInput).clear().type('validEmail@bc.gov.ca');
      cy.get(selectors.newUserInvites.rolesSelectorDropdown).click({force: true});
      cy.get('.v-overlay').find(selectors.dropdown.listItem).contains('Secure Messaging').click();
      cy.get(selectors.newUserInvites.sendInviteButton).should('be.enabled');
    });

    it('Loads school details and checks field validation', () => {
      navigateToNewUserInvites();
      cy.get(selectors.newUserInvites.firstNameInput).type("Richard");
      cy.get(selectors.newUserInvites.lastNameInput).type("Stallman");
      cy.get(selectors.newUserInvites.emailInput).type("rms@gov.bc.ca");
      cy.get(selectors.newUserInvites.rolesSelectorDropdown).click({force: true});
      cy.get('.v-overlay').find(selectors.dropdown.listItem).contains('Secure Messaging').click();
      cy.get(selectors.newUserInvites.sendInviteButton).click();
      cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'Success! The request is being processed.');
    });

    it('can generate a primary activation code', () => {
      cy.intercept(Cypress.env("interceptors").activation_code).as("activationCodeUpdate");
      cy.visit("/schoolAccess");
      navigateToAccessSchoolUsers();
      cy.wait("@activationCodeUpdate");

      cy.get(selectors.newUserInvites.primaryActivationCode).invoke("text").as("initialCode");
      cy.get("@initialCode").then((initialCode) => {
        cy.get(selectors.newUserInvites.toggleGenerateNewCode).click();
        cy.get(selectors.newUserInvites.generateNewCode).click();

        cy.wait("@activationCodeUpdate").then(({ response }) => {
          expect(response?.body.activationCode).not.null;
          expect(response?.body.activationCode).not.eq(initialCode);
        });

        cy.get(selectors.newUserInvites.primaryActivationCode)
          .invoke("text")
          .then((newCode) => {
            cy.get(selectors.snackbar.mainSnackBar).should(
              "include.text",
              `The new Primary Activation Code is ${newCode}. Close`
            );
            expect(initialCode).not.eq(newCode);
          });
      });
    });
  });

  context('As an EDX district admin', () => {
    before(() => {
      cy.task('dataLoad').then(() => {
        cy.task<DistrictUserOptions, EdxUserEntity>('setup-districtUser', {
          districtRoles: ['EDX_DISTRICT_ADMIN'],
          districtCodes: ['998']
        });
      });
    });
    after(() => cy.logout());
    beforeEach(() => cy.login());

    context('with an opening school', () => {
      before(() => cy.task('recreate-school', { schoolStatus: 'Opening' }));
      it('can add a user to the opening school', testSendingNewUserInvites);
      it('can generate a primary activation code', testGeneratingActivationCode);
    });

    context('with an open school', () => {
      before(() => cy.task('recreate-school', { schoolStatus: 'Open' }));
      it('can add a user to the open school', testSendingNewUserInvites);
      it('can generate a primary activation code', testGeneratingActivationCode);
    });

    context('with a closing school', () => {
      before(() => cy.task('recreate-school', { schoolStatus: 'Closing' }));
      it('can add a user to the closing school', testSendingNewUserInvites);
      it('can generate a primary activation code', testGeneratingActivationCode);
    });

    context('with a temporary user', () => {
      let tempUserId = '';
      let tempFirstName = '';

      before(() => {
        cy.task('recreate-school', { schoolStatus: 'Open' });
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', {
          digitalId: crypto.randomUUID(),
          schoolCodes: ['99998']
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
        navigateToAccessSchoolUsers();
        cy.get('@tempUserId').then(uid => {
          cy.get(`#edxUser-${uid}`).should('exist');
          cy.get(`#user-edit-button-${uid}`).click();
          cy.get(`#access-user-roles-${uid}`).should('exist').within(() => {
            cy.get('div[value="EDX_SCHOOL_ADMIN"]').click();
            cy.get('div[value="STUDENT_DATA_COLLECTION"]').click();
            cy.get('div[value="SECURE_EXCHANGE_SCHOOL"]').click();
            cy.get('div[value="EDX_EDIT_SCHOOL"]').click();
          });
          cy.get('@tempUserFirstName').then(fname => {
            cy.get(selectors.accessUsersPage.accessUserFeedback)
              .should('include.text', `Please select at least one role for ${fname}`);
          });
          cy.get(`#user-save-action-button-${uid}`).should('be.disabled');
        });
      });

      it('can cancel the edit user mode', () => {
        navigateToAccessSchoolUsers();
        cy.get('@tempUserId').then(uid => {
          cy.get(`#user-edit-button-${uid}`).click();
          cy.get(`#user-cancel-edit-button-${uid}`).should('exist').click();
          cy.get(`#access-user-roles-${uid}`).should('not.exist');
        });
      });

      it('can update the user\'s role', () => {
        navigateToAccessSchoolUsers();
        cy.get('@tempUserId').then(uid => {
          cy.get(`#user-edit-button-${uid}`).click();
          cy.get(`#access-user-roles-${uid}`).should('exist').within(() => {
            cy.get('div[value="EDX_SCHOOL_ADMIN"]').click().click();
          });
          cy.get(`#user-save-action-button-${uid}`).should('not.be.disabled').click();
          cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'User has been updated. Close');
          cy.get(`#access-user-roles-${uid}`).should('not.exist');
          cy.get(`#user-edit-button-${uid}`).click();
          cy.get(`#access-user-roles-${uid}`).should('exist').within(() => {
            cy.get('div[value="EDX_SCHOOL_ADMIN"] input').should('be.checked');
            cy.get('div[value="STUDENT_DATA_COLLECTION"] input').should('be.checked');
            cy.get('div[value="SECURE_EXCHANGE_SCHOOL"] input').should('be.checked');
            });
          });
        });

      it('can cancel relinking a user', () => {
        navigateToAccessSchoolUsers();
        cy.get('@tempUserId').then(uid => {
          cy.get(`#user-relink-button-${uid}`).click();
          cy.get(`#userRelinkWarningText-${uid}`).should('exist')
            .should('include.text', 'Are you sure you want to re-link this account?');
          cy.get(`#user-cancel-relink-button-${uid}`).should('exist').click();
          cy.get(`#userRelinkWarningText-${uid}`).should('not.exist');
        });
      })

      it('can relink a user', () => {
        navigateToAccessSchoolUsers();
        cy.get('@tempUserId').then(uid => {
          cy.get(`#user-relink-button-${uid}`).click();
          cy.get(`#userRelinkWarningText-${uid}`).should('exist')
            .should('include.text', 'Are you sure you want to re-link this account?');
          cy.get(`#user-relink-action-button-${uid}`).should('exist').click();
          cy.get(selectors.snackbar.mainSnackBar)
            .should('contain', 'User has been removed, email sent with instructions to re-link. Close');
        });
      });

    });

    context('temporary user to be deleted', () => {
      let tempUserId = '';
      let tempFirstName = '';

      before(() => {
        cy.task('recreate-school', { schoolStatus: 'Open' });

        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser',
            { digitalId: crypto.randomUUID(),
              schoolCodes: ['99998']
        }).then((user: EdxUserEntity) => {
          tempUserId = user.edxUserID;
          tempFirstName = user.firstName;
        });

        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', {
          digitalId: crypto.randomUUID(),
          schoolCodes: ['99998']
        }).then((user: EdxUserEntity) => {
          tempUserId = user.edxUserID;
          tempFirstName = user.firstName;
        });
      });

      beforeEach(() => {
        cy.wrap(tempUserId).as('tempUserId');
        cy.wrap(tempFirstName).as('tempUserFirstName');
      });

      after(() => {
        cy.get('@tempUserId').then(uid => cy.task('teardown-edxUser', uid));
        cy.logout();
      });

      it('can find delete option and cancel delete', () => {
        navigateToAccessSchoolUsers();
        cy.get('@tempUserId').then(uid => {
          cy.get(`#user-remove-button-${uid}`).click();
          cy.get(`#user-cancel-remove-button-${uid}`).click();
        });
      });

      it('can find delete option and clicks delete', () => {
        navigateToAccessSchoolUsers();
        cy.get('@tempUserId').then(uid => {
          cy.get(`#user-remove-button-${uid}`).click();
          cy.get(`#user-remove-action-button-${uid}`).click();
          cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'User has been removed. Close');
        });
      });

    });
  });

  context('As an EDX district admin, with a school that has no primary activation generated', () => {
    before(() => {
      cy.task<InstituteOptions, AppSetupData>('dataLoad', { schoolOptions: {
        schoolStatus: 'Open',
        withPrimaryActivationCode: false
      }}).then(() => {
        cy.task<DistrictUserOptions, EdxUserEntity>('setup-districtUser', {
          districtRoles: ['EDX_DISTRICT_ADMIN'],
          districtCodes: ['998']
        });
      });
    });
    after(() => cy.logout());
    beforeEach(() => cy.login());

    it('school should not have primary activation code', () => {
      navigateToAccessSchoolUsers();
      cy.get(selectors.newUserInvites.primaryActivationCode).contains("Code Not Found");
    });

    it('cannot send invite if no primary activation code present', () => {
      navigateToAccessSchoolUsers();
      cy.get(selectors.newUserInvites.newUserButton).should("be.disabled");
      cy.get(selectors.newUserInvites.noActivationCodeBanner)
        .contains("Before adding users, a Primary Activation Code must be generated.");
    });

  });
});

import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import { InstituteOptions } from 'tests-e2e/cypress/services/institute-api-service';

function navigateToAccessSchoolUsers() {
  cy.visit('/schoolAccess', {timeout: 6000});
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
  cy.get(selectors.newUserInvites.rolesSelectorBox).find('div').contains('EDX School Administrator').click();
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

describe('Access School Users Page', () => {
  context('As a school user', () => {
    before(() => {
      cy.task<InstituteOptions, AppSetupData>('dataLoad', {
        schoolOptions: { schoolStatus: 'Opening', withPrimaryActivationCode: true }
      })
        .then(() => {
          cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', {schoolCodes: ['99998']});
        });
    });
    after(() => cy.logout());
    beforeEach(() => cy.login());

    it('Loads school details and checks field validation', () => {
      cy.visit('/', {timeout: 6000});
      cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing School');
      cy.get(selectors.hamburgerMenu.hamburgerMenuButton).click();
      cy.get(selectors.hamburgerMenu.schoolUserManagementOption).click();
      cy.get(selectors.newUserInvites.newUserButton).click();
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

    it('can generate a primary activation code', () => {
      cy.intercept(Cypress.env("interceptors").activation_code).as("activationCodeUpdate");
      cy.visit("/schoolAccess");
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
      cy.get(selectors.accessUsersPage.manageSchoolButton).click();
      cy.get(selectors.newUserInvites.primaryActivationCode).contains("Code Not Found");
    });

    it('cannot send invite if no primary activation code present', () => {
      navigateToAccessSchoolUsers();
      cy.get(selectors.accessUsersPage.manageSchoolButton).click();
      cy.get(selectors.newUserInvites.newUserButton).should("be.disabled");
      cy.get(selectors.newUserInvites.noActivationCodeBanner)
        .contains("Before adding users, a Primary Activation Code must be generated.");
    });

  });
});

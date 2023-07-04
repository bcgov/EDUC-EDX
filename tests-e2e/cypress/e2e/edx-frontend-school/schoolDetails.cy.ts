import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import { vInputParentOf } from 'tests-e2e/cypress/support/utils';

describe('School Details Interface Test', () => {
  context('As an EDX school user', () => {
    before(() => {
      cy.task<AppSetupData>('dataLoad').then(() => {
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', { schoolCodes: ['99998'] });
      });
    })
    beforeEach(() => cy.login());
    after(() => cy.logout());

    it('can load the details page and validate the website url field', () => {
      cy.visit('/')
      cy.get(selectors.dashboard.title).should("be.visible").contains('Dashboard | EDX Automation Testing School');
      cy.get(selectors.dashboard.schoolDetailsCard).click();
      cy.get(selectors.schoolDetails.schoolDisplayNameTitle).should("be.visible").invoke("text").as("schoolName");
      cy.get("@schoolName").then(() => {
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

    it('can view legacy safe name', () => {
      cy.visit('/')
      cy.get(selectors.dashboard.title).should("be.visible").contains('Dashboard | EDX Automation Testing School');
      cy.get(selectors.dashboard.schoolDetailsCard).click();
      cy.get(selectors.schoolDetails.schoolDisplayNameTitle).should("be.visible").invoke("text").as("schoolName");
      cy.get("@schoolName").then(() => {
        cy.get(selectors.schoolDetails.schoolNameNoSpecialChars).should('exist');
        cy.get(selectors.schoolDetails.schoolNameNoSpecialChars).contains('Legacy Safe Name');
      })
    });

    it('can edit grades offered if the school is not an independent or an independent first nations school', () => {
      cy.visit('/')
      cy.get(selectors.dashboard.title).should("be.visible").contains('Dashboard | EDX Automation Testing School');
      cy.get(selectors.dashboard.schoolDetailsCard).click();

      cy.get(selectors.schoolDetails.schoolDisplayNameTitle).should("be.visible").invoke("text").as("schoolName");
      cy.get("@schoolName").then(() => {
        cy.get(selectors.schoolDetails.editButton).click();

        cy.get(selectors.schoolDetails.schoolGradesDropdown).should('exist').then(() => {
          cy.get(selectors.schoolDetails.schoolGradesDropdown).parent().click();
          cy.get(selectors.dropdown.listItem).contains('Grade 1').click();
          cy.get(selectors.schoolDetails.saveButton).click();
          cy.get(selectors.schoolDetails.resolveButton).click();

          cy.get(selectors.schoolDetails.schoolGradesValue).should("be.visible").should("contain", "1");
        });
      })
    });

    context('with an independent school', () => {
      before(() => cy.task('recreate-school', { schoolStatus: 'Open', isIndependentSchool: true }));
      it('cannot edit grades offered if the school is an independent school', () => {
        cy.visit('/')
        cy.get(selectors.dashboard.title).should("be.visible").contains('Dashboard | EDX Automation Testing School');
        cy.get(selectors.dashboard.schoolDetailsCard).click();
        cy.get(selectors.schoolDetails.schoolDisplayNameTitle).should("be.visible").invoke("text").as("schoolName");
        cy.get("@schoolName").then(() => {
          cy.get(selectors.schoolDetails.editButton).click();
          cy.get(selectors.schoolDetails.schoolGradesDropdown).should('not.exist');
        });
      });

      it('can edit school fields', () => {
        cy.visit('/');
        cy.get(selectors.dashboard.schoolDetailsCard).click();
        cy.get(selectors.schoolDetails.editButton).click();
        cy.get(selectors.schoolDetails.schoolDetailsEmail).clear().type('newemail@gov.bc.ca');
        cy.get(selectors.schoolDetails.schoolDetailsPhoneNumber).clear().type('1234567890');
        cy.get(selectors.schoolDetails.schoolDetailsNlc).parent().click();
        cy.get(selectors.dropdown.listItem).contains('Seniors').click();
        cy.get(selectors.schoolDetails.schoolDetailsWebsite).clear().type('https://saulgoodman.com');
        cy.get(selectors.schoolDetails.editMailingAddressProvince).parent().click();
        cy.get(selectors.dropdown.listItem).contains('Yukon').click();
        cy.get(selectors.schoolDetails.editMailingAddressLine1).clear().type('1234 Main St');
        cy.get(selectors.schoolDetails.editAddressMailCity).clear().type('Victoria');
        cy.get(selectors.schoolDetails.editAddressPostalCode).clear().type('V8P5J2');
        cy.get(selectors.schoolDetails.editSaveButton).click();
        cy.get(selectors.schoolDetails.editPopupConfirmButton).click();
        cy.get(selectors.snackbar.mainSnackBar).should('contain.text', 'Success! The school details have been updated. Close');
      });
    });

  });

  context('As an EDX district admin', () => {
    before(() => {
      cy.task<AppSetupData>('dataLoad').then(() => {
        cy.task('setup-districtUser', { districtRoles: ['EDX_DISTRICT_ADMIN'], districtCodes: ['998'] });
      });
    });
    beforeEach(() => cy.login());
    after(() => cy.logout());

    it('can view legacy safe name', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.title).should("be.visible").contains('Dashboard | EDX Automation Testing District');
      cy.get(selectors.dashboard.districtUserSchoolContactsCard).click();
      cy.get(selectors.dashboard.title).should("be.visible").contains('Schools | EDX Automation Testing');
      cy.get(selectors.schoolList.schoolRow).should("be.visible").click();

      cy.get(selectors.schoolDetails.schoolDisplayNameTitle).should("be.visible").invoke("text").as("schoolName");
      cy.get("@schoolName").then(() => {
        cy.get(selectors.schoolDetails.schoolNameNoSpecialChars).should('exist');
        cy.get(selectors.schoolDetails.schoolNameNoSpecialChars).contains('Legacy Safe Name');
      });
    });

  });
});

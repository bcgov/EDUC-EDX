import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import { vInputParentOf } from 'tests-e2e/cypress/support/utils';

describe('District Details Interface Test', () => {
  context('As an EDX district admin', () => {

    beforeEach(() => cy.login());
    after(() => cy.logout());

    it('can load district details and checks field validation', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing District');
      cy.get(selectors.dashboard.districtDetailsCard).click();
      cy.get(selectors.districtDetails.editDistrictDetailsButton).click();

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


    it('can edit district details', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.districtDetailsCard).click();
      cy.get(selectors.districtDetails.editDistrictDetailsButton).click();
      cy.get(selectors.districtDetails.editDistrictPhone).clear().type('333-777-5555');
      cy.get(selectors.districtDetails.editDistrictWorkPhone).clear().type('111-222-3333');
      cy.get(selectors.districtDetails.editDistrictEmail).clear().type('automation@testing.com');
      cy.get(selectors.districtDetails.editMailingAddressLine1).clear().type('1234 Main St');
      cy.get(selectors.districtDetails.editAddressMailCity).clear().type('Victoria');
      cy.get(selectors.districtDetails.editAddressPostalCode).clear().type('V8P5J2');
      cy.get(selectors.districtDetails.editMailingAddressProvince).parent().click();
      cy.get(selectors.dropdown.listItem).contains('Yukon').click();
      cy.get(selectors.districtDetails.editMailingAddressCountry).parent().click();
      cy.get(selectors.dropdown.listItem).contains('Canada').click();
      cy.get(selectors.districtDetails.editSaveButton).click();
      cy.get(selectors.districtDetails.editPopupConfirmButton).click();
      cy.get(selectors.snackbar.mainSnackBar).should('contain.text', 'Success! The district details have been updated. Close');

    });


    it('checks if the changes in edit are correct', () => {
      cy.visit('/districtDetails');
      cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing District');
      cy.get(selectors.dashboard.districtDetailsCard).click();
      cy.get(selectors.dashboard.title).contains('District Details | EDX Automation Testing District');
      cy.get(selectors.districtDetails.editDistrictDetailsButton).click();
      cy.get(selectors.districtDetails.editDistrictPhone).should('have.value', '3337775555');
      cy.get(selectors.districtDetails.editDistrictWorkPhone).should('have.value', '1112223333');
      cy.get(selectors.districtDetails.editDistrictEmail).should('have.value','automation@testing.com');
      cy.get(selectors.districtDetails.editMailingAddressLine1).should('have.value','1234 Main St');
      cy.get(selectors.districtDetails.editAddressMailCity).should('have.value','Victoria');
      cy.get(selectors.districtDetails.editAddressPostalCode).should('have.value','V8P5J2');
      cy.get(selectors.districtDetails.editMailingAddressProvince).should('have.value','YT');
      cy.get(selectors.districtDetails.editMailingAddressCountry).should('have.value','CA');
      cy.get(selectors.districtDetails.editSaveButton).click();
      cy.get(selectors.districtDetails.editPopupReturnButton).click();
    });
  });
});

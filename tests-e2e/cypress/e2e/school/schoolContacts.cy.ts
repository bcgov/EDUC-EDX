import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import {DateTimeFormatter, LocalDate} from '@js-joda/core';

function navigateToSchoolContactsSchoolUser() {
  cy.intercept(Cypress.env('interceptors').school_details_by_id).as('schoolDetails');
  cy.intercept(Cypress.env('interceptors').schools).as('schools');
  cy.intercept(Cypress.env('interceptors').contact_types).as('contactTypes');

  cy.visit('/');
  cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing School');
  cy.get(selectors.dashboard.schoolContactsCard).click();
  cy.wait('@schoolDetails');
  cy.wait('@schools');
  cy.wait('@contactTypes');

  cy.get(selectors.schoolContacts.activeTab).contains('Contacts');
}

function navigateToSchoolContactsDistrictUser(schoolId: string) {
  cy.intercept(Cypress.env('interceptors').school_details_by_id).as('schoolDetails');
  cy.visit('/');
  cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing District');
  cy.visit('/school/' + schoolId + '/details');
  cy.wait('@schoolDetails');
  cy.get('button').contains('Contacts').click();
}

describe('School Contacts Page', () => {
  context('As an EDX school user', () => {
    before(() => {
      cy.task<AppSetupData>('dataLoad').then(() => {
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', { schoolRoles: ['EDX_EDIT_SCHOOL'], schoolCodes: ['99998'] });
      });
    });
    beforeEach(() => cy.login());
    after(() => cy.logout());

    it('Check new contact page has current effective date', () => {
      navigateToSchoolContactsSchoolUser();
      cy.get(selectors.schoolContacts.newContactButton).click();
      cy.get(selectors.schoolContacts.newContactEffectiveDateTextField)
        .find('input[type="text"]')
        .invoke('val')
        .then((value) => {
          expect(value).to.contains(LocalDate.now().format(DateTimeFormatter.ofPattern('yyyy/MM/dd')).toString());
        });
    });

    it('can create a new contact', () => {
      navigateToSchoolContactsSchoolUser();
      cy.get(selectors.schoolContacts.newContactButton).click();
      cy.get(selectors.schoolContacts.newContactTypeDropdown).parent().click();
      cy.get(selectors.dropdown.listItem).contains('Vice Principal').click();
      cy.get(selectors.schoolContacts.newContactFirstNameInput).type('AT Vice Principal First Name');
      cy.get(selectors.schoolContacts.newContactLastNameInput).type('AT Vice Principal Last Name');
      cy.get(selectors.schoolContacts.newContactEmailInput).type('vpemail@test.com');
      cy.get(selectors.schoolContacts.newContactPhoneNumberInput).type('1234567890');
      cy.get(selectors.schoolContacts.newContactPostBtn).click();
      cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'Success! The school contact has been created. Close');
    });

    it('can edit school contact details; cancels', () => {
      navigateToSchoolContactsSchoolUser();
      cy.get(selectors.schoolContacts.editContactButton).click();
      cy.get(selectors.schoolContacts.editContactLastNameInput).clear().type('AT Vice Principal Last Name');
      cy.get(selectors.schoolContacts.editContactEmailInput).clear().type('vpemail@test.com');
      cy.get(selectors.schoolContacts.editContactPhoneNumberInput).clear().type('1234567890');
      cy.get(selectors.schoolContacts.cancelContactButton).click();
    });

    it('can edit school contact details; saves', () => {
      navigateToSchoolContactsSchoolUser();
      cy.get(selectors.schoolContacts.editContactButton).click();
      cy.get(selectors.schoolContacts.editContactFirstNameInput).clear().type('AT Vice Principal First Name Edit');
      cy.get(selectors.schoolContacts.editContactEmailInput).clear().type('newvpemail@test.com');
      cy.get(selectors.schoolContacts.editContactPhoneNumberInput).clear().type('7779998888');
      cy.get(selectors.schoolContacts.editContactSaveButton).click();
      cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'Success! The school contact has been updated. Close');
    });

    it('Can remove contact', () => {
      navigateToSchoolContactsSchoolUser();
      cy.get(selectors.schoolContacts.deleteContactButton).should('exist');
      cy.get(selectors.schoolContacts.deleteContactButton).click();
      cy.on('window:confirm', (str) => { expect(str).to.equal('Please Confirm, Are you sure you want to remove this contact?');});
      cy.get(selectors.schoolContacts.resolveButton).click();
      cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'School contact removed successfully');
    });
  });

  context('As an EDX district admin', () => {
    before(() => {
      cy.task<AppSetupData>('dataLoad').then((appSetupDataResponse) => {
        Cypress.env('schoolId', appSetupDataResponse?.schools[0].schoolId);
        cy.task('setup-districtUser', { districtRoles: ['EDX_EDIT_DISTRICT'], districtCodes: ['998'] });
      });
    });
    beforeEach(() => cy.login());
    after(() => cy.logout());

    it('Check new school contact page has current effective date', () => {
      navigateToSchoolContactsDistrictUser(Cypress.env('schoolId'));
      cy.get(selectors.schoolContacts.newContactButton).click();
      cy.get(selectors.schoolContacts.newContactEffectiveDateTextField)
        .find('input[type="text"]')
        .invoke('val')
        .then((value) => {
          expect(value).to.contains(LocalDate.now().format(DateTimeFormatter.ofPattern('yyyy/MM/dd')).toString());
        });
    });

    it('can create a new school contact - vice principal', () => {
      navigateToSchoolContactsDistrictUser(Cypress.env('schoolId'));
      cy.get(selectors.schoolContacts.newContactButton).click();
      cy.get(selectors.schoolContacts.newContactTypeDropdown).parent().click();
      cy.get(selectors.dropdown.listItem).contains('Vice Principal').click();
      cy.get(selectors.schoolContacts.newContactFirstNameInput).type('AT Vice Principal First Name');
      cy.get(selectors.schoolContacts.newContactLastNameInput).type('AT Vice Principal Last Name');
      cy.get(selectors.schoolContacts.newContactEmailInput).type('vpemail@test.com');
      cy.get(selectors.schoolContacts.newContactPhoneNumberInput).type('1234567890');
      cy.get(selectors.schoolContacts.newContactPostBtn).click();
      cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'Success! The school contact has been created. Close');
    });

    it('can edit school contact details; cancels', () => {
      navigateToSchoolContactsDistrictUser(Cypress.env('schoolId'));
      cy.get(selectors.schoolContacts.editContactButton).click();
      cy.get(selectors.schoolContacts.editContactLastNameInput).clear().type('AT Vice Principal Last Name');
      cy.get(selectors.schoolContacts.editContactEmailInput).clear().type('vpemail@test.com');
      cy.get(selectors.schoolContacts.editContactPhoneNumberInput).clear().type('1234567890');
      cy.get(selectors.schoolContacts.cancelContactButton).click();
    });

    it('can edit school contact details; saves', () => {
      navigateToSchoolContactsDistrictUser(Cypress.env('schoolId'));
      cy.get(selectors.schoolContacts.editContactButton).click();
      cy.get(selectors.schoolContacts.editContactFirstNameInput).clear().type('AT Vice Principal First Name Edit');
      cy.get(selectors.schoolContacts.editContactEmailInput).clear().type('newvpemail@test.com');
      cy.get(selectors.schoolContacts.editContactPhoneNumberInput).clear().type('7779998888');
      cy.get(selectors.schoolContacts.editContactSaveButton).click();
      cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'Success! The school contact has been updated. Close');
    });

    it('can delete a school contact; cancel', () => {
      navigateToSchoolContactsDistrictUser(Cypress.env('schoolId'));
      cy.get(selectors.schoolContacts.deleteContactButton).click();
      cy.get(selectors.schoolContacts.deleteCancelButton).click();
    });

    it('can delete a school contact; confirm', () => {
      navigateToSchoolContactsDistrictUser(Cypress.env('schoolId'));
      cy.get(selectors.schoolContacts.deleteContactButton).click();
      cy.get(selectors.schoolContacts.deleteConfirmButton).click();
      cy.get(selectors.snackbar.mainSnackBar).should('include.text','School contact removed successfully');
    });

    it('Can remove contact', () => {
      navigateToSchoolContactsDistrictUser(Cypress.env('schoolId'));
      cy.get(selectors.schoolContacts.deleteContactButton).should('exist');
      cy.get(selectors.schoolContacts.deleteContactButton).click();
      cy.on('window:confirm', (str) => {
        expect(str).to.equal('Please Confirm, Are you sure you want to remove this contact?');
      });
      cy.get(selectors.schoolContacts.resolveButton).click();
      cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'School contact removed successfully');
    });

  });
});

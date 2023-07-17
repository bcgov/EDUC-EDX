import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import {LocalDate} from "@js-joda/core";

function createDistrictContact(contactType: string, firstName: string, lastName: string, email: string, phoneNumber: string ) {
  cy.visit('/');
  cy.get(selectors.dashboard.districtContactsCard).click();
  cy.get(selectors.districtContacts.newContactButton).click();
  cy.get(selectors.districtContacts.newContactTypeDropdown).parent().click();
  cy.get(selectors.dropdown.listItem).contains(contactType).click();
  cy.get(selectors.districtContacts.newContactFirstNameInput).clear().type(firstName);
  cy.get(selectors.districtContacts.newContactLastNameInput).clear().type(lastName);
  cy.get(selectors.districtContacts.newContactEmailInput).clear().type(email);
  cy.get(selectors.districtContacts.newContactPhoneNumberInput).clear().type(phoneNumber);
  cy.get(selectors.districtContacts.newContactPostBtn).click({force:true});
  cy.get('form').submit();
}

describe('District Contacts Page', () => {
  context('As an EDX district admin', () => {
    beforeEach(() => cy.login());
    after(() => cy.logout());

    before(() => {
      cy.task<AppSetupData>('dataLoad').then(() => {
        cy.task('setup-districtUser', { districtRoles: ['EDX_DISTRICT_ADMIN'], districtCodes: ['998'] });
      });
    });

    it('creates new district contact', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.districtContactsCard).click();
      cy.get(selectors.districtContacts.newContactButton).click();
      cy.get(selectors.districtContacts.newContactTypeDropdown).parent().click();
      cy.get(selectors.dropdown.listItem).contains('Chairperson').click();
      cy.get(selectors.districtContacts.newContactLastNameInput).clear().type('AT Chairperson Lastname');
      cy.get(selectors.districtContacts.newContactEmailInput).clear().type('test@test.com');
      cy.get(selectors.districtContacts.newContactPhoneNumberInput).clear().type('1234567890');
      cy.get(selectors.districtContacts.newContactPostBtn).click({force:true});
      cy.get('form').submit();
    });

    it('should make new contacts with a current effective date', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing District');
      cy.get(selectors.dashboard.districtContactsCard).click();

      cy.get(selectors.dashboard.title).contains('District Contacts | EDX Automation Testing District');

      cy.get(selectors.districtContacts.newContactButton).click();
      cy.get(selectors.districtContacts.newContactEffectiveDateTextField).should(($input) => {
        const val = $input.val()
        expect(val).to.contains(LocalDate.now().toString());
      });
    });

    it('can edit contact details', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing District');
      cy.get(selectors.dashboard.districtContactsCard).click();
      cy.get(selectors.dashboard.title).contains('District Contacts | EDX Automation Testing District');
      cy.get(selectors.districtContacts.editDistrictContactButton).click();
      cy.get(selectors.districtContacts.editContactFirstNameInput).clear().type('Edited User');
      cy.get(selectors.districtContacts.editContactLastNameInput).clear().type('Lastname');
      cy.get(selectors.districtContacts.saveChangesToDistrictContactButton).click();
      cy.get(selectors.districtContacts.editContactFirstNameInput).should('have.value', 'Edited User');
    });

    it('can search for contacts', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.districtContactsCard).click();
      // cy.get(selectors.districtContacts.searchContactFirstNameInput).type('EDXAutomation');
      cy.get(selectors.districtContacts.searchContactLastNameInput).type('Lastname');
      cy.get(selectors.districtContacts.searchContactTypeDropdown).parent().click();
      // cy.get(selectors.dropdown.listItem).contains('Chairperson').click();
      cy.get(selectors.districtContacts.searchContactButton).click();

      // Checks the output card for the contact
      cy.get('[id^="districtContactCard-"]').each((element) => {
        cy.wrap(element).children().should('contain', 'Lastname');
      });


      // Clicks the clear button
      cy.get(selectors.districtContacts.filterContactClearButton).click();
      cy.get(selectors.districtContacts.searchContactFirstNameInput).should('be.empty');
      cy.get(selectors.districtContacts.searchContactLastNameInput).should('be.empty')
      cy.get(selectors.districtContacts.searchContactTypeDropdown).should('be.empty');

    });

    it('can delete contact; cancels', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.districtContactsCard).click();
      cy.get(selectors.districtContacts.deleteContactButton).click();
      cy.get(selectors.districtContacts.deleteCancelButton).click();
    });

    it('can delete contact; confirms', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.districtContactsCard).click();
      cy.get(selectors.districtContacts.deleteContactButton).click();
      cy.get(selectors.districtContacts.deleteConfirmButton).click();
      cy.get(selectors.snackbar.mainSnackBar).should('contain', 'District contact removed successfully Close');
    });

  });
});
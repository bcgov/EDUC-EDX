import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import {LocalDate} from "@js-joda/core";

before(() => {
  cy.task<AppSetupData>('dataLoad').then(() => {
    cy.task('setup-districtUser', { districtRoles: ['EDX_DISTRICT_ADMIN'], districtCodes: ['998'] });
  });
})

after(() => {
  cy.logout();
})

describe('District Contacts Page', () => {
  context('As an EDX district admin', () => {
    beforeEach(() => cy.login());

    it('should make new contacts with a current effective date', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.title, {timeout: 3000}).contains('Dashboard | EDX Automation Testing District');
      cy.get(selectors.dashboard.districtContactsCard).click();

      cy.get(selectors.dashboard.title, {timeout: 3000}).contains('District Contacts | EDX Automation Testing District');

      cy.get(selectors.districtContacts.newContactButton).click();
      cy.get(selectors.districtContacts.newContactEffectiveDateTextField).should(($input) => {
        const val = $input.val()
        expect(val).to.contains(LocalDate.now().toString());
      })
    });

    it('can edit contact details', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.title, {timeout: 3000}).contains('Dashboard | EDX Automation Testing District');
      cy.get(selectors.dashboard.districtContactsCard).click();
      cy.get(selectors.dashboard.title, {timeout: 3000}).contains('District Contacts | EDX Automation Testing District');
      cy.get(selectors.districtContacts.editDistrictContactButton).click();
      cy.get(selectors.districtContacts.editContactFirstNameInput).clear().type('Testing Edited User');
      cy.get(selectors.districtContacts.saveChangesToDistrictContactButton).click();
      cy.get(selectors.districtContacts.editContactFirstNameInput).should('have.value', 'Testing Edited User');
    })

    it('Adds input to the form', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.districtContactsCard).click();
      cy.get(selectors.districtContacts.newContactButton).click();
      cy.get(selectors.districtContacts.newContactTypeDropdown).parent().click();
      cy.get(selectors.dropdown.listItem).contains('Chairperson').click();
      cy.get(selectors.districtContacts.newContactLastNameInput).clear().type('AT Chairperson LastName');
      cy.get(selectors.districtContacts.newContactEmailInput).clear().type('test@test.com');
      cy.get(selectors.districtContacts.newContactPhoneNumberInput).clear().type('1234567890');
      cy.get(selectors.districtContacts.newContactPostBtn).click({force:true});
      cy.get('form').submit();
    });

  });
});

import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import {LocalDate} from "@js-joda/core";


describe('School Contacts Page', () => {
  context('As an EDX school user', () => {
    before(() => {
      cy.task<AppSetupData>('dataLoad').then(() => {
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', { schoolCodes: ['99998'] });
      });
    })
    beforeEach(() => cy.login());
    after(() => cy.logout());

    it('Check new contact page has current effective date', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing School');
      cy.get(selectors.dashboard.schoolContactsCard).click();
      cy.get(selectors.dashboard.title).contains('School Contacts | EDX Automation Testing School');
      cy.get(selectors.schoolContacts.newContactButton).click();
      cy.get(selectors.schoolContacts.newContactEffectiveDateTextField).should(($input) => {
        const val = $input.val()
        expect(val).to.contains(LocalDate.now().toString());
      })
    });

    it('Can remove contact', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing School');
      cy.get(selectors.dashboard.schoolContactsCard).click();
      cy.get(selectors.dashboard.title).contains('School Contacts | EDX Automation Testing School');

      cy.get(selectors.schoolContacts.deleteContactButton).should('exist');
      cy.get(selectors.schoolContacts.deleteContactButton).click();

      cy.on('window:confirm', (str) => {
        expect(str).to.equal('Please Confirm, Are you sure you want to remove this contact?');
      })
      cy.get(selectors.schoolContacts.resolveButton).click();
      cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'School contact removed successfully');
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

    it('Check new school contact page has current effective date', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing District');
      cy.get(selectors.dashboard.districtUserSchoolContactsCard).click();
      cy.get(selectors.dashboard.title).contains('Schools | EDX Automation Testing');
      cy.get(selectors.schoolList.viewFirstSchoolContactsButton).click();
      cy.get(selectors.dashboard.title).contains('School Contacts | EDX Automation Testing');
      cy.get(selectors.schoolContacts.newContactButton).click();
      cy.get(selectors.schoolContacts.newContactEffectiveDateTextField).should(($input) => {
        const val = $input.val()
        expect(val).to.contains(LocalDate.now().toString());
      });
    });

    it('Can remove contact', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing District');
      cy.get(selectors.dashboard.districtUserSchoolContactsCard).click();
      cy.get(selectors.dashboard.title).contains('Schools | EDX Automation Testing');

      cy.get(selectors.schoolList.viewFirstSchoolContactsButton).click();
      cy.get(selectors.dashboard.title).contains('School Contacts | EDX Automation Testing');

      cy.get(selectors.schoolContacts.deleteContactButton).should('exist');
      cy.get(selectors.schoolContacts.deleteContactButton).click();

      cy.on('window:confirm', (str) => {
        expect(str).to.equal('Please Confirm, Are you sure you want to remove this contact?');
      })
      cy.get(selectors.schoolContacts.resolveButton).click();
      cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'School contact removed successfully');
    });

    it('can create a new school contact - vice principal', () => {
      cy.visit('/schools');
      cy.get(selectors.dashboard.title).contains('Schools | EDX Automation Testing District');
      cy.get(selectors.schoolList.viewFirstSchoolContactsButton).click();
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

    it('can edit schoool contact details; cancels', () => {
      cy.visit('/schools');
      cy.get(selectors.schoolList.viewFirstSchoolContactsButton).click();
      cy.get(selectors.schoolContacts.editContactButton).click();
      cy.get(selectors.schoolContacts.editContactLastNameInput).clear().type('AT Vice Principal Last Name');
      cy.get(selectors.schoolContacts.editContactEmailInput).clear().type('vpemail@test.com');
      cy.get(selectors.schoolContacts.editContactPhoneNumberInput).clear().type('1234567890');
      cy.get(selectors.schoolContacts.cancelContactButton).click();
    });

    it('can edit schoool contact details; saves', () => {
      cy.visit('/schools');
      cy.get(selectors.schoolList.viewFirstSchoolContactsButton).click();
      cy.get(selectors.schoolContacts.editContactButton).click();
      cy.get(selectors.schoolContacts.editContactFirstNameInput).clear().type('AT Vice Principal First Name Edit');;
      cy.get(selectors.schoolContacts.editContactEmailInput).clear().type('newvpemail@test.com');
      cy.get(selectors.schoolContacts.editContactPhoneNumberInput).clear().type('7779998888');
      cy.get(selectors.schoolContacts.editContactSaveButton).click();
      cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'Success! The school contact has been updated. Close');
    });

    it('can delete a school contact; cancel', () => {
        cy.visit('/schools');
        cy.get(selectors.schoolList.viewFirstSchoolContactsButton).click();
        cy.get(selectors.schoolContacts.deleteContactButton).click();
        cy.get(selectors.schoolContacts.deleteCancelButton).click();
    });

    it('can delete a school contact; confirm', () => {
      cy.visit('/schools');
      cy.get(selectors.schoolList.viewFirstSchoolContactsButton).click();
      cy.get(selectors.schoolContacts.deleteContactButton).click();
      cy.get(selectors.schoolContacts.deleteConfirmButton).click();
      cy.get(selectors.snackbar.mainSnackBar).should('include.text','School contact removed successfully');
    });

  });
});

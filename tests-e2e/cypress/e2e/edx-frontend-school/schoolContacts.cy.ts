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
      cy.get(selectors.dashboard.title, {timeout: 60000}).contains('Dashboard | EDX Automation Testing School');
      cy.get(selectors.dashboard.schoolContactsCard).click();
      cy.get(selectors.dashboard.title, {timeout: 60000}).contains('School Contacts | EDX Automation Testing School');
      cy.get(selectors.schoolContacts.newContactButton).click();
      cy.get(selectors.schoolContacts.newContactEffectiveDateTextField).should(($input) => {
        const val = $input.val()
        expect(val).to.contains(LocalDate.now().toString());
      })
    });

    it('Can remove contact', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.title, {timeout: 60000}).contains('Dashboard | EDX Automation Testing School');
      cy.get(selectors.dashboard.schoolContactsCard).click();
      cy.get(selectors.dashboard.title, {timeout: 60000}).contains('School Contacts | EDX Automation Testing School');

      cy.get(selectors.schoolContacts.removeContactButton).should('exist');
      cy.get(selectors.schoolContacts.removeContactButton).click();

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
      cy.get(selectors.dashboard.title, {timeout: 60000}).contains('Dashboard | EDX Automation Testing District');
      cy.get(selectors.dashboard.districtUserSchoolContactsCard).click();
      cy.get(selectors.dashboard.title, {timeout: 10000}).contains('Schools | EDX Automation Testing');

      cy.get(selectors.schoolList.viewFirstSchoolContactsButton).click();
      cy.get(selectors.dashboard.title, {timeout: 10000}).contains('School Contacts | EDX Automation Testing');

      cy.get(selectors.schoolContacts.newContactButton).click();
      cy.get(selectors.schoolContacts.newContactEffectiveDateTextField).should(($input) => {
        const val = $input.val()
        expect(val).to.contains(LocalDate.now().toString());
      });
    });

    it('Can remove contact', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.title, {timeout: 60000}).contains('Dashboard | EDX Automation Testing District');
      cy.get(selectors.dashboard.districtUserSchoolContactsCard).click();
      cy.get(selectors.dashboard.title, {timeout: 10000}).contains('Schools | EDX Automation Testing');

      cy.get(selectors.schoolList.viewFirstSchoolContactsButton).click();
      cy.get(selectors.dashboard.title, {timeout: 10000}).contains('School Contacts | EDX Automation Testing');

      cy.get(selectors.schoolContacts.removeContactButton).should('exist');
      cy.get(selectors.schoolContacts.removeContactButton).click();

      cy.on('window:confirm', (str) => {
        expect(str).to.equal('Please Confirm, Are you sure you want to remove this contact?');
      })
      cy.get(selectors.schoolContacts.resolveButton).click();
      cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'School contact removed successfully');
    });
  });
});

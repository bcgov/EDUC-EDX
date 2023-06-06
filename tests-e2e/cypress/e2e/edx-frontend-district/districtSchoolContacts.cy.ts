import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import {LocalDate} from "@js-joda/core";

before(() => {
  cy.task<AppSetupData>('dataLoad').then(() => {
    cy.task('setup-districtUser', { districtRoles: ['EDX_DISTRICT_ADMIN'], districtCodes: ['998'] });
  });
})

after(() => {
  cy.visit(Cypress.env('url').base_url + '/logout');
})

describe('District School Contacts Interface Test', () => {
  it('Check new school contact page has current effective date', () => {
    cy.visit('/');
    cy.login();
    cy.get(selectors.dashboard.title, {timeout: 60000}).contains('Dashboard | EDX Automation Testing District');
    cy.get(selectors.dashboard.districtUserSchoolContactsCard).click();
    cy.get(selectors.dashboard.title, {timeout: 10000}).contains('Schools | EDX Automation Testing');

    cy.get(selectors.schoolList.viewFirstSchoolContactsButton).click();
    cy.get(selectors.dashboard.title, {timeout: 10000}).contains('School Contacts | EDX Automation Testing');

    cy.get(selectors.schoolContacts.newContactButton).click();
    cy.get(selectors.schoolContacts.newContactEffectiveDateTextField).should(($input) => {
      const val = $input.val()
      expect(val).to.contains(LocalDate.now().toString());
    })
  });
});

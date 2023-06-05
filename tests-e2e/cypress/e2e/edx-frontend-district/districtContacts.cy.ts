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

describe('District Contacts Interface Test', () => {
  it('Check new contact page has current effective date', () => {
    cy.visit('/');
    cy.login();
    cy.get(selectors.dashboard.title, {timeout: 60000}).contains('Dashboard | EDX Automation Testing District');
    cy.get(selectors.dashboard.districtContactsCard).click();

    cy.get(selectors.dashboard.title, {timeout: 60000}).contains('District Contacts | EDX Automation Testing District');

    cy.get(selectors.districtContacts.newContactButton).click();
    cy.get(selectors.districtContacts.newContactEffectiveDateTextField).should(($input) => {
      const val = $input.val()
      expect(val).to.contains(LocalDate.now().toString());
    })
  });
});

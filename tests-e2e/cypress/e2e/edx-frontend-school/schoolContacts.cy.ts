import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import {LocalDate} from "@js-joda/core";

before(() => {
  cy.task<AppSetupData>('dataLoad').then(() => {
    cy.task('setup-schoolUser', ['99998']);
  });
})

after(() => {
  cy.logout();
})

describe('School Contacts Interface Test', () => {
  beforeEach(() => cy.login());
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
});

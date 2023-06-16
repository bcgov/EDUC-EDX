import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';


before(() => {
  cy.task<AppSetupData>('dataLoad').then(() => {
    cy.task('setup-districtUser', { districtRoles: ['EDX_DISTRICT_ADMIN'], districtCodes: ['998'] });
  });
})


after(() => {
  cy.logout();
})


describe('Edit Button Test', () => {
  beforeEach(() => cy.login());
  it('Edits Contact Details', () => {
    cy.visit('/');
    cy.get(selectors.dashboard.title, {timeout: 3000}).contains('Dashboard | EDX Automation Testing District');
    cy.get(selectors.dashboard.districtContactsCard).click();
    cy.get(selectors.dashboard.title, {timeout: 3000}).contains('District Contacts | EDX Automation Testing District');
    cy.get(selectors.districtContacts.editDistrictContactButton).click();
    cy.get(selectors.districtContacts.editContactFirstNameInput).clear().type('Testing Edited User');
    cy.get(selectors.districtContacts.saveChangesToDistrictContactButton).click();
    cy.get(selectors.districtContacts.editContactFirstNameInput).should('have.value', 'Testing Edited User');
  })
})
import selectors from "../../support/selectors";

before(() => {
  cy.task('dataLoad').then((res: any) => {
    cy.task('setup-districtUser', {districtRoles: ['EDX_DISTRICT_ADMIN'], districtCodes: ['998']});
  });
})

after(() => {
  cy.visit(Cypress.env('url').base_url + '/logout')
})

describe('District new secure message test', () => {
  it('Load dashboard & access secure message & create new message', () => {
    cy.visit('/');
    cy.login();
    cy.get(selectors.dashboard.title, {timeout: 60000}).contains('Dashboard | EDX Automation Testing School');
  })
})

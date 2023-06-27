import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import { vInputParentOf } from 'tests-e2e/cypress/support/utils';

describe('School Details Interface Test', () => {
  context('As an EDX school user', () => {
    before(() => {
      cy.task<AppSetupData>('dataLoad').then(() => {
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', { schoolCodes: ['99998'] });
      });
    })
    beforeEach(() => cy.login());
    after(() => cy.logout());

    it('can load the details page and validate the website url field', () => {
      cy.visit('/')
      cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing School');
      cy.get(selectors.dashboard.schoolDetailsCard).click();
      cy.get(selectors.schoolDetails.addWebsiteLink).click();

      const websiteField = () => cy.get(selectors.schoolDetails.schoolDetailsWebsite);
      const websiteWrapper = vInputParentOf(websiteField);
      const websiteErrorMessage = 'Website must be valid and secure (i.e., https)';

      websiteField().clear().type('http://www.nope.com');
      websiteWrapper().should('have.class', 'v-input--error');
      websiteWrapper().within(() =>
        cy.get('.v-messages__message').should('contain.text', websiteErrorMessage)
      );

      websiteField().clear().type('https://notawebsite');
      websiteWrapper().should('have.class', 'v-input--error');
      websiteWrapper().within(
        () => cy.get('.v-messages__message').should('contain.text', websiteErrorMessage)
      );

      websiteField().clear().type('https://saulgoodman.com');
      websiteWrapper().should('not.have.class', 'v-input--error');
      websiteWrapper().within(() => cy.get('.v-messags__message').should('not.exist'));
    });

    it('can view legacy safe name', () => {
      cy.visit('/')
      cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing School');
      cy.get(selectors.dashboard.schoolDetailsCard).click();

      cy.get(selectors.schoolDetails.schoolNameNoSpecialChars).should('exist');
      cy.get(selectors.schoolDetails.schoolNameNoSpecialChars).contains('Legacy Safe Name');
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

    it('can view legacy safe name', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing District');
      cy.get(selectors.dashboard.districtUserSchoolContactsCard).click();
      cy.get(selectors.dashboard.title).contains('Schools | EDX Automation Testing');

      cy.get(selectors.schoolDetails.schoolNameNoSpecialChars).should('exist');
      cy.get(selectors.schoolDetails.schoolNameNoSpecialChars).contains('Legacy Safe Name');
    });

  });
});

import {AppSetupData} from '../../../cypress.config';
import {SchoolCollection} from '../../services/sdc-collection-api-service';


describe('SDC School Collection - testing Upload School Level Data screen\'s summary or data', () => {
  context('Uploaded a file that has no errors or warnings', () => {
    before(() => {
      cy.logout();
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task<SdcSchoolCollection>('setup-collections', {
          school: res.school,
          loadWithStudentAndValidations: true,
          seedData: 'dataUploadSummaryNoErrors'
        }).then(response => {
          Cypress.env('schoolCollectionIdNoErrors', response?.sdcSchoolCollectionID);
        });
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', {schoolCodes: ['99998']});
      });
    });
    beforeEach(() => {
      cy.login();
    });
    it('there is an info banner and no error banner for students in error', () => {
      const id = Cypress.env('schoolCollectionIdNoErrors');
      navigateToUploadScreen(id);
      cy.get('[data-cy="headcount-info-banner"]').should('exist');
      cy.get('[data-cy="headcount-error-banner"]').should('not.exist');
    });
  });
  context('Uploaded a file that has errors', () => {
    before(() => {
      cy.logout();
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task<SdcSchoolCollection>('setup-collections', {
          school: res.school,
          loadWithStudentAndValidations: true,
          seedData: 'dataUploadSummaryErrors'
        }).then(response => {
          Cypress.env('schoolCollectionIdErrors', response?.sdcSchoolCollectionID);
        });
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', {schoolCodes: ['99998']});
      });
    });
    beforeEach(() => {
      cy.login();
    });
    it('there is an error banner for students in error', () => {
      const id = Cypress.env('schoolCollectionIdErrors');
      navigateToUploadScreen(id);
      cy.get('[data-cy="headcount-error-banner"]').should('exist');
    });
  });
});

function navigateToUploadScreen(id: SchoolCollection) {
  cy.intercept(Cypress.env('interceptors').headcounts).as('collection_students_pagination');
  cy.intercept(Cypress.env('interceptors').headcounts).as('headcounts');
  cy.visit('/open-collection-details/' + id);
  cy.wait('@collection_students_pagination');
  cy.wait('@headcounts');
}

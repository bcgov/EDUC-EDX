import {AppSetupData} from '../../../cypress.config';
import {SchoolCollection} from '../../services/sdc-collection-api-service';
import selectors from '../../support/selectors';


describe('SDC School Collection - testing Upload School Level Data screen\'s summary or data', () => {
  context('Uploaded a file that has no errors or warnings', () => {
    before(() => {
      cy.logout();
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task<SchoolCollection, SdcSchoolCollection>('setup-collections', {
          school: res.school,
          loadWithStudentAndValidations: true,
          seedData: 'dataUploadSummaryCareer'
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
      cy.get(selectors.sdcDocumentUploadStep.infoBanner).should('exist');
      cy.get(selectors.sdcDocumentUploadStep.errorBanner).should('not.exist');
    });
    it.only('there is an info banner and no error banner for students in error', () => {
      const id = Cypress.env('schoolCollectionIdNoErrors');
      navigateToUploadScreen(id);
      cy.intercept(Cypress.env('interceptors').headcounts).as('headcounts');
      cy.get(selectors.sdcDocumentUploadStep.careerTabButton).click();
      cy.wait('@headcounts');
      cy.get(`${selectors.sdcDocumentUploadStep.careerTab} .section-header`).last().find('td').last().should('be.visible');
      cy.get(`${selectors.sdcDocumentUploadStep.careerTab} .section-header`).each(($cell, index) => {
        if(index !== 4) {
          cy.wrap($cell).find('td').last().should('contain', '2');
        } else {
          cy.wrap($cell).find('td').last().should('contain', '8');
        }
      });
    });
  });
  context('Uploaded a file that has errors', () => {
    before(() => {
      cy.logout();
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task<SchoolCollection, SdcSchoolCollection>('setup-collections', {
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
      cy.get(selectors.sdcDocumentUploadStep.infoBanner).should('not.exist');
      cy.get(selectors.sdcDocumentUploadStep.errorBanner).should('exist');
    });
  });
});

function navigateToUploadScreen(id: SchoolCollection) {
  cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('collection_students_pagination');
  cy.intercept(Cypress.env('interceptors').headcounts).as('headcounts');
  cy.visit('/open-collection-details/' + id);
  cy.wait('@collection_students_pagination');
  cy.wait('@headcounts');
}

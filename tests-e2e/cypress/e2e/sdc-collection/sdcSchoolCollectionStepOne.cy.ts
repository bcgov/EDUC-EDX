import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import { SchoolCollectionOptions } from 'tests-e2e/cypress/services/sdc-collection-api-service';

describe('SDC Step-One', () => {
  context('Upload student file', () => {
    before(() => {
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task<SchoolCollectionOptions, SdcSchoolCollection>('setup-collections', {
          school: res.school,
          loadWithStudentAndValidations: true,
          seedData: 'stepThreeSeedData'
        });
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', {schoolCodes: ['99998']});
      });
    });
    after(() => cy.logout());
    beforeEach(() => cy.login());

    it('can re-upload a collection file', () => {
      cy.intercept(Cypress.env('interceptors').collection_by_school_id).as('collectionBySchoolID');
      cy.intercept(Cypress.env('interceptors').collection).as('collectionRefresh');
      cy.visit('/');
      cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing School');
      cy.get(selectors.dashboard.dataCollectionsTileTitle).contains('Student Level Data Collection (1701)');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.title).should('exist').contains('Student Level Data (1701) | EDX Automation Testing School');
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get(selectors.studentLevelData.stepOne).should('exist').click();
      cy.wait('@collectionBySchoolID');
      cy.wait('@collectionRefresh');
      cy.get('#selectFileInput').selectFile('./cypress/uploads/sample-2-student-fnchars.std', { force: true });
      cy.wait('@collectionBySchoolID');
      cy.wait('@collectionRefresh');
      cy.get(selectors.snackbar.mainSnackBar).should('exist').contains('Your document was uploaded successfully.');
    });
  });

  context('1701 collection status is SUBMITTED', () => {
    before(() => {
      cy.logout();
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task<SchoolCollectionOptions, SdcSchoolCollection>('setup-collections', {
          school: res.school,
          loadWithStudentAndValidations: true,
          seedData: 'submittedSchoolCollection'
        });
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', {schoolCodes: ['99998']});
      });
    });
    beforeEach(() => {
      cy.login();
    });
    it('Re-upload button is disabled', () => {
        cy.visit('/');
        cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing School');
        cy.get(selectors.dashboard.dataCollectionsTileTitle).contains('Student Level Data Collection (1701)');
        cy.get(selectors.dashboard.dataCollectionsTile).click();
        cy.get(selectors.dataCollectionsLanding.title).should('exist').contains('Student Level Data (1701) | EDX Automation Testing School');
        cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();

        cy.get(selectors.studentLevelData.collectionSubmission).should('exist');
        cy.get(selectors.studentLevelData.stepOne).should('exist').click();
        cy.get(selectors.studentLevelData.documentReUploadButton).should('be.disabled');
    });
  });
});

import selectors from "../../support/selectors";
import { AppSetupData } from '../../../cypress.config';
import { SchoolCollection } from "tests-e2e/cypress/services/sdc-collection-api-service";

describe('SDC School Collection View', () => {
  context('As an EDX School User', () => {
    before(() => {
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task<SchoolCollection>('setup-collections', {
          school: res.school,
          loadWithStudentAndValidations: true,
          seedData: 'stepTwoSeedData'
        });
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', { schoolCodes: ['99998'] });
      });
    });
    after(() => cy.logout());
    beforeEach(() => cy.login());

    it('can load dashboard & click data collection card & process collection', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');

      cy.visit('/');
      cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing School');
      cy.get(selectors.dashboard.dataCollectionsTileTitle).contains('Data Collections');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      
      cy.get(selectors.dataCollectionsLanding.title).should('exist').contains('Student Level Data (1701) | EDX Automation Testing School');
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();

      cy.wait('@pagination').then(({response}) => {
        cy.get(selectors.studentLevelData.nextButton).should('be.disabled');
        cy.get(selectors.studentLevelData.legalLastNameValidationTextInput).should('exist');
        cy.get(selectors.studentLevelData.legalLastNameValidationTextInput).type('SMITH');    
        cy.get(selectors.studentLevelData.postalCodeValidationTextInput).should('exist');
      })

      cy.get(selectors.studentLevelData.saveAndRefreshButton).click();

      cy.wait('@pagination').then(({response}) => {
        cy.get(selectors.studentLevelData.nextButton).should('not.be.disabled');
          cy.get(selectors.studentLevelData.legalLastNameValidationTextInput).should('not.exist');
          cy.get(selectors.studentLevelData.postalCodeValidationTextInput).should('exist');
      })

      cy.get(selectors.studentLevelData.nextButton).should('not.be.disabled');
      cy.get(selectors.studentLevelData.nextButton).click();
    });

    it('can remove record containing validation errors', () => {
        cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');

        cy.visit('/');
        cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing School');
        cy.get(selectors.dashboard.dataCollectionsTileTitle).contains('Data Collections');
        cy.get(selectors.dashboard.dataCollectionsTile).click();

        cy.get(selectors.dataCollectionsLanding.title).should('exist').contains('Student Level Data (1701) | EDX Automation Testing School');
        cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();

        cy.wait('@pagination').then(({response}) => {
            cy.get(selectors.studentLevelData.nextButton).should('be.disabled');
        })
        cy.get(selectors.sdcSchoolStudentCollection.sdcCollectionStepTwo.removeRecord).should('exist');
        cy.get(selectors.sdcSchoolStudentCollection.sdcCollectionStepTwo.removeRecord).click();
        cy.get(selectors.sdcSchoolStudentCollection.sdcCollectionStepTwo.removeRecordRejectButton).click();
        cy.get(selectors.sdcSchoolStudentCollection.sdcCollectionStepTwo.removeRecord).click();
        cy.get(selectors.sdcSchoolStudentCollection.sdcCollectionStepTwo.removeRecordConfirmButton).click();
        cy.get(selectors.snackbar.mainSnackBar).should('exist').contains('Success! The student details have been deleted.');
    });
  });
});

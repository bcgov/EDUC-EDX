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
      cy.visit('/');
      cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing School');
      cy.get(selectors.dashboard.dataCollectionsTileTitle).contains('Data Collections');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.title).should('exist').contains('Student Level Data (1701) | EDX Automation Testing School');
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
  });

    it('verify errors and warnings on step-2 of sdc process', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();

      cy.wait('@pagination').then(({response}) => {
        cy.get(selectors.studentLevelData.nextButton).should('be.disabled');
        cy.get(selectors.studentLevelData.warningAndErrorSummary).should('exist');
        cy.get(selectors.studentLevelData.infoWarningCount).contains('2');
        cy.get(selectors.studentLevelData.errorCount).contains('2');
        cy.get(selectors.studentLevelData.fundingWarningCount).contains('0');

        cy.get(selectors.studentLevelData.totalStudentsWithIssues).should('exist');
        cy.get(selectors.studentLevelData.totalStudentsWithIssuesCount).should('exist');
        cy.get(selectors.studentLevelData.totalStudentsWithIssuesCount).contains('2');
        
        cy.get(selectors.studentLevelData.fixSelected).should('be.disabled');
        cy.get(selectors.studentLevelData.fixAll).should('not.be.disabled');

        cy.get(selectors.studentLevelData.selectStudentCheckbox).first().click().then((event) => {
          cy.get(selectors.studentLevelData.fixSelected).should('not.be.disabled');
          cy.get(selectors.studentLevelData.fixAll).should('be.disabled');
        });
      })
    });

    it('search the list of students with errors and warnings on step-2 of sdc process using NAME filter', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();

      cy.wait('@pagination').then(({response}) => {
        cy.get(selectors.studentLevelData.stepTwoNameFilter).should('exist');
        expect(response?.body?.totalElements).eq(2);

        cy.get(selectors.studentLevelData.stepTwoNameFilter).type('TEST');
        cy.get(selectors.studentLevelData.stepTwoSearchButton).click();
        cy.get(selectors.studentLevelData.stepTwoTableFirstRow).contains('TESTFIRST');

        cy.get(selectors.studentLevelData.stepTwoClearSearchFilter).click();
        });
    });

    it('search the list of students with errors and warnings on step-2 of sdc process using PEN filter', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();

      cy.wait('@pagination').then(({response}) => {
        cy.get(selectors.studentLevelData.stepTwoPenLocalIdFilter).should('exist');
        expect(response?.body?.totalElements).eq(2);

        cy.get(selectors.studentLevelData.stepTwoPenLocalIdFilter).type('101930550');
        cy.get(selectors.studentLevelData.stepTwoSearchButton).click();
        cy.get(selectors.studentLevelData.stepTwoTableFirstRow).contains('TESTFIRST');

        cy.get(selectors.studentLevelData.stepTwoClearSearchFilter).click();

        cy.get(selectors.studentLevelData.stepTwoPenLocalIdFilter).type('10000');
        cy.get(selectors.studentLevelData.stepTwoSearchButton).click();
        cy.get(selectors.studentLevelData.stepTwoTableFirstRow).contains('TESTFIRST');
        });
    });

    it('can fix errors and warnings on the student record', () => {
        cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
        cy.visit('/');
        cy.get(selectors.dashboard.dataCollectionsTile).click();
        cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();

        cy.wait('@pagination').then(({response}) => {
          cy.get(selectors.studentLevelData.errorCount).contains('2');
          cy.get(selectors.studentLevelData.selectStudentCheckbox).first().click().then((event) => {
            cy.get(selectors.studentLevelData.fixSelected).click();         
          });
        })

        cy.get(selectors.studentLevelData.selectedStudentsPaginator).contains('Reviewing 1 of 2 Records');
        cy.get(selectors.studentLevelData.legalLastNameValidationTextInput).should('exist');
        cy.get(selectors.studentLevelData.legalLastNameValidationTextInput).type('SMITH');    
        cy.get(selectors.studentLevelData.postalCodeValidationTextInput).should('exist');

        cy.get(selectors.studentLevelData.saveRecordButton).click().then((event) => {
          cy.get(selectors.studentLevelData.legalLastNameValidationTextInput).should('not.exist');
        });

        cy.intercept(Cypress.env('interceptors').collection_student).as('studentUpdate');
        cy.wait('@studentUpdate').then(()=>{
            cy.get(selectors.studentLevelData.backToDataIssues).click();
        })

        cy.wait('@pagination').then(()=> {
          cy.get(selectors.studentLevelData.errorCount).contains('1');
        })
    });

    it('can remove record containing validation errors', () => {
        cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');

        cy.visit('/');
        cy.get(selectors.dashboard.dataCollectionsTile).click();
        cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();

        cy.wait('@pagination').then(({response}) => {
          cy.get(selectors.studentLevelData.selectStudentCheckbox).first().click().then((event) => {
            cy.get(selectors.studentLevelData.fixSelected).click();         
          });
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

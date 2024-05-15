import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import { SchoolCollectionOptions } from 'tests-e2e/cypress/services/sdc-collection-api-service';

describe('SDC School Collection View', () => {
  context('As an EDX School User', () => {
    before(() => {
      cy.task<AppSetupData>('dataLoad').then(res => {
        Cypress.env('school', res?.schools[0]);
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', { schoolCodes: ['99998'] });
      });
    });
    after(() => cy.logout());
    beforeEach(() => {
      cy.login();
      cy.task<SchoolCollectionOptions, SdcCollections>('setup-collections', {
        school: Cypress.env('school'),
        loadWithStudentAndValidations: true,
        seedData: 'schoolDuplicateData'
      }).then(response => {
        Cypress.env('sdcSchoolCollectionID', response?.sdcSchoolCollections[0]?.sdcSchoolCollectionID);
      });
    });

    it('can edit and remove student', () => {
      navigateToDuplicateScreen(Cypress.env('sdcSchoolCollectionID'));
      cy.get(selectors.secureExchangeDetail.editOptionsMenu).first().click();
      cy.intercept(Cypress.env('interceptors').collection_student).as('student');
      cy.get(selectors.secureExchangeDetail.newMessageToConvBtn).click();
      cy.wait('@student');
      cy.intercept(Cypress.env('interceptors').delete_sdc_school_collection_student).as('deleteStudent');
      cy.get(selectors.sdcSchoolStudentCollection.sdcCollectionStepTwo.removeRecord).click();
      cy.get(selectors.sdcSchoolStudentCollection.sdcCollectionStepTwo.removeRecordConfirmButton).click();
      cy.wait('@deleteStudent');
      cy.get(selectors.snackbar.mainSnackBar).should('include.text', 'Success!');
      cy.get(selectors.studentLevelData.cancelButton).click();
      cy.get('.text-success').should('exist');
      cy.get(selectors.studentLevelData.stepFourNextButton).should('not.be.disabled');
    });
    it('can request review', () => {
      navigateToDuplicateScreen(Cypress.env('sdcSchoolCollectionID'));
      cy.get(selectors.secureExchangeDetail.editOptionsMenu).first().click();
      cy.get(selectors.secureExchangeDetail.addStudentConvButton).click();
      cy.get(selectors.sdcSchoolStudentCollection.sdcCollectionStepTwo.removeRecordConfirmButton).click();
      cy.get('.text-success').should('exist');
      cy.get(selectors.studentLevelData.stepFourNextButton).should('not.be.disabled');
    });
  });
});

function navigateToDuplicateScreen(id: string) {
  cy.intercept(Cypress.env('interceptors').school_duplicates).as('school_duplicates');
  cy.visit('/open-collection-details/' + id);
  cy.wait('@school_duplicates');
}

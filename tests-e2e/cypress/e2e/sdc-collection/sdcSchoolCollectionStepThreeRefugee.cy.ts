import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import { SchoolCollectionOptions, SdcStudentEllOption } from 'tests-e2e/cypress/services/sdc-collection-api-service';

describe('SDC School Collection View', () => {
  context('As an EDX School User', () => {
    before(() => {
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task<SchoolCollectionOptions, SdcCollections>('setup-collections', {
          school: res.schools[0],
          loadWithStudentAndValidations: true,
          seedData: 'stepThreeSeedDataForFebruary'
        }).then(collection => {
          Cypress.env('schoolCollectionId', collection?.sdcSchoolCollections[0]?.sdcSchoolCollectionID);
          const studentWithEllYears = collection?.sdcSchoolCollections[0]?.students
            .filter(s => s.assignedStudentId === 'ce4bec97-b986-4815-a9f8-6bdfe8578dcf')
            .map(s => ({
              studentID: s.assignedStudentId,
              yearsInEll: 3
            }) as SdcStudentEll);
          cy.task<SdcStudentEllOption, SdcStudentEll>('setup-student-ells', studentWithEllYears);
        });
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', { schoolCodes: ['99998'] });
      });
    });
    after(() => cy.logout());
    beforeEach(() => cy.login());

    it('can navigate to refugee tab', () => {
      const id = Cypress.env('schoolCollectionId');
      navigateToStep3Screen(id);

      cy.get(selectors.stepThreeTabSlider.refugeeButton).click();

    });
  });
});


function navigateToStep3Screen(id: SchoolCollectionOptions) {
  cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('collectionStudent');
  cy.visit('/open-collection-details/' + id);
  cy.wait('@collectionStudent');
}
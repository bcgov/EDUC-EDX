import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import {SchoolCollection} from '../../services/sdc-collection-api-service';

describe('SDC School Collection View', () => {
  context('As an EDX School User', () => {
    before(() => {
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task<SchoolCollection, SdcSchoolCollection>('setup-collections', {
          school: res.school,
          loadWithStudentAndValidations: true,
          seedData: 'careerProgramsSeedData'
        });
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', { schoolCodes: ['99998'] });
      });
    });
    after(() => cy.logout());
    beforeEach(() => cy.login());

    it('verifies common filters for fte tab', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();

      cy.get(selectors.studentLevelData.studentsFound).should('exist').contains(3);
      cy.get(selectors.fteComponent.filterButton).click();
      checkCommonFiltersExist()
      
   
    });

    it('verifies common filters for special education tab', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get('button[value="Special Education"]').click();
      
      cy.get(selectors.studentLevelData.studentsFound).should('exist').contains(3);
      cy.get(selectors.specialEducationComponent.filterButton).click();
      checkCommonFiltersExist();
      
    });

    it('verifies common filters for career tab', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get('button[value="Career Programs"]').click();
      
      cy.get(selectors.studentLevelData.studentsFound).should('exist').contains(3);
      cy.get(selectors.careerProgramComponent.filterButton).click();
      checkCommonFiltersExist();
      
    });

    it('verifies common filters for french tab', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get('button[value="French Programs"]').click();
      
      cy.get(selectors.studentLevelData.studentsFound).should('exist').contains(3);
      cy.get(selectors.frenchComponent.filterButton).click();
      checkCommonFiltersExist();
      
    });

    it('verifies common filters for indigenous tab', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get('button[value="Indigenous Students & Support Programs"]').click();
      
      cy.get(selectors.studentLevelData.studentsFound).should('exist').contains(3);
      cy.get(selectors.indigenousSupportComponent.filterButton).click();
      checkCommonFiltersExist();
      
    });

    it('verifies common filters for ELL tab', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get('button[value="English Language Learning"]').click();
      
      cy.get(selectors.studentLevelData.studentsFound).should('exist').contains(3);
      cy.get(selectors.ellComponent.filterButton).click();
      checkCommonFiltersExist();
      
    });

  });
});

function checkCommonFiltersExist() {
  cy.get(selectors.filters.studentType).should('contain.text', 'Student Type');
  cy.get(selectors.filters.warnings).should('contain.text', 'Warnings');
  cy.get(selectors.filters.fte).should('contain.text', 'FTE');
  cy.get(selectors.filters.grade).should('contain.text', 'Grade');
  cy.get(selectors.filters.fundingtype).should('contain.text', 'Funding Type');
}

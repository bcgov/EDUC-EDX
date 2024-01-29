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
          seedData: 'filterData'
        });
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', { schoolCodes: ['99998'] });
      });
    });
    after(() => cy.logout()); 
    beforeEach(() => cy.login());

    it('verifies filters for fte tab', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();

      cy.wait('@pagination').then(()=> {
        cy.get(selectors.fteComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(3);
        cy.get(selectors.fteComponent.tab).find(selectors.fteComponent.filterButton).click();
        checkCommonFiltersExist();

        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.isAdult).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.applyFilter).click();
        cy.get(selectors.fteComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(0);
        
        cy.get(selectors.fteComponent.tab).find(selectors.fteComponent.filterButton).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.clearFilter).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.isSchoolAged).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.fteGt0).click();
        cy.get(selectors.filters.applyFilter).click();

        cy.get(selectors.fteComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(3);
      });
    });

    it('verifies filters for special education tab', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get('button[value="Special Education"]').click();
      
      cy.wait('@pagination').then(()=> {
        cy.get(selectors.specialEducationComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(2);
        cy.get(selectors.specialEducationComponent.tab).contains('Filters').click();
        checkCommonFiltersExist();

        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.fteGt0).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.grade8).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.applyFilter).click();
        cy.get(selectors.specialEducationComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(1);

        cy.get(selectors.specialEducationComponent.tab).find('tbody tr').each($cell => {
          cy.wrap($cell).children().should('contain', '08');
        });
      });
    });

    it('verifies special filters for special education tab', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get('button[value="Special Education"]').click();

      cy.get(selectors.specialEducationComponent.tab).contains('Filters').click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('A - Physically Dependent').click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('Apply Filters').click();

      cy.get(selectors.studentLevelData.detailsLoadingBar).should('exist');
      cy.get(selectors.specialEducationComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(1);
      cy.get(selectors.specialEducationComponent.tab).find('tbody tr').each($cell => {
        cy.wrap($cell).children().last().invoke('text').then((text) => {
          expect(text).to.satisfy((value: string) => {
            return value === 'A-Physically Dependent';
          });
        });
      });

      cy.get(selectors.specialEducationComponent.tab).contains('Filters').click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('Clear All Filters').click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('G - Autism Spectrum Disorder').click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('Apply Filters').click();

      cy.get(selectors.studentLevelData.detailsLoadingBar).should('exist');
      cy.get(selectors.specialEducationComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(1);
      cy.get(selectors.specialEducationComponent.tab).find('tbody tr').each($cell => {
        cy.wrap($cell).children().last().invoke('text').then((text) => {
          expect(text).to.satisfy((value: string) => {
            return value === 'G-Autism Spectrum Disorder';
          });
        });
      });

      cy.get(selectors.specialEducationComponent.tab).contains('Filters').click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('Clear All Filters').click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('Not Funding Eligible').click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('Apply Filters').click();

      cy.get(selectors.specialEducationComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(0);
    });

    it('verifies filters for career tab', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get('button[value="Career Programs"]').click();
      
      cy.wait('@pagination').then(()=> {
        cy.get(selectors.careerProgramComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(2);
        cy.get(selectors.careerProgramComponent.tab).contains('Filters').click();
        checkCommonFiltersExist();
      });
    });

    it('verifies filters for french tab', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get('button[value="French Programs"]').click();
      
      cy.wait('@pagination').then(()=> {
        cy.get(selectors.frenchComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(2);
        cy.get(selectors.frenchComponent.tab).contains('Filters').click();
        checkCommonFiltersExist();
      });
    });

    it('verifies filters for indigenous tab', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get('button[value="Indigenous Students & Support Programs"]').click();
      
      cy.wait('@pagination').then(()=> {
        cy.get(selectors.indigenousSupportComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(3);
        cy.get(selectors.indigenousSupportComponent.tab).contains('Filters').click();
        checkCommonFiltersExist();
      });
    });

    it('verifies filters for ELL tab', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get('button[value="English Language Learning"]').click();
      
      cy.wait('@pagination').then(()=> {
        cy.get(selectors.ellComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(2);
        cy.get(selectors.ellComponent.tab).contains('Filters').click();
        checkCommonFiltersExist();
      });
    });

  });
});

function checkCommonFiltersExist() {
  cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.studentType).should('contain.text', 'Student Type');
  cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.warnings).should('contain.text', 'Warnings');
  cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.fte).should('contain.text', 'FTE');
  cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.grade).should('contain.text', 'Grade');
  cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.fundingtype).should('contain.text', 'Funding Type');
}

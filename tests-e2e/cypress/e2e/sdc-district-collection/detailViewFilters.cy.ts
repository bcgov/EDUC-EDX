import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import { DistrictCollectionOptions } from 'tests-e2e/cypress/services/sdc-collection-api-service';

describe('SDC District Collection View', () => {
  context('As an EDX District User', () => {
    before(() => {
      cy.logout();
      cy.task<AppSetupData>('districtDataLoad', {
        schoolOptions: [
          {
            includeTombstoneValues: true,
            includeSchoolAddress: true,
            includeSchoolContact: true,
            schoolStatus: 'Open',
            withPrimaryActivationCode: true,
            isIndependentSchool: false,
            schoolCode: '99990'
          },
          {
            includeTombstoneValues: true,
            includeSchoolAddress: true,
            includeSchoolContact: true,
            schoolStatus: 'Open',
            withPrimaryActivationCode: true,
            isIndependentSchool: false,
            schoolCode: '99991'
          }
        ]
      }).then(res => {
        cy.task<DistrictCollectionOptions, SdcCollections>('setup-district-collections', {
          schools: res.schools,
          district: res.district,
          loadWithStudentAndValidations: false,
          seedData: 'sdcDistrictCollectionSummarySeedData'
        }).then(response => {
          Cypress.env('sdcDistrictCollectionID', response?.sdcDistrictCollection?.sdcDistrictCollectionID);
        });
        cy.task('setup-districtUser', { districtRoles: ['DISTRICT_SDC'], districtCodes: ['998'] });
      });
    });
    beforeEach(() => cy.login());

    it('can view All Students Tab Filters', () => {
      cy.visit('/open-district-collection-details/' + Cypress.env('sdcDistrictCollectionID'));
      cy.get(selectors.studentLevelData.stepThree).should('exist').should('have.class', 'v-stepper-item--selected');
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 10');

      //check filters
      cy.get(selectors.sdcDistrictCollection.monitoringStep.filters.filtersBtn).click();
      checkCommonFiltersExist();

      cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.isAdult).click();
      cy.get(selectors.filters.applyFilter).click();
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 0');

      cy.get(selectors.sdcDistrictCollection.monitoringStep.filters.filtersBtn).click();
      cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.clearFilter).click();
      cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.isSchoolAged).click();
      cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.fteLt1).click();
      cy.get(selectors.filters.applyFilter).click();
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 4');

      cy.get(selectors.sdcDistrictCollection.monitoringStep.filters.filtersBtn).click();
      cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.clearFilter).click();
      cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.hasSupportBlocks).click();
      cy.get(selectors.filters.applyFilter).click();
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 0');

      cy.get(selectors.sdcDistrictCollection.monitoringStep.filters.filtersBtn).click();
      cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.clearFilter).click();
      cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.noSupportBlocks).click();
      cy.get(selectors.filters.applyFilter).click();
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 10');
    });

    it('can view French Tab Filters', () => {
      cy.visit('/open-district-collection-details/' + Cypress.env('sdcDistrictCollectionID'));
      cy.get(selectors.studentLevelData.stepThree).should('exist').should('have.class', 'v-stepper-item--selected');
      cy.get(selectors.stepThreeTabSlider.frenchProgramsButton).click();
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 10');

      //check filters
      cy.get(selectors.sdcDistrictCollection.monitoringStep.filters.filtersBtn).click();
      checkCommonFiltersExist();

      cy.intercept(Cypress.env('interceptors').district_collection_students_pagination).as('paginationFilters1');
      cy.get(selectors.activeFiltersDrawer.drawer).contains('11 - Early French Immersion').click();
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 4');

      cy.wait('@paginationFilters1');
      cy.get(selectors.frenchComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(4);
      cy.get(selectors.frenchComponent.tab).find('tbody tr').each($cell => {
        cy.wrap($cell).children().last().invoke('text').then((text) => {
          expect(text).to.satisfy((value: string) => {
            return value === 'Early French Immersion (11)';
          });
        });
      });

      cy.get(selectors.activeFiltersDrawer.drawer).contains('Clear').click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('14 - Late French Immersion').click();
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 0');

      cy.intercept(Cypress.env('interceptors').district_collection_students_pagination).as('paginationFilters2');
      cy.get(selectors.activeFiltersDrawer.drawer).contains('Clear').click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('08 - Core French').click();
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 6');

      cy.wait('@paginationFilters2');
      cy.get(selectors.frenchComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(6);
      cy.get(selectors.frenchComponent.tab).find('tbody tr').each($cell => {
        cy.wrap($cell).children().last().invoke('text').then((text) => {
          expect(text).to.satisfy((value: string) => {
            return value === 'Core French (08)';
          });
        });
      });

      cy.get(selectors.activeFiltersDrawer.drawer).contains('Clear').click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('Not Funding Eligible').click();
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 0');
    });

    it('can view Career Program Tab Filters', () => {
      cy.visit('/open-district-collection-details/' + Cypress.env('sdcDistrictCollectionID'));
      cy.get(selectors.studentLevelData.stepThree).should('exist').should('have.class', 'v-stepper-item--selected');
      cy.get(selectors.stepThreeTabSlider.careerProgramsButton).click();
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 4');

      //check filters
      cy.get(selectors.sdcDistrictCollection.monitoringStep.filters.filtersBtn).click();
      checkCommonFiltersExist();

      cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.career41).click();
      cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.grade8).click();
      cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.grade9).click();
      cy.get(selectors.filters.applyFilter).click();
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 0');

      cy.get(selectors.careerProgramComponent.tab).find(selectors.fteComponent.filterButton).click();
      cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.clearFilter).click();
      cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.codeXA).click();
      cy.get(selectors.filters.applyFilter).click();
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 4');

      cy.get(selectors.careerProgramComponent.tab).find(selectors.fteComponent.filterButton).click();
      cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.clearFilter).click();
      cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.career41).click();
      cy.get(selectors.filters.applyFilter).click();
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 4');

      cy.get(selectors.careerProgramComponent.tab).find(selectors.fteComponent.filterButton).click();
      cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.clearFilter).click();
      cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.career40).click();
      cy.get(selectors.filters.applyFilter).click();
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 0');
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

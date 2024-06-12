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

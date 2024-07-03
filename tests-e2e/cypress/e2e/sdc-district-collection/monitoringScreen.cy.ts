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
          seedData: 'sdcDistrictCollectionMonitoringSeedData'
        }).then(response => {
          Cypress.env('sdcDistrictCollectionID', response?.sdcDistrictCollection?.sdcDistrictCollectionID);
        });
        cy.task('setup-districtUser', { districtRoles: ['DISTRICT_SDC'], districtCodes: ['998'] });
      });
    });
    beforeEach(() => cy.login());

    it('can navigate to district collection monitoring view and use filters', () => {
      navigateToMonitorScreen(Cypress.env('sdcDistrictCollectionID'));
      cy.get(selectors.studentLevelData.stepTwo).should('exist').should('have.class', 'v-stepper-item--selected');
      cy.get(selectors.sdcDistrictCollection.monitoringStep.monitoringNextBtn).should('be.disabled');
      cy.get(selectors.sdcDistrictCollection.monitoringStep.schoolNotSubmittedWarning).should('have.text', '1 school(s) not submitted ');

      cy.get(selectors.sdcDistrictCollection.monitoringStep.hasUploadedValue).should('have.text', '2');
      cy.get(selectors.sdcDistrictCollection.monitoringStep.missingUploadedValue).should('have.text', '0');
      cy.get(selectors.sdcDistrictCollection.monitoringStep.dataErrorValue).should('have.text', '0');
      cy.get(selectors.sdcDistrictCollection.monitoringStep.dataFundingWarnValue).should('have.text', '0');
      cy.get(selectors.sdcDistrictCollection.monitoringStep.dataInfoWarnValue).should('have.text', '0');
      cy.get(selectors.sdcDistrictCollection.monitoringStep.submittedValue).should('have.text', '1');
      cy.get(selectors.sdcDistrictCollection.monitoringStep.notSubmittedValue).should('have.text', '1');

      cy.get(selectors.sdcDistrictCollection.monitoringStep.filters.filtersBtn).click();
      cy.get(selectors.sdcDistrictCollection.monitoringStep.filters.cancelBtn).click();

      cy.get(selectors.sdcDistrictCollection.monitoringStep.monitoringTableRows).should('have.length', 2);

      cy.intercept(Cypress.env('interceptors').sdc_school_collection).as('sdc_school_collection');
      cy.get(selectors.sdcDistrictCollection.monitoringStep.monitoringLinkToSdcSchoolCollection).contains('99899990').invoke('removeAttr', 'target').click();
      cy.wait('@sdc_school_collection');
    });
  });
});

function navigateToMonitorScreen(id: string) {
  cy.intercept(Cypress.env('interceptors').sdc_district_collection_monitor).as('sdc_district_collection_monitor');
  cy.visit('/open-district-collection-details/' + id);
  cy.wait('@sdc_district_collection_monitor');
}

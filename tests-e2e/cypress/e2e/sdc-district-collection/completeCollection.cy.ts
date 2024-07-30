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
          seedData: 'sdcDistrictCollectionProvincialDuplicatesSeedData'
        }).then(response => {
          Cypress.env('sdcDistrictCollectionID', response?.sdcDistrictCollection?.sdcDistrictCollectionID);
        });
        cy.task('setup-districtUser', { districtRoles: ['DISTRICT_SDC'], districtCodes: ['998'] });
      });
    });
    beforeEach(() => cy.login());


    it('can view resolve provincial duplicates tabs', () => {
      cy.visit('/open-district-collection-details/' + Cypress.env('sdcDistrictCollectionID'));
      cy.get(selectors.studentLevelData.stepSeven).should('exist').should('have.class', 'v-stepper-item--selected');

    });
  });
});
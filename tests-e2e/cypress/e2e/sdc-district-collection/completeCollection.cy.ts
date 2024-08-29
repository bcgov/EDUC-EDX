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
          seedData: 'sdcDistrictCollectionCompleteCollectionSeedData'
        }).then(response => {
          Cypress.env('sdcDistrictCollectionID', response?.sdcDistrictCollection?.sdcDistrictCollectionID);
          Cypress.env('collectionTypeCode', response?.sdcDistrictCollection?.collectionTypeCode);
        });
        cy.task('setup-districtUser', { districtRoles: ['DISTRICT_SDC', 'SUPERINT', 'SECR_TRES', 'EDX_DISTRICT_ADMIN', 'DIS_SDC_RO', 'EDX_EDIT_DISTRICT'], districtCodes: ['998'] });
      });
    });
    beforeEach(() => cy.login());


    it('can view sign off tab and sign off', () => {
      cy.visit('/open-district-collection-details/' + Cypress.env('sdcDistrictCollectionID'));
      const isJulyCollection = Cypress.env('collectionTypeCode') === 'JULY';
      if(isJulyCollection) {
        cy.get(selectors.studentLevelData.stepFour).should('exist').should('have.class', 'v-stepper-item--selected');
      } else {
        cy.get(selectors.studentLevelData.stepSeven).should('exist').should('have.class', 'v-stepper-item--selected');
      }

      cy.get(selectors.studentLevelData.signOffTab).should('exist').click();

      cy.get(selectors.signOffTab._1701SignOffButton).should('exist').click();
      cy.get(selectors.signOffTab.confirmButton).click();

      cy.get(selectors.signOffTab.superintendentSignOffButton).should('exist').click();
      cy.get(selectors.signOffTab.confirmButton).click();

      cy.get(selectors.signOffTab.secretaryTreasurerSignOffButton).should('exist').click();
      cy.get(selectors.signOffTab.confirmButton).click();

      cy.get(selectors.signOffTab._1701SignOffButton).should('be.disabled');
      cy.get(selectors.signOffTab.superintendentSignOffButton).should('be.disabled');
      cy.get(selectors.signOffTab.secretaryTreasurerSignOffButton).should('be.disabled');

      cy.get(selectors.signOffTab.signOffDetails).each(($cell) => {
        cy.wrap($cell).children().first().should('have.class', 'mdi-check-circle-outline');
      });

      cy.reload();
      cy.get(selectors.signOffTab.slider).children().should('have.length', 9);
      cy.get(selectors.signOffTab.studentDifferencesButton).should('exist').click();
      cy.get(selectors.signOffTab.studentsFound).should('exist').contains('Students Found: 0');
      cy.get(selectors.signOffTab.resolvedDuplicatesButton).should('exist').click();
      cy.get(selectors.signOffTab.enrolledResolvedAlert).should('exist').contains('There are no resolved enrolment duplicates.');
    });
  });
});

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
          seedData: 'sdcDistrictCollectionEditViewSeedData'
        }).then(response => {
          Cypress.env('sdcDistrictCollectionID', response?.sdcDistrictCollection?.sdcDistrictCollectionID);
        });
        cy.task('setup-districtUser', { districtRoles: ['DISTRICT_SDC'], districtCodes: ['998'] });
      });
    });
    beforeEach(() => cy.login());


    it('if summer collection can view no district sign-off step', () => {
      cy.visit('/open-district-collection-details/' + Cypress.env('sdcDistrictCollectionID'));
      cy.get(selectors.studentLevelData.stepThree).should('exist').should('have.class', 'v-stepper-item--selected');

      cy.get(selectors.studentLevelData.collectionDate).then($el => {
        const text = $el.text();
        if (text.includes('July')) {
          cy.get(selectors.studentLevelData.stepOne).should('exist').contains('Upload Data');
          cy.get(selectors.studentLevelData.stepTwo).should('exist').contains('Monitor School Submissions');
          cy.get(selectors.studentLevelData.stepThree).should('exist').contains('Edit/Verify Data');
          cy.get(selectors.studentLevelData.stepFour).should('exist').contains('Submit to Ministry');
          cy.get(selectors.studentLevelData.stepFive).should('not.exist');
          cy.get(selectors.studentLevelData.stepSix).should('not.exist');
          cy.get(selectors.studentLevelData.stepSeven).should('not.exist');
        } else {
          cy.get(selectors.studentLevelData.stepFive).should('exist').contains('Submit to Ministry');
          cy.get(selectors.studentLevelData.stepSix).should('exist').contains('Provincial Duplicates');
          cy.get(selectors.studentLevelData.stepSeven).should('exist').contains('Sign-Off Final Submission');
        }
      });
    });

    it('if summer collection, progresses from edit/verify data step to submit to ministry step', () => {
      cy.visit('/open-district-collection-details/' + Cypress.env('sdcDistrictCollectionID'));
      cy.get(selectors.studentLevelData.stepThree).should('exist').should('have.class', 'v-stepper-item--selected');
      cy.get(selectors.studentLevelData.stepThreeNextButton).should('exist').click();

      cy.get(selectors.studentLevelData.collectionDate).then($el => {
        const text = $el.text();
        if (text.includes('July')) {
          cy.get(selectors.studentLevelData.stepFour).should('exist').should('have.class', 'v-stepper-item--selected').contains('Submit to Ministry');
        } else {
          cy.get(selectors.studentLevelData.stepFour).should('exist').should('have.class', 'v-stepper-item--selected').contains('Resolve In-District Duplicates');
        }
      });
    });
  });
});
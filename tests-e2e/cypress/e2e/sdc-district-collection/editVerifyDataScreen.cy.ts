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

    it('can navigate to district collection edit/verify data view', () => {
      cy.visit('/open-district-collection-details/' + Cypress.env('sdcDistrictCollectionID'));
      cy.get(selectors.studentLevelData.stepThree).should('exist').should('have.class', 'v-stepper-item--selected');
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 10');

      cy.get(selectors.stepThreeTabSlider.frenchProgramsButton).click();
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 4');

      cy.get(selectors.stepThreeTabSlider.careerProgramsButton).click();
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 4');

      cy.get(selectors.stepThreeTabSlider.indigenousStudentsButton).click();
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 6');

      cy.get(selectors.stepThreeTabSlider.englishLanguageLearningButton).click();
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 6');
    });

    it('can edit student', () => {
      cy.visit('/open-district-collection-details/' + Cypress.env('sdcDistrictCollectionID'));
      cy.get(selectors.studentLevelData.stepThree).should('exist').should('have.class', 'v-stepper-item--selected');
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 10');
  
      cy.get(selectors.schoolList.schoolRow).get('tr:nth-child(2)').click();
  
      cy.get(selectors.studentLevelData.fteBanner).should('exist');
      cy.get(selectors.studentLevelData.fteBanner).contains('Eligible FTE: 0');
      cy.get(selectors.studentLevelData.graduatedFlag).should('exist');
      cy.get(selectors.studentLevelData.adultFlag).should('exist');

      cy.get(selectors.studentLevelData.saveEditStudentRecord).should('be.disabled');
  
      cy.get(selectors.studentLevelData.studentPen).should('exist').clear().type(Cypress.env('student').penList[0]);
      cy.get(selectors.studentLevelData.saveEditStudentRecord).should('be.enabled');
      cy.get(selectors.studentLevelData.saveEditStudentRecord).click();
    });
  });
});

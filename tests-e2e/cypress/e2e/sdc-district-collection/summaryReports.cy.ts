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

    it('can view Eligible Enrolment & Eligible FTE report', () => {
      cy.visit('/open-district-collection-details/' + Cypress.env('sdcDistrictCollectionID'));
      cy.get(selectors.studentLevelData.stepThree).should('exist').should('have.class', 'v-stepper-item--selected');
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 10');

      //check summary headcounts
      cy.get(selectors.fteComponent.summaryButton).click();
      cy.get(selectors.fteComponent.headcountCard).should('have.length', 2);
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).should('have.length', 4);
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountHeader).should('contain.text', 'Student Headcount');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Preschool Aged');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(0).children('div:nth-child(2)').children('span').should('contain.text', '0');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'School Aged');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(1).children('div:nth-child(2)').children('span').should('contain.text', '10');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(2).children('div').should('contain.text', 'Adult');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(2).children('div:nth-child(2)').children('span').should('contain.text', '0');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(3).children('div').should('contain.text', 'All Students');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(3).children('div:nth-child(2)').children('span').should('contain.text', '10');
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountHeader).should('contain.text', 'Grade Headcount');
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountColumnData).should('have.length', 2);
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountColumnData).eq(0).children('div').should('contain.text', '09');
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountColumnData).eq(0).children('div:nth-child(2)').children('span').should('contain.text', '6');
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountColumnData).eq(1).children('div').should('contain.text', '10');
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountColumnData).eq(1).children('div:nth-child(2)').children('span').should('contain.text', '4');

      // check summary table
      cy.get(selectors.fteComponent.table).should('exist').contains(1);
      cy.get(selectors.fteComponent.table).eq(0).find(selectors.fteComponent.tableWrapper);
      cy.get(selectors.fteComponent.tableWrapper).contains('School Aged');
      cy.get(selectors.fteComponent.tableWrapper).contains('Adult');
      cy.get(selectors.fteComponent.tableWrapper).contains('All Students');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.districtUnderSchoolAgedHeadcount).should('contain.text', '0');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.districtUnderSchoolAgedEligibleFTE).should('contain.text', '0');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.districtUnderSchoolAgedTotal).should('contain.text', '0');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.districtSchoolAgedHeadcount).should('contain.text', '10');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.districtSchoolAgedEligibleFTE).should('contain.text', '10');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.districtSchoolAgedTotal).should('contain.text', '9.1000');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.districtAdultHeadcount).should('contain.text', '0');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.districtAdultEligibleFTE).should('contain.text', '0');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.districtAdultTotal).should('contain.text', '0');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.districtAllHeadcount).should('contain.text', '10');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.districtAllEligibleFTE).should('contain.text', '10');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.districtAllTotal).should('contain.text', '9.1000');
    });

    it('can view Grade Enrolment & FTE per School report', () => {
      cy.visit('/open-district-collection-details/' + Cypress.env('sdcDistrictCollectionID'));
      cy.get(selectors.studentLevelData.stepThree).should('exist').should('have.class', 'v-stepper-item--selected');
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 10');
      cy.get(selectors.fteComponent.summaryButton).click();

      cy.get(selectors.fteComponent.availableReports).parent().click();
      cy.get(selectors.dropdown.listItem).contains('Grade Enrolment & FTE per School').click();

      // check summary table
      cy.get(selectors.fteComponent.table).should('exist').contains(1);
      cy.get(selectors.fteComponent.table).eq(0).find(selectors.fteComponent.tableWrapper);
      cy.get(selectors.fteComponent.tableWrapper).contains('99899990 - EDX Automation Testing School');
      cy.get(selectors.fteComponent.tableWrapper).contains('99899991 - EDX Automation Testing School');
      cy.get(selectors.fteComponent.tableWrapper).contains('All Schools');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.school1Headcount).should('contain.text', '5');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.school1FTETotal).should('contain.text', '4.5500');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.school2Headcount).should('contain.text', '5');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.school2FTETotal).should('contain.text', '4.5500');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.allSchoolHeadcount).should('contain.text', '10');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.allSchoolFTETotal).should('contain.text', '9.1');
    });

  });
});

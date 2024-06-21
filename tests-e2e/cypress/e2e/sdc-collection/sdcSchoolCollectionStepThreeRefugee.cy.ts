import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import { SchoolCollectionOptions } from 'tests-e2e/cypress/services/sdc-collection-api-service';

describe('SDC School Collection View', () => {
  context('As an EDX School User', () => {
    before(() => {
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task<SchoolCollectionOptions, SdcCollections>('setup-collections', {
          school: res.schools[0],
          loadWithStudentAndValidations: true,
          seedData: 'stepThreeSeedDataForFebruary'
        });
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', { schoolCodes: ['99998'] });
      });
    });
    after(() => cy.logout());
    beforeEach(() => cy.login());

    it('can navigate to refugee tab, create 2 refugee students, check one does not receive funding by filters', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');

      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get(selectors.studentLevelData.stepTwoNextButton).click();

      // create two students in feb col, one with refugee errors, one without

      cy.get(selectors.studentLevelData.addStudent).click();

      cy.get(selectors.studentLevelData.saveEditStudentRecord).should('be.disabled');
      cy.get(selectors.studentLevelData.legalLastName).type('SMITH');
      cy.get(selectors.studentLevelData.dobPicker).type('2016');
      cy.get(selectors.datePicker.day).click();

      cy.get(selectors.studentLevelData.gender).parent().click();
      cy.get(selectors.dropdown.listItem).contains('Female (F)').click();

      cy.get(selectors.studentLevelData.enrolledGradeCode).parent().click();
      cy.get(selectors.dropdown.listItem).contains('Grade 6 (06)').click();

      cy.get(selectors.studentLevelData.nativeAncestryInd).parent().click();
      cy.get(selectors.dropdown.listItem).contains('N').click();

      cy.get(selectors.studentLevelData.schoolFundingCodes).parent().click();
      cy.get(selectors.dropdown.listItem).contains('Newcomer Refugee (16)').click();

      cy.get(selectors.studentLevelData.saveEditStudentRecord).should('be.enabled');

      cy.get(selectors.studentLevelData.saveEditStudentRecord).click();
      cy.get(selectors.snackbar.mainSnackBar, {timeout:15000}).should('exist').contains('Success! The student details have been updated.');
      cy.reload();

      cy.get(selectors.studentLevelData.addStudent).click();

      cy.get(selectors.studentLevelData.saveEditStudentRecord).should('be.disabled');
      cy.get(selectors.studentLevelData.legalLastName).type('MARTIN');
      cy.get(selectors.studentLevelData.dobPicker).type('2001');
      cy.get(selectors.datePicker.day).click();

      cy.get(selectors.studentLevelData.gender).parent().click();
      cy.get(selectors.dropdown.listItem).contains('Female (F)').click();

      cy.get(selectors.studentLevelData.enrolledGradeCode).parent().click();
      cy.get(selectors.dropdown.listItem).contains('Graduated Adult (GA)').click();

      cy.get(selectors.studentLevelData.numberofCourses).parent().click();
      cy.get(selectors.dropdown.listItem).contains('1.00').click();

      cy.get(selectors.studentLevelData.nativeAncestryInd).parent().click();
      cy.get(selectors.dropdown.listItem).contains('N').click();

      cy.get(selectors.studentLevelData.schoolFundingCodes).parent().click();
      cy.get(selectors.dropdown.listItem).contains('Newcomer Refugee (16)').click();

      cy.get(selectors.studentLevelData.saveEditStudentRecord).should('be.enabled');

      cy.get(selectors.studentLevelData.saveEditStudentRecord).click();
      cy.get(selectors.snackbar.mainSnackBar, {timeout:15000}).should('exist').contains('Success! The student details have been updated.');
      cy.reload();

      // checks tab available in Feb
      cy.contains('February 2024 Collection').should('be.visible').should('exist');
      cy.get(selectors.stepThreeTabSlider.refugeeButton).should('exist').click();
      cy.get(selectors.studentLevelData.studentsFound).should('exist').contains(2);

      // checks special filter for refugee funding
      cy.get(selectors.refugeeComponent.filterButton).click();
      cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.refugeeFundingEligible).click();
      cy.get(selectors.filters.applyFilter).click();

      cy.get(selectors.studentLevelData.studentsFound).should('exist').contains(1);

      cy.get(selectors.refugeeComponent.filterButton).click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('Clear').click();
      cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.refugeeFundingNotEligible).click();
      cy.get(selectors.filters.applyFilter).click();
      cy.get(selectors.studentLevelData.studentsFound).should('exist').contains(1);
    });
  });
});
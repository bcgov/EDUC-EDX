import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import { SchoolCollectionOptions, SdcStudentEllOption } from 'tests-e2e/cypress/services/sdc-collection-api-service';
import {DateTimeFormatter, LocalDate} from "@js-joda/core";

describe('SDC School Collection View', () => {
  context('As an EDX School User', () => {
    before(() => {
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task<SchoolCollectionOptions, SdcSchoolCollection>('setup-collections', {
          school: res.school,
          loadWithStudentAndValidations: true,
          seedData: 'stepThreeHeadcountSeedData'
        }).then(collection => {
          const studentWithEllYears = collection.students
            .filter(s => s.assignedStudentId === 'ce4bec97-b986-4815-a9f8-6bdfe8578dcf')
            .map(s => ({
              studentID: s.assignedStudentId,
              yearsInEll: 3
            }) as SdcStudentEll);
          cy.task<SdcStudentEllOption, SdcStudentEll>('setup-student-ells', studentWithEllYears);
        });
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', { schoolCodes: ['99998'] });
      });
    });
    after(() => cy.logout());
    beforeEach(() => cy.login());

    it('can load dashboard & click data collection card & process collection', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing School');
      cy.get(selectors.dashboard.dataCollectionsTileTitle).contains('Student Level Data Collection (1701)');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.title).should('exist').contains('Student Level Data (1701) | EDX Automation Testing School');
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
    });

    it('can search for a student by name, PEN, or local ID', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('collectionStudent');

      cy.wait('@collectionStudent');
      cy.get(selectors.studentLevelData.stepThreeSearchField).type('102866365');
      cy.get(selectors.studentLevelData.stepThreeSearchBtn).click();
      cy.wait('@collectionStudent');
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 1');
      cy.get(selectors.studentLevelData.stepThreeClearBtn).click();
      cy.wait('@collectionStudent');
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 3');

      cy.get(selectors.studentLevelData.stepThreeSearchField).clear();
      cy.get(selectors.studentLevelData.stepThreeSearchField).type('LEGALLAST');
      cy.get(selectors.studentLevelData.stepThreeSearchBtn).click();
      cy.wait('@collectionStudent');
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 3');

      cy.get(selectors.studentLevelData.stepThreeSearchField).clear();
      cy.get(selectors.studentLevelData.stepThreeSearchField).type('67890');
      cy.get(selectors.studentLevelData.stepThreeSearchBtn).click();
      cy.wait('@collectionStudent');
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 1');
    });

    it('can edit student', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('collectionStudent');

      cy.wait('@collectionStudent');
      cy.get(selectors.studentLevelData.stepThreeSearchField).type('102866365');
      cy.get(selectors.studentLevelData.stepThreeSearchBtn).click();
      cy.wait('@collectionStudent').then(() => {
        cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 1');
        cy.get(selectors.studentLevelData.editStudentRow).click();

        cy.get(selectors.studentLevelData.selectedStudentsPaginator).contains('Reviewing 1 of 1 Records');
        cy.get(selectors.studentLevelData.fteBanner).should('exist');
        cy.get(selectors.studentLevelData.fteBanner).contains('Eligible FTE: 0.875');
        cy.get(selectors.studentLevelData.graduatedFlag).should('exist');
        cy.get(selectors.studentLevelData.adultFlag).should('exist');

        cy.get(selectors.studentLevelData.nativeAncestryIndValidationDropdown).should('exist');
        cy.get(selectors.studentLevelData.nativeAncestryIndValidationDropdown).parent().click();
        cy.get(selectors.dropdown.listItem).contains('Yes').click();

        cy.get(selectors.studentLevelData.saveEditStudentRecord).click();
      });
    });

    it('can remove students from list of reported students', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('collectionStudent');

      cy.wait('@collectionStudent');
      cy.get(selectors.studentLevelData.stepThreeSearchField).type('102866365');
      cy.get(selectors.studentLevelData.stepThreeSearchBtn).click();
      cy.wait('@collectionStudent');
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 1');
      cy.get(selectors.studentLevelData.tableResultsSelect).click();
      cy.get(selectors.studentLevelData.remove).click();
      cy.get(selectors.studentLevelData.removeConfirm).click();
      cy.wait('@collectionStudent');
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 0');
      cy.get(selectors.studentLevelData.stepThreeClearBtn).click();
      cy.wait('@collectionStudent');
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 2');
      cy.get(selectors.studentLevelData.tableResultsSelect).click({ multiple: true });
      cy.get(selectors.studentLevelData.remove).click();
      cy.get(selectors.studentLevelData.removeConfirm).click();
      cy.wait('@collectionStudent');
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 0');
    });

    it('can add student with no errors', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('collectionStudent');

      cy.wait('@collectionStudent');
      cy.get(selectors.studentLevelData.addStudent).click();

      cy.get(selectors.studentLevelData.saveEditStudentRecord).should('be.disabled');
      cy.get(selectors.studentLevelData.legalLastName).type('SMITH');
      cy.get(selectors.studentLevelData.dobPicker).type('2016');
      cy.get(selectors.datePicker.day).click();

      cy.get(selectors.studentLevelData.gender).parent().click();
      cy.get(selectors.dropdown.listItem).contains('Female (F)').click();

      cy.get(selectors.studentLevelData.enrolledGradeCode).parent().click();
      cy.get(selectors.dropdown.listItem).contains('GRADE 6 (06)').click();

      cy.get(selectors.studentLevelData.nativeAncestryInd).parent().click();
      cy.get(selectors.dropdown.listItem).contains('N').click();

      cy.get(selectors.studentLevelData.saveEditStudentRecord).should('be.enabled');

      cy.get(selectors.studentLevelData.saveEditStudentRecord).click();
      cy.get(selectors.snackbar.mainSnackBar, {timeout:15000}).should('exist').contains('Success! The student details have been updated.');
    });

    it('cannot add student with errors until all errors are resolved', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('collectionStudent');

      cy.wait('@collectionStudent');
      cy.get(selectors.studentLevelData.addStudent).click();

      cy.get(selectors.studentLevelData.saveEditStudentRecord).should('be.disabled');
      cy.get(selectors.studentLevelData.legalLastName).type('SMITH1');
      cy.get(selectors.studentLevelData.dobPicker).type('2016');
      cy.get(selectors.datePicker.day).click();

      cy.get(selectors.studentLevelData.gender).parent().click();
      cy.get(selectors.dropdown.listItem).contains('Female (F)').click();

      cy.get(selectors.studentLevelData.enrolledGradeCode).parent().click();
      cy.get(selectors.dropdown.listItem).contains('GRADE 6 (06)').click();

      cy.get(selectors.studentLevelData.nativeAncestryInd).parent().click();
      cy.get(selectors.dropdown.listItem).contains('N').click();

      cy.get(selectors.studentLevelData.saveEditStudentRecord).should('be.enabled');

      cy.get(selectors.studentLevelData.saveEditStudentRecord).click();
      
      cy.get(selectors.snackbar.mainSnackBar).should('exist').contains('Warning! Updates to student details will not be saved until all errors are fixed.');
      cy.get(selectors.snackbar.mainSnackBarCloseButton).click();

      cy.get(selectors.studentLevelData.legalLastName).clear();
      cy.get(selectors.studentLevelData.legalLastName).type('SMITH');
      cy.get(selectors.studentLevelData.saveEditStudentRecord).click();
      cy.get(selectors.snackbar.mainSnackBar, {timeout:15000}).should('exist').contains('Success! The student details have been updated.');
    });
  });
});

function checkCareerHeader(headerIndex: number, headerTitle: string, length: number, eligible: string, reported: string, notReported: string) {
  cy.get(selectors.careerProgramComponent.headcountCard).eq(headerIndex).find(selectors.careerProgramComponent.headcountHeader).should('contain.text', headerTitle);
  cy.get(selectors.careerProgramComponent.headcountCard).eq(headerIndex).find(selectors.careerProgramComponent.headcountColumnData).should('have.length', length);
  cy.get(selectors.careerProgramComponent.headcountCard).eq(headerIndex).find(selectors.careerProgramComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
  cy.get(selectors.careerProgramComponent.headcountCard).eq(headerIndex).find(selectors.careerProgramComponent.headcountColumnData).eq(0).children('span').should('contain.text', eligible);
  cy.get(selectors.careerProgramComponent.headcountCard).eq(headerIndex).find(selectors.careerProgramComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
  cy.get(selectors.careerProgramComponent.headcountCard).eq(headerIndex).find(selectors.careerProgramComponent.headcountColumnData).eq(1).children('span').should('contain.text', reported);
  cy.get(selectors.careerProgramComponent.headcountCard).eq(headerIndex).find(selectors.careerProgramComponent.headcountColumnData).eq(2).children('div').should('contain.text', 'Not Reported');
  cy.get(selectors.careerProgramComponent.headcountCard).eq(headerIndex).find(selectors.careerProgramComponent.headcountColumnData).eq(2).children('span').should('contain.text', notReported);
}

function checkCareerTableSection(subheadingIndex: number, subheaderTitle: string, expectedValues: number[][] ){
  const subheadings = ['XA - Business & Applied Business', 'XB - Fine Arts, Design, & Media', 'XC - Fitness & Recreation',
    'XD - Health & Human Services', 'XE - Liberal Arts & Humanities', 'XF - Science & Applied Science', 'XG - Tourism, ' +
    'Hospitality & Foods', 'XH - Trades & Technology'];

  cy.get(selectors.careerProgramComponent.headcountTableSubHeading).eq(subheadingIndex).should('contain.text', subheaderTitle + expectedValues[0].join(''))
    .next().should('contain.text', subheadings[0] + expectedValues[1].join(''))
    .next().should('contain.text', subheadings[1] + expectedValues[2].join(''))
    .next().should('contain.text', subheadings[2] + expectedValues[3].join(''))
    .next().should('contain.text', subheadings[3] + expectedValues[4].join(''))
    .next().should('contain.text', subheadings[4] + expectedValues[5].join(''))
    .next().should('contain.text', subheadings[5] + expectedValues[6].join(''))
    .next().should('contain.text', subheadings[6] + expectedValues[7].join(''))
    .next().should('contain.text', subheadings[7] + expectedValues[8].join(''));
}

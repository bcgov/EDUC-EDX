import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import { SchoolCollectionOptions, SdcStudentEllOption } from 'tests-e2e/cypress/services/sdc-collection-api-service';

describe('SDC School Collection View', () => {
  context('As an EDX School User', () => {
    before(() => {
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task<SchoolCollectionOptions, SdcSchoolCollection>('setup-collections', {
          school: res.school,
          loadWithStudentAndValidations: true,
          seedData: 'stepThreeHeadcountSeedData'
        }).then(collection => {
          Cypress.env('schoolCollectionId', collection?.sdcSchoolCollectionID);
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

    it('can view assigned pen of student', () => {
      const id = Cypress.env('schoolCollectionId');
      navigateToStep3Screen(id);

      // test submitted and assigned do not match
      cy.get(selectors.studentLevelData.editStudentRowByPen).contains('101930550').click();
      cy.get(selectors.studentLevelData.selectedStudentsPaginator).contains('Reviewing 1 of 1 Records');
      cy.get(selectors.studentLevelData.studentPen).should('exist').clear().type('111111111');
      cy.get(selectors.studentLevelData.assignedPen).should('exist');
      cy.get(selectors.studentLevelData.assignedPen).contains('101930550');
      cy.get(selectors.studentLevelData.assignedPenTooltip).should('exist');
      cy.get(selectors.studentLevelData.assignedPenTooltip).contains('Differences between the Assigned PEN and Submitted PEN indicate an existing student file has been matched to the submitted details. The Assigned PEN will be used to prevent duplication.');
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('collectionStudent');
      cy.get(selectors.studentLevelData.cancelButton).click();
      cy.wait('@collectionStudent');

      // test submitted and assigned match
      cy.get(selectors.studentLevelData.editStudentRowByPen).contains('103169744').click();
      cy.get(selectors.studentLevelData.selectedStudentsPaginator).contains('Reviewing 1 of 1 Records');
      cy.get(selectors.studentLevelData.studentPen).should('exist');
      cy.get(selectors.studentLevelData.studentPen).invoke('val').should('eq', '103169744');
      cy.get(selectors.studentLevelData.assignedPen).should('exist');
      cy.get(selectors.studentLevelData.assignedPen).contains('103169744');
      cy.get(selectors.studentLevelData.assignedPenTooltip).should('exist');
      cy.get(selectors.studentLevelData.assignedPenTooltip).contains('Same Assigned PEN and Submitted PEN indicate that the submitted details have been matched to an existing student file.');
      cy.get(selectors.studentLevelData.cancelButton).click();

      // test no assigned
      cy.get(selectors.studentLevelData.editStudentRowByPen).contains('Under Review').click();
      cy.get(selectors.studentLevelData.selectedStudentsPaginator).contains('Reviewing 1 of 1 Records');
      cy.get(selectors.studentLevelData.studentPen).should('exist');
      cy.get(selectors.studentLevelData.studentPen).invoke('val').should('eq', '101932770');
      cy.get(selectors.studentLevelData.assignedPen).should('exist');
      cy.get(selectors.studentLevelData.assignedPen).contains('Waiting on fixes');
      cy.get(selectors.studentLevelData.assignedPenTooltip).should('exist');
      cy.get(selectors.studentLevelData.assignedPenTooltip).contains('The submitted student details have errors or incomplete information. Confirm the submitted student name and date of birth.');
      cy.get(selectors.studentLevelData.cancelButton).click();
    });

    it('can edit student', () => {
      const id = Cypress.env('schoolCollectionId');
      navigateToStep3Screen(id);

      cy.get(selectors.schoolList.schoolRow).contains('student2').click();

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

    it('can remove students from list of reported students', () => {
      const id = Cypress.env('schoolCollectionId');
      navigateToStep3Screen(id);

      cy.contains('student2').parents('tr').find('[type="checkbox"]').click();
      //cy.get(selectors.studentLevelData.tableResultsSelect).click();
      cy.get(selectors.studentLevelData.remove).click();
      cy.get(selectors.studentLevelData.removeConfirm).click();

      cy.wait('@collectionStudent');
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 2');
      cy.get(selectors.studentLevelData.tableResultsSelect).click({ multiple: true });
      cy.get(selectors.studentLevelData.remove).click();
      cy.get(selectors.studentLevelData.removeConfirm).click();
      cy.wait('@collectionStudent');
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 0');
    });

    it('can add student with no errors', () => {
      const id = Cypress.env('schoolCollectionId');
      navigateToStep3Screen(id);
      cy.get(selectors.studentLevelData.addStudent).click();

      cy.get(selectors.studentLevelData.saveEditStudentRecord).should('be.disabled');
      cy.get(selectors.studentLevelData.legalLastName).type('SMITH');
      cy.get(selectors.studentLevelData.dobPicker).type('2016');
      cy.get(selectors.datePicker.day).click();

      cy.get(selectors.studentLevelData.gender).parent().click();
      cy.get(selectors.dropdown.listItem).contains('Female (F)').click();

      cy.get(selectors.studentLevelData.enrolledGradeCode).parent().click();
      cy.get(selectors.dropdown.listItem).contains('GRADE 6').click();

      cy.get(selectors.studentLevelData.nativeAncestryInd).parent().click();
      cy.get(selectors.dropdown.listItem).contains('N').click();

      cy.get(selectors.studentLevelData.saveEditStudentRecord).should('be.enabled');

      cy.get(selectors.studentLevelData.saveEditStudentRecord).click();
      cy.get(selectors.snackbar.mainSnackBar, {timeout:15000}).should('exist').contains('Success! The student details have been updated.');
    });

    it('cannot add student with errors until all errors are resolved', () => {
      const id = Cypress.env('schoolCollectionId');
      navigateToStep3Screen(id);
      cy.get(selectors.studentLevelData.addStudent).click();

      cy.get(selectors.studentLevelData.saveEditStudentRecord).should('be.disabled');
      cy.get(selectors.studentLevelData.legalLastName).type('SMITH1');
      cy.get(selectors.studentLevelData.dobPicker).type('2016');
      cy.get(selectors.datePicker.day).click();

      cy.get(selectors.studentLevelData.gender).parent().click();
      cy.get(selectors.dropdown.listItem).contains('Female (F)').click();

      cy.get(selectors.studentLevelData.enrolledGradeCode).parent().click();
      cy.get(selectors.dropdown.listItem).contains('GRADE 6').click();

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


    it('can verify the download csv link', () => {
      const id = Cypress.env('schoolCollectionId');
      navigateToStep3Screen(id);
      const csvDownloadUrl = Cypress.env('interceptors').student_csv;
      const csvDownloadPattern = csvDownloadUrl.replace(/\*/g, '.*').replace(/\//g, '\\/');
      const csvDownloadRegex = new RegExp(csvDownloadPattern);

      cy.get(selectors.studentLevelData.csvDownloadLink)
        .should('have.attr', 'href')
        .and((href) => {
          expect(csvDownloadRegex.test(href)).to.be.true;
        });
      cy.get(selectors.studentLevelData.csvDownloadLink).should('have.attr', 'target', '_blank');
    });
  });

  context('1701 collection status is SUBMITTED', () => {
    before(() => {
      cy.logout();
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task<SchoolCollectionOptions, SdcSchoolCollection>('setup-collections', {
          school: res.school,
          loadWithStudentAndValidations: true,
          seedData: 'submittedSchoolCollection'
        });
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', {schoolCodes: ['99998']});
      });
    });
    beforeEach(() => {
      cy.login();
    });
    it('Add and remove buttons should be disabled', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing School');
      cy.get(selectors.dashboard.dataCollectionsTileTitle).contains('Student Level Data Collection (1701)');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.title).should('exist').contains('Student Level Data (1701) | EDX Automation Testing School');
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
  
      cy.get(selectors.studentLevelData.collectionSubmission).should('exist');
      cy.get(selectors.studentLevelData.stepThree).should('exist').click();
      cy.get(selectors.studentLevelData.addStudent).should('be.disabled');
      cy.get(selectors.studentLevelData.remove).should('be.disabled');
    });
  });
});

function navigateToStep3Screen(id: SchoolCollectionOptions) {
  cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('collectionStudent');
  cy.visit('/open-collection-details/' + id);
  cy.wait('@collectionStudent');
}

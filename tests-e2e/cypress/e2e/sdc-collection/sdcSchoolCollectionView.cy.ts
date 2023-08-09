import selectors from "../../support/selectors";
import { AppSetupData } from '../../../cypress.config';
import {timeout} from "rxjs";

describe('SDC School Collection View', () => {
  context('As an EDX School User', () => {
    before(() => {
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task('setup-collections', res.school);
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', { schoolCodes: ['99998'] });
      });
    });
    // after(() => cy.logout());
    beforeEach(() => cy.login());

    it('can load dashboard & click data collection card & process collection', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Test School');
      cy.get(selectors.dashboard.dataCollectionsTileTitle).contains('Data Collections');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.title).contains('Student Level Data (1701) | EDX Automation Test School');
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();

      //step one of collection
      cy.get(selectors.schoolDetails.schoolMincodeTitle).contains('99899998');
      cy.get(selectors.schoolDetails.schoolDisplayNameTitle).contains('EDX Automation Testing School');
      cy.get(selectors.schoolDetails.editButton).click();
      cy.get(selectors.schoolDetails.schoolDetailsEmail).clear();
      cy.get(selectors.schoolDetails.schoolDetailsPhoneNumber).clear();
      cy.get(selectors.studentLevelData.formHint).contains('Address, phone, and/or email must be added');
      cy.get(selectors.studentLevelData.nextButton).should('be.disabled');
      cy.get(selectors.schoolDetails.schoolDetailsEmail).type('fake@gmail.com');
      cy.get(selectors.schoolDetails.schoolDetailsPhoneNumber).type('1234567890');
      cy.get(selectors.schoolDetails.saveButton).click();
      cy.get(selectors.schoolDetails.resolveBtn).click();
      cy.get(selectors.studentLevelData.nextButton).click();

      //step two of collection
      cy.get(selectors.schoolContacts.subjectHeading).contains('99899998 - EDX Automation Testing School');
      cy.get(selectors.schoolContacts.newContactButton).click();
      cy.get(selectors.schoolContacts.newContactTypeDropdown).parent().click();
      cy.get(selectors.schoolContacts.listItem).contains('Principal').click();
      cy.get(selectors.schoolContacts.newContactLastNameInput).type('Fake Principal');
      cy.get(selectors.schoolContacts.newContactEmailInput).type('fake@gmail.com');
      cy.get(selectors.schoolContacts.newContactPhoneNumberInput).type('1231231234');
      cy.get(selectors.schoolContacts.newContactEffectiveDateTextField).click();
      cy.get(selectors.schoolContacts.newContactCalendar).contains('Select').click();
      cy.get(selectors.schoolContacts.newContactPostBtn).click();
      cy.get(selectors.studentLevelData.nextButton).click();

      //step three of collection
      cy.get(selectors.studentLevelData.documentUploadButton).click();
      cy.get(selectors.documentUpload.selectFileInput).selectFile('./cypress/uploads/sample-2-student-fnchars.std', {force: true});
      cy.get(selectors.dataCollectionsLanding.title).should('exist').contains('Student Level Data (1701) | EDX Automation Testing School');

      // Timeout exception made since time to upload is varaible depending on the file size and format.
      cy.get(selectors.snackbar.mainSnackBar, {timeout: 10000}).contains('Your document was uploaded successfully.');
      cy.get(selectors.studentLevelData.nextButton, {timeout: 15000}).should('exist').should('be.enabled').click();

    });

    it.only('can return to previous step in collection', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get(selectors.studentLevelData.nextButton).click();

      // checking if the previous button is clickable


      cy.get(selectors.studentLevelData.nextButton).click();
      // After this step, the previous button is clicked and the user is taken to the previous step

      // All other buttons after the previous button are disabled

      // User moved to next step by clicking next button

    });
  });
});

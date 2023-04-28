import {Selectors} from "../../support/selectors";

before(() => {
    cy.task('defaults:db');
})
describe('SDC Collection Test', () => {
    it('Load dashboard & click data collection card & process collection', () => {
        const selectors = new Selectors();
        cy.visit('/');
        cy.login();
        cy.get(selectors.dashboard.title, {timeout: 60000}).contains('Dashboard | EDX Automation Testing School');
        cy.get(selectors.dashboard.dataCollectionsTileTitle, {timeout: 60000}).contains('Data Collections');
        cy.get(selectors.dashboard.dataCollectionsTile).click();
        cy.get(selectors.dataCollectionsLanding.title, {timeout: 5000}).contains('Student Level Data (1701) | EDX Automation Testing School');
        cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();

        //step one of collection
        cy.get(selectors.schoolDetails.subjectHeading).contains('99899998 - EDX Automation Testing School');
        cy.get(selectors.stepOneSchoolDetails.formHint).contains('Address, phone, and/or email must be added');
        cy.get(selectors.stepOneSchoolDetails.nextButton).should('be.disabled');
        cy.get(selectors.schoolDetails.editButton).click();
        cy.get(selectors.schoolDetails.schoolDetailsEmail).type('fake@gmail.com');
        cy.get(selectors.schoolDetails.schoolDetailsPhoneNumber).type('1234567890');
        cy.get(selectors.schoolDetails.saveButton).click();
        cy.get(selectors.schoolDetails.resolveBtn).click();
        cy.get(selectors.stepOneSchoolDetails.nextButton).click();

        //step two of collection
        cy.get(selectors.schoolContacts.subjectHeading).contains('99899998 - EDX Automation Testing School');
        cy.get(selectors.stepTwoSchoolContacts.formHint).contains('A principal with an active start date and contact information must be added');
        cy.get(selectors.stepTwoSchoolContacts.nextButton).should('be.disabled');
        cy.get(selectors.schoolContacts.newContactButton).click();
        cy.get(selectors.schoolContacts.newContactTypeDropdown).parent().click();
        cy.get(selectors.schoolContacts.listItem).contains('Principal').click();
        cy.get(selectors.schoolContacts.newContactLastNameInput).type('Fake Principal');
        cy.get(selectors.schoolContacts.newContactEmailInput).type('fake@gmail.com');
        cy.get(selectors.schoolContacts.newContactPhoneNumberInput).type('1231231234');
        cy.get(selectors.schoolContacts.newContactEffectiveDateTextField).click();
        cy.get(selectors.schoolContacts.newContactCalendar).contains('Select').click();
        cy.get(selectors.schoolContacts.newContactPostBtn).click();
        cy.get(selectors.stepTwoSchoolContacts.nextButton).click();
    })
})

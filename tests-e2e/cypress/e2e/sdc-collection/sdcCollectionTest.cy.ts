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
        cy.get(selectors.stepOneSchoolDetails.nextButton).click();

        //step two of collection
        cy.get(selectors.schoolContacts.subjectHeading).contains('99899998 - EDX Automation Testing School');
        cy.get(selectors.stepTwoSchoolContacts.nextButton).click();
    })
})

import InstituteSetupUtils from "../../helpers/institute-set-up-utils";

describe('SDC Collection Test', () => {
    const instituteSetup = new InstituteSetupUtils()

    beforeEach(() => {
        instituteSetup.setUpDistrictAndSchool();
        //instituteSetup.setupInstituteEntities();
        // cy.fixture('auth').as('auth');
        // Cypress starts out with a blank slate for each test
        // so we must tell it to visit our website with the `cy.visit()` command.
        // Since we want to visit the same URL at the start of all our tests,
        // we include it in our beforeEach function so that it runs before each test
        //cy.visit('https://example.cypress.io/todo')
    })


    it('Load dashboard & click data collection card', () => {
        cy.visit('/');
        cy.login();
        cy.get('#navTitle > div', {timeout: 60000}).contains('Dashboard | EDX Automation Testing School');
        cy.get('#studentDataCollectionCard > div.v-row.pl-4 > div.v-col.mt-2 > div:nth-child(1) > div > h4', {timeout: 60000}).contains('Data Collections');
        cy.get('#studentDataCollectionCard').click();
        cy.get('#navTitle > div', {timeout: 5000}).contains('Student Level Data (1701) | EDX Automation Testing School');
    })
})

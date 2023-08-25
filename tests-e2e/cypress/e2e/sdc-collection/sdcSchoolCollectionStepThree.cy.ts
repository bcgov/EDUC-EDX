import selectors from "../../support/selectors";
import { AppSetupData } from '../../../cypress.config';
import { SchoolCollection } from "tests-e2e/cypress/services/sdc-collection-api-service";

describe('SDC School Collection View', () => {
    context('As an EDX School User', () => {
        before(() => {
            cy.task<AppSetupData>('dataLoad').then(res => {
                cy.task<SchoolCollection>('setup-collections', {
                    school: res.school,
                    loadWithStudentAndValidations: true,
                    seedData: 'stepThreeSeedData'
                });
                cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', { schoolCodes: ['99998'] });
            });
        });
        after(() => cy.logout());
        beforeEach(() => cy.login());

        it('can load dashboard & click data collection card & process collection', () => {
            cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');

            cy.visit('/');
            cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing School');
            cy.get(selectors.dashboard.dataCollectionsTileTitle).contains('Data Collections');
            cy.get(selectors.dashboard.dataCollectionsTile).click();
            cy.get(selectors.dataCollectionsLanding.title).should('exist').contains('Student Level Data (1701) | EDX Automation Testing School');
            cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();

            // Step three of collection - edit/verify data
            cy.get(selectors.studentLevelData.nextButton).click();
        });

        it.only('verifies FTE for Reported Students', () => {
            cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
            cy.visit('/');
            cy.get(selectors.dashboard.dataCollectionsTile).click();
            cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();

            // Step three of collection - edit/verify data
            cy.get(selectors.studentLevelData.nextButton).click();
            cy.get(selectors.studentLevelData.studentsFound).should('exist').contains(2);

            cy.get('.td-data').each(cell => {
                const cellText = cell.text()
                if (cellText === '1' || cellText === '0.875') {
                    cy.log('Correct fte value expected')
                }
            });
        });
    });
});

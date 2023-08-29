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
                    seedData: 'careerProgramsSeedData'
                });
                cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', { schoolCodes: ['99998'] });
            });
        });
        after(() => cy.logout());
        beforeEach(() => cy.login());

        it('can load dashboard & click data collection card & process collection', () => {
            cy.visit('/');
            cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing School');
            cy.get(selectors.dashboard.dataCollectionsTileTitle).contains('Data Collections');
            cy.get(selectors.dashboard.dataCollectionsTile).click();
            cy.get(selectors.dataCollectionsLanding.title).should('exist').contains('Student Level Data (1701) | EDX Automation Testing School');
            cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
            // Step three of collection - edit/verify data
            cy.get(selectors.studentLevelData.nextButton).click();
        });

        it('verifies FTE for Reported Students', () => {
            cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
            cy.visit('/');
            cy.get(selectors.dashboard.dataCollectionsTile).click();
            cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
            cy.get(selectors.studentLevelData.nextButton).click();
            cy.get(selectors.studentLevelData.studentsFound).should('exist').contains(3);

            cy.get('.td-data').each(cell => {
                const cellText = cell.text()
                if (cellText === '1' || cellText === '0.875') {
                    cy.log('Correct fte value expected')
                }
            });
        });


        it('verifies french programs for reported students', () => {
            cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
            cy.visit('/');
            cy.get(selectors.dashboard.dataCollectionsTile).click();
            cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
            cy.get(selectors.studentLevelData.nextButton).click();
            cy.get('button[value="French Programs"]').click();
            cy.get('.td-data').each(cell => {
                const cellText = cell.text()
                if (cellText === '08-CORE FRENCH' || cellText === '11-EARLY FRENCH IM') {
                    cy.log('Correct french enrolled program value expected')
                }
            });

        });

        it('verifies career programs for reported students', () => {
            cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
            cy.visit('/');
            cy.get(selectors.dashboard.dataCollectionsTile).click();
            cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
            cy.get(selectors.studentLevelData.nextButton).click();
            cy.get('button[value="Career Programs"]').click();

            cy.get('.td-data').each(cell => {
                const cellText = cell.text()
                cy.log(cellText)
                if (cellText === '41-CO-OPXA-BUSINESS & APPLIED BUSINESS' || cellText === '43-CAREER TECHNICAXH-TRADES & TECHNOLOGY') {
                    cy.log('Correct career enrolled program value expected')
                }
            });


        });
    });
});

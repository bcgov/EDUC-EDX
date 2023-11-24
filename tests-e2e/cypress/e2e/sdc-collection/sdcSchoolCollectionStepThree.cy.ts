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
            cy.get(selectors.studentLevelData.studentsFound).should('exist').contains(3);

            cy.get('.td-data').each(cell => {
                const cellText = cell.text()
                if (cellText === '1' || cellText === '0.875') {
                    cy.log('Correct fte value expected')
                }
            });

            //check summary headcounts
            cy.get(selectors.fteComponent.summaryButton).click();
            cy.get(selectors.fteComponent.headcountHeaderList).should('have.length', 2);
            cy.get(selectors.fteComponent.headcountHeaderList).eq(0).should('contain.text', 'Student Headcount');
            cy.get(selectors.fteComponent.headcountHeaderList).eq(1).should('contain.text', 'Grade Headcount');
            cy.get(selectors.fteComponent.headcountHeaderList).eq(0).find(selectors.fteComponent.headcountHeaderColumn).should('have.length', 3);
            cy.get(selectors.fteComponent.headcountHeaderList).eq(0).find(selectors.fteComponent.headcountHeaderColumn).eq(0).children('div').should('contain.text', 'School Aged');
            cy.get(selectors.fteComponent.headcountHeaderList).eq(0).find(selectors.fteComponent.headcountHeaderColumn).eq(0).children('span').should('contain.text', '3');
            cy.get(selectors.fteComponent.headcountHeaderList).eq(0).find(selectors.fteComponent.headcountHeaderColumn).eq(1).children('div').should('contain.text', 'Adult');
            cy.get(selectors.fteComponent.headcountHeaderList).eq(0).find(selectors.fteComponent.headcountHeaderColumn).eq(1).children('span').should('contain.text', '0');
            cy.get(selectors.fteComponent.headcountHeaderList).eq(0).find(selectors.fteComponent.headcountHeaderColumn).eq(2).children('div').should('contain.text', 'All Students');
            cy.get(selectors.fteComponent.headcountHeaderList).eq(0).find(selectors.fteComponent.headcountHeaderColumn).eq(2).children('span').should('contain.text', '3');
            cy.get(selectors.fteComponent.headcountHeaderList).eq(1).find(selectors.fteComponent.headcountHeaderColumn).should('have.length', 2);
            cy.get(selectors.fteComponent.headcountHeaderList).eq(1).find(selectors.fteComponent.headcountHeaderColumn).eq(0).children('div').should('contain.text', '09');
            cy.get(selectors.fteComponent.headcountHeaderList).eq(1).find(selectors.fteComponent.headcountHeaderColumn).eq(0).children('span').should('contain.text', '2');
            cy.get(selectors.fteComponent.headcountHeaderList).eq(1).find(selectors.fteComponent.headcountHeaderColumn).eq(1).children('div').should('contain.text', '11');
            cy.get(selectors.fteComponent.headcountHeaderList).eq(1).find(selectors.fteComponent.headcountHeaderColumn).eq(1).children('span').should('contain.text', '1');

        });


        it('verifies french programs for reported students', () => {
            cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
            cy.visit('/');
            cy.get(selectors.dashboard.dataCollectionsTile).click();
            cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
            cy.get('button[value="French Programs"]').click();
            cy.get(selectors.studentLevelData.detailsLoadingBar).should('exist');
            cy.get(selectors.frenchComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(2);
            cy.get(selectors.frenchComponent.tab).find('tbody tr').each($cell => {
                cy.wrap($cell).children().last().invoke('text').then((text) => {
                    expect(text).to.satisfy((value: string) => {
                        return value === '08-Core french' || value === '11-Early french immersion';
                    });
                });
            })

            //check summary headcounts
            cy.get(selectors.frenchComponent.summaryButton).click();
            cy.get(selectors.frenchComponent.headcountHeaderList).should('have.length', 4);
            checkFrenchHeader(0, 'Core French', 3, '1', '1', '2');
            checkFrenchHeader(1, 'Early French Immersion', 3, '1', '1', '2');
            checkFrenchHeader(2, 'Late French Immersion', 3, '0', '0', '3');
            checkFrenchHeader(3, 'Programme Francophone', 3, '0', '0', '3');
        });

        it('verifies career programs for reported students', () => {
            cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
            cy.visit('/');
            cy.get(selectors.dashboard.dataCollectionsTile).click();
            cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
            cy.get('button[value="Career Programs"]').click();

            cy.get('.td-data').each(cell => {
                const cellText = cell.text()
                cy.log(cellText)
                if (cellText === '41-CO-OPXA-BUSINESS & APPLIED BUSINESS' || cellText === '43-CAREER TECHNICAXH-TRADES & TECHNOLOGY') {
                    cy.log('Correct career enrolled program value expected')
                }
            });
        });

        it('verifies indigenous programs for reported students', () => {
            cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
            cy.visit('/');
            cy.get(selectors.dashboard.dataCollectionsTile).click();
            cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
            cy.get('button[value="Indigenous Students & Support Programs"]').click();

            cy.get(selectors.studentLevelData.detailsLoadingBar).should('exist');
            cy.get(selectors.indigenousSupportComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(1);
            cy.get(selectors.indigenousSupportComponent.tab).find('tbody tr').each($cell => {
                cy.wrap($cell).children().last().invoke('text').then((text) => {
                    expect(text).to.satisfy((value: string) => {
                        return value === '29-Aboriginal language and culture';
                    });
                });
            })
        });

        it('verifies special education category for reported students', () => {
            cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
            cy.visit('/');
            cy.get(selectors.dashboard.dataCollectionsTile).click();
            cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
            cy.get('button[value="Special Education"]').click();

            cy.get(selectors.studentLevelData.detailsLoadingBar).should('exist');
            cy.get(selectors.specialEducationComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(2);
            cy.get(selectors.specialEducationComponent.tab).find('tbody tr').each($cell => {
                cy.wrap($cell).children().last().invoke('text').then((text) => {
                    expect(text).to.satisfy((value: string) => {
                        return value === 'A-Physically dependent' || value === 'G-Autism spectrum disorder';
                    });
                });
            })
        });
    });
});

function checkFrenchHeader(headerIndex: number, headerTitle: string, length: number, eligible: string, reported: string, notReported: string) {
    cy.get(selectors.frenchComponent.headcountHeaderList).should('contain.text', headerTitle);
    cy.get(selectors.frenchComponent.headcountHeaderList).eq(headerIndex).find(selectors.frenchComponent.headcountHeaderColumn).should('have.length', length);
    cy.get(selectors.frenchComponent.headcountHeaderList).eq(headerIndex).find(selectors.frenchComponent.headcountHeaderColumn).eq(0).children('div').should('contain.text', 'Eligible');
    cy.get(selectors.frenchComponent.headcountHeaderList).eq(headerIndex).find(selectors.frenchComponent.headcountHeaderColumn).eq(0).children('span').should('contain.text', eligible);
    cy.get(selectors.frenchComponent.headcountHeaderList).eq(headerIndex).find(selectors.frenchComponent.headcountHeaderColumn).eq(1).children('div').should('contain.text', 'Reported');
    cy.get(selectors.frenchComponent.headcountHeaderList).eq(headerIndex).find(selectors.frenchComponent.headcountHeaderColumn).eq(1).children('span').should('contain.text', reported);
    cy.get(selectors.frenchComponent.headcountHeaderList).eq(headerIndex).find(selectors.frenchComponent.headcountHeaderColumn).eq(2).children('div').should('contain.text', 'Not Reported');
    cy.get(selectors.frenchComponent.headcountHeaderList).eq(headerIndex).find(selectors.frenchComponent.headcountHeaderColumn).eq(2).children('span').should('contain.text', notReported);
}

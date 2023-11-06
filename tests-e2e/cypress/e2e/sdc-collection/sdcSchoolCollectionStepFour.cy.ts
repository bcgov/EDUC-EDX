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
            cy.visit('/');
            cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing School');
            cy.get(selectors.dashboard.dataCollectionsTileTitle).contains('Data Collections');
            cy.get(selectors.dashboard.dataCollectionsTile).click();
            cy.get(selectors.dataCollectionsLanding.title).should('exist').contains('Student Level Data (1701) | EDX Automation Testing School');
            cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
            cy.get(selectors.studentLevelData.nextButton).click();
            cy.get(selectors.studentLevelData.nextButton).click();

            // Step four of collection - school details
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
        });

    });
});

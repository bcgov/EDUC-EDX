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
            cy.intercept('/api/edx/exchange/count*').as('exchangeLoaded');
            cy.intercept('/api/sdc/getCollectionBySchoolId/*').as('collectionLoaded');
            cy.intercept('/api/schools/schoolDetailsById/*').as('schoolDetailsLoaded');
            cy.visit('/');
            cy.wait('@exchangeLoaded');
            cy.wait('@collectionLoaded');
            cy.wait('@schoolDetailsLoaded');
            cy.wait('@schoolDetailsLoaded');
            cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing School');
            cy.get(selectors.dashboard.dataCollectionsTileTitle).contains('Data Collections');
            cy.intercept('/api/sdc/getCollectionBySchoolId/*').as('collectionLoaded');
            cy.get(selectors.dashboard.dataCollectionsTile).click();
            cy.wait('@collectionLoaded');
            cy.get(selectors.dataCollectionsLanding.title).should('exist').contains('Student Level Data (1701) | EDX Automation Testing School');
            cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();

            // Step five of collection - school contacts
            cy.get(selectors.schoolContacts.newContactButton).click();
            cy.get(selectors.schoolContacts.newContactTypeDropdown).parent().click();
            cy.get(selectors.schoolContacts.listItem).contains('Principal').click();
            cy.get(selectors.schoolContacts.newContactLastNameInput).type('Fake Principal');
            cy.get(selectors.schoolContacts.newContactEmailInput).type('fake@gmail.com');
            cy.get(selectors.schoolContacts.newContactPhoneNumberInput).type('1231231234');
            cy.get(selectors.schoolContacts.newContactEffectiveDateTextField).click();
            cy.get(selectors.datePicker.nextArrow).click();
            cy.get(selectors.datePicker.day).click();
            cy.get(selectors.schoolContacts.newContactPostBtn).click();
            cy.get(selectors.snackbar.mainSnackBar).should('contain', 'Success! The school contact has been created.');
        });

    });
});

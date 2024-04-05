import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import { SchoolCollectionOptions } from 'tests-e2e/cypress/services/sdc-collection-api-service';

describe('SDC School Collection View', () => {
  context('As an EDX School User', () => {
    before(() => {
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task<SchoolCollectionOptions, SdcCollections>('setup-collections', {
          school: res.school,
          loadWithStudentAndValidations: true,
          seedData: 'stepThreeSeedData'
        });
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', {schoolCodes: ['99998']});
      });
    });
    after(() => cy.logout());
    beforeEach(() => cy.login());

    it('can return to previous step in collection', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing School');
      cy.get(selectors.dashboard.dataCollectionsTileTitle).contains('Student Level Data Collection (1701)');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.title).should('exist').contains('Student Level Data (1701) | EDX Automation Testing School');
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();

      // step two of collection - review and fix data
      cy.get(selectors.studentLevelData.stepTwoNextButton).should('exist').should('be.enabled').click();

      //step three of collection - edit/verify data
      cy.get(selectors.studentLevelData.stepThreeNextButton).should('exist').should('be.enabled').click();

      // checking if the previous button is clickable and the user is taken to the previous step; brings to step 2
      cy.get(selectors.studentLevelData.stepTwo).should('exist').trigger('click'); //odd issue clicking on stepper with .click() does not always fire.
      cy.get(selectors.studentLevelData.stepTwo).should('exist').should('have.class', 'v-stepper-item--selected');

      // Step three should be disabled
      cy.get(selectors.studentLevelData.stepThree).should('exist').should('not.be.enabled');

      // User moved to next step by clicking next button
      cy.get(selectors.studentLevelData.stepTwoNextButton).should('exist').should('be.enabled').click();
    });
  });
});

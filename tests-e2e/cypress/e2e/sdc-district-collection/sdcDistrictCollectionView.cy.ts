import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import { SchoolCollectionOptions } from 'tests-e2e/cypress/services/sdc-collection-api-service';

describe('SDC District Collection View', () => {
  context('As an EDX District User', () => {
    before(() => {
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task<SchoolCollectionOptions, SdcCollections>('setup-collections', {
          school: res.schools[0],
          loadWithStudentAndValidations: false,
          seedData: 'sdcDistrictCollectionSeedData'
        });
        cy.task('setup-districtUser', { districtRoles: ['DISTRICT_SDC'], districtCodes: ['998'] });
      });
    });
    after(() => cy.logout());
    beforeEach(() => cy.login());

    it('can navigate to district collection view', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing District');
      cy.get(selectors.dashboard.dataCollectionsTileTitle).contains('Student Level Data Collection (1701)');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.title).should('exist').contains('Student Level Data (1701) | EDX Automation Testing District');
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();

      cy.get(selectors.studentLevelData.stepOne).should('exist').should('have.class', 'v-stepper-item--selected');
      cy.get(selectors.studentLevelData.stepTwo).should('exist').should('not.have.class', 'v-stepper-item--selected');
    });
  });
});

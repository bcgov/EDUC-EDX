import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import { SchoolCollectionOptions } from 'tests-e2e/cypress/services/sdc-collection-api-service';

describe('SDC School Collection View', () => {
  context('As an EDX School User', () => {
    before(() => {
      cy.task<AppSetupData>('dataLoad', {
        schoolOptions: [{
          includeTombstoneValues: true,
          includeSchoolAddress: true,
          includeSchoolContact: true,
          schoolStatus: 'Open',
          withPrimaryActivationCode: true,
          isIndependentSchool: true,
          schoolCode: '99998'
        }]
      }).then(res => {
        cy.task<SchoolCollectionOptions, SdcCollections>('setup-collections', {
          school: res.schools[0],
          loadWithStudentAndValidations: true,
          seedData: 'independentSchoolSeedData'
        });
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', { schoolCodes: ['99998'] });
      });
    });
    after(() => cy.logout());
    beforeEach(() => cy.login());

    it('can navigate to open school collection tile and see pie chart is different', () => {

      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      // check that pie chart is diff
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();


    });
  });
});
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
      cy.get(selectors.collectionSummary.stepsComplete).should('exist').contains('1 / 9 Steps Complete');
    });

    it('can verify all stepper headers and their titles', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();

      interface Steps {
        [key: string]: string;
      }

      const steps: Steps = {
        step1: 'Upload Data',
        step2: 'Review & Fix Data Issues',
        step3: 'Edit/Verify Data Issues',
        step4: 'Review & Fix Identical PENs',
        step5: 'Verify School Details (1601)',
        step6: 'Verify School Contacts (1601)',
        step7: 'Submit Data',
        step8: 'Resolve Province Duplicates',
        step9: 'Review & Sign-Off Final Submission'
      };
      
      Object.entries(steps).forEach(([stepId, expectedTitle]) => {
        cy.get(selectors.independent1601.steps[stepId as keyof typeof selectors.independent1601.steps])
          .should('exist')
          .and('have.text', expectedTitle);
      });
    });

    it('can navigate to and verify; verify school details 1601', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get(selectors.studentLevelData.stepTwoNextButton).click();
      cy.get(selectors.studentLevelData.stepThreeNextButton).click();
      cy.get(selectors.studentLevelData.stepFourNextButton).click();

      cy.get(selectors.independent1601.verifySchoolDetails.schoolDetails).should('contain', 'Independent');
      cy.get(selectors.independent1601.verifySchoolDetails.schoolDetails).should('contain', 'Standard');
      cy.get(selectors.independent1601.verifySchoolDetails.schoolDetails).should('contain', 'Two Semester');
      cy.get(selectors.independent1601.verifySchoolDetails.schoolDetails).should('contain', '250-555-5555');
      cy.get(selectors.independent1601.verifySchoolDetails.schoolDetails).should('contain', 'fakeuser@sd5.bc.ca');
    });

    it('can navigate to and verify; verify school contacts 1601', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get(selectors.studentLevelData.stepFiveNextButton).click();

      cy.get(selectors.independent1601.verifySchoolContacts.contactName).should('contain', 'EDXAutomation Testing');
      cy.get(selectors.independent1601.verifySchoolContacts.contactEffectiveDate).should('contain', '2022/10/25');
      cy.get(selectors.independent1601.verifySchoolContacts.contactEmailBreak).should('contain', 'test@test.com');
      cy.get(selectors.independent1601.verifySchoolContacts.contactPhoneNumber).should('contain', '250-665-6585');
      cy.get(selectors.independent1601.verifySchoolContacts.contactAlternatePhoneNumber).should('contain', '250-654-4578');
    });
  });
});
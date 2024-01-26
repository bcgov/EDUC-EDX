import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import {SchoolCollection} from '../../services/sdc-collection-api-service';

describe('SDC School Collection View', () => {
  context('As an EDX School User', () => {
    before(() => {
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task<SchoolCollection, SdcSchoolCollection>('setup-collections', {
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
      cy.get(selectors.dashboard.dataCollectionsTileTitle).contains('Student Level Data Collection (1701)');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.title).should('exist').contains('Student Level Data (1701) | EDX Automation Testing School');
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
    });

    it('can search for a student by name, PEN, or local ID', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('collectionStudent');

      cy.wait('@collectionStudent');
      cy.get(selectors.studentLevelData.stepThreeSearchField).type('102866365');
      cy.get(selectors.studentLevelData.stepThreeSearchBtn).click();
      cy.wait('@collectionStudent');
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 1');
      cy.get(selectors.studentLevelData.stepThreeClearBtn).click();
      cy.wait('@collectionStudent');
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 3');

      cy.get(selectors.studentLevelData.stepThreeSearchField).clear();
      cy.get(selectors.studentLevelData.stepThreeSearchField).type('LEGALLAST');
      cy.get(selectors.studentLevelData.stepThreeSearchBtn).click();
      cy.wait('@collectionStudent');
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 3');

      cy.get(selectors.studentLevelData.stepThreeSearchField).clear();
      cy.get(selectors.studentLevelData.stepThreeSearchField).type('67890');
      cy.get(selectors.studentLevelData.stepThreeSearchBtn).click();
      cy.wait('@collectionStudent');
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 1');
    });

    it('verifies FTE for Reported Students', () => {
      cy.intercept(Cypress.env('interceptors').collection_by_school_id).as('collection');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.wait('@collection');
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get(selectors.studentLevelData.studentsFound).should('exist').contains(3);

      cy.get('.td-data').each(cell => {
        const cellText = cell.text();
        if (cellText === '1' || cellText === '0.875') {
          cy.log('Correct fte value expected');
        }
      });

      //check summary headcounts
      cy.get(selectors.fteComponent.summaryButton).click();
      cy.get(selectors.fteComponent.headcountCard).should('have.length', 2);
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).should('have.length', 3);
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountHeader).should('contain.text', 'Student Headcount');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'School Aged');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(0).children('span').should('contain.text', '3');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Adult');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(1).children('span').should('contain.text', '0');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(2).children('div').should('contain.text', 'All Students');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(2).children('span').should('contain.text', '3');
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountHeader).should('contain.text', 'Grade Headcount');
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountColumnData).should('have.length', 2);
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountColumnData).eq(0).children('div').should('contain.text', '09');
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountColumnData).eq(0).children('span').should('contain.text', '2');
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountColumnData).eq(1).children('div').should('contain.text', '11');
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountColumnData).eq(1).children('span').should('contain.text', '1');
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
            return value === '08-Core French' || value === '11-Early French Immersion';
          });
        });
      });

      //check summary headcounts
      cy.get(selectors.frenchComponent.summaryButton).click();
      cy.get(selectors.frenchComponent.headcountCard).should('have.length', 3);
      cy.get(selectors.frenchComponent.headcountCard).eq(0).find(selectors.frenchComponent.headcountHeader).should('contain.text', 'Core French');
      cy.get(selectors.frenchComponent.headcountCard).eq(0).find(selectors.frenchComponent.headcountColumnData).should('have.length', 3);
      cy.get(selectors.frenchComponent.headcountCard).eq(0).find(selectors.frenchComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
      cy.get(selectors.frenchComponent.headcountCard).eq(0).find(selectors.frenchComponent.headcountColumnData).eq(0).children('span').should('contain.text', '1');
      cy.get(selectors.frenchComponent.headcountCard).eq(0).find(selectors.frenchComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
      cy.get(selectors.frenchComponent.headcountCard).eq(0).find(selectors.frenchComponent.headcountColumnData).eq(1).children('span').should('contain.text', '1');
      cy.get(selectors.frenchComponent.headcountCard).eq(0).find(selectors.frenchComponent.headcountColumnData).eq(2).children('div').should('contain.text', 'Not Reported');
      cy.get(selectors.frenchComponent.headcountCard).eq(0).find(selectors.frenchComponent.headcountColumnData).eq(2).children('span').should('contain.text', '2');
      cy.get(selectors.frenchComponent.headcountCard).eq(1).find(selectors.frenchComponent.headcountHeader).should('contain.text', 'Early French Immersion');
      cy.get(selectors.frenchComponent.headcountCard).eq(1).find(selectors.frenchComponent.headcountColumnData).should('have.length', 3);
      cy.get(selectors.frenchComponent.headcountCard).eq(1).find(selectors.frenchComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
      cy.get(selectors.frenchComponent.headcountCard).eq(1).find(selectors.frenchComponent.headcountColumnData).eq(0).children('span').should('contain.text', '1');
      cy.get(selectors.frenchComponent.headcountCard).eq(1).find(selectors.frenchComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
      cy.get(selectors.frenchComponent.headcountCard).eq(1).find(selectors.frenchComponent.headcountColumnData).eq(1).children('span').should('contain.text', '1');
      cy.get(selectors.frenchComponent.headcountCard).eq(1).find(selectors.frenchComponent.headcountColumnData).eq(2).children('div').should('contain.text', 'Not Reported');
      cy.get(selectors.frenchComponent.headcountCard).eq(1).find(selectors.frenchComponent.headcountColumnData).eq(2).children('span').should('contain.text', '2');
      cy.get(selectors.frenchComponent.headcountCard).eq(2).find(selectors.frenchComponent.headcountHeader).should('contain.text', 'Late French Immersion');
      cy.get(selectors.frenchComponent.headcountCard).eq(2).find(selectors.frenchComponent.headcountColumnData).should('have.length', 3);
      cy.get(selectors.frenchComponent.headcountCard).eq(2).find(selectors.frenchComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
      cy.get(selectors.frenchComponent.headcountCard).eq(2).find(selectors.frenchComponent.headcountColumnData).eq(0).children('span').should('contain.text', '0');
      cy.get(selectors.frenchComponent.headcountCard).eq(2).find(selectors.frenchComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
      cy.get(selectors.frenchComponent.headcountCard).eq(2).find(selectors.frenchComponent.headcountColumnData).eq(1).children('span').should('contain.text', '0');
      cy.get(selectors.frenchComponent.headcountCard).eq(2).find(selectors.frenchComponent.headcountColumnData).eq(2).children('div').should('contain.text', 'Not Reported');
      cy.get(selectors.frenchComponent.headcountCard).eq(2).find(selectors.frenchComponent.headcountColumnData).eq(2).children('span').should('contain.text', '3');
    });

    it('verifies career programs for reported students', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get('button[value="Career Programs"]').click();

      cy.get('.td-data').each(cell => {
        const cellText = cell.text();
        cy.log(cellText);
        if (cellText === '41-CO-OPXA-BUSINESS & APPLIED BUSINESS' || cellText === '43-CAREER TECHNICAXH-TRADES & TECHNOLOGY') {
          cy.log('Correct career enrolled program value expected');
        }
      });

      //check summary headcounts
      cy.get(selectors.careerProgramComponent.summaryButton).click();
      cy.get(selectors.careerProgramComponent.headcountCard).should('have.length', 4);
      checkCareerHeader(0, 'Career Preparation', 3, '0', '0', '3');
      checkCareerHeader(1, 'Co-Operative Education', 3, '1', '1', '2');
      checkCareerHeader(2, 'Apprenticeship', 3, '0', '0', '3');
      checkCareerHeader(3, 'Career Technical or Youth in Trades', 3, '1', '1', '2');
    });

    it('verifies indigenous programs for reported students', () => {
      cy.intercept(Cypress.env('interceptors').collection_by_school_id).as('collection');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.wait('@collection');
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get('button[value="Indigenous Students & Support Programs"]').click();

      cy.get(selectors.studentLevelData.detailsLoadingBar).should('exist');
      cy.get(selectors.indigenousSupportComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(3);
      cy.get(selectors.indigenousSupportComponent.tab).find('tbody tr').each($cell => {
        cy.wrap($cell).children().last().invoke('text').then((text) => {
          expect(text).to.satisfy((value: string) => {
            return value === '29-Aboriginal Language and Culture' || '-';
          });
        });
      });

      //check summary headcounts
      cy.get(selectors.indigenousSupportComponent.summaryButton).click();
      cy.get(selectors.indigenousSupportComponent.headcountCard).should('have.length', 5);
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(0).find(selectors.indigenousSupportComponent.headcountHeader).should('contain.text', 'Indigenous Language and Culture');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(0).find(selectors.indigenousSupportComponent.headcountColumnData).should('have.length', 3);
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(0).find(selectors.indigenousSupportComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(0).find(selectors.indigenousSupportComponent.headcountColumnData).eq(0).children('span').should('contain.text', '0');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(0).find(selectors.indigenousSupportComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(0).find(selectors.indigenousSupportComponent.headcountColumnData).eq(1).children('span').should('contain.text', '1');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(0).find(selectors.indigenousSupportComponent.headcountColumnData).eq(2).children('div').should('contain.text', 'Not Reported');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(0).find(selectors.indigenousSupportComponent.headcountColumnData).eq(2).children('span').should('contain.text', '2');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(1).find(selectors.indigenousSupportComponent.headcountHeader).should('contain.text', 'Indigenous Support Services');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(1).find(selectors.indigenousSupportComponent.headcountColumnData).should('have.length', 3);
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(1).find(selectors.indigenousSupportComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(1).find(selectors.indigenousSupportComponent.headcountColumnData).eq(0).children('span').should('contain.text', '0');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(1).find(selectors.indigenousSupportComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(1).find(selectors.indigenousSupportComponent.headcountColumnData).eq(1).children('span').should('contain.text', '0');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(1).find(selectors.indigenousSupportComponent.headcountColumnData).eq(2).children('div').should('contain.text', 'Not Reported');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(1).find(selectors.indigenousSupportComponent.headcountColumnData).eq(2).children('span').should('contain.text', '3');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(2).find(selectors.indigenousSupportComponent.headcountHeader).should('contain.text', 'Other Approved Indigenous Prog');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(2).find(selectors.indigenousSupportComponent.headcountColumnData).should('have.length', 3);
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(2).find(selectors.indigenousSupportComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(2).find(selectors.indigenousSupportComponent.headcountColumnData).eq(0).children('span').should('contain.text', '0');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(2).find(selectors.indigenousSupportComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(2).find(selectors.indigenousSupportComponent.headcountColumnData).eq(1).children('span').should('contain.text', '0');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(2).find(selectors.indigenousSupportComponent.headcountColumnData).eq(2).children('div').should('contain.text', 'Not Reported');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(2).find(selectors.indigenousSupportComponent.headcountColumnData).eq(2).children('span').should('contain.text', '3');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(3).find(selectors.indigenousSupportComponent.headcountHeader).should('contain.text', 'Indigenous Ancestry Headcount');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(3).find(selectors.indigenousSupportComponent.headcountColumnData).should('have.length', 1);
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(3).find(selectors.indigenousSupportComponent.headcountColumnData).eq(0).children('span').should('contain.text', '0');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(4).find(selectors.indigenousSupportComponent.headcountHeader).should('contain.text', 'Ordinarily Living on Reserve Hea');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(4).find(selectors.indigenousSupportComponent.headcountColumnData).should('have.length', 1);
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(4).find(selectors.indigenousSupportComponent.headcountColumnData).eq(0).children('span').should('contain.text', '3');
    });

    it('verifies english language learning programs for reported students', () => {
      cy.intercept(Cypress.env('interceptors').collection_by_school_id).as('collection');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.wait('@collection');
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get('button[value="English Language Learning"]').click();

      cy.get(selectors.studentLevelData.detailsLoadingBar).should('exist');
      cy.get(selectors.ellComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(2);
      cy.get(selectors.ellComponent.tab).find('tbody tr').each($cell => {
        cy.wrap($cell).children().last().invoke('text').then((text) => {
          expect(text).to.satisfy((value: string) => {
            return value === '17-English Language Learning-'; // Years in Ell is why there is a hyphen at the end
          });
        });
      });

      //check summary headcounts
      cy.get(selectors.ellComponent.summaryButton).click();
      cy.get(selectors.ellComponent.headcountCard).should('have.length', 2);
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
            return value === 'A-Physically Dependent' || value === 'G-Autism Spectrum Disorder';
          });
        });
      });

      //check summary headcounts
      cy.get(selectors.specialEducationComponent.summaryButton).click();
      cy.get(selectors.specialEducationComponent.headcountCard).should('have.length', 12);
      cy.get(selectors.specialEducationComponent.headcountCard).eq(0).find(selectors.specialEducationComponent.headcountHeader).should('contain.text', 'A - Physically Dependent');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(0).find(selectors.specialEducationComponent.headcountColumnData).should('have.length', 2);
      cy.get(selectors.specialEducationComponent.headcountCard).eq(0).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(0).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('span').should('contain.text', '1');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(0).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(0).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('span').should('contain.text', '1');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(1).find(selectors.specialEducationComponent.headcountHeader).should('contain.text', 'B - Deafblind');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(1).find(selectors.specialEducationComponent.headcountColumnData).should('have.length', 2);
      cy.get(selectors.specialEducationComponent.headcountCard).eq(1).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(1).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('span').should('contain.text', '0');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(1).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(1).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('span').should('contain.text', '0');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(2).find(selectors.specialEducationComponent.headcountHeader).should('contain.text', 'C - Moderate to Profound Intellectual Disability');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(2).find(selectors.specialEducationComponent.headcountColumnData).should('have.length', 2);
      cy.get(selectors.specialEducationComponent.headcountCard).eq(2).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(2).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('span').should('contain.text', '0');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(2).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(2).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('span').should('contain.text', '0');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(3).find(selectors.specialEducationComponent.headcountHeader).should('contain.text', 'D - Physical Disability or Chronic Health Impairment');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(3).find(selectors.specialEducationComponent.headcountColumnData).should('have.length', 2);
      cy.get(selectors.specialEducationComponent.headcountCard).eq(3).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(3).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('span').should('contain.text', '0');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(3).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(3).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('span').should('contain.text', '0');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(4).find(selectors.specialEducationComponent.headcountHeader).should('contain.text', 'E - Visual Impairment');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(4).find(selectors.specialEducationComponent.headcountColumnData).should('have.length', 2);
      cy.get(selectors.specialEducationComponent.headcountCard).eq(4).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(4).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('span').should('contain.text', '0');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(4).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(4).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('span').should('contain.text', '0');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(5).find(selectors.specialEducationComponent.headcountHeader).should('contain.text', 'F - Deaf or Hard of Hearing');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(5).find(selectors.specialEducationComponent.headcountColumnData).should('have.length', 2);
      cy.get(selectors.specialEducationComponent.headcountCard).eq(5).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(5).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('span').should('contain.text', '0');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(5).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(5).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('span').should('contain.text', '0');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(6).find(selectors.specialEducationComponent.headcountHeader).should('contain.text', 'G - Autism Spectrum Disorder');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(6).find(selectors.specialEducationComponent.headcountColumnData).should('have.length', 2);
      cy.get(selectors.specialEducationComponent.headcountCard).eq(6).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(6).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('span').should('contain.text', '1');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(6).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(6).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('span').should('contain.text', '1');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(7).find(selectors.specialEducationComponent.headcountHeader).should('contain.text', 'H - Intensive Behaviour Interventions or Serious Mental Illness');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(7).find(selectors.specialEducationComponent.headcountColumnData).should('have.length', 2);
      cy.get(selectors.specialEducationComponent.headcountCard).eq(7).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(7).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('span').should('contain.text', '0');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(7).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(7).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('span').should('contain.text', '0');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(8).find(selectors.specialEducationComponent.headcountHeader).should('contain.text', 'K - Mild Intellectual Disability');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(8).find(selectors.specialEducationComponent.headcountColumnData).should('have.length', 2);
      cy.get(selectors.specialEducationComponent.headcountCard).eq(8).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(8).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('span').should('contain.text', '0');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(8).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(8).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('span').should('contain.text', '0');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(9).find(selectors.specialEducationComponent.headcountHeader).should('contain.text', 'P - Gifted');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(9).find(selectors.specialEducationComponent.headcountColumnData).should('have.length', 2);
      cy.get(selectors.specialEducationComponent.headcountCard).eq(9).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(9).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('span').should('contain.text', '0');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(9).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(9).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('span').should('contain.text', '0');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(10).find(selectors.specialEducationComponent.headcountHeader).should('contain.text', 'Q - Learning Disability');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(10).find(selectors.specialEducationComponent.headcountColumnData).should('have.length', 2);
      cy.get(selectors.specialEducationComponent.headcountCard).eq(10).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(10).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('span').should('contain.text', '0');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(10).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(10).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('span').should('contain.text', '0');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(11).find(selectors.specialEducationComponent.headcountHeader).should('contain.text', 'R - Moderate Behaviour Support/Mental Illness');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(11).find(selectors.specialEducationComponent.headcountColumnData).should('have.length', 2);
      cy.get(selectors.specialEducationComponent.headcountCard).eq(11).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(11).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('span').should('contain.text', '0');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(11).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
      cy.get(selectors.specialEducationComponent.headcountCard).eq(11).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('span').should('contain.text', '0');
    });
  });
});

function checkCareerHeader(headerIndex: number, headerTitle: string, length: number, eligible: string, reported: string, notReported: string) {
  cy.get(selectors.careerProgramComponent.headcountCard).eq(headerIndex).find(selectors.careerProgramComponent.headcountHeader).should('contain.text', headerTitle);
  cy.get(selectors.careerProgramComponent.headcountCard).eq(headerIndex).find(selectors.careerProgramComponent.headcountColumnData).should('have.length', length);
  cy.get(selectors.careerProgramComponent.headcountCard).eq(headerIndex).find(selectors.careerProgramComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
  cy.get(selectors.careerProgramComponent.headcountCard).eq(headerIndex).find(selectors.careerProgramComponent.headcountColumnData).eq(0).children('span').should('contain.text', eligible);
  cy.get(selectors.careerProgramComponent.headcountCard).eq(headerIndex).find(selectors.careerProgramComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
  cy.get(selectors.careerProgramComponent.headcountCard).eq(headerIndex).find(selectors.careerProgramComponent.headcountColumnData).eq(1).children('span').should('contain.text', reported);
  cy.get(selectors.careerProgramComponent.headcountCard).eq(headerIndex).find(selectors.careerProgramComponent.headcountColumnData).eq(2).children('div').should('contain.text', 'Not Reported');
  cy.get(selectors.careerProgramComponent.headcountCard).eq(headerIndex).find(selectors.careerProgramComponent.headcountColumnData).eq(2).children('span').should('contain.text', notReported);
}

import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import { SchoolCollectionOptions, SdcStudentEllOption } from 'tests-e2e/cypress/services/sdc-collection-api-service';

describe('SDC School Collection View', () => {
  context('As an EDX School User', () => {
    before(() => {
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task<SchoolCollectionOptions, SdcSchoolCollection>('setup-collections', {
          school: res.school,
          loadWithStudentAndValidations: true,
          seedData: 'stepThreeHeadcountSeedData'
        }).then(collection => {
          const studentWithEllYears = collection.students
            .filter(s => s.assignedStudentId === 'ce4bec97-b986-4815-a9f8-6bdfe8578dcf')
            .map(s => ({
              studentID: s.assignedStudentId,
              yearsInEll: 3
            }) as SdcStudentEll);
          cy.task<SdcStudentEllOption, SdcStudentEll>('setup-student-ells', studentWithEllYears);
        });
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', { schoolCodes: ['99998'] });
      });
    });
    // after(() => cy.logout());
    beforeEach(() => cy.login());

    it('can load dashboard & click data collection card & process collection', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.title).contains('Dashboard | EDX Automation Testing School');
      cy.get(selectors.dashboard.dataCollectionsTileTitle).contains('Student Level Data Collection (1701)');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.title).should('exist').contains('Student Level Data (1701) | EDX Automation Testing School');
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
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
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).should('have.length', 4);
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountHeader).should('contain.text', 'Student Headcount');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Under School Aged');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(0).children('span').should('contain.text', '0');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'School Aged');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(1).children('span').should('contain.text', '3');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(2).children('div').should('contain.text', 'Adult');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(2).children('span').should('contain.text', '0');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(3).children('div').should('contain.text', 'All Students');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(3).children('span').should('contain.text', '3');
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountHeader).should('contain.text', 'Grade Headcount');
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountColumnData).should('have.length', 2);
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountColumnData).eq(0).children('div').should('contain.text', '09');
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountColumnData).eq(0).children('span').should('contain.text', '2');
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountColumnData).eq(1).children('div').should('contain.text', '11');
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountColumnData).eq(1).children('span').should('contain.text', '1');

      //check summary table
      cy.get(selectors.fteComponent.table).should('exist').contains(1);
      cy.get(selectors.fteComponent.table).eq(0).find(selectors.fteComponent.tableWrapper);
      cy.get(selectors.fteComponent.tableWrapper).contains('School Aged');
      cy.get(selectors.fteComponent.tableWrapper).contains('Adult');
      cy.get(selectors.fteComponent.tableWrapper).contains('All Students');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.underSchoolAgedHeadcount).should('contain.text', '0');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.underSchoolAgedEligibleFTE).should('contain.text', '0');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.underSchoolAgedTotal).should('contain.text', '0');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.schoolAgedHeadcount).should('contain.text', '3');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.schoolAgedEligibleFTE).should('contain.text', '3');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.schoolAgedTotal).should('contain.text', '2.8750');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.adultHeadcount).should('contain.text', '0');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.adultEligibleFTE).should('contain.text', '0');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.adultTotal).should('contain.text', '0');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.allHeadcount).should('contain.text', '3');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.allEligibleFTE).should('contain.text', '3');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.allTotal).should('contain.text', '2.8750');

      cy.get(selectors.studentLevelData.compareSwitch).click();
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.underSchoolAgedHeadcount).should('contain.text', '00');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.underSchoolAgedEligibleFTE).should('contain.text', '00');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.underSchoolAgedTotal).should('contain.text', '00');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.schoolAgedHeadcount).should('contain.text', '03');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.schoolAgedEligibleFTE).should('contain.text', '03');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.schoolAgedTotal).should('contain.text', '02.8750');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.adultHeadcount).should('contain.text', '00');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.adultEligibleFTE).should('contain.text', '00');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.adultTotal).should('contain.text', '00');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.allHeadcount).should('contain.text', '03');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.allEligibleFTE).should('contain.text', '03');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.allTotal).should('contain.text', '02.8750');
    });

    it('verifies french programs for reported students', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get(selectors.stepThreeTabSlider.frenchProgramsButton).click();
      cy.get(selectors.studentLevelData.detailsLoadingBar).should('exist');
      cy.get(selectors.frenchComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(2);
      cy.get(selectors.frenchComponent.tab).find('tbody tr').each($cell => {
        cy.wrap($cell).children().last().invoke('text').then((text) => {
          expect(text).to.satisfy((value: string) => {
            return value === 'Core French (08)' || value === 'Early French Immersion (11)';
          });
        });
      });

      // check summary headcount headers
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

      // check summary headcounts
      cy.get(selectors.frenchComponent.table).should('exist').contains(1);
      cy.get(selectors.frenchComponent.table).eq(0).find(selectors.frenchComponent.tableWrapper);
      cy.get(selectors.frenchComponent.tableWrapper).eq(0).find(selectors.frenchComponent.thead);
      cy.get(selectors.frenchComponent.tableWrapper).contains('Core French');
      cy.get(selectors.frenchComponent.tableWrapper).contains('Early French Immersion');
      cy.get(selectors.frenchComponent.tableWrapper).contains('Late French Immersion');
      cy.get(selectors.frenchComponent.tableWrapper).contains('All French Programs');
      cy.get(selectors.frenchComponent.tableWrapper).find(selectors.frenchComponent.coreFrenchTotal).should('contain.text', '1');
      cy.get(selectors.frenchComponent.tableWrapper).find(selectors.frenchComponent.coreFrenchSchoolAged).should('contain.text', '1');
      cy.get(selectors.frenchComponent.tableWrapper).find(selectors.frenchComponent.earlyFrenchTotal).should('contain.text', '1');
      cy.get(selectors.frenchComponent.tableWrapper).find(selectors.frenchComponent.earlyFrenchSchoolAged).should('contain.text', '1');
      cy.get(selectors.frenchComponent.tableWrapper).find(selectors.frenchComponent.allFrenchTotal).should('contain.text', '2');
      cy.get(selectors.frenchComponent.tableWrapper).find(selectors.frenchComponent.allFrenchSchoolAged).should('contain.text', '2');
      cy.get(selectors.frenchComponent.tableWrapper).find(selectors.frenchComponent.allFrenchAdult).should('contain.text', '0');

      cy.get(selectors.studentLevelData.compareSwitch).click();
      cy.get(selectors.frenchComponent.tableWrapper).find(selectors.frenchComponent.coreFrenchTotal).should('contain.text', '01');
      cy.get(selectors.frenchComponent.tableWrapper).find(selectors.frenchComponent.coreFrenchSchoolAged).should('contain.text', '01');
      cy.get(selectors.frenchComponent.tableWrapper).find(selectors.frenchComponent.earlyFrenchTotal).should('contain.text', '01');
      cy.get(selectors.frenchComponent.tableWrapper).find(selectors.frenchComponent.earlyFrenchSchoolAged).should('contain.text', '01');
      cy.get(selectors.frenchComponent.tableWrapper).find(selectors.frenchComponent.allFrenchTotal).should('contain.text', '02');
      cy.get(selectors.frenchComponent.tableWrapper).find(selectors.frenchComponent.allFrenchSchoolAged).should('contain.text', '02');
      cy.get(selectors.frenchComponent.tableWrapper).find(selectors.frenchComponent.allFrenchAdult).should('contain.text', '00');
    });

    it('verifies career programs for reported students', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get(selectors.stepThreeTabSlider.careerProgramsButton).click();

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

      //check table contents
      const numOfSubsectionRows = 9;
      const numOfCareerTableColumns = 7;
      const emptyHeadcounts = Array.from(Array(numOfSubsectionRows), () => Array(numOfCareerTableColumns).fill(0));
      checkCareerTableSection(0,'Career Preparation', emptyHeadcounts);

      const coopEdHeadcounts = [...emptyHeadcounts];
      const coopEdHeadcountsInner = [0, 1, 0, 0, 0, 0, 1];
      coopEdHeadcounts.splice(0, 1, coopEdHeadcountsInner);
      coopEdHeadcounts.splice(1, 1, coopEdHeadcountsInner);
      checkCareerTableSection(1, 'Co-Operative Education', coopEdHeadcounts);

      const techOrYouthHeadcounts = [...emptyHeadcounts];
      const techOrYouthHeadcountsInner = [0, 0, 0, 1, 0, 0, 1];
      techOrYouthHeadcounts.splice(0, 1, techOrYouthHeadcountsInner);
      techOrYouthHeadcounts.splice(8, 1, techOrYouthHeadcountsInner);
      checkCareerTableSection(2, 'Career Technical or Youth in Trades', techOrYouthHeadcounts);

      checkCareerTableSection(3, 'Apprenticeship', emptyHeadcounts);

      const allHeadcounts = [...emptyHeadcounts];
      const totalHeadcountsInner = [0, 1, 0, 1, 0, 0, 2];
      const xaHeadcountsInner = [0, 1, 0, 0, 0, 0, 1];
      const xhHeadcountsInner = [0, 0, 0, 1, 0, 0, 1];
      allHeadcounts.splice(0, 1, totalHeadcountsInner);
      allHeadcounts.splice(1, 1, xaHeadcountsInner);
      allHeadcounts.splice(8, 1, xhHeadcountsInner);
      checkCareerTableSection(4, 'All Career Programs', allHeadcounts);
    });

    it('verifies indigenous programs for reported students', () => {
      cy.intercept(Cypress.env('interceptors').collection_by_school_id).as('collection');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.wait('@collection');
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get(selectors.stepThreeTabSlider.indigenousStudentsButton).click();

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
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(0).find(selectors.indigenousSupportComponent.headcountColumnData).eq(0).children('span').should('contain.text', '1');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(0).find(selectors.indigenousSupportComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(0).find(selectors.indigenousSupportComponent.headcountColumnData).eq(1).children('span').should('contain.text', '1');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(0).find(selectors.indigenousSupportComponent.headcountColumnData).eq(2).children('div').should('contain.text', 'Not Reported');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(0).find(selectors.indigenousSupportComponent.headcountColumnData).eq(2).children('span').should('contain.text', '2');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(1).find(selectors.indigenousSupportComponent.headcountHeader).should('contain.text', 'Indigenous Support Services');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(1).find(selectors.indigenousSupportComponent.headcountColumnData).should('have.length', 3);
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(1).find(selectors.indigenousSupportComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(1).find(selectors.indigenousSupportComponent.headcountColumnData).eq(0).children('span').should('contain.text', '0');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(1).find(selectors.indigenousSupportComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(1).find(selectors.indigenousSupportComponent.headcountColumnData).eq(1).children('span').should('contain.text', '1');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(1).find(selectors.indigenousSupportComponent.headcountColumnData).eq(2).children('div').should('contain.text', 'Not Reported');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(1).find(selectors.indigenousSupportComponent.headcountColumnData).eq(2).children('span').should('contain.text', '2');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(2).find(selectors.indigenousSupportComponent.headcountHeader).should('contain.text', 'Other Approved Indigenous Prog');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(2).find(selectors.indigenousSupportComponent.headcountColumnData).should('have.length', 3);
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(2).find(selectors.indigenousSupportComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(2).find(selectors.indigenousSupportComponent.headcountColumnData).eq(0).children('span').should('contain.text', '0');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(2).find(selectors.indigenousSupportComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(2).find(selectors.indigenousSupportComponent.headcountColumnData).eq(1).children('span').should('contain.text', '0');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(2).find(selectors.indigenousSupportComponent.headcountColumnData).eq(2).children('div').should('contain.text', 'Not Reported');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(2).find(selectors.indigenousSupportComponent.headcountColumnData).eq(2).children('span').should('contain.text', '3');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(3).find(selectors.indigenousSupportComponent.headcountHeader).should('contain.text', 'Indigenous Ancestry');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(3).find(selectors.indigenousSupportComponent.headcountColumnData).should('have.length', 1);
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(3).find(selectors.indigenousSupportComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Total Students');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(3).find(selectors.indigenousSupportComponent.headcountColumnData).eq(0).children('span').should('contain.text', '2');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(4).find(selectors.indigenousSupportComponent.headcountHeader).should('contain.text', 'Ordinarily Living on Reserve');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(4).find(selectors.indigenousSupportComponent.headcountColumnData).should('have.length', 1);
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(4).find(selectors.indigenousSupportComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Total Students');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(4).find(selectors.indigenousSupportComponent.headcountColumnData).eq(0).children('span').should('contain.text', '0');

      //check headcounts report
      cy.get(`${selectors.sdcDocumentUploadStep.indigenousReportRows}`).last().find('td').last().should('be.visible');
      cy.get(`${selectors.sdcDocumentUploadStep.indigenousReportRows}`).each(($cell, index) => {
        if(index === 0) {
          cy.wrap($cell).find('td').last().should('contain', '1');
        } else if(index === 1) {
          cy.wrap($cell).find('td').last().should('contain', '0');
        } else if(index === 2) {
          cy.wrap($cell).find('td').last().should('contain', '0');
        } else if(index === 3) {
          cy.wrap($cell).find('td').last().should('contain', '1');
        }
      });
    });

    it('verifies english language learning programs for reported students', () => {
      cy.intercept(Cypress.env('interceptors').collection_by_school_id).as('collection');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.wait('@collection');
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get(selectors.stepThreeTabSlider.englishLanguageLearningButton).click();

      cy.get(selectors.studentLevelData.detailsLoadingBar).should('exist');
      cy.get(selectors.ellComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(2);

      // Find the table row with the student pen that should have 3 years of ell
      cy.get(`${selectors.ellComponent.tab} tbody tr`).contains('101932770').parentsUntil('tbody')
        .children().last().invoke('text').then(text => {
          expect(text).equal('English Language Learning (17)-');
        });

      // Find the table row with the student pen that should have no record of years in ell yet
      cy.get(`${selectors.ellComponent.tab} tbody tr`).contains('102866365').parentsUntil('tbody')
        .children().last().invoke('text').then(text => {
          expect(text).equal('English Language Learning (17)-');
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
      cy.get(selectors.stepThreeTabSlider.specialEducationButton).click();

      cy.get(selectors.studentLevelData.detailsLoadingBar).should('exist');
      cy.get(selectors.specialEducationComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(2);
      cy.get(selectors.specialEducationComponent.tab).find('tbody tr').each($cell => {
        cy.wrap($cell).children().last().invoke('text').then((text) => {
          expect(text).to.satisfy((value: string) => {
            return value === 'Physically Dependent (A)' || value === 'Autism Spectrum Disorder (G)';
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

      //check headcounts summary report
      cy.get(`${selectors.sdcDocumentUploadStep.spedTab} .section-header`).last().find('td').last().should('be.visible');
      cy.get(`${selectors.sdcDocumentUploadStep.spedTab} .section-header`).each(($cell, index) => {
        if(index === 0) {
          cy.wrap($cell).find('td').last().should('contain', '1');
        } else if(index === 1) {
          cy.wrap($cell).find('td').last().should('contain', '1');
        } else if(index === 2) {
          cy.wrap($cell).find('td').last().should('contain', '0');
        } else if(index === 3) {
          cy.wrap($cell).find('td').last().should('contain', '0');
        } else if(index === 4) {
          cy.wrap($cell).find('td').last().should('contain', '2');
        }
      });
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

function checkCareerTableSection(subheadingIndex: number, subheaderTitle: string, expectedValues: number[][] ){
  const subheadings = ['XA - Business & Applied Business', 'XB - Fine Arts, Design, & Media', 'XC - Fitness & Recreation',
    'XD - Health & Human Services', 'XE - Liberal Arts & Humanities', 'XF - Science & Applied Science', 'XG - Tourism, ' +
    'Hospitality & Foods', 'XH - Trades & Technology'];

  cy.get(selectors.careerProgramComponent.headcountTableSubHeading).eq(subheadingIndex).should('contain.text', subheaderTitle + expectedValues[0].join(''))
    .next().should('contain.text', subheadings[0] + expectedValues[1].join(''))
    .next().should('contain.text', subheadings[1] + expectedValues[2].join(''))
    .next().should('contain.text', subheadings[2] + expectedValues[3].join(''))
    .next().should('contain.text', subheadings[3] + expectedValues[4].join(''))
    .next().should('contain.text', subheadings[4] + expectedValues[5].join(''))
    .next().should('contain.text', subheadings[5] + expectedValues[6].join(''))
    .next().should('contain.text', subheadings[6] + expectedValues[7].join(''))
    .next().should('contain.text', subheadings[7] + expectedValues[8].join(''));
}

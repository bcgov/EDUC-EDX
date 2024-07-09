import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import {SchoolCollectionOptions, SdcStudentEllOption} from '../../services/sdc-collection-api-service';

describe('SDC School Collection View', () => {
  context('As an EDX School User', () => {
    before(() => {
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task<SchoolCollectionOptions, SdcCollections>('setup-collections', {
          school: res.schools[0],
          loadWithStudentAndValidations: true,
          seedData: 'filterData'
        }).then(collection => {
          const studentWithEllYears = collection?.sdcSchoolCollections[0]?.students
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
    after(() => cy.logout()); 
    beforeEach(() => cy.login());

    it('verifies filters for fte tab', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();

      cy.wait('@pagination').then(()=> {
        cy.get(selectors.fteComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(3);
        cy.get(selectors.fteComponent.tab).find(selectors.fteComponent.filterButton).click();
        checkCommonFiltersExist();

        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.isAdult).click();
        cy.get(selectors.filters.cancelBtn).click();
        cy.get(selectors.fteComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(0);

        cy.get(selectors.fteComponent.tab).find(selectors.fteComponent.filterButton).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.clearFilter).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.isSchoolAged).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.fteGt0).click();
        cy.get(selectors.filters.cancelBtn).click();

        cy.get(selectors.fteComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(3);

        cy.get(selectors.fteComponent.tab).find(selectors.fteComponent.filterButton).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.clearFilter).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.hasSupportBlocks).click();
        cy.get(selectors.filters.cancelBtn).click();

        cy.get(selectors.fteComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(0);

        cy.get(selectors.fteComponent.tab).find(selectors.fteComponent.filterButton).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.clearFilter).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.noSupportBlocks).click();
        cy.get(selectors.filters.cancelBtn).click();

        cy.get(selectors.fteComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(3);
      });
    });

    it('verifies filters for special education tab', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get(selectors.stepThreeTabSlider.specialEducationButton).click();

      cy.wait('@pagination').then(()=> {
        cy.get(selectors.specialEducationComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(2);
        cy.get(selectors.specialEducationComponent.tab).find(selectors.fteComponent.filterButton).click();
        checkCommonFiltersExist();

        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.fteGt0).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.grade8).click();
        cy.get(selectors.filters.cancelBtn).click();
        cy.get(selectors.specialEducationComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(1);

        cy.get(selectors.specialEducationComponent.tab).find('tbody tr').each($cell => {
          cy.wrap($cell).children().should('contain', '08');
        });
      });
    });

    it('verifies special filters for special education tab', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get(selectors.stepThreeTabSlider.specialEducationButton).click();

      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('paginationFilters1');
      cy.get(selectors.specialEducationComponent.tab).find(selectors.fteComponent.filterButton).click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('A - Physically Dependent').click();
      cy.get(selectors.filters.cancelBtn).click();

      cy.wait('@paginationFilters1');
      cy.get(selectors.specialEducationComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(1);
      cy.get(selectors.specialEducationComponent.tab).find('tbody tr').each($cell => {
        cy.wrap($cell).children().last().invoke('text').then((text) => {
          expect(text).to.satisfy((value: string) => {
            return value === 'Physically Dependent (A)';
          });
        });
      });

      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('paginationFilters2');
      cy.get(selectors.specialEducationComponent.tab).find(selectors.fteComponent.filterButton).click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('Clear').click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('G - Autism Spectrum Disorder').click();
      cy.get(selectors.filters.cancelBtn).click();

      cy.wait('@paginationFilters2');
      cy.get(selectors.specialEducationComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(1);
      cy.get(selectors.specialEducationComponent.tab).find('tbody tr').each($cell => {
        cy.wrap($cell).children().last().invoke('text').then((text) => {
          expect(text).to.satisfy((value: string) => {
            return value === 'Autism Spectrum Disorder (G)';
          });
        });
      });

      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('paginationFilters3');
      cy.get(selectors.specialEducationComponent.tab).find(selectors.fteComponent.filterButton).click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('Clear').click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('Not Funding Eligible').click();
      cy.get(selectors.filters.cancelBtn).click();

      cy.wait('@paginationFilters3');
      cy.get(selectors.specialEducationComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(0);
    });

    it('verifies filters for career tab', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get(selectors.stepThreeTabSlider.careerProgramsButton).click();

      cy.wait('@pagination').then(()=> {
        cy.get(selectors.careerProgramComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(2);
        cy.get(selectors.careerProgramComponent.tab).find(selectors.fteComponent.filterButton).click();
        checkCommonFiltersExist();

        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.career41).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.grade8).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.grade9).click();
        cy.get(selectors.filters.cancelBtn).click();
        cy.get(selectors.careerProgramComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(1);

        cy.get(selectors.careerProgramComponent.tab).find(selectors.fteComponent.filterButton).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.clearFilter).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.codeXH).click();
        cy.get(selectors.filters.cancelBtn).click();
        cy.get(selectors.careerProgramComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(1);

        cy.get(selectors.careerProgramComponent.tab).find(selectors.fteComponent.filterButton).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.career41).click();
        cy.get(selectors.filters.cancelBtn).click();
        cy.get(selectors.careerProgramComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(0);
      });
    });

    it('verifies filters for french tab', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get(selectors.stepThreeTabSlider.frenchProgramsButton).click();

      cy.wait('@pagination').then(()=> {
        cy.get(selectors.frenchComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(2);
        cy.get(selectors.frenchComponent.tab).find(selectors.fteComponent.filterButton).click();
        checkCommonFiltersExist();
      });
    });

    it('verifies special filters for french tab', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get(selectors.stepThreeTabSlider.frenchProgramsButton).click();

      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('paginationFilters1');
      cy.get(selectors.frenchComponent.tab).find(selectors.fteComponent.filterButton).click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('11 - Early French Immersion').click();
      cy.get(selectors.filters.cancelBtn).click();

      cy.wait('@paginationFilters1');
      cy.get(selectors.frenchComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(1);
      cy.get(selectors.frenchComponent.tab).find('tbody tr').each($cell => {
        cy.wrap($cell).children().last().invoke('text').then((text) => {
          expect(text).to.satisfy((value: string) => {
            return value === 'Early French Immersion (11)';
          });
        });
      });

      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('paginationFilters2');
      cy.get(selectors.frenchComponent.tab).find(selectors.fteComponent.filterButton).click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('Clear').click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('14 - Late French Immersion').click();
      cy.get(selectors.filters.cancelBtn).click();

      cy.wait('@paginationFilters2');
      cy.get(selectors.frenchComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(0);

      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('paginationFilters3');
      cy.get(selectors.frenchComponent.tab).find(selectors.fteComponent.filterButton).click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('Clear').click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('08 - Core French').click();
      cy.get(selectors.filters.cancelBtn).click();

      cy.wait('@paginationFilters3');
      cy.get(selectors.frenchComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(1);
      cy.get(selectors.frenchComponent.tab).find('tbody tr').each($cell => {
        cy.wrap($cell).children().last().invoke('text').then((text) => {
          expect(text).to.satisfy((value: string) => {
            return value === 'Core French (08)';
          });
        });
      });

      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('paginationFilters4');
      cy.get(selectors.frenchComponent.tab).find(selectors.fteComponent.filterButton).click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('Clear').click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('Funding Eligible').click();
      cy.get(selectors.filters.cancelBtn).click();

      cy.wait('@paginationFilters4');
      cy.get(selectors.frenchComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(2);

      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('paginationFilters5');
      cy.get(selectors.frenchComponent.tab).find(selectors.fteComponent.filterButton).click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('Clear').click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('Not Funding Eligible').click();
      cy.get(selectors.filters.cancelBtn).click();

      cy.wait('@paginationFilters5');
      cy.get(selectors.frenchComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(0);
    });

    it('verifies filters for indigenous tab', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get(selectors.stepThreeTabSlider.indigenousStudentsButton).click();

      cy.wait('@pagination').then(()=> {
        cy.get(selectors.indigenousSupportComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(3);
        cy.get(selectors.indigenousSupportComponent.tab).find(selectors.fteComponent.filterButton).click();
        checkCommonFiltersExist();

        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.hasIndiAncestry).click();
        cy.get(selectors.filters.cancelBtn).click();
        cy.get(selectors.indigenousSupportComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(1);

        cy.get(selectors.indigenousSupportComponent.tab).find(selectors.fteComponent.filterButton).click();

        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.clearFilter).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.hasBandCode).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.bandCodeSelector).type('{selectall}{backspace}');
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.bandCodeSelector).type('KWANLIN DUN (0500)');
        cy.get(selectors.filters.bandCodeAutoCompleteSelector).contains('KWANLIN DUN (0500)').click();
        cy.get(selectors.filters.cancelBtn).click();

        cy.get(selectors.indigenousSupportComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(3);
        cy.get(selectors.indigenousSupportComponent.tab).find(selectors.fteComponent.filterButton).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.clearFilter).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.hasBandCode).click();
        cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.grade8).click();
        cy.get(selectors.filters.cancelBtn).click();

        cy.get(selectors.indigenousSupportComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(1);
      });
    });

    it('verifies filters for ELL tab', () => {
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get(selectors.stepThreeTabSlider.englishLanguageLearningButton).click();

      cy.wait('@pagination').then(()=> {
        cy.get(selectors.ellComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(2);
        cy.get(selectors.ellComponent.tab).find(selectors.fteComponent.filterButton).click();
        checkCommonFiltersExist();
      });
    });

    it('verifies special filters for ELL tab', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.get(selectors.stepThreeTabSlider.englishLanguageLearningButton).click();

      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('paginationFilters1');
      cy.get(selectors.ellComponent.tab).find(selectors.fteComponent.filterButton).click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('1-5 years in ELL').click();
      cy.get(selectors.filters.cancelBtn).click();

      cy.wait('@paginationFilters1');
      cy.get(selectors.ellComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(1);
      cy.get(selectors.ellComponent.tab).find('tbody tr').each($cell => {
        cy.wrap($cell).children().last().invoke('text').then((text) => {
          expect(text).to.satisfy((value: string) => {
            return value === 'English Language Learning (17)3';
          });
        });
      });

      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('paginationFilters2');
      cy.get(selectors.ellComponent.tab).find(selectors.fteComponent.filterButton).click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('Clear').click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('6+ years in ELL').click();
      cy.get(selectors.filters.cancelBtn).click();
      cy.wait('@paginationFilters2');
      cy.get(selectors.ellComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(0);

      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('paginationFilters3');
      cy.get(selectors.ellComponent.tab).find(selectors.fteComponent.filterButton).click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('Clear').click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('Funding Eligible').click();
      cy.get(selectors.filters.cancelBtn).click();

      cy.wait('@paginationFilters3');
      cy.get(selectors.ellComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(2);
      cy.get(selectors.ellComponent.tab).find('tbody tr').each($cell => {
        cy.wrap($cell).children().last().invoke('text').then((text) => {
          expect(text).to.satisfy((value: string) => {
            return value === 'English Language Learning (17)3' || value === 'English Language Learning (17)-';
          });
        });
      });

      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('paginationFilters4');
      cy.get(selectors.ellComponent.tab).find(selectors.fteComponent.filterButton).click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('Clear').click();
      cy.get(selectors.activeFiltersDrawer.drawer).contains('Not Funding Eligible').click();
      cy.get(selectors.filters.cancelBtn).click();

      cy.wait('@paginationFilters4');
      cy.get(selectors.ellComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(0);
    });

    it('can search for a student by name, PEN, or local ID', () => {
      cy.visit('/');
      cy.get(selectors.dashboard.dataCollectionsTile).click();
      cy.get(selectors.dataCollectionsLanding.continue).contains('Continue').click();
      cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('pagination');

      cy.wait('@pagination').then(()=> {
        cy.get(selectors.fteComponent.tab).find(selectors.studentLevelData.studentsFound).should('exist').contains(3);
        cy.get(selectors.fteComponent.tab).find(selectors.fteComponent.filterButton).click();
        checkCommonFiltersExist();
        cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('paginationFilters');
        cy.get(selectors.studentLevelData.stepThreeSearchField).type('102866365');
        cy.wait('@paginationFilters');
        cy.get(selectors.filters.cancelBtn).click();
        cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 1');

      });
    });
  });
});

function checkCommonFiltersExist() {
  cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.studentType).should('contain.text', 'Student Type');
  cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.warnings).should('contain.text', 'Warnings');
  cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.fte).should('contain.text', 'FTE');
  cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.grade).should('contain.text', 'Grade');
  cy.get(selectors.activeFiltersDrawer.drawer).find(selectors.filters.fundingtype).should('contain.text', 'Funding Type');
}

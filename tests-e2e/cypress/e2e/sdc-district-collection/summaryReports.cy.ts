import selectors from '../../support/selectors';
import { AppSetupData } from '../../../cypress.config';
import { DistrictCollectionOptions } from 'tests-e2e/cypress/services/sdc-collection-api-service';

describe('SDC District Collection View', () => {
  context('As an EDX District User', () => {
    before(() => {
      cy.logout();
      cy.task<AppSetupData>('districtDataLoad', {
        schoolOptions: [
          {
            includeTombstoneValues: true,
            includeSchoolAddress: true,
            includeSchoolContact: true,
            schoolStatus: 'Open',
            withPrimaryActivationCode: true,
            isIndependentSchool: false,
            schoolCode: '99990'
          },
          {
            includeTombstoneValues: true,
            includeSchoolAddress: true,
            includeSchoolContact: true,
            schoolStatus: 'Open',
            withPrimaryActivationCode: true,
            isIndependentSchool: false,
            schoolCode: '99991'
          }
        ]
      }).then(res => {
        cy.task<DistrictCollectionOptions, SdcCollections>('setup-district-collections', {
          schools: res.schools,
          district: res.district,
          loadWithStudentAndValidations: false,
          seedData: 'sdcDistrictCollectionSummarySeedData'
        }).then(response => {
          Cypress.env('sdcDistrictCollectionID', response?.sdcDistrictCollection?.sdcDistrictCollectionID);
        });
        cy.task('setup-districtUser', { districtRoles: ['DISTRICT_SDC'], districtCodes: ['998'] });
      });
    });
    beforeEach(() => cy.login());

    it('can view Eligible Enrolment & Eligible FTE report', () => {
      cy.visit('/open-district-collection-details/' + Cypress.env('sdcDistrictCollectionID'));
      cy.get(selectors.studentLevelData.stepThree).should('exist').should('have.class', 'v-stepper-item--selected');
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 10');

      //check summary headcounts
      cy.get(selectors.fteComponent.summaryButton).click();
      cy.get(selectors.fteComponent.headcountCard).should('have.length', 2);
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).should('have.length', 4);
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountHeader).should('contain.text', 'Student Headcount');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Preschool Aged');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(0).children('div:nth-child(2)').children('span').should('contain.text', '0');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'School Aged');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(1).children('div:nth-child(2)').children('span').should('contain.text', '10');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(2).children('div').should('contain.text', 'Adult');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(2).children('div:nth-child(2)').children('span').should('contain.text', '0');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(3).children('div').should('contain.text', 'All Students');
      cy.get(selectors.fteComponent.headcountCard).eq(0).find(selectors.fteComponent.headcountColumnData).eq(3).children('div:nth-child(2)').children('span').should('contain.text', '10');
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountHeader).should('contain.text', 'Grade Headcount');
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountColumnData).should('have.length', 2);
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountColumnData).eq(0).children('div').should('contain.text', '09');
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountColumnData).eq(0).children('div:nth-child(2)').children('span').should('contain.text', '6');
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountColumnData).eq(1).children('div').should('contain.text', '10');
      cy.get(selectors.fteComponent.headcountCard).eq(1).find(selectors.fteComponent.headcountColumnData).eq(1).children('div:nth-child(2)').children('span').should('contain.text', '4');

      // check summary table
      cy.get(selectors.fteComponent.table).should('exist').contains(1);
      cy.get(selectors.fteComponent.table).eq(0).find(selectors.fteComponent.tableWrapper);
      cy.get(selectors.fteComponent.tableWrapper).contains('School Aged');
      cy.get(selectors.fteComponent.tableWrapper).contains('Adult');
      cy.get(selectors.fteComponent.tableWrapper).contains('All Students');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.districtSchoolAgedHeadcount).should('contain.text', '10');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.districtSchoolAgedEligibleFTE).should('contain.text', '10');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.districtSchoolAgedTotal).should('contain.text', '9.1000');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.districtAdultHeadcount).should('contain.text', '0');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.districtAdultEligibleFTE).should('contain.text', '0');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.districtAdultTotal).should('contain.text', '0');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.districtAllHeadcount).should('contain.text', '10');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.districtAllEligibleFTE).should('contain.text', '10');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.districtAllTotal).should('contain.text', '9.1000');
    });

    it('can view Grade Enrolment & FTE per School report', () => {
      cy.visit('/open-district-collection-details/' + Cypress.env('sdcDistrictCollectionID'));
      cy.get(selectors.studentLevelData.stepThree).should('exist').should('have.class', 'v-stepper-item--selected');
      cy.get(selectors.studentLevelData.stepThreeStudentsFound).contains('Students Found: 10');
      cy.get(selectors.fteComponent.summaryButton).click();

      cy.get(selectors.fteComponent.availableReports).parent().click();
      cy.get(selectors.dropdown.listItem).contains('Grade Enrolment & FTE per School').click();

      // check summary table
      cy.get(selectors.fteComponent.table).should('exist').contains(1);
      cy.get(selectors.fteComponent.table).eq(0).find(selectors.fteComponent.tableWrapper);
      cy.get(selectors.fteComponent.tableWrapper).contains('99899990 - EDX Automation Testing School');
      cy.get(selectors.fteComponent.tableWrapper).contains('99899991 - EDX Automation Testing School');
      cy.get(selectors.fteComponent.tableWrapper).contains('All Schools');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.school1Headcount).should('contain.text', '5');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.school1FTETotal).should('contain.text', '4.5500');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.school2Headcount).should('contain.text', '5');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.school2FTETotal).should('contain.text', '4.5500');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.allSchoolHeadcount).should('contain.text', '10');
      cy.get(selectors.fteComponent.tableWrapper).find(selectors.fteComponent.allSchoolFTETotal).should('contain.text', '9.1');
    });

    it('can view Eligible Special Education Headcount', () => {
      cy.visit('/open-district-collection-details/' + Cypress.env('sdcDistrictCollectionID'));
      cy.get(selectors.studentLevelData.stepThree).should('exist').should('have.class', 'v-stepper-item--selected');
      cy.get(selectors.stepThreeTabSlider.specialEducationButton).should('exist').click();
      cy.get(selectors.specialEducationComponent.summaryButton).should('exist').click();

      const categories = ['A - Physically Dependent', 'B - Deafblind', 'C - Moderate to Profound Intellectual Disability',
        'D - Physical Disability or Chronic Health Impairment', 'E - Visual Impairment', 'F - Deaf or Hard of Hearing',
        'G - Autism Spectrum Disorder', 'H - Intensive Behaviour Interventions or Serious Mental Illness', 'K - Mild Intellectual Disability', 'P - Gifted', 'Q - Learning Disability', 'R - Moderate Behaviour Support/Mental Illness'];
      const counts = ['6', '0', '0', '0', '0', '0', '4', '0', '0', '0', '0', '0'];

      //Check summary headcounts
      categories.forEach((category, index) => {
        cy.get(selectors.specialEducationComponent.headcountCard).eq(index).find(selectors.specialEducationComponent.headcountColumnData).should('have.length', 2);
        cy.get(selectors.specialEducationComponent.headcountCard).eq(index).find(selectors.specialEducationComponent.headcountHeader).should('contain.text', category);
        cy.get(selectors.specialEducationComponent.headcountCard).eq(index).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
        cy.get(selectors.specialEducationComponent.headcountCard).eq(index).find(selectors.specialEducationComponent.headcountColumnData).eq(0).children('div:nth-child(2)').children('span').should('contain.text', counts[index]);
        cy.get(selectors.specialEducationComponent.headcountCard).eq(index).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
        cy.get(selectors.specialEducationComponent.headcountCard).eq(index).find(selectors.specialEducationComponent.headcountColumnData).eq(1).children('div:nth-child(2)').children('span').should('contain.text', counts[index]);
      });

      // check summary table
      cy.get('.v-table').should('exist').contains(1);
      cy.get('.v-table').eq(0).find('.v-table__wrapper');

      const expectedRows = ['KF01020304050607EU0809101112SUTotal', 'Level 10000000000600006', 'A - Physically Dependent0000000000600006', 'B - Deafblind0000000000000000',
        'Level 20000000000040004', 'C - Moderate to Profound Intellectual Disability0000000000000000',  'D - Physical Disability or Chronic Health Impairment0000000000000000', 'E - Visual Impairment0000000000000000', 'F - Deaf or Hard of Hearing0000000000000000', 'G - Autism Spectrum Disorder0000000000040004',
        'Level 30000000000000000', 'H - Intensive Behaviour Interventions or Serious Mental Illness0000000000000000', 'Other0000000000000000', 'K - Mild Intellectual Disability0000000000000000', 'P - Gifted0000000000000000', 'Q - Learning Disability0000000000000000', 'R - Moderate Behaviour Support/Mental Illness0000000000000000', 'All Levels & Categories00000000006400010'];
      cy.get('tr')
        .each(($row, index) => {
          const rowText = $row.text();
          expect(rowText).to.equal(expectedRows[index]);
        });
    });

    it('can view Eligible Special Education Headcount per School', () => {
      cy.intercept('/api/sdc/sdcSchoolCollectionStudent/getDistrictHeadcounts/*?type=special-ed-per-school&compare=false').as('tableLoaded');
      cy.visit('/open-district-collection-details/' + Cypress.env('sdcDistrictCollectionID'));
      cy.get(selectors.studentLevelData.stepThree).should('exist').should('have.class', 'v-stepper-item--selected');
      cy.get(selectors.stepThreeTabSlider.specialEducationButton).should('exist').click();
      cy.get(selectors.specialEducationComponent.summaryButton).should('exist').click();

      cy.get('#reports').parent().click();
      cy.get(selectors.dropdown.listItem).contains('Eligible Special Education Headcount per School').click();
      cy.wait('@tableLoaded');
      cy.get(selectors.specialEducationComponent.headcountReportPerSchool).should('be.visible');

      // check summary table
      const expectedRows = ['KF01020304050607EU0809101112SUTotal', 'All Schools00000000006400010', '99899990 - EDX Automation Testing School0000000000320005', '99899991 - EDX Automation Testing School0000000000320005'];
      cy.get('tr')
        .each(($row, index) => {
          const rowText = $row.text();
          expect(rowText).to.equal(expectedRows[index]);
        });
    });

    it('can view Eligible French Program Headcount', () => {
      cy.visit('/open-district-collection-details/' + Cypress.env('sdcDistrictCollectionID'));
      cy.get(selectors.studentLevelData.stepThree).should('exist').should('have.class', 'v-stepper-item--selected');
      cy.get(selectors.stepThreeTabSlider.frenchProgramsButton).should('exist').click();
      cy.get(selectors.frenchComponent.summaryButton).should('exist').click();

      const categories = ['Core French', 'Early French Immersion', 'Late French Immersion', 'Programme Francophone'];
      const counts = ['6', '4', '0', '0'];

      //Check summary headcounts
      categories.forEach((category, index) => {
        cy.get(selectors.frenchComponent.headcountCard).eq(index).find(selectors.frenchComponent.headcountColumnData).should('have.length', 2);
        cy.get(selectors.frenchComponent.headcountCard).eq(index).find(selectors.frenchComponent.headcountHeader).should('contain.text', category);
        cy.get(selectors.frenchComponent.headcountCard).eq(index).find(selectors.frenchComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
        cy.get(selectors.frenchComponent.headcountCard).eq(index).find(selectors.frenchComponent.headcountColumnData).eq(0).children('div:nth-child(2)').children('span').should('contain.text', counts[index]);
        cy.get(selectors.frenchComponent.headcountCard).eq(index).find(selectors.frenchComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
        cy.get(selectors.frenchComponent.headcountCard).eq(index).find(selectors.frenchComponent.headcountColumnData).eq(1).children('div:nth-child(2)').children('span').should('contain.text', counts[index]);
      });

      // check summary table
      cy.get('.v-table').should('exist').contains(1);
      cy.get('.v-table').eq(0).find('.v-table__wrapper');

      const expectedRows = ['KF01020304050607EU0809101112SUGATotal', 'Core French00000000006000006', 'School-Aged00000000006000006', 'Adult00000000000000000',
        'Early French Immersion00000000000400004', 'School-Aged00000000000400004',  'Adult00000000000000000', 'Late French Immersion00000000000000000', 'School-Aged00000000000000000', 'Adult00000000000000000',
        'Programme Francophone00000000000000000', 'School-Aged00000000000000000', 'Adult00000000000000000', 'All French Programs000000000064000010', 'School-Aged000000000064000010', 'Adult00000000000000000'];
      cy.get('tr')
        .each(($row, index) => {
          const rowText = $row.text();
          expect(rowText).to.equal(expectedRows[index]);
        });
    });

    it('can view Eligible French Program Headcount per School', () => {
      cy.intercept('/api/sdc/sdcSchoolCollectionStudent/getDistrictHeadcounts/*?type=french-per-school&compare=false').as('tableLoaded');
      cy.visit('/open-district-collection-details/' + Cypress.env('sdcDistrictCollectionID'));
      cy.get(selectors.studentLevelData.stepThree).should('exist').should('have.class', 'v-stepper-item--selected');
      cy.get(selectors.stepThreeTabSlider.frenchProgramsButton).should('exist').click();
      cy.get(selectors.frenchComponent.summaryButton).should('exist').click();

      cy.get('#reports').parent().click();
      cy.get(selectors.dropdown.listItem).contains('Eligible French Program Headcount per School').click();
      cy.wait('@tableLoaded');
      cy.get(selectors.frenchComponent.headcountReportPerSchool).should('be.visible');

      // check summary table
      const expectedRows = ['KF01020304050607EU0809101112SUGATotal', 'All Schools000000000064000010', '99899990 - EDX Automation Testing School00000000003200005', '99899991 - EDX Automation Testing School00000000003200005'];
      cy.get('tr')
        .each(($row, index) => {
          const rowText = $row.text();
          expect(rowText).to.equal(expectedRows[index]);
        });
    });

    it('can view Eligible Indigenous Support Program Headcount', () => {
      cy.visit('/open-district-collection-details/' + Cypress.env('sdcDistrictCollectionID'));
      cy.get(selectors.studentLevelData.stepThree).should('exist').should('have.class', 'v-stepper-item--selected');
      cy.get(selectors.stepThreeTabSlider.indigenousStudentsButton).should('exist').click();
      cy.get(selectors.indigenousSupportComponent.summaryButton).should('exist').click();

      const categories = ['Indigenous Language and Culture', 'Indigenous Support Services', 'Other Approved Indigenous Programs'];
      const counts = ['6', '0', '0'];

      //Check summary headcounts
      categories.forEach((category, index) => {
        cy.get(selectors.indigenousSupportComponent.headcountCard).eq(index).find(selectors.indigenousSupportComponent.headcountColumnData).should('have.length', 2);
        cy.get(selectors.indigenousSupportComponent.headcountCard).eq(index).find(selectors.indigenousSupportComponent.headcountHeader).should('contain.text', category);
        cy.get(selectors.indigenousSupportComponent.headcountCard).eq(index).find(selectors.indigenousSupportComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Eligible');
        cy.get(selectors.indigenousSupportComponent.headcountCard).eq(index).find(selectors.indigenousSupportComponent.headcountColumnData).eq(0).children('div:nth-child(2)').children('span').should('contain.text', counts[index]);
        cy.get(selectors.indigenousSupportComponent.headcountCard).eq(index).find(selectors.indigenousSupportComponent.headcountColumnData).eq(1).children('div').should('contain.text', 'Reported');
        cy.get(selectors.indigenousSupportComponent.headcountCard).eq(index).find(selectors.indigenousSupportComponent.headcountColumnData).eq(1).children('div:nth-child(2)').children('span').should('contain.text', counts[index]);
      });

      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(3).find(selectors.indigenousSupportComponent.headcountColumnData).should('have.length', 1);
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(3).find(selectors.indigenousSupportComponent.headcountHeader).should('contain.text', 'Indigenous Ancestry');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(3).find(selectors.indigenousSupportComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Total Students');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(3).find(selectors.indigenousSupportComponent.headcountColumnData).eq(0).children('div:nth-child(2)').children('span').should('contain.text', '10');

      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(4).find(selectors.indigenousSupportComponent.headcountColumnData).should('have.length', 1);
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(4).find(selectors.indigenousSupportComponent.headcountHeader).should('contain.text', 'Ordinarily Living on Reserve');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(4).find(selectors.indigenousSupportComponent.headcountColumnData).eq(0).children('div').should('contain.text', 'Total Students');
      cy.get(selectors.indigenousSupportComponent.headcountCard).eq(4).find(selectors.indigenousSupportComponent.headcountColumnData).eq(0).children('div:nth-child(2)').children('span').should('contain.text', '0');

      // check summary table
      cy.get('.v-table').should('exist').contains(1);
      cy.get('.v-table').eq(0).find('.v-table__wrapper');

      const expectedRows = ['KF01020304050607EU0809101112SUTotal', 'Indigenous Language and Culture0000000000600006', '', 'Indigenous Support Services0000000000000000',
        '', 'Other Approved Indigenous Programs0000000000000000',  '', 'All Indigenous Support Programs0000000000600006', ''];
      cy.get('tr')
        .each(($row, index) => {
          const rowText = $row.text();
          expect(rowText).to.equal(expectedRows[index]);
        });
    });

    it('can view Eligible Indigenous Support Program Headcount per School', () => {
      cy.intercept('/api/sdc/sdcSchoolCollectionStudent/getDistrictHeadcounts/*?type=indigenous-per-school&compare=false').as('tableLoaded');
      cy.visit('/open-district-collection-details/' + Cypress.env('sdcDistrictCollectionID'));
      cy.get(selectors.studentLevelData.stepThree).should('exist').should('have.class', 'v-stepper-item--selected');
      cy.get(selectors.stepThreeTabSlider.indigenousStudentsButton).should('exist').click();
      cy.get(selectors.indigenousSupportComponent.summaryButton).should('exist').click();

      cy.get('#reports').parent().click();
      cy.get(selectors.dropdown.listItem).contains('Eligible Indigenous Support Program Headcount per School').click();
      cy.wait('@tableLoaded');
      cy.get(selectors.indigenousSupportComponent.headcountReportPerSchool).should('be.visible');

      // check summary table
      const expectedRows = ['KF01020304050607EU0809101112SUTotal', 'All Schools0000000000600006', '', '99899990 - EDX Automation Testing School0000000000300003', '', '99899991 - EDX Automation Testing School0000000000300003', ''];
      cy.get('tr')
        .each(($row, index) => {
          const rowText = $row.text();
          expect(rowText).to.equal(expectedRows[index]);
        });
    });

    it('can view Eligible Band of Residence Headcount', () => {
      cy.intercept('/api/sdc/sdcSchoolCollectionStudent/getDistrictHeadcounts/*?type=band-codes&compare=false').as('tableLoaded');
      cy.visit('/open-district-collection-details/' + Cypress.env('sdcDistrictCollectionID'));
      cy.get(selectors.studentLevelData.stepThree).should('exist').should('have.class', 'v-stepper-item--selected');
      cy.get(selectors.stepThreeTabSlider.indigenousStudentsButton).should('exist').click();
      cy.get(selectors.indigenousSupportComponent.summaryButton).should('exist').click();

      cy.get('#reports').parent().click();
      cy.get(selectors.dropdown.listItem).contains('Eligible Band of Residence Headcount').click();
      cy.wait('@tableLoaded');
      cy.get(selectors.indigenousSupportComponent.bandHeadcountReport).should('be.visible');

      // check summary table
      cy.get('.v-table').should('exist').contains(1);
      cy.get('.v-table').eq(0).find('.v-table__wrapper');

      const expectedRows = ['HeadcountFTE', '0653 - TSARTLIP43.1000', '', '0547 - BLUEBERRY RIVER66.0000',
        '', 'All Bands & Students109.1000',  ''];
      cy.get('tr')
        .each(($row, index) => {
          const rowText = $row.text();
          expect(rowText).to.equal(expectedRows[index]);
        });
    });

    it('can view Eligible Band of Residence Headcount per School', () => {
      cy.intercept('/api/sdc/sdcSchoolCollectionStudent/getDistrictHeadcounts/*?type=band-codes-per-school&compare=false').as('tableLoaded');
      cy.visit('/open-district-collection-details/' + Cypress.env('sdcDistrictCollectionID'));
      cy.get(selectors.studentLevelData.stepThree).should('exist').should('have.class', 'v-stepper-item--selected');
      cy.get(selectors.stepThreeTabSlider.indigenousStudentsButton).should('exist').click();
      cy.get(selectors.indigenousSupportComponent.summaryButton).should('exist').click();

      cy.get('#reports').parent().click();
      cy.get(selectors.dropdown.listItem).contains('Eligible Band of Residence Headcount per School').click();
      cy.wait('@tableLoaded');
      cy.get(selectors.indigenousSupportComponent.bandHeadcountReportPerSchool).should('be.visible');

      // check summary table
      const expectedRows = ['HeadcountFTE', '99899990 - EDX Automation Testing School54.5500', '', '99899991 - EDX Automation Testing School54.5500', '', 'All Bands & Students109.1000', ''];
      cy.get('tr')
        .each(($row, index) => {
          const rowText = $row.text();
          expect(rowText).to.equal(expectedRows[index]);
        });
    });

    it('can view Refugee Headcount per School if February', () => {
      cy.intercept('/api/sdc/sdcSchoolCollectionStudent/getDistrictHeadcounts/*?type=refugee-per-school&compare=false').as('tableLoaded');
      cy.visit('/open-district-collection-details/' + Cypress.env('sdcDistrictCollectionID'));
      cy.get(selectors.studentLevelData.stepThree).should('exist').should('have.class', 'v-stepper-item--selected');

      cy.get('body').then($body => {
        // only execute if refugee tab is available since it is not always (based on collection type)
        if ($body.find(selectors.stepThreeTabSlider.refugeeButton).length > 0) {
          cy.get(selectors.stepThreeTabSlider.refugeeButton).click();
          cy.get(selectors.refugeeComponent.summaryButton).should('exist').click();
          cy.get('#reports').parent().click();
          cy.get(selectors.dropdown.listItem).contains('Eligible Newcomer Refugees by School').click();
          cy.wait('@tableLoaded');
          cy.get(selectors.refugeeComponent.refugeeHeadcountReportPerSchool).should('be.visible');

          const expectedRows = ['HeadcountFTEELL', 'All Newcomer Refugees000', '99899991 - EDX Automation Testing School000', '99899990 - EDX Automation Testing School000'];
          cy.get('tr')
            .each(($row, index) => {
              const rowText = $row.text();
              expect(expectedRows).to.contains(rowText);
            });

          cy.get(selectors.refugeeComponent.pdfDownloadLink).then(($link) => {
            const href = $link.prop('href');
            const downloadPath = 'path/to/download/directory/refugee.pdf';

            cy.downloadFile(href, 'path/to/download/directory', 'refugee.pdf').then(() => {
              cy.readFile(downloadPath, 'binary').should((data) => {
                expect(data).to.not.be.empty;
                const expectedSizeBytes = 246045;
                expect(data.length).to.be.closeTo(expectedSizeBytes, 20240);
              });
            });
          });
        } else {
          cy.log('Refugee button does not exist on this page');
        }
      });
    });
  });
});

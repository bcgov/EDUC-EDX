import {AppSetupData} from '../../../cypress.config';
import {SchoolCollectionOptions} from '../../services/sdc-collection-api-service';
import selectors from '../../support/selectors';


describe('SDC School Collection - testing Upload School Level Data screen\'s summary or data', () => {
  context('Uploaded a file that has no errors or warnings', () => {
    before(() => {
      cy.logout();
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task<SchoolCollectionOptions, SdcCollections>('setup-collections', {
          school: res.schools[0],
          loadWithStudentAndValidations: true,
          seedData: 'dataUploadSummaryCareer'
        }).then(response => {
          Cypress.env('schoolCollectionIdCareer', response?.sdcSchoolCollections[0]?.sdcSchoolCollectionID);
        });
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', {schoolCodes: ['99998']});
      });
    });
    beforeEach(() => {
      cy.login();
    });
    it('there is an info note and no error banner for students in error', () => {
      const id = Cypress.env('schoolCollectionIdCareer');
      navigateToUploadScreen(id);
      cy.get(selectors.sdcDocumentUploadStep.infoNote).should('exist').should('contain.text', 'Note: Eligible FTE counts are available in Step 3');
      cy.get(selectors.sdcDocumentUploadStep.errorBanner).should('not.exist');
    });

    it('there are the correct headcounts for the FTE tab', () => {
      const id = Cypress.env('schoolCollectionIdCareer');
      cy.intercept(Cypress.env('interceptors').headcounts).as('headcounts');
      navigateToUploadScreen(id);
      cy.wait('@headcounts');
      cy.get(`${selectors.sdcDocumentUploadStep.fteTab} .totals-row`).should('have.length', 1);
      cy.get(`${selectors.sdcDocumentUploadStep.fteTab} .totals-row td`).last().should('have.text', '9');

      cy.get(selectors.studentLevelData.compareSwitch).click();
      cy.get(`${selectors.sdcDocumentUploadStep.fteTab} .totals-row td`).last().should('have.text', '09');
      cy.get(`${selectors.sdcDocumentUploadStep.fteTab} .totals-row > td:nth-child(2)`).last().should('have.text', '00');
      cy.get(`${selectors.sdcDocumentUploadStep.fteTab} .totals-row > td:nth-child(3)`).last().should('have.text', '00');
    });
    
    it('there are the correct headcounts for the career tab', () => {
      const id = Cypress.env('schoolCollectionIdCareer');
      navigateToUploadScreen(id);
      cy.intercept(Cypress.env('interceptors').headcounts).as('headcounts');
      cy.get(selectors.sdcDocumentUploadStep.careerTabButton).click();
      cy.wait('@headcounts');
      cy.get(`${selectors.sdcDocumentUploadStep.careerTab} .section-header`).last().find('td').last().should('be.visible');
      cy.get(`${selectors.sdcDocumentUploadStep.careerTab} .section-header`).each(($cell, index) => {
        if(index !== 4) {
          cy.wrap($cell).find('td').last().should('contain', '2');
        } else {
          cy.wrap($cell).find('td').last().should('contain', '8');
        }
      });

      cy.get(selectors.studentLevelData.compareSwitch).click();
      cy.get(`${selectors.sdcDocumentUploadStep.careerTab} .section-header`).each(($cell, index) => {
        if(index !== 4) {
          cy.wrap($cell).find('td').last().should('contain', '02');
        } else {
          cy.wrap($cell).find('td').last().should('contain', '08');
        }
      });
    });
  });
  context('Uploaded a file that has no errors or warnings and indigenous students', () => {
    before(() => {
      cy.logout();
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task<SchoolCollectionOptions, SdcCollections>('setup-collections', {
          school: res.schools[0],
          loadWithStudentAndValidations: true,
          seedData: 'dataUploadSummaryIndigenous'
        }).then(response => {
          Cypress.env('schoolCollectionIdIndigenous', response?.sdcSchoolCollections[0]?.sdcSchoolCollectionID);
        });
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', {schoolCodes: ['99998']});
      });
    });
    beforeEach(() => {
      cy.login();
    });
    it('there are the correct headcounts for the indigenous tab', () => {
      const id = Cypress.env('schoolCollectionIdIndigenous');
      navigateToUploadScreen(id);
      cy.intercept(Cypress.env('interceptors').headcounts).as('headcounts');
      cy.get(selectors.sdcDocumentUploadStep.indigenousTabButton).click();
      cy.wait('@headcounts');
      cy.get(`${selectors.sdcDocumentUploadStep.indigenousReportRows}`).last().find('td').last().should('be.visible');
      cy.get(`${selectors.sdcDocumentUploadStep.indigenousReportRows}`).each(($cell, index) => {
        if(index !== 3) {
          cy.wrap($cell).find('td').last().should('contain', '2');
        } else {
          cy.wrap($cell).find('td').last().should('contain', '6');
        }
      });

      cy.get(selectors.studentLevelData.compareSwitch).click();
      cy.get(`${selectors.sdcDocumentUploadStep.indigenousReportRows}`).each(($cell, index) => {
        if(index !== 3) {
          cy.wrap($cell).find('td').last().should('contain', '02');
        } else {
          cy.wrap($cell).find('td').last().should('contain', '06');
        }
      });
    });
  });
  context('Uploaded a file that has no errors or warnings and inclusive ed students', () => {
    before(() => {
      cy.logout();
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task<SchoolCollectionOptions, SdcCollections>('setup-collections', {
          school: res.schools[0],
          loadWithStudentAndValidations: true,
          seedData: 'dataUploadSummarySpecialEd'
        }).then(response => {
          Cypress.env('schoolCollectionIdSped', response?.sdcSchoolCollections[0]?.sdcSchoolCollectionID);
        });
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', {schoolCodes: ['99998']});
      });
    });
    beforeEach(() => {
      cy.login();
    });
    it('there are the correct headcounts for the inclusive ed tab', () => {
      const id = Cypress.env('schoolCollectionIdSped');
      navigateToUploadScreen(id);
      cy.intercept(Cypress.env('interceptors').headcounts).as('headcounts');
      cy.get(selectors.sdcDocumentUploadStep.spedTabButton).click();
      cy.wait('@headcounts');
      cy.get(`${selectors.sdcDocumentUploadStep.spedTab} .section-header`).last().find('td').last().should('be.visible');
      cy.get(`${selectors.sdcDocumentUploadStep.spedTab} .section-header`).each(($cell, index) => {
        if(index === 0) {
          cy.wrap($cell).find('td').last().should('contain', '2');
        } else if(index === 1) {
          cy.wrap($cell).find('td').last().should('contain', '5');
        } else if(index === 2) {
          cy.wrap($cell).find('td').last().should('contain', '1');
        } else if(index === 3) {
          cy.wrap($cell).find('td').last().should('contain', '4');
        } else if(index === 4) {
          cy.wrap($cell).find('td').last().should('contain', '12');
        }
      });

      cy.get(selectors.studentLevelData.compareSwitch).click();
      cy.get(`${selectors.sdcDocumentUploadStep.spedTab} .section-header`).each(($cell, index) => {
        if(index === 0) {
          cy.wrap($cell).find('td').last().should('contain', '02');
        } else if(index === 1) {
          cy.wrap($cell).find('td').last().should('contain', '05');
        } else if(index === 2) {
          cy.wrap($cell).find('td').last().should('contain', '01');
        } else if(index === 3) {
          cy.wrap($cell).find('td').last().should('contain', '04');
        } else if(index === 4) {
          cy.wrap($cell).find('td').last().should('contain', '012');
        }
      });
    });
  });
  context('Uploaded a file that has no errors or warnings and ell students', () => {
    before(() => {
      cy.logout();
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task<SchoolCollectionOptions, SdcCollections>('setup-collections', {
          school: res.schools[0],
          loadWithStudentAndValidations: true,
          seedData: 'dataUploadSummaryEll'
        }).then(response => {
          Cypress.env('schoolCollectionIdEll', response?.sdcSchoolCollections[0]?.sdcSchoolCollectionID);
        });
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', { schoolCodes: ['99998'] });
      });
    });
    beforeEach(() => {
      cy.login();
    });
    it('there are the correct headcounts for the ell tab', () => {
      const id = Cypress.env('schoolCollectionIdEll');
      navigateToUploadScreen(id);
      cy.intercept(Cypress.env('interceptors').headcounts).as('headcounts');
      cy.get(selectors.sdcDocumentUploadStep.ellTabButton).click();
      cy.wait('@headcounts');
      cy.get(`${selectors.sdcDocumentUploadStep.ellTab} .section-header`).last().find('td').last().should('be.visible');
      cy.get(`${selectors.sdcDocumentUploadStep.ellTab} .section-header`).find('td').last().should('contain', '4');
    });
  });
  context('Uploaded a file that has errors', () => {
    before(() => {
      cy.logout();
      cy.task<AppSetupData>('dataLoad').then(res => {
        cy.task<SchoolCollectionOptions, SdcCollections>('setup-collections', {
          school: res.schools[0],
          loadWithStudentAndValidations: true,
          seedData: 'dataUploadSummaryErrors'
        }).then(response => {
          Cypress.env('schoolCollectionIdErrors', response?.sdcSchoolCollections[0]?.sdcSchoolCollectionID);
        });
        cy.task<SchoolUserOptions, EdxUserEntity>('setup-schoolUser', {schoolCodes: ['99998']});
      });
    });
    beforeEach(() => {
      cy.login();
    });
    it('there is an error banner for students in error', () => {
      const id = Cypress.env('schoolCollectionIdErrors');
      navigateToUploadScreen(id);
      cy.get(selectors.sdcDocumentUploadStep.infoNote).should('exist');
      cy.get(selectors.sdcDocumentUploadStep.errorBanner).should('exist');
    });
  });
});

function navigateToUploadScreen(id: SchoolCollectionOptions) {
  cy.intercept(Cypress.env('interceptors').collection_students_pagination).as('collection_students_pagination');
  cy.intercept(Cypress.env('interceptors').headcounts).as('headcounts');
  cy.visit('/open-collection-details/' + id);
  cy.wait('@collection_students_pagination');
  cy.wait('@headcounts');
}

import {AppSetupData} from '../../../cypress.config';
import { DistrictCollectionOptions } from 'tests-e2e/cypress/services/sdc-collection-api-service';
import selectors from '../../support/selectors';
import {TemporalQueries} from "@js-joda/core";
import localDate = TemporalQueries.localDate;


describe('SDC District Collection - testing Upload School Level Data screen\'s summary or data', () => {
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
                    loadWithStudentAndValidations: false
                }).then(response => {
                    Cypress.env('sdcDistrictCollectionID', response?.sdcDistrictCollection?.sdcDistrictCollectionID);
                });
                cy.task('setup-districtUser', { districtRoles: ['DISTRICT_SDC'], districtCodes: ['998'] });
            });
        });
        beforeEach(() => cy.login());
        it('can re-upload a collection file', () => {
            const id = Cypress.env('sdcDistrictCollectionID');
            cy.visit('/open-district-collection-details/' + id);

            cy.get(selectors.sdcDocumentUploadStep.infoNote).should('exist').should('contain.text', 'Note: Eligible FTE counts are available in Step 3');
            cy.get("#navTitle").should('exist').contains('Student Level Data (1701) | EDX Automation Testing District');

            const headings = ['School', 'File Name', 'Date Uploaded', 'Processed']
            cy.get('.v-data-table__td').then(($td) => {
                const texts = Cypress._.map($td, 'innerText')
                expect(texts, 'headings').to.deep.equal(headings)
            })

            var today = new Date();
            var dd=String(today.getDate()).padStart(2,'0');
            var mm=String(today.getMonth()+1).padStart(2,'0');
            var yyyy = today.getFullYear();

            var stringToday=mm+'/'+dd+'/'+yyyy;

            cy.get('.v-data-table').should('exist').contains(`99899991`);
            cy.get('.v-data-table').should('exist').contains(`99899990`);

            cy.get('#uploadButton').click();
            cy.get('#selectFileInput').selectFile('./cypress/uploads/dis-upload-sample-1-student-fnchars.std', { force: true });

            cy.get('.fileUploadWarningMessage').first().should('exist').contains('The date in the dis-upload-sample-1-student-fn.std file is 2023-04-26. Please ensure that you have uploaded the correct data for this collection before continuing.')
            cy.get('.fileUploadSuccessMessage').first().should('exist').contains('1 file(s) were successfully uploaded. Files will continue to be processed even if you leave the page.');

            cy.get('#step-1-next-button-district').should('not.be.disabled');

        });
    })

})

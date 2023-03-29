import {OAuthUtil} from "./OauthUtil.cy";


const SCHOOL_ENDPOINT = `/api/v1/institute/school`;
const DISTRICT_ENDPOINT = `/api/v1/institute/district`;
const AUTHORITY_ENDPOINT=`/api/v1/institute/authority`;

var response: any


export class instituteApiService {

     async getAllSchools() {
        const url = `${Cypress.env('institute').base_url}${SCHOOL_ENDPOINT}`;
         debugger
        cy.makeAPIRequest(url, 'GET', {},{}).then((res) => {
            expect(res.status).to.be.equal(200)
            response = res.body
            debugger
            cy.log(response);
        })
        return response;
    }

    async getSchoolIDBySchoolCode(schoolCode: any) {


        const schoolSearchCriteria = [{
            condition: null,
            searchCriteriaList: [
                {
                    key: "schoolNumber",
                    operation: "eq",
                    value: schoolCode,
                    valueType: "STRING",
                    condition: "AND"
                },
                {
                    key: "closedDate",
                    operation: "eq",
                    value: null,
                    valueType: "STRING",
                    condition: "AND"
                }
            ]
        }];
        debugger
        const schoolSearchParam = {
            params: {
                searchCriteriaList: JSON.stringify(schoolSearchCriteria)
            }
        };
        const url = `${Cypress.env('institute').base_url}${SCHOOL_ENDPOINT}/paginated`;
        //const userSchoolResult = cy.makeAPIRequest(url,'GET', schoolSearchParam);
        //return userSchoolResult?.content[0]?.schoolId;
        cy.makeAPIRequest(url, 'GET', schoolSearchParam,{}).then((res) => {
            expect(res.status).to.be.equal(200)
            response = res?.body?.content[0].schoolId
            cy.log(response);
        })
        return response;
    }

   async getDistrictIdByDistrictNumber(districtNumber: string) {

        const url = `${Cypress.env('institute').base_url}${DISTRICT_ENDPOINT}`;
        //const districtResponse = await restUtils.getData(token, url);
       cy.makeAPIRequest(url, 'GET',{},{}).then((res) => {
           expect(res.status).to.be.equal(200)
           let districtResponse = res?.body
           for (const district of districtResponse) {
               if (district.districtNumber === districtNumber) {
                   return district.districtId;
               }
           }
       })
    }

    async getAllDistricts(token: any) {
        const url = `${Cypress.env('institute').base_url}${DISTRICT_ENDPOINT}`;
        cy.makeAPIRequest(url, 'GET', {},{}).then((res) => {
            expect(res.status).to.be.equal(200)
            response = res?.body
            cy.log(response);
        })
        return response;
    }

    async createDistrict(){
        cy.log('AT createDistrict started');
        const districtPayload = {
            createUser: 'EDXAT',
            updateUser: null,
            createDate: null,
            updateDate: null,
            districtId: null,
            districtNumber: '998',
            faxNumber: '2504266673',
            phoneNumber: '2504265241',
            email: 'noreply-edx@gov.bc.ca',
            displayName: 'EDX AT District',
            districtRegionCode: 'METRO',
            districtStatusCode: 'ACTIVE',
            website:null,
        };
        const url = `${Cypress.env('institute').base_url}${DISTRICT_ENDPOINT}`
        cy.makeAPIRequest(url, 'POST', {},districtPayload).then((res) => {
            expect(res.status).to.be.equal(200)
            response = res?.body?.districtId
            cy.log(response);
        })
        cy.log('AT createDistrict completed');
        return response;

    }
    async createSchool(districtID: any){
        cy.log('AT createSchool');

        const schoolPayload = {
            createUser: 'EDXAT',
            updateUser: null,
            createDate: null,
            updateDate: null,
            schoolId: null,
            districtId: districtID,
            mincode: null,
            independentAuthorityId: null,
            schoolNumber: '99999',
            faxNumber: '2504266673',
            phoneNumber: '2504265241',
            email: 'dave.hill@sd5.bc.ca',
            website: null,
            displayName: 'EDX AT School',
            schoolOrganizationCode: 'TWO_SEM',
            schoolCategoryCode: 'PUBLIC',
            facilityTypeCode: 'STANDARD',
            openedDate: '2022-01-01T00:00:00',
            closedDate: null,
            contacts: [
                {
                    createUser: null,
                    updateUser: null,
                    createDate: null,
                    updateDate: null,
                    schoolContactId: null,
                    schoolId: null,
                    schoolContactTypeCode: 'PRINCIPAL',
                    phoneNumber: '2506656585',
                    jobTitle: 'Principal',
                    phoneExtension: '123',
                    alternatePhoneNumber: '2506544578',
                    alternatePhoneExtension: '321',
                    email: 'test@test.com',
                    firstName: 'EDX AT Principal First Name',
                    lastName: 'Last Name',
                    effectiveDate: '2022-10-25T00:00:00',
                    expiryDate: null
                }
            ]
        };
        const url = `${Cypress.env('institute').base_url}${SCHOOL_ENDPOINT}`;
        cy.makeAPIRequest(url, 'POST', {},schoolPayload).then((res) => {
            expect(res.status).to.be.equal(200)
            response = res?.body
            cy.log(response);
        })
        return await response;
    }
    /*async deleteSchoolContact(token: any, schoolID: string, contactID: string) {
        const url = `${Cypress.env('institute').base_url}${SCHOOL_ENDPOINT}/`+schoolID+'/contact/'+contactID;
        await restUtils.deleteData(token,url);
    },
    async deleteSchool(token: any, schoolID: string){
        const url = `${Cypress.env('institute').base_url}${SCHOOL_ENDPOINT}/`+schoolID;
        await restUtils.deleteData(token,url);
    },
    async deleteDistrict(token: any, districtID: string){
        const url = `${Cypress.env('institute').base_url}${DISTRICT_ENDPOINT}/`+districtID;
        await restUtils.deleteData(token,url);
    },
    async deleteInstituteSetUp(){
        const data = await getToken();
        const token = data.access_token;
        const school =  await instituteApiService.getSchoolBySchoolDisplayName('EDX AT School');

        if(school){
            log.info('School Details Found for Institute Delete');
            if(school.contacts && school.contacts.length>0){
                for(const contact of school.contacts){
                    await instituteApiService.deleteSchoolContact(token, school?.schoolId, contact.schoolContactId);
                }
                log.info('School Contacts Deleted');
            }
            await instituteApiService.deleteSchool(token, school?.schoolId);
            log.info('School Deleted');
            await instituteApiService.deleteDistrict(token,school?.districtId);
            log.info('District Deleted');
        }

    },*/
    async getSchoolBySchoolDisplayName(displayName: string) {

        const schoolSearchCriteria = [{
            condition: null,
            searchCriteriaList: [
                {
                    key: "displayName",
                    operation: "eq",
                    value: displayName,
                    valueType: "STRING",
                    condition: "AND"
                },
            ]
        }];

        const schoolSearchParam = {
            params: {
                searchCriteriaList: JSON.stringify(schoolSearchCriteria)
            }
        };
        const url = `${Cypress.env('institute').base_url}${SCHOOL_ENDPOINT}/paginated`;
        cy.makeAPIRequest(url, 'GET',schoolSearchParam,{}).then((res) => {
            expect(res.status).to.be.equal(200)
            response = res?.body?.content[0]
            cy.log(response);
        })
        return await response;
    }

    async getAuthorityIDByAuthorityNumber(authorityNumber: string) {

        const authoritySearchCriteria = [{
            condition: null,
            searchCriteriaList: [
                {
                    key: "authorityNumber",
                    operation: "eq",
                    value: authorityNumber,
                    valueType: "STRING",
                    condition: "AND"
                },
                {
                    key: "closedDate",
                    operation: "eq",
                    value: null,
                    valueType: "STRING",
                    condition: "AND"
                }
            ]
        }];

        const authoritySearchParam = {
            params: {
                searchCriteriaList: JSON.stringify(authoritySearchCriteria)
            }
        };
        const url = `${Cypress.env('institute').base_url}${AUTHORITY_ENDPOINT}/paginated`;
        cy.makeAPIRequest(url, 'GET',authoritySearchParam,{}).then((res) => {
            expect(res.status).to.be.equal(200)
            response = res?.body?.content[0]?.independentAuthorityId;
            cy.log(response);
        })
        return await response;
    }

    async createAuthorityWithContactToTest(){

        let authorityID = await this.getAuthorityIDByAuthorityNumber('998');

        const authorityPayload = {
            createUser: 'EDXAT',
            updateUser: null,
            createDate: null,
            updateDate: null,
            authorityNumber: '998',
            independentAuthorityId: null,
            faxNumber: '2505555555',
            phoneNumber: '2505555555',
            email: 'fakeuser@sd5.bc.ca',
            displayName: 'EDX Automation Testing Authority',
            authorityTypeCode: 'INDEPENDNT',
            openedDate: '2022-01-01T00:00:00',
            closedDate: null
        };
        const url = `${Cypress.env('institute').base_url}${AUTHORITY_ENDPOINT}`;
        if(!authorityID){
            cy.makeAPIRequest(url, 'POST',{},authorityPayload).then((res) => {
                expect(res.status).to.be.equal(200)
                response = res?.body;
                cy.log(response);
            })
            return await response;
        }
        authorityPayload.independentAuthorityId = authorityID;

        cy.makeAPIRequest(url + '/' + authorityID, 'PUT',{},authorityPayload).then((res) => {
            expect(res.status).to.be.equal(200)
            response = res?.body;
            cy.log(response);
        })

        await this.setupAuthorityContact(response);
        return response;
    }

    async setupAuthorityContact(authority: { independentAuthorityId: any; }){

        const authorityContactPayload =
            {
                createUser: 'EDXAT',
                updateUser: null,
                createDate: null,
                updateDate: null,
                authorityContactId: null,
                authorityId: authority.independentAuthorityId,
                authorityContactTypeCode: 'INDAUTHREP',
                phoneNumber: '2506656585',
                phoneExtension: '123',
                alternatePhoneNumber: '2506544578',
                alternatePhoneExtension: '321',
                email: 'test@test.com',
                firstName: 'EDXAutomation',
                lastName: 'Testing',
                effectiveDate: '2022-10-25T00:00:00',
                expiryDate: null
            };


        const apiUrl =  `${Cypress.env('institute').base_url}${AUTHORITY_ENDPOINT}/${authority.independentAuthorityId}`;
        cy.makeAPIRequest(apiUrl, 'GET',{}, {}).then((res) => {
            expect(res.status).to.be.equal(200)
            response = res?.body;
            cy.log(response);
        })
        let filteredContacts = response.contacts.filter((contact: { firstName: string; lastName: string; }) => contact.firstName === 'EDXAutomation' && contact.lastName === 'Testing');
        const url = `${Cypress.env('institute').base_url}${AUTHORITY_ENDPOINT}/${authority.independentAuthorityId}/contact`;

        if(filteredContacts.length < 1){
            cy.makeAPIRequest(url, 'POST',{}, authorityContactPayload).then((res) => {
                expect(res.status).to.be.equal(200)
                response = res?.body;
                cy.log(response);
            })
            return await response;
        }
        authorityContactPayload.authorityContactId = filteredContacts[0].authorityContactId;

        cy.makeAPIRequest(url + '/' + authorityContactPayload.authorityContactId, 'PUT',{}, authorityContactPayload).then((res) => {
            expect(res.status).to.be.equal(200)
            response = res?.body;
            cy.log(response);
        })
        return response;
    }

    async createDistrictWithContactToTest(includeDistrictAddress=true){

        let districtID = await this.getDistrictIdByDistrictNumber('998');

        const districtPayload = {
            createUser: 'EDXAT',
            updateUser: null,
            createDate: null,
            updateDate: null,
            districtNumber: '998',
            faxNumber: '2505555555',
            phoneNumber: '2505555555',
            email: 'fakeuser@sd5.bc.ca',
            website: null,
            displayName: 'EDX Automation Testing District',
            districtRegionCode: 'NOT_APPLIC',
            districtStatusCode: 'ACTIVE',
            districtId: undefined
        };

        if(includeDistrictAddress){
            // @ts-ignore
            districtPayload['addresses'] = [
                {
                    updateUser: 'EDXAT',
                    createUser: 'EDXAT',
                    createDate: null,
                    updateDate: null,
                    addressId: null,
                    districtId: null,
                    addressLine1: 'Fake Address',
                    addressLine2: null,
                    city: 'Faketown',
                    postal: 'v9v9v9',
                    addressTypeCode: 'MAILING',
                    provinceCode: 'BC',
                    countryCode: 'CA'
                }
            ]
        }

        const url = `${Cypress.env('institute').base_url}${DISTRICT_ENDPOINT}`;
        // @ts-ignore
        if(!districtID){
            cy.makeAPIRequest(url, 'POST',{}, districtPayload).then((res) => {
                expect(res.status).to.be.equal(200)
                response = res?.body;
                cy.log(response);
            })
            return await response
        }
        districtPayload.districtId = districtID;
        cy.makeAPIRequest(url + '/' + districtID, 'PUT',{}, districtPayload).then((res) => {
            expect(res.status).to.be.equal(200)
            response = res?.body;
            cy.log(response);
        })
        await this.setupDistrictContact(response);
        return response;

    }

    async setupDistrictContact(district: { districtId: any; }){

        const districtContactPayload =
            {
                createUser: 'EDXAT',
                updateUser: null,
                createDate: null,
                updateDate: null,
                districtContactId: null,
                districtId: district.districtId,
                districtContactTypeCode: 'SUPER',
                phoneNumber: '2506656585',
                jobTitle: 'Superintendent',
                phoneExtension: '123',
                alternatePhoneNumber: '2506544578',
                alternatePhoneExtension: '321',
                email: 'test@test.com',
                firstName: 'EDXAutomation',
                lastName: 'Testing',
                effectiveDate: '2022-10-25T00:00:00',
                expiryDate: null
            };

      //  let newDistrict = await restUtils.getData(token, `${constants.institute_base_url}${DISTRICT_ENDPOINT}/${district.districtId}`);
        cy.makeAPIRequest(`${Cypress.env('institute').base_url}${DISTRICT_ENDPOINT}/${district.districtId}`, 'GET',{},{}).then((res) => {
            expect(res.status).to.be.equal(200)
            response = res?.body;
            cy.log(response);
        })
        const contactUrl = `${Cypress.env('institute').base_url}${DISTRICT_ENDPOINT}/${district.districtId}/contact`;


        if (response.contacts) {
            cy.log('deleting all district contacts');
            response.contacts.forEach(function (contact:any)  {
                cy.makeAPIRequest(`${contactUrl}/${contact.districtContactId}`, 'DELETE',{},{}).then((res) => {
                    expect(res.status).to.be.equal(200)
                    response = res?.body;
                    cy.log(response);
                })
            });
        }

        cy.log('adding Automation Testing district superintendent contact');
        cy.makeAPIRequest(contactUrl, 'POST',{}, districtContactPayload).then((res) => {
            expect(res.status).to.be.equal(200)
            response = res?.body;
            cy.log(response);
        })
        return await response

    }
    async createSchoolWithContactToTest(districtID: any, includeSchoolAddress=true, includeTombstoneValues=true){

        let schoolID = await this.getSchoolIDBySchoolCodeAndDistrictID('99998', districtID);

        const schoolPayload = {
            createUser: 'EDXAT',
            updateUser: null,
            createDate: null,
            updateDate: null,
            schoolId: null,
            districtId: districtID,
            independentAuthorityId: null,
            schoolNumber: '99998',
            faxNumber: '2505555555',
            phoneNumber: '2505555555',
            email: 'fakeuser@sd5.bc.ca',
            website: null,
            displayName: 'EDX Automation Testing School',
            schoolOrganizationCode: 'TWO_SEM',
            schoolCategoryCode: 'PUBLIC',
            facilityTypeCode: 'STANDARD',
            openedDate: '2022-01-01T00:00:00',
            closedDate: null,
        }

        if(!includeTombstoneValues){
            // @ts-ignore
            schoolPayload.email = null;
            // @ts-ignore
            schoolPayload.faxNumber = null;
            // @ts-ignore
            schoolPayload.phoneNumber = null;
        }

        if(includeSchoolAddress){
            // @ts-ignore
            schoolPayload['addresses'] = [
                {
                    updateUser: 'EDXAT',
                    createUser: 'EDXAT',
                    createDate: null,
                    updateDate: null,
                    addressId: null,
                    schoolId: null,
                    addressLine1: 'Fake Address',
                    addressLine2: null,
                    city: 'Faketown',
                    postal: 'v9v9v9',
                    addressTypeCode: 'MAILING',
                    provinceCode: 'BC',
                    countryCode: 'CA'
                }
            ]
        }

        const url = `${Cypress.env('institute').base_url}${SCHOOL_ENDPOINT}`;
        if(!schoolID){
            cy.makeAPIRequest(url, 'POST',{}, schoolPayload).then((res) => {
                expect(res.status).to.be.equal(200)
                response = res?.body;
                cy.log(response);
            })
            return await response
        }
        schoolPayload.schoolId = schoolID;
        cy.makeAPIRequest(`${url}/${schoolID}`, 'PUT',{}, schoolPayload).then((res) => {
            expect(res.status).to.be.equal(200)
            response = res?.body;
            cy.log(response);
        })
        return await response
        let contact = {
            createUser: 'EDXAT',
            updateUser: null,
            createDate: null,
            updateDate: null,
            schoolContactId: null,
            schoolId: response.schoolId,
            schoolContactTypeCode: 'PRINCIPAL',
            phoneNumber: '2506656585',
            phoneExtension: '123',
            alternatePhoneNumber: '2506544578',
            alternatePhoneExtension: '321',
            email: 'test@test.com',
            firstName: 'EDXAutomation',
            lastName: 'Testing',
            effectiveDate: '2022-10-25T00:00:00',
            expiryDate: null
        }
        await this.clearSchoolContacts(response);
        await this.setupSchoolContact(response, contact);
        return response;
    }

    async clearSchoolContacts(school: { schoolId: any; }) {

        cy.makeAPIRequest(`${Cypress.env('institute').base_url}${SCHOOL_ENDPOINT}/${school.schoolId}`, 'GET',{}, {}).then((res) => {
            expect(res.status).to.be.equal(200)
            response = res?.body;
            cy.log(response);
        })
        if (!response.contacts) {
            return;
        }
        cy.log('deleting all school contacts');
        response.contacts.forEach(function (contact: any) {
            cy.makeAPIRequest(`${Cypress.env('institute').base_url}${SCHOOL_ENDPOINT}/${school.schoolId}/contact/${contact.schoolContactId}`, 'DELETE',{}, {}).then((res) => {
                expect(res.status).to.be.equal(200)
                response = res?.body;
                cy.log(response);
            })
        });
    }

    async setupSchoolContact(school: { schoolId: any; }, contact: { createUser: string; updateUser: null; createDate: null; updateDate: null; schoolContactId: null; schoolId: any; schoolContactTypeCode: string; phoneNumber: string; phoneExtension: string; alternatePhoneNumber: string; alternatePhoneExtension: string; email: string; firstName: string; lastName: string; effectiveDate: string; expiryDate: null; }){

        cy.log('adding Automation Testing school principal contact');
        cy.makeAPIRequest(`${Cypress.env('institute').base_url}${SCHOOL_ENDPOINT}/${school.schoolId}/contact`, 'POST',{}, contact).then((res) => {
            expect(res.status).to.be.equal(200)
            response = res?.body;
            cy.log(response);
        })
        return await response
    }

    async getSchoolIDBySchoolCodeAndDistrictID(schoolCode: string, districtID: any) {

        const schoolSearchCriteria = [{
            condition: null,
            searchCriteriaList: [
                {
                    key: "schoolNumber",
                    operation: "eq",
                    value: schoolCode,
                    valueType: "STRING",
                    condition: "AND"
                },
                {
                    key: "closedDate",
                    operation: "eq",
                    value: null,
                    valueType: "STRING",
                    condition: "AND"
                },
                {
                    key: "districtID",
                    operation: "eq",
                    value: districtID,
                    valueType: "UUID",
                    condition: "AND"
                }
            ]
        }];

        const schoolSearchParam = {
            params: {
                searchCriteriaList: JSON.stringify(schoolSearchCriteria)
            }
        };
        const url = `${Cypress.env('institute').base_url}.institute_base_url}${SCHOOL_ENDPOINT}/paginated`;
        cy.makeAPIRequest(url, 'GET',schoolSearchParam, {}).then((res) => {
            expect(res.status).to.be.equal(200)
            response = res?.body?.content[0]?.schoolId;
            cy.log(response);
        })
        return await response
    }


};


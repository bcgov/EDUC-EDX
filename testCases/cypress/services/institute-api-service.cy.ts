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

    },
    async getSchoolBySchoolDisplayName(displayName: string) {
        const data = await getToken();
        const token = data.access_token;

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
        const userSchoolResult = await restUtils.getData(token, url, schoolSearchParam);
        return userSchoolResult?.content[0];
    },

    async getAuthorityIDByAuthorityNumber(authorityNumber: string) {
        const data = await getToken();
        const token = data.access_token;

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
        const authorityResult = await restUtils.getData(token, url, authoritySearchParam);
        return authorityResult?.content[0]?.independentAuthorityId;
    },

    async createAuthorityWithContactToTest(){
        const data =  new OAuthUtil();
        const token =  data.makeOAuthRequest();

        let authorityID = await instituteApiService.getAuthorityIDByAuthorityNumber('998');

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
            return await restUtils.postData(token, url, authorityPayload);
        }
        authorityPayload.independentAuthorityId = authorityID;

        let freshAuthority = await restUtils.putData(token, url + '/' + authorityID, authorityPayload);
        await instituteApiService.setupAuthorityContact(freshAuthority);
        return freshAuthority;
    },

    async setupAuthorityContact(authority: { independentAuthorityId: any; }){
        const data = await getToken();
        const token = data.access_token;

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

        let newAuthority = await restUtils.getData(token, `${constants.institute_base_url}${AUTHORITY_ENDPOINT}/${authority.independentAuthorityId}`);
        let filteredContacts = newAuthority.contacts.filter((contact: { firstName: string; lastName: string; }) => contact.firstName === 'EDXAutomation' && contact.lastName === 'Testing');
        const url = `${Cypress.env('institute').base_url}${AUTHORITY_ENDPOINT}/${authority.independentAuthorityId}/contact`;

        if(filteredContacts.length < 1){
            return await restUtils.postData(token, url, authorityContactPayload);
        }
        authorityContactPayload.authorityContactId = filteredContacts[0].authorityContactId;
        return await restUtils.putData(token, url + '/' + authorityContactPayload.authorityContactId, authorityContactPayload);
    },

    async createDistrictWithContactToTest(includeDistrictAddress=true){
        const data = await getToken();
        const token = data.access_token;

        let districtID = await instituteApiService.getDistrictIdByDistrictNumber('998');

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
        if(!districtID){
            return await restUtils.postData(token, url, districtPayload);
        }
        districtPayload.districtId = districtID;
        let freshDistrict = await restUtils.putData(token, url + '/' + districtID, districtPayload);
        await instituteApiService.setupDistrictContact(freshDistrict);
        return freshDistrict;
    },

    async setupDistrictContact(district: { districtId: any; }){
        const data = await getToken();
        const token = data.access_token;

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

        let newDistrict = await restUtils.getData(token, `${constants.institute_base_url}${DISTRICT_ENDPOINT}/${district.districtId}`);

        const contactUrl = `${Cypress.env('institute').base_url}${DISTRICT_ENDPOINT}/${district.districtId}/contact`;

        if (newDistrict.contacts) {
            log.info('deleting all district contacts');
            newDistrict.contacts.forEach((contact: { districtContactId: any; }) => {
                restUtils.deleteData(token, `${contactUrl}/${contact.districtContactId}`);
            });
        }

        log.info('adding Automation Testing district superintendent contact')
        return await restUtils.postData(token, contactUrl, districtContactPayload);

    },
    async createSchoolWithContactToTest(districtID: any, includeSchoolAddress=true, includeTombstoneValues=true){
        const data = await getToken();
        const token = data.access_token;

        let schoolID = await instituteApiService.getSchoolIDBySchoolCodeAndDistrictID('99998', districtID);

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
            return restUtils.postData(token, url, schoolPayload);
        }
        schoolPayload.schoolId = schoolID;
        let freshSchool = await restUtils.putData(token, `${url}/${schoolID}`, schoolPayload);
        let contact = {
            createUser: 'EDXAT',
            updateUser: null,
            createDate: null,
            updateDate: null,
            schoolContactId: null,
            schoolId: freshSchool.schoolId,
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
        await instituteApiService.clearSchoolContacts(freshSchool);
        await instituteApiService.setupSchoolContact(freshSchool, contact);
        return freshSchool;
    },

    async clearSchoolContacts(school: { schoolId: any; }) {
        const data = await getToken();
        const token = data.access_token;

        let newSchool = await restUtils.getData(token, `${constants.institute_base_url}${SCHOOL_ENDPOINT}/${school.schoolId}`);

        if (!newSchool.contacts) {
            return;
        }
        log.info('deleting all school contacts');
        newSchool.contacts.forEach((contact: { schoolContactId: any; }) => {
            restUtils.deleteData(token, `${Cypress.env('institute').base_url}${SCHOOL_ENDPOINT}/${school.schoolId}/contact/${contact.schoolContactId}`);
        });
    },

    async setupSchoolContact(school: { schoolId: any; }, contact: { createUser: string; updateUser: null; createDate: null; updateDate: null; schoolContactId: null; schoolId: any; schoolContactTypeCode: string; phoneNumber: string; phoneExtension: string; alternatePhoneNumber: string; alternatePhoneExtension: string; email: string; firstName: string; lastName: string; effectiveDate: string; expiryDate: null; }){
        const data = await getToken();
        const token = data.access_token;
        log.info('adding Automation Testing school principal contact');
        return restUtils.postData(token, `${Cypress.env('institute').base_url}${SCHOOL_ENDPOINT}/${school.schoolId}/contact`, contact);
    },

    async getSchoolIDBySchoolCodeAndDistrictID(schoolCode: string, districtID: any) {
        const data = await getToken();
        const token = data.access_token;

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
        const url = `${constants.institute_base_url}${SCHOOL_ENDPOINT}/paginated`;
        const userSchoolResult = await restUtils.getData(token, url, schoolSearchParam);
        return userSchoolResult?.content[0]?.schoolId;
    },*/



};


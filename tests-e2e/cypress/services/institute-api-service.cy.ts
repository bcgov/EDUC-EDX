// @ts-ignore
const SCHOOL_ENDPOINT = `/api/v1/institute/school`;
const DISTRICT_ENDPOINT = `/api/v1/institute/district`;
const AUTHORITY_ENDPOINT=`/api/v1/institute/authority`;
import {deleteData, getData, postData, putData} from "../helpers/rest-utils";

export class instituteApiService {

    async getAllSchools(config: any) {
        const url = `${config.env.institute.base_url}${SCHOOL_ENDPOINT}`;
        return getData(url, null, config);
    }

    async getSchoolIDBySchoolCode(schoolCode: string, config: any) {
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

        const schoolSearchParam = {
            params: {
                searchCriteriaList: JSON.stringify(schoolSearchCriteria)
            }
        };
        const url = `${config.env.institute.base_url}${SCHOOL_ENDPOINT}/paginated`;
        const userSchoolResult = await getData(url, schoolSearchParam, config);
        return userSchoolResult?.content[0]?.schoolId;
    }

    async getDistrictIdByDistrictNumber(districtNumber: string, config: any) {
        debugger;
        const url = `${config.env.institute.base_url}${DISTRICT_ENDPOINT}`;
        const districtResponse = await getData(url,null, config);
        for (const district of districtResponse) {
            if (district.districtNumber === districtNumber) {
                return district.districtId;
            }
        }
    }

    async getAllDistricts(config: any) {
        const url = `${config.env.institute.base_url}${DISTRICT_ENDPOINT}`;
        return getData(url, null, config);
    }

    async createDistrict(config: any){
        console.log('AT createDistrict started');

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
        const url = `${config.env.institute.base_url}${DISTRICT_ENDPOINT}`
        const response = await postData(url, districtPayload, null, config);
        console.log('AT createDistrict completed');
        return response?.districtId;
    }
    async createSchool(districtID: string, config: any){
        console.log('AT createSchool');

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
            schoolReportingRequirementCode: 'REGULAR',
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
        const url = `${config.env.institute.base_url}${SCHOOL_ENDPOINT}`;
        const response = await postData(url, schoolPayload, null, config);
        return response?.schoolId;
    }
    async deleteSchoolContact(schoolID: string, contactID: string, config: any) {
        const url = `${config.env.institute.base_url}${SCHOOL_ENDPOINT}/`+schoolID+'/contact/'+contactID;
        await deleteData(url, null, config);
    }
    async deleteSchool(schoolID: string, config: any){
        const url = `${config.env.institute.base_url}${SCHOOL_ENDPOINT}/`+schoolID;
        await deleteData(url, null, config);
    }
    async deleteDistrict(districtID: string, config: any){
        const url = `${config.env.institute.base_url}${DISTRICT_ENDPOINT}/`+districtID;
        await deleteData(url, null, config);
    }
    async deleteInstituteSetUp(config: any){
        const school =  await this.getSchoolBySchoolDisplayName('EDX AT School', config);

        if(school){
            console.log('School Details Found for Institute Delete');
            if(school.contacts && school.contacts.length>0){
                for(const contact of school.contacts){
                    await this.deleteSchoolContact(school?.schoolId, contact.schoolContactId, config);
                }
                console.log('School Contacts Deleted');
            }
            await this.deleteSchool(school?.schoolId, config);
            console.log('School Deleted');
            await this.deleteDistrict(school?.districtId, config);
            console.log('District Deleted');
        }

    }
    async getSchoolBySchoolDisplayName(displayName: string, config: any) {
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
        const url = `${config.env.institute.base_url}${SCHOOL_ENDPOINT}/paginated`;
        const userSchoolResult = await getData(url, schoolSearchParam, config);
        return userSchoolResult?.content[0];
    }

    async getAuthorityIDByAuthorityNumber(authorityNumber: string, config: any) {
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

        const url = `${config.env.institute.base_url}${AUTHORITY_ENDPOINT}/paginated`;
        const authorityResult = await getData(url, authoritySearchParam, config);
        return authorityResult?.content[0]?.independentAuthorityId;
    }

    async createAuthorityWithContactToTest(config: any){
        let authorityID = await this.getAuthorityIDByAuthorityNumber('998', config);

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
        const url = `${config.env.institute.base_url}${AUTHORITY_ENDPOINT}`;
        if(!authorityID){
            return await postData(url, authorityPayload, null, config);
        }
        authorityPayload.independentAuthorityId = authorityID;

        let freshAuthority = await putData(url + '/' + authorityID, authorityPayload, null, config);
        await this.setupAuthorityContact(freshAuthority, config);
        return freshAuthority;
    }

    async setupAuthorityContact(authority: any, config: any){
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

        let newAuthority = await getData(`${config.env.institute.base_url}${AUTHORITY_ENDPOINT}/${authority.independentAuthorityId}`, null, config);
        let filteredContacts = newAuthority.contacts.filter((contact: { firstName: string; lastName: string; }) => contact.firstName === 'EDXAutomation' && contact.lastName === 'Testing');
        const url = `${config.env.institute.base_url}${AUTHORITY_ENDPOINT}/${authority.independentAuthorityId}/contact`;

        if(filteredContacts.length < 1){
            return await postData(url, authorityContactPayload, null, config);
        }
        authorityContactPayload.authorityContactId = filteredContacts[0].authorityContactId;
        return await putData(url + '/' + authorityContactPayload.authorityContactId, authorityContactPayload,null, config);
    }

    async createDistrictWithContactToTest(includeDistrictAddress=true, config: any){
        debugger;
        let districtID = await this.getDistrictIdByDistrictNumber('998', config);

        const districtPayload = {
            createUser: 'EDXAT',
            updateUser: null,
            createDate: null,
            updateDate: null,
            districtId: null,
            districtNumber: '998',
            faxNumber: '2505555555',
            phoneNumber: '2505555555',
            email: 'fakeuser@sd5.bc.ca',
            website: null,
            displayName: 'EDX Automation Testing District',
            districtRegionCode: 'NOT_APPLIC',
            districtStatusCode: 'ACTIVE'
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

        const url = `${config.env.institute.base_url}${DISTRICT_ENDPOINT}`;
        if(!districtID){
            return await postData(url, districtPayload, null, config);
        }
        districtPayload.districtId = districtID;
        let freshDistrict = await putData(url + '/' + districtID, districtPayload, null, config);
        await this.setupDistrictContact(freshDistrict, config);
        return freshDistrict;
    }

    async setupDistrictContact(district: any, config: any){
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

        let newDistrict = await getData(`${config.env.institute.base_url}${DISTRICT_ENDPOINT}/${district.districtId}`, null, config);

        const contactUrl = `${config.env.institute.base_url}${DISTRICT_ENDPOINT}/${district.districtId}/contact`;

        if (newDistrict.contacts) {
            console.log('deleting all district contacts');
            newDistrict.contacts.forEach((contact: { districtContactId: any; }) => {
                deleteData(`${contactUrl}/${contact.districtContactId}`, null, config);
            });
        }

        console.log('adding Automation Testing district superintendent contact')
        return await postData(contactUrl, districtContactPayload, null, config);

    }
    async createSchoolWithContactToTest(districtID: string, includeSchoolAddress=true, includeTombstoneValues=true, config: any){
        let schoolID = await this.getSchoolIDBySchoolCodeAndDistrictID('99998', districtID, config);

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
            schoolReportingRequirementCode: 'REGULAR',
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

        const url = `${config.env.institute.base_url}${SCHOOL_ENDPOINT}`;
        if(!schoolID){
            return postData(url, schoolPayload, null, config);
        }
        schoolPayload.schoolId = schoolID;
        let freshSchool = await putData(`${url}/${schoolID}`, schoolPayload, null, config);
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
        await this.clearSchoolContacts(freshSchool, config);
        await this.setupSchoolContact(freshSchool, contact, config);
        return freshSchool;
    }

    async clearSchoolContacts(school: any, config: any) {
        let newSchool = await getData(`${config.env.institute.base_url}${SCHOOL_ENDPOINT}/${school.schoolId}`, null, config);

        if (!newSchool.contacts) {
            return;
        }
        console.log('deleting all school contacts');
        newSchool.contacts.forEach((contact: { schoolContactId: any; }) => {
            deleteData(`${config.env.institute.base_url}${SCHOOL_ENDPOINT}/${school.schoolId}/contact/${contact.schoolContactId}`, null, config);
        });
    }

    async setupSchoolContact(school: any, contact: any, config: any){
        console.log('adding Automation Testing school principal contact');
        return postData(`${config.env.institute.base_url}${SCHOOL_ENDPOINT}/${school.schoolId}/contact`, contact, null, config);
    }

    async getSchoolIDBySchoolCodeAndDistrictID(schoolCode: string, districtID: string, config: any) {
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
        const url = `${config.env.institute.base_url}${SCHOOL_ENDPOINT}/paginated`;
        const userSchoolResult = await getData(url, schoolSearchParam, config);
        return userSchoolResult?.content[0]?.schoolId;
    }

}


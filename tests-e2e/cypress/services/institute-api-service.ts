// @ts-ignore
import {RestUtils} from "../helpers/rest-utils-ts";

const SCHOOL_ENDPOINT = `/api/v1/institute/school`;
const DISTRICT_ENDPOINT = `/api/v1/institute/district`;
const AUTHORITY_ENDPOINT=`/api/v1/institute/authority`;


export class InstituteApiService {
    config: any;
    restUtils: any;

    constructor(conf: any) {
        this.config = conf;
        this.restUtils = new RestUtils(this.config);
    }

    async getSchoolIDBySchoolCode(schoolCode: string) {
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
        const url = `${this.config.env.institute.base_url}${SCHOOL_ENDPOINT}/paginated`;
        const userSchoolResult = await this.restUtils.getData(url, schoolSearchParam);
        return userSchoolResult?.content[0]?.schoolId;
    }

    async getDistrictIdByDistrictNumber(districtNumber: string) {
        const url = `${this.config.env.institute.base_url}${DISTRICT_ENDPOINT}`;
        const districtResponse = await this.restUtils.getData(url,null);
        for (const district of districtResponse) {
            if (district.districtNumber === districtNumber) {
                return district.districtId;
            }
        }
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

        const url = `${this.config.env.institute.base_url}${AUTHORITY_ENDPOINT}/paginated`;
        const authorityResult = await this.restUtils.getData(url, authoritySearchParam);
        return authorityResult?.content[0]?.independentAuthorityId;
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
        const url = `${this.config.env.institute.base_url}${AUTHORITY_ENDPOINT}`;
        if(!authorityID){
            return await this.restUtils.postData(url, authorityPayload, null);
        }
        authorityPayload.independentAuthorityId = authorityID;

        let freshAuthority = await this.restUtils.putData(url + '/' + authorityID, authorityPayload, null);
        await this.setupAuthorityContact(freshAuthority);
        return freshAuthority;
    }

    async setupAuthorityContact(authority: any){
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

        let newAuthority = await this.restUtils.getData(`${this.config.env.institute.base_url}${AUTHORITY_ENDPOINT}/${authority.independentAuthorityId}`, null);
        let filteredContacts = newAuthority.contacts.filter((contact: { firstName: string; lastName: string; }) => contact.firstName === 'EDXAutomation' && contact.lastName === 'Testing');
        const url = `${this.config.env.institute.base_url}${AUTHORITY_ENDPOINT}/${authority.independentAuthorityId}/contact`;

        if(filteredContacts.length < 1){
            return await this.restUtils.postData(url, authorityContactPayload, null);
        }
        authorityContactPayload.authorityContactId = filteredContacts[0].authorityContactId;
        return await this.restUtils.putData(url + '/' + authorityContactPayload.authorityContactId, authorityContactPayload,null);
    }

    async createDistrictWithContactToTest({includeDistrictAddress = true} = {}){
        let districtID = await this.getDistrictIdByDistrictNumber('998');

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

        const url = `${this.config.env.institute.base_url}${DISTRICT_ENDPOINT}`;
        if(!districtID){
            return await this.restUtils.postData(url, districtPayload, null);
        }
        districtPayload.districtId = districtID;
        let freshDistrict = await this.restUtils.putData(url + '/' + districtID, districtPayload, null);
        await this.setupDistrictContact(freshDistrict);
        return freshDistrict;
    }

    async setupDistrictContact(district: any){
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

        let newDistrict = await this.restUtils.getData(`${this.config.env.institute.base_url}${DISTRICT_ENDPOINT}/${district.districtId}`, null);

        const contactUrl = `${this.config.env.institute.base_url}${DISTRICT_ENDPOINT}/${district.districtId}/contact`;

        if (newDistrict.contacts) {
            console.log('deleting all district contacts');
            newDistrict.contacts.forEach((contact: { districtContactId: any; }) => {
                this.restUtils.deleteData(`${contactUrl}/${contact.districtContactId}`, null);
            });
        }

        console.log('adding Automation Testing district superintendent contact')
        return await this.restUtils.postData(contactUrl, districtContactPayload, null);

    }

    async createSchoolWithContactToTest(districtID: string, {
        includeSchoolAddress = true,
        includeTombstoneValues = true,
        includeSchoolContact = true
    } = {}) {
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

        const url = `${this.config.env.institute.base_url}${SCHOOL_ENDPOINT}`;
        if(!schoolID){
            return this.restUtils.postData(url, schoolPayload, null);
        }
        schoolPayload.schoolId = schoolID;
        let freshSchool = await this.restUtils.putData(`${url}/${schoolID}`, schoolPayload, null);
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
        await this.clearSchoolContacts(freshSchool);
        if (includeSchoolContact) {
            await this.setupSchoolContact(freshSchool, contact);
        }
        return freshSchool;
    }

    async clearSchoolContacts(school: any) {
        let newSchool = await this.restUtils.getData(`${this.config.env.institute.base_url}${SCHOOL_ENDPOINT}/${school.schoolId}`, null);

        if (!newSchool.contacts) {
            return;
        }
        console.log('deleting all school contacts');
        newSchool.contacts.forEach((contact: { schoolContactId: any; }) => {
            this.restUtils.deleteData(`${this.config.env.institute.base_url}${SCHOOL_ENDPOINT}/${school.schoolId}/contact/${contact.schoolContactId}`, null);
        });
    }

    async setupSchoolContact(school: any, contact: any){
        console.log('adding Automation Testing school principal contact');
        return this.restUtils.postData(`${this.config.env.institute.base_url}${SCHOOL_ENDPOINT}/${school.schoolId}/contact`, contact, null);
    }

    async getSchoolIDBySchoolCodeAndDistrictID(schoolCode: string, districtID: string) {
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
        const url = `${this.config.env.institute.base_url}${SCHOOL_ENDPOINT}/paginated`;
        const userSchoolResult = await this.restUtils.getData(url, schoolSearchParam);
        return userSchoolResult?.content[0]?.schoolId;
    }

}


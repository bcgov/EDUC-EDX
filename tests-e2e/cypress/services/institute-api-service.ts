import { RestUtils } from '../helpers/rest-utils-ts';
import { SearchCondition, SearchCriteria, SearchFilter, SearchValueType } from '../helpers/api-search-params';

const SCHOOL_ENDPOINT = '/api/v1/institute/school';
const DISTRICT_ENDPOINT = '/api/v1/institute/district';
const AUTHORITY_ENDPOINT = '/api/v1/institute/authority';

interface BaseEntity {
  createUser: string;
  updateUser: string | null;
  createDate: string | null;
  updateDate: string | null;
}

interface PayloadAddress extends BaseEntity {
  addressId: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postal: string;
  addressTypeCode: 'MAILING' | 'PHYSICAL';
  provinceCode: 'BC';
  countryCode: 'CA';
}

interface DistrictAddress extends PayloadAddress {
  districtId: string | null;
}

interface SchoolAddress extends PayloadAddress {
  schoolId: string | null;
}

interface DistrictPayload extends BaseEntity {
  addresses: DistrictAddress[];
  districtId: string | null;
  districtNumber: string;
  faxNumber: string;
  phoneNumber: string;
  email: string;
  website: string | null;
  displayName: string;
  districtRegionCode: DistrictRegionCodeKey;
  districtStatusCode: DistrictStatusCodeKey;
}

interface SchoolPayload extends BaseEntity {
  addresses: SchoolAddress[];
  schoolId: string | null;
  schoolNumber: string;
  districtId: string | null;
  independentAuthorityId: string | null;
  faxNumber: string | null;
  phoneNumber: string | null;
  email: string | null;
  website: string | null;
  schoolReportingRequirementCode: SchoolReportingRequirementCodeKey;
  schoolOrganizationCode: SchoolOrganizationCodeKey;
  schoolCategoryCode: SchoolCategoryCodeKey;
  facilityTypeCode: SchoolFacilityTypeCodeKey;
  openedDate: string;
  closedDate: string | null;
  displayName: string;
  displayNameNoSpecialChars: string;
}

export interface SchoolContactPayload {
  createUser: string;
  updateUser: string | null;
  createDate: string | null;
  updateDate: string | null;
  schoolContactId: string | null;
  schoolId: string;
  schoolContactTypeCode: string;
  phoneNumber: string
  phoneExtension: string;
  alternatePhoneNumber: string;
  alternatePhoneExtension: string;
  email: string;
  firstName: string;
  lastName: string;
  effectiveDate: string;
  expiryDate: string | null;
}

type SchoolStatus = 'Opening' | 'Open' | 'Closing' | 'Closed';

export interface DistrictOptions {
  includeDistrictAddress?: boolean,
  withPrimaryActivationCode?: boolean;
}

export interface SchoolOptions {
  includeTombstoneValues?: boolean;
  isIndependentSchool?: boolean;
  includeSchoolAddress?: boolean;
  includeSchoolContact?: boolean;
  schoolStatus?: SchoolStatus;
  withPrimaryActivationCode?: boolean;
  schoolCode?: string;
}

export interface InstituteOptions {
  districtOptions?: DistrictOptions,
  schoolOptions?: SchoolOptions[]
}

export class InstituteApiService {
  config: Cypress.PluginConfigOptions;
  restUtils: RestUtils;

  constructor(conf: Cypress.PluginConfigOptions) {
    this.config = conf;
    this.restUtils = new RestUtils(this.config);
  }

  async getSchoolIDBySchoolCode(schoolCode: string): Promise<string|undefined> {
    const schoolSearchCriteria: SearchCriteria[] = [{
      condition: null,
      searchCriteriaList: [
        {
          key: 'schoolNumber',
          operation: SearchFilter.EQUAL,
          value: schoolCode,
          valueType: SearchValueType.STRING,
          condition: SearchCondition.AND
        },
        {
          key: 'closedDate',
          operation: SearchFilter.EQUAL,
          value: null,
          valueType: SearchValueType.STRING,
          condition: SearchCondition.AND
        }
      ]
    }];

    const schoolSearchParam = {
      params: {
        searchCriteriaList: JSON.stringify(schoolSearchCriteria)
      }
    };
    const url = `${this.config.env.institute.base_url}${SCHOOL_ENDPOINT}/paginated`;
    const userSchoolResult = await this.restUtils.getData<PaginatedSchoolResponse>(url, schoolSearchParam);
    return userSchoolResult.content[0]?.schoolId;
  }

  async getDistrictIdByDistrictNumber(districtNumber: string) {
    const url = `${this.config.env.institute.base_url}${DISTRICT_ENDPOINT}`;
    const districtResponse = await this.restUtils.getData<DistrictEntity[]>(url);
    for (const district of districtResponse) {
      if (district.districtNumber === districtNumber) {
        return district.districtId;
      }
    }
  }

  async getDistrictIdOfTestDistrict() {
    return this.getDistrictIdByDistrictNumber('998');
  }

  async getAuthorityIDByAuthorityNumber(authorityNumber: string) {
    const authoritySearchCriteria: SearchCriteria[] = [{
      condition: null,
      searchCriteriaList: [
        {
          key: 'authorityNumber',
          operation: SearchFilter.EQUAL,
          value: authorityNumber,
          valueType: SearchValueType.STRING,
          condition: SearchCondition.AND
        },
        {
          key: 'closedDate',
          operation: SearchFilter.EQUAL,
          value: null,
          valueType: SearchValueType.STRING,
          condition: SearchCondition.AND
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

  async getAuthorityByAuthorityName(authorityName: string) {
    const authoritySearchCriteria = [{
      condition: null,
      searchCriteriaList: [
        {
          key: 'displayName',
          operation: SearchFilter.EQUAL,
          value: authorityName,
          valueType: SearchValueType.STRING,
          condition: SearchCondition.AND
        },
        {
          key: 'closedDate',
          operation: SearchFilter.EQUAL,
          value: null,
          valueType: SearchValueType.STRING,
          condition: SearchCondition.AND
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
    return authorityResult?.content[0];
  }

  async createAuthorityWithContactToTest() {
    const authority = await this.getAuthorityByAuthorityName('EDX Automation Testing Authority');

    const authorityPayload = {
      createUser: 'EDXAT',
      updateUser: null,
      createDate: null,
      updateDate: null,
      authorityNumber: null,
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
    if (!authority) {
      return await this.restUtils.postData(url, authorityPayload);
    }
    authorityPayload.independentAuthorityId = authority.independentAuthorityId;
    authorityPayload.authorityNumber = authority.authorityNumber;

    const freshAuthority = await this.restUtils.putData(url + '/' + authority.independentAuthorityId, authorityPayload);
    await this.setupAuthorityContact(freshAuthority);
    return freshAuthority;
  }

  async setupAuthorityContact(authority: any) {
    const authorityContactPayload = {
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

    const newAuthority = await this.restUtils.getData(`${this.config.env.institute.base_url}${AUTHORITY_ENDPOINT}/${authority.independentAuthorityId}`, null);
    const filteredContacts = newAuthority.contacts.filter((contact: { firstName: string; lastName: string; }) => contact.firstName === 'EDXAutomation' && contact.lastName === 'Testing');
    const url = `${this.config.env.institute.base_url}${AUTHORITY_ENDPOINT}/${authority.independentAuthorityId}/contact`;

    if (filteredContacts.length < 1) {
      return await this.restUtils.postData(url, authorityContactPayload);
    }
    authorityContactPayload.authorityContactId = filteredContacts[0].authorityContactId;
    return await this.restUtils.putData(url + '/' + authorityContactPayload.authorityContactId, authorityContactPayload);
  }

  async createDistrictWithContactToTest({ includeDistrictAddress = true }: DistrictOptions) {
    const districtID = await this.getDistrictIdByDistrictNumber('998');

    const districtPayload: DistrictPayload = {
      addresses: [],
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

    if (includeDistrictAddress) {
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
      ];
    }

    const url = `${this.config.env.institute.base_url}${DISTRICT_ENDPOINT}`;
    if (!districtID) {
      return await this.restUtils.postData<DistrictEntity>(url, districtPayload);
    }
    districtPayload.districtId = districtID;
    const freshDistrict = await this.restUtils.putData<DistrictEntity>(url + '/' + districtID, districtPayload);
    await this.setupDistrictContact(freshDistrict);
    return freshDistrict;
  }

  async setupDistrictContact(district: any) {
    const districtContactPayload = {
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

    const newDistrict = await this.restUtils.getData(`${this.config.env.institute.base_url}${DISTRICT_ENDPOINT}/${district.districtId}`, null);

    const contactUrl = `${this.config.env.institute.base_url}${DISTRICT_ENDPOINT}/${district.districtId}/contact`;

    if (newDistrict.contacts) {
      console.log('deleting all district contacts');
      newDistrict.contacts.forEach((contact: { districtContactId: any; }) => {
        this.restUtils.deleteData(`${contactUrl}/${contact.districtContactId}`);
      });
    }

    console.log('adding Automation Testing district superintendent contact');
    return await this.restUtils.postData(contactUrl, districtContactPayload);

  }

  async createSchoolWithContactToTest(districtID: string, {
    includeSchoolAddress = true,
    includeTombstoneValues = true,
    includeSchoolContact = true,
    schoolStatus = 'Open',
    isIndependentSchool = false,
    schoolCode = '99998'
  }: SchoolOptions): Promise<SchoolEntity> {
    const schoolID = await this.getSchoolIDBySchoolCodeAndDistrictID(schoolCode, districtID);

    const currentDate = new Date();
    const tomorrow = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
    const yesterday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1);
    let openDate = '';
    let closeDate: string | null = null;
    switch(schoolStatus) {
    case 'Opening':
      openDate = tomorrow.toISOString().substring(0, 19);
      closeDate = null;
      break;
    case 'Open':
      openDate = '2022-01-01T00:00:00';
      closeDate = null;
      break;
    case 'Closing':
      openDate = yesterday.toISOString().substring(0, 19);
      closeDate = tomorrow.toISOString().substring(0, 19);
      break;
    case 'Closed':
      openDate = '2022-01-01T00:00:00';
      closeDate = yesterday.toISOString().substring(0, 19);
      break;
    }

    const schoolPayload: SchoolPayload = {
      addresses: [],
      createUser: 'EDXAT',
      updateUser: null,
      createDate: null,
      updateDate: null,
      schoolId: null,
      districtId: districtID,
      independentAuthorityId: null,
      schoolNumber: schoolCode,
      faxNumber: '2505555555',
      phoneNumber: '2505555555',
      email: 'fakeuser@sd5.bc.ca',
      website: null,
      displayName: 'EDX Automation Testing School',
      displayNameNoSpecialChars: 'Legacy Safe Name',
      schoolReportingRequirementCode: 'REGULAR',
      schoolOrganizationCode: 'TWO_SEM',
      schoolCategoryCode: 'PUBLIC',
      facilityTypeCode: 'STANDARD',
      openedDate: openDate,
      closedDate: closeDate,
    };
   
    if(isIndependentSchool) {
      schoolPayload.schoolCategoryCode = 'INDEPEND';
      schoolPayload.facilityTypeCode = 'STANDARD';
    }

    if (!includeTombstoneValues) {
      schoolPayload.email = null;
      schoolPayload.faxNumber = null;
      schoolPayload.phoneNumber = null;
    }

    if (includeSchoolAddress) {
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
      ];
    }

    const url = `${this.config.env.institute.base_url}${SCHOOL_ENDPOINT}`;
    if (!schoolID) {
      return this.restUtils.postData(url, schoolPayload);
    }
    schoolPayload.schoolId = schoolID;
    const freshSchool = await this.restUtils.putData<SchoolEntity>(`${url}/${schoolID}`, schoolPayload);
    const contact = {
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
    };
    await this.clearSchoolContacts(freshSchool);
    if (includeSchoolContact) {
      await this.setupSchoolContact(freshSchool, contact);
    }
    return freshSchool;
  }

  async clearSchoolContacts(school: SchoolEntity) {
    const newSchool = await this.restUtils
      .getData<SchoolEntity>(`${this.config.env.institute.base_url}${SCHOOL_ENDPOINT}/${school.schoolId}`);

    if (!newSchool.contacts) {
      return;
    }
    console.log('deleting all school contacts');
    newSchool.contacts.forEach((contact: { schoolContactId: any; }) => {
      this.restUtils.deleteData(`${this.config.env.institute.base_url}${SCHOOL_ENDPOINT}/${school.schoolId}/contact/${contact.schoolContactId}`);
    });
  }

  async setupSchoolContact(school: SchoolEntity, contact: SchoolContactPayload) {
    console.log('adding Automation Testing school principal contact');
    return this.restUtils.postData<SchoolContactEntity>(`${this.config.env.institute.base_url}${SCHOOL_ENDPOINT}/${school.schoolId}/contact`, contact);
  }

  async getSchoolIDBySchoolCodeAndDistrictID(schoolCode: string, districtID: string): Promise<string|undefined> {
    const schoolSearchCriteria: SearchCriteria[] = [{
      condition: null,
      searchCriteriaList: [
        {
          key: 'schoolNumber',
          operation: SearchFilter.EQUAL,
          value: schoolCode,
          valueType: SearchValueType.STRING,
          condition: SearchCondition.AND
        },
        {
          key: 'districtID',
          operation: SearchFilter.EQUAL,
          value: districtID,
          valueType: SearchValueType.UUID,
          condition: SearchCondition.AND
        }
      ]
    }];

    const schoolSearchParam = {
      params: {
        searchCriteriaList: JSON.stringify(schoolSearchCriteria)
      }
    };
    const url = `${this.config.env.institute.base_url}${SCHOOL_ENDPOINT}/paginated`;
    const userSchoolResult = await this.restUtils.getData<PaginatedSchoolResponse>(url, schoolSearchParam);
    return userSchoolResult.content[0]?.schoolId;
  }

}


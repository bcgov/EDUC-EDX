
const restUtils = require('../helpers/rest-utils');
const constants = require('../config/constants');

const log = require('npmlog');
const {getToken} = require('../helpers/oauth-utils');
const SCHOOL_ENDPOINT = `/api/v1/institute/school`;
const DISTRICT_ENDPOINT = `/api/v1/institute/district`;
const AUTHORITY_ENDPOINT=`/api/v1/institute/authority`;



const instituteApiService = {

  async getAllSchools(token) {
    const url = `${constants.institute_base_url}${SCHOOL_ENDPOINT}`;
    return restUtils.getData(token, url);
  },

  async getSchoolIDBySchoolCode(schoolCode) {
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
  },

  async getDistrictIdByDistrictNumber(districtNumber) {
    const data = await getToken();
    const token = data.access_token;
    const url = `${constants.institute_base_url}${DISTRICT_ENDPOINT}`;
    const districtResponse = await restUtils.getData(token, url);
    for (const district of districtResponse) {
      if (district.districtNumber === districtNumber) {
        return district.districtId;
      }
    }
  },

  async getAllDistricts(token) {
    const url = `${constants.institute_base_url}${DISTRICT_ENDPOINT}`;
    return restUtils.getData(token, url);
  },

  async createDistrict(){
    log.info('AT createDistrict started');
    const data = await getToken();
    const token = data.access_token;

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
    const url = `${constants.institute_base_url}${DISTRICT_ENDPOINT}`
    const response = await restUtils.postData(token, url, districtPayload);
    log.info('AT createDistrict completed');
    return response?.districtId;

  },
  async createSchool(districtID){
    log.info('AT createSchool');
    const data = await getToken();
    const token = data.access_token;

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
    const url = `${constants.institute_base_url}${SCHOOL_ENDPOINT}`;
    return await restUtils.postData(token, url, schoolPayload);
  },
  async deleteSchoolContact(token, schoolID, contactID) {
    const url = `${constants.institute_base_url}${SCHOOL_ENDPOINT}/`+schoolID+'/contact/'+contactID;
    await restUtils.deleteData(token,url);
  },
  async deleteSchool(token,schoolID){
  const url = `${constants.institute_base_url}${SCHOOL_ENDPOINT}/`+schoolID;
  await restUtils.deleteData(token,url);
  },
  async deleteDistrict(token,districtID){
    const url = `${constants.institute_base_url}${DISTRICT_ENDPOINT}/`+districtID;
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
  async getSchoolBySchoolDisplayName(displayName) {
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
    const url = `${constants.institute_base_url}${SCHOOL_ENDPOINT}/paginated`;
    const userSchoolResult = await restUtils.getData(token, url, schoolSearchParam);
    return userSchoolResult?.content[0];
  },

  async getAuthorityIDByAuthorityNumber(authorityNumber) {
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
    const url = `${constants.institute_base_url}${AUTHORITY_ENDPOINT}/paginated`;
    const authorityResult = await restUtils.getData(token, url, authoritySearchParam);
    return authorityResult?.content[0]?.independentAuthorityId;
  },

  async createAuthorityWithContactToTest(){
    const data = await getToken();
    const token = data.access_token;

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
    const url = `${constants.institute_base_url}${AUTHORITY_ENDPOINT}`;
    if(!authorityID){
      return await restUtils.postData(token, url, authorityPayload);
    }
    authorityPayload.independentAuthorityId = authorityID;

    let freshAuthority = await restUtils.putData(token, url + '/' + authorityID, authorityPayload);
    await instituteApiService.setupAuthorityContact(freshAuthority);
    return freshAuthority;
  },

  async setupAuthorityContact(authority){
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
    let filteredContacts = newAuthority.contacts.filter(contact => contact.firstName === 'EDXAutomation' && contact.lastName === 'Testing');
    const url = `${constants.institute_base_url}${AUTHORITY_ENDPOINT}/${authority.independentAuthorityId}/contact`;

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
      districtStatusCode: 'ACTIVE'
    };

    if(includeDistrictAddress){
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

    const url = `${constants.institute_base_url}${DISTRICT_ENDPOINT}`;
    if(!districtID){
      return await restUtils.postData(token, url, districtPayload);
    }
    districtPayload.districtId = districtID;
    let freshDistrict = await restUtils.putData(token, url + '/' + districtID, districtPayload);
    await instituteApiService.setupDistrictContact(freshDistrict);
    return freshDistrict;
  },

  async setupDistrictContact(district){
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

    const contactUrl = `${constants.institute_base_url}${DISTRICT_ENDPOINT}/${district.districtId}/contact`;

    if (newDistrict.contacts) {
      log.info('deleting all district contacts');
      newDistrict.contacts.forEach(contact => {
        restUtils.deleteData(token, `${contactUrl}/${contact.districtContactId}`);
      });
    }

    log.info('adding Automation Testing district superintendent contact')
    return await restUtils.postData(token, contactUrl, districtContactPayload);

  },
  async createSchoolWithContactToTest(districtID, includeSchoolAddress=true){
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
    };

    if(includeSchoolAddress){
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

    const url = `${constants.institute_base_url}${SCHOOL_ENDPOINT}`;
    if(!schoolID){
      return restUtils.postData(token, url, schoolPayload);
    }
    schoolPayload.schoolId = schoolID;
    let freshSchool = await restUtils.putData(token, url + '/' + schoolID, schoolPayload);
    await instituteApiService.setupSchoolContact(freshSchool);
    return freshSchool;
  },

  async setupSchoolContact(school){
    const data = await getToken();
    const token = data.access_token;

    const schoolContactPayload =
      {
        createUser: 'EDXAT',
        updateUser: null,
        createDate: null,
        updateDate: null,
        schoolContactId: null,
        schoolId: school.schoolId,
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

    let newSchool = await restUtils.getData(token, `${constants.institute_base_url}${SCHOOL_ENDPOINT}/${school.schoolId}`);

    const contactUrl = `${constants.institute_base_url}${SCHOOL_ENDPOINT}/${school.schoolId}/contact`;

    if (newSchool.contacts) {
      log.info('deleting all school contacts');
      newSchool.contacts.forEach(contact => {
        restUtils.deleteData(token, `${contactUrl}/${contact.schoolContactId}`);
      });
    }

    log.info('adding Automation Testing school principal contact')
    return await restUtils.postData(token, contactUrl, schoolContactPayload);

  },
  async getSchoolIDBySchoolCodeAndDistrictID(schoolCode, districtID) {
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
  },



};


module.exports = instituteApiService;

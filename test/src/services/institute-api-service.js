
const restUtils = require('../helpers/rest-utils');
const constants = require('../config/constants');

const log = require('npmlog');
const {getToken} = require('../helpers/oauth-utils');
const SCHOOL_ENDPOINT = `/api/v1/institute/school`;
const DISTRICT_ENDPOINT = `/api/v1/institute/district`;



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
      districtNumber: '999',
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
          publiclyAvailable: true,
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



  };


module.exports = instituteApiService;

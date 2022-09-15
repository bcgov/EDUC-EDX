
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
          condition: null
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
  }
};


module.exports = instituteApiService;

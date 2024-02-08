import axios from 'axios';
import {ApiRoutes} from '../utils/constants';
import AuthService from '../common/authService';

// Buffer concurrent requests while refresh token is being acquired
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
}

// Create new non-global axios instance and intercept strategy
const apiAxios = axios.create();
const apiAxiosConfig = axios.create();
const intercept = apiAxios.interceptors.response.use(config => config, error => {
  const originalRequest = error.config;
  if (error.response.status !== 401) {
    return Promise.reject(error);
  }
  axios.interceptors.response.eject(intercept);
  return new Promise((resolve, reject) => {
    AuthService.refreshAuthToken(localStorage.getItem('jwtToken'))
      .then(response => {
        if (response.jwtFrontend) {
          localStorage.setItem('jwtToken', response.jwtFrontend);
          apiAxios.defaults.headers.common['Authorization'] = `Bearer ${response.jwtFrontend}`;
          originalRequest.headers['Authorization'] = `Bearer ${response.jwtFrontend}`;
        }
        processQueue(null, response.jwtFrontend);
        resolve(axios(originalRequest));
      })
      .catch(e => {
        processQueue(e, null);
        localStorage.removeItem('jwtToken');
        window.location = '/token-expired';
        reject(e);
      });
  });
});

export default {
  apiAxios: apiAxios,
  intercept: intercept,
  processQueue,
  failedQueue,

  //Adds required headers to the Auth request
  setAuthHeader(token) {
    if (token) {
      apiAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiAxios.defaults.headers.common['Authorization'];
    }
  },

  async getSchoolBelongsToDistrict(schoolID) {
    try{
      return await apiAxios.get(ApiRoutes.school.SCHOOL_BELONGS_TO_DISTRICT + '/' + schoolID);
    } catch(e) {
      console.log(`Failed to get from Nodejs getSchoolBelongsToDistrict API - ${e}`);
      throw e;
    }
  },

  async getDocumentTypeCodes() {
    try{
      return await apiAxios.get(ApiRoutes.edx.DOCUMENT_TYPES_URL);
    } catch(e) {
      console.log(`Failed to get from Nodejs getDocumentTypeCodes API - ${e}`);
      throw e;
    }
  },

  async getFileRequirements() {
    try{
      return await apiAxios.get(ApiRoutes.edx.FILE_REQUIREMENTS_URL);
    } catch(e) {
      console.log(`Failed to get from Nodejs getFileRequirements API - ${e}`);
      throw e;
    }
  },

  async uploadFile(secureExchangeID, fileData){
    try{
      return await apiAxios.post(`${ApiRoutes.edx.EXCHANGE}/${secureExchangeID}/documents`, fileData);
    } catch(e) {
      console.log(`Failed to post to Nodejs uploadFile API - ${e}`);
      throw e;
    }
  },

  async deleteDocument(secureExchangeID, documentID) {
    try{
      return await apiAxios.delete(ApiRoutes.edx.EXCHANGE + `/${secureExchangeID}` + '/documents' + `/${documentID}`);
    } catch(e) {
      console.log(`Failed to deleteDocument from Nodejs API - ${e}`);
      throw e;
    }
  },

  async getUserInfo() {
    try{
      return await apiAxios.get(ApiRoutes.USER);
    } catch(e) {
      console.log(`Failed to get from Nodejs getUserInfo API - ${e}`);
      throw e;
    }
  },
  async getConfig() {
    try {
      return await apiAxiosConfig.get(ApiRoutes.CONFIG);
    } catch (e) {
      console.log(`Failed to do get from Nodejs getConfig API - ${e}`);
      throw e;
    }
  },
  getExchangeStatuses: getCodes(`${ApiRoutes.edx.STATUSES_URL}`),
  getMinistryTeamCodes: getCodes(`${ApiRoutes.edx.MINISTRY_TEAM_URL}`),
  getSchools: getCodes(`${ApiRoutes.SCHOOL_DATA_URL}`),
  getEdxExchangeSchoolIds: getCodes(`${ApiRoutes.edx.USERS_URL}/user-schools`),
  getEdxRoles: getCodes(`${ApiRoutes.edx.USERS_URL}/roles`),
  getSecureExchangeDocumentTypes: getCodes(`${ApiRoutes.edx.DOCUMENT_TYPES_URL}`),
  getDistricts: getCodes(`${ApiRoutes.DISTRICT_DATA_URL}`),
  getActiveSchools: getCodes(`${ApiRoutes.SCHOOL_DATA_URL}?active=true`),
  getActiveDistricts: getCodes(`${ApiRoutes.DISTRICT_DATA_URL}?active=true`),
  getFacilityTypeCodes: getCodes(`${ApiRoutes.institute.FACILITY_TYPES_URL}`),
  getSchoolCategoryTypeCodes: getCodes(`${ApiRoutes.institute.SCHOOL_CATEGORY_TYPES_URL}`),
  getSchoolOrganizationTypeCodes: getCodes(`${ApiRoutes.institute.SCHOOL_ORGANIZATION_TYPES_URL}`),
  getSchoolReportingRequirementTypeCodes: getCodes(
    `${ApiRoutes.institute.SCHOOL_REPORTING_REQUIREMENT_TYPES_URL}`
  ),
  getSchoolNeighborhoodLearningCodes: getCodes(`${ApiRoutes.institute.SCHOOL_NEIGHBORHOOD_LEARNING_TYPES_URL}`),
  getGradeCodes: getCodes(`${ApiRoutes.institute.SCHOOL_GRADE_TYPES_URL}`),
  getProvinceCodes: getCodes(`${ApiRoutes.institute.PROVINCE_CODES_URL}`),
  getCountryCodes: getCodes(`${ApiRoutes.institute.COUNTRY_CODES_URL}`),
  getAllActiveFacilityTypeCodes: getCodes(`${ApiRoutes.institute.FACILITY_TYPES_URL}?active=true`),
  getAllActiveSchoolCategoryTypeCodes: getCodes(`${ApiRoutes.institute.SCHOOL_CATEGORY_TYPES_URL}?active=true`),
  getAllActiveSchoolOrganizationTypeCodes: getCodes(`${ApiRoutes.institute.SCHOOL_ORGANIZATION_TYPES_URL}?active=true`),
  getAllActiveSchoolNeighborhoodLearningCodes: getCodes(`${ApiRoutes.institute.SCHOOL_NEIGHBORHOOD_LEARNING_TYPES_URL}?active=true`),
  getAllActiveSchoolGradeCodes: getCodes(`${ApiRoutes.institute.SCHOOL_GRADE_TYPES_URL}?active=true`),
  getAllActiveInstituteProvinceCodes: getCodes(`${ApiRoutes.institute.PROVINCE_CODES_URL}?active=true`),
  getAllActiveInstituteCountryCodes: getCodes(`${ApiRoutes.institute.COUNTRY_CODES_URL}?active=true`),
  getAuthorities:getCodes(`${ApiRoutes.institute.AUTHORITY_DATA_URL}`),
  getActiveAuthorities:getCodes(`${ApiRoutes.institute.AUTHORITY_DATA_URL}?active=true`),
  getAllBandCodes:getCodes(`${ApiRoutes.sdc.SDC_BAND_CODES}`),
  getAllCareerProgramCodes:getCodes(`${ApiRoutes.sdc.SDC_CAREER_PROGRAM_CODES}`),
  getAllEnrolledProgramCodes:getCodes(`${ApiRoutes.sdc.SDC_ENROLLED_PROGRAM_CODES}`),
  getAllGenderCodes:getCodes(`${ApiRoutes.sdc.SDC_GENDER_CODES}`),
  getAllEnrolledGradeCodes:getCodes(`${ApiRoutes.sdc.SDC_ENROLLED_GRADE_CODES}`),
  getAllHomeLanguageSpokenCodes:getCodes(`${ApiRoutes.sdc.SDC_HOME_LANGUAGE_SPOKEN_CODES}`),
  getAllSchoolFundingCodes:getCodes(`${ApiRoutes.sdc.SDC_SCHOOL_FUNDING_CODES}`),
  getAllSpecialEdCodes:getCodes(`${ApiRoutes.sdc.SDC_SPECIAL_ED_CODES}`),
  getAllValidationIssueTypeCodes:getCodes(`${ApiRoutes.sdc.SDC_VALIDATION_ISSUE_TYPE_CODES}`),
  getAllProgramEligibilityTypeCodes:getCodes(`${ApiRoutes.sdc.SDC_PROGRAM_ELIGIBILITY_TYPE_CODES}`),
  getAllActiveBandCodes:getCodes(`${ApiRoutes.sdc.SDC_BAND_CODES}?active=true`),
  getAllActiveCareerProgramCodes:getCodes(`${ApiRoutes.sdc.SDC_CAREER_PROGRAM_CODES}?active=true`),
  getAllActiveEnrolledProgramCodes:getCodes(`${ApiRoutes.sdc.SDC_ENROLLED_PROGRAM_CODES}?active=true`),
  getAllActiveGenderCodes:getCodes(`${ApiRoutes.sdc.SDC_GENDER_CODES}?active=true`),
  getAllActiveEnrolledGradeCodes:getCodes(`${ApiRoutes.sdc.SDC_ENROLLED_GRADE_CODES}?active=true`),
  getAllActiveHomeLanguageSpokenCodes:getCodes(`${ApiRoutes.sdc.SDC_HOME_LANGUAGE_SPOKEN_CODES}?active=true`),
  getAllActiveSchoolFundingCodes:getCodes(`${ApiRoutes.sdc.SDC_SCHOOL_FUNDING_CODES}?active=true`),
  getAllActiveSpecialEdCodes:getCodes(`${ApiRoutes.sdc.SDC_SPECIAL_ED_CODES}?active=true`)
};
function getCodes(url) {
  return async function getCodesHandler(query) {
    try {
      return await apiAxios.get(url, query);
    } catch (e) {
      console.log(`Failed to get from Nodejs API - ${e}`);
      throw e;
    }
  };
}


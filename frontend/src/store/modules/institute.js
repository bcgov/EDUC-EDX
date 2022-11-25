import ApiService from '@/common/apiService';

export default {
  namespaced: true,
  state: {
    facilityTypeCodes: null,
    schoolCategoryTypeCodes: null,
    schoolOrganizationTypeCodes: null,
    schoolNeighborhoodLearningCodes: null,
    gradeCodes: null,
    provinceCodes: null,
    countryCodes: null,
    activeFacilityTypeCodes: null,
    activeSchoolCategoryTypeCodes: null,
    activeSchoolOrganizationTypeCodes: null,
    activeSchoolNeighborhoodLearningCodes: null,
    activeGradeCodes: null,
    activeProvinceCodes: null,
    activeCountryCodes: null,
  },
  getters: {
    facilityTypeCodes: state => state.facilityTypeCodes,
    schoolCategoryTypeCodes: state => state.schoolCategoryTypeCodes,
    schoolOrganizationTypeCodes: state => state.schoolOrganizationTypeCodes,
    schoolNeighborhoodLearningCodes: state => state.schoolNeighborhoodLearningCodes,
    gradeCodes: state => state.gradeCodes,
    provinceCodes: state => state.provinceCodes,
    countryCodes: state => state.countryCodes,
    activeFacilityTypeCodes: state => state.activeFacilityTypeCodes,
    activeSchoolCategoryTypeCodes: state => state.activeSchoolCategoryTypeCodes,
    activeSchoolOrganizationTypeCodes: state => state.activeSchoolOrganizationTypeCodes,
    activeSchoolNeighborhoodLearningCodes: state => state.activeSchoolNeighborhoodLearningCodes,
    activeGradeCodes: state => state.activeGradeCodes,
    activeProvinceCodes: state => state.activeProvinceCodes,
    activeCountryCodes: state => state.activeCountryCodes,
  },
  mutations: {
    setFacilityTypeCodes: (state, facilityTypeCodes) => {
      state.facilityTypeCodes = facilityTypeCodes;
    },
    setSchoolCategoryTypeCodes: (state, schoolCategoryTypeCodes) => {
      state.schoolCategoryTypeCodes = schoolCategoryTypeCodes;
    },
    setSchoolOrganizationTypeCodes: (state, schoolOrganizationTypeCodes) => {
      state.schoolOrganizationTypeCodes = schoolOrganizationTypeCodes;
    },
    setSchoolNeighborhoodLearningCodes: (state, schoolNeighborhoodLearningCodes) => {
      state.schoolNeighborhoodLearningCodes = schoolNeighborhoodLearningCodes;
    },
    setGradeCodes: (state, gradeCodes) => {
      state.gradeCodes = gradeCodes;
    },
    setProvinceCodes: (state, provinceCodes) => {
      state.provinceCodes = provinceCodes;
    },
    setCountryCodes: (state, countryCodes) => {
      state.countryCodes = countryCodes;
    },
    setActiveFacilityTypeCodes: (state, activeFacilityTypeCodes) => {
      state.activeFacilityTypeCodes = activeFacilityTypeCodes;
    },
    setActiveSchoolCategoryTypeCodes: (state, activeSchoolCategoryTypeCodes) => {
      state.activeSchoolCategoryTypeCodes = activeSchoolCategoryTypeCodes;
    },
    setActiveSchoolOrganizationTypeCodes: (state, activeSchoolOrganizationTypeCodes) => {
      state.activeSchoolOrganizationTypeCodes = activeSchoolOrganizationTypeCodes;
    },
    setActiveSchoolNeighborhoodLearningCodes: (state, activeSchoolNeighborhoodLearningCodes) => {
      state.activeSchoolNeighborhoodLearningCodes = activeSchoolNeighborhoodLearningCodes;
    },
    setActiveGradeCodes: (state, activeGradeCodes) => {
      state.activeGradeCodes = activeGradeCodes;
    },
    setActiveProvinceCodes: (state, activeProvinceCodes) => {
      state.activeProvinceCodes = activeProvinceCodes;
    },
    setActiveCountryCodes: (state, activeCountryCodes) => {
      state.activeCountryCodes = activeCountryCodes;
    },
  },
  actions: {
    async getFacilityTypeCodes({commit}) {
      const response = await ApiService.getFacilityTypeCodes();
      commit('setFacilityTypeCodes', response.data);
    },
    async getSchoolCategoryTypeCodes({commit}) {
      const response = await ApiService.getSchoolCategoryTypeCodes();
      commit('setSchoolCategoryTypeCodes', response.data);
    },
    async getSchoolOrganizationTypeCodes({commit}) {
      const response = await ApiService.getSchoolOrganizationTypeCodes();
      commit('setSchoolOrganizationTypeCodes', response.data);
    },
    async getSchoolNeighborhoodLearningCodes({commit}) {
      const reponse = await ApiService.getSchoolNeighborhoodLearningCodes();
      commit('setSchoolNeighborhoodLearningCodes', reponse.data);
    },
    async getGradeCodes({commit}) {
      const response = await ApiService.getGradeCodes();
      commit('setGradeCodes', response.data);
    },
    async getProvinceCodes({commit}) {
      const response = await ApiService.getProvinceCodes();
      commit('setProvinceCodes', response.data);
    },
    async getCountryCodes({commit}) {
      const response = await ApiService.getCountryCodes();
      commit('setCountryCodes', response.data);
    },
    async getAllActiveFacilityTypeCodes({commit}) {
      const response = await ApiService.getAllActiveFacilityTypeCodes();
      commit('setActiveFacilityTypeCodes', response.data);
    },
    async getAllActiveSchoolCategoryTypeCodes({commit}) {
      const response = await ApiService.getAllActiveSchoolCategoryTypeCodes();
      commit('setActiveSchoolCategoryTypeCodes', response.data);
    },
    async getAllActiveSchoolOrganizationTypeCodes({commit}) {
      const response = await ApiService.getAllActiveSchoolOrganizationTypeCodes();
      commit('setActiveSchoolOrganizationTypeCodes', response.data);
    },
    async getAllActiveSchoolNeighborhoodLearningCodes({commit}) {
      const reponse = await ApiService.getAllActiveSchoolNeighborhoodLearningCodes();
      commit('setActiveSchoolNeighborhoodLearningCodes', reponse.data);
    },
    async getAllActiveGradeCodes({commit}) {
      const response = await ApiService.getAllActiveSchoolGradeCodes();
      commit('setActiveGradeCodes', response.data);
    },
    async getAllActiveProvinceCodes({commit}) {
      const response = await ApiService.getAllActiveInstituteProvinceCodes();
      commit('setActiveProvinceCodes', response.data);
    },
    async getAllActiveCountryCodes({commit}) {
      const response = await ApiService.getAllActiveInstituteCountryCodes();
      commit('setActiveCountryCodes', response.data);
    },
  }
};

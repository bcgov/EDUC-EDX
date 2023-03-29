import ApiService from '../../common/apiService';
import { defineStore } from 'pinia';

export const instituteStore = defineStore('institute', {
  namespaced: true,
  state: () => ({
    facilityTypeCodes: null,
    schoolCategoryTypeCodes: null,
    schoolOrganizationTypeCodes: null,
    schoolReportingRequirementTypeCodes: null,
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
    activeCountryCodes: null
  }),
  getters: {
    facilityTypeCodesGet: state => state.facilityTypeCodes,
    schoolCategoryTypeCodesGet: state => state.schoolCategoryTypeCodes,
    schoolOrganizationTypeCodesGet: state => state.schoolOrganizationTypeCodes,
    schoolNeighborhoodLearningCodesGet: state => state.schoolNeighborhoodLearningCodes,
    schoolReportingRequirementTypeCodesGet: state => state.schoolReportingRequirementTypeCodes,
    gradeCodesGet: state => state.gradeCodes,
    provinceCodesGet: state => state.provinceCodes,
    countryCodesGet: state => state.countryCodes,
    activeFacilityTypeCodesGet: state => state.activeFacilityTypeCodes,
    activeSchoolCategoryTypeCodesGet: state => state.activeSchoolCategoryTypeCodes,
    activeSchoolOrganizationTypeCodesGet: state => state.activeSchoolOrganizationTypeCodes,
    activeSchoolNeighborhoodLearningCodesGet: state => state.activeSchoolNeighborhoodLearningCodes,
    activeGradeCodesGet: state => state.activeGradeCodes,
    activeProvinceCodesGet: state => state.activeProvinceCodes,
    activeCountryCodesGet: state => state.activeCountryCodes,
  },
  actions: {
    async setFacilityTypeCodes(facilityTypeCodes) {
      this.facilityTypeCodes = facilityTypeCodes;
    },
    async setSchoolCategoryTypeCodes(schoolCategoryTypeCodes) {
      this.schoolCategoryTypeCodes = schoolCategoryTypeCodes;
    },
    async setSchoolOrganizationTypeCodes(schoolOrganizationTypeCodes) {
      this.schoolOrganizationTypeCodes = schoolOrganizationTypeCodes;
    },
    async setSchoolReportingRequirementTypeCodes(schoolReportingRequirementTypeCodes) {
      this.schoolReportingRequirementTypeCodes = schoolReportingRequirementTypeCodes;
    },
    async setSchoolNeighborhoodLearningCodes(schoolNeighborhoodLearningCodes) {
      this.schoolNeighborhoodLearningCodes = schoolNeighborhoodLearningCodes;
    },
    async setGradeCodes(gradeCodes) {
      this.gradeCodes = gradeCodes;
    },
    async setProvinceCodes(provinceCodes) {
      this.provinceCodes = provinceCodes;
    },
    async setCountryCodes(countryCodes) {
      this.countryCodes = countryCodes;
    },
    async setActiveFacilityTypeCodes(activeFacilityTypeCodes) {
      this.activeFacilityTypeCodes = activeFacilityTypeCodes;
    },
    async setActiveSchoolCategoryTypeCodes(activeSchoolCategoryTypeCodes) {
      this.activeSchoolCategoryTypeCodes = activeSchoolCategoryTypeCodes;
    },
    async setActiveSchoolOrganizationTypeCodes(activeSchoolOrganizationTypeCodes) {
      this.activeSchoolOrganizationTypeCodes = activeSchoolOrganizationTypeCodes;
    },
    async setActiveSchoolNeighborhoodLearningCodes(activeSchoolNeighborhoodLearningCodes) {
      this.activeSchoolNeighborhoodLearningCodes = activeSchoolNeighborhoodLearningCodes;
    },
    async setActiveGradeCodes(activeGradeCodes) {
      this.activeGradeCodes = activeGradeCodes;
    },
    async setActiveProvinceCodes(activeProvinceCodes) {
      this.activeProvinceCodes = activeProvinceCodes;
    },
    async setActiveCountryCodes(activeCountryCodes) {
      this.activeCountryCodes = activeCountryCodes;
    },
    async getFacilityTypeCodes() {
      const response = await ApiService.getFacilityTypeCodes();
      await this.setFacilityTypeCodes(response.data);
    },
    async getSchoolCategoryTypeCodes() {
      const response = await ApiService.getSchoolCategoryTypeCodes();
      await this.setSchoolCategoryTypeCodes(response.data);
    },
    async getSchoolOrganizationTypeCodes() {
      const response = await ApiService.getSchoolOrganizationTypeCodes();
      await this.setSchoolOrganizationTypeCodes(response.data);
    },
    async getSchoolReportingRequirementTypeCodes() {
      const response = await ApiService.getSchoolReportingRequirementTypeCodes();
      await this.setSchoolReportingRequirementTypeCodes(response.data);
    },
    async getSchoolNeighborhoodLearningCodes() {
      const response = await ApiService.getSchoolNeighborhoodLearningCodes();
      await this.setSchoolNeighborhoodLearningCodes(response.data);
    },
    async getGradeCodes() {
      const response = await ApiService.getGradeCodes();
      await this.setGradeCodes(response.data);
    },
    async getProvinceCodes() {
      const response = await ApiService.getProvinceCodes();
      await this.setProvinceCodes(response.data);
    },
    async getCountryCodes() {
      const response = await ApiService.getCountryCodes();
      await this.setCountryCodes(response.data);
    },
    async getAllActiveFacilityTypeCodes() {
      const response = await ApiService.getAllActiveFacilityTypeCodes();
      await this.setActiveFacilityTypeCodes(response.data);
    },
    async getAllActiveSchoolCategoryTypeCodes() {
      const response = await ApiService.getAllActiveSchoolCategoryTypeCodes();
      await this.setActiveSchoolCategoryTypeCodes(response.data);
    },
    async getAllActiveSchoolOrganizationTypeCodes() {
      const response = await ApiService.getAllActiveSchoolOrganizationTypeCodes();
      await this.setActiveSchoolOrganizationTypeCodes(response.data);
    },
    async getAllActiveSchoolNeighborhoodLearningCodes() {
      const response = await ApiService.getAllActiveSchoolNeighborhoodLearningCodes();
      await this.setActiveSchoolNeighborhoodLearningCodes(response.data);
    },
    async getAllActiveGradeCodes() {
      const response = await ApiService.getAllActiveSchoolGradeCodes();
      await this.setActiveGradeCodes(response.data);
    },
    async getAllActiveProvinceCodes() {
      const response = await ApiService.getAllActiveInstituteProvinceCodes();
      await this.setActiveProvinceCodes(response.data);
    },
    async getAllActiveCountryCodes() {
      const response = await ApiService.getAllActiveInstituteCountryCodes();
      await this.setActiveCountryCodes(response.data);
    },
  }
});

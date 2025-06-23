import {defineStore} from 'pinia';
import ApiService from '../../common/apiService';
import { ApiRoutes } from '../../utils/constants';

export const easStore = defineStore('EasStore', {
  namespaced: true,
  state: () => ({
    specialCaseCodes: {},
    schoolYear: '',
  }),
  actions: {
    async setSpecialCaseCodes(payload) {
      this.specialCaseCodes = payload;
    },
    setSchoolYear(schoolYear) {
      this.schoolYear = schoolYear;
    },
    async getSpecialCaseCodes() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (Object.keys(this.specialCaseCodes).length === 0) {
          const response = await ApiService.getAllAssessmentSpecialCaseCodes();
          await this.setSpecialCaseCodes(response.data);
        }
      }
      return this.specialCaseCodes;
    },
    async getActiveSchoolYear(activeInstituteType) {
      let response = await ApiService.apiAxios.get(`${ApiRoutes.assessments.GET_ASSESSMENT_SESSIONS}/${activeInstituteType.toLowerCase()}/active`);
      let schoolYear = response.data[0] ? response.data[0].schoolYear.replace(/\//g, '-') : '';
      this.setSchoolYear(schoolYear);
    },
  },
});

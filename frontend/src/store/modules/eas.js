import {defineStore} from 'pinia';
import ApiService from '../../common/apiService';

export const easStore = defineStore('EasStore', {
  namespaced: true,
  state: () => ({
    specialCaseCodes: {},
  }),
  actions: {
    async setSpecialCaseCodes(payload) {
      this.specialCaseCodes = payload;
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
  },
});

import {defineStore} from 'pinia';
import ApiService from '../../common/apiService';

export const penServicesStore = defineStore('penServices', {
  namespaced: true,
  state: () => ({
    prbValidationIssueTypeCodes: []
  }),
  actions: {
    async setPrbValidationIssueTypeCodes(prbValidationIssueTypeCodes){
      this.prbValidationIssueTypeCodes = prbValidationIssueTypeCodes;
    },
    async getCodes() {
      if(localStorage.getItem('jwtToken')) { // DON'T Call api if there is no token.
        const apiCalls = [];
        if(this.prbValidationIssueTypeCodes?.length === 0) {
          apiCalls.push(ApiService.getPRBValidationIssueTypeCodes().then(response => this.setPrbValidationIssueTypeCodes(response.data)));
        }
        await Promise.all(apiCalls);
      }
    }
  }
});

import {defineStore} from 'pinia';
import ApiService from '../../common/apiService';

export const gdcStore = defineStore('gdcStore', {
  namespaced: true,
  state: () => ({
    validationFieldCodesMap: new Map(),
    gradProgramCodesMap: new Map(),
    gradProgramCodes: [],
    validationFieldCode: []
  }),
  actions: {
    async setValidationFieldCodes(validationFieldCodes) {
      this.validationFieldCode = validationFieldCodes.map(item => {
        return {...item};
      });

      this.validationFieldCodesMap = new Map();
      validationFieldCodes.forEach(validationCode => {
        this.validationFieldCodesMap.set(validationCode.code, validationCode);
      });
    },
    async getValidationFieldCodes() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (this.validationFieldCodesMap.size === 0) {
          const response = await ApiService.getGdcValidationFieldCodes();
          await this.setValidationFieldCodes(response.data);
        }
      }
      return this.validationFieldCode;
    },
    async setGradProgramCodes(graduationProgramCodes) {
      this.gradProgramCodes = graduationProgramCodes.map(item => {
        return {...item};
      });

      this.gradProgramCodesMap = new Map();
      graduationProgramCodes.forEach(gradProgramCode => {
        this.gradProgramCodesMap.set(gradProgramCode.code, gradProgramCode);
      });
    },
    async getGradProgramCodes() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (this.gradProgramCodesMap.size === 0) {
          const response = await ApiService.getGradProgramCodes();
          await this.setGradProgramCodes(response.data);
        }
      }
      return this.validationFieldCode;
    },
  },
});

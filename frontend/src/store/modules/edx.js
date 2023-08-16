import ApiService from '../../common/apiService';
import { defineStore } from 'pinia';

export const edxStore = defineStore('edx', {
  namespaced: true,
  state: () => ({
    statuses: [],
    ministryTeams: [],
    exchangeSchoolIds: [],
    exchange: null,
    schoolRoles: [],
    schoolRolesCopy: [],
    districtRoles: [],
    districtRolesCopy: [],
    secureExchangeDocumentTypes: [],
    secureExchangeDocuments: [],
    fileRequirements: [],
    secureExchangeStudents:[]
  }),
  getters: {
    statusesGet: state => state.statuses,
    exchangeGet: state => state.exchange,
    secureExchangeIDGet: state => state.exchange.secureExchangeID,
    ministryTeamsGet: state => state.ministryTeams,
    secureExchangeDocumentTypesGet: state => state.secureExchangeDocumentTypes,
    secureExchangeDocumentsGet: state => state.secureExchangeDocuments,
    fileRequirementsGet: state => state.fileRequirements,
    secureExchangeStudentsGet: state => state.secureExchangeStudents,
  },
  actions: {
    async setStatuses(statuses){
      this.statuses = statuses;
    },
    async setExchange(exchange){
      this.exchange = exchange;
    },
    async setExchangeSchoolIds(payload) {
      this.exchangeSchoolIds = payload;
    },
    async setSchoolRoles(payload){
      this.schoolRoles = JSON.parse(JSON.stringify(payload));
    },
    async setSchoolRolesCopy(payload){
      this.schoolRolesCopy = JSON.parse(JSON.stringify(payload));
    },
    async setDistrictRoles(payload){
      this.districtRoles = JSON.parse(JSON.stringify(payload));
    },
    async setDistrictRolesCopy(payload){
      this.districtRolesCopy = JSON.parse(JSON.stringify(payload));
    },
    async setMinistryTeams(ministryTeams){
      this.ministryTeams = ministryTeams;
    },
    async setSecureExchangeDocumentTypes(payload) {
      this.secureExchangeDocumentTypes = payload;
    },
    async setSecureExchangeDocuments(payload) {
      this.secureExchangeDocuments = payload;
    },
    async deleteSecureExchangeDocumentByIndex(index) {
      if (index < this.secureExchangeDocuments.length) {
        this.secureExchangeDocuments.splice(index, 1);
      }
    },
    async setFileRequirements(payload) {
      this.fileRequirements = payload;
    },
    async setSecureExchangeStudents(payload){
      this.secureExchangeStudents= payload;
    },
    async deleteSecureExchangeStudentsByID(payload) {
      this.secureExchangeStudents = this.secureExchangeStudents.filter(secureExchangeStudent => secureExchangeStudent.studentID !== payload.studentID);
    },
    async getMinistryTeams() {
      if (localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (this.ministryTeams.length === 0) {
          const response = await ApiService.getMinistryTeamCodes();
          await this.setMinistryTeams(response.data);
        }
      }
    },
    async getExchangeStatusCodes() {
      if (localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (this.statuses.length === 0) {
          const response = await ApiService.getExchangeStatuses();
          await this.setStatuses(response.data);
        }
      }
    },
    async getExchangeSchoolIds() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if(this.exchangeSchoolIds.length === 0) {
          const query = {
            params: {
              permissionCode : 'SECURE_EXCHANGE',
            }
          };

          const response = await ApiService.getEdxExchangeSchoolIds(query);
          await this.setExchangeSchoolIds(response.data);
        }
      }
    },
    async getSchoolExchangeRoles() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (this.schoolRoles.length === 0) {
          const params = {
            params: {
              instituteType:'SCHOOL'
            }
          };
          const response = await ApiService.getEdxRoles(params);
          await this.setSchoolRoles(response.data);
          await this.setSchoolRolesCopy(response.data);
        }
      }
    },
    async getDistrictExchangeRoles() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (this.districtRoles.length === 0) {
          const params = {
            params: {
              instituteType:'DISTRICT'
            }
          };
          const response = await ApiService.getEdxRoles(params);
          await this.setDistrictRoles(response.data);
          await this.setDistrictRolesCopy(response.data);
        }
      }
    },
    async getSecureExchangeDocumentTypes() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (this.secureExchangeDocumentTypes.length === 0) {
          const response = await ApiService.getSecureExchangeDocumentTypes();
          await this.setSecureExchangeDocumentTypes(response.data);
        }
      }
    },
    async getFileRequirements() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if(this.fileRequirements.length === 0) {
          const response = await ApiService.getFileRequirements();
          await this.setFileRequirements(response.data);
        }
      }
    },
  }
});

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
    statuses: state => state.statuses,
    exchange: state => state.exchange,
    secureExchangeID: state => state.exchange.secureExchangeID,
    ministryTeams: state => state.ministryTeams,
    secureExchangeDocumentTypes: state => state.secureExchangeDocumentTypes,
    secureExchangeDocuments: state => state.secureExchangeDocuments,
    fileRequirements: state => state.fileRequirements,
    secureExchangeStudents: state => state.secureExchangeStudents,
  },
  actions: {
    async setStatuses(state, statuses){
      state.statuses = statuses;
    },
    async setExchange(state, exchange){
      state.exchange = exchange;
    },
    async setExchangeSchoolIds(state, payload) {
      state.exchangeSchoolIds = payload;
    },
    async setSchoolRoles(state, payload){
      state.schoolRoles = JSON.parse(JSON.stringify(payload));
    },
    async setSchoolRolesCopy(state, payload){
      state.schoolRolesCopy = JSON.parse(JSON.stringify(payload));
    },
    async setDistrictRoles(state, payload){
      state.districtRoles = JSON.parse(JSON.stringify(payload));
    },
    async setDistrictRolesCopy(state, payload){
      state.districtRolesCopy = JSON.parse(JSON.stringify(payload));
    },
    async setMinistryTeams(state, ministryTeams){
      state.ministryTeams = ministryTeams;
    },
    async setSecureExchangeDocumentTypes(state, payload) {
      state.secureExchangeDocumentTypes = payload;
    },
    async setSecureExchangeDocuments(state, payload) {
      state.secureExchangeDocuments = payload;
    },
    async deleteSecureExchangeDocumentByIndex(state, index) {
      if (index < state.secureExchangeDocuments.length) {
        state.secureExchangeDocuments.splice(index, 1);
      }
    },
    async setFileRequirements(state, payload) {
      state.fileRequirements = payload;
    },
    async setSecureExchangeStudents(state,payload){
      state.secureExchangeStudents= payload;
    },
    async deleteSecureExchangeStudentsByID(state, payload) {
      state.secureExchangeStudents = state.secureExchangeStudents.filter(secureExchangeStudent => secureExchangeStudent.studentID !== payload.studentID);
    },
    async getMinistryTeams({commit, state}) {
      if (localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (state.ministryTeams.length === 0) {
          const response = await ApiService.getMinistryTeamCodes();
          commit('setMinistryTeams', response.data);
        }
      }
    },
    async getExchangeStatusCodes({commit, state}) {
      if (localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (state.statuses.length === 0) {
          ApiService.getExchangeStatuses().then(response => {
            commit('setStatuses', response.data);
          });
        }
      }
    },
    async getExchangeSchoolIds({ commit, state}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if(state.exchangeSchoolIds.length === 0) {
          const query = {
            params: {
              permissionCode : 'SECURE_EXCHANGE',
            }
          };

          const response = await ApiService.getEdxExchangeSchoolIds(query);
          commit('setExchangeSchoolIds', response.data);
        }
      }
    },
    async getSchoolExchangeRoles({ commit, state}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (state.schoolRoles.length === 0) {
          const params = {
            params: {
              instituteType:'SCHOOL'
            }
          };
          const response = await ApiService.getEdxRoles(params);
          commit('setSchoolRoles', response.data);
          commit('setSchoolRolesCopy', response.data);
        }
      }
    },
    async getDistrictExchangeRoles({ commit, state}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (state.districtRoles.length === 0) {
          const params = {
            params: {
              instituteType:'DISTRICT'
            }
          };
          const response = await ApiService.getEdxRoles(params);
          commit('setDistrictRoles', response.data);
          commit('setDistrictRolesCopy', response.data);

        }
      }
    },
    async getSecureExchangeDocumentTypes({ commit, state}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (state.secureExchangeDocumentTypes.length === 0) {
          const response = await ApiService.getSecureExchangeDocumentTypes();
          commit('setSecureExchangeDocumentTypes', response.data);
        }
      }
    },
    async getFileRequirements({ commit, state}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if(state.fileRequirements.length === 0) {
          const response = await ApiService.getFileRequirements();
          commit('setFileRequirements', response.data);
        }
      }
    },
  }
});

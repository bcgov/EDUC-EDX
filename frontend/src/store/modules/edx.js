import document from '@/store/modules/document.js';
import ApiService from '@/common/apiService';

export default {
  namespaced: true,
  state: () => ({
    statuses: [],
    ministryTeams: [],
    exchangeMincodes: [],
    exchange: null,
    roles: [],
    rolesCopy: [],
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
  mutations: {
    setStatuses: (state, statuses) => {
      state.statuses = statuses;
    },
    setExchange: (state, exchange) => {
      state.exchange = exchange;
    },
    setExchangeMincodes(state, payload) {
      state.exchangeMincodes = payload;
    },
    setRoles(state, payload){
      state.roles = JSON.parse(JSON.stringify(payload));
    },
    setRolesCopy(state, payload){
      state.rolesCopy = JSON.parse(JSON.stringify(payload));
    },
    setMinistryTeams: (state, ministryTeams) => {
      state.ministryTeams = ministryTeams;
    },
    setSecureExchangeDocumentTypes(state, payload) {
      state.secureExchangeDocumentTypes = payload;
    },
    setSecureExchangeDocuments(state, payload) {
      state.secureExchangeDocuments = payload;
    },
    deleteSecureExchangeDocumentByIndex(state, index) {
      if (index < state.secureExchangeDocuments.length) {
        state.secureExchangeDocuments.splice(index, 1);
      }
    },
    setFileRequirements(state, payload) {
      state.fileRequirements = payload;
    },
    setSecureExchangeStudents(state,payload){
      state.secureExchangeStudents= payload;
    },
    deleteSecureExchangeStudentsByID(state, payload) {
      state.secureExchangeStudents = state.secureExchangeStudents.filter(secureExchangeStudent => secureExchangeStudent.studentID !== payload.studentID);
    }
  },
  actions: {
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
    async getExchangeMincodes({ commit, state}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if(state.exchangeMincodes.length === 0) {
          const query = {
            params: {
              permissionCode : 'SECURE_EXCHANGE',
            }
          };

          const response = await ApiService.getEdxMincodes(query);
          commit('setExchangeMincodes', response.data);
        }
      }
    },
    async getExchangeRoles({ commit, state}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (state.roles.length === 0) {
          const response = await ApiService.getEdxRoles();
          commit('setRoles', response.data);
          commit('setRolesCopy', response.data);
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
  },
  modules: {
    document,
  }
};

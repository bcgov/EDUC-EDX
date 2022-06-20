import document from '@/store/modules/document.js';
import ApiService from '@/common/apiService';

export default {
  namespaced: true,
  state: () => ({
    statuses: [],
    ministryTeams: [],
    exchangeMincodes: [],
    exchange: null,
    roles: []
  }),
  getters: {
    statuses: state => state.statuses,
    exchange: state => state.exchange,
    secureExchangeID: state => state.exchange.secureExchangeID,
    ministryTeams: state => state.ministryTeams,
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
      state.roles = payload;
    },
    setMinistryTeams: (state, ministryTeams) => {
      state.ministryTeams = ministryTeams;
    },
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
              permissionName : 'SECURE_EXCHANGE',
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
          ApiService.getEdxRoles().then(response => {
            commit('setRoles', response.data);
          });
        }
      }
    },
  },
  modules: {
    document,
  }
};

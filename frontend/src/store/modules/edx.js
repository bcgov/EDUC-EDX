import document from '@/store/modules/document.js';
import ApiService from '@/common/apiService';
export default {
  namespaced: true,
  state: () => ({
    statuses: [],
    exchange: null,
  }),
  getters: {
    statuses: state => state.statuses,
    exchange: state => state.exchange,
    secureExchangeID: state => state.exchange.secureExchangeID,
  },
  mutations: {
    setStatuses: (state, statuses) => {
      state.statuses = statuses;
    },
    setExchange: (state, exchange) => {
      state.exchange = exchange;
    },
  },
  actions: {
    async getCodes({commit, state}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is not token.
        if (state.statuses.length === 0) {
          ApiService.getExchangeStatuses().then(response => {
            commit('setStatuses', response.data);
          });
        }
      }
    },
  },
  modules: {
    document, 
  }
};

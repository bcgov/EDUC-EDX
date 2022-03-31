import document from '@/store/modules/document.js';

export default {
  namespaced: true,
  state: () => ({
    statuses: null,
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
  modules: {
    document, 
  }
};

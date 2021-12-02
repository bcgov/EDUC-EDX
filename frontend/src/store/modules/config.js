import ApiService from '@/common/apiService';


export default {
  namespaced: true,
  state: {
    numDaysAllowedInDraftStatus: null,
  },
  getters: {
    numDaysAllowedInDraftStatus: state => state.numDaysAllowedInDraftStatus
  },
  mutations: {
    setNumDaysAllowedInDraftStatus: (state, numDaysAllowedInDraftStatus) => {
      state.numDaysAllowedInDraftStatus = numDaysAllowedInDraftStatus;
    }
  },
  actions: {
    async getNumDaysAllowedInDraftStatus({commit}) {
      const response = await ApiService.getConfig('scheduler:numDaysAllowedInDraftStatus');
      commit('setNumDaysAllowedInDraftStatus', response);
    }
  }
};

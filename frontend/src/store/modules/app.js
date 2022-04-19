export default {
  namespaced: true,
  state: {
    pageTitle: null,
  },
  getters: {

  },
  mutations: {
    setPageTitle: (state, pageTitle) => {
      state.pageTitle = pageTitle;
    },

  },
};

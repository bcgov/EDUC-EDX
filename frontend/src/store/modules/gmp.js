import { getField, updateField } from 'vuex-map-fields';

const getDefaultState = () => {
  return {
    requestData: {},
    declared: false,
  };
};

export default {
  namespaced: true,
  state: getDefaultState,
  getters: {
    requestData: state => state.requestData,
    getField,
  },
  mutations: {
    setRequestData: (state, requestData) => {
      state.requestData = requestData;
    },
    updateField,
    clearGmpState: (state) => {
      Object.assign(state, {...getDefaultState()});
    },
  }
};

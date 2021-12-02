import { getField, updateField } from 'vuex-map-fields';

const getDefaultState = () => {
  return {
    recordedData: {},
    updateData: {
      legalLastName: null,
      legalFirstName: null,
      legalMiddleNames: null,
      dob: null,
      genderCode: null,
      email: null,
    },
    declared: false,
    acceptance: false,
    isEditable: {
      editLegalLastName: false,
      editLegalFirstName: false,
      editLegalMiddleNames: false,
      editBirthdate: false,
      editGenderLabel: false,
      editEmail: false
    }
  };
};

export default {
  namespaced: true,
  state: getDefaultState,
  getters: {
    recordedData: state => state.recordedData,
    updateData: state => state.updateData,
    getField
  },
  mutations: {
    setRecordedData: (state, recordedData) => {
      state.recordedData = recordedData;
    },
    setUpdateData: (state, updateData) => {
      state.updateData = updateData;
    },
    updateField,
    clearUmpState: (state) => {
      Object.assign(state, {...getDefaultState()});
    },
  },
};

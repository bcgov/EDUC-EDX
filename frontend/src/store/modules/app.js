import ApiService from '@/common/apiService';

export default {
  namespaced: true,
  state: {
    pageTitle: null,
    mincodeSchoolNames: new Map(),
    districtCodes: new Set()
  },
  getters: {
    mincodeSchoolNamesObjectSorted: state => Object.values(Object.fromEntries(state.mincodeSchoolNames)).map(v => v.toUpperCase()).sort(),
  },
  mutations: {
    setPageTitle: (state, pageTitle) => {
      state.pageTitle = pageTitle;
    },
    setMincodeSchoolNameAndDistrictCodes(state, mincodeSchoolNameList) {
      state.mincodeSchoolNames = new Map();
      mincodeSchoolNameList.forEach(element => {
        state.mincodeSchoolNames.set(element.mincode, element.schoolName);
        state.districtCodes.add(element.mincode?.substring(0, 3));
      });
    },
  },
  actions: {
    async getMincodeSchoolNames({ commit, state}) {
      console.log('Calling this');
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is no token.
        if(state.mincodeSchoolNames.size === 0) {
          const response = await ApiService.getMincodeSchoolNames();
          commit('setMincodeSchoolNameAndDistrictCodes', response.data);
        }
      }
    },
  },
};

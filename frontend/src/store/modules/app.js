import ApiService from '@/common/apiService';

export default {
  namespaced: true,
  state: {
    pageTitle: null,
    mincodeSchoolNames: new Map(),
    districts : new Map(),
    districtCodes: new Set(),
    alertNotificationText: '',
    alertNotificationQueue: [],
    alertNotification: false
  },
  getters: {
    mincodeSchoolNamesObjectSorted: state => Object.values(Object.fromEntries(state.mincodeSchoolNames)).map(v => v.toUpperCase()).sort(),
    districtsObjectSorted: state => Object.values(Object.fromEntries(state.districts)).map(v => v.toUpperCase()).sort(),
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
    setAlertNotificationText: (state, alertNotificationText) => {
      state.alertNotificationText = alertNotificationText;
    },
    setAlertNotification: (state, alertNotification) => {
      state.alertNotification = alertNotification;
    },
    addAlertNotification(state, text) {
      state.alertNotificationQueue.push(text);
      if (!state.alertNotification) {
        state.alertNotification = true;
      }
    },
    setDistricts(state, districtList) {
      state.districts = new Map();
      districtList.forEach(element => {
        state.districts.set(element.districtId, element);
      });
    },
  },
  actions: {
    async getMincodeSchoolNames({ commit, state}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is no token.
        if(state.mincodeSchoolNames.size === 0) {
          const response = await ApiService.getMincodeSchoolNames();
          commit('setMincodeSchoolNameAndDistrictCodes', response.data);
        }
        if(state.districts.size === 0) {
          const response = await ApiService.getDistricts();
          commit('setDistricts', response.data);
        }
      }
    },
  },
};

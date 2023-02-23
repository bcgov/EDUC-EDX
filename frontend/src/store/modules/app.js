import ApiService from '../../common/apiService';
import { defineStore } from 'pinia';

export const appStore = defineStore('app', {
  namespaced: true,
  state: () => ({
    pageTitle: null,
    schoolsMap: new Map(),
    activeSchoolsMap:  new Map(),
    activeDistrictsMap: new Map(),
    districtsMap : new Map(),
    alertNotificationText: '',
    alertNotificationQueue: [],
    alertNotification: false
  }),
  getters: {
    schoolsMapObjectSorted: state => Object.values(Object.fromEntries(state.schoolsMap)).map(v => v.toUpperCase()).sort(),
    districtsMapObjectSorted: state => Object.values(Object.fromEntries(state.districtsMap)).map(v => v.toUpperCase()).sort(),
  },
  actions: {
    async setPageTitle(state, pageTitle){
      state.pageTitle = pageTitle;
    },
    async setSchools(state, schoolsResponse) {
      state.schoolsMap = new Map();
      schoolsResponse.forEach(element => {
        state.schoolsMap.set(element.schoolID, element);
      });
    },
    async setActiveSchools(state, activeSchoolsResponse) {
      state.activeSchoolsMap = new Map();
      activeSchoolsResponse.forEach(element => {
        state.activeSchoolsMap.set(element.schoolID, element);
      });
    },
    async setActiveDistricts(state, activeDistrictsResponse) {
      state.activeDistrictsMap = new Map();
      activeDistrictsResponse.forEach(element => {
        state.activeDistrictsMap.set(element.districtID, element);
      });
    },
    async setAlertNotificationText(state, alertNotificationText){
      state.alertNotificationText = alertNotificationText;
    },
    async setAlertNotification(state, alertNotification){
      state.alertNotification = alertNotification;
    },
    async addAlertNotification(state, text) {
      state.alertNotificationQueue.push(text);
      if (!state.alertNotification) {
        state.alertNotification = true;
      }
    },
    async setDistricts(state, districtList) {
      state.districtsMap = new Map();
      districtList.forEach(element => {
        state.districtsMap.set(element.districtID, element);
      });
    },
    async getInstitutesData({ commit, state}) {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is no token.
        if(state.schoolsMap.size === 0) {
          const response = await ApiService.getSchools();
          commit('setSchools', response.data);
        }
        if (state.activeSchoolsMap.size === 0) {
          const response = await ApiService.getActiveSchools();
          commit('setActiveSchools', response.data);
        }
        if(state.districtsMap.size === 0) {
          const response = await ApiService.getDistricts();
          commit('setDistricts', response.data);
        }
        if (state.activeDistrictsMap.size === 0) {
          const response = await ApiService.getActiveDistricts();
          commit('setActiveDistricts', response.data);
        }
      }
    },
  },
});

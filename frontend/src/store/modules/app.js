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
    async setPageTitle(pageTitle){
      this.pageTitle = pageTitle;
    },
    async setSchools(schoolsResponse) {
      this.schoolsMap = new Map();
      schoolsResponse.forEach(element => {
        this.schoolsMap.set(element.schoolID, element);
      });
    },
    async setActiveSchools(activeSchoolsResponse) {
      this.activeSchoolsMap = new Map();
      activeSchoolsResponse.forEach(element => {
        this.activeSchoolsMap.set(element.schoolID, element);
      });
    },
    async setActiveDistricts(activeDistrictsResponse) {
      this.activeDistrictsMap = new Map();
      activeDistrictsResponse.forEach(element => {
        this.activeDistrictsMap.set(element.districtID, element);
      });
    },
    async setAlertNotificationText(alertNotificationText){
      this.alertNotificationText = alertNotificationText;
    },
    async setAlertNotification(alertNotification){
      this.alertNotification = alertNotification;
    },
    async addAlertNotification(text) {
      this.alertNotificationQueue.push(text);
      if (!this.alertNotification) {
        this.alertNotification = true;
      }
    },
    async setDistricts(districtList) {
      this.districtsMap = new Map();
      districtList.forEach(element => {
        this.districtsMap.set(element.districtID, element);
      });
    },
    async getInstitutesData() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is no token.
        if(this.schoolsMap.size === 0) {
          const response = await ApiService.getSchools();
          await this.setSchools(response.data);
        }
        if (this.activeSchoolsMap.size === 0) {
          const response = await ApiService.getActiveSchools();
          await this.setActiveSchools(response.data);
        }
        if(this.districtsMap.size === 0) {
          const response = await ApiService.getDistricts();
          await this.setDistricts(response.data);
        }
        if (this.activeDistrictsMap.size === 0) {
          const response = await ApiService.getActiveDistricts();
          await this.setActiveDistricts(response.data);
        }
      }
    },
  },
});

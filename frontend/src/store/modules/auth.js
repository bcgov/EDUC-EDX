import ApiService from '../../common/apiService';
import AuthService from '../../common/authService';
import { defineStore } from 'pinia';

function isFollowUpVisit() {
  return !!this.jwtToken;
}

function isExpiredToken(jwtToken) {
  const now = Date.now().valueOf() / 1000;
  const jwtPayload = jwtToken.split('.')[1];
  const payload = JSON.parse(window.atob(jwtPayload));
  return payload.exp <= now;
}

async function refreshToken() {
  if (isExpiredToken(this.jwtToken)) {
    await this.logout();
    return;
  }

  const response = await AuthService.refreshAuthToken(getters.jwtToken);
  if (response.jwtFrontend) {
    await this.setJwtToken(response.jwtFrontend);
    ApiService.setAuthHeader(response.jwtFrontend);
  } else {
    throw 'No jwtFrontend';
  }
}

async function getInitialToken() {
  const response = await AuthService.getAuthToken();

  if (response.jwtFrontend) {
    await this.setJwtToken(response.jwtFrontend);
    ApiService.setAuthHeader(response.jwtFrontend);
  } else {
    throw 'No jwtFrontend';
  }
}

export const authStore = defineStore('auth', {
  namespaced: true,
  state: () => ({
    acronymsState: [],
    isAuthenticatedState: false,
    userInfoState: null,
    errorState: false,
    isLoadingState: true,
    loginErrorState: false,
    jwtTokenState: localStorage.getItem('jwtToken'),
  }),
  getters: {
    acronyms: state => state.acronyms,
    isAuthenticated: state => state.isAuthenticated,
    jwtToken: state => state.jwtToken,
    userInfo: state => state.userInfo,
    loginError: state => state.loginError,
    error: state => state.error,
    isLoading: state => state.isLoading,
  },
  actions: {
    //sets Json web token and determines whether user is authenticated
    async setJwtToken(token = null){
      if (token) {
        this.isAuthenticatedState = true;
        this.jwtTokenState = token;
        localStorage.setItem('jwtToken', token);
      } else {
        this.isAuthenticatedState = false;
        this.jwtTokenState = null;
        localStorage.removeItem('jwtToken');
      }
    },
    async setUserInfo(userInfo){
      if(userInfo){
        this.userInfoState = userInfo;
      } else {
        this.userInfoState = null;
      }
    },
    async setLoginError(){
      this.loginErrorState = true;
    },
    async setError(error){
      this.errorState = error;
    },
    async setLoading(isLoading){
      this.isLoadingState = isLoading;
    },
    async loginErrorRedirect(){
      this.loginErrorState = true;
    },
    async logout() {
      await this.setJwtToken();
      await this.setUserInfo();
    },
    async getUserInfo(){
      const userInfoRes = await ApiService.getUserInfo();
      this.userInfoState = userInfoRes.data;
    },
    //retrieves the json web token from local storage. If not in local storage, retrieves it from API
    async getJwtToken() {
      this.errorState = false;
      if (isFollowUpVisit()) {
        await refreshToken();
      } else {  //inital login and redirect
        await getInitialToken();
      }
    },
  }
});

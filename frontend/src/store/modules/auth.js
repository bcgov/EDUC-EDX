import ApiService from '../../common/apiService';
import AuthService from '../../common/authService';
import { defineStore } from 'pinia';

function isFollowUpVisit({jwtToken}) {
  return !!jwtToken;
}

function isExpiredToken(jwtToken) {
  const now = Date.now().valueOf() / 1000;
  const jwtPayload = jwtToken.split('.')[1];
  const payload = JSON.parse(window.atob(jwtPayload));
  return payload.exp <= now;
}

async function refreshToken({getters, commit, dispatch}) {
  if (isExpiredToken(getters.jwtToken)) {
    dispatch('logout');
    return;
  }

  const response = await AuthService.refreshAuthToken(getters.jwtToken);
  if (response.jwtFrontend) {
    commit('setJwtToken', response.jwtFrontend);
    ApiService.setAuthHeader(response.jwtFrontend);
  } else {
    throw 'No jwtFrontend';
  }
}

async function getInitialToken({commit}) {
  const response = await AuthService.getAuthToken();

  if (response.jwtFrontend) {
    commit('setJwtToken', response.jwtFrontend);
    ApiService.setAuthHeader(response.jwtFrontend);
  } else {
    throw 'No jwtFrontend';
  }
}

export const authStore = defineStore('auth', {
  namespaced: true,
  state: () => ({
    acronyms: [],
    isAuthenticated: false,
    userInfo: null,
    error: false,
    isLoading: true,
    loginError: false,
    jwtToken: localStorage.getItem('jwtToken'),
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
    async setJwtToken(state, token = null){
      if (token) {
        state.isAuthenticated = true;
        state.jwtToken = token;
        localStorage.setItem('jwtToken', token);
      } else {
        state.isAuthenticated = false;
        state.jwtToken = null;
        localStorage.removeItem('jwtToken');
      }
    },
    async setUserInfo(state, userInfo){
      if(userInfo){
        state.userInfo = userInfo;
      } else {
        state.userInfo = null;
      }
    },
    async setLoginError(state){
      state.loginError = true;
    },
    async setError(state, error){
      state.error = error;
    },
    async setLoading(state, isLoading){
      state.isLoading = isLoading;
    },
    async loginErrorRedirect(context){
      context.commit('setLoginError');
    },
    async logout(context) {
      context.commit('setJwtToken');
      context.commit('setUserInfo');
      // router.push(AuthRoutes.LOGOUT);
    },
    async getUserInfo({commit}){
      const userInfoRes = await ApiService.getUserInfo();
      commit('setUserInfo', userInfoRes.data);
    },
    //retrieves the json web token from local storage. If not in local storage, retrieves it from API
    async getJwtToken(context) {
      context.commit('setError', false);
      if (isFollowUpVisit(context.getters)) {
        await refreshToken(context);
      } else {  //inital login and redirect
        await getInitialToken(context);
      }
    },
  }
});

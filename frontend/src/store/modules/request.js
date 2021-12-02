import ApiService from '@/common/apiService';
//import {getData} from '@/store/modules/helpers';
import { find } from 'lodash';
import document from '@/store/modules/document.js';
import comment from '@/store/modules/comment.js';

export default {
  namespaced: true,
  state: () => ({
    genders: null,
    statuses: null,
    request: null,
  }),
  getters: {
    genders: state => state.genders,
    genderInfo: state => genderCode => find(state.genders, ['genderCode', genderCode]),
    statuses: state => state.statuses,
    request: state => state.request,
    requestID: (state, getters, rootState, rootGetters) => state.request[`${rootGetters.requestType}ID`],
  },
  mutations: {
    setGenders: (state, genders) => {
      state.genders = genders;
    },
    setStatuses: (state, statuses) => {
      state.statuses = statuses;
    },
    setRequest: (state, request) => {
      state.request = request;
    },
  },
  actions: {
    async postRequest({commit, rootGetters}, request){
      try {
        const response = await ApiService.postRequest(request, rootGetters.requestType);
        if(response.status !== 200){
          return false;
        }
        commit('setRequest', response.data);
        return response.data;
      } catch(e) {
        console.log('Error while accessing API - ' + e);
        return false;
      }
    },
    async getCodes({commit}, requestType) {
      const response = await ApiService.getCodes(requestType);
      commit('setGenders', response.data.genderCodes);
      commit('setStatuses', response.data.statusCodes);
    },
    //getRequest: (_context, { requestId, requestType }) => getData(ApiService.getRequest, requestId),
  },
  modules: {
    document, 
    comment,
  }
};

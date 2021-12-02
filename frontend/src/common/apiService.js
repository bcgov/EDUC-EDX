import axios from 'axios';
import {ApiRoutes} from '@/utils/constants';
import AuthService from '@/common/authService';

// Buffer concurrent requests while refresh token is being acquired
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
}

// Create new non-global axios instance and intercept strategy
const apiAxios = axios.create();
const intercept = apiAxios.interceptors.response.use(config => config, error => {
  const originalRequest = error.config;
  if (error.response.status !== 401) {
    return Promise.reject(error);
  }
  axios.interceptors.response.eject(intercept);
  return new Promise((resolve, reject) => {
    AuthService.refreshAuthToken(localStorage.getItem('jwtToken'))
      .then(response => {
        if (response.jwtFrontend) {
          localStorage.setItem('jwtToken', response.jwtFrontend);
          apiAxios.defaults.headers.common['Authorization'] = `Bearer ${response.jwtFrontend}`;
          originalRequest.headers['Authorization'] = `Bearer ${response.jwtFrontend}`;
        }
        processQueue(null, response.jwtFrontend);
        resolve(axios(originalRequest));
      })
      .catch(e => {
        processQueue(e, null);
        localStorage.removeItem('jwtToken');
        window.location = '/token-expired';
        reject(e);
      });
  });
});

export default {
  apiAxios: apiAxios,
  intercept: intercept,
  processQueue,
  failedQueue,

  //Adds required headers to the Auth request
  setAuthHeader(token) {
    if (token) {
      apiAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiAxios.defaults.headers.common['Authorization'];
    }
  },

  async postRequest(userInfo, requestType){
    try{
      return await apiAxios.post(ApiRoutes[requestType].REQUEST, userInfo);
    } catch(e) {
      console.log(`Failed to post to Nodejs API - ${e}`);
      throw e;
    }
  },

  async updateRequestStatus(requestId, status, requestType){
    try{
      return await apiAxios.patch(`${ApiRoutes[requestType].REQUEST}/${requestId}`, {[`${requestType}StatusCode`]: status});
    } catch(e) {
      console.log(`Failed to post to Nodejs API - ${e}`);
      throw e;
    }
  },

  async getCodes(requestType) {
    try{
      return await apiAxios.get(ApiRoutes[requestType].CODES);
    } catch(e) {
      console.log(`Failed to get from Nodejs API - ${e}`);
      throw e;
    }
  },

  async getDocumentTypeCodes(requestType) {
    try{
      return await apiAxios.get(ApiRoutes[requestType].DOCUMENT_TYPE_CODES);
    } catch(e) {
      console.log(`Failed to get from Nodejs getDocumentTypeCodes API - ${e}`);
      throw e;
    }
  },

  async getFileRequirements(requestType) {
    try{
      return await apiAxios.get(ApiRoutes[requestType].FILE_REQUIREMENTS);
    } catch(e) {
      console.log(`Failed to get from Nodejs getFileRequirements API - ${e}`);
      throw e;
    }
  },

  async uploadFile(requestId, fileData, requestType){
    try{
      return await apiAxios.post(`${ApiRoutes[requestType].REQUEST}/${requestId}/documents`, fileData);
    } catch(e) {
      console.log(`Failed to post to Nodejs uploadFile API - ${e}`);
      throw e;
    }
  },

  async getRequest(requestId, requestType) {
    try{
      return await apiAxios.get(ApiRoutes[requestType].REQUEST + `/${requestId}`);
    } catch(e) {
      console.log(`Failed to get from Nodejs getRequest API - ${e}`);
      throw e;
    }
  },

  async getDocumentList(requestId, requestType) {
    try{
      return await apiAxios.get(ApiRoutes[requestType].REQUEST + `/${requestId}` + '/documents');
    } catch(e) {
      console.log(`Failed to get from Nodejs getDocumentList API - ${e}`);
      throw e;
    }
  },

  async getDocument(requestId, documentId, requestType) {
    try{
      return await apiAxios.get(ApiRoutes[requestType].REQUEST + `/${requestId}` + '/documents' + `/${documentId}`);
    } catch(e) {
      console.log(`Failed to get from Nodejs getDocument API - ${e}`);
      throw e;
    }
  },

  async deleteDocument(requestId, documentId, requestType) {
    try{
      return await apiAxios.delete(ApiRoutes[requestType].REQUEST + `/${requestId}` + '/documents' + `/${documentId}`);
    } catch(e) {
      console.log(`Failed to deleteDocument from Nodejs API - ${e}`);
      throw e;
    }
  },

  async getCommentList(requestId, requestType) {
    try{
      return await apiAxios.get(ApiRoutes[requestType].REQUEST + `/${requestId}` + '/comments');
    } catch(e) {
      console.log(`Failed to get from Nodejs getCommentList API - ${e}`);
      throw e;
    }
  },

  async postComment(requestId, message, requestType) {
    try {
      return await apiAxios.post(ApiRoutes[requestType].REQUEST + `/${requestId}` + '/comments', message);
    } catch (e) {
      console.log(`Failed to post to Nodejs postComment API - ${e}`);
      throw e;
    }
  },

  async getUserInfo() {
    try{
      return await apiAxios.get(ApiRoutes.USER);
    } catch(e) {
      console.log(`Failed to get from Nodejs getUserInfo API - ${e}`);
      throw e;
    }
  },

  async resendVerificationEmail(requestId, requestType){
    try{
      return await apiAxios.post(ApiRoutes[requestType].REQUEST + `/${requestId}` + '/verification-email');
    } catch(e) {
      console.log(`Failed to post to Nodejs resendVerificationEmail API - ${e}`);
      throw e;
    }
  },
  async getConfig(configName) {
    try {
      const queryParams = {
        params: {
          configName: configName
        }
      };
      const response = await apiAxios.get(ApiRoutes.CONFIG, queryParams);
      return response.data.configValue;
    } catch (e) {
      console.log(`Failed to do get from Nodejs getNumDaysAllowedInDraftStatus API - ${e}`);
      throw e;
    }
  },
};

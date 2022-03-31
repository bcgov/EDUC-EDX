import ApiService from '@/common/apiService';
//import {getData, postData} from '@/store/modules/helpers';

export default {
  state: {
    documentTypeCodes: null,
    unsubmittedDocuments: [],
  },
  getters: {
    documentTypeCodes: state => state.documentTypeCodes,
    unsubmittedDocuments: state => state.unsubmittedDocuments,
  },
  mutations: {
    setDocumentTypeCodes: (state, documentTypeCodes) => {
      state.documentTypeCodes = documentTypeCodes;
    },
    setUnsubmittedDocuments: (state, unsubmittedDocuments) => {
      state.unsubmittedDocuments = unsubmittedDocuments || [];
    },
    setUploadedDocument: (state, document) => {
      state.unsubmittedDocuments = [...state.unsubmittedDocuments, document];
    },
  },
  actions: {
    async getDocumentTypeCodes({commit}) {
      const response = await ApiService.getDocumentTypeCodes();
      commit('setDocumentTypeCodes', response.data);
    },
    async deleteFile({commit, getters}, {secureExchangeID, documentID}){
      await ApiService.deleteDocument(secureExchangeID, documentID);
      const documents = getters.unsubmittedDocuments.filter(document => document.documentID !== documentID);
      commit('setUnsubmittedDocuments', documents);
    },
    //getFileRequirements: () => getData(ApiService.getFileRequirements),
    //uploadFile: (_context, fileData) => postData(ApiService.uploadFile, _context, fileData),
  }
};

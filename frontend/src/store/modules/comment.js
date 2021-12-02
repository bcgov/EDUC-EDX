import ApiService from '@/common/apiService';

export default {
  state: {
    requestComments: null,
    unsubmittedComment: null,
    commentHistory: [],
  },
  getters: {
    requestComments: state => state.requestComments,
    unsubmittedComment: state => state.unsubmittedComment,
    commentHistory: state => state.commentHistory,
  },
  mutations: {
    setRequestComments: (state, requestComments) => {
      state.requestComments = requestComments;
    },
    setUnsubmittedComment: (state, unsubmittedComment) => {
      state.unsubmittedComment = unsubmittedComment;
    },
    setCommentHistory: (state, commentHistory) => {
      state.commentHistory = commentHistory || [];
    },
    setCommentSubmitted: (state, documents) => {
      state.unsubmittedComment.documents = documents;
      state.commentHistory = [...state.commentHistory, ...state.requestComments, state.unsubmittedComment];
      state.unsubmittedComment = null;
      state.requestComments = null;
    },
  },
  actions: {
    async postComment({commit, rootGetters}, {requestID, comment}){
      const response = await ApiService.postComment(requestID, comment, rootGetters.requestType);
      commit('setUnsubmittedComment', response.data);
    },
  }
};

export default {
  state: {
    student: null,
    requestType: null,
  },
  getters: {
    student: state => state.student,
    requestType: state => state.requestType,
  },
  mutations: {
    setStudent: (state, student) => {
      state.student = student;
    },
    setRequestType: (state, requestType) => {
      state.requestType = requestType;
    },
  },
};

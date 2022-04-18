import Vue from 'vue';
import Vuex from 'vuex';
import auth from '@/store/modules/auth.js';
import edx from '@/store/modules/edx.js';
import app from '@/store/modules/app.js';
Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    auth, 
    edx,
    app
  }
});

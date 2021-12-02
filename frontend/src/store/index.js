import Vue from 'vue';
import Vuex from 'vuex';
import auth from '@/store/modules/auth.js';
import request from '@/store/modules/request.js';
import config from '@/store/modules/config.js';
import ump from '@/store/modules/ump.js';
import gmp from '@/store/modules/gmp.js';
import root from '@/store/modules/root.js';
Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    root,
    auth, 
    penRequest: request, 
    studentRequest: request, 
    config,
    ump,
    gmp
  }
});

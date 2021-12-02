import { mount } from '@vue/test-utils';
import Vuetify from 'vuetify';
import Vue from 'vue';
import Vuex from 'vuex';
jest.mock('../../../src/common/staticConfig', () => {
  return {
    VUE_APP_BCEID_REG_URL: 'https://bceid.ca/'
  };
});
import Login from '../../../src/components/Login.vue';
import auth from '@/store/modules/auth';
import VueRouter from 'vue-router';

describe('Login.vue', () => {
  let wrapper;
  let store;
  let router;
  
  beforeEach(() => {
    Vue.use(VueRouter);
    Vue.use(Vuetify);
    Vue.use(Vuex);
    
    router = new VueRouter();
    store = new Vuex.Store({
      modules: { auth }
    });

    wrapper = mount(Login, {
      Vue: Vue,
      store,
      router
    });
  });

  test('Check login form exists', () => {
    expect(wrapper.html()).toContain('login-cards');
  });

  test('Ensure clear storage works', () => {
    wrapper.vm.clearStorage();
  });
});


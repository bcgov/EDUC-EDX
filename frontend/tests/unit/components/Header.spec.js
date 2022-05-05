import { shallowMount } from '@vue/test-utils';
import Vuetify from 'vuetify';
import Vuex from 'vuex';
import Vue from 'vue';
import Header from '@/components/Header.vue';
import auth from '@/store/modules/auth.js';

describe('Header.vue', () => {
  let wrapper;
  let store;

  const breakpoint = {
    init: jest.fn(),
    framework: {},
    smAndDown: true,
  };
  const vuetify = new Vuetify();
  vuetify.framework.breakpoint = breakpoint;

  beforeEach(() => {
    Vue.use(Vuetify);
    Vue.use(Vuex);

    store = new Vuex.Store({
      modules: { auth }
    });

    wrapper = shallowMount(Header, {
      Vue: Vue,
      vuetify,
      store
    });
  });

  test('expect site title', () => {
    expect(wrapper.html()).toContain(process.env.VUE_APP_TITLE);
  });

  // test('logout of site', () => {
  //   wrapper.vm.clearStorage();
  // });

  test('test computed values', () => {
    expect(wrapper.vm.dataReady).toBeFalsy();
  });
});

import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import ApiService from '@/common/apiService';
import rootStore from '@/store/modules/root';
import documentStore from '@/store/modules/document';
import MockAdapter from 'axios-mock-adapter';
import { ApiRoutes } from '@/utils/constants.js';
import flushPromises from 'flush-promises';

const mockAxios = new MockAdapter(ApiService.apiAxios);

describe('document.js', () => {
  const spy = jest.spyOn(ApiService.apiAxios, 'get');
  const requestType = 'studentRequest';
  let store;

  beforeEach(() => {
    ApiService.apiAxios.interceptors.response.eject(ApiService.intercept);
    const localVue = createLocalVue();
    localVue.use(Vuex);

    store = new Vuex.Store({
      modules: {
        root: rootStore,
        document: documentStore
      }
    });
    store.commit('setRequestType', requestType);
  });
  afterEach(() => {
    spy.mockClear();
  });

  it('User should get true response on successful get', async () => {
    mockAxios.onGet(ApiRoutes[requestType].DOCUMENT_TYPE_CODES).reply(200, {
      code: 'DriverLicense'
    });

    store.dispatch('getDocumentTypeCodes');
    await flushPromises();
    expect(store.getters.documentTypeCodes).toBeTruthy();
  });

  it('User should get false response on failed get', async () => {
    mockAxios.onGet(ApiRoutes[requestType].DOCUMENT_TYPE_CODES).reply(400, {
      status: 400
    });

    await expect(store.dispatch('getDocumentTypeCodes')).rejects.toThrow(Error);
  });
});

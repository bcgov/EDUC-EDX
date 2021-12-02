import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import ApiService from '@/common/apiService';
import rootStore from '@/store/modules/root';
import requestStore from '@/store/modules/request';
import MockAdapter from 'axios-mock-adapter';
import { ApiRoutes } from '@/utils/constants.js';

const mockAxios = new MockAdapter(ApiService.apiAxios);

describe('auth.js', () => {
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
        studentRequest: requestStore
      }
    });
    store.commit('setRequestType', requestType);
  });
  afterEach(() => {
    spy.mockClear();
  });

  it('User should get true response on successful post', async () => {
    mockAxios.onPost(ApiRoutes[requestType].REQUEST).reply(200, {
      status: 200
    });

    var response = await store.dispatch(`${requestType}/postRequest`, { requestData: {}, recordedData: {} });
    expect(response).toBeTruthy();
  });

  it('User should get false response on failed post', async () => {
    mockAxios.onPost(ApiRoutes[requestType].REQUEST).reply(400, {
      status: 400
    });

    var response = await store.dispatch(`${requestType}/postRequest`, { requestData: {}, recordedData: {} });
    expect(response).toBeFalsy();
  });
});

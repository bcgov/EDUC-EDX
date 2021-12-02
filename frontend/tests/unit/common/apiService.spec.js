//import axios from 'axios';
import ApiService from '@/common/apiService';
import MockAdapter from 'axios-mock-adapter';
import { ApiRoutes } from '@/utils/constants.js';

const mockAxios = new MockAdapter(ApiService.apiAxios);

describe('apiService.js', () => {
  const spy = jest.spyOn(ApiService.apiAxios, 'post');

  beforeEach(() => {
    ApiService.apiAxios.interceptors.response.eject(ApiService.intercept);
  });
  afterEach(() => {
    spy.mockClear();
  });
  
  it('Set and Delete Auth header', () => {
    ApiService.setAuthHeader('randomToken');
    expect(ApiService.apiAxios.defaults.headers.common['Authorization']).toBe('Bearer randomToken');
    ApiService.setAuthHeader();
    expect(ApiService.apiAxios.defaults.headers.common['Authorization']).toBe(undefined);
  });

  it('process items in queue with error', () => {
    ApiService.failedQueue = ['itemA', 'itemB', 'itemC'];
    ApiService.processQueue(Error, null);
  });

  it('process items in queue with successful promise', () => {
    ApiService.failedQueue = ['itemA', 'itemB', 'itemC'];
    ApiService.processQueue(null, 'token');
  });

  it('should respond to axios post with 200', () => {
    const requestType = 'studentRequest';
    mockAxios.onPost(ApiRoutes[requestType].REQUEST).reply(200);

    const info = {message: 'fakeMessage'};
    const response = ApiService.postRequest(info, requestType);
    expect(response).toBeTruthy();
  });
});

import axios from 'axios';
import ApiService from '@/common/apiService';
import AuthService from '@/common/authService';
import MockAdapter from 'axios-mock-adapter';
import { AuthRoutes } from '@/utils/constants.js';

const mockAxios = new MockAdapter(axios);


describe('authService.js', () => {
  const spy = jest.spyOn(ApiService.apiAxios, 'get');

  afterEach(() => {
    spy.mockClear();
  });

  it('Call get token endpoint', async () => {
    mockAxios.onGet(AuthRoutes.TOKEN).reply(200, {
      jwtFrontend: 'fakeToken'
    });
    const res = await AuthService.getAuthToken();
    expect(res.jwtFrontend).toBe('fakeToken');
  });

  it('Call refresh token endpoint', async () => {
    mockAxios.onPost(AuthRoutes.REFRESH).reply(200, {
      jwtFrontend: 'token',
    });
    const res = await AuthService.refreshAuthToken('oldToken');
    expect(res.jwtFrontend).toBe('token');
  });

  it('Expect refreshToken to fail', async () => {
    mockAxios.onPost(AuthRoutes.REFRESH).reply(200, {
      jwtFrontend: 'token',
      error: true,
      error_description: 'test error'
    });
    try{
      await AuthService.refreshAuthToken('testToken');
    } catch(e) {
      expect(e).toEqual({error: 'test_error'});
    }
  });

  it('Expect getAuthToken to throw error', async () => {
    mockAxios.onGet(AuthRoutes.TOKEN).reply(function() {
      throw new Error('error');
    });
    expect(AuthService.getAuthToken()).rejects.toThrowError();
  });

  it('Expect getAuthToken to throw error if not return 2xx', async () => {
    mockAxios.onGet(AuthRoutes.TOKEN).reply(400, {
      error: 'error',
      error_description: 'test error'
    });
    expect(AuthService.getAuthToken()).rejects.toThrowError();
  });

  it('Expect getRefreshToken to throw error', async () => {
    mockAxios.onPost(AuthRoutes.REFRESH).reply(function() {
      throw new Error('error');
    });
    expect(AuthService.refreshAuthToken('testToken')).rejects.toThrowError();
  });

  it('Expect getRefreshToken to throw error if not return 2xx ', async () => {
    mockAxios.onPost(AuthRoutes.REFRESH).reply(400, {
      error: 'error',
      error_description: 'test error'
    });
    expect(AuthService.refreshAuthToken('testToken')).rejects.toThrowError();
  });
});

const axios = require('axios');
const config = require('../../../src/config/index');
const utils = require('../../../src/components/utils');
const MockAdapter = require('axios-mock-adapter');

const mockAxios = new MockAdapter(axios);

describe('getOidcDiscovery', () => {
  const url = 'http://token.endpoint';
  const discovery = {
    token_endpoint: url,
    scopes_supported: ['openid', 'offline_access'],
  };

  afterEach(() => {
    utils.__set__('discovery', null);
  });

  it('should return discovery data', async () => {
    mockAxios.onGet(config.get('oidc:discovery')).reply(200, discovery);

    const result = await utils.getOidcDiscovery();

    expect(result).toEqual(discovery);
    expect(utils.__get__('discovery')).toEqual(discovery);
  });

  it('should return null if errors thrown', async () => {
    mockAxios.onGet(config.get('oidc:discovery')).reply(404);

    const result = await utils.getOidcDiscovery();

    expect(result).toBeNull();
    expect(utils.__get__('discovery')).toBeNull();
  });
});

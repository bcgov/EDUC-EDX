const axios = require('axios');
const config = require('../../../src/config/index');
const utils = require('../../../src/components/utils');
const MockAdapter = require('axios-mock-adapter');

const mockAxios = new MockAdapter(axios);

describe('minify', () => {
  it('should return minified documentData by default', async () => {
    const result = utils.__get__('minify')({ fileName: 'testfile.pdf', documentData: '0123456789' });
    expect(result.documentData.length).toBe(5);
  });

  it('should return other fields without changes', async () => {
    const result = utils.__get__('minify')({ fileName: 'testfile.pdf', documentData: '0123456789' });
    expect(result.fileName).toBe('testfile.pdf');
  });

  it('should return minified fields if their names are passed into', async () => {
    const result = utils.__get__('minify')({ fileName: 'testfile.pdf', documentData: '0123456789' }, ['documentData', 'fileName']);
    expect(result.fileName.length).toBe(5);
    expect(result.documentData.length).toBe(5);
  });
});

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

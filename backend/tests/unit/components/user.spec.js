jest.mock('../../../src/components/utils');
const utils = require('../../../src/components/utils');
const exchange = require('../../../src/components/user');
const config = require('../../../src/config');
const {ServiceError} = require('../../../src/components/error');
const {mockRequest, mockResponse} = require('../helpers');
const {__RewireAPI__: rewireRequest} = require('../../../src/components/user');
const HttpStatus = require('http-status-codes');
const lodash = require('lodash');
const correlationID = '67590460-efe3-4e84-9f9a-9acffda79657';
describe('getDigitalIdData', () => {
  const digitalIdData = { data: 'data' };
  jest.spyOn(utils, 'getAccessToken');
  const spy = jest.spyOn(utils, 'getData');

  afterEach(() => {
    spy.mockClear();
    jest.clearAllMocks();
  });
  let req;
  const session = {
  };


  beforeEach(() => {
    utils.getAccessToken.mockReturnValue('token');
    req = mockRequest(null, session, {});
    req.session.correlationID=correlationID;
  });

  it('should return DigitalId data', async () => {
    utils.getData.mockResolvedValue(digitalIdData);

    const result = await exchange.__get__('getDigitalIdData')('token', 'digitalID', correlationID);

    expect(result).toBeTruthy();
    expect(result.data).toEqual(digitalIdData.data);
    //expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('token', config.get('digitalID:apiEndpoint') + '/digitalID', correlationID);
  });

  it('should throw ServiceError if getData is failed', async () => {
    utils.getData.mockRejectedValue(new Error('error'));

    expect(exchange.__get__('getDigitalIdData')('token', 'digitalID')).rejects.toThrowError(ServiceError);
  });
});

describe('getServerSideCodes', () => {
  const codes =[
    {
      code: 'M',
      label: 'Male',
    },
    {
      code: 'F',
      label: 'Female',
    }
  ];

  const spy = jest.spyOn(utils, 'getData');

  afterEach(() => {
    spy.mockClear();
    exchange.__set__('codes', null);
  });

  it('should return codes', async () => {
    utils.getData.mockResolvedValue(codes);

    const result = await exchange.__get__('getServerSideCodes')('token');

    expect(result).toBeTruthy();
    expect(result.identityTypes).toEqual(codes);
    expect(exchange.__get__('codes').identityTypes).toEqual(codes);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('token', `${config.get('digitalID:apiEndpoint')}/identityTypeCodes`);
  });

  it('should not call getData if codes exist', async () => {
    exchange.__set__('codes', {
      identityTypes: codes
    });

    const result = await exchange.__get__('getServerSideCodes')('token');

    expect(result).toBeTruthy();
    expect(result.identityTypes).toEqual(codes);
    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('should throw ServiceError if getData is failed', async () => {
    utils.getData.mockRejectedValue(new Error('error'));

    expect(exchange.__get__('getServerSideCodes')('token')).rejects.toThrowError(ServiceError);
  });
});

describe('getUserInfo', () => {
  const digitalID = 'ac337def-704b-169f-8170-653e2f7c001';

  const sessionUser = {
    jwt: 'token',
    _json: {
      digitalIdentityID: digitalID,
      displayName: 'Firstname Lastname',
      accountType: 'BCEID',
    },
  };

  const edxUserData = {
    firstName: 'Firstname',
    lastName: 'Lastname'
  };

  const digitalIdData = {
    identityTypeCode: 'BASIC',
    studentID: null
  };

  const codes = {
    identityTypes: [
      {
        identityTypeCode: 'BCSC',
        label: 'BC Services Card',
      },
      {
        identityTypeCode: 'BASIC',
        label: 'Basic BCeID',
      }
    ]
  };

  let req;
  let res;

  jest.spyOn(utils, 'getSessionUser');

  beforeEach(() => {
    utils.getSessionUser.mockReturnValue(sessionUser);
    req = mockRequest();
    res = mockResponse();
    rewireRequest.__Rewire__('getDigitalIdData', () => Promise.resolve(digitalIdData));
    rewireRequest.__Rewire__('getServerSideCodes', () => Promise.resolve(codes));
    rewireRequest.__Rewire__('getEdxUserByDigitalId', () => Promise.resolve(edxUserData));
  });

  afterEach(() => {
    jest.clearAllMocks();
    rewireRequest.__ResetDependency__('getDigitalIdData');
    rewireRequest.__ResetDependency__('getServerSideCodes');
    rewireRequest.__ResetDependency__('getEdxUserByDigitalId');
  });

  it('should return UNAUTHORIZED if no session', async () => {
    utils.getSessionUser.mockReturnValue(null);

    await exchange.getUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should return user info without student info if no student info', async () => {
    await exchange.getUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({
      displayName: `${edxUserData.firstName} ${edxUserData.lastName}`,
      accountType: sessionUser._json.accountType,
      identityTypeLabel: lodash.find(codes.identityTypes, ['identityTypeCode', digitalIdData.identityTypeCode]).label,
    });
  });

  it('should return INTERNAL_SERVER_ERROR if invalid identityTypeCode', async () => {
    const digitalIdData = {
      identityTypeCode: 'INVALID',
      studentID: null
    };

    rewireRequest.__Rewire__('getDigitalIdData', () => Promise.resolve(digitalIdData));

    await exchange.getUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should return INTERNAL_SERVER_ERROR if exceptions thrown', async () => {
    rewireRequest.__Rewire__('getDigitalIdData', () => Promise.reject(new ServiceError('error')));

    await exchange.getUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

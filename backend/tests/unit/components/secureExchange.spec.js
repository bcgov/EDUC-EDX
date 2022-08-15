const HttpStatus = require('http-status-codes');

jest.mock('../../../src/components/utils');
const utils = require('../../../src/components/utils');
const exchange = require('../../../src/components/secureExchange');
const {mockRequest, mockResponse} = require('../helpers');
const redis = require('redis-mock');
jest.mock('../../../src/util/redis/redis-client');
const redisClient = require('../../../src/util/redis/redis-client');
jest.mock('../../../src/util/redis/redis-utils');
const redisUtil = require('../../../src/util/redis/redis-utils');
const correlationID = '67590460-efe3-4e84-9f9a-9acffda79657';
const sampleJsonResponseEdxPaginated = {data: '{"content":[{"createUser":"EDX-API","updateUser":"EDX-API","createDate":"2022/02/15","updateDate":"2022-02-15T17:22:25","secureExchangeID":"8e2018f5-7f00-1eb6-817f-001f9a490000","contactIdentifier":"d81977f8-1adc-bad7-e053-9ae9228ef97c","ministryOwnershipTeamID":"d81977f8-1adc-bad7-e053-9ae9228ef97c","secureExchangeContactTypeCode":"MINTEAM","secureExchangeStatusCode":"New exchange","reviewer":null,"subject":"Hello Student","isReadByMinistry":"N","isReadByExchangeContact":"N","statusUpdateDate":"2022-02-15T17:22:25","sequenceNumber":"1","commentsList":[{"createUser":"TEST","updateUser":"TEST","createDate":"2022-02-15T17:22:25","updateDate":"2022-02-15T17:22:25","secureExchangeCommentID":null,"secureExchangeID":"8e2018f5-7f00-1eb6-817f-001f9a490000","edxUserID":null,"staffUserIdentifier":"TEST","commentUserName":"JACKSON, JAMES","content":"This is content","commentTimestamp":"2022-02-15T17:22:25"}],"contactIdentifierName":"PEN"}],"pageable":{"sort":{"sorted":true,"unsorted":false,"empty":false},"offset":0,"pageNumber":0,"pageSize":25,"paged":true,"unpaged":false},"totalPages":1,"totalElements":1,"last":true,"size":1,"number":0,"sort":{"sorted":true,"unsorted":false,"empty":false},"numberOfElements":1,"first":true,"empty":false}'};
const statuses = {data: '[{secureExchangeStatusCode:\'COMPLETE\',label:\'Complete\',description:\'Secure exchange completed.\',displayOrder:3,effectiveDate:\'2020-01-01T00:00:00\',expiryDate:\'2099-12-31T00:00:00\'},{secureExchangeStatusCode:\'NEW\',label:\'New\',description:\'New secure exchange.\',displayOrder:1,effectiveDate:\'2020-01-01T00:00:00\',expiryDate:\'2099-12-31T00:00:00\'},{secureExchangeStatusCode:\'INPROG\',label:\'In Progress\',description:\'Secure exchange in progress.\',displayOrder:2,effectiveDate:\'2020-01-01T00:00:00\',expiryDate:\'2099-12-31T00:00:00\'}]'};
const ministryTeamCodes = {data:'[{createUser:\'IDIR/MVILLENE\',updateUser:\'IDIR/MVILLENE\',createDate:\'2019-11-07T00:00:00\',updateDate:\'2019-11-07T00:00:00\',ministryOwnershipTeamId:\'d81977f8-1adc-bad7-e053-9ae9228ef97c\',teamName:\'PEN Team\',groupRoleIdentifier:\'PEN_TEAM_ROLE\'}]'};
const token = 'token';
describe('verifyRequest', () => {
  const requestID = 'RequestID';
  const params = {
    id: requestID,
    documentId: 'documentId'
  };
  const session = {
    secureExchange: {
      secureExchangeID: requestID,
    },
    correlationID
  };
  const userInfo = {};
  const verifyRequest = exchange.verifyRequest;

  let req;
  let res;
  let next;

  jest.spyOn(utils, 'getSessionUser');
  jest.spyOn(redisClient, 'getRedisClient');
  jest.spyOn(redisUtil, 'isSagaInProgressForDigitalID');

  beforeEach(() => {
    utils.getSessionUser.mockReturnValue(userInfo);
    redisClient.getRedisClient.mockReturnValue(redis);
    redisUtil.isSagaInProgressForDigitalID.mockReturnValue(false);
    req = mockRequest(null, session, params);
    res = mockResponse();
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next', () => {
    verifyRequest(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return UNAUTHORIZED if no session', async () => {
    utils.getSessionUser.mockReturnValue(null);

    verifyRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should return BAD_REQUEST if no request in session', async () => {
    const session = {};
    req = mockRequest(null, session, params);
    verifyRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should return BAD_REQUEST if different requestID in session', async () => {
    const session = {
      secureExchange: {
        secureExchangeID: 'OtherRequestID,'
      }
    };
    req = mockRequest(null, session, params);
    verifyRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });
});

describe('getExchanges', () => {
  const session = {
    correlationID,
    userMinCodes: ['00618200'],
    activeInstituteIdentifier : '00618200',
    activeInstitutePermissions : ['SECURE_EXCHANGE']
  };
  let req;
  let res;
  beforeEach(() => {
    req = mockRequest(null, session, {});
    res = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should return results when all the api calls are success', async () => {
    utils.getDataWithParams.mockResolvedValue(sampleJsonResponseEdxPaginated);
    utils.getAccessToken.mockResolvedValue(token);
    utils.getCodeTable.mockReturnValueOnce(statuses);
    utils.getCodeTable.mockReturnValueOnce(ministryTeamCodes);
    const result = await exchange.getExchanges(req,res);

    expect(result.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(result.data.json).toBe(sampleJsonResponseEdxPaginated);
  });
});

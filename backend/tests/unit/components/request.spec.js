const HttpStatus = require('http-status-codes');
const lodash = require('lodash');
const config = require('../../../src/config/index');

const LocalDateTime = require('@js-joda/core').LocalDateTime;
jest.mock('../../../src/components/utils');
const utils = require('../../../src/components/utils');
const changeRequest = require('../../../src/components/request');
const {  __RewireAPI__: rewireRequest} =  require('../../../src/components/request');
const { ServiceError, ApiError, ConflictStateError } = require('../../../src/components/error');
const { mockRequest, mockResponse } = require('../helpers');
const { setStudentRequestReplicateStatus, verifyStudentRequestStatus } = require('../../../src/components/studentRequest');
const redis = require('redis-mock');
jest.mock('../../../src/util/redis/redis-client');
const redisClient = require('../../../src/util/redis/redis-client');
jest.mock('../../../src/util/redis/redis-utils');
const redisUtil = require('../../../src/util/redis/redis-utils');
const correlationID = '67590460-efe3-4e84-9f9a-9acffda79657';
describe('verifyRequest', () => {
  const requestID = 'RequestID';
  const params = {
    id: requestID,
    documentId: 'documentId'
  };
  const requestType = 'studentRequest';
  const session = {
    [requestType]: {
      studentRequestID: requestID,
    },
    correlationID
  };
  const userInfo = { };
  const verifyRequest = changeRequest.verifyRequest(requestType);

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
    const session = {
    };
    req = mockRequest(null, session, params);
    verifyRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should return BAD_REQUEST if different requestID in session', async () => {
    const session = {
      studentRequestID: 'OtherRequestID,'
    };
    req = mockRequest(null, session, params);
    verifyRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });
});

describe('getDigitalIdData', () => {
  const digitalIdData = { data: 'data' };

  const spy = jest.spyOn(utils, 'getData');

  afterEach(() => {
    spy.mockClear();
  });

  it('should return DigitalId data', async () => {
    utils.getData.mockResolvedValue(digitalIdData);

    const result = await changeRequest.__get__('getDigitalIdData')('token', 'digitalID', correlationID);

    expect(result).toBeTruthy();
    expect(result.data).toEqual(digitalIdData.data);
    //expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('token', config.get('digitalID:apiEndpoint') + '/digitalID', correlationID);
  });

  it('should throw ServiceError if getData is failed', async () => {
    utils.getData.mockRejectedValue(new Error('error'));

    expect(changeRequest.__get__('getDigitalIdData')('token', 'digitalID')).rejects.toThrowError(ServiceError);
  });
});



describe('getLatestRequest', () => {
  const digitalID = 'ac337def-704b-169f-8170-653e2f7c001';
  let requests = [
    {
      digitalID,
      statusUpdateDate: '2020-03-03T23:05:40'
    },
    {
      digitalID,
      statusUpdateDate: '2020-03-05T07:05:59'
    },
    {
      digitalID,
      statusUpdateDate: '2020-03-04T10:05:40'
    },
  ];
  const requestType = 'studentRequest';
  const setReplicateStatus = setStudentRequestReplicateStatus;

  const spy = jest.spyOn(utils, 'getData');

  afterEach(() => {
    spy.mockClear();
  });

  it('should return the last request', async () => {
    utils.getData.mockResolvedValue(requests);

    const result = await changeRequest.__get__('getLatestRequest')('token', digitalID, requestType, setReplicateStatus, correlationID);

    expect(result).toBeTruthy();
    expect(result.statusUpdateDate).toEqual('2020-03-05T07:05:59');
    expect(result.digitalID).toBeNull();
    expect(spy).toHaveBeenCalledWith('token', config.get('studentRequest:apiEndpoint') + `/?digitalID=${digitalID}`, correlationID);
  });

  it('should return null if no requests', async () => {
    utils.getData.mockResolvedValue([]);

    const result = await changeRequest.__get__('getLatestRequest')('token', digitalID, requestType, setReplicateStatus, correlationID);

    expect(result).toBeNull();
    expect(spy).toHaveBeenCalledWith('token', config.get('studentRequest:apiEndpoint') + `/?digitalID=${digitalID}`, correlationID);
  });

  it('should return null if getData return NOT_FOUND', async () => {
    utils.getData.mockRejectedValue(new ApiError(HttpStatus.NOT_FOUND, { message: 'API Get error' }));

    const result = await changeRequest.__get__('getLatestRequest')('token', digitalID, requestType, setReplicateStatus);

    expect(result).toBeNull();
  });

  it('should throw ServiceError if getData is failed', async () => {
    utils.getData.mockRejectedValue(new Error('error'));

    expect(changeRequest.__get__('getLatestRequest')('token', digitalID, requestType, setReplicateStatus)).rejects.toThrowError(ServiceError);
  });

  it('should return tomorrow with false value if current time is after replicateTime', async () => {
    requests = [
      {
        digitalID,
        statusUpdateDate: '2020-03-03T07:05:40',
        studentRequestStatusCode: 'COMPLETED',
      },
    ];

    const localTime = LocalDateTime.parse('2020-03-03T10:05:40');
    jest.spyOn(LocalDateTime, 'now');
    LocalDateTime.now.mockReturnValue(localTime);

    utils.getData.mockResolvedValue(requests);

    const result = await changeRequest.__get__('getLatestRequest')('token', digitalID, requestType, setReplicateStatus);

    expect(result).toBeTruthy();
    expect(result.tomorrow).toBeFalsy();
  });

  it('should return tomorrow with true value if current time is before replicateTime', async () => {
    requests = [
      {
        digitalID,
        statusUpdateDate: '2020-03-03T09:05:40',
        studentRequestStatusCode: 'COMPLETED',
      },
    ];

    const localTime = LocalDateTime.parse('2020-03-03T10:05:40');
    jest.spyOn(LocalDateTime, 'now');
    LocalDateTime.now.mockReturnValue(localTime);

    utils.getData.mockResolvedValue(requests);

    const result = await changeRequest.__get__('getLatestRequest')('token', digitalID, requestType, setReplicateStatus);

    expect(result).toBeTruthy();
    expect(result.tomorrow).toBeTruthy();
  });

  it('should return tomorrow with true value if current time is the day after statusUpdateDate but before replicateTime', async () => {
    requests = [
      {
        digitalID,
        statusUpdateDate: '2020-03-03T09:05:40',
        studentRequestStatusCode: 'COMPLETED',
      },
    ];

    const localTime = LocalDateTime.parse('2020-03-04T07:05:40');
    jest.spyOn(LocalDateTime, 'now');
    LocalDateTime.now.mockReturnValue(localTime);

    utils.getData.mockResolvedValue(requests);

    const result = await changeRequest.__get__('getLatestRequest')('token', digitalID, requestType, setReplicateStatus);

    expect(result).toBeTruthy();
    expect(result.tomorrow).toBeTruthy();
  });

  it('should return tomorrow with false value if current time is the day after statusUpdateDate but after replicateTimee', async () => {
    requests = [
      {
        digitalID,
        statusUpdateDate: '2020-03-03T09:05:40',
        studentRequestStatusCode: 'COMPLETED',
      },
    ];

    const localTime = LocalDateTime.parse('2020-03-04T09:05:40');
    jest.spyOn(LocalDateTime, 'now');
    LocalDateTime.now.mockReturnValue(localTime);

    utils.getData.mockResolvedValue(requests);

    const result = await changeRequest.__get__('getLatestRequest')('token', digitalID, requestType, setReplicateStatus);

    expect(result).toBeTruthy();
    expect(result.tomorrow).toBeFalsy();
  });
});

describe('getDefaultBcscInput', () => {
  it('should return middleNames', async () => {
    const userInfo = {
      _json: {
        givenNames: 'FirstName MiddleName',
      }
    };

    const result = changeRequest.__get__('getDefaultBcscInput')(userInfo);

    expect(result).toBeTruthy();
    expect(result.legalMiddleNames).toEqual('MiddleName');
  });

  it('should return empty string if no middle name', async () => {
    const userInfo = {
      _json: {
        givenNames: 'FirstName',
      }
    };

    const result = changeRequest.__get__('getDefaultBcscInput')(userInfo);

    expect(result).toBeTruthy();
    expect(result.legalMiddleNames.length).toBe(0);
  });

  it('should return empty string if no given names', async () => {
    const userInfo = {
      _json: {
        givenNames: '',
      }
    };

    const result = changeRequest.__get__('getDefaultBcscInput')(userInfo);

    expect(result).toBeTruthy();
    expect(result.legalMiddleNames.length).toBe(0);
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
    changeRequest.__set__('codes', null);
  });

  it('should return codes', async () => {
    utils.getData.mockResolvedValue(codes);

    const result = await changeRequest.__get__('getServerSideCodes')('token');

    expect(result).toBeTruthy();
    expect(result.sexCodes).toEqual(codes);
    expect(result.identityTypes).toEqual(codes);
    expect(changeRequest.__get__('codes').sexCodes).toEqual(codes);
    expect(changeRequest.__get__('codes').identityTypes).toEqual(codes);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith('token', `${config.get('student:apiEndpoint')}/sex-codes`);
    expect(spy).toHaveBeenCalledWith('token', `${config.get('digitalID:apiEndpoint')}/identityTypeCodes`);
  });

  it('should not call getData if codes exist', async () => {
    changeRequest.__set__('codes', {
      sexCodes: codes,
      identityTypes: codes
    });

    const result = await changeRequest.__get__('getServerSideCodes')('token');

    expect(result).toBeTruthy();
    expect(result.sexCodes).toEqual(codes);
    expect(result.identityTypes).toEqual(codes);
    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('should throw ServiceError if getData is failed', async () => {
    utils.getData.mockRejectedValue(new Error('error'));

    expect(changeRequest.__get__('getServerSideCodes')('token')).rejects.toThrowError(ServiceError);
  });
});

describe('getUserInfo', () => {
  const digitalID = 'ac337def-704b-169f-8170-653e2f7c001';
  const request = {
    digitalID,
    statusUpdateDate: '2020-03-03T23:05:40'
  };

  const sessionUser = {
    jwt: 'token',
    _json: {
      digitalIdentityID: digitalID,
      displayName: 'Firstname Lastname',
      accountType: 'BCEID',
    }
  };

  const digitalIdData = {
    identityTypeCode: 'BASIC',
    studentID: null
  };

  const codes = {
    sexCodes: [
      {
        sexCode: 'M',
        label: 'Male',
      },
      {
        sexCode: 'F',
        label: 'Female',
      }
    ],
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
    rewireRequest.__Rewire__('getLatestRequest', () => Promise.resolve(request));
  });

  afterEach(() => {
    jest.clearAllMocks();
    rewireRequest.__ResetDependency__('getDigitalIdData');
    rewireRequest.__ResetDependency__('getServerSideCodes');
    rewireRequest.__ResetDependency__('getLatestRequest');
    rewireRequest.__ResetDependency__('getStudent');
    rewireRequest.__ResetDependency__('getDefaultBcscInput');
  });

  it('should return UNAUTHORIZED if no session', async () => {
    utils.getSessionUser.mockReturnValue(null);

    await changeRequest.getUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should return user info without student info if no student info', async () => {
    await changeRequest.getUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({
      displayName: sessionUser._json.displayName,
      accountType: sessionUser._json.accountType,
      identityTypeLabel: lodash.find(codes.identityTypes, ['identityTypeCode', digitalIdData.identityTypeCode]).label,
      studentRequest: request,
      penRequest: request,
      student: null,
    });
  });

  it('should return user info with student info if there is student info', async () => {
    const studentID = 'ac337def-704b-169f-8170-653e2f7c090';
    const digitalIdData = {
      identityTypeCode: 'BASIC',
      studentID
    };

    const student = null;

    rewireRequest.__Rewire__('getDigitalIdData', () => Promise.resolve(digitalIdData));
    rewireRequest.__Rewire__('getStudent', () => Promise.resolve(student));

    await changeRequest.getUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({
      displayName: sessionUser._json.displayName,
      accountType: sessionUser._json.accountType,
      identityTypeLabel: lodash.find(codes.identityTypes, ['identityTypeCode', digitalIdData.identityTypeCode]).label,
      studentRequest: request,
      penRequest: request,
      student,
    });
  });

  it('should return user info with BCSC info if accountType is BCSC', async () => {
    const bcscUser = {
      jwt: 'token',
      _json: {
        digitalIdentityID: digitalID,
        displayName: 'Firstname Lastname',
        accountType: 'BCSC',
      }
    };

    const bcscInfo = { legalLastName: 'LegalName' };

    utils.getSessionUser.mockReturnValue(bcscUser);
    rewireRequest.__Rewire__('getDefaultBcscInput', () => bcscInfo);

    await changeRequest.getUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({
      displayName: bcscUser._json.displayName,
      accountType: bcscUser._json.accountType,
      ...bcscInfo,
      identityTypeLabel: lodash.find(codes.identityTypes, ['identityTypeCode', digitalIdData.identityTypeCode]).label,
      studentRequest: request,
      penRequest: request,
      student: null,
    });
  });

  it('should return INTERNAL_SERVER_ERROR if invalid identityTypeCode', async () => {
    const digitalIdData = {
      identityTypeCode: 'INVALID',
      studentID: null
    };

    rewireRequest.__Rewire__('getDigitalIdData', () => Promise.resolve(digitalIdData));

    await changeRequest.getUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should return INTERNAL_SERVER_ERROR if exceptions thrown', async () => {
    rewireRequest.__Rewire__('getDigitalIdData', () => Promise.reject(new ServiceError('error')));

    await changeRequest.getUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

describe('getCodes', () => {
  const codes =[
    {
      effectiveDate: '2020-01-01T00:00:00',
      expiryDate: '2099-12-31T00:00:00',
      code: 'Code2',
      label: 'Label2',
      displayOrder: 1
    },
    {
      effectiveDate: '2020-01-01T00:00:00',
      expiryDate: '2099-12-31T00:00:00',
      code: 'Code1',
      label: 'Label1',
      displayOrder: 2
    },
    {
      effectiveDate: '2020-01-01T00:00:00',
      expiryDate: '2099-12-31T00:00:00',
      code: 'Code3',
      label: 'Label3',
      displayOrder: 3
    }
  ];
  const getCodes = changeRequest.getCodes('studentRequest');

  let req;
  let res;

  jest.spyOn(utils, 'getAccessToken');
  jest.spyOn(utils, 'getData');

  beforeEach(() => {
    utils.getAccessToken.mockReturnValue('token');
    utils.getData.mockResolvedValue(codes);
    req = mockRequest();
    res = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return codes', async () => {
    const response = await getCodes(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({
      genderCodes: codes,
      statusCodes: codes,
    });
    expect(response.data.json.genderCodes[0].displayOrder).toBe(1);
  });

  it('should return UNAUTHORIZED if no access token', async () => {
    utils.getAccessToken.mockReturnValue(null);

    await getCodes(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should return INTERNAL_SERVER_ERROR if exceptions thrown', async () => {
    utils.getData.mockRejectedValue(new Error('test error'));

    await getCodes(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});


describe('sendVerificationEmail', () => {
  const emailAddress = 'name@test.com';
  const requestId = 'requestId';
  const identityTypeLabel = 'identityTypeLabel';
  const response = {data: 'data'};
  const token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTQ09QRSI6IlZFUklGWV9FTUFJTCIsImlhdCI6MTU4OTQ4NDY0NCwiZXhwIjoxNTg5NTcxMDQ0LCJpc3MiOiJWZXJpZnlFbWFpbEFQSSIsInN1YiI6Im5hbWVAdGVzdC5jb20iLCJqdGkiOiJwZW5SZXF1ZXN0SWQifQ.SVa1Cm7wIMioC9S98-PxFC1BWXanfD941ySp23aNr_w';
  const generateTokenSpy = jest.spyOn(utils, 'generateJWTToken');
  const spy = jest.spyOn(utils, 'postData');
  const requestType = 'studentRequest';

  afterEach(() => {
    spy.mockClear();
  });

  it('should return response data', async () => {
    utils.postData.mockResolvedValue(response);
    utils.generateJWTToken.mockResolvedValue(token);
    const result = await changeRequest.__get__('sendVerificationEmail')('token', emailAddress, requestId, identityTypeLabel, requestType, correlationID);

    const reqData = {
      emailAddress,
      studentRequestId: requestId,
      identityTypeLabel,
      verificationUrl: config.get('server:frontend') + '/api/ump/verification?verificationToken',
      jwtToken:token
    };
    expect(result).toBeTruthy();
    expect(result).toEqual(response);
    expect(generateTokenSpy).toHaveBeenCalledWith(requestId,emailAddress,'VerifyEmailAPI','HS256',{
      SCOPE: 'VERIFY_EMAIL'
    });
    expect(spy).toHaveBeenCalledWith('token', reqData, config.get('email:apiEndpoint') + '/ump/verify', correlationID);
  });

  it('should throw ServiceError if postData is failed', async () => {
    utils.postData.mockRejectedValue(new Error('error'));

    expect(changeRequest.__get__('sendVerificationEmail')('token', emailAddress, requestId, identityTypeLabel, requestType)).rejects.toThrowError(ServiceError);
  });
});

describe('getAutoMatchResults', () => {
  const spy = jest.spyOn(utils, 'getDataWithParams');

  afterEach(() => {
    spy.mockClear();
  });

  it('should return ZEROMATCHES if no PEN records', async () => {
    const userInfo = {
      surname: 'Surname',
      givenName: 'Givenname',
      givenNames: 'Givenname Givenname2',
      birthDate: '2000-01-01',
      gender: 'Female'
    };
    const autoMatchResults = [];
    utils.getDataWithParams.mockResolvedValue(autoMatchResults);

    const result = await changeRequest.__get__('getAutoMatchResults')('token', userInfo, correlationID);

    expect(result).toEqual({
      bcscAutoMatchOutcome: 'ZEROMATCHES',
      bcscAutoMatchDetails: 'Zero PEN records found by BCSC auto-match'
    });
    //expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('token', config.get('demographics:apiEndpoint'), {
      params: {
        studSurName: 'Surname',
        studGiven: 'Givenname',
        studMiddle: 'Givenname2',
        studBirth: '20000101',
        studSex: 'F'
      }
    }, correlationID);
  });

  it('should return MANYMATCHES if multiple PEN records', async () => {
    const userInfo = {
      surname: 'Surname',
      givenName: 'Givenname',
      givenNames: '',
      birthDate: '',
      gender: ''
    };
    const autoMatchResults = [{
      studSurname: 'studSurname',
      studGiven: 'studGiven',
      middleName: 'studMiddle'
    }, {
      studSurname: 'studSurname',
      studGiven: 'studGiven',
      middleName: 'studMiddle'
    }];
    utils.getDataWithParams.mockResolvedValue(autoMatchResults);

    const result = await changeRequest.__get__('getAutoMatchResults')('token', userInfo, correlationID);

    expect(result).toEqual({
      bcscAutoMatchOutcome: 'MANYMATCHES',
      bcscAutoMatchDetails: '2 PEN records found by BCSC auto-match'
    });
    //expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('token', config.get('demographics:apiEndpoint'), {
      params: {
        studSurName: 'Surname',
        studGiven: 'Givenname',
        studMiddle: '',
        studBirth: '',
        studSex: ''
      }
    }, correlationID);
  });

  it('should return ONEMATCH if one PEN record', async () => {
    const userInfo = {
      surname: 'Surname',
      givenName: 'Givenname',
    };
    const autoMatchResults = [{
      studSurname: 'studSurname',
      studGiven: 'studGiven',
      studMiddle: 'studMiddle',
      pen: 'pen'
    }];
    utils.getDataWithParams.mockResolvedValue(autoMatchResults);

    const result = await changeRequest.__get__('getAutoMatchResults')('token', userInfo, correlationID);

    expect(result).toEqual({
      bcscAutoMatchOutcome: 'ONEMATCH',
      bcscAutoMatchDetails: 'pen studSurname, studGiven, studMiddle'
    });
    expect(spy).toHaveBeenCalledWith('token', config.get('demographics:apiEndpoint'), {
      params: {
        studSurName: 'Surname',
        studGiven: 'Givenname',
      }
    }, correlationID);
  });

  it('should throw ServiceError if getDataWithParams is failed', async () => {
    const userInfo = {};
    utils.getDataWithParams.mockRejectedValue(new Error('error'));

    expect(changeRequest.__get__('getAutoMatchResults')('token', userInfo)).rejects.toThrowError(ServiceError);
  });
});

describe('postRequest', () => {
  const reqData = { legalLastName: 'legalLastName' };
  const userInfo = {
    digitalIdentityID: 'digitalIdentityID',
    displayName: 'Firstname Lastname',
    accountType: 'BCEID',
  };
  const requestType = 'studentRequest';

  const spy = jest.spyOn(utils, 'postData');

  afterEach(() => {
    jest.clearAllMocks();
    rewireRequest.__ResetDependency__('getAutoMatchResults');
  });

  it('should return request data', async () => {
    utils.postData.mockResolvedValue({studentRequestID: 'requestID'});

    const result = await changeRequest.__get__('postRequest')('token', reqData, userInfo, requestType, correlationID);

    expect(result).toBeTruthy();
    expect(result.studentRequestID).toEqual('requestID');
    expect(result.digitalID).toBeNull();
    const requst = {
      ...reqData,
      emailVerified: utils.EmailVerificationStatuses.NOT_VERIFIED,
      digitalID: userInfo.digitalIdentityID
    };
    expect(spy).toHaveBeenCalledWith('token', requst, config.get('studentRequest:apiEndpoint') + '/', correlationID);
  });

  it('should return request data with autoMatchResults if accountType is BCSC', async () => {
    const userInfo = {
      digitalIdentityID: 'digitalIdentityID',
      displayName: 'Firstname Lastname',
      accountType: 'BCSC',
    };
    const autoMatchResults = {
      bcscAutoMatchOutcome: 'ONEMATCH',
      bcscAutoMatchDetails: 'pen studSurname, studGiven, studMiddle'
    };
    utils.postData.mockResolvedValue({studentRequestID: 'requestID'});
    rewireRequest.__Rewire__('getAutoMatchResults', () => Promise.resolve(autoMatchResults));

    const result = await changeRequest.__get__('postRequest')('token', reqData, userInfo, requestType, correlationID);

    expect(result).toBeTruthy();
    expect(result.studentRequestID).toEqual('requestID');
    expect(result.digitalID).toBeNull();
    const requst = {
      ...reqData,
      ...autoMatchResults,
      emailVerified: utils.EmailVerificationStatuses.NOT_VERIFIED,
      digitalID: userInfo.digitalIdentityID
    };
    expect(spy).toHaveBeenCalledWith('token', requst, config.get('studentRequest:apiEndpoint') + '/', correlationID);
  });

  it('should return request data with ZEROMATCHES if accountType is BCSC and no autoMatchResults', async () => {
    const userInfo = {
      digitalIdentityID: 'digitalIdentityID',
      displayName: 'Firstname Lastname',
      accountType: 'BCSC',
    };
    const autoMatchResults = {
      bcscAutoMatchOutcome: 'ZEROMATCHES',
      bcscAutoMatchDetails: 'Zero PEN records found by BCSC auto-match'
    };
    const autoMatchRes = [];

    jest.spyOn(utils, 'getDataWithParams');
    utils.getDataWithParams.mockResolvedValue(autoMatchRes);
    utils.postData.mockResolvedValue({studentRequestID: 'requestID'});

    const result = await changeRequest.__get__('postRequest')('token', reqData, userInfo, requestType, correlationID);

    expect(result).toBeTruthy();
    expect(result.studentRequestID).toEqual('requestID');
    expect(result.digitalID).toBeNull();
    const requst = {
      ...reqData,
      ...autoMatchResults,
      emailVerified: utils.EmailVerificationStatuses.NOT_VERIFIED,
      digitalID: userInfo.digitalIdentityID
    };
    expect(spy).toHaveBeenCalledWith('token', requst, config.get('studentRequest:apiEndpoint') + '/', correlationID);
  });

  it('should throw ServiceError if postData is failed', async () => {
    utils.postData.mockRejectedValue(new Error('error'));

    expect(changeRequest.__get__('postRequest')('token', reqData, userInfo, correlationID)).rejects.toThrowError(ServiceError);
  });
});

describe('submitRequest', () => {
  const digitalID = 'ac337def-704b-169f-8170-653e2f7c001';
  const request = {
    legalLastName: 'legalLastName'
  };

  const requestRes = {
    studentRequestID: 'requestID',
    digitalID: null,
  };

  const emailRes = {
  };

  const sessionUser = {
    jwt: 'token',
    _json: {
      digitalIdentityID: digitalID,
      displayName: 'Firstname Lastname',
      accountType: 'BCEID',
    }
  };

  const requestType = 'studentRequest';
  const submitRequest = changeRequest.submitRequest(requestType, verifyStudentRequestStatus);

  let session;

  let req;
  let res;

  jest.spyOn(utils, 'getSessionUser');
  jest.spyOn(utils, 'postData');

  beforeEach(() => {
    session = {
      digitalIdentityData: {
        identityTypeLabel: 'identityTypeLabel',
      }
    };
    utils.getSessionUser.mockReturnValue(sessionUser);
    req = mockRequest(request, session);
    res = mockResponse();
    rewireRequest.__Rewire__('postRequest', () => Promise.resolve(requestRes));
    rewireRequest.__Rewire__('sendVerificationEmail', () => Promise.resolve(emailRes));
  });

  afterEach(() => {
    jest.clearAllMocks();
    rewireRequest.__ResetDependency__('postRequest');
    rewireRequest.__ResetDependency__('sendVerificationEmail');
  });

  it('should return UNAUTHORIZED if no session', async () => {
    utils.getSessionUser.mockReturnValue(null);

    await submitRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should return request response and send verification email', async () => {

    await submitRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(requestRes);
    expect(req.session[requestType]).toEqual(requestRes);
  });

  it('should return CONFLICT if the status of existed request is not REJECTED', async () => {
    session = {
      ...session,
      [requestType]: {
        studentRequestStatusCode: utils.RequestStatuses.DRAFT,
      }
    };

    req = mockRequest(request, session);

    await submitRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('should return INTERNAL_SERVER_ERROR if exceptions thrown', async () => {
    rewireRequest.__Rewire__('postRequest', () => Promise.reject(new ServiceError('error')));

    await submitRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should return request response if sending verification email failed', async () => {
    rewireRequest.__Rewire__('sendVerificationEmail', () => Promise.reject(new ServiceError('error')));

    await submitRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(requestRes);
    expect(req.session[requestType]).toEqual(requestRes);
  });

  it('should return request response if the status of existed request is REJECTED', async () => {
    session = {
      ...session,
      [requestType]: {
        studentRequestStatusCode: utils.RequestStatuses.REJECTED,
      }
    };

    req = mockRequest(request, session);
    rewireRequest.__ResetDependency__('postRequest');
    rewireRequest.__ResetDependency__('sendVerificationEmail');
    utils.postData.mockReturnValueOnce({studentRequestID: 'requestID'}).mockReturnValueOnce({});

    await submitRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(requestRes);
    expect(req.session[requestType]).toEqual(requestRes);
  });
});

describe('updateRequestStatus', () => {
  const localDateTime = '2020-01-01T12:00:00';
  const requestID = 'requestID';
  let request = {
    studentRequestID: requestID,
    digitalID: 'digitalID'
  };
  const requestType = 'studentRequest';

  const getDataSpy = jest.spyOn(utils, 'getData');
  const putDataSpy = jest.spyOn(utils, 'putData');

  jest.spyOn(LocalDateTime, 'now');

  beforeEach(() => {
    LocalDateTime.now.mockReturnValue(localDateTime);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return request data', async () => {
    utils.getData.mockResolvedValue(request);
    utils.putData.mockResolvedValue(request);

    const result = await changeRequest.__get__('updateRequestStatus')('token', requestID, utils.RequestStatuses.INITREV, requestType, () => request, correlationID);

    expect(result).toBeTruthy();
    expect(result.studentRequestID).toEqual(requestID);
    expect(result.digitalID).toBeNull();
    expect(result.studentRequestStatusCode).toEqual(utils.RequestStatuses.INITREV);
    expect(result.statusUpdateDate).toEqual(localDateTime);

    expect(getDataSpy).toHaveBeenCalledWith('token', `${config.get('studentRequest:apiEndpoint')}/${requestID}`, correlationID);
    expect(putDataSpy).toHaveBeenCalledWith('token', request ,config.get('studentRequest:apiEndpoint'), correlationID);
  });

  it('should throw ConflictStateError if ConflictStateError is already raised', async () => {
    utils.getData.mockResolvedValue(request);

    expect(changeRequest.__get__('updateRequestStatus')('token', requestID, utils.RequestStatuses.INITREV, requestType, () => { throw new ConflictStateError(); })).rejects.toThrowError(ConflictStateError);
  });

  it('should throw ServiceError if other errors are already raised', async () => {
    utils.getData.mockResolvedValue(request);
    utils.putData.mockRejectedValue(new Error('error'));

    expect(changeRequest.__get__('updateRequestStatus')('token', requestID, utils.RequestStatuses.INITREV, requestType, () => request)).rejects.toThrowError(ServiceError);
  });
});

describe('beforeUpdateRequestAsSubsrev', () => {
  const requestType = 'studentRequest';

  it('should throw ConflictStateError if request is not RETURNED', async () => {
    let request = {
      studentRequestStatusCode: utils.RequestStatuses.INITREV,
    };

    expect(() => changeRequest.__get__('beforeUpdateRequestAsSubsrev')(request, requestType)).toThrowError(ConflictStateError);
  });

  it('should return request if request is RETURNED', async () => {
    let request = {
      studentRequestStatusCode: utils.RequestStatuses.RETURNED,
    };

    const result = await changeRequest.__get__('beforeUpdateRequestAsSubsrev')(request, requestType);

    expect(result).toEqual(request);
  });
});

describe('setRequestAsSubsrev', () => {
  const requestID = 'requestID';
  const request = {
    studentRequestID: requestID
  };
  const accessToken = 'token';
  const reqBody = {
    studentRequestStatusCode: utils.RequestStatuses.SUBSREV
  };
  jest.spyOn(utils, 'getAccessToken');
  const updateRequestStatusSpy = jest.fn();
  const requestType = 'studentRequest';
  const setRequestAsSubsrev = changeRequest.setRequestAsSubsrev(requestType);

  let req;
  let res;

  beforeEach(() => {
    utils.getAccessToken.mockReturnValue(accessToken);
    req = mockRequest(reqBody, undefined, {id: requestID});
    res = mockResponse();
    updateRequestStatusSpy.mockResolvedValue(request);
    rewireRequest.__Rewire__('updateRequestStatus', updateRequestStatusSpy);
  });

  afterEach(() => {
    jest.clearAllMocks();
    rewireRequest.__ResetDependency__('updateRequestStatus');
  });

  it('should return OK and request data', async () => {
    await setRequestAsSubsrev(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(request);
    expect(req.session[requestType]).toEqual(request);
    expect(updateRequestStatusSpy).toHaveBeenCalledWith(accessToken, requestID, reqBody.studentRequestStatusCode, requestType, rewireRequest.__get__('beforeUpdateRequestAsSubsrev'));
  });

  it('should return UNAUTHORIZED if no access token in session', async () => {
    utils.getAccessToken.mockReturnValue(null);
    await setRequestAsSubsrev(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should return BAD_REQUEST if requestStatus is not RETURNED in request body', async () => {
    const reqBody = {
      studentRequestStatusCode: utils.RequestStatuses.INITREV
    };
    req = mockRequest(reqBody, undefined, {id: requestID});
    await setRequestAsSubsrev(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should return BAD_REQUEST if no requestStatus in request body', async () => {
    req = mockRequest({}, undefined, {id: requestID});
    await setRequestAsSubsrev(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should return INTERNAL_SERVER_ERROR if errors thrown', async () => {
    updateRequestStatusSpy.mockRejectedValue(new Error('test error'));
    rewireRequest.__Rewire__('updateRequestStatus', updateRequestStatusSpy);
    await setRequestAsSubsrev(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

});

describe('resendVerificationEmail', () => {
  const requestID = 'requestID';
  const request = {
    studentRequestID: requestID,
    studentRequestStatusCode: utils.RequestStatuses.DRAFT,
    email: 'user@test.com'
  };
  const digitalIdentityData = {
    identityTypeLabel: 'identityTypeLabel'
  };
  const accessToken = 'token';
  const requestType = 'studentRequest';
  const session = {
    [requestType]: request,
    digitalIdentityData
  };
  const resData = {
    data: 'data'
  };
  jest.spyOn(utils, 'getAccessToken');
  const sendVerificationEmailSpy = jest.fn();
  const resendVerificationEmail = changeRequest.resendVerificationEmail(requestType);

  let req;
  let res;

  beforeEach(() => {
    utils.getAccessToken.mockReturnValue(accessToken);
    req = mockRequest(null, session);
    res = mockResponse();
    sendVerificationEmailSpy.mockResolvedValue(resData);
    rewireRequest.__Rewire__('sendVerificationEmail', sendVerificationEmailSpy);
  });

  afterEach(() => {
    jest.clearAllMocks();
    rewireRequest.__ResetDependency__('sendVerificationEmailSpy');
  });

  it('should return OK and response data', async () => {
    await resendVerificationEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(resData);
    expect(sendVerificationEmailSpy).toHaveBeenCalledWith(accessToken, request.email, request.studentRequestID, digitalIdentityData.identityTypeLabel, requestType);
  });

  it('should return UNAUTHORIZED if no access token in session', async () => {
    utils.getAccessToken.mockReturnValue(null);
    await resendVerificationEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should return CONFLICT if requestStatus is not DRAFT in session', async () => {
    const request = {
      studentRequestID: requestID,
      studentRequestStatusCode: utils.RequestStatuses.INITREV,
      email: 'user@test.com'
    };
    const session = {
      [requestType]: request,
      digitalIdentityData
    };
    req = mockRequest(null, session);
    await resendVerificationEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('should return INTERNAL_SERVER_ERROR if errors thrown', async () => {
    sendVerificationEmailSpy.mockRejectedValue(new Error('test error'));
    rewireRequest.__Rewire__('sendVerificationEmail', sendVerificationEmailSpy);
    await resendVerificationEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

});

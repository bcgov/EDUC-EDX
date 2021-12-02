const HttpStatus = require('http-status-codes');
const config = require('../../../src/config/index');

jest.mock('@js-joda/core');
const LocalDateTime = require('@js-joda/core').LocalDateTime;
jest.mock('../../../src/components/utils');
const utils = require('../../../src/components/utils');
const redisUtil = require('../../../src/util/redis/redis-utils');
jest.mock('../../../src/components/auth');
const correlationID = '67590460-efe3-4e84-9f9a-9acffda79657';
const changeRequest = require('../../../src/components/request');
const { mockRequest, mockResponse } = require('../helpers');
const { createStudentRequestCommentPayload, createStudentRequestCommentEvent } = require('../../../src/components/studentRequest');

describe('verifyPostComment', () => {

  const params = {
    id: 'requestId',
  };
  const requestType = 'studentRequest';
  const session = {
    [requestType]: {
      studentRequestStatusCode: utils.RequestStatuses.RETURNED,
    }
  };
  const sessionUser = {
    jwt: 'token',
    _json: {
      displayName: 'Firstname Lastname',
      accountType: 'BCEID',
      digitalIdentityID: 'ac337def-794b-169f-8170-653e2f7c0011'
    }
  };

  const verifyPostCommentRequest = changeRequest.verifyPostCommentRequest(requestType);

  let req;
  let res;

  jest.spyOn(utils, 'getAccessToken');

  beforeEach(() => {
    utils.getAccessToken.mockReturnValue('token');
    utils.getSessionUser.mockReturnValue(sessionUser);
    req = mockRequest(session, params);
    res = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should return UNAUTHORIZED if no session', async () => {
    utils.getAccessToken.mockReturnValue(null);

    await verifyPostCommentRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should return CONFLICT if no request in the session', async () => {
    const session = {
      request: null,
    };
    req = mockRequest(session, params);

    await verifyPostCommentRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('should return CONFLICT if request is not RETURNED', async () => {
    const session = {
      studentRequestStatusCode: utils.RequestStatuses.INITREV,
    };
    req = mockRequest(session, params);

    await verifyPostCommentRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });
});

describe('postComment', () => {
  const localDateTime = '2020-01-01T12:00:00';
  const comment = {
    content: 'test comment'
  };
  const postRes = {
    commentContent: 'test comment',
    commentTimestamp: localDateTime,
  };
  const params = {
    id: 'requestId',
  };
  const requestType = 'studentRequest';
  const session = {
    [requestType]: {
      studentRequestStatusCode: utils.RequestStatuses.RETURNED,
    }
  };
  const sessionUser = {
    jwt: 'token',
    _json: {
      displayName: 'Firstname Lastname',
      accountType: 'BCEID',
      digitalIdentityID: 'ac337def-794b-169f-8170-653e2f7c0011'
    }
  };

  const postComment = changeRequest.postComment(requestType, createStudentRequestCommentPayload, createStudentRequestCommentEvent, correlationID);

  let req;
  let res;

  jest.spyOn(LocalDateTime, 'now');
  jest.spyOn(utils, 'getAccessToken');
  jest.spyOn(redisUtil, 'createProfileRequestSagaRecordInRedis');
  const spy = jest.spyOn(utils, 'postData');

  beforeEach(() => {
    LocalDateTime.now.mockReturnValue(localDateTime);
    utils.postData.mockResolvedValue(postRes);
    redisUtil.createProfileRequestSagaRecordInRedis.mockResolvedValue(null);
    req = mockRequest(comment, session, params);
    req.userInfo = sessionUser;
    req.accessToken = 'token';
    res = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return saga id', async () => {

    await postComment(req, res);

    const postReq =  {
      studentProfileRequestID: 'requestId',
      studentProfileRequestStatusCode: 'SUBSREV',
      commentContent: comment.content,
      commentTimestamp: localDateTime
    };

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    //expect(res.json).toHaveBeenCalledWith(commentRes);
    expect(spy).toHaveBeenCalledWith('token', postReq, config.get('profileSagaAPIURL') + config.get(`${requestType}:commentSagaEndpoint`),correlationID);
  });

  it('should return INTERNAL_SERVER_ERROR if postData is failed', async () => {
    utils.postData.mockRejectedValue(new Error('test error'));

    await postComment(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should return INTERNAL_SERVER_ERROR if createProfileRequestSagaRecordInRedis is failed', async () => {
    redisUtil.createProfileRequestSagaRecordInRedis.mockRejectedValue(new Error('test error'));

    await postComment(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

describe('getComments', () => {
  const getRes = [];

  const params = {
    id: 'requestId',
  };
  const sessionUser = {
    jwt: 'token',
    _json: {
      displayName: 'Firstname Lastname',
      accountType: 'BCEID',
      digitalIdentityID: 'ac337def-794b-169f-8170-653e2f7c0011'
    }
  };
  const getComments = changeRequest.getComments('studentRequest');

  let req;
  let res;

  jest.spyOn(utils, 'getSessionUser');
  const spy = jest.spyOn(utils, 'getData');

  beforeEach(() => {
    utils.getSessionUser.mockReturnValue(sessionUser);
    utils.getData.mockResolvedValue(getRes);
    req = mockRequest(null, null, params);
    req.session={
      correlationID
    };
    res = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return sorted comment data if multiple comments', async () => {
    const getRes = [
      {
        commentTimestamp: '2020-02-04T12:00:00',
        staffMemberName: 'Staff A',
        staffMemberIDIRGUID: 'Staff A GUID',
        commentContent: 'Staff comment 1',
      },
      {
        commentTimestamp: '2020-02-01T09:56:32',
        staffMemberName: 'Staff B',
        staffMemberIDIRGUID: 'Staff B GUID',
        commentContent: 'Staff comment 2',
      },
      {
        commentTimestamp: '2020-02-03T18:00:00',
        staffMemberName: null,
        staffMemberIDIRGUID: null,
        commentContent: 'Student comment 1',
      },
      {
        commentTimestamp: '2020-02-10T01:00:59',
        staffMemberName: null,
        staffMemberIDIRGUID: null,
        commentContent: 'Student comment 2',
      }
    ];
    utils.getData.mockResolvedValue(getRes);

    await getComments(req, res);

    const commentsRes = {
      participants: [
        {
          name: 'Staff B',
          id: 'Staff B GUID'
        },
        {
          name: 'Staff A',
          id: 'Staff A GUID'
        },
      ],
      myself: {
        name: sessionUser._json.displayName,
        id: '1'
      },
      messages: [
        {
          content: 'Staff comment 2',
          participantId: 'Staff B GUID',
          myself: false,
          timestamp: '2020-02-01T09:56:32'
        },
        {
          content: 'Student comment 1',
          participantId: '1',
          myself: true,
          timestamp: '2020-02-03T18:00:00'
        },
        {
          content: 'Staff comment 1',
          participantId: 'Staff A GUID',
          myself: false,
          timestamp: '2020-02-04T12:00:00'
        },
        {
          content: 'Student comment 2',
          participantId: '1',
          myself: true,
          timestamp: '2020-02-10T01:00:59'
        },
      ]
    };

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(commentsRes);
    expect(spy).toHaveBeenCalledWith('token', `${config.get('studentRequest:apiEndpoint')}/${params.id}/comments`, correlationID);
  });

  it('should return empty array of messages when no comment', async () => {

    await getComments(req, res);

    const commentsRes = {
      participants: [],
      myself: {
        name: sessionUser._json.displayName,
        id: '1'
      },
      messages: []
    };

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(commentsRes);
    expect(spy).toHaveBeenCalledWith('token', `${config.get('studentRequest:apiEndpoint')}/${params.id}/comments`,correlationID);
  });

  it('should return UNAUTHORIZED if no session', async () => {
    utils.getSessionUser.mockReturnValue(null);

    await getComments(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should return INTERNAL_SERVER_ERROR if getData is failed', async () => {
    utils.getData.mockRejectedValue(new Error('test error'));

    await getComments(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

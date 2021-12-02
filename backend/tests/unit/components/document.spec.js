const HttpStatus = require('http-status-codes');
const config = require('../../../src/config/index');

// jest.mock('@js-joda/core');
// const LocalDateTime = require('@js-joda/core').LocalDateTime;
jest.mock('../../../src/components/utils');
const utils = require('../../../src/components/utils');
jest.mock('../../../src/components/auth');

const changeRequest = require('../../../src/components/request');
const { ServiceError } = require('../../../src/components/error');
const { mockRequest, mockResponse } = require('../helpers');
const correlationID = '67590460-efe3-4e84-9f9a-9acffda79657';
describe('uploadFile', () => {
  const document = {
    documentData: 'test data'
  };
  const postRes = {
    documentID: 'documentId',
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
  const uploadFile = changeRequest.uploadFile(requestType);

  let req;
  let res;

  jest.spyOn(utils, 'getAccessToken');
  const spy = jest.spyOn(utils, 'postData');

  beforeEach(() => {
    utils.getAccessToken.mockReturnValue('token');
    utils.postData.mockResolvedValue(postRes);
    req = mockRequest(document, session, params);
    req.session.correlationID=correlationID;
    res = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return response data', async () => {
    await uploadFile(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(postRes);
    expect(spy).toHaveBeenCalledWith('token', document, `${config.get('studentRequest:apiEndpoint')}/${params.id}/documents`, correlationID);
  });

  it('should return UNAUTHORIZED if no session', async () => {
    utils.getAccessToken.mockReturnValue(null);

    await uploadFile(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should return CONFLICT if no request in the session', async () => {
    const session = {
      request: null,
    };
    req = mockRequest(document, session, params);

    await uploadFile(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('should return CONFLICT if request is not RETURNED', async () => {
    const session = {
      studentRequestStatusCode: utils.RequestStatuses.INITREV,
    };
    req = mockRequest(document, session, params);

    await uploadFile(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('should return INTERNAL_SERVER_ERROR if postData is failed', async () => {
    utils.postData.mockRejectedValue(new Error('test error'));

    await uploadFile(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

describe('getDocument', () => {
  const documentData = { documentData: 'test data' };

  const spy = jest.spyOn(utils, 'getData');
  const requestID = 'requestID';
  const documentID = 'documentID';
  const includeDocData = 'Y';
  const token = 'token';
  const requestType = 'studentRequest';

  afterEach(() => {
    spy.mockClear();
  });

  it('should return document data', async () => {
    utils.getData.mockResolvedValue(documentData);

    const result = await changeRequest.__get__('getDocument')(token, requestID, documentID, requestType, includeDocData);

    expect(result).toEqual(documentData);
    expect(spy).toHaveBeenCalledWith('token', `${config.get('studentRequest:apiEndpoint')}/${requestID}/documents/${documentID}?includeDocData=${includeDocData}`);
  });

  it('should throw ServiceError if getData is failed', async () => {
    utils.getData.mockRejectedValue(new Error('error'));

    expect(changeRequest.__get__('getDocument')(token, requestID, documentID, requestType, includeDocData)).rejects.toThrowError(ServiceError);
  });
});

describe('deleteDocument', () => {
  const document = {
    documentData: 'test data',
    createDate: '2020-03-02T12:13:14'
  };
  const params = {
    id: 'requestId',
    documentId: 'documentId'
  };
  const requestType = 'studentRequest';
  const session = {
    [requestType]: {
      studentRequestStatusCode: utils.RequestStatuses.RETURNED,
      statusUpdateDate: '2020-03-01T12:13:16'
    }
  };
  const deleteDocument = changeRequest.deleteDocument(requestType);

  let req;
  let res;

  jest.spyOn(utils, 'getAccessToken');
  const getDataSpy = jest.spyOn(utils, 'getData');
  const deleteDataSpy = jest.spyOn(utils, 'deleteData');

  beforeEach(() => {
    utils.getAccessToken.mockReturnValue('token');
    utils.getData.mockResolvedValue(document);
    req = mockRequest(null, session, params);
    res = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return OK', async () => {
    await deleteDocument(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalled();
    expect(getDataSpy).toHaveBeenCalledWith('token', `${config.get('studentRequest:apiEndpoint')}/${params.id}/documents/${params.documentId}?includeDocData=N`);
    expect(deleteDataSpy).toHaveBeenCalledWith('token', `${config.get('studentRequest:apiEndpoint')}/${params.id}/documents/${params.documentId}`);
  });

  it('should return UNAUTHORIZED if no session', async () => {
    utils.getAccessToken.mockReturnValue(null);

    await deleteDocument(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should return CONFLICT if no request in the session', async () => {
    const session = {
      request: null,
    };
    req = mockRequest(null, session, params);

    await deleteDocument(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('should return CONFLICT if request is not RETURNED', async () => {
    const session = {
      studentRequestStatusCode: utils.RequestStatuses.INITREV,
      statusUpdateDate: '2020-03-01T12:13:16'
    };
    req = mockRequest(null, session, params);

    await deleteDocument(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('should return CONFLICT if document was uploaded before request was returned ', async () => {
    const session = {
      studentRequestStatusCode: utils.RequestStatuses.RETURNED,
      statusUpdateDate: '2020-03-03T12:13:16'
    };
    req = mockRequest(null, session, params);

    await deleteDocument(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('should return INTERNAL_SERVER_ERROR if deleteData is failed', async () => {
    utils.deleteData.mockRejectedValue(new Error('test error'));

    await deleteDocument(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

describe('downloadFile', () => {
  const document = {
    documentData: 'dGVzdCBkYXRh',
    fileName: 'test.jpg',
    fileExtension: 'image/jpeg'
  };
  const params = {
    id: 'requestId',
    documentId: 'documentId'
  };
  const downloadFile = changeRequest.downloadFile('studentRequest');

  let req;
  let res;

  jest.spyOn(utils, 'getAccessToken');
  const getDataSpy = jest.spyOn(utils, 'getData');

  beforeEach(() => {
    utils.getAccessToken.mockReturnValue('token');
    utils.getData.mockResolvedValue(document);
    req = mockRequest(null, null, params);
    res = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return OK and document data', async () => {
    await downloadFile(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.data.raw.toString()).toEqual('test data');
    expect(res.setHeader).toHaveBeenNthCalledWith(1, 'Content-disposition', 'attachment; filename=' + document.fileName);
    expect(res.setHeader).toHaveBeenNthCalledWith(2, 'Content-type', document.fileExtension);
    expect(getDataSpy).toHaveBeenCalledWith('token', `${config.get('studentRequest:apiEndpoint')}/${params.id}/documents/${params.documentId}?includeDocData=Y`);
  });

  it('should return UNAUTHORIZED if no session', async () => {
    utils.getAccessToken.mockReturnValue(null);

    await downloadFile(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should return INTERNAL_SERVER_ERROR if deleteData is failed', async () => {
    utils.getData.mockRejectedValue(new Error('test error'));

    await downloadFile(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

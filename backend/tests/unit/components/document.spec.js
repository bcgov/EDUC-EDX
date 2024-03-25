const HttpStatus = require('http-status-codes');
const config = require('../../../src/config/index');

// jest.mock('@js-joda/core');
// const LocalDateTime = require('@js-joda/core').LocalDateTime;
jest.mock('../../../src/components/utils');
const utils = require('../../../src/components/utils');
jest.mock('../../../src/components/auth');
const exchange = require('../../../src/components/secureExchange');
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
  const session = {
    secureExchange: {
      secureExchangeStatusCode: utils.SecureExchangeStatuses.INPROG,
    },
    edxUserData: {
      edxUserID: '67590460-efe3-4e84-9f9a-9acffda79612'
    }
  };
  const uploadFile = exchange.uploadFile;

  let req;
  let res;

  jest.spyOn(utils, 'getAccessToken');
  const spy = jest.spyOn(utils, 'postData');

  beforeEach(() => {
    utils.getAccessToken.mockReturnValue('token');
    utils.postData.mockResolvedValue(postRes);
    utils.getData.mockResolvedValue(session.secureExchange);
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
    expect(spy).toHaveBeenCalledWith('token', document, `${config.get('edx:exchangeURL')}/${params.id}/documents`, correlationID);
  });

  it('should return UNAUTHORIZED if no session', async () => {
    utils.getAccessToken.mockReturnValue(null);
    utils.handleExceptionResponse.mockReturnValue(res.status(HttpStatus.UNAUTHORIZED).json({
      status: HttpStatus.UNAUTHORIZED,
      message: 'Token is not valid'
    }));

    await uploadFile(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });
});

describe('getDocument', () => {
  const documentData = { documentData: 'test data' };

  const spy = jest.spyOn(utils, 'getData');
  const requestID = 'requestID';
  const documentID = 'documentID';
  const token = 'token';
  const correlationID = 'ABCD';

  afterEach(() => {
    spy.mockClear();
  });

  it('should return document data', async () => {
    utils.getData.mockResolvedValue(documentData);

    const result = await exchange.__get__('getDocument')(token, requestID, documentID, correlationID);

    expect(result).toEqual(documentData);
    expect(spy).toHaveBeenCalledWith('token', `${config.get('edx:exchangeURL')}/${requestID}/documents/${documentID}`, correlationID);
  });

  it('should throw ServiceError if getData is failed', async () => {
    utils.getData.mockRejectedValue(new Error('error'));

    expect(exchange.__get__('getDocument')(token, requestID, documentID)).rejects.toThrowError(ServiceError);
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
  const session = {
    secureExchange: {
      secureExchangeStatusCode: utils.SecureExchangeStatuses.INPROG,
      statusUpdateDate: '2020-03-01T12:13:16'
    },
    edxUserData: {
      edxUserID: '67590460-efe3-4e84-9f9a-9acffda79612'
    },
    correlationID: 'ABCD'
  };
  const deleteDocument = exchange.deleteDocument;

  let req;
  let res;

  jest.spyOn(utils, 'getAccessToken');
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
    expect(deleteDataSpy).toHaveBeenCalledWith('token', `${config.get('edx:exchangeURL')}/${params.id}/documents/${params.documentId}`, session.correlationID);
  });

  it('should return UNAUTHORIZED if no session', async () => {
    utils.getAccessToken.mockReturnValue(null);
    utils.handleExceptionResponse.mockReturnValue(res.status(HttpStatus.UNAUTHORIZED).json({
      status: HttpStatus.UNAUTHORIZED,
      message: 'Error'
    }));

    await deleteDocument(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });
});

describe('downloadFile', () => {
  const session = {
    correlationID: 'ABCD'
  };
  const document = {
    documentData: 'dGVzdCBkYXRh',
    fileName: 'test.jpg',
    fileExtension: 'image/jpeg'
  };
  const params = {
    id: 'requestId',
    documentId: 'documentId'
  };
  const downloadFile = exchange.downloadFile;

  let req;
  let res;

  jest.spyOn(utils, 'getAccessToken');
  jest.spyOn(utils, 'isImage');
  jest.spyOn(utils, 'isPdf');
  const getDataSpy = jest.spyOn(utils, 'getData');

  beforeEach(() => {
    utils.getAccessToken.mockReturnValue('token');
    utils.getData.mockResolvedValue(document);
    utils.isImage.mockReturnValue(true);
    utils.isPdf.mockReturnValue(false);
    req = mockRequest(null, session, params);
    res = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return OK and document data', async () => {
    await downloadFile(req, res, correlationID);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.data.raw.toString()).toEqual('test data');
    expect(res.setHeader).toHaveBeenNthCalledWith(1, 'Content-disposition', 'inline; filename=' + document.fileName);
    expect(res.setHeader).toHaveBeenNthCalledWith(2, 'Content-type', document.fileExtension);
    expect(getDataSpy).toHaveBeenCalledWith('token', `${config.get('edx:exchangeURL')}/${params.id}/documents/${params.documentId}`, session.correlationID);
  });

  it('should return UNAUTHORIZED if no session', async () => {
    utils.getAccessToken.mockReturnValue(null);
    utils.handleExceptionResponse.mockReturnValue(res.status(HttpStatus.UNAUTHORIZED).json({
      status: HttpStatus.UNAUTHORIZED,
      message: 'Error'
    }));

    await downloadFile(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });
});

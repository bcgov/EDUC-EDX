const HttpStatus = require('http-status-codes');
const config = require('../../../src/config/index');

// jest.mock('@js-joda/core');
// const LocalDateTime = require('@js-joda/core').LocalDateTime;
jest.mock('../../../src/components/utils');
const utils = require('../../../src/components/utils');
jest.mock('../../../src/components/auth');
const sampleDataJsonResponse = '{"createUser":"EDX","updateUser":"EDX","createDate":"2022-07-27T11:18:37","updateDate":"2022-08-08T15:04:36","secureExchangeID":"0a6188e0-823c-1a08-8182-40e1d40a0015","contactIdentifier":"03636084","ministryOwnershipTeamID":"9b4b71db-5093-4c3e-81ce-554972af3d48","secureExchangeContactTypeCode":"SCHOOL","secureExchangeStatusCode":"CLOSED","reviewer":null,"subject":"Test Message","isReadByMinistry":true,"isReadByExchangeContact":true,"statusUpdateDate":"2022-07-27T11:18:37","sequenceNumber":"473","commentsList":[{"createUser":"EDX-API","updateUser":"EDX-API","createDate":"2022-07-27T11:18:37.961712","updateDate":"2022-07-27T11:18:37.961710","secureExchangeCommentID":null,"secureExchangeID":"0a6188e0-823c-1a08-8182-40e1d40a0015","edxUserID":"2a4f269c-3ff2-4c98-b626-85a4ae858367","staffUserIdentifier":null,"commentUserName":"John Wayne","content":"Test Message","commentTimestamp":"2022-07-27T11:18:37.961707"}],"studentsList":[{"createUser":"EDX-API","updateUser":null,"createDate":"2022-07-27T11:18:37.961761","updateDate":null,"secureExchangeId":"0a6188e0-823c-1a08-8182-40e1d40a0015","secureExchangeStudentId":"0a6188e0-823c-1a08-8182-40e1d40a0017","staffUserIdentifier":null,"edxUserID":null,"studentId":"ac339d70-7649-1a2e-8176-4a16dee27e12"}],"documentList":[{"documentID":"0a613736-8265-13ec-8182-66536898003e","documentTypeCode":"OTHER","fileName":"PXL_20220729_042544023_exporte.jpg","fileExtension":"image/jpeg","fileSize":853606,"edxUserID":null,"staffUserIdentifier":"JWAYNE","createDate":"2022-08-03T17:48:38"}]}';
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

  it('should return CONFLICT if no request in the session', async () => {
    const session = {
      secureExchange: null,
    };
    req = mockRequest(document, session, params);

    await uploadFile(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('should return CONFLICT if secureExchange is CLOSED', async () => {
    const session = {
      secureExchange: {
        secureExchangeStatusCode: utils.SecureExchangeStatuses.CLOSED,
      }
    };
    req = mockRequest(document, session, params);

    await uploadFile(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('should return INTERNAL_SERVER_ERROR if postData is failed', async () => {
    utils.postData.mockRejectedValue(new Error('test error'));
    utils.handleExceptionResponse.mockReturnValue(res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error'
    }));

    await uploadFile(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
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
    correlationID: 'ABCD'
  };
  const deleteDocument = exchange.deleteDocument;

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
    expect(getDataSpy).toHaveBeenCalledWith('token', `${config.get('edx:exchangeURL')}/${params.id}/documents/${params.documentId}`, session.correlationID);
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

  it('should return CONFLICT if secureExchange is CLOSED', async () => {
    const session = {
      secureExchange: {
        secureExchangeStatusCode: utils.SecureExchangeStatuses.CLOSED,
        statusUpdateDate: '2020-03-01T12:13:16'
      },
      activeInstituteType: 'SCHOOL',
      activeInstituteIdentifier: '03636084'
    };
    utils.getData.mockResolvedValue(JSON.parse(sampleDataJsonResponse));
    req = mockRequest(null, session, params);

    await deleteDocument(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });


  it('should return INTERNAL_SERVER_ERROR if deleteData is failed', async () => {
    utils.deleteData.mockRejectedValue(new Error('test error'));
    utils.handleExceptionResponse.mockReturnValue(res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error'
    }));

    await deleteDocument(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
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
  const getDataSpy = jest.spyOn(utils, 'getData');

  beforeEach(() => {
    utils.getAccessToken.mockReturnValue('token');
    utils.getData.mockResolvedValue(document);
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

  it('should return INTERNAL_SERVER_ERROR if deleteData is failed', async () => {
    utils.getData.mockRejectedValue(new Error('test error'));
    utils.handleExceptionResponse.mockReturnValue(res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error'
    }));

    await downloadFile(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

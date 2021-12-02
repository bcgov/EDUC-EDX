'use strict';

const mockRequest = (body, session = {}, params = {}, query = {}) => {
  return {
    body,
    session,
    params,
    query,
  };
};

const mockResponse = () => {
  const res = {data: {}};
  res.status = jest.fn().mockImplementation((v) => {
    res.data.status = v;
    return res;
  });
  res.json = jest.fn().mockImplementation((v) => {
    res.data.json = v;
    return res; 
  });
  res.redirect = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockImplementation((v) => {
    res.data.raw = v;
    return res; 
  });
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

module.exports = {
  mockRequest,
  mockResponse,
};

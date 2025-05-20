'use strict';
const { getAccessToken, handleExceptionResponse, getData} = require('./utils');
const HttpStatus = require('http-status-codes');
const log = require('./logger');
const config = require('../config');

async function getActiveChallengeReportsPeriod(req, res) {
  try {
    const token = getAccessToken(req);
    const url = `${config.get('challengeReports:rootURL')}/activeSession`;
    const data = await getData(token, url);

    const statusURL = `${config.get('challengeReports:rootURL')}/challenge-report-status-codes`;
    const statusData = await getData(token, statusURL);

    const response = {
      challengeReportsSessionID: data.challengeReportsSessionID,
      challengeReportsSessionStatus: statusData.find(status => status.challengeReportStatusCode === data.challengeReportsStatusCode)?.label || 'Unknown Status'
    };

    return res.status(HttpStatus.OK).json(response);
  } catch (e) {
    log.error(e, 'getActiveChallengeReportPeriod', 'Error occurred while attempting to GET active Challenge Reports Period.');
    return handleExceptionResponse(e, res);
  }
}

async function downloadDistrictChallengeReport(req, res) {
  try {
    const token = getAccessToken(req);
    const url = `${config.get('challengeReports:rootURL')}/district/${req.params.districtID}/download`;
    const data = await getData(token, url);

    const fileDetails = { filename: 'ChallengeReport.csv', contentType: 'text/csv' };
    setResponseHeaders(res, fileDetails);
    const buffer = Buffer.from(data.documentData, 'base64');

    return res.status(HttpStatus.OK).json(buffer);
  } catch (e) {
    log.error(e, 'getActiveChallengeReportPeriod', 'Error occurred while attempting to GET active Challenge Reports Period.');
    return handleExceptionResponse(e, res);
  }
}

function setResponseHeaders(res, { filename, contentType }) {
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.setHeader('Content-Type', contentType);
}

module.exports = {
  getActiveChallengeReportsPeriod,
  downloadDistrictChallengeReport
};

'use strict';
const { getAccessToken, handleExceptionResponse, getData} = require('./utils');
const HttpStatus = require('http-status-codes');
const log = require('./logger');
const config = require('../config');
const {getSchoolBySchoolID, getDistrictByDistrictID} = require('./cache-service');

async function getActiveChallengeReportsPeriod(req, res) {
  try {
    const token = getAccessToken(req);
    const url = `${config.get('challengeReports:rootURL')}/activeSession`;
    const data = await getData(token, url);

    const statusURL = `${config.get('challengeReports:rootURL')}/challenge-report-status-codes`;
    const statusData = await getData(token, statusURL);

    const response = {
      challengeReportsSessionID: data.challengeReportsSessionID,
      challengeReportsSessionStatus: statusData.find(status => status.challengeReportStatusCode === data.challengeReportsStatusCode)?.label || 'Unknown Status',
      preliminaryCompletionDate: data.finalDateForChanges ? formatCompletionDate(data.finalDateForChanges) : null,
      finalCompletionDate: data.finalStageCompletionDate ? formatCompletionDate(data.finalStageCompletionDate) : null,
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

    const fileDetails = { contentType: 'text/csv' };
    setResponseHeaders(res, fileDetails);
    const buffer = Buffer.from(data.documentData, 'base64');

    return res.status(HttpStatus.OK).json(buffer);
  } catch (e) {
    log.error(e, 'getActiveChallengeReportPeriod', 'Error occurred while attempting to GET active Challenge Reports Period.');
    return handleExceptionResponse(e, res);
  }
}

async function getDistrictChallengeReportsCounts(req, res) {
  try {
    const token = getAccessToken(req);
    const url = `${config.get('challengeReports:rootURL')}/district/${req.params.districtID}`;
    const data = await getData(token, url);

    const districtData = getDistrictByDistrictID(data.districtID);

    const schoolCounts = await createSchoolCountList(data.schoolsWithCounts);

    const reportsCounts = {
      districtID: data.districtID,
      districtName: `${districtData.districtNumber} - ${districtData.name}`,
      districtSum: schoolCounts.reduce((sum, school) => {return sum + parseInt(school.count, 10);}, 0),
      schoolsWithCounts: schoolCounts
    };

    console.log(reportsCounts);

    return res.status(HttpStatus.OK).json(reportsCounts);
  } catch (e) {
    log.error(e, 'getActiveChallengeReportPeriod', 'Error occurred while attempting to GET active Challenge Reports Period.');
    return handleExceptionResponse(e, res);
  }
}

async function createSchoolCountList(schoolsWithCounts){
  return Promise.all(schoolsWithCounts.map(async school => {
    const schoolData = getSchoolBySchoolID(school.schoolID);

    return {
      schoolID: school.schoolID,
      schoolName: `${schoolData.mincode} - ${schoolData.schoolName}`,
      count: school.count
    };
  }));
}

function setResponseHeaders(res, {contentType }) {
  res.setHeader('Content-Type', contentType);
}

function formatCompletionDate(rawDate) {
  const date = new Date(rawDate);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}/${month}/${day}`;
}

module.exports = {
  getActiveChallengeReportsPeriod,
  downloadDistrictChallengeReport,
  getDistrictChallengeReportsCounts
};

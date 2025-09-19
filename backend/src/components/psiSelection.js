'use strict';
const {
  getAccessToken,
  getData,
  handleExceptionResponse
} = require('./utils');
const HttpStatus = require('http-status-codes');
const config = require('../config');
const log = require('./logger');
const {doesSchoolBelongToDistrict} = require('./institute-cache');


async function downloadPsiSelectionReport(req, res) {
  try {
    console.log(req.params.schoolID);
    if(req.session.activeInstituteType === 'DISTRICT'){
      if(!doesSchoolBelongToDistrict(req.params.schoolID, req.session.activeInstituteIdentifier)){
        return res.status(HttpStatus.CONFLICT).json({
          status: HttpStatus.CONFLICT,
          message: 'The school is not within your district. The report cannot be accessed.'
        });
      } else {
        return res.status(HttpStatus.CONFLICT).json({
          status: HttpStatus.CONFLICT,
          message: 'This report is only available to schools.'
        });
      }
    }else if(req.session.activeInstituteType === 'SCHOOL'){
      if(req.params.schoolID !== req.session.activeInstituteIdentifier){
        return res.status(HttpStatus.CONFLICT).json({
          status: HttpStatus.CONFLICT,
          message: 'Your school is not your school. The report cannot be accessed.'
        });
      }
    }
  

    const token = getAccessToken(req);

    let url = `${config.get('psiSelection:rootURL')}/report/school/${req.params.schoolID}`;

    const resData = await getData(token, url);
    const fileDetails = getFileDetails('psi', null, null);

    setResponseHeaders(res, fileDetails);
    const buffer = Buffer.from(resData.documentData, 'base64');
    return res.status(HttpStatus.OK).send(buffer);
  } catch (e) {
    log.error('downloadPsiReport Error', e.stack);
    return handleExceptionResponse(e, res);
  }
}

function setResponseHeaders(res, { filename, contentType }) {
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.setHeader('Content-Type', contentType);
}


function getFileDetails(reportType) {
  const mappings = {

    'DEFAULT': { filename: 'download.csv', contentType: 'text/csv' }
  };
  return mappings[reportType] || mappings['DEFAULT'];
}

module.exports = {
  downloadPsiSelectionReport
};


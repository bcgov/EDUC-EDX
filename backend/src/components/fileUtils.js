'use strict';
const {createScanner} = require('clamdjs');
const config = require('../config');
const HttpStatus = require('http-status-codes');

async function scanFilePayload(req, res, next) {
  const valid = await scanFile(req.body.documentData ? req.body.documentData : req.body.fileContents)

  if (!valid) {
    return res.status(HttpStatus.NOT_ACCEPTABLE).json({
      status: HttpStatus.NOT_ACCEPTABLE,
      message: 'File has failed the virus scan'
    });
  }

  // no virus found in file
  next();
}

async function scanFile(base64File){
  try{
    const ClamAVScanner = createScanner(config.get('clamav:host'), Number(config.get('clamav:port')));
    const clamAVScanResult = await ClamAVScanner.scanBuffer(Buffer.from(base64File, 'base64'), 3000, 1024 * 1024);
    if (clamAVScanResult.includes('FOUND')) {
      console.log('ClamAV scan found possible virus');
      return false;
    }
  } catch (e) {
    // if virus scan is not to be performed/cannot be performed
    console.log('ClamAV Scanner was not found: ' + e);
  }
  console.log('ClamAV scan found no virus in file, allowing upload...');
  return true;
}

const utils = {
  scanFilePayload,
  scanFile
};

module.exports = utils;

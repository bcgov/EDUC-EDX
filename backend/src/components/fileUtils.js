'use strict';
const {createScanner} = require('clamdjs');
const config = require('../config');
const HttpStatus = require('http-status-codes');

async function scanFileForVirus(req, res, next) {
  try{
    const ClamAVScanner = createScanner(config.get('clamav:host'), Number(config.get('clamav:port')));
    console.log('ClamAV scanning file ' + req.body.fileName);
    const clamavScanResult = await ClamAVScanner.scanBuffer(Buffer.from(req.body.documentData, 'base64'), 3000, 1024 * 1024);
    if (clamavScanResult.includes('FOUND')) {
      return res.status(HttpStatus.NOT_ACCEPTABLE).json({
        status: HttpStatus.NOT_ACCEPTABLE,
        message: 'File has failed the virus scan'
      });
    }
  } catch (e) {
    // if virus scan is not to be performed/cannot be performed
    console.log('ClamAV Scanner was not found: ' + e);
  }

  // no virus found in file
  if(next){
    next();  
  }
  
  return true;
}

const utils = {
  scanFileForVirus
};

module.exports = utils;

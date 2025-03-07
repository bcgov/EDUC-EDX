'use strict';
const { logApiError, errorResponse} = require('./utils');
const HttpStatus = require('http-status-codes');
const cacheService = require('./cache-service');

function getCachedGradCollectionData(cacheKey,url){
  return  async function handler(req, res) {
    try {
      if (req.query.refreshCache === 'true') {
        await cacheService.loadDataToCache(cacheKey, url);
      }
      const cachedData = cacheService.getCachedData();
      const dataResponse = req.query.active === 'true' ? cachedData[cacheKey].activeRecords : cachedData[cacheKey].records;
      return res.status(HttpStatus.OK).json(dataResponse);
    } catch (e) {
      await logApiError(e, 'getCachedGradCollectionData', `Error occurred while attempting to GET ${cacheKey}.`);
      return errorResponse(res);
    }
  };
}

module.exports = {
  getCachedGradCollectionData
};

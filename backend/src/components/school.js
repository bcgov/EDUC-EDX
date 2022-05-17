'use strict';
const { logApiError, errorResponse} = require('./utils');
const cacheService = require('./cache-service');
const {LocalDate, DateTimeFormatter} = require('@js-joda/core');

async function getSchoolByMincode(req, res) {
  try {
    if(req.query?.mincode){
      const data = cacheService.getSchoolNameJSONByMincode(req.query.mincode);
      if(data){
        return res.status(200).json(data);
      }
    }else {
      let data = cacheService.getAllSchoolsJSON();
      if(data){
        data = data.filter(school => {
          return isSchoolExpired(school);
        });
        return res.status(200).json(data);
      }else {
        return res.status(200).json([]);
      }
    }
    return res.status(200).json();
  } catch (e) {
    logApiError(e, 'getSchoolByMincode', 'Error occurred while attempting to GET school entity.');
    return errorResponse(res);
  }
}

function isSchoolExpired(school) {
  if(school === null){
    return false;
  }

  const openedDate = school?.effectiveDate;
  const closedDate = school?.expiryDate;
  return !(!school || !school.schoolName || !openedDate || LocalDate.parse(openedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME).isAfter(LocalDate.now()) || (closedDate && LocalDate.parse(closedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME).isBefore(LocalDate.now())));
}

module.exports = {
  getSchoolByMincode
};

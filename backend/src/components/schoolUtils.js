'use strict';
const { LocalDate, DateTimeFormatter } = require('@js-joda/core');

function generateMincodeSchool(school) {
  return {
    mincode: `${school.distNo}${school.schlNo}`,
    schoolName: school.schoolName,
    effectiveDate: school.dateOpened,
    expiryDate: school.dateClosed,
  };
}

function isSchoolActive(school) {
  const currentTime = LocalDate.now();
  const openedDate = school?.effectiveDate;
  const closedDate = school?.expiryDate;
  return !(!school || !school.schoolName || !openedDate || currentTime.isBefore(LocalDate.parse(openedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME)) || (closedDate && currentTime.isAfter(LocalDate.parse(closedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME))));
}

module.exports = {
  generateMincodeSchool,
  isSchoolActive
};

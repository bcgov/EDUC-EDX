'use strict';
const { LocalDate, DateTimeFormatter } = require('@js-joda/core');

function generateSchoolObject(school) {
  return {
    schoolID: school.schoolId,
    districtID: school.districtId,
    mincode: school.mincode,
    schoolName: school.displayName,
    effectiveDate: school.openedDate,
    expiryDate: school.closedDate,
    schoolCategoryCode: school.schoolCategoryCode,
    facilityTypeCode: school.facilityTypeCode
  };
}

function isSchoolActive(school) {
  const currentTime = LocalDate.now();
  const openedDate = school?.effectiveDate;
  const closedDate = school?.expiryDate;
  return school
    && school.schoolName
    && !!openedDate
    && (!closedDate || currentTime.isBefore(LocalDate.parse(closedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME)));
}

module.exports = {
  generateSchoolObject: generateSchoolObject,
  isSchoolActive
};

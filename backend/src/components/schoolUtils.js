'use strict';
const { LocalDate, DateTimeFormatter } = require('@js-joda/core');
const cacheService = require('./cache-service');
const log = require('./logger');

function generateSchoolObject(school) {
  return {
    schoolID: school.schoolId,
    districtID: school.districtId,
    mincode: school.mincode,
    schoolName: school.displayName,
    effectiveDate: school.openedDate,
    expiryDate: school.closedDate,
    schoolCategoryCode: school.schoolCategoryCode
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

function checkIfUpdateOnOffshoreSchool(schoolID) {
  const school = cacheService.getSchoolBySchoolID(schoolID);

  if(school.schoolCategoryCode === 'OFFSHORE') {
    log.error('User cannot edit contacts for an offshore school.');
    throw new Error('403');
  }
}

module.exports = {
  checkIfActionOnOffshoreSchool: checkIfUpdateOnOffshoreSchool,
  generateSchoolObject: generateSchoolObject,
  isSchoolActive
};

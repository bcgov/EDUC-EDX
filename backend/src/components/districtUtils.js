'use strict';

const {LocalDate, DateTimeFormatter} = require('@js-joda/core');

function generateDistrictObject(district) {
  return {
    districtID: district.districtId,
    districtNumber: district.districtNumber,
    name: district.displayName,
    districtRegionCode: district.districtRegionCode,
    districtStatusCode: district.districtStatusCode
  };
}

function isDistrictActive(district) {
  return (district?.districtStatusCode?.toUpperCase() === 'ACTIVE');
}
function generateAuthorityObject(authority) {
  return {
    authorityID: authority.independentAuthorityId,
    authorityNumber: authority.authorityNumber,
    name: authority.displayName,
    openedDate: authority.openedDate,
    closedDate: authority.closedDate,
  };
}

function isAuthorityActive(authority) {
  const currentTime = LocalDate.now();
  const openedDate = authority?.openedDate;
  const closedDate = authority?.closedDate;
  return authority && authority.name && !!openedDate && !currentTime.isBefore(LocalDate.parse(openedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME))
      && (!closedDate || currentTime.isAfter(LocalDate.parse(closedDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME)));
}
module.exports = {
  generateDistrictObject,
  isDistrictActive,
  generateAuthorityObject,
  isAuthorityActive
};

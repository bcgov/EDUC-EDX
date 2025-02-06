'use strict';

import {getDateFormatter} from './format';
import {LocalDate} from '@js-joda/core';
import {isPlainObject} from 'lodash';
import rfdc from 'rfdc/default';
import {COLLECTIONCODETYPE} from './constants/CollectionCodeType';
import ApiService from '../common/apiService';
import {ApiRoutes} from './constants';


export const getLocalDateFromString = (date, pattern = 'uuuu-MM-dd') => {
  const formatter = getDateFormatter(pattern);
  try {
    return LocalDate.parse(date, formatter);
  } catch (e) {
    console.error(`Error is ${e}`);
  }
};

export function deepCloneObject(objectToBeCloned) {
  const cloned = rfdc(objectToBeCloned);
  return cloned;
}

export function setEmptyInputParams(params, ...excludedParams) {
  Object.keys(params).forEach(key => {
    if (!excludedParams.includes(key)) {
      if (isPlainObject(params[key])) {
        setEmptyInputParams(params[key], ...excludedParams);
      } else {
        params[key] = null;
      }
    }
  });
}

export function getComparisonIcon(comparisonValue, currentValue) {
  let previousValueNumber = Number(comparisonValue);
  let currentValueNumber = Number(currentValue);
  if (previousValueNumber < currentValueNumber) {
    return 'mdi-arrow-up';
  }
  if (previousValueNumber > currentValueNumber) {
    return 'mdi-arrow-down';
  }
  if (previousValueNumber === currentValueNumber) {
    return 'mdi-equal';
  }
  return '';
}

export function getStatusColor(comparisonValue, currentValue) {
  let previousValueNumber = Number(comparisonValue);
  let currentValueNumber = Number(currentValue);
  if (previousValueNumber < currentValueNumber) {
    return 'green';
  }
  if (previousValueNumber > currentValueNumber) {
    return 'red';
  }
}

export function getDemogValidationResults(student, sdcSchoolCollectionID) {
  return new Promise((resolve, reject) => {
    ApiService.apiAxios.post(ApiRoutes.penServices.VALIDATE_DEMOGRAPHICS + '/' + sdcSchoolCollectionID + '/demog-validation', student)
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      });
  });
}
export function downloadStudentOnlyReportURL(route) {
  return `${ApiRoutes.sdc.SDC_DISTRICT_COLLECTION}/${route.params.sdcDistrictCollectionID}/report/csv_dis/download`;
}

export function  downloadStudentErrorsReportURL(route) {
  return `${ApiRoutes.sdc.SDC_DISTRICT_COLLECTION}/${route.params.sdcDistrictCollectionID}/report/csv_dis_errors_warns/download`;
}

export function     getCollectionLink(currentCollectionTypeCode) {
  let collectionLink = '';
  let collectionCodeType = currentCollectionTypeCode;
  if (collectionCodeType === COLLECTIONCODETYPE.SEPTEMBER) {
    collectionLink = 'https://www2.gov.bc.ca/gov/content/education-training/k-12/administration/program-management/data-collections/september';
  } else if (collectionCodeType === COLLECTIONCODETYPE.FEBRUARY) {
    collectionLink = 'https://www2.gov.bc.ca/gov/content/education-training/k-12/administration/program-management/data-collections/february';
  } else if (collectionCodeType === COLLECTIONCODETYPE.MAY) {
    collectionLink = 'https://www2.gov.bc.ca/gov/content/education-training/k-12/administration/program-management/data-collections/may';
  } else if (collectionCodeType === COLLECTIONCODETYPE.JULY) {
    collectionLink = 'https://www2.gov.bc.ca/gov/content/education-training/k-12/administration/program-management/data-collections/summer-learning';
  }
  return collectionLink;
}

export function constructPenMatchObjectFromSdcStudent(student) {
  return {
    pen: student.studentPen,
    localID: student.localID,
    surname: student.legalLastName,
    givenName: student.legalFirstName,
    middleName: student.legalMiddleNames,
    usualSurname: student.usualLastName,
    usualGiven: student.usualFirstName,
    usualMiddleName: student.usualMiddleNames,
    dob: student.dob,
    sex: student.genderCode,
    enrolledGradeCode: student.gradeCode,
    postal: student.postalCode
  };
}

export function generateGradStartAndEndDateStrings(){
  let currentYr = new Date().getFullYear();
  let currentMo = new Date().getMonth();
  const startMonth = 'October';
  const endMonth = 'September';

  let dates = [];

  if (currentMo < 9){
    dates.push(startMonth + ' ' + (currentYr - 1).toString());
    dates.push(endMonth + ' ' + (currentYr).toString());
    dates.push(startMonth + ' ' + (currentYr - 2).toString());
    dates.push(endMonth + ' ' + (currentYr - 1).toString());
  } else {
    this.currentStartMoYr = this.startMonth + ' ' + (currentYr).toString();
    this.currentEndMoYr = this.endMonth + ' ' + (currentYr + 1).toString();
    this.histStartMoYr = this.startMonth + ' ' + (currentYr - 1).toString();
    this.histEndMoYr = this.endMonth + ' ' + (currentYr - 2).toString();
  }

  return dates;
}

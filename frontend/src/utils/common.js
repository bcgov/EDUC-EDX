'use strict';

import {getDateFormatter} from './format';
import {LocalDate} from '@js-joda/core';
import {isPlainObject} from 'lodash';
import rfdc from 'rfdc/default';
import {COLLECTIONCODETYPE} from './constants/CollectionCodeType';

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


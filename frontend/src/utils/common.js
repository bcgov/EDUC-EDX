'use strict';

import {getDateFormatter} from './format';
import {LocalDate} from '@js-joda/core';
import {isPlainObject} from 'lodash';
import rfdc from 'rfdc/default';

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



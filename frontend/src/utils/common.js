'use strict';

import {getDateFormatter} from '@/utils/format';
import {LocalDate} from '@js-joda/core';

export const getLocalDateFromString = (date, pattern = 'uuuu-MM-dd') => {
  const formatter = getDateFormatter(pattern);
  try {
    return LocalDate.parse(date, formatter);
  } catch (e) {
    console.error(`Error is ${e}`);
  }
};



import {DateTimeFormatterBuilder, LocalDate, LocalDateTime, ResolverStyle} from '@js-joda/core';

export function getDateFormatter(pattern) {
  return (new DateTimeFormatterBuilder)
    .appendPattern(pattern)
    .toFormatter(ResolverStyle.STRICT);
}

export function formatDateTime(datetime, from='uuuuMMdd', to='uuuu/MM/dd', hasTimePart=false) {
  const fromFormatter = getDateFormatter(from);
  const toFormatter = getDateFormatter(to);
  let result = datetime;
  const localDateTime = hasTimePart ? LocalDateTime : LocalDate;
  if (datetime && datetime.length > 0) {
    try {
      const date = localDateTime.parse(datetime, fromFormatter);
      result = date.format(toFormatter);
    } catch (err) {
      console.info(`could not parse date ${datetime}: ${from} to ${to} as date provided is invalid`);
    }
  }
  return result;
}

export function displayName(first, middle, last) {
  let name = '';
  if (last) {
    name += last;
  }

  if (first && last) {
    name +=  `, ${first}` ;
  } else if (first) {
    name += first;
  }

  if ((first && middle) || (last && middle)) {
    name += ` (${middle})`;
  } else if (middle) {
    name += `(${middle})`;
  }

  return name;
}

export function formatPhoneNumber(phoneNumberString) {
  let cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  let match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return match[1] + '-' + match[2] + '-' + match[3];
  }
  return null;
}

export function formatMincode(mincode) {
  return mincode;
}

export function formatDob(dob, from='uuuuMMdd', to='uuuu/MM/dd') {
  return formatDateTime(dob, from, to);
}

//used in institution schools/districts/authorities date formatting
export function formatDate(rawDate, from='uuuu-MM-dd\'T\'HH:mm:ss', to='uuuu/MM/dd') {
  return formatDateTime(rawDate,from, to);
}

export function formatSubmissionDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

export function formatContactName(contact) {
  return contact.firstName ? `${contact.firstName} ${contact.lastName}` : contact.lastName;
}

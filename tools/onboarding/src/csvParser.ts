import { parse as csvParser } from 'csv-parse';
import { createReadStream } from 'fs';

export type UserRecord = {
  mincode: string;
  firstName: string;
  lastName: string;
  email: string;
}

const HEADERS: (keyof UserRecord)[] = [
  'mincode',
  'firstName',
  'lastName',
  'email'
]

export function isUserRecord(record: any): record is UserRecord {
  const rowHasData = (data: keyof UserRecord) =>
    typeof record[data] === 'string' && record[data].trim() !== '';

  const dataPresent = HEADERS.filter(header => rowHasData(header));
  return dataPresent.length === HEADERS.length;
}

export function createCSVReadStream(path: string) {
  return createReadStream(path)
    .pipe(csvParser({
      delimiter: ',',
      columns: HEADERS,
      from_line: 2
    }));
}


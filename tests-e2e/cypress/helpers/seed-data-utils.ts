import {faker} from '@faker-js/faker';
import {DateTimeFormatter, LocalDate} from '@js-joda/core';

const createSdcSchoolCollectionStudent = (): SdcSchoolCollectionStudent => <SdcSchoolCollectionStudent>({
  localID: faker.string.alphanumeric(9),
  studentPen: faker.string.numeric({length: 9, allowLeadingZeros: true}),
  legalFirstName: faker.person.firstName(),
  legalMiddleNames: faker.person.middleName(),
  legalLastName: faker.person.lastName(),
  usualFirstName: faker.person.firstName(),
  usualMiddleNames: faker.person.middleName(),
  usualLastName: faker.person.lastName(),
  dob: faker.date.birthdate({min: 5, max: 18, mode: 'age'}).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, ''),
  gender: faker.person.sex()[0],
  nativeAncestryInd: 'N',
  homeLanguageSpokenCode: '943',
  enrolledGradeCode: generateSchoolGrade(),
  numberOfCourses: faker.string.numeric({length: 4, allowLeadingZeros: true}),
  postalCode: generatePostalCode(),
  sdcSchoolCollectionStudentStatusCode: 'VERIFIED'
});

export const createSdcSchoolCollection = (collectionId: string | undefined, schoolId: string | undefined, districtId: string | undefined, collectionOpenDate: string | undefined, collectionCloseDate: string | undefined): SdcSchoolCollection => <SdcSchoolCollection>({
  createUser: 'EDXAT',
  uploadDate: LocalDate.now().format(DateTimeFormatter.ofPattern('yyyyMMdd')),
  uploadFileName: 'EDX-AT-FILE.std',
  sdcSchoolCollectionStatusCode: 'NEW',
  collectionTypeCode: 'SEPTEMBER',
  collectionID: collectionId,
  schoolID: schoolId,
  districtID: districtId,
  collectionOpenDate: collectionOpenDate,
  collectionCloseDate: collectionCloseDate,
  students: createSdcSchoolCollectionStudents(5)
});

export const createSdcSchoolCollectionStudents = (numberOfUsers: number): SdcSchoolCollectionStudent[] => {
  const studentArray: SdcSchoolCollectionStudent[] = [];
  for (let i = 0; i < numberOfUsers; i++) {
    studentArray.push(createSdcSchoolCollectionStudent());
  }
  return studentArray;
};

const generateSchoolGrade = (): string => {
  const grades = ['KH', 'KF', '01', '02', '03', '04', '05', '06', '07', 'EU', '08', '09', '10', '11', '12', 'SU', 'GA', 'HS'];
  return faker.helpers.arrayElement(grades);
};

function generatePostalCode() {
  const firstLetter = faker.helpers.arrayElement(['D', 'F', 'M', 'A', 'V']);
  const secondDigit = faker.number.int({ min: 0, max: 9 });
  const thirdLetter = faker.helpers.arrayElement(['D', 'F', 'M', 'A', 'V']);
  const fourthSpace = faker.number.int({ min: 0, max: 9 });
  const fifthDigit = faker.helpers.arrayElement(['D', 'F', 'M', 'A', 'V']);
  const sixthLetter = faker.number.int({ min: 0, max: 9 });

  return `${firstLetter}${secondDigit}${thirdLetter}${fourthSpace}${fifthDigit}${sixthLetter}`;
}

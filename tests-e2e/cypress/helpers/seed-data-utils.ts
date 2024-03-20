import {faker} from '@faker-js/faker';
import {DateTimeFormatter, LocalDate} from '@js-joda/core';

const createSdcSchoolCollectionStudent = (grades: string[] | undefined): SdcSchoolCollectionStudent => <SdcSchoolCollectionStudent>({
  localID: faker.string.alphanumeric(9),
  studentPen: faker.string.numeric({length: 9, allowLeadingZeros: true}),
  legalFirstName: faker.person.firstName(),
  legalMiddleNames: faker.person.middleName(),
  legalLastName: faker.person.lastName(),
  usualFirstName: faker.person.firstName(),
  usualMiddleNames: faker.person.middleName(),
  usualLastName: faker.person.lastName(),
  dob: generateBirthdate(),
  gender: faker.person.sex()[0].toUpperCase(),
  nativeAncestryInd: 'N',
  homeLanguageSpokenCode: '943',
  enrolledGradeCode: generateSchoolGrade(grades),
  numberOfCourses: faker.number.int({ min: 0, max: 1500 }).toString().padStart(4, '0'),
  postalCode: generatePostalCode(),
  sdcSchoolCollectionStudentStatusCode: 'VERIFIED',
  fte: 0
});

export const createSdcSchoolCollection = (collectionId: string | undefined, schoolId: string | undefined, districtId: string | undefined, collectionOpenDate: string | undefined, collectionCloseDate: string | undefined, students: SdcSchoolCollectionStudent[] | undefined, sdcSchoolCollectionStatusCode: string | undefined): SdcSchoolCollection => <SdcSchoolCollection>({
  createUser: 'EDXAT',
  uploadDate: LocalDate.now().format(DateTimeFormatter.ofPattern('yyyyMMdd')),
  uploadFileName: 'EDX-AT-FILE.std',
  sdcSchoolCollectionStatusCode: sdcSchoolCollectionStatusCode,
  collectionTypeCode: 'SEPTEMBER',
  collectionID: collectionId,
  schoolID: schoolId,
  districtID: districtId,
  collectionOpenDate: collectionOpenDate,
  collectionCloseDate: collectionCloseDate,
  students: students ? students : createSdcSchoolCollectionStudents(5, undefined)
});

export const createSdcSchoolCollectionStudents = (numberOfUsers: number, grades: string[] | undefined): SdcSchoolCollectionStudent[] => {
  const studentArray: SdcSchoolCollectionStudent[] = [];
  for (let i = 0; i < numberOfUsers; i++) {
    studentArray.push(createSdcSchoolCollectionStudent(grades));
  }
  return studentArray;
};

const generateSchoolGrade = (grades:string[] = ['KH', 'KF', '01', '02', '03', '04', '05', '06', '07', 'EU', '08', '09', '10', '11', '12', 'SU', 'GA', 'HS']): string => {
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

function generateBirthdate() {
  const birthDate = faker.date.birthdate({min: 5, max: 18, mode: 'age'});
  const year = birthDate.getFullYear();
  const month = String(birthDate.getMonth() + 1).padStart(2, '0');
  const day = String(birthDate.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

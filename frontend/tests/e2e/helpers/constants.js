import config from '../config/index';
import faker from 'faker';
import studentData from '../config/studentData.json'

export const namespace = config.get('url:namespace') ;
export const environment = config.get('url:environment') ;

export const BceidLoginUrl = 'https://pen-request-'+namespace +'-'+environment+'.pathfinder.gov.bc.ca/api/auth/logout?loginBceid=true';
export const StaffLoginUrl = 'https://student-admin-'+namespace +'-'+environment+'.pathfinder.gov.bc.ca/';
export const MailsacUrl = 'https://mailsac.com/login';

export const credentials = Object.freeze({
  username: config.get('bceid:user'),
  password: config.get('bceid:pass')
});

export const IDIRcredentials = Object.freeze({
  username: config.get('idir:user'),
  password: config.get('idir:pass')
});

export const MailsackCredentials = Object.freeze({
  username: config.get('penemail:user'),
  password: config.get('penemail:pass')

})




export const fullStudentFaker = Object.freeze({
  legalLastName: faker.name.lastName(),
  legalFirstName: faker.name.firstName(),
  legalMiddleNames: faker.name.firstName(),
  maidenName: faker.name.lastName(),
  usualLastName: faker.name.lastName(),
  usualFirstName: faker.name.firstName(),
  usualMiddleNames: faker.name.firstName(),
  pastNames: null,
  birthdate: faker.date.past(50),
  gender: faker.random.number({ max: 3 }),
  email: faker.internet.email(),
  lastBCSchool: faker.address.city() + ' Middle School',
  lastBCStudentNumber: String(faker.random.number()),
  currentSchool: faker.address.city() + ' High School'
});

export const fullStudent = Object.freeze({
  legalLastName: studentData.legalLastName,
  legalFirstName: studentData.legalFirstName,
  legalMiddleNames: studentData.legalMiddleNames,
  maidenName: studentData.maidenName,
  usualLastName: studentData.usualLastName,
  usualFirstName: studentData.usualFirstName,
  usualMiddleNames: studentData.usualMiddleNames,
  pastNames: studentData.pastNames,
  birthdate: faker.date.past(50),
  gender: faker.random.number({ max: 3 }),
  email: studentData.email,
  lastBCSchool: studentData.lastBCSchool,
  lastBCStudentNumber: studentData.lastBCStudentNumber,
  currentSchool: studentData.currentSchool
});
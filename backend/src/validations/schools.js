const { object, string, number, date, array} = require('yup');

const getSchoolSchema = object({
  body: object().noUnknown(),
  params: object({
    schoolID: string()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const schoolContactSchema = object({
  alternatePhoneExtension: string().nullable(),
  alternatePhoneNumber: string().nullable(),
  createDate: date(),
  createUser: string(),
  effectiveDate: date(),
  email: string().email(),
  expiryDate: date().nullable(),
  firstName: string().nullable(),
  jobTitle: string().nullable(),
  lastName: string(),
  phoneExtension: string().nullable(),
  phoneNumber: string().nullable(),
  schoolContactId: string().nullable(),
  schoolContactTypeCode: string(),
  schoolId: string(),
  updateDate: date(),
  updateUser: string(),
}).noUnknown();


const postSchoolContactSchema = object({
  body: schoolContactSchema,
  params: object({
    schoolID: string()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const putSchoolSchema = object({
  body: object({
    addresses: array().of(object({
      addressLine1: string(),
      addressLine2: string().nullable(),
      addressTypeCode: string(),
      city: string(),
      countryCode: string(),
      createDate: date(),
      createUser: string(),
      postal: string(),
      provinceCode: string(),
      schoolAddressId: string(),
      schoolId: string(),
      updateDate: date(),
      updateUser: string(),
    }).noUnknown()),
    closedDate: date().nullable(),
    contacts: array().of(schoolContactSchema),
    createDate: date(),
    createUser: string(),
    displayName: string(),
    displayNameNoSpecialChars: string().nullable(),
    districtId: string(),
    email: string().email().nullable(),
    facilityType: string(),
    facilityTypeCode: string(),
    faxNumber: string().nullable(),
    grades: array().of(object({
      description: string(),
      displayOrder: number().positive().integer(),
      effectiveDate: date(),
      expiryDate: date(),
      label: string(),
      schoolGradeCode: string(),
    }).noUnknown()),
    independentAuthorityId: string().nullable(),
    mincode: string(),
    neighborhoodLearning: array().of(object({
      description: string(),
      displayOrder: number().positive().integer(),
      effectiveDate: date(),
      expiryDate: date(),
      label: string(),
      neighborhoodLearningTypeCode: string(),
    }).noUnknown()),
    notes: string().nullable(),
    openedDate: date(),
    phoneNumber: string().nullable(),
    schoolCategory: string(),
    schoolCategoryCode: string(),
    schoolId: string(),
    schoolMove: array().of(object({
      createDate: date(),
      createUser: string(),
      fromSchoolId: string(),
      moveDate: date(),
      schoolMoveId: string(),
      toSchoolId: string(),
      updateDate: date(),
      updateUser: string(),
    }).noUnknown()),
    schoolNumber: number().positive().integer(),
    schoolOrganizationCode: string(),
    schoolReportingRequirementCode: string(),
    status: string(),
    updateDate: date(),
    updateUser: string(),
    website: string().url().nullable()
  }).noUnknown(),
  params: object({
    schoolID: string()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const schoolPaginatedSchema = object({
  body: object().noUnknown(),
  params: object().noUnknown(),
  query: object({
    pageNumber: number().required().moreThan(-1).integer(),
    pageSize: number().required().positive().integer(),
    sort: object({
      schoolNumber: string().matches(/(ASC|DESC)/),
      updateDate: string().matches(/(ASC|DESC)/)
    }).noUnknown(),
    searchParams: object({
      status: string(),
      districtID: string(),
      pubEarlyLearning: string()
    }).noUnknown()
  }).noUnknown()
}).noUnknown();

module.exports = {
  getSchoolSchema,
  putSchoolSchema,
  schoolContactSchema: postSchoolContactSchema,
  schoolPaginatedSchema,
};

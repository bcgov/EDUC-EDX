const { object, string, number, date, array, boolean } = require('yup');
const { baseAddressSchema, baseContactSchema, baseRequestSchema } = require('./base');

const getBySchoolIdSchema = object({
  body: object().noUnknown(),
  params: object({
    schoolID: string()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const schoolContactSchema = object({
  schoolContactTypeCode: string().max(10),
  schoolId: string(),
  schoolContactId: string().nullable()
}).concat(baseContactSchema).concat(baseRequestSchema).noUnknown();

const schoolAddressSchema = baseAddressSchema.concat(baseRequestSchema).noUnknown();

const postSchoolContactSchema = object({
  body: schoolContactSchema,
  params: object({
    schoolID: string()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const putSchoolContactSchema = object({
  body: schoolContactSchema.shape({
    schoolID: string()
  }),
  query: object().noUnknown(),
  params: object().noUnknown()
}).noUnknown();

const deleteSchoolContactSchema = object({
  body:  object().noUnknown(),
  params: object({
    schoolID: string(),
    contactID: string()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const putSchoolSchema = object({
  body: object({
    schoolId: string(),
    districtId: string(),
    mincode: string(),
    independentAuthorityId: string().nullable(),
    schoolNumber: number().positive().integer(),
    faxNumber: string().max(10).nullable(),
    phoneNumber: string().max(10).nullable(),
    email: string().email().max(255).nullable(),
    website: string().url().nullable().max(255),
    schoolReportingRequirementCode: string().max(10).nonNullable(),
    displayName: string().max(255).nonNullable(),
    displayNameNoSpecialChars: string().max(255).nullable(),
    schoolOrganizationCode: string().max(10).nonNullable(),
    schoolCategoryCode: string().max(10).nonNullable(),
    facilityTypeCode: string().max(10).nonNullable(),
    openedDate: date(),
    closedDate: date().nullable(),
    canIssueCertificates: boolean().nullable(),
    canIssueTranscripts: boolean().nullable(),
    contacts: array().of(schoolContactSchema),
    addresses: array().of(schoolAddressSchema.shape({
      schoolAddressId: string(),
      schoolId: string()
    }).noUnknown()),
    notes: string().nullable(),
    grades: array().of(
      object({
        schoolGradeId: String(),
        schoolId: string(),
        schoolGradeCode: string().max(10).nonNullable(),
        label: string(),
        description: string(),
        displayOrder: number().positive().integer(),
        effectiveDate: date(),
        expiryDate: date()
      }).concat(baseRequestSchema).noUnknown()),
    schoolFundingGroups: array().of(object({
      schoolFundingGroupCode: string().nullable(),
      label: string().nullable(),
      description: string().nullable(),
      displayOrder: string().nullable()
    }).noUnknown()),
    neighborhoodLearning: array().of(object({
      description: string(),
      displayOrder: number().positive().integer(),
      effectiveDate: date(),
      expiryDate: date(),
      label: string(),
      neighborhoodLearningTypeCode: string().max(10).nonNullable()
    }).noUnknown()),
    schoolMove: array().of(object({
      fromSchoolId: string().nonNullable(),
      moveDate: date().nonNullable(),
      schoolMoveId: string(),
      toSchoolId: string().nonNullable()
    }).concat(baseRequestSchema).noUnknown()),
    facilityType: string(),
    schoolCategory: string(),
    status: string()
  }).concat(baseRequestSchema).noUnknown(),
  params: object({
    schoolID: string()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const getSchoolPaginatedSchema = object({
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
      pubEarlyLearning: string(),
      schoolID: string(),
      districtID: string(),
      type: string(),
    }).noUnknown()
  }).noUnknown()
}).noUnknown();

module.exports = {
  getBySchoolIdSchema,
  putSchoolSchema,
  schoolContactSchema: postSchoolContactSchema,
  putSchoolContactSchema,
  deleteSchoolContactSchema,
  getSchoolPaginatedSchema,
};

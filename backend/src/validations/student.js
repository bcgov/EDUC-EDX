const { object, string } = require('yup');
const { baseRequestSchema } = require('./base');

const postNewStudentSchema = object({
  body: object({
    pen:string().max(9).nonNullable().optional(),
    legalFirstName: string().max(25).nonNullable().optional(),
    legalMiddleNames: string().max(25).nullable().optional(),
    legalLastName: string().max(25).nonNullable().optional(),
    dob: string().nonNullable().optional(),
    sexCode:  string().nonNullable().optional(),
    genderCode: string().nullable().optional(),
    usualFirstName: string().max(25).nullable().optional(),
    usualMiddleNames: string().max(25).nullable().optional(),
    usualLastName: string().max(25).nullable().optional(),
    email: string().max(80).nullable().optional(),
    emailVerified: string().oneOf(['Y','N']).nullable().optional(),
    deceasedDate: string().nullable().optional(),
    postalCode: string().max(7).nullable().optional(),
    mincode: string().max(8).nullable().optional(),
    localID: string().max(12).nullable().optional(),
    gradeCode: string().max(2).nullable().optional(),
    gradeYear: string().max(4).nullable().optional(),
    demogCode: string().max(1).nonNullable().optional(),
    statusCode: string().max(1).nonNullable().optional(),
    memo: string().max(4000).nullable().optional(),
    trueStudentID: string().nullable().optional(),
    documentTypeCode: string().nullable().optional(),
    dateOfConfirmation: string().nullable().optional()
  }).concat(baseRequestSchema),
  params: object({
    sdcSchoolCollectionID: string()
  }).noUnknown(),
  query: object()
}).noUnknown();

module.exports = {
  newStudentSchema: postNewStudentSchema
};

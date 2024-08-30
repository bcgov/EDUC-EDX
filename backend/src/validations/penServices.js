const { object, string, boolean } = require('yup');
const { newStudentSchema } = require('./student');

const postValidateStudentSchema = object({
  body: object({
    isInteractive: boolean().nullable().optional(),
    transactionID: string().nullable().optional(),
  }).concat(newStudentSchema),
  params: object({
    sdcSchoolCollectionID: string()
  }).noUnknown(),
  query: object()
}).noUnknown();

module.exports = {
  validateStudentSchema: postValidateStudentSchema
};

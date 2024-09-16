const { object, string, boolean, array } = require('yup');
const { baseSdcSchoolStudent } = require('./sdc');
const { baseRequestSchema } = require('./base');

const postValidateStudentSchema = object({
  body: object({
    isInteractive: boolean().nullable().optional(),
    transactionID: string().nullable().optional(),
    student: baseSdcSchoolStudent.shape({
      enrolledProgramCodes: array().of(string()).nullable().optional(),
      filteredEnrolledProgramCodes: array().of(string()).nullable().optional()
    }).concat(baseRequestSchema)
  }).concat(baseRequestSchema),
  params: object({
    sdcSchoolCollectionID: string()
  }).noUnknown(),
  query: object()
});

module.exports = {
  validateStudentSchema: postValidateStudentSchema
};

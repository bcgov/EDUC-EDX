const { object, string, array } = require('yup');
const { baseRequestSchema } = require('./base');
const { baseSdcSchoolStudent } = require('./sdc');

const postNewStudentSchema = object({
  body: object({
    student: baseSdcSchoolStudent.shape({
      enrolledProgramCodes: array().of(string()).nullable().optional()
    }).concat(baseRequestSchema)
  }).concat(baseRequestSchema).noUnknown(),
  params: object({
    sdcSchoolCollectionID: string()
  }).noUnknown(),
  query: object()
}).noUnknown();

module.exports = {
  newStudentSchema: postNewStudentSchema
};

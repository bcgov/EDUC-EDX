const { object, string } = require('yup');
const { baseRequestSchema } = require('./base');
const { baseSdcSchoolStudent } = require('./sdc');

const postNewStudentSchema = object({
  body: object({
    student: baseSdcSchoolStudent.concat(baseRequestSchema)
  }).concat(baseRequestSchema).noUnknown(),
  params: object({
    sdcSchoolCollectionID: string()
  }).noUnknown(),
  query: object()
}).noUnknown();

module.exports = {
  newStudentSchema: postNewStudentSchema
};

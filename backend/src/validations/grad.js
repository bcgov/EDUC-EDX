const { object, string } = require('yup');
const {baseRequestSchema} = require('./base');

const gradFileUploadSchema =  object({
    body:object({
      fileName: string().nonNullable(),
      fileContents: string().nonNullable(),
      fileType: string().nonNullable()
    }).concat(baseRequestSchema).noUnknown(),
    params: object({
      schoolID: string().nonNullable()
    }).noUnknown(),
    query: object().noUnknown(),
  }).noUnknown();

  const gradFileBySchoolIDSchema =  object({
    body: object().noUnknown(),
    params: object({
      schoolID: string().nonNullable()
    }).noUnknown(),
    query: object().noUnknown(),
  }).noUnknown();

  module.exports = {
    gradFileUploadSchema,
    gradFileBySchoolIDSchema
  };
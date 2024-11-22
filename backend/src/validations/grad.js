const { object, string, number } = require('yup');
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

const gradErrorFilesetStudentPaginatedSchema = object({
  body: object().noUnknown(),
  params: object({
    activeIncomingFilesetID: string()
  }),
  query: object({
    pageNumber: number().moreThan(-1).integer().optional(),
    pageSize: number().positive().integer().optional(),
    sort: object().optional(),
    searchParams: object().optional()
  })
}).noUnknown();

module.exports = {
  gradFileUploadSchema,
  gradFileBySchoolIDSchema,
  gradErrorFilesetStudentPaginatedSchema
};

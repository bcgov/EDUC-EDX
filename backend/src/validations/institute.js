const { object, string, boolean } = require('yup');

const geAuthoritySchema = object({
  body: object(),
  params: object({
    id: string(),
  }),
  query: object()
}).noUnknown();

const getActiveDataSchema = object({
  body: object().noUnknown(),
  params: object().noUnknown(),
  query: object({
    active: boolean().optional()
  }).noUnknown()
}).noUnknown();

module.exports = {
  geAuthoritySchema,
  getActiveDataSchema
};

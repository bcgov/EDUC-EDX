'use strict';
const { object, string } = require('yup');

const putUserNameSchema = object({
  body: object({
    firstName: string().required().max(255).nonNullable(),
    lastName: string().required().max(255).nonNullable()
  }).noUnknown(),
  params: object().noUnknown(),
  query: object().noUnknown()
}).noUnknown();

module.exports = {
  putUserNameSchema
};

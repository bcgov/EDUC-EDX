const { object, string, array } = require('yup');
const { baseAddressSchema, baseContactSchema, baseRequestSchema } = require('./base');

const getByDistrictIdSchema = object({
  body: object().noUnknown(),
  params: object({
    districtID: string()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const districtContactSchema = object({
  districtContactTypeCode: string().max(10),
}).concat(baseContactSchema).concat(baseRequestSchema).noUnknown();

const districtAddressSchema = baseAddressSchema.concat(baseRequestSchema).noUnknown();

const postDistrictContactSchema = object({
  body: districtContactSchema,
  params: object({
    districtID: string()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const putDistrictContactSchema = object({
  body: districtContactSchema.shape({
    districtContactId: string(),
    districtId: string()
  }),
  params: object({
    districtID: string()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const deleteDistrictContactSchema = object({
  body: object().noUnknown(),
  params: object({
    districtID: string(),
    contactID: string()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const putDistrictSchema = object({
  body: object({
    districtId: string().nullable(),
    displayName: string().max(255).nonNullable(),
    districtNumber: string().max(3).nonNullable(),
    districtRegionCode: string().max(10).nonNullable(),
    districtStatusCode: string().max(10).nonNullable(),
    phoneNumber: string().max(10).nullable(),
    faxNumber: string().nullable().max(10).nullable(),
    email: string().nullable().max(255),
    website: string().nullable().max(255),
    contacts: array().of(districtContactSchema.shape({
      districtContactId: string(),
      districtId: string()
    })),
    addresses: array().of(districtAddressSchema.shape({
      districtAddressId: string(),
      districtId: string()
    })),
    notes: string().nullable(),
  }),
  params: object({
    districtID: string()
  }).noUnknown(),
  query: object().noUnknown()
}).concat(baseRequestSchema).noUnknown();

module.exports = {
  getByDistrictIdSchema,
  putDistrictSchema,
  districtContactSchema: postDistrictContactSchema,
  putDistrictContactSchema,
  deleteDistrictContactSchema,
};

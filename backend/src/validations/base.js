const { object, string, date } = require('yup');

const baseRequestSchema = object({
  createDate: date().nullable().optional(),
  createUser: string().nullable().max(100).optional(),
  updateDate: date().nullable().optional(),
  updateUser: string().nullable().max(100).optional(),
}).noUnknown();

const baseAddressSchema = object({
  addressLine1: string().max(255),
  addressLine2: string().nullable().max(255),
  city: string().max(255),
  postal: string().max(255),
  provinceCode: string().max(10),
  countryCode: string().max(10),
  addressTypeCode: string(),
}).noUnknown();

const baseContactSchema = object({
  firstName: string().nullable().max(255),
  lastName: string().max(255),
  jobTitle: string().nullable(),
  phoneNumber: string().nullable().max(10),
  phoneExtension: string().nullable().max(10),
  alternatePhoneNumber: string().nullable().max(10),
  alternatePhoneExtension: string().nullable().max(10),
  email: string().email().nullable().max(255),
  effectiveDate: date(),
  expiryDate: date().nullable(),
}).noUnknown();

module.exports = {
  baseAddressSchema,
  baseContactSchema,
  baseRequestSchema,
};

const { object, string, boolean} = require('yup');

const getChallengeReportPeriodSchema = object({
  body: object().noUnknown(),
  params: object().noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const getChallengeReportDownloadSchema = object({
  body: object().noUnknown(),
  params: object({
    districtID: string()
  }).noUnknown(),
  query: object({
    isPrelim: boolean(),
    period: string()
  }).noUnknown()
}).noUnknown();


module.exports = {
  getChallengeReportPeriodSchema,
  getChallengeReportDownloadSchema
};

const { object, string, boolean, number, array } = require('yup');
const { baseRequestSchema } = require('./base');
const { uuidGeneric } = require('./custom-validations');
const { ASSESSMENTS_REPORT_TYPE_CODE_MAP } = require('../util/constants');


const putStudentAssessmentSchema = object({
  body: object({
    assessmentStudentID: string().nonNullable(),
    sessionID:string().nonNullable(),
    schoolOfRecordSchoolID: string().nonNullable(),
    assessmentID:string().nonNullable(),
    assessmentTypeCode: string().nonNullable(),
    studentID: string().nonNullable(),
    pen: string().max(9).nonNullable(),
    localID: string().max(12).nullable().optional(),
    givenName: string().max(25).nullable().optional(),
    surname: string().max(25).nonNullable(),
    localCourseID: string().max(20).nullable().optional(),
    isElectronicExam: boolean().nullable().optional(),
    proficiencyScore: number().nullable().optional(),
    provincialSpecialCaseCode: string().max(1).nullable().optional(),
    courseStatusCode: string().max(1).nullable().optional(),
    numberOfAttempts: number().nullable().optional(),
    schoolAtWriteSchoolID: string().nullable().optional(),
    assessmentCenterSchoolID: string().nullable().optional(),
    assessmentFormID: string().nullable().optional(),
    adaptedAssessmentCode: string().nullable().optional(),
    irtScore: number().nullable().optional(),
    localAssessmentID: string().nullable().optional(),
    didNotAttemptFlag: string().nullable().optional(),
    markingSession: string().nullable().optional(),
    downloadDate: string().nullable().optional(),
    courseMonth: number().optional(),
    courseYear: number().optional(),
    result: string().nullable().optional(),
    studentStatusCode: string().nullable().optional(),
    gradeAtRegistration: string().nullable().optional(),
    wroteFlag: string().nullable().optional(),
    assessmentStudentValidationIssues: array().of(object({
      assessmentStudentValidationIssueID:string().nullable().optional(),
      assessmentStudentID:string().nullable().optional(),
      validationIssueSeverityCode:string().nullable().optional(),
      validationIssueCode:string().nullable().optional(),
      validationIssueFieldCode:string().nullable().optional(),
      validationLabel:string().nullable().optional(),
      validationMessage:string().nullable().optional(),
    }).concat(baseRequestSchema)).nullable().optional()
  }).concat(baseRequestSchema).noUnknown(),
  params: object({
    studentAssessmentID: string().nonNullable(),
  }),
  query: object().noUnknown(),
}).noUnknown();

const postAssessmentStudentSchema = object({
  body: object({
    sessionID:string().nonNullable(),
    schoolOfRecordSchoolID: string().nonNullable(),
    assessmentID:string().nonNullable(),
    assessmentTypeCode: string().nonNullable(),
    studentID: string().nullable().optional(),
    assessmentStudentID: string().nullable().optional(),
    courseStatusCode: string().nullable().optional(),
    numberOfAttempts: string().nullable().optional(),
    pen: string().max(9).nonNullable(),
    localID: string().max(12).nullable().optional(),
    givenName: string().max(25).nullable().optional(),
    surname: string().max(25).nonNullable(),
    isElectronicExam: boolean().nullable().optional(),
    schoolAtWriteSchoolID: string().nullable().optional(),
    assessmentCenterSchoolID: string().nullable().optional(),
    assessmentFormID: string().nullable().optional(),
    courseMonth: number().optional(),
    courseYear: number().optional(),
    adaptedAssessmentCode: string().nullable().optional(),
    irtScore: number().nullable().optional(),
    localAssessmentID: string().nullable().optional(),
    didNotAttemptFlag: string().nullable().optional(),
    markingSession: string().nullable().optional(),
    downloadDate: string().nullable().optional(),
    result: string().nullable().optional(),
    proficiencyScore: number().nullable().optional(),
    localCourseID: string().max(20).nullable().optional(),
    provincialSpecialCaseCode: string().max(1).nullable().optional(),
    studentStatusCode: string().nullable().optional(),
    gradeAtRegistration: string().nullable().optional(),
    wroteFlag: string().nullable().optional(),
    assessmentStudentValidationIssues: array().of(object({
      assessmentStudentID:string().nullable().optional(),
      validationIssueSeverityCode:string().nullable().optional(),
      validationIssueCode:string().nullable().optional(),
      validationIssueFieldCode: string().nullable().optional(),
      validationLabel:string().nullable().optional(),
      validationMessage:string().nullable().optional(),
    }).concat(baseRequestSchema)).nullable().optional()
  }).concat(baseRequestSchema).noUnknown(),
  query: object().noUnknown(),
  params: object({
    instituteType: string().nonNullable(),
  }).noUnknown(),
}).noUnknown();

const sessionIDParams = () => object({
  sessionID: uuidGeneric().required(),
}).noUnknown();

const sessionAndSchoolIDParams = () => object({
  sessionID: uuidGeneric().required(),
  schoolID:  uuidGeneric().required(),
}).noUnknown();

const reportRequestSchema = (params, query = object().noUnknown()) => object({
  params,
  query,
  body: object().noUnknown(),
}).noUnknown();

const checkSchoolReportAvailabilitySchema = reportRequestSchema(
  sessionAndSchoolIDParams(),
  object({ assessmentTypeCode: string().optional() }).noUnknown()
);

const checkXamFileAvailabilitySchema = reportRequestSchema(sessionAndSchoolIDParams());

const checkSchoolReportTypeAvailabilitySchema = reportRequestSchema(
  object({
    sessionID:      uuidGeneric().required(),
    schoolID:       uuidGeneric().required(),
    reportTypeCode: string().required(),
  }).noUnknown(),
  object({ sessionCode: string().optional() }).noUnknown()
);

const checkDistrictReportAvailabilitySchema = reportRequestSchema(
  sessionIDParams(),
  object({ assessmentTypeCode: string().optional() }).noUnknown()
);

const checkDistrictReportTypeAvailabilitySchema = reportRequestSchema(
  object({
    sessionID:      uuidGeneric().required(),
    reportTypeCode: string().oneOf([...ASSESSMENTS_REPORT_TYPE_CODE_MAP.keys()]).required(),
  }).noUnknown()
);

const getDistrictReportAvailabilitySchema = reportRequestSchema(sessionIDParams());

const getDistrictSchoolsWithResultsSchema = reportRequestSchema(sessionIDParams());

const checkStudentReportAvailabilitySchema = reportRequestSchema(
  object({
    studentID:      uuidGeneric().required(),
    reportTypeCode: string().required(),
  }).noUnknown()
);

module.exports = {
  putStudentAssessmentSchema,
  postAssessmentStudentSchema,
  checkSchoolReportAvailabilitySchema,
  checkXamFileAvailabilitySchema,
  checkSchoolReportTypeAvailabilitySchema,
  checkDistrictReportAvailabilitySchema,
  checkDistrictReportTypeAvailabilitySchema,
  checkStudentReportAvailabilitySchema,
  getDistrictReportAvailabilitySchema,
  getDistrictSchoolsWithResultsSchema,
};

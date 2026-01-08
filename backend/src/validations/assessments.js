const { object, string, boolean, number, array } = require('yup');
const { baseRequestSchema } = require('./base');


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
    givenName: string().max(25).nonNullable(),
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
    givenName: string().max(25).nonNullable(),
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

module.exports = {
  putStudentAssessmentSchema,
  postAssessmentStudentSchema
};

const { object, string, boolean, number, array } = require('yup');
const {baseRequestSchema} = require('./base');
const { PERMISSION } = require('../util/Permission');

const baseQuerySchema = object({
  type: string().optional(),
  compare: boolean().optional()
});

const baseStudentSchema = object({
  sdcSchoolCollectionStudentID: string().nullable().optional(),
  sdcSchoolCollectionID: string().nonNullable(),
  sdcDistrictCollectionID:string().nullable().optional(),
  localID: string().max(12).nullable().optional(),
  studentPen: string().max(9).nullable().optional(),
  legalFirstName: string().max(255).nullable().optional(),
  legalMiddleNames: string().max(255).nullable().optional(),
  legalLastName: string().max(255).nonNullable(),
  usualFirstName: string().max(255).nullable().optional(),
  usualMiddleNames: string().max(255).nullable().optional(),
  usualLastName: string().max(255).nullable().optional(),
  dob: string().max(8).nonNullable(),
  gender: string().max(1).nonNullable(),
  postalCode: string().max(6).nullable().optional(),
  sdcSchoolCollectionStudentStatusCode: string().max(10).nonNullable(),
  enrolledGradeCode: string().max(10).nonNullable(),
  schoolFundingCode: string().max(10).nullable().optional(),
  careerProgramCode: string().max(10).nullable().optional(),
  nativeAncestryInd: string().max(1).nonNullable(),
  otherCourses: string().max(1).nullable().optional(),
  supportBlocks: string().max(1).nullable().optional(),
  numberOfCourses: string().nullable().optional()
});
const baseSdcSchoolStudent = baseStudentSchema.shape({   
  enrolledProgramCodes: string().max(16).nullable().optional(),
  filteredEnrolledProgramCodes: array().of(string()).nullable().optional(),
  numberOfCoursesDec: number().nullable().optional(),
  schoolID: string().nullable().optional(),
  bandCode:string().max(4).nullable().optional(),
  isAdult: string().nullable().optional(),
  isSchoolAged: string().nullable().optional(),
  fte: number().nullable().optional(),
  fteZeroReasonCode: string().max(10).nullable().optional(),
  frenchProgramNonEligReasonCode:string().max(10).nullable().optional(),
  ellNonEligReasonCode:string().max(10).nullable().optional(),
  indigenousSupportProgramNonEligReasonCode:string().max(10).nullable().optional(),
  careerProgramNonEligReasonCode:string().max(10).nullable().optional(),
  specialEducationNonEligReasonCode: string().max(10).nullable().optional(),
  specialEducationCategoryCode: string().max(10).nullable().optional(),
  homeLanguageSpokenCode: string().max(10).nullable().optional(),
  isGraduated: string().nullable().optional(),
  assignedStudentId: string().nullable().optional(),
  assignedPen: string().max(10).nullable().optional(),
  penMatchResult: string().nullable().optional(),
  yearsInEll: string().nullable().optional(),
  mappedSpedCode: string().nullable().optional(),
  mappedAncestryIndicator: string().nullable().optional(),
  mappedFrenchEnrolledProgram: string().nullable().optional(),
  mappedEllEnrolledProgram: string().nullable().optional(),
  mappedLanguageEnrolledProgram: string().nullable().optional(),
  mappedCareerProgram: string().nullable().optional(),
  mappedIndigenousEnrolledProgram: string().nullable().optional(),
  fundingEligibleRefugee: string().nullable().optional(),
  mappedBandCode: string().nullable().optional(),
  mappedCareerProgramCode: string().nullable().optional(),
  mappedSchoolFunding: string().nullable().optional(),
  indProgramEligible: string().nullable().optional(),
  frenchProgramEligible: string().nullable().optional(),
  ellProgramEligible: string().nullable().optional(),
  careerProgramEligible: string().nullable().optional(),
  spedProgramEligible: string().nullable().optional(),
  mappedNoOfCourses: string().nullable().optional(),
  mappedHomelanguageCode: string().nullable().optional(),  
  sdcSchoolCollectionStudentValidationIssues: array().of(object({
    sdcSchoolCollectionStudentValidationIssueID:string().nullable().optional(),
    sdcSchoolCollectionStudentID:string().nullable().optional(),
    validationIssueSeverityCode:string().nullable().optional(),
    validationIssueCode:string().nullable().optional(),
    validationIssueFieldCode:string().nullable().optional()
  }).concat(baseRequestSchema)).nullable().optional(),
  sdcSchoolCollectionStudentEnrolledPrograms: array().of(object({
    sdcSchoolCollectionStudentEnrolledProgramID:string().nullable().optional(),
    sdcSchoolCollectionStudentID:string().nullable().optional(),
    enrolledProgramCode: string().nullable().optional(),
  }).concat(baseRequestSchema)).nullable().optional(),
  schoolName: string().nullable().optional(),
  schoolContactDisplayName:string().nullable().optional()
});

const baseStudentWithEnrolledProgram = baseStudentSchema.shape({   
  enrolledProgramCodes: array().of(string()).optional(),
  filteredEnrolledProgramCodes: array().of(string()).nullable().optional(),
  numberOfCoursesDec: number().nullable().optional(),
  schoolID: string().nullable().optional(),
  bandCode:string().max(4).nullable().optional(),
  isAdult: string().nullable().optional(),
  isSchoolAged: string().nullable().optional(),
  fte: number().nullable().optional(),
  fteZeroReasonCode: string().max(10).nullable().optional(),
  frenchProgramNonEligReasonCode:string().max(10).nullable().optional(),
  ellNonEligReasonCode:string().max(10).nullable().optional(),
  indigenousSupportProgramNonEligReasonCode:string().max(10).nullable().optional(),
  careerProgramNonEligReasonCode:string().max(10).nullable().optional(),
  specialEducationNonEligReasonCode: string().max(10).nullable().optional(),
  specialEducationCategoryCode: string().max(10).nullable().optional(),
  homeLanguageSpokenCode: string().max(10).nullable().optional(),
  isGraduated: string().nullable().optional(),
  assignedStudentId: string().nullable().optional(),
  assignedPen: string().max(10).nullable().optional(),
  penMatchResult: string().nullable().optional(),
  yearsInEll: string().nullable().optional(),
  mappedSpedCode: string().nullable().optional(),
  mappedAncestryIndicator: string().nullable().optional(),
  mappedFrenchEnrolledProgram: string().nullable().optional(),
  mappedEllEnrolledProgram: string().nullable().optional(),
  mappedLanguageEnrolledProgram: string().nullable().optional(),
  mappedCareerProgram: string().nullable().optional(),
  mappedIndigenousEnrolledProgram: string().nullable().optional(),
  fundingEligibleRefugee: string().nullable().optional(),
  mappedBandCode: string().nullable().optional(),
  mappedCareerProgramCode: string().nullable().optional(),
  mappedSchoolFunding: string().nullable().optional(),
  indProgramEligible: string().nullable().optional(),
  frenchProgramEligible: string().nullable().optional(),
  ellProgramEligible: string().nullable().optional(),
  careerProgramEligible: string().nullable().optional(),
  spedProgramEligible: string().nullable().optional(),
  mappedNoOfCourses: string().nullable().optional(),
  mappedHomelanguageCode: string().nullable().optional(),  
  sdcSchoolCollectionStudentValidationIssues: array().of(object({
    sdcSchoolCollectionStudentValidationIssueID:string().nullable().optional(),
    sdcSchoolCollectionStudentID:string().nullable().optional(),
    validationIssueSeverityCode:string().nullable().optional(),
    validationIssueCode:string().nullable().optional(),
    validationIssueFieldCode:string().nullable().optional()
  }).concat(baseRequestSchema)).nullable().optional(),
  sdcSchoolCollectionStudentEnrolledPrograms: array().of(object({
    sdcSchoolCollectionStudentEnrolledProgramID:string().nullable().optional(),
    sdcSchoolCollectionStudentID:string().nullable().optional(),
    enrolledProgramCode: string().nullable().optional(),
  }).concat(baseRequestSchema)).nullable().optional(),
  schoolName: string().nullable().optional(),
  schoolContactDisplayName:string().nullable().optional()
});

const baseSubmissionSignatureSchema = object({
  sdcDistrictSubmissionSignatureID: string().nullable().optional(),
  sdcDistrictCollectionID: string().nullable().optional(),
  districtSignatoryUserID:string().nullable().optional(),
  districtSignatoryRole:string().nullable().optional(),
  signatureDate:string().nullable().optional(),
}).concat(baseRequestSchema);

const baseDistrictCollectionSchema = object({
  sdcDistrictCollectionID: string().nullable().optional(),
  collectionID: string().nullable().optional(),
  districtID:string().nullable().optional(),
  collectionTypeCode:string().max(10).nullable().optional(),
  sdcDistrictCollectionStatusCode:string().max(10).nullable().optional(),
  collectionOpenDate:string().nullable().optional(),
  collectionCloseDate:string().nullable().optional(),
  submissionDueDate:string().nullable().optional(),
  duplicationResolutionDueDate:string().nullable().optional(),
  signOffDueDate:string().nullable().optional(),
  submissionSignatures: array().of(baseSubmissionSignatureSchema)
}).concat(baseRequestSchema);

const baseSignature = object({
  districtSignatoryRole: string().nonNullable().oneOf([PERMISSION.SUPERINT, PERMISSION.SECR_TRES, PERMISSION.DISTRICT_SDC_EDIT]),
  districtSignatoryUserID: string().nullable().optional(),
}).noUnknown();

const putDistrictCollectionSchema = object({
  body: object({
    districtCollection: baseDistrictCollectionSchema,
    status:string().nullable().optional(),
  }).concat(baseRequestSchema).noUnknown(),
  params: object({
    sdcDistrictCollectionID: string().nonNullable()
  }).noUnknown(),
  query: object().noUnknown(),
}).noUnknown();

const putSchoolCollectionSchema = object({
  body: object({
    sdcSchoolCollectionID: string().nonNullable(),
    collectionID: string().nonNullable(),
    schoolID: string().nonNullable(),
    sdcDistrictCollectionID: string().nullable().optional(),  
    uploadDate: string().nullable().optional(),
    uploadFileName: string().max(255).nullable().optional(),
    uploadReportDate: string().max(8).nullable().optional(),
    collectionTypeCode: string().max(10).nullable().optional(),
    sdcSchoolCollectionStatusCode: string().max(10).nonNullable().optional(),
    collectionOpenDate: string().nullable().optional(),
    collectionCloseDate: string().nullable().optional(),
    students: array().of(baseStudentSchema.shape({    
      enrolledProgramCodes: array().of(string())
    })),
    status: string().nullable().optional() 
  }),
  params: object({
    sdcSchoolCollectionID: string()
  }).noUnknown(),
  query: object().noUnknown(),
}).noUnknown();

const postSdcDistrictSignoffSchema = object({
  body: baseSignature.concat(baseRequestSchema).noUnknown(),
  params: object({
    sdcDistrictCollectionID: string(),
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const putSdcStudentSchema =  object({
  body: baseStudentSchema.shape({    
    enrolledProgramCodes: array().of(string())
  }),
  params: object({
    districtID: string()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const getActiveDataSchema = object({
  body: object().noUnknown(),
  params: object().noUnknown(),
  query: object({
    active: boolean()
  }).noUnknown(),
}).noUnknown();

const getByDistrictIdSchema = object({
  body: object().noUnknown(),
  params: object({
    districtID: string()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const getBySchoolIdSchema = object({
  body: object().noUnknown(),
  params: object({
    schoolID: string()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const getBySdcDistrictCollectionSchema = object({
  body: object().noUnknown(),
  params: object({
    sdcDistrictCollectionID: string()
  }),
  query: baseQuerySchema
}).noUnknown();

const getBySdcSchoolCollectionSchema = object({
  body: object().noUnknown(),
  params: object({
    sdcSchoolCollectionID: string()
  }).noUnknown(),
  query: baseQuerySchema
}).noUnknown();

const getBySdcSchoolCollectionStudentSchema = object({
  body: object().noUnknown(),
  params: object({
    sdcSchoolCollectionStudentID: string(),
  }).noUnknown(),
  query: baseQuerySchema
}).noUnknown();

const getBySdcDistrictCollectionPaginatedSchema = object({
  body: object().noUnknown(),
  params: object({
    sdcDistrictCollectionID: string()
  }),
  query: object({
    tableFormat:boolean().optional(),
    pageNumber: number().moreThan(-1).integer().optional(),
    pageSize: number().positive().integer().optional(),
    sort: object().optional(),
    searchParams: object().optional()
  })
}).noUnknown();

const getBySdcSchoolCollectionPaginatedSchema = object({
  body: object().noUnknown(),
  params: object({
    sdcSchoolCollectionID: string()
  }),
  query: object({
    tableFormat:boolean().optional(),
    pageNumber: number().moreThan(-1).integer().optional(),
    pageSize: number().positive().integer().optional(),
    sort: object().optional(),
    searchParams: object().optional()
  })
}).noUnknown();

const getPenMatchSchema =  object({
  body: object({
    localID: string().max(12).nullable().optional(),
    givenName: string().max(255).nullable().optional(),
    middleName: string().max(255).nullable().optional(),
    surname: string().max(255).nullable().optional(),
    usualGivenName: string().max(255).nullable().optional(),
    usualMiddleName: string().max(255).nullable().optional(),
    usualSurname: string().max(255).nullable().optional(),
    dob: string().max(8).nullable().optional(),
    postal: string().max(6).nullable().optional(),
    pen:string().max(9).nullable().optional(),
    enrolledGradeCode:string().max(10).nullable().optional(),
    sex: string().max(1).nullable().optional()
  }),
  params: object({
    sdcSchoolCollectionID: string()
  }),
  query: object()
}).noUnknown();

const getSchoolHistoricPaginatedSchema = object({
  body: object().noUnknown(),
  params: object({
    schoolID: string()
  }),
  query: object({
    tableFormat:boolean().optional(),
    pageNumber: number().required().moreThan(-1).integer(),
    pageSize: number().required().positive().integer(),
    sort: object(),
    searchParams: object()
  })
}).noUnknown();

const getDistrictHistoricPaginatedSchema = object({
  body: object().noUnknown(),
  params: object({
    districtID: string()
  }),
  query: object({
    tableFormat:boolean().optional(),
    pageNumber: number().required().moreThan(-1).integer(),
    pageSize: number().required().positive().integer(),
    sort: object(),
    searchParams: object()
  })
}).noUnknown();

const getSchoolReportDownloadSchema =  object({
  body: object().noUnknown(),
  params: object({
    sdcSchoolCollectionID: string().nonNullable(),       
    reportTypeCode: string().nonNullable()
  }),
  query: object()
}).noUnknown();

const getDistrictReportDownloadSchema =  object({
  body: object().noUnknown(),
  params: object({
    sdcDistrictCollectionID: string().nonNullable(), 
    reportTypeCode: string().nonNullable()
  }),
  query: object()
}).noUnknown();



const unsubmitCollectionSchema =  object({
  body: object({    
    sdcSchoolCollectionID: string().nonNullable(),
    updateUser: string()
  }).concat(baseRequestSchema).noUnknown(),
  params: object({
    sdcSchoolCollectionID: string(),
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const zeroEnrollmentSchema =  object({
  body: object({
    sdcSchoolCollectionID: string().nonNullable(),
    updateUser: string()
  }).noUnknown(),
  params: object({
    sdcSchoolCollectionID: string()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const postRemoveStudentFromSchoolCollectionSchema =  object({
  body:array().of(string()).nonNullable(),
  params: object({
    sdcSchoolCollectionID: string().nonNullable()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const postDistrictFileCollectionSchema =  object({
  body:object({
    fileName: string().nonNullable(),
    fileContents: string().nonNullable()
  }).concat(baseRequestSchema).noUnknown(),
  params: object({
    sdcDistrictCollectionID: string().nonNullable()
  }).noUnknown(),
  query: object().noUnknown(),
}).noUnknown();

const postSchoolFileCollectionSchema =  object({
  body:object({
    fileName: string().nonNullable(),
    fileContents: string().nonNullable()
  }).concat(baseRequestSchema).noUnknown(),
  params: object({
    sdcSchoolCollectionID: string().nonNullable()
  }).noUnknown(),
  query: object().noUnknown(),
}).noUnknown();

const postResolveDuplicateSchema = object({
  body: object({
    students: array().of(baseSdcSchoolStudent),
    duplicate: object() //Marked as object to support dynamic naming
  }).concat(baseRequestSchema),
  params: object({
    type: string().nonNullable()
  }),
  query: object(),
}).unknown();

const postMarKDiffSchema = object({
  body: baseStudentWithEnrolledProgram.shape({
    legalMiddleNames: string().max(25).nullable().optional(), 
    usualMiddleNames: string().max(25).nullable().optional(),
    resolution:  string().nullable().optional(),
    canMoveToCrossEnrollment: boolean().nullable().optional(),
    canChangeGrade: boolean().nullable().optional(),
    schoolName:  string().nullable().optional(),
    districtName:  string().nullable().optional(),
    schoolNameNoLink:string().nullable().optional(),
    contactInfo:string().nullable().optional(),
    schoolContactDisplayName:string().nullable().optional()
  }).concat(baseRequestSchema).noUnknown(),
  params: object({
    sdcDuplicateID: string().nonNullable(),
    type: string().nonNullable()
  }),
  query: object(),
}).noUnknown();

const postStartFromPriorCollectionSchema = object({
  body: baseSdcSchoolStudent.shape({
    updateUser: string(), 
    sdcSchoolCollectionID: string().nonNullable(),
  }).concat(baseRequestSchema),
  params: object({
    sdcSchoolCollectionID: string().nonNullable()
  }),
  query: object(),
}).unknown();

const getSdcDistrictUsersSchema = object({
  body: object().noUnknown(),
  params: object({
    sdcDistrictCollectionID: string().nonNullable()
  }),
  query: object({
    digitalId: string().nullable().optional(),
    schoolID: string().nullable().optional(),
    firstName: string().nullable().optional(),
    lastName: string().nullable().optional(),
    districtID: string().nullable().optional()
  }).noUnknown(),
}).noUnknown();


module.exports = {
  putSdcStudentSchema,
  putDistrictCollectionSchema,
  putSchoolCollectionSchema,
  getActiveDataSchema,
  getByDistrictIdSchema,
  getBySchoolIdSchema,
  getBySdcDistrictCollectionSchema,
  getBySdcSchoolCollectionSchema,    
  getBySdcSchoolCollectionStudentSchema,
  getBySdcDistrictCollectionPaginatedSchema,
  getBySdcSchoolCollectionPaginatedSchema,
  getPenMatchSchema,
  getSchoolHistoricPaginatedSchema,
  getDistrictHistoricPaginatedSchema,
  getSchoolReportDownloadSchema,
  getDistrictReportDownloadSchema,  
  unsubmitCollectionSchema,
  zeroEnrollmentSchema,
  removeStudentFromSchoolCollectionSchema: postRemoveStudentFromSchoolCollectionSchema,      
  districtSignoffSchema: postSdcDistrictSignoffSchema,
  districtFileCollectionSchema: postDistrictFileCollectionSchema,
  schoolFileCollectionSchema: postSchoolFileCollectionSchema,
  resolveDuplicateSchema: postResolveDuplicateSchema,
  markDiffSchema: postMarKDiffSchema,
  startFromPriorCollectionSchema: postStartFromPriorCollectionSchema,
  getSdcDistrictUsersSchema,
  baseSdcSchoolStudent
};

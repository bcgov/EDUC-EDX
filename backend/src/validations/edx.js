const { object, string, array, number, date, lazy } = require('yup');
const { baseRequestSchema } = require('./base');

const exchangeDocumentSchema = object({
  documentTypeCode: string().max(10).nonNullable(),
  fileName: string().max(255).nonNullable(),
  fileExtension: string().max(255).nonNullable(),
  documentData: string().nonNullable(),
  fileSize: number().positive()
}).noUnknown();

const exchangeCommentSchema = object({
  edxUserID: string().nullable().optional(),
  commentUserName: string().max(255).nonNullable().optional(),
  content: string().nonNullable()
}).noUnknown();

const exchangeStudentSchema = object({
  studentID: string().nonNullable(),
  pen: string().max(255).nonNullable()
}).noUnknown();

const postExchangeSchema = object({
  body: object({
    ministryOwnershipTeamID: string(),
    reviewer: string().nullable().max(255),
    subject: string().nonNullable().max(4000),
    content: string().nonNullable(),
    secureExchangeDocuments: array().of(exchangeDocumentSchema),
    secureExchangeStudents: array().of(exchangeStudentSchema)
  }).concat(baseRequestSchema).noUnknown(),
  params: object().noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const postExchangeDocumentSchema = object({
  body: exchangeDocumentSchema,
  params: object({
    id: string().nonNullable()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const postExchangeStudentSchema = object({
  body: object({
    studentID: string()
  }).noUnknown(),
  params: object({
    id: string()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const postExchangeCommentSchema = object({
  body: exchangeCommentSchema.noUnknown(),
  params: object({
    id: string()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const deleteExchangeDocumentSchema = object({
  body: object().noUnknown(),
  params: object({
    id: string().nonNullable(),
    documentId: string().nonNullable()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const deleteExchangeStudentSchema = object({
  body: object().noUnknown(),
  params: object({
    id: string().nonNullable(),
    studentID: string().nonNullable()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const putExchangeMarkAsSchema = object({
  body: object().noUnknown(),
  params: object({
    id: string().nonNullable(),
    readStatus: string().nonNullable()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const getByExchangeIdSchema = object({
  body: object().noUnknown(),
  params: object({
    id: string()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const getExchangePaginatedSchema = object({
  body: object().noUnknown(),
  params: object().noUnknown(),
  query: object({
    pageNumber: number().required().moreThan(-1).integer(),
    pageSize: number().required().positive().integer(),
    sort: object({
      createDate: string().matches(/(ASC|DESC)/),
      updateDate: string().matches(/(ASC|DESC)/),
    }),
    searchParams: object({
      ministryOwnershipTeamID: string().nullable().optional(),
      subject: string().nullable().optional(),
      createDate: date().nullable().optional(),
      secureExchangeStatusCode: array().of(string()).optional(),
      sequenceNumber: number().nullable().optional(),
      studentPEN: string().nullable().optional()
    }),
  }).noUnknown()
}).noUnknown();

const getExchangeCountSchema = object({
  body: object().noUnknown(),
  params: object(),
  query: object({
    pageNumber: number().required().moreThan(-1).integer(),
    pageSize: number().required().positive().integer(),
    sort: lazy((value) =>
      typeof value === 'object'
        ? object().nullable()
        : string().nullable()
    ).optional(),
    searchParams: object().nullable().optional()
  })
}).noUnknown();

const getExchangeDocumentSchema = object({
  body: object().noUnknown(),
  params: object({
    id: string().nonNullable(),
    documentId: string().nonNullable(),
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const getDownloadExchangeDocumentSchema = object({
  body: object().noUnknown(),
  params: object({
    id: string().nonNullable(),
    documentId: string().nonNullable(),
    fileName: string().nonNullable()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();


const userInviteSchema = object({
  firstName: string().max(255).nonNullable(),
  lastName: string().max(255).nonNullable(),
  email: string().max(255).nonNullable(),
  edxActivationRoleCodes: array().of(string()),
  edxUserExpiryDate: string().nullable().optional()
}).noUnknown();

const postDistrictUserInviteSchema = object({
  body: userInviteSchema.shape({
    districtName: string().nonNullable(),
    districtCode: string().nullable().optional(), 
    districtID: string().nonNullable()
  }).noUnknown(),
  params: object().noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const postSchoolUserInviteSchema = object({
  body: userInviteSchema.shape({
    schoolName: string().nonNullable(),
    schoolID: string().nonNullable()
  }).noUnknown(),
  params: object().noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const getUserActivationSchema = object({
  body: object().noUnknown(),
  params: object({
    instituteType: string().oneOf(['SCHOOL', 'DISTRICT']),
    instituteIdentifier: string()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const postUserActivationSchema = object({
  body: object({
    mincode: string().nonNullable(),
    primaryEdxCode: string().nonNullable(),
    personalActivationCode: string().nonNullable
  }),
  params: object().noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const postPrimaryUserActivationSchema = object({
  body: object({
    schoolID: string().nullable().optional(),
    districtID: string().nullable().optional(),
  }).concat(baseRequestSchema).noUnknown(),
  params: object({
    instituteType: string(),
    instituteIdentifier: string()
  }).noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const postInstituteSelectionSchema = object({
  body: object({
    params: object(),
  }).noUnknown(),
  params: object().noUnknown(),
  query: object().noUnknown(),
}).noUnknown();

const postDistrictSchoolSchema = object({
  body: object({
    params: object({
      districtID: string().nonNullable().optional(),
      edxUserID: string().nonNullable().optional(),
      expiryDate: string().nullable().optional(),
      selectedRoles: array().of(string())
    }).noUnknown(),
  }).noUnknown(),
  params: object().noUnknown(),
  query: object().noUnknown(),
}).noUnknown();

const postUserSchoolSchema = object({
  body: object({
    params: object({
      edxUserSchoolID: string().nonNullable().optional(),
      edxUserID: string().nonNullable().optional(),
      schoolID: string().nonNullable().optional(),
      expiryDate: string().nullable().optional(),
      selectedRoles: array().of(string())
    }).noUnknown(),
  }).noUnknown(),
  params: object().noUnknown(),
  query: object().noUnknown(),
}).noUnknown();

const getUserSchoolSchema = object({
  body: object().noUnknown(),
  params: object().noUnknown(),
  query: object({
    permissionCode: string().nullable().optional()
  }).noUnknown(),
}).noUnknown();

const getUserRoleSchema = object({
  body: object().noUnknown(),
  params: object().noUnknown(),
  query: object({
    instituteType: string().nullable().optional()
  }).noUnknown(),
}).noUnknown();

const getUserSchema = object({
  body: object().noUnknown(),
  params: object().noUnknown(),
  query: object({
    digitalId: string().nullable().optional(),
    schoolID: string().nullable().optional(),
    firstName: string().nullable().optional(),
    lastName: string().nullable().optional(),
    districtID: string().nullable().optional()
  }).noUnknown(),
}).noUnknown();

const getDistrictUsersSchema = object({
  body: object().noUnknown(),
  params: object().noUnknown(),
  query: object({
    districtID: string().nullable().optional()
  }).noUnknown(),
}).noUnknown();

const userRelinkSchema = object({
  userToRelink: string().nonNullable(),
  edxUserExpiryDate: string().nullable().optional(),
});

const districtUserIdSchema = object({
  districtID: string().nonNullable().optional(),
  edxUserDistrictID: string().nonNullable().optional(),
});

const schoolUserIdSchema = object({
  schoolID: string().nonNullable().optional(),
  userSchoolID: string().nonNullable().optional(),
});

const postUserRelinkSchema = object({
  body: object({
    params: userRelinkSchema.concat(districtUserIdSchema).concat(schoolUserIdSchema).noUnknown(),
  }).noUnknown(),
  params: object().noUnknown(),
  query: object().noUnknown()
}).noUnknown();

const userRemoveSchema = object({
  userToRemove: string().nonNullable(),
});

const postUserRemoveSchema = object({
  body: object({
    params: userRemoveSchema.concat(districtUserIdSchema).concat(schoolUserIdSchema).noUnknown(),
  }).noUnknown(),
  params: object().noUnknown(),
  query: object().noUnknown()
}).noUnknown();

module.exports = {
  exchangeSchema: postExchangeSchema,
  exchangeDocumentSchema: postExchangeDocumentSchema,
  exchangeStudentSchema: postExchangeStudentSchema,
  exchangeCommentSchema: postExchangeCommentSchema,
  deleteExchangeDocumentSchema,
  deleteExchangeStudentSchema,
  putExchangeMarkAsSchema,
  getByExchangeIdSchema,
  getExchangePaginatedSchema,
  getExchangeCountSchema,
  getExchangeDocumentSchema,
  getDownloadExchangeDocumentSchema,
  districtUserInviteSchema: postDistrictUserInviteSchema,
  schoolUserInviteSchema: postSchoolUserInviteSchema,
  getUserActivationSchema,
  userActivationSchema: postUserActivationSchema,
  primaryUserActivationSchema: postPrimaryUserActivationSchema,
  instituteSelectionSchema: postInstituteSelectionSchema,
  districtSchoolSchema: postDistrictSchoolSchema,
  userSchoolSchema: postUserSchoolSchema,
  getUserRoleSchema,
  getUserSchema,
  getDistrictUsersSchema,
  getUserSchoolSchema,
  userRelinkSchema: postUserRelinkSchema,
  userRemoveSchema: postUserRemoveSchema  
};

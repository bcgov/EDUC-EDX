const { object, string, number, boolean, array} = require('yup');
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
  query: object({
    fileOverride: boolean().optional()
  })
}).noUnknown();

const gradDistrictFileUploadSchema =  object({
  body:object({
    fileName: string().nonNullable(),
    fileContents: string().nonNullable(),
    fileType: string().nonNullable()
  }).concat(baseRequestSchema).noUnknown(),
  params: object({
    districtID: string().nonNullable()
  }).noUnknown(),
  query: object({
    fileOverride: boolean().optional()
  })
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
    searchParams: object().optional(),
    schoolID: string().optional(),
    districtID: string().optional(),
  })
}).noUnknown();

const gradSchoolFilesetPaginatedSchema = object({
  body: object().noUnknown(),
  params: object({
    schoolID: string()
  }),
  query: object({
    pageNumber: number().moreThan(-1).integer().optional(),
    pageSize: number().positive().integer().optional(),
    sort: object().optional(),
    searchParams: object().optional()
  })
}).noUnknown();

const gradSchoolFilesetMetricSchema = object({
  body: object().noUnknown(),
  params: object({
    schoolID: string()
  }),
  query: object({

  })
}).noUnknown();

const gradSchoolPenFilesetPaginatedSchema = object({
  body: object().noUnknown(),
  params: object({
    schoolID: string(),
    pen: string()
  }),
  query: object({
    pageNumber: number().moreThan(-1).integer().optional(),
    pageSize: number().positive().integer().optional(),
    sort: object().optional(),
    searchParams: object().optional()
  })
}).noUnknown();

const gradDistrictPenFilesetPaginatedSchema = object({
  body: object().noUnknown(),
  params: object({
    districtID: string(),
    pen: string()
  }),
  query: object({
    pageNumber: number().moreThan(-1).integer().optional(),
    pageSize: number().positive().integer().optional(),
    sort: object().optional(),
    searchParams: object().optional()
  })
}).noUnknown();

const gradDistrictFilesetPaginatedSchema = object({
  body: object().noUnknown(),
  params: object({
    districtID: string()
  }),
  query: object({
    pageNumber: number().moreThan(-1).integer().optional(),
    pageSize: number().positive().integer().optional(),
    sort: object().optional(),
    searchParams: object().optional()
  })
}).noUnknown();

const gradSchoolFilesetByPenSchema = object({
  body: object().noUnknown(),
  params: object({
    schoolID: string(),
    pen: string()
  }),
  query: object({
    incomingFilesetID: string().optional()
  })
}).noUnknown();

const gradDistrictFilesetByPenSchema = object({
  body: object().noUnknown(),
  params: object({
    districtID: string(),
    pen: string()
  }),
  query: object({
    incomingFilesetID: string().optional()
  })
}).noUnknown();

const gradProcessSchoolSummerStudentsSchema =  object({
  body:object({
    fileName: string().nonNullable(),
    summerStudents: array().of(object({
      schoolCode: string().nonNullable(),
      pen: string().nonNullable(),
      legalSurname: string().nonNullable(),
      legalMiddleName: string().nullable(),
      legalFirstName: string().nullable(),
      dob: string().nullable(),
      studentGrade: string().nullable(),
      course: string().nullable(),
      sessionDate: string().nullable(),
      finalPercent: string().nullable(),
      finalLetterGrade: string().nullable(),
      noOfCredits: string().nullable(),
    }))
  }).concat(baseRequestSchema).noUnknown(),
  params: object({
    schoolID: string().nonNullable()
  }).noUnknown()
}).noUnknown();

const gradProcessDistrictSummerStudentsSchema =  object({
  body:object({
    fileName: string().nonNullable(),
    summerStudents: array().of(object({
      schoolCode: string().nonNullable(),
      pen: string().nonNullable(),
      legalSurname: string().nonNullable(),
      legalMiddleName: string().nullable(),
      legalFirstName: string().nullable(),
      dob: string().nullable(),
      studentGrade: string().nullable(),
      course: string().nullable(),
      sessionDate: string().nullable(),
      finalPercent: string().nullable(),
      finalLetterGrade: string().nullable(),
      noOfCredits: string().nullable(),
    }))
  }).concat(baseRequestSchema).noUnknown(),
  params: object({
    districtID: string().nonNullable()
  }).noUnknown()
}).noUnknown();

module.exports = {
  gradFileUploadSchema,
  gradDistrictFilesetPaginatedSchema,
  gradErrorFilesetStudentPaginatedSchema,
  gradSchoolFilesetPaginatedSchema,
  gradDistrictFileUploadSchema,
  gradSchoolPenFilesetPaginatedSchema,
  gradSchoolFilesetByPenSchema,
  gradDistrictFilesetByPenSchema,
  gradDistrictPenFilesetPaginatedSchema,
  gradSchoolFilesetMetricSchema,
  gradProcessSchoolSummerStudentsSchema,
  gradProcessDistrictSummerStudentsSchema
};

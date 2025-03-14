const { object, string, number, boolean} = require('yup');
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
    searchParams: object().optional()
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

module.exports = {
  gradFileUploadSchema,
  gradDistrictFilesetPaginatedSchema,
  gradErrorFilesetStudentPaginatedSchema,
  gradSchoolFilesetPaginatedSchema,
  gradDistrictFileUploadSchema,
  gradSchoolPenFilesetPaginatedSchema,
  gradSchoolFilesetByPenSchema,
  gradDistrictFilesetByPenSchema,
  gradDistrictPenFilesetPaginatedSchema
};

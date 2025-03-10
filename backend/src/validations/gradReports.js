const { object, string } = require('yup');

const gradReportDownloadSchema = object({
    body: object().noUnknown(),
    params: object({
        schoolID: string().nullable(),
        districtID: string().nullable()
    }).noUnknown(),
    query: object({
        pen: string().nullable()
    }),
}).noUnknown()

module.exports = {
    gradReportDownloadSchema
};

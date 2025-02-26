const { object, string } = require('yup');

const gradReportDownloadSchema = object({
    body: object().noUnknown(),
    params: object().noUnknown(),
    query: object({
        pen: string().nullable()
    }),
}).noUnknown()

module.exports = {
    gradReportDownloadSchema
};

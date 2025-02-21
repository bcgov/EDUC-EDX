'use strict';
const { getAccessToken, handleExceptionResponse, getBinaryData } = require('./utils');
const HttpStatus = require('http-status-codes');
const log = require('./logger');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');

async function downloadStudentGradReport(req, res, docType) {
    try {
        const token = getAccessToken(req);
        const correlationID = uuidv4();
        let url;
        let fileName;

        const formattedDate = getFormattedDate();
        const pen = req.query.pen;

        if (docType === 'transcript') {
            url = config.get('gradReports:rootURL') + '/studentcredential/' + pen + '/type/TRAN';
            fileName = `${pen}_Transcript_${formattedDate}.pdf`;
        } else if (docType === 'xml') {
            url = config.get('gradReports:rootURL') + '/studenttranscript/' + pen + '?type=xml';
            fileName = `${pen}_XML_${formattedDate}.pdf`;
        } else if (docType === 'tvr') {
            url = config.get('gradReports:rootURL') + '/studentcredential/' + pen + '/type/ACHV';
            fileName = `${pen}_TVR_${formattedDate}.pdf`;
        } else {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid docType' });
        }

        const result = await getBinaryData(token, url, correlationID);

        // EDUC-GRAD-BUSINESS-API returns a 204 if a record is not found in their db
        if (result.status === 204) {
            return res.status(HttpStatus.NOT_FOUND).json({ message: 'Report not found for this PEN.' });
        }

        const contentType = result.headers?.['content-type'] || 'application/pdf';
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', contentType);
        const buffer = Buffer.from(result.data);
        return res.status(HttpStatus.OK).send(buffer);

    } catch (e) {
        log.error('Error getting report', e.stack);
        return handleExceptionResponse(e, res);
    }
}

function getFormattedDate() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    return month + day + year;
}


module.exports = {
    downloadStudentGradReport
};
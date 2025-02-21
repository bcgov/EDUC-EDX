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

        if(!isValidPEN(pen)){
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid PEN format.' });
        }

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

function isValidPEN(pen) {
    if (typeof pen !== 'string' || pen.length !== 9) {
        return false;
    }

    if (!/^\d{9}$/.test(pen)) {
        return false;
    }

    return checkDigit(pen);
}

function checkDigit(pen) {
    const penDigits = [];

    for (let i = 0; i < 9; i++) { // Use 9, not pen.length
        penDigits[i] = parseInt(pen.charAt(i), 10);
    }
    const S1 = penDigits.slice(0,-1).filter((element,index) => {return index % 2 === 0;}).reduce((a,b) => a+b,0);
    const A = parseInt(penDigits.slice(0,-1).filter((element,index) => {return index % 2 === 1;}).join(''), 10);
    const B = 2 * A;
    let S2 = B.toString().split('').map(Number).reduce(function (a, b) {return a + b;}, 0);
    const S3 = S1 + S2;
    if((S3 % 10) === 0) {
        return penDigits.pop() === 0;
    }
    return penDigits.pop() === (10 - (S3%10));
}

module.exports = {
    downloadStudentGradReport
};
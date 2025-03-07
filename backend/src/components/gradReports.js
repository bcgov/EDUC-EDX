'use strict';
const { getAccessToken, handleExceptionResponse, getBinaryData } = require('./utils');
const HttpStatus = require('http-status-codes');
const log = require('./logger');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');
const {getSchoolBySchoolID, getDistrictByDistrictID} = require("./cache-service");

async function handleReportDownload(req, res, reportType) {
    try {
        const token = getAccessToken(req);
        const correlationID = uuidv4();
        const formattedDate = getFormattedDate();
        const docType = req.query.docType;

        if (!docType) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'docType query parameter is required.' });
        }

        let url;
        let fileName;
        let notFoundMessage;

        if (reportType === 'student') {
            const pen = req.query.pen;
            if (!isValidPEN(pen)) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid PEN format.' });
            }

            switch (docType) {
                case 'transcript':
                    url = `${config.get('gradReports:rootURL')}/studentcredential/${pen}/type/TRAN`;
                    fileName = `${pen}_Transcript_${formattedDate}.pdf`;
                    break;
                case 'xml':
                    url = `${config.get('gradReports:rootURL')}/studenttranscript/${pen}?type=xml`;
                    fileName = `${pen}_XML_${formattedDate}.pdf`;
                    break;
                case 'tvr':
                    url = `${config.get('gradReports:rootURL')}/studentcredential/${pen}/type/ACHV`;
                    fileName = `${pen}_TVR_${formattedDate}.pdf`;
                    break;
                default:
                    return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid docType' });
            }
            notFoundMessage = 'Report not found for this PEN.';
        } else if (reportType === 'summary') {
            const instituteMincode = req.params.schoolID ? getSchoolBySchoolID(req.params.schoolID)?.mincode : getDistrictByDistrictID(req.params.districtID).districtNumber;
            const instituteType = req.params.schoolID ? "school" : "district";

            if (!instituteMincode) {
                return res.status(HttpStatus.NOT_FOUND).json({ message: 'Institute not found with this ID.' });
            }

            url = `${config.get('gradReports:summaryURL')}/${instituteType}/report/${instituteMincode}?type=`;

            switch (docType) {
                case 'graduated':
                    url += 'GRADREG';
                    fileName = `${instituteMincode}_GraduatedSummary_${formattedDate}.pdf`;
                    break;
                case 'nongraduated':
                    url += 'NONGRADREG';
                    fileName = `${instituteMincode}_NotGraduatedSummary_${formattedDate}.pdf`;
                    break;
                case 'historicalGraduated':
                    url += 'GRADREGARC';
                    fileName = `${instituteMincode}_HistoricalGraduatedSummary_${formattedDate}.pdf`;
                    break;
                case 'historicalNongraduated':
                    url += 'NONGRADREGARC';
                    fileName = `${instituteMincode}_HistoricalNotGraduatedSummary_${formattedDate}.pdf`;
                    break;
                case 'yearEnd':
                    url += 'DISTREP_YE_SD';
                    fileName = `${instituteMincode}_YearEnd_${formattedDate}.pdf`;
                    break;
                default:
                    return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid docType' });
            }
            notFoundMessage = 'Report not found for school.';
        } else if (reportType === 'tvr') {
            const schoolMincode = getSchoolBySchoolID(req.params.schoolID)?.mincode;
            if (!schoolMincode) {
                return res.status(HttpStatus.NOT_FOUND).json({ message: 'School not found for this schoolID.' });
            }
            url = `${config.get('gradReports:rootURL')}/amalgamated/schoolreport/${schoolMincode}?type=`;

            switch (docType) {
                case 'graduating':
                    url += 'TVRGRAD';
                    fileName = `${schoolMincode}_TranscriptVerificationGraduatingSummaryReport_${formattedDate}.pdf`;
                    break;
                case 'nonGraduating':
                    url += 'TVRNONGRAD';
                    fileName = `${schoolMincode}_TranscriptVerificationNonGraduatingSummaryReport_${formattedDate}.pdf`;
                    break;
                default:
                    return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid docType' });
            }
            notFoundMessage = 'Report not found for school.';
        }
        else {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid reportType' });
        }

        const result = await getBinaryData(token, url, correlationID);

        if (result.status === 204) {
            return res.status(HttpStatus.NOT_FOUND).json({ message: notFoundMessage });
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

async function downloadStudentGradReport(req, res) {
    return handleReportDownload(req, res, 'student');
}

async function downloadSummaryGradReport(req, res) {
    return handleReportDownload(req, res, 'summary');
}
async function downloadTVRSummary(req,res){
    return handleReportDownload(req, res, 'tvr');
}

function getFormattedDate() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    return `${month}${day}${year}`;
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

    for (let i = 0; i < 9; i++) {
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
    downloadStudentGradReport,
    downloadSummaryGradReport,
    downloadTVRSummary
};
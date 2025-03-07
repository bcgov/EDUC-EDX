'use strict';

import ApiService from "../../common/apiService";
import {ApiRoutes, MINISTRY_NAME} from "../constants";
import {appStore} from "../../store/modules/app";

export function generateGradStartAndEndDateStrings(){
    let currentYr = new Date().getFullYear();
    let currentMo = new Date().getMonth();
    const startMonth = 'October';
    const endMonth = 'September';

    let dates = [];

    if (currentMo < 9){
        dates.push(startMonth + ' ' + (currentYr - 1).toString());
        dates.push(endMonth + ' ' + (currentYr).toString());
        dates.push(startMonth + ' ' + (currentYr - 2).toString());
        dates.push(endMonth + ' ' + (currentYr - 1).toString());
    } else {
        dates.push(startMonth + ' ' + (currentYr).toString());
        dates.push(endMonth + ' ' + (currentYr + 1).toString());
        dates.push(startMonth + ' ' + (currentYr - 1).toString());
        dates.push(endMonth + ' ' + (currentYr - 2).toString());
    }

    return dates;
}

export function getTodayFormattedDate() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();

    return month + day + year;
}

async function downloadGradReportFile(response, schoolID, docTypeFilename, formattedDate) {
    const contentDisposition = response.headers['content-disposition'];
    const store = appStore();
    const schoolMincode = store.activeSchoolsMap.get(schoolID)?.mincode;

    let filename = `${schoolMincode}_${docTypeFilename}_${formattedDate}`;
    if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
        }
    }
    filename = filename.replace(/\s/g, '');

    const blob = response.data;
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
}

export async function fetchAndDownloadGradReport(context, schoolID, reportType, baseUrl, docTypeFilename, docTypeName, isSummary = true) {
    context.isLoading = true;
    const url = `${baseUrl}/school/${schoolID}/${isSummary ? 'summary' : 'tvr'}`;
    const formattedDate = getTodayFormattedDate();

    try {
        const response = await ApiService.apiAxios.get(url, {
            params: { docType: reportType },
            responseType: 'blob'
        });

        await downloadGradReportFile(response, schoolID, docTypeFilename, formattedDate);

        let successMsg = `${docTypeName} downloaded for school`;
        context.setSuccessAlert(successMsg);

    } catch (error) {
        console.error("Error downloading file:", error);
        let errorMsg;

        if (error.code === "ERR_BAD_REQUEST") {
            errorMsg = `${docTypeName} not found for school`;
        } else {
            errorMsg = "Error encountered while attempting to retrieve document";
        }

        context.setFailureAlert(errorMsg);
    } finally {
        context.isLoading = false;
    }
}

export async function searchStudentByPen(context, pen, onSuccess) {
    try {
        const response = await ApiService.apiAxios.get(ApiRoutes.studentRequest.SEARCH_URL + "search-grad-pen", {
            params: {
                pen: pen
            }
        });

        const studentData = {
            pen: response.data.pen,
            studentID: response.data.studentID,
            fullName: response.data.firstName + ' ' + (response.data.middleName ?? '') + ' ' + response.data.lastName,
            localID: response.data.localID,
            gender: response.data.gender,
            dob: response.data.doB
        };

        if (onSuccess && typeof onSuccess === 'function') {
            onSuccess(studentData);
        }

    } catch (error) {
        if (error?.response?.data?.message) {
            context.setFailureAlert(error.response.data.message);
        } else {
            context.setFailureAlert(`PEN must be a valid PEN associated with a student at the ${MINISTRY_NAME}`);
        }
    }
}

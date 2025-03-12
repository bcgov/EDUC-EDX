'use strict';

import ApiService from '../../common/apiService';
import {ApiRoutes, MINISTRY_NAME} from '../constants';

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

async function downloadGradReportFile(response) {
  const blob = response.data;
  const blobURL = window.URL.createObjectURL(blob);

  const newTab = window.open(blobURL, '_blank');
  if (newTab) {
    newTab.focus();
  } else {
    alert('Please allow pop-ups for this site to view the report.');
  }
}

export async function fetchAndDownloadGradReport(context, instituteID, reportType, docTypeFilename, docTypeName, isSchool, isSummary = true) {
  context.isLoading = true;
  const instituteType = isSchool ? 'school' : 'district';
  const url = `${ApiRoutes.gradReports.BASE_URL}/${instituteType}/${instituteID}/${isSummary ? 'summary' : 'tvr'}`;

  try {
    const response = await ApiService.apiAxios.get(url, {
      params: { docType: reportType },
      responseType: 'blob'
    });

    await downloadGradReportFile(response);

    let successMsg = `${docTypeName} opened for ${instituteType}`;
    context.setSuccessAlert(successMsg);

  } catch (error) {
    console.error('Error downloading file:', error);
    let errorMsg;

    if (error.code === 'ERR_BAD_REQUEST') {
      errorMsg = `${docTypeName} not found for ${instituteType}`;
    } else {
      errorMsg = 'Error encountered while attempting to retrieve document';
    }

    context.setFailureAlert(errorMsg);
  } finally {
    context.isLoading = false;
  }
}

export async function searchStudentByPen(context, pen, onSuccess) {
  try {
    const response = await ApiService.apiAxios.get(ApiRoutes.studentRequest.SEARCH_URL + 'search-grad-pen', {
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

export function docTypeFilename(summaryDownloadType) {
  switch(summaryDownloadType){
  case 'graduating': return 'TranscriptVerificationGraduatingSummaryReport';
  case 'nonGraduating': return 'TranscriptVerificationNonGraduatingSummaryReport';
  case 'graduated': return 'GraduatedSummary';
  case 'nonGraduated': return 'NotGraduatedSummary';
  case 'historicalGraduated': return 'HistoricalGraduatedSummary';
  case 'historicalNonGraduated': return 'HistoricalNotGraduatedSummary';
  case 'transcript': return 'Transcript';
  case 'xml': return 'XML';
  case 'tvr': return 'TVR';
  default: return '';
  }
}

export function docTypeName(summaryDownloadType) {
  switch (summaryDownloadType) {
  case 'graduating': return 'TVRs for graduating students';
  case 'nonGraduating': return 'TVRs for non-graduating students';
  case 'graduated': return 'Graduated Students Summary';
  case 'nonGraduated': return 'Not Yet Graduated Students Summary';
  case 'historicalGraduated': return 'Historical Graduated Students Summary';
  case 'historicalNonGraduated': return 'Historical Not Yet Graduated Students Summary';
  default: return '';
  }
}

'use strict';

import ApiService from '../../common/apiService';
import { ApiRoutes } from '../constants';
import { downloadBlobResponse } from '../file';

export async function downloadCurrentStudentsCsv(context, schoolID, moreFilters = {}) {
  const url = `${ApiRoutes.gdc.BASE_URL}/school/${schoolID}/current-students/download`;

  try {
    const response = await ApiService.apiAxios.get(url, {
      params: {
        searchParams: {
          moreFilters
        }
      },
      responseType: 'blob'
    });
    downloadBlobResponse(response, 'current-students.csv');
  } catch (error) {
    console.error('Error downloading current students CSV:', error);
    context.setFailureAlert('Error encountered while attempting to retrieve current students CSV.');
  }
}

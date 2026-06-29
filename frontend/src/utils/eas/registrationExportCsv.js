'use strict';

import ApiService from '../../common/apiService';
import { ApiRoutes } from '../constants';
import { setFailureAlert } from '../../components/composable/alertComposable';
import { downloadBlobResponse } from '../file';

export async function downloadRegistrationExportCsv(moreFilters = {}) {
  const url = `${ApiRoutes.assessments.ASSESSMENT_REGISTRATIONS}/school/export`;

  try {
    const response = await ApiService.apiAxios.get(url, {
      params: {
        searchParams: {
          moreFilters
        }
      },
      responseType: 'blob'
    });
    downloadBlobResponse(response, 'assessment-registrations.csv');
  } catch (error) {
    console.error('Error downloading registration export CSV:', error);
    setFailureAlert('An error occurred while trying to export registrations. Please try again later.');
  }
}

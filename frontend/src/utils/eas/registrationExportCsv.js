'use strict';

import ApiService from '../../common/apiService';
import { ApiRoutes } from '../constants';
import { setFailureAlert } from '../../components/composable/alertComposable';

function getFilenameFromDisposition(disposition, fallbackFilename) {
  if (!disposition) {
    return fallbackFilename;
  }

  const match = disposition.match(/filename\*?=(?:UTF-8''|")(.*?)(?:"|;|$)/i);
  if (match?.[1]) {
    return decodeURIComponent(match[1]);
  }

  return fallbackFilename;
}

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

    const disposition = response.headers?.['content-disposition'] || response.headers?.['Content-Disposition'];
    const filename = getFilenameFromDisposition(disposition, 'assessment-registrations.csv');
    const blobUrl = window.URL.createObjectURL(response.data);
    const anchor = document.createElement('a');

    anchor.style.display = 'none';
    anchor.href = blobUrl;
    anchor.download = filename;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error downloading registration export CSV:', error);
    setFailureAlert('An error occurred while trying to export registrations. Please try again later.');
  }
}

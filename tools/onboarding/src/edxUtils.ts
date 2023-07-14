import { getData, postData } from './restUtils';

type EdxPrimaryCodePayload = {
  createUser: string;
  updateUser: string;
  schoolID?: string;
  districtID?: string;
};

function createEdxActivationCodePayload(
  instituteTypeCode: InstituteTypeCode,
  instituteID: string
): EdxPrimaryCodePayload {

  const payload: EdxPrimaryCodePayload = {
    createUser: 'ONBOARD',
    updateUser: 'ONBOARD',
  };

  if (instituteTypeCode === 'SCHOOL') {
    payload.schoolID = instituteID;
  } else if (instituteTypeCode === 'DISTRICT') {
    payload.districtID = instituteID;
  }

  return payload;
}

export async function getPrimaryActivationCodeForInstitute(
  instituteTypeCode: InstituteTypeCode,
  instituteId: string
) {
  try {
    const endpoint = '/api/v1/edx/users/activation-code/primary/' + instituteTypeCode + '/' + instituteId;
    const url = `${process.env.EDX_API_BASE_URL}${endpoint}`;
    return await getData<ActivationCodeEntity>(url);
  } catch (e: any) {
    if(e?.response?.status === 404){
      const generateEndpoint = '/api/v1/edx/users/activation-code/primary/' + instituteTypeCode + '/' + instituteId;
      const edxActivationCode = createEdxActivationCodePayload(instituteTypeCode, instituteId);
      const url = `${process.env.EDX_API_BASE_URL}${generateEndpoint}`;
      return postData<ActivationCodeEntity>(url, edxActivationCode);
    }
    throw new Error(`${instituteTypeCode} primary activation code could not be acquired for ID: ${instituteId}`);
  }
}


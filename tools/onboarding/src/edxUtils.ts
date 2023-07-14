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
    const endpoint = 'api/v1/edx/users/activation-code/primary/' + instituteTypeCode + '/' + instituteId;
    const url = `${process.env.EDX_API_BASE_URL}${endpoint}`;
    console.log(process.env.EDX_API_BASE_URL.split('.'));
    console.log(endpoint);
    return await getData<ActivationCodeEntity>(url);
  } catch (e: any) {
    if(e?.response?.status === 404){
      const generateEndpoint = 'api/v1/edx/users/activation-code/primary/' + instituteTypeCode + '/' + instituteId;
      console.log(generateEndpoint);
      const edxActivationCode = createEdxActivationCodePayload(instituteTypeCode, instituteId);
      const url = `${process.env.EDX_API_BASE_URL}${generateEndpoint}`;
      console.log('Create Case');
      return postData<ActivationCodeEntity>(url, edxActivationCode);
    }
    console.log('Total failure');
    throw new Error(`${instituteTypeCode} primary activation code could not be acquired for ID: ${instituteId}`);
  }
}


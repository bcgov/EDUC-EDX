import axios from 'axios';

function setToken(params: any, token: string) {
  if (params) {
    params.headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  } else {
    params = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }
  return params;
}

function logApiError(e: any, functionName: string, message: string) {
  if (message) {
    console.log(message);
  }
  console.log(functionName, ' Error', e.stack);
  if (e.response && e.response.data) {
    console.log(JSON.stringify(e.response.data));
  }
}

export async function getToken(): Promise<string> {
  const params = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  const data = 'grant_type=client_credentials&client_id=' + process.env.SOAM_CLIENT_ID + '&client_secret='
    + process.env.SOAM_CLIENT_SECRET;

  const response = await axios.post<{access_token: string}>(process.env.SOAM_TOKEN_URL, data, params);
  return response.data.access_token;
}

export async function getData<T = any>(url: URL, params: any = {}): Promise<T> {
  try {
    params = setToken(params, await getToken());
    const response = await axios.get(url.href, params);
    return response.data;
  } catch (e: any) {
    logApiError(e, 'getData', 'Error during GET on ' + url);
    throw e;
  }
}

export async function postData<T = any>(url: URL, data: any, params = {}): Promise<T> {
  try {
    params = setToken(params, await getToken());
    const response = await axios.post(url.href, data, params);
    return response.data;
  } catch (e: any) {
    logApiError(e, 'postData', 'Error during POST on ' + url);
    const status = e.response ? e.response.status : 500;
    throw new Error('API POST Error: status=' + status );
  }
}

export async function putData<T = any>(url: URL, data: any, params = {}): Promise<T> {
  try {
    params = setToken(params, await getToken());
    const response = await axios.put(url.href, data, params);
    return response.data;
  } catch (e: any) {
    logApiError(e, 'putData', 'Error during PUT on ' + url);
    const status = e.response ? e.response.status : 500;
    throw new Error('API PUT Error: status=' + status );
  }
}

export async function deleteData(url: URL, params = {}) {
  try {
    params = setToken(params, await getToken());
    const response = await axios.delete(url.href, params);
    return response.data;
  } catch (e: any) {
    logApiError(e, 'deleteData', 'Error during DELETE on ' + url);
    const status = e.response ? e.response.status : 500;
    throw new Error('API DELETE Error: status=' + status );
  }
}


import axios, { AxiosError, AxiosRequestConfig, isAxiosError } from 'axios';

export class RestUtils {
  config: Cypress.PluginConfigOptions;

  constructor(conf:  Cypress.PluginConfigOptions) {
    this.config = conf;
  }

  async getToken(): Promise<string> {
    const params = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const data = 'grant_type=client_credentials&client_id=' + this.config.env.CLIENT_ID + '&client_secret='
    + this.config.env.CLIENT_SECRET;

    const response = await axios.post<{access_token: string}>(this.config.env.TOKEN_URL, data, params);
    return response.data.access_token;
  }

  public async getData<ReturnType = unknown>(url: string, params: AxiosRequestConfig): Promise<ReturnType> {
    try {
      params = this.setToken(await this.getToken(), params);
      const response = await axios.get(url, params);
      return response.data;
    } catch (e) {
      if (isAxiosError(e)) {
        this.logApiError(e, 'getData', 'Error during GET on ' + url);
      }
      throw e;
    }
  }

  async postData<ReturnType = unknown, Data = unknown>(url: string, data: Data, params?: AxiosRequestConfig):
    Promise<ReturnType> {
    try {
      params = this.setToken(await this.getToken(), params);
      const response = await axios.post<ReturnType>(url, data, params);
      return response.data;
    } catch (e) {
      if (isAxiosError(e)) {
        this.logApiError(e, 'postData', 'Error during POST on ' + url);
        const status = e.response ? e.response.status : 500;
        throw new Error('API POST Error: status=' + status );
      } else { throw new Error('API Post Error: ' + e); }
    }
  }

  async putData<ReturnType = unknown, Data = unknown>(url: string, data: Data, params?: AxiosRequestConfig):
    Promise<ReturnType> {
    try {
      params = this.setToken(await this.getToken(), params);
      const response = await axios.put(url, data, params);
      return response.data;
    } catch (e) {
      if (isAxiosError(e)) {
        this.logApiError(e, 'putData', 'Error during PUT on ' + url);
        const status = e.response ? e.response.status : 500;
        throw new Error('API PUT Error: status=' + status );
      } else { throw new Error('API PUT error: ' + e); }
    }
  }

  async deleteData(url: string, params?: AxiosRequestConfig) {
    try {
      params = this.setToken(await this.getToken(), params);
      const response = await axios.delete(url, params);
      return response.data;
    } catch (e) {
      if (isAxiosError(e)) {
        this.logApiError(e, 'deleteData', 'Error during DELETE on ' + url);
        const status = e.response ? e.response.status : 500;
        throw new Error('API DELETE Error: status=' + status );
      }
    }
  }

  private setToken(token: string, params?: AxiosRequestConfig) {
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

  private logApiError(e: AxiosError, functionName: string, message: string) {
    if (message) {
      console.log(message);
    }
    console.log(functionName, ' Error', e.stack);
    if (e.response && e.response.data) {
      console.log(JSON.stringify(e.response.data));
    }
  }
}

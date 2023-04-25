import axios from "axios";

export class RestUtils {
    config: any;

    constructor(conf: any) {
        this.config = conf;
    }

    private async getToken() {
        const params = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        const data = 'grant_type=client_credentials&client_id=' + this.config.env.CLIENT_ID + '&client_secret=' + this.config.env.CLIENT_SECRET;
        const response = await axios.post(this.config.env.TOKEN_URL, data, params);
        return response.data.access_token;
    }

    public async getData(url: string, params: any = {}) {
        try {
            params = this.setToken(params, await this.getToken());
            const response = await axios.get(url, params);
            // console.log('get Data Status', response.status);
            // console.log('get Data StatusText', response.statusText);
            // console.log('get Data Res', minify(response.data));
            return response.data;
        } catch (e: any) {
            this.logApiError(e, 'getData', 'Error during GET on ' + url);
            throw e;
        }
    }

    async postData(url: string, data: any, params = {}) {
        try {
            params = this.setToken(params, await this.getToken());
            const response = await axios.post(url, data, params);
            // console.log('post Data Status', response.status);
            // console.log('post Data StatusText', response.statusText);
            return response.data;
        } catch (e: any) {
            this.logApiError(e, 'postData', 'Error during POST on ' + url);
            const status = e.response ? e.response.status : 500;
            throw new Error('API POST Error: status=' + status );
        }
    }

    async putData(url: string, data: any, params = {}) {
        try {
            params = this.setToken(params, await this.getToken());
            const response = await axios.put(url, data, params);
            // console.log('put Data Status', response.status);
            // console.log('put Data StatusText', response.statusText);
            return response.data;
        } catch (e: any) {
            this.logApiError(e, 'putData', 'Error during PUT on ' + url);
            const status = e.response ? e.response.status : 500;
            throw new Error('API PUT Error: status=' + status );
        }
    }

    async deleteData(url: string, params = {}) {
        try {
            params = this.setToken(params, await this.getToken());
            const response = await axios.delete(url, params);
            // console.log('delete Data Status', response.status);
            // console.log('delete Data StatusText', response.statusText);
            return response.data;
        } catch (e: any) {
            this.logApiError(e, 'deleteData', 'Error during DELETE on ' + url);
            const status = e.response ? e.response.status : 500;
            throw new Error('API DELETE Error: status=' + status );
        }
    }

    private setToken(params: any, token: string) {
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

    private logApiError(e: any, functionName: string, message: string) {
        if (message) {
            console.log(message);
        }
        console.log(functionName, ' Error', e.stack);
        if (e.response && e.response.data) {
            console.log(JSON.stringify(e.response.data));
        }
    }
}
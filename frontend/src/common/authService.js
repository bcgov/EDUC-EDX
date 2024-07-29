import axios from 'axios';
import { AuthRoutes } from '../utils/constants.js';

export default {

  //Retrieves an auth token from the API endpoint
  async getAuthToken() {
    try {
      axios.defaults.headers.common['X-CSRF-TOKEN'] = this.getCSRFValue();
      const response = await axios.get(AuthRoutes.TOKEN);
      return response.data;
    } catch (e) {
      console.log(`Failed to acquire JWT token - ${e}`); // eslint-disable-line no-console
      throw e;
    }
  },

  //Refreshes the users auth token
  async refreshAuthToken(token) {
    try {
      axios.defaults.headers.common['X-CSRF-TOKEN'] = this.getCSRFValue();
      const response = await axios.post(AuthRoutes.REFRESH, {
        refreshToken: token
      });

      if(response && response.data && response.data.error){
        return {error: response.data.error_description};
      }
      
      return response.data;
    } catch (e) {
      console.log(`Failed to refresh JWT token - ${e}`); // eslint-disable-line no-console
      throw e;
    }
  },
  getCSRFValue() {
    if (!document.cookie) {
      return null;
    }

    const xsrfCookies = document.cookie.split(';')
      .map(c => c.trim())
      .filter(c => c.startsWith('_csrf='));

    if (xsrfCookies.length === 0) {
      return null;
    }
    return decodeURIComponent(xsrfCookies[0].split('=')[1]);
  }
};

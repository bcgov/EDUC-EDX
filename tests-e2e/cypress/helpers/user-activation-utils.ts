import { RestUtils } from './rest-utils-ts';

export class UserActivationUtils extends RestUtils {
  config: Cypress.PluginConfigOptions;

  constructor(conf: Cypress.PluginConfigOptions) {
    super(conf);
    this.config = conf;
  }

  async deleteUserActivationCodes(userID: string) {
    const endPoint = `${this.config.env.edx.base_url}/api/v1/edx/users/activation-code/user/${userID}`;
    return await this.deleteData(endPoint);
  }
}

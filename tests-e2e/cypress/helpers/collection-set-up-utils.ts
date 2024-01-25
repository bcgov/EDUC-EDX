import {SchoolCollection, SdcCollectionApiService} from '../services/sdc-collection-api-service';

export class CollectionSetupUtils {

  config: Cypress.PluginConfigOptions;
  sdcCollectionApi: SdcCollectionApiService;

  constructor(conf: Cypress.PluginConfigOptions) {
    this.config = conf;
    this.sdcCollectionApi = new SdcCollectionApiService(this.config);
  }

  async setUpSchoolCollection(schoolCollection: SchoolCollection) {
    return await this.sdcCollectionApi.createSchoolCollection(schoolCollection);
  }
}

import {SchoolCollectionOptions, SdcCollectionApiService} from '../services/sdc-collection-api-service';

export class CollectionSetupUtils {

  config: Cypress.PluginConfigOptions;
  sdcCollectionApi: SdcCollectionApiService;

  constructor(conf: Cypress.PluginConfigOptions) {
    this.config = conf;
    this.sdcCollectionApi = new SdcCollectionApiService(this.config);
  }

  async setUpCollections(schoolCollection: SchoolCollectionOptions) {
    return this.sdcCollectionApi.createCollections(schoolCollection);
  }

  async setUpStudentElls(ells: SdcStudentEll[]) {
    return this.sdcCollectionApi.createSdcStudentElls(ells);
  }
}

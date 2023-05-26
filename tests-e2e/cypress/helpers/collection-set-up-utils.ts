import {SdcCollectionApiService} from "../services/sdc-collection-api-service";

export class CollectionSetupUtils {

    config: Cypress.PluginConfigOptions;
    sdcCollectionApi: any;

    constructor(conf: Cypress.PluginConfigOptions) {
        this.config = conf;
        this.sdcCollectionApi = new SdcCollectionApiService(this.config);
    }

    async setUpSchoolCollection(schoolID: string) {
        await this.sdcCollectionApi.createSchoolCollection(schoolID);
    };
}

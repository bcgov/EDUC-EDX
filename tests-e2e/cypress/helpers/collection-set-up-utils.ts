import {SdcCollectionApiService} from "../services/sdc-collection-api-service";

import {
    InstituteOptions, SchoolOptions,
} from "../services/institute-api-service";
export class CollectionSetupUtils {

    config: Cypress.PluginConfigOptions;
    sdcCollectionApi: any;

    constructor(conf: Cypress.PluginConfigOptions) {
        this.config = conf;
        this.sdcCollectionApi = new SdcCollectionApiService(this.config);
    }

    async setUpSchoolCollection(school: SchoolEntity) {
        await this.sdcCollectionApi.createSchoolCollection(school);
    };
}

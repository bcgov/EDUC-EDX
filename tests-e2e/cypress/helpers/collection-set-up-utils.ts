import {SdcCollectionApiService} from "../services/sdc-collection-api-service";

export class CollectionSetupUtils {

    config: any;
    sdcCollectionApi: any;

    constructor(conf: any) {
        this.config = conf;
        this.sdcCollectionApi = new SdcCollectionApiService(this.config);
    }

    async setUpSchoolCollection(schoolID: string) {
        await this.sdcCollectionApi.createSchoolCollection(schoolID);
    };
}

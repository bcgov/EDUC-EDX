import {SdcCollectionApiService} from "../services/sdc-collection-api-service";

export class CollectionSetupUtils {

    config: any;
    sldCollectionApi: any;

    constructor(conf: any) {
        this.config = conf;
        this.sldCollectionApi = new SdcCollectionApiService(this.config);
    }

    async setUpSchoolCollection(schoolID: string) {
        await this.sldCollectionApi.createSchoolCollection(schoolID);
    };
}

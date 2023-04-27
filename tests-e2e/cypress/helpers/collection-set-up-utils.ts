import {SldCollectionApiService} from "../services/sld-collection-api-service";

export class CollectionSetupUtils {

    config: any;
    sldCollectionApi: any;

    constructor(conf: any) {
        this.config = conf;
        this.sldCollectionApi = new SldCollectionApiService(this.config);
    }

    async setUpSchoolCollection(schoolID: string) {
        await this.sldCollectionApi.createSchoolCollection(schoolID);
    };
}

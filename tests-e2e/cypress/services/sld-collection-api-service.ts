// @ts-ignore
import {LocalDate, LocalDateTime} from '@js-joda/core';
import {RestUtils} from "../helpers/rest-utils-ts";

const COLLECTION_ENDPOINT = '/api/v1/student-data-collection/collection';
const SDC_COLLECTION_ENDPOINT = '/api/v1/student-data-collection/sdcSchoolCollection';
const SDC_COLLECTION_SEARCH_ENDPOINT = '/api/v1/student-data-collection/sdcSchoolCollection/search';
const COLLECTION_SEARCH_ENDPOINT = '/api/v1/student-data-collection/collection/search';

export class SldCollectionApiService {

    config: any;
    restUtils: any;

    constructor(conf: any) {
        this.config = conf;
        this.restUtils = new RestUtils(this.config);
    }

    async createSchoolCollection(schoolID: string){
        console.log('AT createSchoolCollection started');

        let curDate = LocalDateTime.now();
        let curCloseDate = curDate.plusDays(2);

        const urlGetCollections = `${this.config.env.studentDataCollection.base_url}${COLLECTION_SEARCH_ENDPOINT}/EDXAT`;
        const collectionsList = await this.restUtils.getData(urlGetCollections);

        for (const collection of collectionsList) {
            await this.restUtils.deleteData(`${this.config.env.studentDataCollection.base_url}${COLLECTION_ENDPOINT}/` + collection.collectionID);
        }

        const urlGetActiveSdcSchoolCollection = `${this.config.env.studentDataCollection.base_url}${SDC_COLLECTION_SEARCH_ENDPOINT}/` + schoolID;
        try{
            const activeSdcCollection = await this.restUtils.getData(urlGetActiveSdcSchoolCollection);
            await this.restUtils.deleteData(`${this.config.env.studentDataCollection.base_url}${SDC_COLLECTION_ENDPOINT}/` + activeSdcCollection.data.sdcSchoolCollectionID);
        }catch(e: any){
            //This is ok
        }

        const collectionPayload = {
            'createUser': 'EDXAT',
            'updateUser': null,
            'createDate': null,
            'updateDate': null,
            'collectionTypeCode': 'SEPTEMBER',
            'openDate': curDate,
            'closeDate': curCloseDate
        };

        const url = `${this.config.env.studentDataCollection.base_url}${COLLECTION_ENDPOINT}`;
        const newCollection = await this.restUtils.postData(url, collectionPayload);

        const sdcSchoolCollectionPayload = {
            'createUser': 'EDXAT',
            'updateUser': null,
            'createDate': null,
            'updateDate': null,
            'sdcSchoolCollectionID': null,
            'collectionID': newCollection.collectionID,
            'schoolID': schoolID,
            'uploadDate': null,
            'uploadFileName': null,
            'sdcSchoolCollectionStatusCode': 'NEW',
            'collectionTypeCode': 'SEPTEMBER',
            'collectionOpenDate': curDate,
            'collectionCloseDate': curCloseDate
        };
        const urlSdcSchoolCollection = `${this.config.env.studentDataCollection.base_url}${SDC_COLLECTION_ENDPOINT}/` + newCollection.collectionID;
        const schoolCollectionResponse = await this.restUtils.postData(urlSdcSchoolCollection, sdcSchoolCollectionPayload);

        console.log('AT createSchoolCollection completed');
        return schoolCollectionResponse?.sdcSchoolCollectionID;
    }

}


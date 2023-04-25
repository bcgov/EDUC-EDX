// @ts-ignore
import {deleteData, getData, postData, putData} from '../helpers/rest-utils';
import {LocalDate, LocalDateTime} from '@js-joda/core';

const COLLECTION_ENDPOINT = '/api/v1/student-data-collection/collection';
const SDC_COLLECTION_ENDPOINT = '/api/v1/student-data-collection/sdcSchoolCollection';
const SDC_COLLECTION_SEARCH_ENDPOINT = '/api/v1/student-data-collection/sdcSchoolCollection/search';
const COLLECTION_SEARCH_ENDPOINT = '/api/v1/student-data-collection/collection/search';

export class sldCollectionApiService {

    async createSchoolCollection(schoolID: string, config: any){
        console.log('AT createSchoolCollection started');

        let curDate = LocalDateTime.now();
        let curCloseDate = curDate.plusDays(2);

        const urlGetCollections = `${config.env.studentDataCollection.base_url}${COLLECTION_SEARCH_ENDPOINT}/EDXAT`;
        const collectionsList = await getData(urlGetCollections, null, config);

        collectionsList.forEach((collection: any) => {
            deleteData(`${config.env.studentDataCollection.base_url}${COLLECTION_ENDPOINT}/` + collection.collectionID, null, config);
        });

        const urlGetActiveSdcSchoolCollection = `${config.env.studentDataCollection.base_url}${SDC_COLLECTION_SEARCH_ENDPOINT}/` + schoolID;
        try{
            const activeSdcCollection = await getData(urlGetActiveSdcSchoolCollection, null, config);
            await deleteData(`${config.env.studentDataCollection.base_url}${SDC_COLLECTION_ENDPOINT}/` + activeSdcCollection.data.sdcSchoolCollectionID, null, config);
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

        const url = `${config.env.studentDataCollection.base_url}${COLLECTION_ENDPOINT}`;
        const newCollection = await postData(url, collectionPayload, null, config);

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
        const urlSdcSchoolCollection = `${config.env.studentDataCollection.base_url}${SDC_COLLECTION_ENDPOINT}/` + newCollection.collectionID;
        const schoolCollectionResponse = await postData(urlSdcSchoolCollection, sdcSchoolCollectionPayload, null, config);

        console.log('AT createSchoolCollection completed');
        return schoolCollectionResponse?.sdcSchoolCollectionID;
    }

}


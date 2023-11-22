// @ts-ignore
import {LocalDate, LocalDateTime} from '@js-joda/core';
import {RestUtils} from "../helpers/rest-utils-ts";

export interface SchoolCollection {
    school: SchoolEntity,
    loadWithStudentAndValidations: boolean
    seedData?: string
}

const COLLECTION_ENDPOINT = '/api/v1/student-data-collection/collection';
const SDC_COLLECTION_ENDPOINT = '/api/v1/student-data-collection/sdcSchoolCollection';
const SDC_COLLECTION_SEARCH_ENDPOINT = '/api/v1/student-data-collection/sdcSchoolCollection/search';
const COLLECTION_SEARCH_ENDPOINT = '/api/v1/student-data-collection/collection/search';

export class SdcCollectionApiService {

    config: any;
    restUtils: any;

    constructor(conf: any) {
        this.config = conf;
        this.restUtils = new RestUtils(this.config);
    }

    async createSchoolCollection(schoolCollection: SchoolCollection){
        console.log('AT createSchoolCollection started');
        console.log(schoolCollection);
        console.log(schoolCollection.school);

        let curDate = LocalDateTime.now().minusDays(2);
        let curCloseDate = curDate.plusDays(4);

        const urlGetCollections = `${this.config.env.studentDataCollection.base_url}${COLLECTION_SEARCH_ENDPOINT}/EDXAT`;
        const collectionsList = await this.restUtils.getData(urlGetCollections);

        const urlGetActiveSdcSchoolCollection = `${this.config.env.studentDataCollection.base_url}${SDC_COLLECTION_SEARCH_ENDPOINT}/` + schoolCollection?.school?.schoolId;
        try{
            const activeSdcCollection = await this.restUtils.getData(urlGetActiveSdcSchoolCollection);
            await this.restUtils.deleteData(`${this.config.env.studentDataCollection.base_url}${SDC_COLLECTION_ENDPOINT}/` + activeSdcCollection.sdcSchoolCollectionID);
        }catch(e: any){
            //This is ok
        }

        for (const collection of collectionsList) {
            await this.restUtils.deleteData(`${this.config.env.studentDataCollection.base_url}${COLLECTION_ENDPOINT}/` + collection.collectionID);
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
        console.log('a1', url);
        const newCollection = await this.restUtils.postData(url, collectionPayload);
        console.log('a1a', newCollection);

        let sdcSchoolCollectionPayload = {};

        if(schoolCollection?.loadWithStudentAndValidations) {
            if (schoolCollection.seedData === 'stepTwoSeedData') {
                sdcSchoolCollectionPayload = {
                    "createUser": "EDXAT",
                    "updateUser": null,
                    "createDate": null,
                    "updateDate": null,
                    "sdcSchoolCollectionID": null,
                    "collectionID": newCollection.collectionID,
                    "schoolID": schoolCollection?.school.schoolId,
                    "districtID": schoolCollection?.school.districtId,
                    "uploadDate": "20230822",
                    "uploadFileName": "EDX-AT-FILE.std",
                    "sdcSchoolCollectionStatusCode": "LOADED",
                    "collectionTypeCode": "SEPTEMBER",
                    "collectionOpenDate": curDate,
                    "collectionCloseDate": curCloseDate,
                    "students": [
                        {
                            "createUser": "EDXAT",
                            "sdcSchoolCollectionStudentEnrolledPrograms": null,
                            "localID": "12345",
                            "studentPen": "101932770",
                            "legalFirstName": "LEGALFIRST",
                            "legalMiddleNames": "LEGALMIDDLE",
                            "legalLastName": null,
                            "usualFirstName": "USUALFIRST",
                            "usualMiddleNames": "USUALMIDDLE",
                            "usualLastName": "USUALLAST",
                            "dob": "20100630",
                            "gender": "M",
                            "specialEducationCategoryCode": null,
                            "schoolFundingCode": "20",
                            "nativeAncestryInd": "N",
                            "homeLanguageSpokenCode": "943",
                            "otherCourses": "0",
                            "supportBlocks": null,
                            "enrolledGradeCode": "11",
                            "careerProgramCode": "XH",
                            "numberOfCourses": "0700",
                            "bandCode": "0684",
                            "enrolledProgramCodes": "40",
                            "isAdult": "false",
                            "isSchoolAged": "true",
                            "sdcSchoolCollectionStudentStatusCode": "ERROR",
                            "sdcSchoolCollectionStudentValidationIssues": [
                                {
                                    "createUser": "EDXAT",
                                    "validationIssueSeverityCode": "ERROR",
                                    "validationIssueCode": "LEGALLASTNAMEBLANK",
                                    "validationIssueFieldCode": "LEGAL_LAST_NAME"
                                },
                                {
                                    "createUser": "EDXAT",
                                    "validationIssueSeverityCode": "INFO_WARNING",
                                    "validationIssueCode": "MISSINGPOSTALCODE",
                                    "validationIssueFieldCode": "POSTAL_CODE"
                                }
                            ]
                        }


                    ]
                }
            }
            else if (schoolCollection.seedData === 'stepThreeSeedData') {
                sdcSchoolCollectionPayload = {
                    "createUser": "EDXAT",
                    "updateUser": null,
                    "createDate": null,
                    "updateDate": null,
                    "sdcSchoolCollectionID": null,
                    "collectionID": newCollection.collectionID,
                    "schoolID": schoolCollection?.school.schoolId,
                    "districtID": schoolCollection?.school.districtId,
                    "uploadDate": "20230822",
                    "uploadFileName": "EDX-AT-FILE.std",
                    "sdcSchoolCollectionStatusCode": "LOADED",
                    "collectionTypeCode": "SEPTEMBER",
                    "collectionOpenDate": curDate,
                    "collectionCloseDate": curCloseDate,
                    "students": [
                        {
                            "createUser": "EDXAT",
                            "localID": "12345",
                            "studentPen": "101932770",
                            "legalFirstName": "LEGALFIRST",
                            "legalMiddleNames": null,
                            "legalLastName": "LEGALLAST",
                            "usualFirstName": "USUALFIRST",
                            "usualMiddleNames": "USUALMIDDLE",
                            "usualLastName": "USUALLAST",
                            "dob": "20090630",
                            "gender": "M",
                            "specialEducationCategoryCode": null,
                            "schoolFundingCode": "20",
                            "nativeAncestryInd": "N",
                            "homeLanguageSpokenCode": "943",
                            "otherCourses": "0",
                            "supportBlocks": null,
                            "enrolledGradeCode": "07",
                            "careerProgramCode": null,
                            "numberOfCourses": "0700",
                            "bandCode": "0684",
                            "enrolledProgramCodes": "40",
                            "sdcSchoolCollectionStudentStatusCode": "FIXABLE",
                            "isAdult": "false",
                            "isSchoolAged": "true",
                            "fte": 1,
                            "postalCode": "V8R2Y9",
                            "fteZeroReasonCode": null,
                            "frenchProgramNonEligReasonCode": null,
                            "ellNonEligReasonCode": "NTENRELL",
                            "indigenousSupportProgramNonEligReasonCode": "NTENRINDIG",
                            "careerProgramNonEligReasonCode": "NTENRCAREE",
                            "specialEducationNonEligReasonCode": "NOSPECIAL",
                            "isGraduated": "false",
                            "assignedStudentId": null,
                            "assignedPen": null,
                            "sdcSchoolCollectionStudentValidationIssues": [],
                            "sdcSchoolCollectionStudentEnrolledPrograms": [
                                {
                                    "createUser": "EDXAT",
                                    "updateUser": null,
                                    "createDate": null,
                                    "updateDate": null,
                                    "enrolledProgramCode": "14"
                                },
                                {
                                    "createUser": "EDXAT",
                                    "updateUser": null,
                                    "createDate": null,
                                    "updateDate": null,
                                    "enrolledProgramCode": "14"
                                }
                            ]
                        },
                        {
                            "createUser": "EDXAT",
                            "localID": "12345",
                            "studentPen": "102866365",
                            "legalFirstName": "LEGALFIRST",
                            "legalMiddleNames": null,
                            "legalLastName": "LEGALLAST",
                            "usualFirstName": "USUALFIRST",
                            "usualMiddleNames": "USUALMIDDLE",
                            "usualLastName": "USUALLAST",
                            "dob": "20070702",
                            "gender": "F",
                            "specialEducationCategoryCode": null,
                            "schoolFundingCode": "20",
                            "nativeAncestryInd": "N",
                            "homeLanguageSpokenCode": "943",
                            "otherCourses": "0",
                            "supportBlocks": null,
                            "enrolledGradeCode": "07",
                            "careerProgramCode": null,
                            "numberOfCourses": "0700",
                            "bandCode": "0684",
                            "postalCode": "V8R2Y9",
                            "enrolledProgramCodes": "40",
                            "sdcSchoolCollectionStudentStatusCode": "FIXABLE",
                            "isAdult": "false",
                            "isSchoolAged": "true",
                            "fte": 0.875,
                            "fteZeroReasonCode": null,
                            "frenchProgramNonEligReasonCode": null,
                            "ellNonEligReasonCode": "NTENRELL",
                            "indigenousSupportProgramNonEligReasonCode": "NTENRINDIG",
                            "careerProgramNonEligReasonCode": "NTENRCAREE",
                            "specialEducationNonEligReasonCode": "NOSPECIAL",
                            "isGraduated": "false",
                            "assignedStudentId": null,
                            "assignedPen": null,
                            "sdcSchoolCollectionStudentValidationIssues": [],
                            "sdcSchoolCollectionStudentEnrolledPrograms": [
                                {
                                    "createUser": "EDXAT",
                                    "updateUser": null,
                                    "createDate": null,
                                    "updateDate": null,
                                    "enrolledProgramCode": "40"
                                },
                                {
                                    "createUser": "EDXAT",
                                    "updateUser": null,
                                    "createDate": null,
                                    "updateDate": null,
                                    "enrolledProgramCode": "08"
                                }
                            ]
                        },
                    ]
                }
            }
            else if (schoolCollection.seedData === 'careerProgramsSeedData') {
                sdcSchoolCollectionPayload = {
                    "createUser": "EDXAT",
                    "updateUser": null,
                    "createDate": null,
                    "updateDate": null,
                    "sdcSchoolCollectionID": null,
                    "collectionID": newCollection.collectionID,
                    "schoolID": schoolCollection?.school.schoolId,
                    "districtID": schoolCollection?.school.districtId,
                    "uploadDate": "20230822",
                    "uploadFileName": "EDX-AT-FILE.std",
                    "sdcSchoolCollectionStatusCode": "LOADED",
                    "collectionTypeCode": "SEPTEMBER",
                    "collectionOpenDate": curDate,
                    "collectionCloseDate": curCloseDate,
                    "students": [
                        {
                            "createUser": "EDXAT",
                            "localID": "12345",
                            "studentPen": "101932770",
                            "legalFirstName": "LEGALFIRST",
                            "legalMiddleNames": null,
                            "legalLastName": "LEGALLAST",
                            "usualFirstName": "USUALFIRST",
                            "usualMiddleNames": "USUALMIDDLE",
                            "usualLastName": "USUALLAST",
                            "dob": "20050630",
                            "gender": "M",
                            "specialEducationCategoryCode": null,
                            "schoolFundingCode": "20",
                            "nativeAncestryInd": "N",
                            "homeLanguageSpokenCode": "943",
                            "otherCourses": "0",
                            "supportBlocks": null,
                            "enrolledGradeCode": "09",
                            "careerProgramCode": null,
                            "numberOfCourses": "0700",
                            "bandCode": "0684",
                            "enrolledProgramCodes": "0829",
                            "sdcSchoolCollectionStudentStatusCode": "LOADED",
                            "isAdult": "false",
                            "isSchoolAged": "true",
                            "fte": 1,
                            "postalCode": "V8R2Y9",
                            "fteZeroReasonCode": null,
                            "frenchProgramNonEligReasonCode": null,
                            "ellNonEligReasonCode": "NTENRELL",
                            "indigenousSupportProgramNonEligReasonCode": "NTENRINDIG",
                            "careerProgramNonEligReasonCode": "NTENRCAREE",
                            "specialEducationNonEligReasonCode": "NOSPECIAL",
                            "isGraduated": "false",
                            "assignedStudentId": null,
                            "assignedPen": null,
                            "sdcSchoolCollectionStudentValidationIssues": [],
                            "sdcSchoolCollectionStudentEnrolledPrograms": [
                                {
                                    "createUser": "EDXAT",
                                    "updateUser": null,
                                    "createDate": null,
                                    "updateDate": null,
                                    "enrolledProgramCode": "08"
                                }
                            ]
                        },
                        {
                            "createUser": "EDXAT",
                            "localID": "12345",
                            "studentPen": "102866365",
                            "legalFirstName": "LEGALFIRST",
                            "legalMiddleNames": null,
                            "legalLastName": "LEGALLAST",
                            "usualFirstName": "USUALFIRST",
                            "usualMiddleNames": "USUALMIDDLE",
                            "usualLastName": "USUALLAST",
                            "dob": "20070702",
                            "gender": "F",
                            "specialEducationCategoryCode": null,
                            "schoolFundingCode": "20",
                            "nativeAncestryInd": "N",
                            "homeLanguageSpokenCode": "943",
                            "otherCourses": "0",
                            "supportBlocks": null,
                            "enrolledGradeCode": "11",
                            "numberOfCourses": "0700",
                            "bandCode": "0684",
                            "postalCode": "V8R2Y9",
                            "enrolledProgramCodes": "43",
                            "careerProgramCode": "XH",
                            "sdcSchoolCollectionStudentStatusCode": "LOADED",
                            "isAdult": "false",
                            "isSchoolAged": "true",
                            "fte": 0.875,
                            "fteZeroReasonCode": null,
                            "frenchProgramNonEligReasonCode": null,
                            "ellNonEligReasonCode": "NTENRELL",
                            "indigenousSupportProgramNonEligReasonCode": "NTENRINDIG",
                            "careerProgramNonEligReasonCode": "NTENRCAREE",
                            "specialEducationNonEligReasonCode": "NOSPECIAL",
                            "isGraduated": "false",
                            "assignedStudentId": null,
                            "assignedPen": null,
                            "sdcSchoolCollectionStudentValidationIssues": [],
                            "sdcSchoolCollectionStudentEnrolledPrograms": [
                                {
                                    "createUser": "EDXAT",
                                    "updateUser": null,
                                    "createDate": null,
                                    "updateDate": null,
                                    "enrolledProgramCode": "43"
                                }
                            ]
                        },
                        {
                            "createUser": "EDXAT",
                            "localID": "12345",
                            "studentPen": "103169744",
                            "legalFirstName": "LEGALFIRST",
                            "legalMiddleNames": null,
                            "legalLastName": "LEGALLAST",
                            "usualFirstName": "USUALFIRST",
                            "usualMiddleNames": "USUALMIDDLE",
                            "usualLastName": "USUALLAST",
                            "dob": "20070702",
                            "gender": "F",
                            "specialEducationCategoryCode": null,
                            "schoolFundingCode": "20",
                            "nativeAncestryInd": "N",
                            "homeLanguageSpokenCode": "943",
                            "otherCourses": "0",
                            "supportBlocks": null,
                            "enrolledGradeCode": "09",
                            "careerProgramCode": "XA",
                            "numberOfCourses": "0700",
                            "bandCode": "0684",
                            "postalCode": "V8R2Y9",
                            "enrolledProgramCodes": "1141",
                            "sdcSchoolCollectionStudentStatusCode": "LOADED",
                            "isAdult": "false",
                            "isSchoolAged": "true",
                            "fte": 0.875,
                            "fteZeroReasonCode": null,
                            "frenchProgramNonEligReasonCode": null,
                            "ellNonEligReasonCode": "NTENRELL",
                            "indigenousSupportProgramNonEligReasonCode": "NTENRINDIG",
                            "careerProgramNonEligReasonCode": "NTENRCAREE",
                            "specialEducationNonEligReasonCode": "NOSPECIAL",
                            "isGraduated": "false",
                            "assignedStudentId": null,
                            "assignedPen": null,
                            "sdcSchoolCollectionStudentValidationIssues": [],
                            "sdcSchoolCollectionStudentEnrolledPrograms": [
                                {
                                    "createUser": "EDXAT",
                                    "updateUser": null,
                                    "createDate": null,
                                    "updateDate": null,
                                    "enrolledProgramCode": "11"
                                },
                                {
                                    "createUser": "EDXAT",
                                    "updateUser": null,
                                    "createDate": null,
                                    "updateDate": null,
                                    "enrolledProgramCode": "41"
                                }
                            ]
                        }
                    ]
                }
            }

        } else {
            sdcSchoolCollectionPayload = {
                'createUser': 'EDXAT',
                'updateUser': null,
                'createDate': null,
                'updateDate': null,
                'sdcSchoolCollectionID': null,
                'collectionID': newCollection.collectionID,
                'schoolID': schoolCollection?.school?.schoolId,
                'districtID': schoolCollection?.school?.districtId,
                'uploadDate': null,
                'uploadFileName': null,
                'sdcSchoolCollectionStatusCode': 'NEW',
                'collectionTypeCode': 'SEPTEMBER',
                'collectionOpenDate': curDate,
                'collectionCloseDate': curCloseDate
            };
        }

        const urlSdcSchoolCollection = `${this.config.env.studentDataCollection.base_url}${SDC_COLLECTION_ENDPOINT}/` + newCollection.collectionID;
        console.log('a2', urlSdcSchoolCollection);
        const schoolCollectionResponse = await this.restUtils.postData(urlSdcSchoolCollection, sdcSchoolCollectionPayload);
        console.log('a2a', schoolCollectionResponse);

        console.log('AT createSchoolCollection completed');
        return schoolCollectionResponse?.sdcSchoolCollectionID;
    }
}


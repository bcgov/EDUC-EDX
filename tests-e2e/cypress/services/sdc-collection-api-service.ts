import { LocalDateTime } from '@js-joda/core';
import { RestUtils } from '../helpers/rest-utils-ts';

export interface SchoolCollection {
  school: SchoolEntity,
  loadWithStudentAndValidations: boolean
  seedData?: string
}

// const COLLECTION_ENDPOINT = '/api/v1/student-data-collection/collection';
// const COLLECTION_SEARCH_ENDPOINT = '/api/v1/student-data-collection/collection/search';

const SDC_COLLECTION_ENDPOINT = '/api/v1/student-data-collection/sdcSchoolCollection';
const SDC_COLLECTION_SEARCH_ENDPOINT = '/api/v1/student-data-collection/sdcSchoolCollection/search';
const ACTIVE_COLLECTION_ENDPOINT = '/api/v1/student-data-collection/collection/active';

export class SdcCollectionApiService {

  config: Cypress.PluginConfigOptions;
  restUtils: RestUtils;

  constructor(conf: Cypress.PluginConfigOptions) {
    this.config = conf;
    this.restUtils = new RestUtils(this.config);
  }

  async createSchoolCollection(schoolCollection: SchoolCollection) {
    console.log('AT createSchoolCollection started');

    const curDate = LocalDateTime.now().minusDays(2);
    const curCloseDate = curDate.plusDays(4);

    const urlGetActiveCollection = `${this.config.env.studentDataCollection.base_url}${ACTIVE_COLLECTION_ENDPOINT}`;
    const activeCollection = await this.restUtils.getData<Collection>(urlGetActiveCollection);

    const urlGetActiveSdcSchoolCollection = `${this.config.env.studentDataCollection.base_url}${SDC_COLLECTION_SEARCH_ENDPOINT}/` + schoolCollection?.school?.schoolId;
    try {
      const activeSdcCollection = await this.restUtils.getData<SdcSchoolCollection>(urlGetActiveSdcSchoolCollection);
      await this.restUtils.deleteData(`${this.config.env.studentDataCollection.base_url}${SDC_COLLECTION_ENDPOINT}/` + activeSdcCollection.sdcSchoolCollectionID);
    } catch (_) {
      //This is ok
    }

    let sdcSchoolCollectionPayload = {};

    if (schoolCollection?.loadWithStudentAndValidations) {
      if (schoolCollection.seedData === 'stepTwoSeedData') {
        sdcSchoolCollectionPayload = {
          'createUser': 'EDXAT',
          'updateUser': null,
          'createDate': null,
          'updateDate': null,
          'sdcSchoolCollectionID': null,
          'collectionID': activeCollection.collectionID,
          'schoolID': schoolCollection?.school.schoolId,
          'districtID': schoolCollection?.school.districtId,
          'uploadDate': '20230822',
          'uploadFileName': 'EDX-AT-FILE.std',
          'sdcSchoolCollectionStatusCode': 'LOADED',
          'collectionTypeCode': 'SEPTEMBER',
          'collectionOpenDate': curDate,
          'collectionCloseDate': curCloseDate,
          'students': [
            {
              'createUser': 'EDXAT',
              'sdcSchoolCollectionStudentEnrolledPrograms': null,
              'localID': '12345',
              'studentPen': '101932770',
              'legalFirstName': 'LEGALFIRST',
              'legalMiddleNames': 'LEGALMIDDLE',
              'legalLastName': null,
              'usualFirstName': 'USUALFIRST',
              'usualMiddleNames': 'USUALMIDDLE',
              'usualLastName': 'USUALLAST',
              'dob': '20100630',
              'gender': 'M',
              'specialEducationCategoryCode': null,
              'schoolFundingCode': '20',
              'nativeAncestryInd': 'N',
              'homeLanguageSpokenCode': '943',
              'otherCourses': '0',
              'supportBlocks': null,
              'enrolledGradeCode': '11',
              'careerProgramCode': 'XH',
              'numberOfCourses': '0700',
              'bandCode': '0684',
              'enrolledProgramCodes': '40',
              'isAdult': 'false',
              'isSchoolAged': 'true',
              'sdcSchoolCollectionStudentStatusCode': 'ERROR',
              'sdcSchoolCollectionStudentValidationIssues': [
                {
                  'createUser': 'EDXAT',
                  'validationIssueSeverityCode': 'ERROR',
                  'validationIssueCode': 'LEGALLASTNAMEBLANK',
                  'validationIssueFieldCode': 'LEGAL_LAST_NAME'
                },
                {
                  'createUser': 'EDXAT',
                  'validationIssueSeverityCode': 'INFO_WARNING',
                  'validationIssueCode': 'MISSINGPOSTALCODE',
                  'validationIssueFieldCode': 'POSTAL_CODE'
                }
              ]
            },
            {
              'createUser': 'EDXAT',
              'sdcSchoolCollectionStudentEnrolledPrograms': null,
              'localID': '10000',
              'studentPen': '101930550',
              'legalFirstName': 'TESTFIRST',
              'legalMiddleNames': 'TESTMIDDLE',
              'legalLastName': null,
              'usualFirstName': 'TESTUSUALFIRST',
              'usualMiddleNames': 'TESTUSUALMIDDLE',
              'usualLastName': 'TESTUSUALLAST',
              'dob': '20100630',
              'gender': 'M',
              'specialEducationCategoryCode': null,
              'schoolFundingCode': '20',
              'nativeAncestryInd': 'N',
              'homeLanguageSpokenCode': '943',
              'otherCourses': '0',
              'supportBlocks': null,
              'enrolledGradeCode': '11',
              'careerProgramCode': 'XH',
              'numberOfCourses': '0700',
              'bandCode': '0684',
              'enrolledProgramCodes': '40',
              'isAdult': 'false',
              'isSchoolAged': 'true',
              'sdcSchoolCollectionStudentStatusCode': 'ERROR',
              'sdcSchoolCollectionStudentValidationIssues': [
                {
                  'createUser': 'EDXAT',
                  'validationIssueSeverityCode': 'ERROR',
                  'validationIssueCode': 'LEGALLASTNAMEBLANK',
                  'validationIssueFieldCode': 'LEGAL_LAST_NAME'
                },
                {
                  'createUser': 'EDXAT',
                  'validationIssueSeverityCode': 'INFO_WARNING',
                  'validationIssueCode': 'MISSINGPOSTALCODE',
                  'validationIssueFieldCode': 'POSTAL_CODE'
                }
              ]
            }
          ]
        };
      } else if (schoolCollection.seedData === 'stepTwoDuplicatePENData') {
        const collection = {
          'createUser': 'EDXAT',
          'updateUser': null,
          'createDate': null,
          'updateDate': null,
          'sdcSchoolCollectionID': null,
          'collectionID': activeCollection.collectionID,
          'schoolID': schoolCollection?.school.schoolId,
          'districtID': schoolCollection?.school.districtId,
          'uploadDate': '20230822',
          'uploadFileName': 'EDX-AT-FILE.std',
          'sdcSchoolCollectionStatusCode': 'LOADED',
          'collectionTypeCode': 'SEPTEMBER',
          'collectionOpenDate': curDate,
          'collectionCloseDate': curCloseDate
        };
        const students = this.studentsWithDuplicatePEN();
        sdcSchoolCollectionPayload = {
          ...collection,
          ...students
        };
      }
      else if (schoolCollection.seedData === 'stepThreeSeedData') {
        sdcSchoolCollectionPayload = {
          'createUser': 'EDXAT',
          'updateUser': null,
          'createDate': null,
          'updateDate': null,
          'sdcSchoolCollectionID': null,
          'collectionID': activeCollection.collectionID,
          'schoolID': schoolCollection?.school.schoolId,
          'districtID': schoolCollection?.school.districtId,
          'uploadDate': '20230822',
          'uploadFileName': 'EDX-AT-FILE.std',
          'sdcSchoolCollectionStatusCode': 'LOADED',
          'collectionTypeCode': 'SEPTEMBER',
          'collectionOpenDate': curDate,
          'collectionCloseDate': curCloseDate,
          'students': [
            {
              'createUser': 'EDXAT',
              'localID': '12345',
              'studentPen': '101932770',
              'legalFirstName': 'LEGALFIRST',
              'legalMiddleNames': null,
              'legalLastName': 'LEGALLAST',
              'usualFirstName': 'USUALFIRST',
              'usualMiddleNames': 'USUALMIDDLE',
              'usualLastName': 'USUALLAST',
              'dob': '20090630',
              'gender': 'M',
              'specialEducationCategoryCode': null,
              'schoolFundingCode': '20',
              'nativeAncestryInd': 'N',
              'homeLanguageSpokenCode': '943',
              'otherCourses': '0',
              'supportBlocks': null,
              'enrolledGradeCode': '07',
              'careerProgramCode': null,
              'numberOfCourses': '0700',
              'bandCode': '0684',
              'enrolledProgramCodes': '40',
              'sdcSchoolCollectionStudentStatusCode': 'FIXABLE',
              'isAdult': 'false',
              'isSchoolAged': 'true',
              'fte': 1,
              'postalCode': 'V8R2Y9',
              'fteZeroReasonCode': null,
              'frenchProgramNonEligReasonCode': null,
              'ellNonEligReasonCode': 'NTENRELL',
              'indigenousSupportProgramNonEligReasonCode': 'NTENRINDIG',
              'careerProgramNonEligReasonCode': 'NTENRCAREE',
              'specialEducationNonEligReasonCode': 'NOSPECIAL',
              'isGraduated': 'false',
              'assignedStudentId': null,
              'assignedPen': null,
              'sdcSchoolCollectionStudentValidationIssues': [],
              'sdcSchoolCollectionStudentEnrolledPrograms': [
                {
                  'createUser': 'EDXAT',
                  'updateUser': null,
                  'createDate': null,
                  'updateDate': null,
                  'enrolledProgramCode': '14'
                },
                {
                  'createUser': 'EDXAT',
                  'updateUser': null,
                  'createDate': null,
                  'updateDate': null,
                  'enrolledProgramCode': '14'
                }
              ]
            },
            {
              'createUser': 'EDXAT',
              'localID': '12345',
              'studentPen': '102866365',
              'legalFirstName': 'LEGALFIRST',
              'legalMiddleNames': null,
              'legalLastName': 'LEGALLAST',
              'usualFirstName': 'USUALFIRST',
              'usualMiddleNames': 'USUALMIDDLE',
              'usualLastName': 'USUALLAST',
              'dob': '20070702',
              'gender': 'F',
              'specialEducationCategoryCode': null,
              'schoolFundingCode': '20',
              'nativeAncestryInd': 'N',
              'homeLanguageSpokenCode': '943',
              'otherCourses': '0',
              'supportBlocks': null,
              'enrolledGradeCode': '07',
              'careerProgramCode': null,
              'numberOfCourses': '0700',
              'bandCode': '0684',
              'postalCode': 'V8R2Y9',
              'enrolledProgramCodes': '40',
              'sdcSchoolCollectionStudentStatusCode': 'FIXABLE',
              'isAdult': 'false',
              'isSchoolAged': 'true',
              'fte': 0.875,
              'fteZeroReasonCode': null,
              'frenchProgramNonEligReasonCode': null,
              'ellNonEligReasonCode': 'NTENRELL',
              'indigenousSupportProgramNonEligReasonCode': 'NTENRINDIG',
              'careerProgramNonEligReasonCode': 'NTENRCAREE',
              'specialEducationNonEligReasonCode': 'NOSPECIAL',
              'isGraduated': 'false',
              'assignedStudentId': null,
              'assignedPen': null,
              'sdcSchoolCollectionStudentValidationIssues': [],
              'sdcSchoolCollectionStudentEnrolledPrograms': [
                {
                  'createUser': 'EDXAT',
                  'updateUser': null,
                  'createDate': null,
                  'updateDate': null,
                  'enrolledProgramCode': '40'
                },
                {
                  'createUser': 'EDXAT',
                  'updateUser': null,
                  'createDate': null,
                  'updateDate': null,
                  'enrolledProgramCode': '08'
                }
              ]
            },
          ]
        };
      }
      else if (schoolCollection.seedData === 'careerProgramsSeedData') {
        sdcSchoolCollectionPayload = {
          'createUser': 'EDXAT',
          'updateUser': null,
          'createDate': null,
          'updateDate': null,
          'sdcSchoolCollectionID': null,
          'collectionID': activeCollection.collectionID,
          'schoolID': schoolCollection?.school.schoolId,
          'districtID': schoolCollection?.school.districtId,
          'uploadDate': '20230822',
          'uploadFileName': 'EDX-AT-FILE.std',
          'sdcSchoolCollectionStatusCode': 'REVIEWED',
          'collectionTypeCode': 'SEPTEMBER',
          'collectionOpenDate': curDate,
          'collectionCloseDate': curCloseDate,
          'students': [
            {
              'createUser': 'EDXAT',
              'localID': '12345',
              'studentPen': '101932770',
              'legalFirstName': 'LEGALFIRST',
              'legalMiddleNames': null,
              'legalLastName': 'LEGALLAST',
              'usualFirstName': 'USUALFIRST',
              'usualMiddleNames': 'USUALMIDDLE',
              'usualLastName': 'USUALLAST',
              'dob': '20050630',
              'gender': 'M',
              'specialEducationCategoryCode': 'A',
              'schoolFundingCode': '20',
              'nativeAncestryInd': 'N',
              'homeLanguageSpokenCode': '943',
              'otherCourses': '0',
              'supportBlocks': null,
              'enrolledGradeCode': '09',
              'careerProgramCode': null,
              'numberOfCourses': '0700',
              'bandCode': '0684',
              'enrolledProgramCodes': '082917',
              'sdcSchoolCollectionStudentStatusCode': 'LOADED',
              'isAdult': 'false',
              'isSchoolAged': 'true',
              'fte': 1,
              'postalCode': 'V8R2Y9',
              'fteZeroReasonCode': null,
              'frenchProgramNonEligReasonCode': null,
              'ellNonEligReasonCode': 'NTENRELL',
              'indigenousSupportProgramNonEligReasonCode': 'NTENRINDIG',
              'careerProgramNonEligReasonCode': 'NTENRCAREE',
              'specialEducationNonEligReasonCode': 'NOSPECIAL',
              'isGraduated': 'false',
              'assignedStudentId': null,
              'assignedPen': null,
              'sdcSchoolCollectionStudentValidationIssues': [],
              'sdcSchoolCollectionStudentEnrolledPrograms': [
                {
                  'createUser': 'EDXAT',
                  'updateUser': null,
                  'createDate': null,
                  'updateDate': null,
                  'enrolledProgramCode': '08'
                }
              ]
            },
            {
              'createUser': 'EDXAT',
              'localID': '67890',
              'studentPen': '102866365',
              'legalFirstName': 'LEGALFIRST',
              'legalMiddleNames': null,
              'legalLastName': 'LEGALLAST',
              'usualFirstName': 'USUALFIRST',
              'usualMiddleNames': 'USUALMIDDLE',
              'usualLastName': 'USUALLAST',
              'dob': '20070702',
              'gender': 'F',
              'specialEducationCategoryCode': null,
              'schoolFundingCode': '20',
              'nativeAncestryInd': 'N',
              'homeLanguageSpokenCode': '943',
              'otherCourses': '0',
              'supportBlocks': null,
              'enrolledGradeCode': '11',
              'numberOfCourses': '0700',
              'bandCode': '0684',
              'postalCode': 'V8R2Y9',
              'enrolledProgramCodes': '4317',
              'careerProgramCode': 'XH',
              'sdcSchoolCollectionStudentStatusCode': 'LOADED',
              'isAdult': 'false',
              'isSchoolAged': 'true',
              'fte': 0.875,
              'fteZeroReasonCode': null,
              'frenchProgramNonEligReasonCode': null,
              'ellNonEligReasonCode': 'NTENRELL',
              'indigenousSupportProgramNonEligReasonCode': 'NTENRINDIG',
              'careerProgramNonEligReasonCode': 'NTENRCAREE',
              'specialEducationNonEligReasonCode': 'NOSPECIAL',
              'isGraduated': 'false',
              'assignedStudentId': null,
              'assignedPen': null,
              'sdcSchoolCollectionStudentValidationIssues': [],
              'sdcSchoolCollectionStudentEnrolledPrograms': [
                {
                  'createUser': 'EDXAT',
                  'updateUser': null,
                  'createDate': null,
                  'updateDate': null,
                  'enrolledProgramCode': '43'
                }
              ]
            },
            {
              'createUser': 'EDXAT',
              'localID': '12345',
              'studentPen': '103169744',
              'legalFirstName': 'LEGALFIRST',
              'legalMiddleNames': null,
              'legalLastName': 'LEGALLAST',
              'usualFirstName': 'USUALFIRST',
              'usualMiddleNames': 'USUALMIDDLE',
              'usualLastName': 'USUALLAST',
              'dob': '20070702',
              'gender': 'F',
              'specialEducationCategoryCode': 'G',
              'schoolFundingCode': '20',
              'nativeAncestryInd': 'N',
              'homeLanguageSpokenCode': '943',
              'otherCourses': '0',
              'supportBlocks': null,
              'enrolledGradeCode': '09',
              'careerProgramCode': 'XA',
              'numberOfCourses': '0700',
              'bandCode': '0684',
              'postalCode': 'V8R2Y9',
              'enrolledProgramCodes': '1141',
              'sdcSchoolCollectionStudentStatusCode': 'LOADED',
              'isAdult': 'false',
              'isSchoolAged': 'true',
              'fte': 0.875,
              'fteZeroReasonCode': null,
              'frenchProgramNonEligReasonCode': null,
              'ellNonEligReasonCode': 'NTENRELL',
              'indigenousSupportProgramNonEligReasonCode': 'NTENRINDIG',
              'careerProgramNonEligReasonCode': 'NTENRCAREE',
              'specialEducationNonEligReasonCode': 'NOSPECIAL',
              'isGraduated': 'false',
              'assignedStudentId': null,
              'assignedPen': null,
              'sdcSchoolCollectionStudentValidationIssues': [],
              'sdcSchoolCollectionStudentEnrolledPrograms': [
                {
                  'createUser': 'EDXAT',
                  'updateUser': null,
                  'createDate': null,
                  'updateDate': null,
                  'enrolledProgramCode': '11'
                },
                {
                  'createUser': 'EDXAT',
                  'updateUser': null,
                  'createDate': null,
                  'updateDate': null,
                  'enrolledProgramCode': '41'
                }
              ]
            }
          ]
        };
      }
      else if (schoolCollection.seedData === 'dataUploadSummaryErrors') {
        sdcSchoolCollectionPayload = {
          'createUser': 'EDXAT',
          'updateUser': null,
          'createDate': null,
          'updateDate': null,
          'sdcSchoolCollectionID': null,
          'collectionID': activeCollection.collectionID,
          'schoolID': schoolCollection?.school.schoolId,
          'districtID': schoolCollection?.school.districtId,
          'uploadDate': '20230822',
          'uploadFileName': 'EDX-AT-FILE.std',
          'sdcSchoolCollectionStatusCode': 'NEW',
          'collectionTypeCode': 'SEPTEMBER',
          'collectionOpenDate': curDate,
          'collectionCloseDate': curCloseDate,
          'students': [
            {
              'createUser': 'EDXAT',
              'localID': '12345',
              'studentPen': '101932770',
              'legalFirstName': 'LEGALFIRST',
              'legalMiddleNames': null,
              'legalLastName': 'LEGALLAST',
              'usualFirstName': 'USUALFIRST',
              'usualMiddleNames': 'USUALMIDDLE',
              'usualLastName': 'USUALLAST',
              'dob': '20050630',
              'gender': 'M',
              'specialEducationCategoryCode': 'A',
              'schoolFundingCode': '20',
              'nativeAncestryInd': 'N',
              'homeLanguageSpokenCode': '943',
              'otherCourses': '0',
              'supportBlocks': null,
              'enrolledGradeCode': '09',
              'careerProgramCode': null,
              'numberOfCourses': '0700',
              'bandCode': '0684',
              'enrolledProgramCodes': '082917',
              'sdcSchoolCollectionStudentStatusCode': 'ERROR',
              'isAdult': 'false',
              'isSchoolAged': 'true',
              'fte': 1,
              'postalCode': 'V8R2Y9',
              'fteZeroReasonCode': null,
              'frenchProgramNonEligReasonCode': null,
              'ellNonEligReasonCode': 'NTENRELL',
              'indigenousSupportProgramNonEligReasonCode': 'NTENRINDIG',
              'careerProgramNonEligReasonCode': 'NTENRCAREE',
              'specialEducationNonEligReasonCode': 'NOSPECIAL',
              'isGraduated': 'false',
              'assignedStudentId': null,
              'assignedPen': null,
              'sdcSchoolCollectionStudentValidationIssues': [],
              'sdcSchoolCollectionStudentEnrolledPrograms': [
                {
                  'createUser': 'EDXAT',
                  'updateUser': null,
                  'createDate': null,
                  'updateDate': null,
                  'enrolledProgramCode': '08'
                }
              ]
            }
          ]
        };
      }
      else if (schoolCollection.seedData === 'dataUploadSummaryNoErrors') {
        sdcSchoolCollectionPayload = {
          'createUser': 'EDXAT',
          'updateUser': null,
          'createDate': null,
          'updateDate': null,
          'sdcSchoolCollectionID': null,
          'collectionID': activeCollection.collectionID,
          'schoolID': schoolCollection?.school.schoolId,
          'districtID': schoolCollection?.school.districtId,
          'uploadDate': '20230822',
          'uploadFileName': 'EDX-AT-FILE.std',
          'sdcSchoolCollectionStatusCode': 'NEW',
          'collectionTypeCode': 'SEPTEMBER',
          'collectionOpenDate': curDate,
          'collectionCloseDate': curCloseDate,
          'students': [
            {
              'createUser': 'EDXAT',
              'localID': '12345',
              'studentPen': '101932770',
              'legalFirstName': 'LEGALFIRST',
              'legalMiddleNames': null,
              'legalLastName': 'LEGALLAST',
              'usualFirstName': 'USUALFIRST',
              'usualMiddleNames': 'USUALMIDDLE',
              'usualLastName': 'USUALLAST',
              'dob': '20050630',
              'gender': 'M',
              'specialEducationCategoryCode': 'A',
              'schoolFundingCode': '20',
              'nativeAncestryInd': 'N',
              'homeLanguageSpokenCode': '943',
              'otherCourses': '0',
              'supportBlocks': null,
              'enrolledGradeCode': '09',
              'careerProgramCode': null,
              'numberOfCourses': '0700',
              'bandCode': '0684',
              'enrolledProgramCodes': '082917',
              'sdcSchoolCollectionStudentStatusCode': 'VERIFIED',
              'isAdult': 'false',
              'isSchoolAged': 'true',
              'fte': 1,
              'postalCode': 'V8R2Y9',
              'fteZeroReasonCode': null,
              'frenchProgramNonEligReasonCode': null,
              'ellNonEligReasonCode': 'NTENRELL',
              'indigenousSupportProgramNonEligReasonCode': 'NTENRINDIG',
              'careerProgramNonEligReasonCode': 'NTENRCAREE',
              'specialEducationNonEligReasonCode': 'NOSPECIAL',
              'isGraduated': 'false',
              'assignedStudentId': null,
              'assignedPen': null,
              'sdcSchoolCollectionStudentValidationIssues': [],
              'sdcSchoolCollectionStudentEnrolledPrograms': [
                {
                  'createUser': 'EDXAT',
                  'updateUser': null,
                  'createDate': null,
                  'updateDate': null,
                  'enrolledProgramCode': '08'
                }
              ]
            }
          ]
        };
      }

    } else {
      sdcSchoolCollectionPayload = {
        'createUser': 'EDXAT',
        'updateUser': null,
        'createDate': null,
        'updateDate': null,
        'sdcSchoolCollectionID': null,
        'collectionID': activeCollection.collectionID,
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

    const urlSdcSchoolCollection = `${this.config.env.studentDataCollection.base_url}${SDC_COLLECTION_ENDPOINT}/` + activeCollection.collectionID;
    const schoolCollectionResponse = await this.restUtils.postData<SdcSchoolCollection>(urlSdcSchoolCollection, sdcSchoolCollectionPayload);

    console.log('AT createSchoolCollection completed');
    return schoolCollectionResponse?.sdcSchoolCollectionID;
  }

  studentsWithDuplicatePEN() {
    return {
      'students': [
        {
          'createUser': 'EDXAT',
          'sdcSchoolCollectionStudentEnrolledPrograms': null,
          'localID': '12345',
          'studentPen': '101932770',
          'legalFirstName': 'LEGALFIRST',
          'legalMiddleNames': 'LEGALMIDDLE',
          'legalLastName': null,
          'usualFirstName': 'USUALFIRST',
          'usualMiddleNames': 'USUALMIDDLE',
          'usualLastName': 'USUALLAST',
          'dob': '20100630',
          'gender': 'M',
          'specialEducationCategoryCode': null,
          'schoolFundingCode': '20',
          'nativeAncestryInd': 'N',
          'homeLanguageSpokenCode': '943',
          'otherCourses': '0',
          'supportBlocks': null,
          'enrolledGradeCode': '11',
          'careerProgramCode': 'XH',
          'numberOfCourses': '0700',
          'bandCode': '0684',
          'enrolledProgramCodes': '40',
          'isAdult': 'false',
          'isSchoolAged': 'true',
          'sdcSchoolCollectionStudentStatusCode': 'ERROR',
          'sdcSchoolCollectionStudentValidationIssues': [
            {
              'createUser': 'EDXAT',
              'validationIssueSeverityCode': 'ERROR',
              'validationIssueCode': 'LEGALLASTNAMEBLANK',
              'validationIssueFieldCode': 'LEGAL_LAST_NAME'
            },
            {
              'createUser': 'EDXAT',
              'validationIssueSeverityCode': 'INFO_WARNING',
              'validationIssueCode': 'MISSINGPOSTALCODE',
              'validationIssueFieldCode': 'POSTAL_CODE'
            },
            {
              'createUser': 'EDXAT',
              'validationIssueSeverityCode': 'ERROR',
              'validationIssueCode': 'STUDENTPENDUPLICATE',
              'validationIssueFieldCode': 'STUDENT_PEN'
            },
          ]
        },
        {
          'createUser': 'EDXAT',
          'sdcSchoolCollectionStudentEnrolledPrograms': null,
          'localID': '10000',
          'studentPen': '101932770',
          'legalFirstName': 'TESTFIRST',
          'legalMiddleNames': 'TESTMIDDLE',
          'legalLastName': null,
          'usualFirstName': 'TESTUSUALFIRST',
          'usualMiddleNames': 'TESTUSUALMIDDLE',
          'usualLastName': 'TESTUSUALLAST',
          'dob': '20100630',
          'gender': 'M',
          'specialEducationCategoryCode': null,
          'schoolFundingCode': '20',
          'nativeAncestryInd': 'N',
          'homeLanguageSpokenCode': '943',
          'otherCourses': '0',
          'supportBlocks': null,
          'enrolledGradeCode': '11',
          'careerProgramCode': 'XH',
          'numberOfCourses': '0700',
          'bandCode': '0684',
          'enrolledProgramCodes': '40',
          'isAdult': 'false',
          'isSchoolAged': 'true',
          'sdcSchoolCollectionStudentStatusCode': 'ERROR',
          'sdcSchoolCollectionStudentValidationIssues': [
            {
              'createUser': 'EDXAT',
              'validationIssueSeverityCode': 'ERROR',
              'validationIssueCode': 'LEGALLASTNAMEBLANK',
              'validationIssueFieldCode': 'LEGAL_LAST_NAME'
            },
            {
              'createUser': 'EDXAT',
              'validationIssueSeverityCode': 'INFO_WARNING',
              'validationIssueCode': 'MISSINGPOSTALCODE',
              'validationIssueFieldCode': 'POSTAL_CODE'
            },
            {
              'createUser': 'EDXAT',
              'validationIssueSeverityCode': 'ERROR',
              'validationIssueCode': 'STUDENTPENDUPLICATE',
              'validationIssueFieldCode': 'STUDENT_PEN'
            },
          ]
        },
        {
          'createUser': 'EDXAT',
          'sdcSchoolCollectionStudentEnrolledPrograms': null,
          'localID': '10000',
          'studentPen': '102223476',
          'legalFirstName': 'TESTFIRST',
          'legalMiddleNames': 'TESTMIDDLE',
          'legalLastName': null,
          'usualFirstName': 'TESTUSUALFIRST',
          'usualMiddleNames': 'TESTUSUALMIDDLE',
          'usualLastName': 'TESTUSUALLAST',
          'dob': '20100630',
          'gender': 'M',
          'specialEducationCategoryCode': null,
          'schoolFundingCode': '20',
          'nativeAncestryInd': 'N',
          'homeLanguageSpokenCode': '943',
          'otherCourses': '0',
          'supportBlocks': null,
          'enrolledGradeCode': '11',
          'careerProgramCode': 'XH',
          'numberOfCourses': '0700',
          'bandCode': '0684',
          'enrolledProgramCodes': '40',
          'isAdult': 'false',
          'isSchoolAged': 'true',
          'sdcSchoolCollectionStudentStatusCode': 'ERROR',
          'sdcSchoolCollectionStudentValidationIssues': [
            {
              'createUser': 'EDXAT',
              'validationIssueSeverityCode': 'ERROR',
              'validationIssueCode': 'LEGALLASTNAMEBLANK',
              'validationIssueFieldCode': 'LEGAL_LAST_NAME'
            },
            {
              'createUser': 'EDXAT',
              'validationIssueSeverityCode': 'INFO_WARNING',
              'validationIssueCode': 'MISSINGPOSTALCODE',
              'validationIssueFieldCode': 'POSTAL_CODE'
            },
          ]
        }
      ]
    };
  }
}


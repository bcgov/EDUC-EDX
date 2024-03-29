import {LocalDateTime} from '@js-joda/core';
import {RestUtils} from '../helpers/rest-utils-ts';
import {createSdcSchoolCollection, createSdcSchoolCollectionStudents} from '../helpers/seed-data-utils';

export interface SchoolCollectionOptions {
  school: SchoolEntity,
  loadWithStudentAndValidations: boolean
  seedData?: string
}

export type SdcStudentEllOption = {
  studentID: string,
  yearsInEll: number
};

// const COLLECTION_ENDPOINT = '/api/v1/student-data-collection/collection';
// const COLLECTION_SEARCH_ENDPOINT = '/api/v1/student-data-collection/collection/search';

const SDC_COLLECTION_ENDPOINT = '/api/v1/student-data-collection/sdcSchoolCollection';
const SDC_COLLECTION_SEARCH_ENDPOINT = '/api/v1/student-data-collection/sdcSchoolCollection/search';
const ACTIVE_COLLECTION_ENDPOINT = '/api/v1/student-data-collection/collection/active';
const SCHOOL_COLLECTION_STUDENT_ENDPOINT = '/api/v1/student-data-collection/sdcSchoolCollectionStudent';

export class SdcCollectionApiService {

  config: Cypress.PluginConfigOptions;
  restUtils: RestUtils;

  constructor(conf: Cypress.PluginConfigOptions) {
    this.config = conf;
    this.restUtils = new RestUtils(this.config);
  }

  async createSchoolCollection(schoolCollection: SchoolCollectionOptions) {
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
      else if (schoolCollection.seedData === 'stepThreeHeadcountSeedData') {
        const students = createSdcSchoolCollectionStudents(3, ['KF', '01', '02', '03', '04', '05', '06', '07', 'EU', '08', '09', '10', '11', '12', 'SU']);
        students[0].enrolledGradeCode = '09';
        students[0].localID = '67890';
        students[0].enrolledProgramCodes = '082917';
        students[0].studentPen = '101932770';
        students[0].nativeAncestryInd = 'Y';
        students[0].numberOfCourses = '0700';
        students[0].assignedStudentId = 'ce4bec97-b986-4815-a9f8-6bdfe8578dcf';
        students[0].isGraduated = 'false';
        students[0].specialEducationCategoryCode = 'A';
        students[0].localID = 'student1';
        students[0].penMatchResult = 'DM';

        students[1].enrolledGradeCode = '11';
        students[1].enrolledProgramCodes = '431733';
        students[1].careerProgramCode = 'XH';
        students[1].indigenousSupportProgramNonEligReasonCode = 'NOTELIG';
        students[1].studentPen = '103169744';
        students[1].numberOfCourses = '0700';
        students[1].localID = 'student2';
        students[1].sdcSchoolCollectionStudentStatusCode = 'LOADED';

        students[2].enrolledGradeCode = '09';
        students[2].enrolledProgramCodes = '1141';
        students[2].careerProgramCode = 'XA';
        students[2].studentPen = '102866365';
        students[2].nativeAncestryInd = 'Y';
        students[2].numberOfCourses = '0700';
        students[2].specialEducationCategoryCode = 'G';
        students[2].assignedPen = '101930550';
        students[2].penMatchResult = 'MATCH';
        students[2].localID = 'student3';

        students.forEach(obj => {
          obj.isSchoolAged = 'true';
          obj.isAdult = 'false';
          obj.legalLastName = 'LEGALLAST';
        });

        const school = createSdcSchoolCollection(activeCollection.collectionID, schoolCollection?.school.schoolId, schoolCollection?.school.districtId, JSON.stringify(curDate), JSON.stringify(curCloseDate), students, 'NEW');
        school.sdcSchoolCollectionStatusCode = 'REVIEWED';
        sdcSchoolCollectionPayload = school;
      }
      else if (schoolCollection.seedData === 'filterData') {
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
              'nativeAncestryInd': 'Y',
              'homeLanguageSpokenCode': '943',
              'otherCourses': '0',
              'supportBlocks': null,
              'enrolledGradeCode': '08',
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
              'ellNonEligReasonCode': null,
              'indigenousSupportProgramNonEligReasonCode': 'NTENRINDIG',
              'careerProgramNonEligReasonCode': 'NTENRCAREE',
              'specialEducationNonEligReasonCode': null,
              'isGraduated': 'false',
              'assignedStudentId': 'ce4bec97-b986-4815-a9f8-6bdfe8578dcf',
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
              'assignedStudentId': 'b1b3e478-2528-404d-b141-aa96543fc30a',
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
              'assignedStudentId': '52c5b19c-30e5-478e-b8bd-ed18e992a8fe',
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
        const seedSchoolCollection: SdcSchoolCollection = createSdcSchoolCollection(activeCollection.collectionID, schoolCollection?.school.schoolId, schoolCollection?.school.districtId, JSON.stringify(curDate), JSON.stringify(curCloseDate), undefined, 'NEW');

        seedSchoolCollection.students[0].sdcSchoolCollectionStudentStatusCode = 'ERROR';
        sdcSchoolCollectionPayload = seedSchoolCollection;
      }
      else if (schoolCollection.seedData === 'dataUploadSummaryCareer') {
        const students = createSdcSchoolCollectionStudents(9, ['08', '09', '10', '11', '12']);
        students[0].enrolledProgramCodes = students[1].enrolledProgramCodes = '40';
        students[2].enrolledProgramCodes = students[3].enrolledProgramCodes = '41';
        students[4].enrolledProgramCodes = students[5].enrolledProgramCodes = '42';
        students[6].enrolledProgramCodes = students[7].enrolledProgramCodes = students[8].enrolledProgramCodes = '43';
        students[0].careerProgramCode = 'XA';
        students[1].careerProgramCode = 'XB';
        students[2].careerProgramCode = 'XC';
        students[3].careerProgramCode = 'XD';
        students[4].careerProgramCode = 'XE';
        students[5].careerProgramCode = 'XF';
        students[6].careerProgramCode = 'XG';
        students[7].careerProgramCode = 'XH';
        students[8].careerProgramCode = 'XH';
        students[8].careerProgramNonEligReasonCode = 'NOTELIGIBL';
        sdcSchoolCollectionPayload = createSdcSchoolCollection(activeCollection.collectionID, schoolCollection?.school.schoolId, schoolCollection?.school.districtId, JSON.stringify(curDate), JSON.stringify(curCloseDate), students, 'NEW');
      }
      else if (schoolCollection.seedData === 'dataUploadSummarySpecialEd') {
        const students = createSdcSchoolCollectionStudents(14, ['KF', '01', '02', '03', '04', '05', '06', '07', 'EU', '08', '09', '10', '11', '12', 'SU']);
        students[0].specialEducationCategoryCode = 'A';
        students[1].specialEducationCategoryCode = 'B';
        students[2].specialEducationCategoryCode = 'C';
        students[3].specialEducationCategoryCode = 'D';
        students[4].specialEducationCategoryCode = 'E';
        students[5].specialEducationCategoryCode = 'F';
        students[6].specialEducationCategoryCode = 'G';
        students[7].specialEducationCategoryCode = 'H';
        students[8].specialEducationCategoryCode = 'K';
        students[9].specialEducationCategoryCode = 'P';
        students[10].specialEducationCategoryCode = 'Q';
        students[11].specialEducationCategoryCode = 'R';
        students[12].specialEducationCategoryCode = 'R';
        students[12].specialEducationNonEligReasonCode = 'NOTELIGIBL';
        sdcSchoolCollectionPayload = createSdcSchoolCollection(activeCollection.collectionID, schoolCollection?.school.schoolId, schoolCollection?.school.districtId, JSON.stringify(curDate), JSON.stringify(curCloseDate), students, 'NEW');
      }
      else if (schoolCollection.seedData === 'dataUploadSummaryIndigenous') {
        const students = createSdcSchoolCollectionStudents(7, ['KF', '01', '02', '03', '04', '05', '06', '07', 'EU', '08', '09', '10', '11', '12', 'SU']);
        students[0].enrolledProgramCodes = '29';
        students[0].nativeAncestryInd = 'Y';
        students[1].enrolledProgramCodes = '29';
        students[1].nativeAncestryInd = 'N';
        students[2].enrolledProgramCodes = '33';
        students[2].nativeAncestryInd = 'Y';
        students[3].enrolledProgramCodes = '33';
        students[3].nativeAncestryInd = 'N';
        students[4].enrolledProgramCodes = '36';
        students[4].nativeAncestryInd = 'Y';
        students[5].enrolledProgramCodes = '36';
        students[5].nativeAncestryInd = 'N';
        students[6].enrolledProgramCodes = '36';
        students[6].nativeAncestryInd = 'N';
        students[6].indigenousSupportProgramNonEligReasonCode = 'ERRORCODE';
        sdcSchoolCollectionPayload = createSdcSchoolCollection(activeCollection.collectionID, schoolCollection?.school.schoolId, schoolCollection?.school.districtId, JSON.stringify(curDate), JSON.stringify(curCloseDate), students, 'NEW');
      }
      else if (schoolCollection.seedData === 'dataUploadSummaryEll') {
        const students = createSdcSchoolCollectionStudents(7, ['KF', '01', '02', '03', '04', '05', '06', '07', 'EU', '08', '09', '10', '11', '12', 'SU']);
        students[0].enrolledProgramCodes = '17';
        students[0].enrolledGradeCode = '11';
        students[0].isSchoolAged = 'true';
        students[1].enrolledProgramCodes = '17';
        students[1].enrolledGradeCode = '12';
        students[1].isSchoolAged = 'true';
        students[2].enrolledProgramCodes = '17';
        students[2].isAdult = 'true';
        students[3].enrolledProgramCodes = '17';
        students[3].isAdult = 'true';
        sdcSchoolCollectionPayload = createSdcSchoolCollection(activeCollection.collectionID, schoolCollection?.school.schoolId, schoolCollection?.school.districtId, JSON.stringify(curDate), JSON.stringify(curCloseDate), students, 'NEW');
      }
      else if (schoolCollection.seedData === 'submittedSchoolCollection') {
        const students = createSdcSchoolCollectionStudents(7, ['KF', '01', '02', '03', '04', '05', '06', '07', 'EU', '08', '09', '10', '11', '12', 'SU']);
        students[0].enrolledProgramCodes = '17';
        students[0].enrolledGradeCode = '11';
        students[0].isSchoolAged = 'true';
        students[1].enrolledProgramCodes = '17';
        students[1].enrolledGradeCode = '12';
        students[1].isSchoolAged = 'true';
        students[2].enrolledProgramCodes = '17';
        students[2].isAdult = 'true';
        students[3].enrolledProgramCodes = '17';
        students[3].isAdult = 'true';
        sdcSchoolCollectionPayload = createSdcSchoolCollection(activeCollection.collectionID, schoolCollection?.school.schoolId, schoolCollection?.school.districtId, JSON.stringify(curDate), JSON.stringify(curCloseDate), students, 'SUBMITTED');
      }
    } 
    else {
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
    return schoolCollectionResponse;
  }

  async createSdcStudentElls(payload: SdcStudentEll[]) {
    const studentEllEndpoint = `${this.config.env.studentDataCollection.base_url}${SCHOOL_COLLECTION_STUDENT_ENDPOINT}`
      + '/years-in-ell';
    const ells = await this.restUtils.postData<SdcStudentEll[]>(studentEllEndpoint, payload);
    console.log('AT createSdcStudentElls completed');
    return ells;
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


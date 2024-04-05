type CollectionTypeCode = 'SEPTEMBER' | 'FEBRUARY' | 'MAY' | 'JUNE' | 'JULY';

interface Collection extends BaseApiEntity {
  collectionID: string;
  collectionTypeCode: CollectionTypeCode;
  snapshotDate: string;
  submissionDueDate: string;
  duplicationResolutionDueDate: string;
  signOffDueDate: string;
}

interface SdcCollections {
  sdcDistrictCollection: SdcDistrictCollection;
  sdcSchoolCollection: SdcSchoolCollection;
}

interface SdcDistrictCollection extends BaseApiEntity {
  sdcDistrictCollectionID: string;
  collectionID: string;
  districtID: string;
  sdcDistrictCollectionStatusCode: string;
  collectionTypeCode: string;
  collectionOpenDate: string;
  submissionDueDate: string;
}

interface SdcSchoolCollection extends BaseApiEntity {
  sdcSchoolCollectionID: string;
  collectionID: string;
  schoolID: string;
  districtID: string;
  uploadDate: string;
  uploadFileName: string;
  uploadReportDate: string;
  sdcSchoolCollectionStatusCode: string;
  collectionTypeCode: string;
  collectionOpenDate: string;
  collectionCloseDate: string;
  students: SdcSchoolCollectionStudent[];
}

interface SdcSchoolCollectionStudent extends BaseApiEntity {
  sdcSchoolCollectionStudentID: string;
  sdcSchoolCollectionID: string;
  localID: string;
  studentPen: string;
  legalFirstName: string;
  legalMiddleNames: string;
  legalLastName: string;
  usualFirstName: string;
  usualMiddleNames: string;
  usualLastName: string;
  dob: string;
  gender: string;
  specialEducationCategoryCode: string;
  schoolFundingCode: string;
  nativeAncestryInd: string;
  homeLanguageSpokenCode: string;
  otherCourses: string;
  supportBlocks: string;
  enrolledGradeCode: string;
  enrolledProgramCodes: string;
  careerProgramCode: string;
  numberOfCourses: string;
  bandCode: string;
  postalCode: string;
  sdcSchoolCollectionStudentStatusCode: string;
  isAdult: string;
  isSchoolAged: string;
  fte: number;
  fteZeroReasonCode: string;
  frenchProgramNonEligReasonCode: string;
  ellNonEligReasonCode: string;
  indigenousSupportProgramNonEligReasonCode: string;
  careerProgramNonEligReasonCode: string;
  specialEducationNonEligReasonCode: string;
  isGraduated: string;
  assignedStudentId: string;
  assignedPen: string;
  penMatchResult: string;
  sdcSchoolCollectionStudentValidationIssues: [];
  sdcSchoolCollectionStudentEnrolledPrograms: [];
  sdcStudentEll?: SdcStudentEll;
}

interface SdcStudentEll extends BaseApiEntity {
  sdcStudentEllID?: string;
  studentID: string;
  yearsInEll: number;
}


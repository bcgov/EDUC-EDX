interface NoteEntity extends BaseApiEntity {
  noteId: string;
  schoolId: string;
  districtId: string;
  content: string;
}

interface ContactEntity extends BaseApiEntity {
  createUser: string;
  updateUser: string;
  createDate: string;
  updateDate: string;
  phoneNumber: string | null;
  jobTitle: string;
  phoneExtension: string | null;
  alternatePhoneNumber: string | null;
  alternatePhoneExtension: string | null;
  email: string | null;
  firstName: string;
  lastName: string;
  effectiveDate: string;
  expiryDate: string | null;
}

interface AuthorityContactEntity extends ContactEntity {
  authorityContactId: string;
  independentAuthorityId: string;
  authorityContactTypeCode: string;
}

interface SchoolContactEntity extends ContactEntity {
  schoolContactId: string;
  schoolId: string;
  schoolContactTypeCode: string;
}

interface DistrictContactEntity extends ContactEntity {
  districtContactId: string;
  districtId: string;
  districtContactTypeCode: string;
}

interface BaseAddressEntity extends BaseApiEntity {
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postal: string;
  addressTypeCode: string;
  provinceCode: string;
  countryCode: string;
}

interface DistrictAddressEntity extends BaseAddressEntity {
  districtAddressId: string;
  districtId: string;
}

interface SchoolAddressEntity extends BaseAddressEntity {
  schoolAddressId: string;
  schoolId: string;
}

type DistrictRegionCodeKey = 'NOT_APPLIC' | 'KOOTENAYS' | 'OKANAGAN' | 'NORTHEAST' | 'FRASER' | 'METRO' | 'VAN_ISLE'
| 'NORTHWEST' | 'OFFSHORE' | 'PSI' | 'YUKON';
type DistrictStatusCodeKey = 'ACTIVE' | 'INACTIVE';

interface DistrictEntity extends BaseApiEntity {
  districtId: string;
  districtNumber: string;
  faxNumber: string | null;
  phoneNumber: string | null;
  email: string | null;
  website: string | null;
  displayName: string;
  districtRegionCode: DistrictRegionCodeKey;
  districtStatusCode: DistrictStatusCodeKey;
  contacts: DistrictContactEntity[];
  addresses: DistrictAddressEntity[];
  notes: NoteEntity[];
}

type SchoolReportingRequirementCodeKey = 'CSF' | 'RT' | 'REGULAR' | 'NONE';
type SchoolOrganizationCodeKey = 'TWO_SEM' | 'TWO_SEM' | 'TRIMESTER' | 'QUARTER' | 'TEN_MONTHS' | 'PART_TEN' | 'OTHER';
type SchoolCategoryCodeKey = 'IMM_DATA' | 'CHILD_CARE' | 'MISC' | 'PUBLIC' | 'INDEPEND' | 'INDP_FNS' | 'FED_BAND'
| 'OFFSHORE' | 'EAR_LEARN' | 'YUKON' | 'POST_SEC';
type SchoolFacilityTypeCodeKey = 'STANDARD' | 'PROVINCIAL' | 'DIST_CONT' | 'ELEC_DELIV' | 'STANDARD' | 'CONT_ED'
| 'DIST_LEARN' | 'ALT_PROGS' | 'STRONG_CEN' | 'STRONG_OUT' | 'JUSTB4PRO' | 'SHORT_PRP' | 'LONG_PRP' | 'SUMMER' | 'YOUTH'
| 'POST_SEC' | 'DISTONLINE';
type NeighborhoodLearningTypeCodeKey = 'EARLYLEARN' | 'AFTERSCHL' | 'CONTINEDUC' | 'SENIORS' | 'SPORTRECR' | 'COMMUNITY'
| 'INTEGRSERV';

type SchoolGradeCode = {
  schoolGradeCode: string,
  label: string,
  description: string,
  displayOrder: string,
  effectiveDate: string,
  expiryDate: string
}

interface NeighborhoodLearningEntity extends BaseApiEntity {
  neighborhoodLearningId: string;
  schoolId: string;
  NeighborhoodLearningTypeCode: NeighborhoodLearningTypeCodeKey;
}

interface SchoolMoveEntity extends BaseApiEntity {
  schoolMoveId: string | null;
  toSchoolId: string;
  fromSchoolId: string;
  moveDate: string;
}

interface SchoolEntity extends BaseApiEntity {
  schoolId: string;
  districtId: string;
  mincode: string;
  independentAuthorityId: string;
  schoolNumber: string;
  faxNumber: string | null;
  phoneNumber: string | null;
  email: string | null;
  website: string | null;
  schoolReportingRequirementCode: SchoolReportingRequirementCodeKey;
  displayName: string;
  displayNameNoSpecialChars: string | null;
  schoolOrganizationCode: SchoolOrganizationCodeKey;
  schoolCategoryCode: SchoolCategoryCodeKey;
  facilityTypeCode: SchoolFacilityTypeCodeKey;
  openedDate: string;
  closedDate: string | null;
  contacts: SchoolContactEntity[];
  addresses: SchoolAddressEntity[];
  notes: NoteEntity[];
  grades: SchoolGradeCode[];
  neighborhoodLearning: NeighborhoodLearningTypeCodeKey[];
  schoolMove: SchoolMoveEntity[];
}

type DistrictRole = 'SECURE_EXCHANGE' | 'EDX_DISTRICT_ADMIN' | 'STUDENT_DATA_COLLECTION';

declare interface DistrictUserOptions {
  districtCodes: string[];
  districtRoles: DistrictRole[];
}

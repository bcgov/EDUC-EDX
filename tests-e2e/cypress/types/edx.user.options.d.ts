declare interface DistrictUserOptions {
  districtCodes: string[];
  districtRoles: DistrictRole[];
  digitalId?: string;
}

declare interface SchoolUserOptions {
  schoolCodes: string[];
  digitalId?: string;
}

/**
 * The options for the setup-userActivation task
 * @property {InstituteTypeCode} instituteTypeCode
 * @property {string} instituteNumber - The "legacy" number for the school or district being set up.
 */
declare interface UserActivationOptions {
  instituteTypeCode: InstituteTypeCode;
  instituteNumber: string;
}

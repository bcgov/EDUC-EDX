declare interface DistrictUserOptions {
  digitalId?: string;
  districtCodes: string[];
  districtRoles: DistrictRole[];
}

declare interface SchoolUserOptions {
  digitalId?: string;
  schoolCodes: string[];
  schoolRoles?: SchoolRole[];
}

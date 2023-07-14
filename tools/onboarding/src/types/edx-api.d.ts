declare interface EdxActivationRoleEntity extends BaseApiEntity {
  edxActivationRoleId: string;
  edxActivationCodeId: string;
}

declare interface ActivationCodeEntity extends BaseApiEntity {
  schoolID: string;
  districtID: string;
  activationCode: string;
  edxActivationCodeId: string;
  isPrimary: boolean;
  expiryDate: string;
  firstName: string;
  lastName: string;
  email: string;
  numberOfClicks: string;
  validationCode: string;
  edxUserId: string;
  edxActivationRoles: EdxActivationRoleEntity[];
}

type DistrictRole = 'SECURE_EXCHANGE' | 'EDX_DISTRICT_ADMIN' | 'STUDENT_DATA_COLLECTION';
type SchoolRole = 'SECURE_EXCHANGE_SCHOOL' | 'EDX_SCHOOL_ADMIN' | 'STUDENT_DATA_COLLECTION';
type InstituteTypeCode = 'SCHOOL' | 'DISTRICT';

declare interface EdxUserDistrictRoleEntity extends EdxActivationRoleEntity {
  edxRoleCode: DistrictRole;
}

declare interface EdxRolePermission extends BaseApiEntity {
  edxRolePermissionId: string;
  edxPermissionCode: 'EDX_USER_SCHOOL_ADMIN' | 'EDX_USER_DISTRICT_ADMIN' | 'STUDENT_DATA_COLLECTION';
}

declare interface EdxRoleEntity extends BaseApiEntity {
  edxRoleCode: DistrictRole | SchoolRole;
  label: string;
  roleDescription: string;
  isDistrictRole: 'Y' | 'N';
  edxRolePermissions: EdxRolePermission[];
}

declare interface EdxUserSchoolRoleEntity extends EdxActivationRoleEntity {
  edxRoleCode: SchoolRole;
}

declare interface EdxActivationCodeEntity extends BaseApiEntity {
  schoolID: string;
  districtID: string;
  activationCode: string;
  isPrimary: boolean;
  expiryDate: any;
  firstName: string;
  lastName: string;
  email: string;
  numberOfClicks: string;
  validationCode: string;
  edxUserId: string;
  edxActivationRoles: EdxActivationRoleEntity[];
}

declare interface EdxUserDistrictEntity extends BaseApiEntity {
  edxUserID: string;
  districtID: string;
  edxUserDistrictID: string;
  edxUserDistrictRoles: EdxUserDistrictRoleEntity[];
}

declare interface EdxUserRoleEntity extends BaseApiEntity {
  edxUserSchoolRoleID: string;
  edxRoleCode: string;
  edxUserSchoolID: string;
}

declare interface EdxUserSchoolEntity extends BaseApiEntity {
  edxUserID: string;
  schoolID: string;
  edxUserSchoolID: string;
  edxUserSchoolRoles: EdxUserSchoolRoleEntity[];
}

declare interface EdxUserEntity extends BaseApiEntity {
  edxUserID: string;
  digitalIdentityID: string;
  firstName: string;
  lastName: string;
  email: string;
  edxUserSchools: EdxUserSchoolEntity[];
  edxUserDistricts: EdxUserDistrictEntity[];
}

type EdxUsersSearchParams = {
  params: {
    digitalId?: string;
    schoolID?: string;
    firstName?: string;
    lastName?: string;
    districtID?: string;
  }
}

interface EdxActivationRoleEntity extends BaseApiEntity {
  edxActivationRoleId: string;
  edxActivationCodeId: string;
}

type DistrictRole = 'SECURE_EXCHANGE' | 'EDX_DISTRICT_ADMIN' | 'STUDENT_DATA_COLLECTION';

interface EdxUserDistrictRoleEntity extends EdxActivationRoleEntity {
  edxRoleCode: DistrictRole;
}

interface EdxUserSchoolRoleEntity extends EdxActivationRoleEntity {
  edxRoleCode: string;
}

interface EdxActivationCodeEntity extends BaseApiEntity {
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

interface EdxUserDistrictEntity extends BaseApiEntity {
  edxUserID: string;
  districtID: string;
  edxUserDistrictID: string;
  edxUserDistrictRoles: EdxUserDistrictRoleEntity[];
}

interface EdxUserRoleEntity extends BaseApiEntity {
  edxUserSchoolRoleID: string;
  edxRoleCode: string;
  edxUserSchoolID: string;
}

interface EdxUserSchoolEntity extends BaseApiEntity {
  edxUserID: string;
  schoolID: string;
  edxUserSchoolID: string;
  edxUserSchoolRoles: EdxUserSchoolRoleEntity[];
}

interface EdxUserEntity extends BaseApiEntity {
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

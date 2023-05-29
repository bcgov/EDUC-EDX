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

interface DistrictEntity extends BaseApiEntity {
  districtId: string;
  districtNumber: string;
  faxNumber: string | null;
  phoneNumber: string | null;
  email: string | null;
  website: string | null;
  displayName: string;
  districtRegionCode: 'NOT_APPLIC' | 'KOOTENAYS' | 'OKANAGAN' | 'NORTHEAST' | 'FRASER' | 'METRO' | 'VAN_ISLE'
  | 'NORTHWEST' | 'OFFSHORE' | 'PSI' | 'YUKON';
  districtStatusCode: 'ACTIVE' | 'INACTIVE';
  contacts: DistrictContactEntity[];
  addresses: DistrictAddressEntity[];
  notes: NoteEntity[];
}

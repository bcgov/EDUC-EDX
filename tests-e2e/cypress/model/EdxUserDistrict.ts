import { EdxUserRole } from "./EdxUserRole";

export interface EdxUserDistrict{
  edxUserID?: string;
  createUser?: string;
  updateUser?: string;
  createDate?: string;
  updateDate?: string;
  districtID?: string;
  edxUserDistrictRoles?: EdxUserRole[];
}

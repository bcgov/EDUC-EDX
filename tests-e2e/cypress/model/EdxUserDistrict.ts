import { EdxUserRole } from "./EdxUserRole";

export interface EdxUserDistrict{
  createUser?: string;
  updateUser?: string;
  createDate?: string;
  updateDate?: string;
  districtID?: string;
  edxUserDistrictRoles?: EdxUserRole[];
}

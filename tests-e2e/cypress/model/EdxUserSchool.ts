import { EdxUserRole } from "./EdxUserRole";

export interface EdxUserSchool{
  createUser?: string;
  updateUser?: string;
  createDate?: string;
  updateDate?: string;
  schoolID?: string;
  edxUserSchoolRoles?: EdxUserRole[];
}

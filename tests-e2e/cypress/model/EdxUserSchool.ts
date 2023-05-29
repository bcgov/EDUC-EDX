import { EdxUserSchoolRole } from "./EdxUserSchoolRole";

export interface EdxUserSchool{
  createUser?: string;
  updateUser?: string;
  createDate?: string;
  updateDate?: string;
  schoolID?: string;
  edxUserSchoolRoles?: EdxUserSchoolRole[];
}

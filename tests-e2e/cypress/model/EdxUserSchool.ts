import { EdxUserSchoolRole } from "./EdxUserSchoolRole";

export interface EdxUserSchool{
      createUser?: string | undefined;
      updateUser?: string | undefined;
      createDate?: string | undefined;
      updateDate?: string | undefined;
      schoolID?: string | undefined;
      edxUserSchoolRoles?: EdxUserSchoolRole[] | undefined;
  }
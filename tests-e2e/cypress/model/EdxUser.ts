import { EdxUserSchool } from "./EdxUserSchool";

export interface EdxUser {
    createUser?: string | undefined;
    updateUser?: string | undefined;
    createDate?: string | undefined;
    updateDate?: string | undefined;
    digitalIdentityID?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    email?: string | undefined;
    edxUserSchools?:EdxUserSchool[] | undefined;
    edxUserDistricts?:[] | undefined;
}
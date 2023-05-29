import { EdxUserSchool } from "./EdxUserSchool";

export interface EdxUser {
    createUser?: string;
    updateUser?: string;
    createDate?: string;
    updateDate?: string;
    digitalIdentityID?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    edxUserSchools?: EdxUserSchool[];
    edxUserDistricts?: any[];
}

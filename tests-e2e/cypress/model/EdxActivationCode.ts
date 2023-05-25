import {EdxActivationRole} from "./EdxActivationRole";

class EdxActivationCode {
  createUser: string | undefined;
  updateUser: string | undefined;
  schoolID: string | undefined;
  districtID: string | undefined;
  activationCode: string | undefined;
  isPrimary: boolean | undefined;
  expiryDate: any | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  email: string | undefined;
  numberOfClicks: string | undefined;
  edxActivationRoles: EdxActivationRole[] | undefined;
}

export default EdxActivationCode;

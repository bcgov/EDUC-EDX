import {EdxActivationRole} from "./EdxActivationRole";

class EdxActivationCode {
  createUser?: string;
  updateUser?: string;
  schoolID?: string;
  districtID?: string;
  activationCode?: string;
  isPrimary?: boolean;
  expiryDate?: any;
  firstName?: string;
  lastName?: string;
  email?: string;
  numberOfClicks?: string;
  edxActivationRoles?: EdxActivationRole[];
}

export default EdxActivationCode;

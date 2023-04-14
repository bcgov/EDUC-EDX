import EdxActivationRole from "./EdxActivationRole";

class EdxActivationCode {
  createUser: string | undefined;
  updateUser: string | undefined;
  schoolID: null | undefined;
  districtID: null | undefined;

  activationCode: null | undefined;
  isPrimary: null | undefined;
  expiryDate: null | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  email: string | undefined;
  numberOfClicks: string | undefined;
  private edxActivationRoles: any[] | undefined;



  addActivationRole(activationRole: EdxActivationRole) {
    // @ts-ignore
    this.edxActivationRoles.push(activationRole);
  }
}

export default EdxActivationCode;

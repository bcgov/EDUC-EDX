class EdxActivationCode{
  constructor() {
    this.createUser = null;
    this.updateUser = null;
    this.createDate = null;
    this.updateDate = null;
    this.edxActivationCodeId = null;
    this.mincode = null;
    this.districtCode = null;
    this.activationCode = null;
    this.isPrimary = null;
    this.expiryDate = null;
    this.firstName = null;
    this.lastName = null;
    this.email = null;
    this.validationCode = null;
    this.isUrlClicked = null;
    this.edxActivationRoles = [];
  }

  addActivationRole(activationRole) {
    this.edxActivationRoles.push(activationRole);
  }
}

export default EdxActivationCode;

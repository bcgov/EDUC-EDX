class EdxUserDistrict {
  constructor() {
    this.createUser = null;
    this.updateUser = null;
    this.createDate = null;
    this.updateDate = null;
    this.districtID = null;
    this.edxUserDistrictRoles = [];
  }

  addEdxUserDistrictRoles(edxUserDistrictRole) {
    this.edxUserDistrictRoles.push(edxUserDistrictRole);
  }

  setEdxUserDistrictRoles(userDistrictRoles) {
    this.edxUserDistrictRoles = userDistrictRoles;
  }
}

export default EdxUserDistrict;

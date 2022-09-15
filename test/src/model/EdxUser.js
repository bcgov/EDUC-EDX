class EdxUser{

  constructor() {
    this.createUser = null;
    this.updateUser = null;
    this.createDate = null;
    this.updateDate = null;
    this.digitalIdentityID = null;
    this.firstName = null;
    this.lastName = null;
    this.email = null;
    this.edxUserSchools =[];
    this.edxUserDistricts =[];
  }
  addEdxUserSchool(edxUserSchool) {
    this.edxUserSchools.push(edxUserSchool);
  }

  addEdxUserDistrict(edxUserDistrict) {
    this.edxUserDistricts.push(edxUserDistrict);
  }
  setEdxUserSchools(edxUserSchools){
    this.edxUserSchools = edxUserSchools;
  }

  setEdxUserDistricts(edxUserDistricts){
    this.edxUserDistricts = edxUserDistricts;
  }
}

export default EdxUser;

class EdxUserSchool{
  constructor() {
    this.createUser = null;
    this.updateUser = null;
    this.createDate = null;
    this.updateDate = null;
    this.schoolID = null;
    this.edxUserSchoolRoles = [];
  }
  addEdxUserSchoolRoles(edxUserSchoolRole){
    this.edxUserSchoolRoles.push(edxUserSchoolRole);
  }
  setEdxUserSchoolRoles(edxUserSchoolRoles){
    this.edxUserSchoolRoles = edxUserSchoolRoles;
  }
}
export default  EdxUserSchool;

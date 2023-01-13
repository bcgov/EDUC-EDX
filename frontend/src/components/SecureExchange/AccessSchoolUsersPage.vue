<template>
  <v-container>
    <Spinner flat v-if="loading"/>
    <div v-else>
      <div v-if="this.schoolID">
        <v-row>
          <v-col cols="12" class="d-flex justify-start">
            <v-row no-gutters>
              <v-col cols="12">
                <h2 class="subjectHeading">{{schoolName}} - {{schoolMincode}}</h2>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="mt-1 d-flex justify-start">
            <v-icon class="mt-1" small color="#1976d2">mdi-arrow-left</v-icon>
            <a v-if="isDistrictUser" class="ml-1 mt-1" @click="backButtonClick">Return to School User Management</a>
            <a v-else class="ml-1 mt-1" @click="backButtonClick">Return to Dashboard</a>
          </v-col>
          <v-col class="d-flex justify-end">
            <v-chip id="primaryEdxActivationCode" :color="getChipColor()">
              <v-icon left>
                mdi-shield-key-outline
              </v-icon>Primary Activation Code:
              {{ this.primaryEdxActivationCode ? this.primaryEdxActivationCode.activationCode : `Code Not Found` }}
            </v-chip>
            <ClipboardButton id="copyPrimaryEdxActivationCodeButton" v-if="this.primaryEdxActivationCode" :copyText="this.primaryEdxActivationCode.activationCode" icon="$copy"></ClipboardButton>
          </v-col>
        </v-row>
        <v-row :class="['d-sm-flex', 'align-center', 'searchBox']">
          <v-col cols="12" md="4">
            <v-text-field id="name-text-field" label="Name" v-model="searchFilter.name" clearable></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-select id="roleName-select-field" clearable :items="schoolRoles" v-model="searchFilter.roleName" item-text="label"
                      item-value="edxRoleCode" label="Role"></v-select>
          </v-col>
          <v-col cols="12" md="4" :class="['text-right']">
            <PrimaryButton id="user-search-button" text="Clear" secondary @click.native="clearButtonClick"/>
            <PrimaryButton id="user-clear-button" text="Search" class="ml-2" @click.native="searchButtonClick"
                           :disabled="searchEnabled()"/>
          </v-col>
        </v-row>
        <!--  user info -->
        <Spinner v-if="loadingUsers"/>
        <v-row v-else>
          <v-col xl="4" cols="6" class="pb-0" v-for="user in filteredUsers" :key="user.digitalID">
            <AccessUserCard @refresh="getUsersData" :userRoles="getCurrentUserSchoolRoles(user)" :user="user" :institute-code="schoolID" :institute-roles="schoolRoles" institute-type-code="SCHOOL" institute-type-label="School"></AccessUserCard>
          </v-col>
          <v-col xl="4" cols="6" >
            <v-row>
              <v-col style="height: 180px">
                <v-card height="100%">
                  <v-card-title>
                    <v-row no-gutters>
                      <v-col class="d-flex justify-center mt-10">
                        <PrimaryButton icon="mdi-plus"
                                       :large-icon=true
                                       id="new-user-button"
                                       secondary
                                       text="Add New User"
                                       @click.native="newUserInviteSheet = !newUserInviteSheet"/>
                      </v-col>
                    </v-row>
                  </v-card-title>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <v-bottom-sheet
          v-model="newUserInviteSheet"
          inset
          no-click-animation
          scrollable
          persistent
        >
          <v-card
            id="newUserInviteVCard"
            v-if="newUserInviteSheet"
            class="information-window-v-card">
            <v-card-title id="newUserInviteVCardTitle" class="sheetHeader pt-1 pb-1">New User</v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <InviteUserPage
                :userRoles="schoolRoles"
                :institute-code="schoolID"
                institute-type-code="SCHOOL"
                instituteTypeLabel="School"
                :schoolName="schoolName"
                :schoolMincode="schoolMincode"
                @access-user:messageSent="closeNewUserModal"
                @access-user:updateRoles="updateUserRoles"
                @access-user:cancelMessage="closeNewUserModal"
              >
              </InviteUserPage>
            </v-card-text>
          </v-card>
        </v-bottom-sheet>
      </div>
      <div v-else>
        <v-row>
          <v-col class="d-flex justify-center">
            <v-card flat min-width="55em">
              <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
              <a class="ml-1 mt-1" @click="backButtonClick">Return to Dashboard</a>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="d-flex justify-center">
            <v-card min-width="55em" color="#F2F2F2">
              <v-card-title>
                <v-row justify="center">
                  <v-col class="d-flex justify-center">
                    <strong>Search a school below to manage their EDX Access</strong>
                  </v-col>
                </v-row>
              </v-card-title>
              <v-card-text>
                <v-row justify="center">
                  <v-col class="mx-2 d-flex justify-center">
                    <v-autocomplete
                      id='selectInstituteName'
                      class="pt-0 mt-n1"
                      prepend-inner-icon="mdi-account-box-outline"
                      v-model="instituteCode"
                      :items="schoolSearchNames"
                      color="#003366"
                      :label="instituteTypeLabel"
                      clearable
                      item-text="schoolCodeName"
                      item-value="schoolID"
                    ></v-autocomplete>
                    <PrimaryButton class="ml-4" id="manageSchoolButton" text="Manage School Access" v-on:click.native="manageSchoolButtonClicked" :disabled="!instituteCode"></PrimaryButton>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </div>
  </v-container>

</template>

<script>

import ApiService from '../../common/apiService';
import {setEmptyInputParams} from '@/utils/common';
import {isNotEmptyInputParams} from '@/utils/validation';
import {ApiRoutes} from '@/utils/constants';
import {mapGetters, mapState} from 'vuex';
import PrimaryButton from '@/components/util/PrimaryButton';
import AccessUserCard from './AccessUserCard';
import InviteUserPage from '@/components/SecureExchange/InviteUserPage';
import Spinner from '@/components/common/Spinner';
import ClipboardButton from '@/components/util/ClipboardButton';
import {sortBy} from 'lodash';

export default {
  name: 'AccessSchoolUsersPage',
  components: {InviteUserPage, PrimaryButton, AccessUserCard, Spinner, ClipboardButton},
  data() {
    return {
      newUserInviteSheet: false,
      schoolID: '',
      users: [],
      loading: true,
      schoolName: '',
      schoolMincode: '',
      loadingUsers: true,
      filteredUsers: [],
      roleMap:undefined,
      isDistrictUser: false,
      schoolSearchNames: [],
      searchFilter: {
        name: '',
        roleName: ''
      },
      primaryEdxActivationCode: null,
      instituteCode: '',
      instituteTypeLabel: 'Schools'
    };
  },
  async beforeMount() {
    if (this.schoolRoles.length === 0) {
      await this.$store.dispatch('edx/getSchoolExchangeRoles');
    }
    if(this.schoolsMap.size === 0) {
      await this.$store.dispatch('app/getInstitutesData');
    }
  },
  created() {
    this.$store.dispatch('auth/getUserInfo').then(() => {
      if(this.userInfo.activeInstituteType === 'SCHOOL') {
        this.isDistrictUser = false;
        this.schoolID = this.userInfo.activeInstituteIdentifier;
        this.getPrimaryEdxActivationCodeSchool();
        this.getUsersData();
        this.$store.dispatch('app/getInstitutesData').then(() => {
          this.setupSchoolFields();
          this.loading = false;
        });
      }else{
        this.isDistrictUser = true;
        this.$store.dispatch('app/getInstitutesData').then(() => {
          this.setupSchoolFields();
          this.loading = false;
        });
      }
    });
  },
  methods: {
    sortUserData(users){
      return users.sort((a, b) => {
        if (a.firstName > b.firstName) {
          return 1;
        } else if (a.firstName < b.firstName) {
          return -1;
        }
        return 0;
      } );
    },
    manageSchoolButtonClicked(){
      this.schoolID = this.instituteCode;
      this.setupSchoolFields();
      this.getPrimaryEdxActivationCodeSchool();
      this.getUsersData();
    },
    getUsersData() {
      this.loadingUsers = true;
      const payload = {params: {schoolID: this.schoolID}};
      ApiService.apiAxios.get(ApiRoutes.edx.USERS_URL, payload)
        .then(response => {
          this.filteredUsers = this.sortUserData(response.data);
          this.users = this.filteredUsers;
        }).finally(() => {
          this.loadingUsers = false;
        });
    },
    getCurrentUserSchoolRoles(user) {
      return user.edxUserSchools.filter(userSchool => userSchool.schoolID === this.schoolID)[0].edxUserSchoolRoles;
    },
    clearButtonClick() {
      setEmptyInputParams(this.searchFilter);
      this.searchButtonClick();
    },
    searchButtonClick() {
      this.filteredUsers = this.users
        .filter(user => {
          return this.nameFilter(user, this.searchFilter?.name) && this.roleFilter(user, this.searchFilter?.roleName);
        });
    },
    nameFilter(user, name) {
      if (name) {
        return `${user.firstName} ${user.lastName}`.toLowerCase().includes(name.toLowerCase());
      }
      return true;
    },
    roleFilter(user, roleName) {
      if (roleName) {
        return user.edxUserSchools[0].edxUserSchoolRoles.some(role => role.edxRoleCode === roleName);
      }
      return true;
    },
    backButtonClick() {
      if(this.isDistrictUser && this.schoolID){
        this.loading = true;
        this.schoolID = '';
        this.instituteCode = '';
        this.setupSchoolFields();
        this.loading = false;
      }else{
        this.$router.push({name: 'home'});
      }
    },
    searchEnabled() {
      return !isNotEmptyInputParams(this.searchFilter);
    },
    updateUserRoles(newValue){
      this.$store.commit('edx/setSchoolRoles', newValue);
    },
    getChipColor(){
      if(this.primaryEdxActivationCode){
        return 'success';
      }
      return 'secondary';
    },
    setupSchoolFields() {
      if(this.schoolID){
        this.schoolName = this.schoolsMap.get(this.schoolID).schoolName;
        this.schoolMincode = this.schoolsMap.get(this.schoolID).mincode;
      }else{
        this.setupSchoolList();
      }
    },
    closeNewUserModal(){
      this.$store.commit('edx/setSchoolRoles', JSON.parse(JSON.stringify(this.schoolRolesCopy)));
      this.newUserInviteSheet = false;
    },
    setupSchoolList(){
      for(const school of this.activeSchoolsMap.values()){
        let schoolItem = {
          schoolCodeName: school.mincode +' - '+school.schoolName,
          schoolID: school.schoolID,
          districtID: school.districtID,
        };
        this.schoolSearchNames.push(schoolItem);
      }
      this.schoolSearchNames = sortBy(this.schoolSearchNames.filter((school => school.districtID === this.userInfo?.activeInstituteIdentifier)), ['schoolCodeName']);
    },
    getPrimaryEdxActivationCodeSchool() {
      ApiService.apiAxios.get(`${ApiRoutes.edx.PRIMARY_ACTIVATION_CODE_URL}/SCHOOL/${this.schoolID}`)
        .then(response => {
          this.primaryEdxActivationCode = response.data;
        }).catch(e => {
          this.primaryEdxActivationCode = null;
          if(e.status !== 404){
            console.log(e);
          }
        });
    },
  },
  computed: {
    ...mapState('app', ['schoolsMap', 'activeSchoolsMap']),
    ...mapState('edx', ['schoolRoles','schoolRolesCopy']),
    ...mapGetters('auth', ['userInfo']),

  }
};
</script>

<style scoped>
.sheetHeader{
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}

.divider {
  border-color: #FCBA19;
  border-width: medium;
}

.searchBox {
  padding-left: 1em;
  padding-right: 1em;
  margin-left: 0;
  margin-right: 0;
  border-radius: 5px;
  background-color: #F2F2F2;
}

.card-hint {
  color: #000 !important;
  font-size: 1rem;
}
.v-dialog__content >>> .v-bottom-sheet {
  width: 30% !important;
}

@media screen and (max-width: 950px){
  .v-dialog__content /deep/ .v-bottom-sheet {
    width: 60% !important;
  }

  .subjectHeading {
    font-size: medium;
  }
}

</style>

<template>
  <v-container>
    <Spinner
      v-if="loading"
      flat
    />
    <div v-else>
      <div v-if="schoolID">
        <v-row>
          <v-col
            cols="12"
            class="d-flex justify-start"
          >
            <v-row no-gutters>
              <v-col cols="12">
                <h2 class="subjectHeading">
                  {{ schoolName }} - {{ schoolMincode }}
                </h2>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="mt-1 d-flex justify-start">
            <v-icon
              class="mt-1"
              small
              color="#1976d2"
            >
              mdi-arrow-left
            </v-icon>
            <a
              v-if="isDistrictUser"
              class="ml-1 mt-1"
              @click="backButtonClick"
            >Return to School User Management</a>
            <a
              v-else
              class="ml-1 mt-1"
              @click="backButtonClick"
            >Return to Dashboard</a>
          </v-col>
          <v-col class="d-flex justify-end">
            <v-chip
              id="primaryEdxActivationCode"
              :color="getChipColor()"
            >
              <v-icon left>
                mdi-shield-key-outline
              </v-icon>Primary Activation Code:
              {{ primaryEdxActivationCode ? primaryEdxActivationCode.activationCode : `Code Not Found` }}
            </v-chip>
            <ClipboardButton
              v-if="primaryEdxActivationCode"
              id="copyPrimaryEdxActivationCodeButton"
              :copy-text="primaryEdxActivationCode.activationCode"
              icon="mdi-content-copy"
              class="color: white"
            />
            <PrimaryButton
              id="toggleGenerateNewPrimaryEdxActivationCodeDialogVisibilityButton"
              short
              secondary
              icon="mdi-sync"
              text="Generate"
              class="mt-n1 ml-2 pl-2 pr-2"
              :click-action="toggleGenerateNewPrimaryEdxActivationCodeDialogVisibility"
            />
          </v-col>
        </v-row>
        <v-expand-transition>
          <v-row
            v-if="doShowGenerateNewPrimaryEdxActivationCodeDialog"
            id="generateNewPrimaryEdxActivationCodeDialog"
            :class="['d-sm-flex', 'align-center', 'searchBox']"
            class="px-2 mb-4"
            style="margin-right: 14em;margin-left: 14em;"
          >
            <v-col>
              <v-row no-gutters>
                <v-col>
                  <span>Generating a new Primary Activation Code for a school will replace the existing code for the school. The new code will have to be communicated to the school administrator.</span>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <p>Are you sure that you want to generate a new Primary Activation Code?</p>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col class="d-flex justify-end">
                  <PrimaryButton
                    id="closeGenerateNewPrimaryEdxActivationCodeDialogButton"
                    text="No"
                    secondary
                    class="ml-2"
                    :click-action="closeGenerateNewPrimaryEdxActivationCodeDialog"
                  />
                  <PrimaryButton
                    id="doGeneratePrimaryEdxActivationCodeButton"
                    text="Yes"
                    class="ml-2"
                    :click-action="doGeneratePrimaryEdxActivationCode"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-expand-transition>
        <v-row :class="['d-sm-flex', 'align-center', 'searchBox']">
          <v-col
            cols="12"
            md="4"
            class="mt-6"
          >
            <v-text-field
              id="name-text-field"
              v-model="searchFilter.name"
              variant="underlined"
              label="Name"
              clearable
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
            class="mt-6"
          >
            <v-select
              id="roleName-select-field"
              v-model="searchFilter.roleName"
              variant="underlined"
              clearable
              :items="schoolRoles"
              item-title="label"
              item-value="edxRoleCode"
              label="Role"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
            :class="['text-right']"
          >
            <PrimaryButton
              id="user-search-button"
              text="Clear"
              secondary
              :click-action="clearButtonClick"
            />
            <PrimaryButton
              id="user-clear-button"
              text="Search"
              class="ml-2"
              :click-action="searchButtonClick"
              :disabled="searchEnabled()"
            />
          </v-col>
        </v-row>
        <!--  user info -->
        <Spinner v-if="loadingUsers" />
        <v-row
          v-else
          class="d-flex"
          align="stretch"
        >
          <v-col
            v-for="user in filteredUsers"
            :key="user.digitalID"
            xl="4"
            cols="6"
            class="pb-0"
          >
            <AccessUserCard
              :user-roles="getCurrentUserSchoolRoles(user)"
              :user="user"
              :institute-code="schoolID"
              :institute-roles="schoolRoles"
              institute-type-code="SCHOOL"
              institute-type-label="School"
              @refresh="getUsersData"
            />
          </v-col>
          <v-col
            xl="4"
            cols="6"
            class="pb-0"
          >
            <v-card class="add-new-user h-100">
              <v-row
                class="h-100"
                align="center"
                justify="center"
                no-gutters
              >
                <v-col class="text-center">
                  <PrimaryButton
                    id="new-user-button"
                    icon="mdi-plus"
                    :large-icon="true"
                    secondary
                    icon-left
                    text="Add New User"
                    :click-action="openInviteUserSheet"
                  />
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <v-navigation-drawer
          v-model="newUserInviteSheet"
          inset
          no-click-animation
          style="width: 50%; height: max-content; left: 25%;"
          location="bottom"
          scrollable
          temporary
          persistent
        >
          <v-card
            v-if="newUserInviteSheet"
            id="newUserInviteVCard"
            class="information-window-v-card"
          >
            <v-card-title
              id="newUserInviteVCardTitle"
              class="sheetHeader pt-1 pb-1"
            >
              New User for {{ schoolName + ' (' + schoolMincode + ')' }}
            </v-card-title>
            <v-divider />
            <v-card-text>
              <InviteUserPage
                :user-roles="schoolRoles"
                :institute-code="schoolID"
                institute-type-code="SCHOOL"
                institute-type-label="School"
                :school-name="schoolName"
                :school-mincode="schoolMincode"
                @access-user:message-sent="closeNewUserModal"
                @access-user:update-roles="updateUserRoles"
                @access-user:cancel-message="closeNewUserModal"
              />
            </v-card-text>
          </v-card>
        </v-navigation-drawer>
      </div>
      <div v-else>
        <v-row>
          <v-col class="d-flex justify-center">
            <v-card
              flat
              min-width="55em"
            >
              <v-icon
                small
                color="#1976d2"
              >
                mdi-arrow-left
              </v-icon>
              <a
                class="ml-1 mt-1"
                @click="backButtonClick"
              >Return to Dashboard</a>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="d-flex justify-center">
            <v-card
              min-width="55em"
              color="#F2F2F2"
            >
              <v-card-title>
                <v-row
                  class="mt-0"
                  justify="center"
                >
                  <v-col class="d-flex justify-center">
                    <strong>Search a school below to manage their EDX Access</strong>
                  </v-col>
                </v-row>
              </v-card-title>
              <v-card-text>
                <v-row justify="center">
                  <v-col class="mx-2 d-flex justify-center">
                    <v-autocomplete
                      id="selectInstituteName"
                      v-model="instituteCode"
                      variant="underlined"
                      :items="schoolSearchNames"
                      color="#003366"
                      :label="instituteTypeLabel"
                      single-line
                      clearable
                      item-title="schoolCodeName"
                      item-value="schoolID"
                    />
                    <PrimaryButton
                      id="manageSchoolButton"
                      class="ml-4 mt-3"
                      text="Manage School Access"
                      :click-action="manageSchoolButtonClicked"
                      :disabled="!instituteCode"
                    />
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
import {setEmptyInputParams} from '../../utils/common';
import {isNotEmptyInputParams} from '../../utils/validation';
import {ApiRoutes} from '../../utils/constants';
import { authStore } from '../../store/modules/auth';
import { appStore } from '../../store/modules/app';
import { edxStore } from '../../store/modules/edx';
import { mapState } from 'pinia';
import PrimaryButton from '../util/PrimaryButton.vue';
import AccessUserCard from './AccessUserCard.vue';
import InviteUserPage from '../SecureExchange/InviteUserPage.vue';
import Spinner from '../common/Spinner.vue';
import ClipboardButton from '../util/ClipboardButton.vue';
import {sortBy} from 'lodash';
import alertMixin from '../../mixins/alertMixin';

export default {
  name: 'AccessSchoolUsersPage',
  components: {InviteUserPage, PrimaryButton, AccessUserCard, Spinner, ClipboardButton},
  mixins: [alertMixin],
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
        name: null,
        roleName: null
      },
      primaryEdxActivationCode: null,
      instituteCode: '',
      instituteTypeLabel: 'School',
      doShowGenerateNewPrimaryEdxActivationCodeDialog: false
    };
  },
  computed: {
    ...mapState(appStore, ['schoolsMap', 'activeSchoolsMap']),
    ...mapState(edxStore, ['schoolRoles','schoolRolesCopy']),
    ...mapState(authStore, ['userInfo']),
  },
  async beforeMount() {
    if (this.schoolRoles.length === 0) {
      await edxStore().getSchoolExchangeRoles();
    }
    if(this.schoolsMap.size === 0) {
      await appStore().getInstitutesData();
    }
  },
  created() {
    authStore().getUserInfo().then(() => {
      if(this.userInfo.activeInstituteType === 'SCHOOL') {
        this.isDistrictUser = false;
        this.schoolID = this.userInfo.activeInstituteIdentifier;
        this.getPrimaryEdxActivationCodeSchool();
        this.getUsersData();
        appStore().getInstitutesData().then(() => {
          this.setupSchoolFields();
          this.loading = false;
        });
      }else{
        this.isDistrictUser = true;
        appStore().getInstitutesData().then(() => {
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
      edxStore().setDistrictRoles(newValue);
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
      edxStore().setSchoolRoles(JSON.parse(JSON.stringify(this.schoolRolesCopy)));
      this.newUserInviteSheet = false;
    },
    openInviteUserSheet(){
      this.newUserInviteSheet = !this.newUserInviteSheet;
    },
    toggleGenerateNewPrimaryEdxActivationCodeDialogVisibility() {
      this.doShowGenerateNewPrimaryEdxActivationCodeDialog = !this.doShowGenerateNewPrimaryEdxActivationCodeDialog;
    },
    closeGenerateNewPrimaryEdxActivationCodeDialog() {
      this.doShowGenerateNewPrimaryEdxActivationCodeDialog = false;
    },
    doGeneratePrimaryEdxActivationCode() {
      this.generateOrRegeneratePrimaryEdxActivationCode();
      this.closeGenerateNewPrimaryEdxActivationCodeDialog();
    },
    generateOrRegeneratePrimaryEdxActivationCode() {
      ApiService.apiAxios.post(`${ApiRoutes.edx.PRIMARY_ACTIVATION_CODE_URL}/school/${this.schoolID}`)
        .then(response => {
          this.primaryEdxActivationCode = response.data;
          this.setSuccessAlert(`The new Primary Activation Code is ${ this.primaryEdxActivationCode.activationCode }.`);
        }).catch (e => {
          this.primaryEdxActivationCode = null;
          this.setFailureAlert('There was an error generating the Primary Activation code. Please try again.',);
          console.log(e);
        });
    },
    setupSchoolList(){
      this.schoolSearchNames = [];
      for(const school of this.activeSchoolsMap.values()){
        let schoolItem = {
          schoolCodeName: school.schoolName + ' - ' + school.mincode,
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
  }
};
</script>

<style scoped>
.add-new-user { min-height: 184px; }
.sheetHeader{
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}

.searchBox {
  padding-left: 1em;
  padding-right: 1em;
  margin-left: 0;
  margin-right: 0;
  border-radius: 5px;
  background-color: #F2F2F2;
}

@media screen and (max-width: 950px){
  .subjectHeading {
    font-size: medium;
  }
}

</style>

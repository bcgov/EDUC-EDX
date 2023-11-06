<template>
  <v-container>
    <Spinner
      v-if="loading"
      flat
    />
    <div v-else>
      <div>
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
            <v-tooltip
              v-model="showTooltip"
              location="right"
              :open-on-hover="false"
            >
              <template #activator="{ props }">
                <v-chip
                  :class="primaryEdxActivationCode != null ? 'primary_color' : 'secondary_color'"
                  v-bind="props"
                  class="mr-1"
                  append-icon="mdi-content-copy"
                  @click="copy(primaryEdxActivationCode?.activationCode)"
                >
                  <v-icon left>
                    mdi-shield-key-outline
                  </v-icon>
                  <span class="hidden-sm-and-down">
                    Primary Activation Code:
                  </span>
                  <span id="primaryEdxActivationCode">
                    {{ primaryEdxActivationCode ? primaryEdxActivationCode.activationCode : `Code Not Found` }}
                  </span>
                </v-chip>
                <PrimaryButton
                  id="toggleGenerateNewPrimaryEdxActivationCodeDialogVisibilityButton"
                  short
                  secondary
                  icon="mdi-sync"
                  text="Generate"
                  class="mt-n1 ml-2 pl-2 pr-2"
                  :click-action="toggleGenerateNewPrimaryEdxActivationCodeDialogVisibility"
                />
              </template>
              <span>Copied {{ primaryEdxActivationCode?.activationCode }}.</span>
            </v-tooltip>
          </v-col>
        </v-row>
        <v-expand-transition>
          <v-row
            v-if="doShowGenerateNewPrimaryEdxActivationCodeDialog"
            id="generateNewPrimaryEdxActivationCodeDialog"
            class="px-2 mb-4 d-sm-flex align-center searchBox"
          >
            <v-col>
              <v-row no-gutters>
                <v-col>
                  <span>Generating a new Primary Activation Code for a school will replace the existing code for the school.</span>
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
        <v-row class="d-sm-flex align-center searchBox">
          <v-col
            cols="12"
            md="4"
            class="py-0 my-0"
          >
            <v-text-field
              id="name-text-field"
              v-model="searchFilter.name"
              variant="underlined"
              label="Name"
              :clearable="true"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
            class="py-0 my-0"
          >
            <v-select
              id="roleName-select-field"
              v-model="searchFilter.roleName"
              variant="underlined"
              :clearable="true"
              :items="filteredSchoolRoles"
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
        <!-- warning message for no existing users-->
        <v-row v-if="!hasAdminUsers && primaryEdxActivationCode">
          <v-col class="mx-3 px-0 pb-0">
            <v-alert
              density="compact"
              color="#003366"
              type="info"
              class="px-2"
              variant="tonal"
            >
              The Primary Activation Code will have to be communicated to any new users, as there are no school level administrators.
            </v-alert>
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
            lg="4"
            sm="6"
            cols="12"
            class="pb-0"
          >
            <AccessUserCard
              :user-roles="getCurrentUserSchoolRoles(user)"
              :user="user"
              :institute-code="schoolID"
              :institute-roles="filteredSchoolRoles"
              institute-type-code="SCHOOL"
              institute-type-label="School"
              @refresh="getUsersData"
            />
          </v-col>
          <v-col
            lg="4"
            sm="6"
            cols="12"
            class="pb-0"
          >
            <v-card class="add-new-user d-flex align-center flex-column" min-height="17.5em">
              <v-row
                class="add-new-user"
                align="center"
                justify="center"
              >
                <v-col class="justify-center">
                  <PrimaryButton
                    id="new-user-button"
                    icon="mdi-plus"
                    :large-icon="true"
                    :secondary="primaryEdxActivationCode != null"
                    :disabled="!primaryEdxActivationCode"
                    icon-left
                    text="Add New User"
                    :click-action="openInviteUserSheet"
                  />
                </v-col>
              </v-row>
              <v-row class="align-end h-0 mt-n16" v-if="!primaryEdxActivationCode">
                <v-col class="mx-3 mb-3">
                  <v-alert
                    dense
                    color="#E9EBEF"
                    outlined
                    type="info"
                    class="pa-2"
                  >
                    <span
                      id="no-activation-code-banner"
                      style="color: #003366"
                    >Before adding users, a Primary Activation Code must be generated.</span>
                  </v-alert>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <v-bottom-sheet
          v-model="newUserInviteSheet"
          :no-click-animation="true"
          :inset="true"
          :persistent="true"
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
                :user-roles="filteredSchoolRoles"
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
        </v-bottom-sheet>
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
import InviteUserPage from './InviteUserPage.vue';
import Spinner from '../common/Spinner.vue';
import alertMixin from '../../mixins/alertMixin';
import { ROLES } from '../../utils/constants/Roles.js';
import { PERMISSION } from '../../utils/constants/Permission';

export default {
  name: 'SchoolUsersAccessDetailsPage',
  components: {InviteUserPage, PrimaryButton, AccessUserCard, Spinner},
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      newUserInviteSheet: false,
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
      doShowGenerateNewPrimaryEdxActivationCodeDialog: false,
      showTooltip: false
    };
  },
  computed: {
    ...mapState(appStore, ['schoolsMap', 'notClosedSchoolsMap', 'config']),
    ...mapState(edxStore, ['schoolRoles','schoolRolesCopy']),
    ...mapState(authStore, ['userInfo']),
    hasAdminUsers() {
      return this.users.filter(user => {
        return user.edxUserSchools.some(school => school.edxUserSchoolRoles.some(role => role.edxRoleCode === ROLES.EDX_SCHOOL_ADMIN));
      })?.length > 0;
    },
    filteredSchoolRoles() {
      return this.config.DISABLE_SDC_FUNCTIONALITY ? this.schoolRoles.filter(role => role.edxRoleCode !== PERMISSION.STUDENT_DATA_COLLECTION) : this.schoolRoles;
    }
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
      }else{
        this.isDistrictUser = true;
      }
      appStore().getInstitutesData().then(() => {
        this.setupSchoolFields();
        this.getPrimaryEdxActivationCodeSchool();
        this.getUsersData();
        this.loading = false;
      });
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
      this.$router.push({name: 'schoolAccess'});
    },
    searchEnabled() {
      return !isNotEmptyInputParams(this.searchFilter);
    },
    updateUserRoles(newValue){
      edxStore().setDistrictRoles(newValue);
    },
    setupSchoolFields() {
      this.schoolName = this.schoolsMap.get(this.schoolID).schoolName;
      this.schoolMincode = this.schoolsMap.get(this.schoolID).mincode;
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
    copy(text) {
      navigator.clipboard.writeText(text).then(() => {
        this.showTooltip = true;
        setTimeout(() => this.showTooltip = false, 2000);
      });
    }
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

.searchBox {
  margin: 0;
  padding-left: 1em;
  padding-right: 1em;
  border-radius: 5px;
  background-color: rgb(235, 237, 239);
}

.primary_color {
  background-color: #4caf50;
  color: white;
}

.secondary_color {
  background-color: #424242;
  color: white;
}


:deep(.mdi-information){
  color: #003366;
}

@media screen and (max-width: 950px){
  .subjectHeading {
    font-size: medium;
  }
}

</style>

<template>
  <v-container>
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
              <span>Generating a new Primary Activation Code for a district will replace the existing code for the district. The new code will have to be communicated to the district administrator.</span>
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
        class="mt-3"
        cols="12"
        md="4"
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
        class="mt-3"
        cols="12"
        md="4"
      >
        <v-select
          id="roleName-select-field"
          v-model="searchFilter.roleName"
          variant="underlined"
          clearable
          :items="districtRoles"
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
      v-else-if="filteredUsers.length"
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
          :user-roles="getCurrentUserDistrictRoles(user)"
          :user="user"
          :institute-code="districtID"
          :institute-roles="districtRoles"
          institute-type-code="DISTRICT"
          institute-type-label="District"
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
                :click-action="openNewUserSheet"
              />
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col class="d-flex justify-center">
        No users found
      </v-col>
    </v-row>

    <v-navigation-drawer
      v-model="newUserInviteSheet"
      inset
      location="bottom"
      style="width: 50%; height: max-content; left: 25%;"
      no-click-animation
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
          New User
        </v-card-title>
        <v-divider />
        <v-card-text>
          <InviteUserPage
            :user-roles="districtRoles"
            :institute-code="districtID"
            institute-type-code="DISTRICT"
            institute-type-label="District"
            :district-name="districtName"
            :district-number="districtNumber"
            @access-user:message-sent="closeNewUserModal"
            @access-user:update-roles="updateUserRoles"
            @access-user:cancel-message="closeNewUserModal"
          />
        </v-card-text>
      </v-card>
    </v-navigation-drawer>
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
import Spinner from '../common/Spinner.vue';
import ClipboardButton from '../util/ClipboardButton.vue';
import InviteUserPage from '../SecureExchange/InviteUserPage.vue';
import alertMixin from '../../mixins/alertMixin';

export default {
  name: 'AccessDistrictUsersPage',
  components: {ClipboardButton, InviteUserPage, PrimaryButton, AccessUserCard, Spinner},
  mixins: [alertMixin],
  data() {
    return {
      newUserInviteSheet: false,
      districtID: '',
      districtName: '',
      districtNumber: '',
      users: [],
      loadingUsers: true,
      filteredUsers: [],
      roleMap:undefined,
      searchFilter: {
        name: null,
        roleName: null
      },
      primaryEdxActivationCode: null,
      instituteTypeLabel: 'District',
      doShowGenerateNewPrimaryEdxActivationCodeDialog: false
    };
  },
  computed: {
    ...mapState(appStore, ['districtsMap']),
    ...mapState(edxStore, ['districtRoles','districtRolesCopy']),
    ...mapState(authStore, ['userInfo']),
  },
  async beforeMount() {
    if (this.districtRoles.length === 0) {
      await edxStore().getDistrictExchangeRoles();
    }
    if(this.districtsMap.size === 0) {
      await appStore().getInstitutesData();
    }
  },
  created() {
    authStore().getUserInfo().then(() => {
      this.districtID = this.userInfo.activeInstituteIdentifier;
      this.getUsersData();
      this.getDistrictInformation();
      if (this.userInfo.activeInstituteType === 'DISTRICT') {
        this.getPrimaryEdxActivationCodeDistrict();
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
    getUsersData() {
      this.loadingUsers = true;
      const payload = {params: {districtID: this.districtID}};
      ApiService.apiAxios.get(ApiRoutes.edx.USERS_URL, payload)
        .then(response => {
          this.filteredUsers = this.sortUserData(response.data);
          this.users = this.filteredUsers;
        }).finally(() => {
          this.loadingUsers = false;
        });
    },
    getDistrictInformation() {
      ApiService.apiAxios.get(`${ApiRoutes.DISTRICT_DATA_URL}/${this.districtID}`)
        .then(response => {
          this.districtNumber = response.data.districtNumber;
          this.districtName = response.data.name;
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
    getCurrentUserDistrictRoles(user) {
      return user.edxUserDistricts.filter(userDistrict => userDistrict.districtID === this.districtID)[0].edxUserDistrictRoles;
    },
    clearButtonClick() {
      setEmptyInputParams(this.searchFilter);
      this.searchButtonClick();
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
      ApiService.apiAxios.post(`${ApiRoutes.edx.PRIMARY_ACTIVATION_CODE_URL}/DISTRICT/${this.districtID}`)
        .then(response => {
          this.primaryEdxActivationCode = response.data;
          this.setSuccessAlert(`The new Primary Activation Code is ${ this.primaryEdxActivationCode.activationCode }.`);
        }).catch (e => {
          this.primaryEdxActivationCode = null;
          this.setFailureAlert('There was an error generating the Primary Activation code. Please try again.',);
          console.log(e);
        });
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
        return user.edxUserDistricts[0].edxUserDistrictRoles.some(role => role.edxRoleCode === roleName);
      }
      return true;
    },
    backButtonClick() {
      this.$router.push({name: 'home'});
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
    closeNewUserModal(){
      edxStore().setDistrictRoles(JSON.parse(JSON.stringify(this.districtRolesCopy)));
      this.newUserInviteSheet = false; // close the modal window.
    },
    openNewUserSheet(){
      this.newUserInviteSheet = !this.newUserInviteSheet;
    },
    getPrimaryEdxActivationCodeDistrict() {
      ApiService.apiAxios.get(`${ApiRoutes.edx.PRIMARY_ACTIVATION_CODE_URL}/DISTRICT/${this.districtID}`)
        .then(response => {
          this.primaryEdxActivationCode = response.data;
        }).catch(e => {
          this.primaryEdxActivationCode = null;
          console.log(e);
        });
    },
  }
};
</script>

<style scoped>
.add-new-user { min-height: 184px; }
.sheetHeader {
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

</style>

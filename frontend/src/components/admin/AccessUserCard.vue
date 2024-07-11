<template>
  <v-card
    :id="`edxUser-${user.edxUserID}`"
    class="d-flex flex-column h-100"
  >
    <v-card-title class="pb-0">
      <v-row no-gutters>
        <v-col cols="9">
          <span style="white-space: break-spaces">
            <strong class="contactName">{{ userDisplayName }}</strong>
          </span>
        </v-col>
        <v-row no-gutters>
          <v-col
            cols="12"
            class="pt-1"
          />
        </v-row>
      </v-row>
    </v-card-title>
    <v-card-subtitle />
    <v-card-subtitle>
      <p
        v-if="getExpiryDate(user)"
        class="expiry-date"
      >
        {{ formatExpiryDate(getExpiryDate(user)) }}
      </p>
    </v-card-subtitle>

    <v-card-text class="pb-0">
      <v-list class="pt-0">
        <v-list-item
          v-if="user.email"
          class="pl-0"
        >
          <v-icon
            icon="mdi-email"
            style="margin-bottom: 3px;"
            start
          />
          <span id="user-email"> {{ user.email }}</span>
        </v-list-item>
      </v-list>
    </v-card-text>
    <v-card-text
      class="pt-0"
    >
      <div>
        <v-chip
          v-for="role in userRoles"
          :key="role.edxRoleCode"
          disabled
          class="ma-1"
        >
          {{ getRoleLabel(role) }}
        </v-chip>
      </div>
    </v-card-text>
    <ConfirmationDialog ref="confirmRemoveUser">
      <template #message>
        <p>Are you sure you want to remove this user's access for the {{ instituteTypeLabel.toLowerCase() }}?</p>
      </template>
    </ConfirmationDialog>
    <ConfirmationDialog ref="confirmRelinkUser">
      <template #message>
        <p class="mb-4">
          Re-linking an account will remove the current user and resend the activation code so
          that the user can set up EDX access with their new credentials.
        </p>
        <p class="font-weight-bold">
          Are you sure you want to re-link this account?
        </p>
      </template>
    </ConfirmationDialog>
    <v-spacer />
    <v-card-actions
      v-if="isNotSameEdxUser() || hasEDXUserAdminPermission()"
      class="justify-start"
    >
      <v-btn
        :id="`user-edit-button-${user.edxUserID}`"
        color="#003366"
        variant="text"
        @click="clickEditButton"
      >
        Edit
      </v-btn>
      <v-btn
        v-if="isNotSameEdxUser()"
        :id="`user-remove-button-${user.edxUserID}`"
        color="red"
        variant="text"
        @click="clickDeleteButton"
      >
        Remove
      </v-btn>
      <v-btn
        v-if="isNotSameEdxUser()"
        :id="`user-relink-button-${user.edxUserID}`"
        color="#003366"
        variant="text"
        @click="clickRelinkButton"
      >
        Re-link
      </v-btn>
    </v-card-actions>
  </v-card>
  <v-bottom-sheet
    v-model="editUserSheet"
    :no-click-animation="true"
    :inset="true"
    :persistent="true"
  >
    <v-card
      v-if="editUserSheet"
      id="editUserVCard"
      class="information-window-v-card"
    >
      <v-card-title
        id="editUserInviteVCardTitle"
        class="sheetHeader pt-1 pb-1"
      >
        Edit {{ userDisplayName }}
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-alert
          v-if="!isNotSameEdxUser()"
          id="logoutAlert"
          class="mt-4"
          color="#003366"
          density="compact"
          type="info"
          variant="tonal"
        >
          <span>For access changes to take effect, you will need to log out and back in.</span>
        </v-alert>
        <v-alert
          v-if="!minimumRolesSelected"
          id="logoutAlert"
          class="mt-4"
          color="#003366"
          density="compact"
          type="info"
          variant="tonal"
        >
          <span>Please select at least one role for {{ userDisplayName }}.</span>
        </v-alert>
        <v-alert
          v-else-if="roleListValidMessage !== null"
          id="logoutAlert"
          class="mt-4"
          color="#003366"
          density="compact"
          type="info"
          variant="tonal"
        >
          <span>{{ roleListValidMessage }}</span>
        </v-alert>
        <v-list
          :id="`access-user-roles-${user.edxUserID}`"
          v-model:selected="selectedRoles"
          lines="two"
          return-object
          select-strategy="classic"
        >
          <div
            v-for="newrole in instituteRoles"
            :key="newrole.edxRoleCode"
            :value="newrole.edxRoleCode"
          >
            <v-list-item
              :value="newrole.edxRoleCode"
            >
              <template #prepend="{ isActive }">
                <v-list-item-action>
                  <v-checkbox-btn :model-value="isActive" />
                </v-list-item-action>
              </template>

              <v-list-item-title>{{ newrole.label }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ newrole.roleDescription }}
              </v-list-item-subtitle>
            </v-list-item>
          </div>
        </v-list>

        <DatePicker
          id="accessExpiryDate"
          v-model="accessExpiryDate"
          class="pl-7"
          label="Access Expiry Date"
          model-type="yyyy-MM-dd'T'00:00:00"
          :min-date="minExpiryDate"
          :allow-teleport="true"
          @clear-date="clearExpiryDate"
        />
        <v-row
          no-gutters
          class="py-4 justify-end"
        >
          <v-col class="mt-0 d-flex justify-end">
            <PrimaryButton
              :id="`user-cancel-edit-button-${user.edxUserID}`"
              width="5em"
              text="Cancel"
              class="mr-2"
              secondary
              variant="flat"
              :click-action="clickEditButton"
            />
            <PrimaryButton
              :id="`user-save-action-button-${user.edxUserID}`"
              text="Save"
              :disabled="!minimumRolesSelected || roleListValidMessage !== null"
              variant="flat"
              :click-action="clickSaveButton"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>
<script>
import PrimaryButton from '../util/PrimaryButton.vue';
import ApiService from '../../common/apiService';
import alertMixin from '../../mixins/alertMixin';
import {ApiRoutes, EDX_SAGA_REQUEST_DELAY_MILLISECONDS} from '../../utils/constants';
import { authStore } from '../../store/modules/auth';
import { edxStore } from '../../store/modules/edx';
import { mapState } from 'pinia';
import {formatDate} from '../../utils/format';
import DatePicker from '../util/DatePicker.vue';
import {DateTimeFormatter, LocalDate} from '@js-joda/core';
import {PERMISSION} from '../../utils/constants/Permission';
import {ROLES} from '../../utils/constants/Roles';
import ConfirmationDialog from '../util/ConfirmationDialog.vue';

export default {
  name: 'AccessUserCard',
  components: {ConfirmationDialog, PrimaryButton, DatePicker},
  mixins: [alertMixin],
  props: {
    user: {
      type: Object,
      required: true
    },
    userRoles: {
      type: Array,
      required: true
    },
    instituteRoles: {
      type: Array,
      required: true
    },
    instituteCode: {
      type: String,
      required: true
    },
    instituteTypeLabel: {
      type: String,
      required: true
    },
    instituteTypeCode: {
      type: String,
      required: true
    },
  },
  emits: ['refresh'],
  data() {
    return {
      editUserSheet: false,
      deleteState: false,
      relinkState: false,
      selectedRoles: [],
      accessExpiryDate: null,
      minExpiryDate: LocalDate.now().atStartOfDay().format(DateTimeFormatter.ofPattern('yyyy-MM-dd\'T\'HH:mm:ss')).toString()
    };
  },
  computed: {
    ...mapState(edxStore, ['schoolRoles']),
    ...mapState(authStore, ['userInfo']),
    minimumRolesSelected() {
      return this.selectedRoles.length > 0;
    },
    userDisplayName() {
      return `${this.user.firstName} ${this.user.lastName}`.trim();
    },
    roleListValidMessage() {
      if(this.isDistrictUser()){
        let district1701Role = this.selectedRoles.filter(userRole => userRole === ROLES.DISTRICT_SDC);
        let district1701ReadOnlyRole = this.selectedRoles.filter(userRole => userRole === ROLES.DIS_SDC_RO);
        if(district1701Role.length > 0 && district1701ReadOnlyRole.length > 0){
          return 'Only one district Student Data Collection role can be selected.';
        }
      }else{
        let school1701Role = this.selectedRoles.filter(userRole => userRole === ROLES.SCHOOL_SDC);
        let school1701ReadOnlyRole = this.selectedRoles.filter(userRole => userRole === ROLES.SCH_SDC_RO);
        if(school1701Role.length > 0 && school1701ReadOnlyRole.length > 0){
          return 'Only one school Student Data Collection role can be selected.';
        }
      }
      return null;
    }
  },
  methods: {
    isDistrictUser(){
      return this.instituteTypeCode === 'DISTRICT';
    },
    formatExpiryDate(date) {
      return formatDate(date);
    },
    getRoleLabel(curRole) {
      if (this.instituteRoles.length > 0) {
        return this.instituteRoles.find((role) => role.edxRoleCode === curRole.edxRoleCode)?.label;
      }
      return '';
    },
    clickEditButton() {
      this.relinkState = false;
      this.deleteState = false;
      this.editUserSheet = !this.editUserSheet;
      this.setUserRolesAsSelected();
    },
    async clickDeleteButton(){
      const confirmation = await this.$refs.confirmRemoveUser.open('Confirm Removal of User', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Remove', rejectText: 'Cancel'});
      if (!confirmation) {
        return;
      }
      this.loading = true;

      const payload = {
        params:{
          userToRemove: this.user.edxUserID
        }
      };
      if (this.instituteTypeCode === 'SCHOOL') {
        const userSchool = this.user.edxUserSchools
          .find(school => school.schoolID === this.instituteCode);
        payload.params.schoolID = userSchool.schoolID;
        payload.params.userSchoolID = userSchool.edxUserSchoolID;
      } else {
        const userDistrict = this.user.edxUserDistricts
          .find(district => district.districtID === this.instituteCode);
        payload.params.districtID = this.instituteCode;
        payload.params.edxUserDistrictID = userDistrict.edxUserDistrictID;
      }
      ApiService.apiAxios.post(ApiRoutes.edx.EXCHANGE_REMOVE_USER, payload)
        .then(() => {
          this.setSuccessAlert('User has been removed.');
        }).catch(error => {
          this.setFailureAlert('An error occurred while removing a user. Please try again later.');
          console.log(error);
        }).finally(() => {
          this.$emit('refresh');
        });
    },
    async clickRelinkButton() {
      const confirmation = await this.$refs.confirmRelinkUser.open('Confirm Re-link of User', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Re-link', rejectText: 'Cancel'});
      if (!confirmation) {
        return;
      }
      this.loading = true;
      const payload = {
        params:{
          userToRelink: this.user.edxUserID,
          edxUserExpiryDate: this.getExpiryDate(this.user)
        }
      };
      if (this.instituteTypeCode === 'SCHOOL') {
        const userSchool = this.user.edxUserSchools
          .find(school => school.schoolID === this.instituteCode);
        payload.params.schoolID = this.instituteCode;
        payload.params.userSchoolID = userSchool.edxUserSchoolID;
      } else {
        const userDistrict = this.user.edxUserDistricts
          .find(district => district.districtID === this.instituteCode);
        payload.params.districtID = this.instituteCode;
        payload.params.edxUserDistrictID = userDistrict.edxUserDistrictID;
      }
      ApiService.apiAxios.post(ApiRoutes.edx.EXCHANGE_RELINK_USER, payload)
        .then(() => {
          this.setSuccessAlert('User has been removed, email sent with instructions to re-link.');
        }).catch(error => {
          this.setFailureAlert(
            'An error occurred while re-linking a user. Please try again later.'
          );
          console.log(error);
        }).finally(() => {
          setTimeout(() => { this.$emit('refresh'); }, EDX_SAGA_REQUEST_DELAY_MILLISECONDS);
        });
    },
    clickSaveButton() {
      if (!this.minimumRolesSelected) {
        this.setFailureAlert(`Please select at least one role for ${this.userDisplayName}.`);
        return;
      }
      this.editUserSheet = !this.editUserSheet;
      const payload = {
        params: {
          edxUserID: this.user.edxUserID,
          selectedRoles: this.selectedRoles,
          expiryDate: this.accessExpiryDate
        }
      };
      let url = ApiRoutes.edx.EXCHANGE_ACCESS_ROLES_URL;
      if (this.instituteTypeCode === 'SCHOOL') {
        payload.params.schoolID = this.instituteCode;
        url = `${url}/school`;
      } else {
        payload.params.districtID = this.instituteCode;
        url = `${url}/district`;
      }
      ApiService.apiAxios.post(url, payload)
        .then(() => {
          this.setSuccessAlert('User has been updated.');
        }).catch(error => {
          this.setFailureAlert(
            'An error occurred while updating the user. Please try again later.'
          );
          console.log(error);
        }).finally(() => {
          this.$emit('refresh');
        });
    },
    getExpiryDate(user){
      if(!this.isDistrictUser()){
        return user.edxUserSchools[0].expiryDate;
      }
      return user.edxUserDistricts[0].expiryDate;
    },
    setUserRolesAsSelected() {
      let mySelection = [];
      //look through all our roles. If user has this role, then mark the index
      this.instituteRoles.forEach((role) => {
        let result = this.userRoles.find((userRole) =>
          userRole.edxRoleCode === role.edxRoleCode
        );
        if (result) {
          mySelection.push(role.edxRoleCode);
        }
      });
      this.selectedRoles = [...mySelection];
      this.accessExpiryDate = this.getExpiryDate(this.user);
    },
    isNotSameEdxUser() {
      return this.userInfo.edxUserID !== this.user.edxUserID;
    },
    clearExpiryDate(){
      this.accessExpiryDate = null;
    },
    hasEDXUserAdminPermission() {
      return this.userInfo?.activeInstitutePermissions?.includes(PERMISSION.EDX_USER_DISTRICT_ADMIN) || this.userInfo?.activeInstitutePermissions?.includes(PERMISSION.EDX_USER_SCHOOL_ADMIN);
    }
  }
};
</script>

<style scoped>
.v-list-item-title {
  color: #003366;
}

.actionButton {
  background-color: #003366;
  color: white;
}

.sheetHeader {
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}

.bounce-leave-active {
  animation: bounce-in 0.1s reverse;
}

.contactName{
  font-size: 0.85em;
}

.expiry-date {
  color: grey;
  font-style: italic;
  font-size: 0.95em
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>


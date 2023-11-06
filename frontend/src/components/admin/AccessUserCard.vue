<template>
  <v-card
    :id="`edxUser-${user.edxUserID}`"
    style="min-height: 17.5em"
    class="d-flex flex-column"
  >
    <v-card-title class="pb-0">
      <v-row no-gutters>
        <v-col cols="9">
          <span style="white-space: break-spaces">
            <strong class="contactName">{{ `${user.firstName} ${user.lastName}` }}</strong>
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
      :style="[editState ? {'background-color': '#e7ebf0'} : {'background-color': 'white'}]"
    >
      <div v-if="!editState">
        <v-chip
          v-for="role in userRoles"
          :key="role.edxRoleCode"
          disabled
          class="ma-1"
        >
          {{ getRoleLabel(role) }}
        </v-chip>
      </div>
      <div v-else>
        <v-alert
          v-if="!isNotSameEdxUser()"
          id="logoutAlert"
          class="mt-4"
          color="#003366"
          density="compact"
          type="info"
          variant="tonal"
        >
          <span>For access changes to take affect, you will need to log out and back in.</span>
        </v-alert>
        <v-list
          :id="`access-user-roles-${user.edxUserID}`"
          v-model:selected="selectedRoles"
          lines="two"
          return-object
          select-strategy="classic"
          style="background-color: #e7ebf0"
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
          @clear-date="clearExpiryDate"
        />
      </div>
    </v-card-text>
    <Transition name="bounce">
      <v-card-text
        v-if="deleteState"
        style="background-color: #e7ebf0;"
        class="deleteEdxUserConfirmationDialog"
      >
        <v-row no-gutters>
          <v-col class="d-flex justify-center">
            <span style="font-size: medium; font-weight: bold; color: black">
              Are you sure you want to remove this users access for the
              {{ instituteTypeLabel.toLowerCase() }}?
            </span>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col class="mt-3 d-flex justify-end">
            <PrimaryButton
              :id="`user-cancel-remove-button-${user.edxUserID}`"
              width="5em"
              text="Cancel"
              class="mr-2 cancelUserDeleteButton"
              secondary
              variant="flat"
              :click-action="clickDeleteButton"
            />
            <PrimaryButton
              :id="`user-remove-action-button-${user.edxUserID}`"
              text="Remove"
              class="confirmUserDeleteButton"
              variant="flat"
              :click-action="clickRemoveButton"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </Transition>
    <Transition name="bounce">
      <v-card-text
        v-if="relinkState"
        style="background-color: #e7ebf0;"
      >
        <v-row no-gutters>
          <v-col class="d-flex justify-center">
            <span
              class="accessUserFeedback"
              style="font-size: medium; font-weight: bold; color: black"
            >
              Re-linking an account will remove the current user and resend the activation code so
              that the user can set up EDX access with their new credential.
            </span>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col class="pt-3 d-flex justify-start">
            <span
              :id="`userRelinkWarningText-${user.edxUserID}`"
              style="font-size: medium; font-weight: bold; color: black"
            >Are you sure you want to re-link this account?</span>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col class="mt-3 d-flex justify-end">
            <PrimaryButton
              :id="`user-cancel-relink-button-${user.edxUserID}`"
              width="5em"
              text="Cancel"
              class="mr-2"
              secondary
              variant="flat"
              :click-action="clickRelinkButton"
            />
            <PrimaryButton
              :id="`user-relink-action-button-${user.edxUserID}`"
              text="Re-Link"
              variant="flat"
              :click-action="clickActionRelinkButton"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </Transition>
    <Transition name="bounce">
      <v-card-text
        v-if="editState"
        class="pt-0"
        style="background-color: #e7ebf0;"
      >
        <v-row
          v-if="!minimumRolesSelected"
          no-gutters
        >
          <v-col class="mt-0 d-flex justify-start">
            <p
              class="accessUserFeedback"
              style="font-weight: bolder;color: black;"
            >
              Please select at least one role for {{ user.firstName }}.
            </p>
          </v-col>
        </v-row>
        <v-row no-gutters>
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
              :disabled="!minimumRolesSelected"
              variant="flat"
              :click-action="clickSaveButton"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </Transition>
    <v-spacer />
    <v-card-actions
      v-if="(isNotSameEdxUser() || hasEDXUserAdminPermission()) && !editState && !relinkState && !deleteState"
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
        :id="`user-remove-button-${user.edxUserID}`"
        color="red"
        variant="text"
        @click="clickDeleteButton"
      >
        Remove
      </v-btn>
      <v-btn
        :id="`user-relink-button-${user.edxUserID}`"
        color="#003366"
        variant="text"
        @click="clickRelinkButton"
      >
        Re-link
      </v-btn>
    </v-card-actions>
  </v-card>
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

export default {
  name: 'AccessUserCard',
  components: {PrimaryButton, DatePicker},
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
      editState: false,
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
      this.editState = !this.editState;
      this.setUserRolesAsSelected();
    },
    clickDeleteButton() {
      this.editState = false;
      this.relinkState = false;
      this.deleteState = !this.deleteState;
    },
    clickRelinkButton() {
      this.editState = false;
      this.deleteState = false;
      this.relinkState = !this.relinkState;
    },
    clickActionRelinkButton() {
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
    clickRemoveButton() {
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
    clickSaveButton() {
      if (!this.minimumRolesSelected) {
        this.setFailureAlert(`Please select at least one role for ${this.user.firstName}.`);
        return;
      }
      this.editState = !this.editState;
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
        payload.params.districtId = this.instituteCode;
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


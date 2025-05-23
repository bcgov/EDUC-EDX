<template>
  <v-container
    fluid
    class="full-height px-0 pt-0 mt-4"
  >
    <v-form
      ref="newUserForm"
      v-model="isValidForm"
    >
      <v-row class="d-flex justify-center">
        <v-col
          class="pt-0"
          cols="11"
        >
          <v-row>
            <v-col class="pr-0 pb-0">
              <v-row>
                <v-col>
                  <v-card
                    id="newUserCard"
                    flat
                    outlined
                  >
                    <v-row>
                      <v-col class="pb-0">
                        <v-card-text
                          id="newUserCardText"
                          class="pb-0 pt-0"
                        >
                          <v-text-field
                            id="newUserFirstName"
                            v-model.trim="firstName"
                            label="First Name"
                            variant="underlined"
                            class="pt-0"
                            maxlength="255"
                          />
                          <v-text-field
                            id="newUserLastName"
                            v-model.trim="lastName"
                            label="Last Name"
                            variant="underlined"
                            maxlength="255"
                            :rules="requiredRules"
                          />
                          <v-text-field
                            id="newUserEmail"
                            v-model.trim="email"
                            label="Email"
                            variant="underlined"
                            class="pt-0 pb-2"
                            :rules="emailRules"
                            maxlength="255"
                            :hint="emailHint"
                          />
                          <v-select
                            id="instituteNewUserRolesSelect"
                            v-model="edxActivationRoleCodes"
                            variant="underlined"
                            label="Role(s)"
                            :hint="rolesHint"
                            persistent-hint
                            required
                            :rules="conflictingRoleRules"
                            class="mb-3 mt-0 pt-0"
                          >
                            <template #no-data />
                            <template #selection="{item, index}">
                              {{ getRoleNameFromCode(item, index) }}
                            </template>
                            <template #append-item>
                              <v-list
                                id="instituteNewUserRolesListBox"
                                v-model:selected="edxActivationRoleCodes"
                                lines="two"
                                return-object
                                select-strategy="classic"
                              >
                                <div
                                  v-for="newrole in userRoles"
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
                            </template>
                          </v-select>

                          <DatePicker
                            id="accessExpiryDate"
                            v-model="accessExpiryDate"
                            class="pb-3 mt-0 pt-0"
                            label="Access Expiry Date"
                            model-type="yyyy-MM-dd'T'00:00:00"
                            :min-date="minExpiryDate"
                            @clear-date="clearExpiryDate"
                            @update:model-value="validateForm"
                          />
                        </v-card-text>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
              <v-row class="py-4 justify-end">
                <PrimaryButton
                  id="cancelMessage"
                  secondary
                  text="Cancel"
                  class="mr-2"
                  :click-action="navigateToList"
                />
                <PrimaryButton
                  id="newUserInvitePostBtn"
                  text="Invite"
                  width="8rem"
                  :disabled="!isValidForm"
                  :loading="processing"
                  :click-action="sendNewUserInvite"
                />
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <ConfirmationDialog ref="confirmationDialog" />
    </v-form>
  </v-container>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton.vue';
import ConfirmationDialog from '../util/ConfirmationDialog.vue';
import alertMixin from '../../mixins/alertMixin';
import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import { authStore } from '../../store/modules/auth';
import { mapState } from 'pinia';
import DatePicker from '../util/DatePicker.vue';
import {ROLES} from '../../utils/constants/Roles';
import {DateTimeFormatter, LocalDate} from '@js-joda/core';

export default {
  name: 'InviteUserPage',
  components: {
    PrimaryButton,
    ConfirmationDialog,
    DatePicker
  },
  mixins: [alertMixin],
  props: {
    userRoles: {
      type: Array,
      required: true
    },
    instituteCode: {
      type: String,
      required: true
    },
    schoolName: {
      type: String,
      required: false,
      default: null
    },
    schoolMincode: {
      type: String,
      required: false,
      default: null
    },
    districtName: {
      type: String,
      required: false,
      default: null
    },
    districtNumber: {
      type: String,
      required: false,
      default: null
    },
    instituteTypeLabel: {
      type: String,
      required: true
    },
    instituteTypeCode: {
      type: String,
      required: true
    }
  },
  emits: ['access-user:message-sent','access-user:cancel-message','access-user:update-roles'],
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      edxActivationRoleCodes: [],
      requiredRules: [v => !!v || 'Required'],
      requireRoleRules: [(v) => v.length > 0 || 'Role Selection is required'],
      isValidForm: false,
      processing: false,
      edxAdminUserCode: '',
      rolesHint: 'Pick the roles to be assigned to the new user',
      emailHint: 'Valid Email Required',
      accessExpiryDate: null,
      minExpiryDate: LocalDate.now().atStartOfDay().format(DateTimeFormatter.ofPattern('yyyy-MM-dd\'T\'HH:mm:ss')).toString()
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    conflictingRoleRules() {
      if(this.edxActivationRoleCodes.length < 1){
        return ['Role Selection is required'];
      }else if(this.isDistrictUser()){
        let district1701Role = this.edxActivationRoleCodes.filter(userRole => userRole === ROLES.DISTRICT_SDC);
        let district1701ReadOnlyRole = this.edxActivationRoleCodes.filter(userRole => userRole === ROLES.DIS_SDC_RO);
        if(district1701Role.length > 0 && district1701ReadOnlyRole.length > 0){
          return ['Only one district Student Data Collection role can be selected.'];
        }
        let districtGDCRole = this.edxActivationRoleCodes.filter(userRole => userRole === ROLES.GRAD_DIS_ADMIN);
        let districtGDCReadOnlyRole = this.edxActivationRoleCodes.filter(userRole => userRole === ROLES.GRAD_DIS_RO);
        if(districtGDCRole.length > 0 && districtGDCReadOnlyRole.length > 0){
          return ['Only one district Graduation Data Collection role can be selected.'];
        }
      }else{
        let school1701Role = this.edxActivationRoleCodes.filter(userRole => userRole === ROLES.SCHOOL_SDC);
        let school1701ReadOnlyRole = this.edxActivationRoleCodes.filter(userRole => userRole === ROLES.SCH_SDC_RO);
        if(school1701Role.length > 0 && school1701ReadOnlyRole.length > 0){
          return ['Only one school Student Data Collection role can be selected.'];
        }
        let schoolGDCRole = this.edxActivationRoleCodes.filter(userRole => userRole === ROLES.GRAD_SCH_ADMIN);
        let schoolGDCReadOnlyRole = this.edxActivationRoleCodes.filter(userRole => userRole === ROLES.GRAD_SCH_RO);
        if(schoolGDCRole.length > 0 && schoolGDCReadOnlyRole.length > 0){
          return ['Only one school Graduation Data Collection role can be selected.'];
        }
      }
      return [true];
    },
    emailRules() {
      return [
        v => !!v || this.emailHint,
        v => /^[\w!#$%&’*+/=?`{|}~^-]+(?:\.[\w!#$%&’*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,63}$/.test(v) || this.emailHint,
      ];
    }
  },
  mounted() {
    this.validateForm();
  },
  methods: {
    isDistrictUser(){
      return this.instituteTypeCode === 'DISTRICT';
    },
    navigateToList() {
      this.$emit('access-user:cancel-message');
    },
    getRoleNameFromCode(role, index){
      if(index != 0){
        return ', ' + this.userRoles.filter(userRole => userRole.edxRoleCode === role.value)[0].label;
      }
      return this.userRoles.filter(userRole => userRole.edxRoleCode === role.value)[0].label;
    },
    messageSent() {
      this.requiredRules = [v => !!v?.trim() || 'Required'];
      this.$emit('access-user:message-sent');
    },
    sendNewUserInvite() {
      this.processing = true;
      const payload = {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        edxActivationRoleCodes: this.edxActivationRoleCodes,
        edxUserExpiryDate: this.accessExpiryDate === '' ? null : this.accessExpiryDate
      };
      let url = null;
      if(this.instituteTypeCode === 'SCHOOL') {
        payload.schoolID = this.instituteCode;
        payload.schoolName = this.schoolName;
        url = `${ApiRoutes.edx.NEW_SCHOOL_USER_ACTIVATION_INVITE}`;
      }else {
        payload.districtName = this.districtName;
        payload.districtCode = this.districtNumber;
        payload.districtID = this.instituteCode;
        url = `${ApiRoutes.edx.NEW_DISTRICT_USER_ACTIVATION_INVITE}`;
      }
      ApiService.apiAxios.post(url, payload)
        .then(() => {
          this.setSuccessAlert('Success! The request is being processed.');
          this.messageSent();
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while inviting new user. Please try again later.');
          console.log(error);
        })
        .finally(() => {
          this.processing = false;
        });
    },
    async validateForm() {
      const valid = await this.$refs.newUserForm.validate();
      this.isFormValid = valid.valid;
    },
    clearExpiryDate(){
      this.accessExpiryDate = null;
    },
  }
};
</script>

<style scoped>
.addButton.v-btn--outlined {
  border: thin solid #FFFFFF;
  text-transform: none;
  font-weight: bolder;
}
</style>

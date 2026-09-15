<template>
  <v-container
    fluid
    class="pt-10"
  >
    <v-row class="d-flex justify-center">
      <v-col
        cols="12"
        sm="8"
        md="6"
      >
        <v-card id="profileVCard">
          <v-card-title class="sheetHeader pt-2 pb-2">
            Update Your Profile
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-form
              ref="profileForm"
              v-model="isFormValid"
            >
              <v-row
                v-if="isIdirUser"
                class="d-flex justify-center"
                dense
              >
                <v-col>
                  <v-alert
                    density="compact"
                    type="info"
                    variant="tonal"
                    text="Your first name and last name are managed by the BC Provincial Identity and Credential Service (IDIR). Please contact your administrator to have them updated."
                  />
                </v-col>
              </v-row>
              <v-text-field
                id="profileFirstNameInput"
                v-model="formData.firstName"
                :rules="[rules.required()]"
                :disabled="isIdirUser"
                variant="underlined"
                class="pt-0"
                :maxlength="255"
                label="First Name"
                @keyup.enter="saveUserName"
              />
              <v-text-field
                id="profileLastNameInput"
                v-model="formData.lastName"
                :rules="[rules.required()]"
                :disabled="isIdirUser"
                variant="underlined"
                class="pt-0"
                :maxlength="255"
                label="Last Name"
                @keyup.enter="saveUserName"
              />
            </v-form>
          </v-card-text>
          <v-card-actions
            v-if="!isIdirUser"
            class="justify-end"
          >
            <PrimaryButton
              id="saveProfileBtn"
              text="Save"
              width="7rem"
              :click-action="saveUserName"
              :disabled="!isFormValid || !hasChanges"
              :loading="processing"
            />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import alertMixin from '../../mixins/alertMixin';
import * as Rules from '../../utils/institute/formRules';
import PrimaryButton from '../util/PrimaryButton.vue';
import {authStore} from '../../store/modules/auth';
import {mapState} from 'pinia';

export default {
  name: 'ProfilePage',
  components: {
    PrimaryButton
  },
  mixins: [alertMixin],
  data() {
    return {
      processing: false,
      isFormValid: false,
      formData: {
        firstName: null,
        lastName: null
      },
      rules: Rules
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    isIdirUser() {
      return this.userInfo?.accountType === 'IDIR' || this.userInfo?.identityTypeLabel === 'IDIR';
    },
    hasChanges() {
      return this.formData.firstName !== this.userInfo?.firstName || this.formData.lastName !== this.userInfo?.lastName;
    }
  },
  mounted() {
    this.syncFormData();
  },
  methods: {
    authStore,
    syncFormData() {
      this.formData.firstName = this.userInfo?.firstName;
      this.formData.lastName = this.userInfo?.lastName;
    },
    saveUserName() {
      if (!this.isFormValid || !this.hasChanges) return;
      this.processing = true;
      ApiService.apiAxios.put(ApiRoutes.USER, {
        firstName: this.formData.firstName,
        lastName: this.formData.lastName
      })
        .then(async () => {
          this.setSuccessAlert('Success! Your profile has been updated. Some areas of the application may take up to 24 hours to reflect your new name.');
          await authStore().getUserInfo();
          this.syncFormData();
        })
        .catch(error => {
          console.error(error);
          let fallback = 'An error occurred while updating your profile. Please try again later.';
          this.setFailureAlert(error?.response?.data?.message || fallback);
        })
        .finally(() => {
          this.processing = false;
        });
    }
  }
};
</script>

<style scoped>
.sheetHeader {
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}
</style>

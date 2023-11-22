<template>
  <v-card id="editContactVCard">
    <v-card-title class="sheetHeader pt-1 pb-1">
      Edit District Contact
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-form
        ref="editContactForm"
        v-model="isFormValid"
      >
        <v-row>
          <v-col cols="12">
            <v-alert
              width="100%"
              density="compact"
              color="#E9EBEF"
              type="info"
            >
              <p style="color: #003366">
                District contacts will be <strong>available to the public as of start date</strong>.
              </p>
              <p
                style="color: #003366"
                class="mb-1"
              >
                Please be sure to review the new contact details carefully before saving.
              </p>
            </v-alert>
          </v-col>
        </v-row>
        <v-row class="d-flex justify-center">
          <v-col>
            <v-select
              id="editContactDropdown"
              v-model="editContact.districtContactTypeCode"
              :items="districtContactTypes"
              item-title="label"
              variant="underlined"
              class="pt-0"
              item-value="districtContactTypeCode"
              label="District Contact Type"
            />
            <v-text-field
              id="editContactFirstNameInput"
              v-model="editContact.firstName"
              class="pt-0"
              variant="underlined"
              :maxlength="255"
              label="First Name"
            />
            <v-text-field
              id="editContactLastNameInput"
              v-model="editContact.lastName"
              :rules="[rules.required()]"
              class="pt-0"
              variant="underlined"
              :maxlength="255"
              label="Last Name"
            />
            <v-text-field
              id="editContactJobTitle"
              v-model="editContact.jobTitle"
              label="Position Title"
              variant="underlined"
              type="text"
              maxlength="255"
            />
            <v-text-field
              id="editContactEmailInput"
              v-model="editContact.email"
              :rules="[rules.required(), rules.email()]"
              class="pt-0"
              variant="underlined"
              :maxlength="255"
              label="Email"
            />
            <v-row>
              <v-col cols="6">
                <v-text-field
                  id="editContactPhoneNumberInput"
                  v-model="editContact.phoneNumber"
                  :rules="[rules.required(), rules.phoneNumber()]"
                  class="pt-0"
                  variant="underlined"
                  :maxlength="10"
                  label="Phone Number"
                  @keypress="isNumber($event)"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  id="editContactPhoneExtensionInput"
                  v-model="editContact.phoneExtension"
                  :rules="[rules.number()]"
                  :maxlength="10"
                  variant="underlined"
                  class="pt-0"
                  label="Ext."
                  @keypress="isNumber($event)"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  id="editContactAltPhoneNumberInput"
                  v-model="editContact.alternatePhoneNumber"
                  :rules="[rules.phoneNumber()]"
                  class="pt-0"
                  variant="underlined"
                  :maxlength="10"
                  label="Alt. Phone Number"
                  @keypress="isNumber($event)"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  id="editContactAltPhoneExtensionInput"
                  v-model="editContact.alternatePhoneExtension"
                  :rules="[rules.number()]"
                  class="pt-0"
                  variant="underlined"
                  :maxlength="10"
                  label="Alt. Phone Ext."
                  @keypress="isNumber($event)"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <DatePicker
                  id="editContactEffectiveDateTextField"
                  v-model="editContact.effectiveDate"
                  label="Start Date"
                  :rules="[rules.required()]"
                  model-type="yyyy-MM-dd'T'00:00:00"
                  @update:model-value="validateForm"
                  @clear-date="clearEffectiveDate"
                />
              </v-col>
              <v-col cols="6">
                <DatePicker
                  id="editContactExpiryDateTextField"
                  v-model="editContact.expiryDate"
                  label="End Date"
                  :rules="[rules.endDateRule(editContact.effectiveDate, editContact.expiryDate)]"
                  model-type="yyyy-MM-dd'T'00:00:00"
                  @update:model-value="validateForm"
                  @clear-date="clearExpiryDate"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-end">
      <PrimaryButton
        id="cancelChangesToDistrictContactButton"
        secondary
        text="Cancel"
        :click-action="cancelEditDistrictContactPage"
      />
      <PrimaryButton
        id="saveChangesToDistrictContactButton"
        text="Save"
        width="7rem"
        :click-action="saveDistrictContact"
        :disabled="!isFormValid"
        :loading="processing"
      />
    </v-card-actions>
  </v-card>
</template>

<script>
import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import alertMixin from '../../mixins/alertMixin';
import * as Rules from '../../utils/institute/formRules';
import {isNumber} from '../../utils/institute/formInput';
import {cloneDeep} from 'lodash';
import PrimaryButton from '../util/PrimaryButton.vue';
import DatePicker from '../util/DatePicker.vue';

export default {
  name: 'EditDistrictContactPage',
  components: {
    DatePicker,
    PrimaryButton
  },
  mixins: [alertMixin],
  props: {
    districtContactTypes: {
      type: Array,
      required: true
    },
    districtID: {
      type: String,
      required: true
    },
    contact: {
      type: Object,
      required: true
    },
    onSuccessHandler: {
      type: Function,
      required: true
    },
    closeHandler: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      processing: false,
      isFormValid: false,
      editContact: '',
      rules: Rules
    };
  },
  mounted() {
    this.editContact = cloneDeep(this.contact);
    this.validateForm();
  },
  methods: {
    cancelEditDistrictContactPage() {
      this.resetForm();
      this.closeHandler();
    },
    async saveDistrictContact() {
      this.processing = true;
      await this.validateForm();
      this.editContact.districtId = this.districtID;

      ApiService.apiAxios.put(ApiRoutes.district.UPDATE_DISTRICT_CONTACT_URL, this.editContact)
        .then(() => {
          this.setSuccessAlert('Success! The district contact has been updated.');
          this.resetForm();
          this.closeHandler();
          this.onSuccessHandler();
        })
        .catch(error => {
          console.error(error);
          let fallback = 'An error occurred while saving the district contact information.' +
                         ' Please try again later.';
          this.setFailureAlert(error?.response?.data?.message || fallback);
        })
        .finally(() => {
          this.processing = false;
        });
    },
    clearEffectiveDate(){
      this.editContact.effectiveDate = null;
      this.validateForm();
    },
    clearExpiryDate(){
      this.editContact.expiryDate = null;
      this.validateForm();
    },
    resetForm(){
      this.$refs.editContactForm.reset();
    },
    async validateForm() {
      const valid = await this.$refs.editContactForm.validate();
      this.isFormValid = valid.valid;
    },
    isNumber,
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

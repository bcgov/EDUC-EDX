<template>
  <v-card id="editContactVCard">
    <v-card-title class="sheetHeader pt-1 pb-1">
      Edit School Contact
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-form
        ref="editContactForm"
        v-model="isFormValid"
      >
        <v-row class="d-flex justify-center">
          <v-col>
            <v-alert
              v-if="editContact.schoolContactTypeCode === SCHOOL_CONTACT_TYPES.SAFE_COORD"
              density="compact"
              type="info"
              variant="tonal"
              text="Contacts of this type are only available to the ministry and not available to public."
            />
            <v-alert
              v-else
              density="compact"
              type="info"
              variant="tonal"
            >
              <p>
                School contacts will be
                <strong>available to the public as of start date.</strong>
              </p>
              <p class="mb-1">
                Please be sure to review the new contact details carefully before saving.
              </p>
            </v-alert>
          </v-col>
        </v-row>
        <v-row
          class="d-flex justify-center"
          dense
        >
          <v-col>
            <v-select
              id="editContactDropdown"
              v-model="editContact.schoolContactTypeCode"
              :items="schoolContactTypes"
              variant="underlined"
              item-title="label"
              class="pt-0"
              item-value="schoolContactTypeCode"
              label="School Contact Type"
            />
            <v-text-field
              id="editContactFirstNameInput"
              v-model="editContact.firstName"
              variant="underlined"
              class="pt-0"
              :maxlength="255"
              label="First Name"
            />
            <v-text-field
              id="editContactLastNameInput"
              v-model="editContact.lastName"
              :rules="[rules.required()]"
              variant="underlined"
              class="pt-0"
              :maxlength="255"
              label="Last Name"
            />
            <v-text-field
              id="editContactJobTitleInput"
              v-model="editContact.jobTitle"
              variant="underlined"
              class="pt-0"
              :maxlength="255"
              label="Position Title"
            />
            <v-text-field
              id="editContactEmailInput"
              v-model="editContact.email"
              :rules="[rules.required(), rules.email()]"
              variant="underlined"
              class="pt-0"
              :maxlength="255"
              label="Email"
            />
            <v-row dense>
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
            <v-row dense>
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
            <v-row dense>
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
        id="cancelContactBtn"
        secondary
        text="Cancel"
        :click-action="closeHandler"
      />
      <PrimaryButton
        id="editContactPostBtn"
        text="Save"
        width="7rem"
        :click-action="saveSchoolContact"
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
import {SCHOOL_CONTACT_TYPES} from '../../utils/constants/SchoolContactTypes';
import DatePicker from '../util/DatePicker.vue';

export default {
  name: 'EditSchoolContactPage',
  components: {
    DatePicker,
    PrimaryButton
  },
  mixins: [alertMixin],
  props: {
    schoolContactTypes: {
      type: Array,
      required: true
    },
    schoolID: {
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
      school: {},
      isFormValid: false,
      expandEdit: false,
      saveEnabled: true,
      ecFormValid: false,
      editContact: '',
      rules: Rules,
      SCHOOL_CONTACT_TYPES: SCHOOL_CONTACT_TYPES
    };
  },
  mounted() {
    this.editContact = cloneDeep(this.contact);
    this.validateForm();
  },
  methods: {
    async saveSchoolContact() {
      this.processing = true;
      this.validateForm();
      this.editContact.schoolID = this.schoolID;

      ApiService.apiAxios.post(`${ApiRoutes.school.UPDATE_SCHOOL_CONTACT_URL}`, this.editContact)
        .then(() => {
          this.setSuccessAlert('Success! The school contact has been updated.');
          this.closeHandler();
          this.onSuccessHandler();
        })
        .catch(error => {
          console.error(error);
          let fallback = 'An error occurred while saving the school contact information.' +
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
    async validateForm() {
      const valid = await this.$refs.editContactForm.validate();
      this.isFormValid = valid.valid;
    },
    isNumber
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

  :deep(.mdi-information){
    color: #003366;
  }

</style>

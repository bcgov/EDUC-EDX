<template>
  <v-card
    id="newContactSheet"
  >
    <v-card-title class="sheetHeader pt-1 pb-1">
      New District Contact
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-form
        ref="newContactForm"
        v-model="isFormValid"
      >
        <v-row class="d-flex justify-center">
          <v-col>
            <v-alert
              color="#E9EBEF"
              dense
              type="info"
            >
              <p style="color: #003366">
                District contacts will be <strong>available to the public as of start date</strong>.
              </p>
              <p
                class="mb-1"
                style="color: #003366"
              >
                Please be sure to review the new contact details carefully before saving.
              </p>
            </v-alert>
          </v-col>
        </v-row>
        <v-row class="d-flex justify-center">
          <v-col>
            <v-select
              id="newContactDropdown"
              v-model="newContact.districtContactTypeCode"
              :rules="[rules.required()]"
              :items="districtContactTypes"
              variant="underlined"
              item-title="label"
              class="pt-0"
              item-value="districtContactTypeCode"
              label="District Contact Type"
            />
            <v-text-field
              id="newContactFirstNameInput"
              v-model="newContact.firstName"
              class="pt-0"
              variant="underlined"
              :maxlength="255"
              :rules="[rules.noSpecialCharactersContactName()]"
              label="First Name"
            />
            <v-text-field
              id="newContactLastNameInput"
              v-model="newContact.lastName"
              :rules="[rules.required(), rules.noSpecialCharactersContactName()]"
              class="pt-0"
              variant="underlined"
              :maxlength="255"
              label="Last Name"
            />
            <v-text-field
              id="newContactJobTitle"
              v-model="newContact.jobTitle"
              label="Position Title"
              type="text"
              variant="underlined"
              maxlength="255"
              :rules="[rules.noSpecialCharactersContactTitle()]"
            />
            <v-text-field
              id="newContactEmailInput"
              v-model="newContact.email"
              :rules="[rules.required(), rules.email()]"
              class="pt-0"
              variant="underlined"
              :maxlength="255"
              label="Email"
            />
            <v-row>
              <v-col cols="6">
                <v-text-field
                  id="newContactPhoneNumberInput"
                  v-model="newContact.phoneNumber"
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
                  id="newContactPhoneExtensionInput"
                  v-model="newContact.phoneExtension"
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
                  id="newContactAltPhoneNumberInput"
                  v-model="newContact.alternatePhoneNumber"
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
                  id="newContactAltPhoneExtensionInput"
                  v-model="newContact.alternatePhoneExtension"
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
                  id="newContactEffectiveDateTextField"
                  v-model="newContact.effectiveDate"
                  label="Start Date"
                  :rules="[rules.required()]"
                  @update:model-value="validateForm"
                  @clear-date="clearEffectiveDate"
                />
              </v-col>
              <v-col cols="6">
                <DatePicker
                  id="newContactExpiryDateTextField"
                  v-model="newContact.expiryDate"
                  label="End Date"
                  :rules="[rules.endDateRule(newContact.effectiveDate, newContact.expiryDate)]"
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
        id="cancelNewContactBtn"
        secondary
        text="Cancel"
        :click-action="closeNewContactPage"
      />
      <PrimaryButton
        id="newContactPostBtn"
        text="Save"
        width="7rem"
        :click-action="addNewDistrictContact"
        :disabled="!isFormValid"
        :loading="processing"
      />
    </v-card-actions>
  </v-card>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton.vue';
import { authStore } from '../../store/modules/auth';
import { mapState } from 'pinia';
import alertMixin from '../../mixins/alertMixin';
import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import * as Rules from '../../utils/institute/formRules';
import {isNumber} from '../../utils/institute/formInput';
import {LocalDate} from '@js-joda/core';
import DatePicker from '../util/DatePicker.vue';

export default {
  name: 'NewDistrictContactPage',
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
    }
  },
  emits: ['new-district-contact:close-new-district-contact-page','new-district-contact:add-new-district-contact'],
  data() {
    return {
      isFormValid: false,
      processing: false,
      newContact: {
        districtContactTypeCode: null,
        firstName: null,
        lastName: null,
        jobTitle: null,
        email: null,
        phoneNumber: null,
        phoneExtension: null,
        alternatePhoneNumber: null,
        alternatePhoneExtension: null,
        effectiveDate: LocalDate.now().toString(),
        expiryDate: null
      },
      rules: Rules,
      effectiveDateFilter: false,
      expiryDateFilter: false,
      newContactExpiryDatePicker: null
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated','userInfo']),
  },
  mounted() {
    this.validateForm();
  },
  methods: {
    clearEffectiveDate(){
      this.newContact.effectiveDate = null;
      this.validateForm();
    },
    clearExpiryDate(){
      this.newContact.expiryDate = null;
      this.validateForm();
    },
    closeNewContactPage() {
      this.resetForm();
      this.$emit('new-district-contact:close-new-district-contact-page');
    },
    addNewDistrictContact() {
      this.processing = true;

      ApiService.apiAxios.post(`${ApiRoutes.district.BASE_URL}/${this.districtID}/contact`, this.newContact)
        .then(() => {
          this.setSuccessAlert('Success! The district contact has been created.');
          this.resetForm();
          this.$emit('new-district-contact:add-new-district-contact');
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while sending message. Please try again later.');
          console.log(error);
        })
        .finally(() => {
          this.processing = false;
        });
    },
    resetForm() {
      this.$refs.newContactForm.reset();
    },
    async validateForm() {
      const valid = await this.$refs.newContactForm.validate();
      this.isFormValid = valid.valid;
    },
    isNumber,
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

  :deep(.mdi-information){
    color: #003366;
  }
</style>

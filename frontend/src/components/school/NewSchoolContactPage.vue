<template>
  <v-card id="newContactVCard">
    <v-card-title class="sheetHeader pt-1 pb-1">
      New School Contact
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
                School contacts will be
                <strong>available to the public as of start date.</strong>
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
        <v-row
          class="d-flex justify-center"
          :dense="true"
        >
          <v-col>
            <v-select
              id="newContactDropdown"
              v-model="newContact.schoolContactTypeCode"
              :rules="[rules.required()]"
              :items="schoolContactTypes"
              item-title="label"
              variant="underlined"
              class="pt-0"
              item-value="schoolContactTypeCode"
              label="School Contact Type"
            />
            <v-text-field
              id="newContactFirstNameInput"
              v-model="newContact.firstName"
              class="pt-0"
              variant="underlined"
              :rules="[rules.noSpecialCharactersContactName()]"
              :maxlength="255"
              label="First Name"
            />
            <v-text-field
              id="newContactLastNameInput"
              v-model="newContact.lastName"
              :rules="[rules.required(), rules.noSpecialCharactersContactName()]"
              variant="underlined"
              class="pt-0"
              :maxlength="255"
              label="Last Name"
            />
            <v-text-field
              id="newContactJobTitleInput"
              v-model="newContact.jobTitle"
              variant="underlined"
              class="pt-0"
              :rules="[rules.noSpecialCharactersContactTitle()]"
              :maxlength="255"
              label="Position Title"
            />
            <v-text-field
              id="newContactEmailInput"
              v-model="newContact.email"
              :rules="[rules.required(), rules.email()]"
              variant="underlined"
              class="pt-0"
              :maxlength="255"
              label="Email"
            />
            <v-row :dense="true">
              <v-col cols="6">
                <v-text-field
                  id="newContactPhoneNumberInput"
                  v-model="newContact.phoneNumber"
                  :rules="[rules.required(), rules.phoneNumber()]"
                  variant="underlined"
                  class="pt-0"
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
                  variant="underlined"
                  :maxlength="10"
                  class="pt-0"
                  label="Ext."
                  @keypress="isNumber($event)"
                />
              </v-col>
            </v-row>
            <v-row :dense="true">
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
                  variant="underlined"
                  class="pt-0"
                  :maxlength="10"
                  label="Alt. Phone Ext."
                  @keypress="isNumber($event)"
                />
              </v-col>
            </v-row>
            <v-row :dense="true">
              <v-col cols="6">
                <DatePicker
                  id="newContactEffectiveDatePicker"
                  v-model="newContact.effectiveDate"
                  label="Start Date"
                  :rules="[rules.required()]"
                  model-type="yyyy-MM-dd'T'00:00:00"
                  @update:model-value="validateForm"
                  @clear-date="clearEffectiveDate"
                />
              </v-col>
              <v-col cols="6">
                <DatePicker
                  id="newContactExpiryDatePicker"
                  v-model="newContact.expiryDate"
                  label="End Date"
                  :rules="[rules.endDateRule(newContact.effectiveDate, newContact.expiryDate)]"
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
        id="cancelNewContactBtn"
        secondary
        text="Cancel"
        :click-action="closeNewContactPage"
      />
      <PrimaryButton
        id="newContactPostBtn"
        text="Save"
        width="7rem"
        :click-action="addNewSchoolContact"
        :disabled="!isFormValid"
        :loading="processing"
      />
    </v-card-actions>
  </v-card>
</template>

<script>
import { authStore } from '../../store/modules/auth';
import { mapState } from 'pinia';
import alertMixin from '../../mixins/alertMixin';
import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import * as Rules from '../../utils/institute/formRules';
import {isNumber} from '../../utils/institute/formInput';
import PrimaryButton from '../util/PrimaryButton.vue';
import {DateTimeFormatter, LocalDate} from '@js-joda/core';
import DatePicker from '../util/DatePicker.vue';

export default {
  name: 'NewSchoolContactPage',
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
    }
  },
  emits: ['new-school-contact:close-new-school-contact-page', 'new-school-contact:add-new-school-contact'],
  data() {
    return {
      isFormValid: false,
      processing: false,
      newContact: {
        schoolContactTypeCode: null,
        firstName: null,
        lastName: null,
        email: null,
        phoneNumber: null,
        phoneExtension: null,
        alternatePhoneNumber: null,
        alternatePhoneExtension: null,
        effectiveDate: LocalDate.now().atStartOfDay().format(DateTimeFormatter.ofPattern('yyyy-MM-dd\'T\'HH:mm:ss')).toString(),
        expiryDate: null
      },
      rules: Rules
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
      this.$emit('new-school-contact:close-new-school-contact-page');
    },
    addNewSchoolContact() {
      this.processing = true;

      ApiService.apiAxios
        .post(`${ApiRoutes['school'].BASE_URL}/${this.schoolID}/contact`, this.newContact)
        .then(() => {
          this.setSuccessAlert('Success! The school contact has been created.');
          this.resetForm();
          this.$emit('new-school-contact:add-new-school-contact');
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

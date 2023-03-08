<template>
  <v-card id="newContactVCard">
    <v-card-title class="sheetHeader pt-1 pb-1">New School Contact</v-card-title>
    <v-divider/>
    <v-card-text>
      <v-form ref="newContactForm" v-model="isFormValid">
        <v-row class="d-flex justify-center">
          <v-col>
            <v-alert color="#E9EBEF" dense type="info">
              <p style="color: #003366">School contacts will be
                <strong>available to the public as of start date.</strong>
              </p>
              <p style="color: #003366" class="mb-1">
                Please be sure to review the new contact details carefully before saving.
              </p>
            </v-alert>
          </v-col>
        </v-row>
        <v-row class="d-flex justify-center">
          <v-col>
            <v-select
                id='newContactDropdown'
                :rules="[rules.required()]"
                v-model="newContact.schoolContactTypeCode"
                :items="schoolContactTypes"
                item-title="label"
                variant="underlined"
                class="pt-0"
                item-value="schoolContactTypeCode"
                label="School Contact Type"/>
            <v-text-field
                id='newContactFirstNameInput'
                v-model="newContact.firstName"
                class="pt-0"
                variant="underlined"
                :maxlength="255"
                label="First Name"/>
            <v-text-field
                id='newContactLastNameInput'
                :rules="[rules.required()]"
                v-model="newContact.lastName"
                variant="underlined"
                class="pt-0"
                :maxlength="255"
                label="Last Name"/>
            <v-text-field
                id='newContactEmailInput'
                :rules="[rules.required(), rules.email()]"
                v-model="newContact.email"
                variant="underlined"
                class="pt-0"
                :maxlength="255"
                label="Email"/>
            <v-row>
              <v-col cols="6">
                <v-text-field
                    id='newContactPhoneNumberInput'
                    :rules="[rules.required(), rules.phoneNumber()]"
                    v-model="newContact.phoneNumber"
                    variant="underlined"
                    class="pt-0"
                    :maxlength="10"
                    label="Phone Number"
                    @keypress="isNumber($event)"/>
              </v-col>
              <v-col cols="6">
                <v-text-field
                    id='newContactPhoneExtensionInput'
                    :rules="[rules.number()]"
                    v-model="newContact.phoneExtension"
                    variant="underlined"
                    :maxlength="10"
                    class="pt-0"
                    label="Ext."
                    @keypress="isNumber($event)"/>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                    id='newContactAltPhoneNumberInput'
                    :rules="[rules.phoneNumber()]"
                    v-model="newContact.alternatePhoneNumber"
                    class="pt-0"
                    variant="underlined"
                    :maxlength="10"
                    label="Alt. Phone Number"
                    @keypress="isNumber($event)"/>
              </v-col>
              <v-col cols="6">
                <v-text-field
                    id='newContactAltPhoneExtensionInput'
                    :rules="[rules.number()]"
                    v-model="newContact.alternatePhoneExtension"
                    variant="underlined"
                    class="pt-0"
                    :maxlength="10"
                    label="Alt. Phone Ext."
                    @keypress="isNumber($event)"/>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-menu
                    id="newContactEffectiveDatePicker"
                    ref="newContactEffectiveDateFilter"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        id="newContactEffectiveDateTextField"
                        :rules="[rules.required()]"
                        class="pt-0 mt-0"
                        v-model="newContact.effectiveDate"
                        variant="underlined"
                        label="Start Date"
                        prepend-inner-icon="mdi-calendar"
                        clearable
                        readonly
                        v-bind="attrs"/>
                  </template>
                  <VueDatePicker
                    v-model="newContact.effectiveDate"
                    :active-picker.sync="newContactEffectiveDatePicker"
                    @change="saveNewContactEffectiveDate"
                  ></VueDatePicker>
                </v-menu>
              </v-col>
              <v-col cols="6">
                <v-menu
                    id="newContactExpiryDatePicker"
                    ref="newContactExpiryDateFilter"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        id="newContactExpiryDateTextField"
                        :rules="[rules.endDateRule(newContact.effectiveDate, newContact.expiryDate)]"
                        class="pt-0 mt-0"
                        v-model="newContact.expiryDate"
                        variant="underlined"
                        label="End Date"
                        prepend-inner-icon="mdi-calendar"
                        clearable
                        readonly
                        v-bind="attrs"/>
                  </template>
                  <VueDatePicker
                    v-model="newContact.expiryDate"
                    :active-picker.sync="newContactExpiryDatePicker"
                    @change="saveNewContactExpiryDate"
                  ></VueDatePicker>
                </v-menu>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-end">
      <PrimaryButton id="cancelNewContactBtn"
                     secondary text="Cancel"
                     :clickAction="closeNewContactPage"/>
      <PrimaryButton id="newContactPostBtn"
                     text="Save"
                     width="7rem"
                     :clickAction="addNewSchoolContact"
                     :disabled="!isFormValid"
                     :loading="processing"/>
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
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import PrimaryButton from '../util/PrimaryButton.vue';
import {LocalDate} from '@js-joda/core';

export default {
  name: 'NewSchoolContactPage',
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
  components: {
    PrimaryButton,
    VueDatePicker
  },
  mounted() {
    this.validateForm();
  },
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
        effectiveDate: LocalDate.now().toString(),
        expiryDate: null
      },
      rules: Rules,
      effectiveDateFilter: false,
      newContactEffectiveDatePicker: null,
      expiryDateFilter: false,
      newContactExpiryDatePicker: null
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated','userInfo']),
  },
  methods: {
    saveNewContactEffectiveDate(date) {
      this.$refs.newContactEffectiveDateFilter.save(date);
    },
    saveNewContactExpiryDate(date) {
      this.$refs.newContactExpiryDateFilter.save(date);
    },
    closeNewContactPage() {
      this.resetForm();
      this.$emit('newSchoolContact:closeNewSchoolContactPage');
    },
    addNewSchoolContact() {
      this.processing = true;
      ApiService.apiAxios
        .post(`${ApiRoutes['school'].BASE_URL}/${this.schoolID}/contact`, this.newContact)
        .then(() => {
          this.setSuccessAlert('Success! The school contact has been created.');
          this.resetForm();
          this.$emit('newSchoolContact:addNewSchoolContact');
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
  },
  watch: {
    /**
     * Watching effective date to valid form because we need to cross validate expiry and
     * effective date fields.
     */
    'newContact.effectiveDate': {
      handler() {
        this.validateForm();
      }
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

  :deep(.mdi-information){
    color: #003366;
  }
</style>

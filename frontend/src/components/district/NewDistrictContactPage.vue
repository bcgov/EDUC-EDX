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
              label="First Name"
            />
            <v-text-field
              id="newContactLastNameInput"
              v-model="newContact.lastName"
              :rules="[rules.required()]"
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
                <v-menu
                  id="newContactEffectiveDatePicker"
                  ref="newContactEffectiveDateFilter"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template #activator="{ on, attrs }">
                    <v-text-field
                      id="newContactEffectiveDateTextField"
                      v-model="newContact.effectiveDateMoment"
                      :rules="[rules.required()]"
                      class="pt-0 mt-0"
                      label="Start Date"
                      variant="underlined"
                      prepend-inner-icon="mdi-calendar"
                      clearable
                      readonly
                      v-bind="attrs"
                      @click:clear="clearEffectiveDate"
                      @click="openEffectiveDatePicker"
                    />
                  </template>
                </v-menu>
                <VueDatePicker
                  ref="effectiveDatePicker"
                  v-model="newContact.effectiveDate"
                  :rules="[rules.required()]"
                  :enable-time-picker="false"
                  format="yyyy-MM-dd"
                  @update:model-value="saveNewContactEffectiveDate"
                />
              </v-col>
              <v-col cols="6">
                <v-menu
                  id="newContactExpiryDatePicker"
                  ref="newContactExpiryDateFilter"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template #activator="{ on, attrs }">
                    <v-text-field
                      id="newContactExpiryDateTextField"
                      v-model="newContact.expiryDateMoment"
                      :rules="[rules.endDateRule(newContact.effectiveDateMoment, newContact.expiryDateMoment)]"
                      class="pt-0 mt-0"
                      variant="underlined"
                      label="End Date"
                      prepend-inner-icon="mdi-calendar"
                      clearable
                      readonly
                      v-bind="attrs"
                      @click:clear="clearExpiryDate"
                      @click="openExpiryDatePicker"
                    />
                  </template>
                </v-menu>
                <VueDatePicker
                  ref="expiryDatePicker"
                  v-model="newContact.expiryDate"
                  :rules="[rules.required()]"
                  :enable-time-picker="false"
                  format="yyyy-MM-dd"
                  @update:model-value="saveNewContactExpiryDate"
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
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import moment from 'moment/moment';

export default {
  name: 'NewDistrictContactPage',
  components: {
    PrimaryButton,
    VueDatePicker
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
      newContactEffectiveDatePicker: null,
      expiryDateFilter: false,
      newContactExpiryDatePicker: null
    };
  },
  computed: {
    ...mapState(authStore, ['isAuthenticated','userInfo']),
  },
  watch: {
    //watching effective date to valid form because we need to cross validate expiry and effective date fields
    'newContact.effectiveDate': {
      handler() {
        this.validateForm();
      }
    }
  },
  mounted() {
    this.validateForm();
  },
  methods: {
    clearEffectiveDate(){
      this.newContact.effectiveDateMoment = null;
      this.newContact.effectiveDate = null;
      this.validateForm();
    },
    clearExpiryDate(){
      this.newContact.expiryDateMoment = null;
      this.newContact.expiryDate = null;
      this.validateForm();
    },
    saveNewContactExpiryDate() {
      this.newContact.expiryDateMoment = moment(this.newContact.expiryDate).format('YYYY-MM-DD').toString();
      this.validateForm();
    },
    saveNewContactEffectiveDate() {
      this.newContact.effectiveDateMoment = moment(this.newContact.effectiveDate).format('YYYY-MM-DD').toString();
      this.validateForm();
    },
    closeNewContactPage() {
      this.resetForm();
      this.$emit('new-district-contact:close-new-district-contact-page');
    },
    openEffectiveDatePicker(){
      this.$refs.effectiveDatePicker.openMenu();
    },
    openExpiryDatePicker(){
      this.$refs.expiryDatePicker.openMenu();
    },
    addNewDistrictContact() {
      this.processing = true;

      if(this.newContact.effectiveDateMoment) {
        this.newContact.effectiveDate = this.newContact.effectiveDateMoment;
      }

      if(this.newContact.expiryDateMoment) {
        this.newContact.expiryDate = this.newContact.expiryDateMoment;
      }

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

  :deep(.dp__input_wrap){
    height: 0;
    width: 0;
  }

  :deep(.dp__input){
    display: none;
  }

  :deep(.dp__icon){
    display: none;
  }

  :deep(.mdi-information){
    color: #003366;
  }
</style>

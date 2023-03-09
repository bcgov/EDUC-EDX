<template>
  <v-card id="editContactVCard">
    <v-card-title class="sheetHeader pt-1 pb-1">Edit District Contact</v-card-title>
    <v-divider/>
    <v-card-text>
      <v-form ref="editContactForm" v-model="isFormValid">
        <v-row class="d-flex justify-center">
          <v-col>
            <v-alert color="#E9EBEF" dense type="info">
              <p style="color: #003366">District contacts will be <strong>available to the public as of start date</strong>.</p>
              <p style="color: #003366" class="mb-1">Please be sure to review the new contact details carefully before saving.</p>
            </v-alert>
          </v-col>
        </v-row>
        <v-row class="d-flex justify-center">
          <v-col>
            <v-select
                id='editContactDropdown'
                :rules="[rules.required()]"
                v-model="editContact.districtContactTypeCode"
                :items="districtContactTypes"
                item-title="label"
                variant="underlined"
                class="pt-0"
                item-value="districtContactTypeCode"
                label="District Contact Type"/>
            <v-text-field
                id='editContactFirstNameInput'
                v-model="editContact.firstName"
                class="pt-0"
                variant="underlined"
                :maxlength="255"
                label="First Name"/>
            <v-text-field
                id='editContactLastNameInput'
                :rules="[rules.required()]"
                v-model="editContact.lastName"
                class="pt-0"
                variant="underlined"
                :maxlength="255"
                label="Last Name"/>
            <v-text-field id="editContactJobTitle"
                          v-model="editContact.jobTitle"
                          label="Title"
                          variant="underlined"
                          type="text"
                          maxlength="255"/>
            <v-text-field
                id='editContactEmailInput'
                :rules="[rules.required(), rules.email()]"
                v-model="editContact.email"
                class="pt-0"
                variant="underlined"
                :maxlength="255"
                label="Email"/>
            <v-row>
              <v-col cols="6">
                <v-text-field
                    id='editContactPhoneNumberInput'
                    :rules="[rules.required(), rules.phoneNumber()]"
                    v-model="editContact.phoneNumber"
                    class="pt-0"
                    variant="underlined"
                    :maxlength="10"
                    label="Phone Number"
                    @keypress="isNumber($event)"/>
              </v-col>
              <v-col cols="6">
                <v-text-field
                    id='editContactPhoneExtensionInput'
                    :rules="[rules.number()]"
                    v-model="editContact.phoneExtension"
                    :maxlength="10"
                    variant="underlined"
                    class="pt-0"
                    label="Ext."
                    @keypress="isNumber($event)"/>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                    id='editContactAltPhoneNumberInput'
                    :rules="[rules.phoneNumber()]"
                    v-model="editContact.alternatePhoneNumber"
                    class="pt-0"
                    variant="underlined"
                    :maxlength="10"
                    label="Alt. Phone Number"
                    @keypress="isNumber($event)"/>
              </v-col>
              <v-col cols="6">
                <v-text-field
                    id='editContactAltPhoneExtensionInput'
                    :rules="[rules.number()]"
                    v-model="editContact.alternatePhoneExtension"
                    class="pt-0"
                    variant="underlined"
                    :maxlength="10"
                    label="Alt. Phone Ext."
                    @keypress="isNumber($event)"/>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-menu
                    id="editContactEffectiveDatePicker"
                    ref="editContactEffectiveDateFilter"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        id="editContactEffectiveDateTextField"
                        :rules="[rules.required()]"
                        class="pt-0 mt-0"
                        v-model="editContact.effectiveDateMoment"
                        variant="underlined"
                        label="Start Date"
                        prepend-inner-icon="mdi-calendar"
                        clearable
                        readonly
                        v-on:click:clear="clearEffectiveDate"
                        v-on:click="openEffectiveDatePicker"
                        v-bind="attrs"/>
                  </template>
                </v-menu>
                <VueDatePicker
                  ref="effectiveDatePicker"
                  :rules="[rules.required()]"
                  v-model="editContact.effectiveDate"
                  :enable-time-picker="false"
                  format="yyyy-MM-dd"
                  @update:model-value="saveEditContactEffectiveDate"
                ></VueDatePicker>
              </v-col>
              <v-col cols="6">
                <v-menu
                    id="editContactExpiryDatePicker"
                    ref="editContactExpiryDateFilter"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        id="editContactExpiryDateTextField"
                        :rules="[rules.endDateRule(editContact.effectiveDateMoment, editContact.expiryDateMoment)]"
                        class="pt-0 mt-0"
                        v-model="editContact.expiryDateMoment"
                        label="End Date"
                        variant="underlined"
                        prepend-inner-icon="mdi-calendar"
                        v-on:click:clear="clearExpiryDate"
                        v-on:click="openExpiryDatePicker"
                        clearable
                        readonly
                        v-bind="attrs"/>
                  </template>
                </v-menu>
                <VueDatePicker
                  ref="expiryDatePicker"
                  :rules="[rules.required()]"
                  v-model="editContact.expiryDate"
                  :enable-time-picker="false"
                  format="yyyy-MM-dd"
                  @update:model-value="saveEditContactExpiryDate"
                ></VueDatePicker>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-end">
      <PrimaryButton id="cancelChangesToDistrictContactButton"
                     secondary text="Cancel"
                     :clickAction="cancelEditDistrictContactPage"/>
      <PrimaryButton id="saveChangesToDistrictContactButton"
                     text="Save"
                     width="7rem"
                     :clickAction="saveDistrictContact"
                     :disabled="!isFormValid"
                     :loading="processing"/>
    </v-card-actions>
  </v-card>
</template>

<script>
import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import alertMixin from '../../mixins/alertMixin';
import {formatDate} from '../../utils/format';
import * as Rules from '../../utils/institute/formRules';
import {isNumber} from '../../utils/institute/formInput';
import {cloneDeep} from 'lodash';
import PrimaryButton from '../util/PrimaryButton.vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import moment from 'moment';

export default {
  name: 'EditDistrictContactPage',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
    VueDatePicker
  },
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
  mounted() {
    let clonedContact = cloneDeep(this.contact);
    clonedContact.effectiveDateMoment = formatDate(clonedContact.effectiveDate, this.from, this.pickerFormat);
    clonedContact.expiryDateMoment = formatDate(clonedContact.expiryDate, this.from, this.pickerFormat);
    clonedContact.effectiveDate = new Date(moment(clonedContact.effectiveDateMoment));
    clonedContact.expiryDate = new Date(moment(clonedContact.expiryDateMoment));
    this.editContact = clonedContact;
    this.validateForm();
  },
  data() {
    return {
      from: 'uuuu-MM-dd\'T\'HH:mm:ss',
      pickerFormat: 'uuuu-MM-dd',
      processing: false,
      isFormValid: false,
      editContact: '',
      rules: Rules,
      editContactExpiryDatePicker: null,
      editContactEffectiveDatePicker: null,
    };
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
      if(this.editContact.effectiveDateMoment) {
        this.editContact.effectiveDate = this.editContact.effectiveDateMoment;
      }

      if(this.editContact.expiryDateMoment) {
        this.editContact.expiryDate = this.editContact.expiryDateMoment;
      }

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
    openEffectiveDatePicker(){
      this.$refs.effectiveDatePicker.openMenu();
    },
    openExpiryDatePicker(){
      this.$refs.expiryDatePicker.openMenu();
    },
    saveEditContactExpiryDate(date) {
      this.editContact.expiryDateMoment = moment(this.editContact.expiryDate).format('YYYY-MM-DD').toString();
      this.validateForm();
    },
    saveEditContactEffectiveDate(date) {
      this.editContact.effectiveDateMoment = moment(this.editContact.effectiveDate).format('YYYY-MM-DD').toString();
      this.validateForm();
    },
    clearEffectiveDate(){
      this.editContact.effectiveDateMoment = null;
      this.editContact.effectiveDate = null;
      this.validateForm();
    },
    clearExpiryDate(){
      this.editContact.expiryDateMoment = null;
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
  },
  watch: {
    'editContact.effectiveDate': {
      handler() {
        this.validateForm();
      }
    }
  }
};
</script>

<style scoped>
  :deep(.dp__input_wrap){
    height: 0px;
    width: 0px;
  }

  :deep(.dp__input){
    display: none;
  }

  :deep(.dp__icon){
    display: none;
  }

  .sheetHeader {
    background-color: #003366;
    color: white;
    font-size: medium !important;
    font-weight: bolder !important;
  }
</style>

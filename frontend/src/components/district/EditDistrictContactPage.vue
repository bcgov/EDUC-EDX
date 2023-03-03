<template>
  <v-card id="editContactVCard">
    <v-card-title class="sheetHeader pt-1 pb-1">Edit District Contact</v-card-title>
    <v-divider/>
    <v-card-text>
      <v-form ref="editContactForm" v-model="isFormValid">
        <v-row class="d-flex justify-center">
          <v-col>
            <v-alert color="#E9EBEF" dense text type="info">
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
                class="pt-0"
                item-value="districtContactTypeCode"
                label="District Contact Type"/>
            <v-text-field
                id='editContactFirstNameInput'
                v-model="editContact.firstName"
                class="pt-0"
                :maxlength="255"
                label="First Name"/>
            <v-text-field
                id='editContactLastNameInput'
                :rules="[rules.required()]"
                v-model="editContact.lastName"
                class="pt-0"
                :maxlength="255"
                label="Last Name"/>
            <v-text-field id="editContactJobTitle"
                          v-model="editContact.jobTitle"
                          label="Title"
                          type="text"
                          maxlength="255"/>
            <v-text-field
                id='editContactEmailInput'
                :rules="[rules.required(), rules.email()]"
                v-model="editContact.email"
                class="pt-0"
                :maxlength="255"
                label="Email"/>
            <v-row>
              <v-col cols="6">
                <v-text-field
                    id='editContactPhoneNumberInput'
                    :rules="[rules.required(), rules.phoneNumber()]"
                    v-model="editContact.phoneNumber"
                    class="pt-0"
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
                        v-model="editContact.effectiveDate"
                        label="Start Date"
                        prepend-inner-icon="mdi-calendar"
                        clearable
                        readonly
                        v-bind="attrs"/>
                  </template>
                </v-menu>
                <VueDatePicker
                  v-model="editContact.effectiveDate"
                  :active-picker.sync="editContactEffectiveDatePicker"
                  @change="saveEditContactEffectiveDate"
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
                        :rules="[rules.endDateRule(editContact.effectiveDate, editContact.expiryDate)]"
                        class="pt-0 mt-0"
                        v-model="editContact.expiryDate"
                        label="End Date"
                        prepend-inner-icon="mdi-calendar"
                        clearable
                        readonly
                        v-bind="attrs"/>
                  </template>
                  <VueDatePicker
                    :enable-time-picker="false"
                    v-model="editContact.expiryDate"
                    :active-picker.sync="editContactExpiryDatePicker"
                    @change="saveEditContactExpiryDate"
                  ></VueDatePicker>
                </v-menu>
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
    this.validateForm();
  },
  data() {
    let clonedContact = cloneDeep(this.contact);
    let from ='uuuu-MM-dd\'T\'HH:mm:ss';
    let pickerFormat = 'uuuu-MM-dd';
    clonedContact.effectiveDate = formatDate(clonedContact.effectiveDate, from, pickerFormat);
    clonedContact.expiryDate = formatDate(clonedContact.expiryDate, from, pickerFormat);
    return {
      processing: false,
      isFormValid: false,
      editContact: clonedContact,
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
      this.validateForm();
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
    saveEditContactExpiryDate(date) {
      this.$refs.editContactExpiryDateFilter.save(date);
    },
    saveEditContactEffectiveDate(date) {
      this.$refs.editContactEffectiveDateFilter.save(date);
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
  .sheetHeader {
    background-color: #003366;
    color: white;
    font-size: medium !important;
    font-weight: bolder !important;
  }
</style>

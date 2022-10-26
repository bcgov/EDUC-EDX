<template>
  <v-card
      id="newContactVCard">
    <v-card-title class="sheetHeader pt-1 pb-1">New Contact</v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-form ref="newContactForm" v-model="isFormValid">
        <v-row class="d-flex justify-center">
          <v-col>
            <v-select
                id='newContactDropdown'
                :rules="[rules.required]"
                v-model="newContact.contactType"
                :items="schoolContactTypes"
                item-text="label"
                class="pt-0"
                item-value="schoolContactTypeCode"
                label="School Contact Type*"
            />
            <v-text-field
                id='newContactFirstNameInput'
                :rules="[rules.required, rules.length(255, 'Must be less than 255 letters')]"
                v-model="newContact.firstName"
                class="pt-0"
                label="First Name*"
            />
            <v-text-field
                id='newContactLastNameInput'
                :rules="[rules.required, rules.length(255, 'Must be less than 255 letters')]"
                v-model="newContact.lastName"
                class="pt-0"
                label="Last Name*"
            />
            <v-text-field
                id='newContactEmailInput'
                :rules="[rules.required, rules.email, rules.length(255, 'Must be less than 255 letters')]"
                v-model="newContact.email"
                class="pt-0"
                label="Email*"
            />
            <v-row>
              <v-col cols="6">
                <v-text-field
                    id='newContactPhoneNumberInput'
                    :rules="[rules.required, rules.length(10, 'Phone number must be 10 digits'), rules.phoneNumber]"
                    v-model="newContact.phoneNumber"
                    class="pt-0"
                    label="Phone Number*"
                    @keypress="isNumber($event)"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                    id='newContactPhoneExtensionInput'
                    :rules="[rules.length(10, 'Must be less than 10 digits')]"
                    v-model="newContact.phoneExtension"
                    class="pt-0"
                    label="Ext."
                    @keypress="isNumber($event)"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                    id='newContactAltPhoneNumberInput'
                    :rules="[rules.length(10, 'Phone number must be 10 digits'), rules.phoneNumber]"
                    v-model="newContact.alternatePhoneNumber"
                    class="pt-0"
                    label="Alt. Phone Number"
                    @keypress="isNumber($event)"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                    id='newContactAltPhoneExtensionInput'
                    :rules="[rules.length(10, 'Must be less than 10 digits')]"
                    v-model="newContact.alternatePhoneExtension"
                    class="pt-0"
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
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        id="newContactEffectiveDateTextField"
                        :rules="[rules.required]"
                        class="pt-0 mt-0"
                        v-model="newContact.effectiveDate"
                        label="Effective Date*"
                        prepend-inner-icon="mdi-calendar"
                        clearable
                        readonly
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                      v-model="newContact.effectiveDate"
                      :active-picker.sync="newContactEffectiveDatePicker"
                      @change="saveNewContactEffectiveDate"
                  ></v-date-picker>
                </v-menu>
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
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        id="newContactExpiryDateTextField"
                        :rules="[rules.endDate]"
                        class="pt-0 mt-0"
                        v-model="newContact.expiryDate"
                        label="Expiry Date"
                        prepend-inner-icon="mdi-calendar"
                        clearable
                        readonly
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                      v-model="newContact.expiryDate"
                      :active-picker.sync="newContactExpiryDatePicker"
                      :min="(new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)"
                      @change="saveNewContactExpiryDate"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-end">
      <PrimaryButton id="cancelNewContactBtn" secondary text="Cancel" @click.native="closeNewContactPage"></PrimaryButton>
      <PrimaryButton id="newContactPostBtn" text="Send" width="7rem" @click.native="addNewSchoolContact" :disabled="!isFormValid" :loading="processing"></PrimaryButton>
    </v-card-actions>
  </v-card>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton';
import {mapGetters} from 'vuex';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';
import {ApiRoutes} from '@/utils/constants';
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
  },
  mounted() {
    this.validateForm();
  },
  data() {
    return {
      isFormValid: false,
      processing: false,
      newContact: {
        contactType: null,
        firstName: null,
        lastName: null,
        email: null,
        phoneNumber: null,
        phoneExtension: null,
        alternatePhoneNumber: null,
        alternatePhoneExtension: null,
        effectiveDate: null,
        expiryDate: null

      },
      rules: {
        required: v => !!v || 'Required',
        length: (length, message) => v => (!v || v.length <= length) || message,
        phoneNumber: v => !v || /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(v) || 'Phone Number must be valid',
        email: v => !v || /^[\w!#$%&’*+/=?`{|}~^-]+(?:\.[\w!#$%&’*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/.test(v) || 'E-mail must be valid',
        endDate: this.endDateRuleValidator,
      },
      effectiveDateFilter: false,
      newContactEffectiveDatePicker: null,
      expiryDateFilter: false,
      newContactExpiryDatePicker: null
    };
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated','userInfo']),
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
      ApiService.apiAxios.post(`${ApiRoutes['school'].BASE_URL}/${this.schoolID}/contact`, this.newContact)
        .then(() => {
          this.setSuccessAlert('Success! New contact added.');
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
    isNumber: function(evt) {
      let charCode = (evt.which) ? evt.which : evt.keyCode;
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    resetForm() {
      this.$refs.newContactForm.reset();
    },
    validateForm() {
      this.isFormValid = this.$refs.newContactForm.validate();
    },
    endDateRuleValidator() {
      if (!this.newContact.effectiveDate && this.newContact.expiryDate) {
        return 'Effective date required';
      }

      if (this.newContact.effectiveDate && this.newContact.expiryDate) {
        const effDate = LocalDate.parse(this.newContact.effectiveDate);
        const expDate = LocalDate.parse(this.newContact.expiryDate);
        return effDate.isBefore(expDate) || effDate.equals(expDate) || 'End date cannot be before start date';
      }

      return true;
    }
  },
  watch: {
    //watching effective date to valid form because we need to cross validate expiry and effective date fields
    'newContact.effectiveDate': {
      handler() {
        this.validateForm();
      }
    }
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
</style>

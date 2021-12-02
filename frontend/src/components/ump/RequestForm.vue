<template>
  <div>
    <v-alert
      dense
      outlined
      dismissible
      v-model="alert"
      class="pa-3 mb-3 mx-3 bootstrap-error"
    >
      {{ alertMessage }}
    </v-alert>

    <v-alert outlined class="pa-3 mb-3 mx-3 bootstrap-warning">
      <h3>Guidance:</h3>
      <ul class="pt-2">
        <li>This form can only be completed by the owner of the PEN</li>
        <li>This form can only be completed if you have already left high school. If you are still attending a K-12 school, request changes at your school</li>
        <li>If your name and/or gender has been legally changed, proof of this change may be requested</li>
      </ul>
    </v-alert>

    <v-container fluid class="py-0">
      <v-row>
        <v-col cols="12" class="declaration py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
          <v-checkbox
            id="declarationCheckbox"
            v-model="declared"
            color="green"
            class="mt-0"
            :rules="checkboxRules('')"
            @click.native="clickCheckbox"
          >
            <template v-slot:label>
              <div class="pl-3">
                I declare that I am submitting a student data change request on my own behalf. Update personal data as indicated below
              </div>
            </template>
          </v-checkbox>
        </v-col>
      </v-row>
    </v-container>

    <v-alert outlined class="pa-3 mb-3 mx-3 bootstrap-warning">
      <span>Check fields that need to be changed and enter new information. Leave fields unchecked that do not require changes. At least one field in the Student Information section must be changed in order to submit a request.</span>
    </v-alert>

    <v-form autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
      ref="form" id="requestForm"
      v-model="validForm"
    >

      <v-card-subtitle class="mb-2">
        <span style="font-size: 1.3rem;font-weight: bolder; color: #333333">Student Information</span>
      </v-card-subtitle>

      <v-container fluid class="py-0">
        <v-row>
          <v-col cols="12" sm="6" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-container class="d-flex align-start pa-0" fluid>
              <v-checkbox
                id="editLegalFirstNameCheckbox"
                class="pt-0 pr-2 mt-0"
                v-model="editLegalFirstName"
                label="Change"
                dense
                :disabled="enableDisableForm.disabled"
              ></v-checkbox>
              <v-text-field
                id='legalFirstName'
                v-model="request.legalFirstName"
                color="#003366"
                hint="As shown on current Government Photo ID"
                :persistent-hint="!enableDisableForm.disabled && editLegalFirstName"
                outlined
                class="touppercase"
                label="Current Legal First Name(s); leave blank if you do not have a first name"
                :disabled="enableDisableForm.disabled || !editLegalFirstName"
                autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
                maxlength="25"
                dense
                :rules="charRules"
              ></v-text-field>
            </v-container>
          </v-col>
          <v-col cols="12" sm="6" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-container class="d-flex align-start pa-0" fluid>
              <v-checkbox
                id="editLegalMiddleNamesCheckbox"
                class="pt-0 pr-2 mt-0"
                v-model="editLegalMiddleNames"
                label="Change"
                dense
                :disabled="enableDisableForm.disabled"
              ></v-checkbox>
              <v-text-field
                id='legalMiddleNames'
                v-model="request.legalMiddleNames"
                color="#003366"
                hint="As shown on current Government Photo ID"
                :persistent-hint="!enableDisableForm.disabled && editLegalMiddleNames"
                outlined
                class="touppercase"
                label="Current Legal Middle Name(s)"
                :disabled="enableDisableForm.disabled || !editLegalMiddleNames"
                autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
                maxlength="25"
                dense
                :rules="charRules"
              ></v-text-field>
            </v-container>
          </v-col>
          <v-col cols="12" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-container class="d-flex align-start pa-0" fluid>
              <v-checkbox
                id="editLegalLastNameCheckbox"
                class="pt-0 pr-2 mt-0"
                v-model="editLegalLastName"
                label="Change"
                dense
                :disabled="enableDisableForm.disabled"
              ></v-checkbox>
              <v-text-field
                id='legalLastName'
                v-model="request.legalLastName"
                color="#003366"
                outlined
                :rules="charRules && requiredRules(lastNameHint)"
                class="touppercase"
                :hint="legalLastNameHint"
                :persistent-hint="!enableDisableForm.disabled && editLegalLastName"
                label="Current Legal Last Name"
                :disabled="enableDisableForm.disabled || !editLegalLastName"
                autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
                maxlength="25"
                dense
              ></v-text-field>
            </v-container>
          </v-col>
          <v-col cols="12" sm="6" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-container class="d-flex align-start pa-0" fluid>
              <v-checkbox
                id="editBirthdateCheckbox"
                class="pt-0 pr-2 mt-0"
                v-model="editBirthdate"
                label="Change"
                dense
                :disabled="enableDisableForm.disabled"
              ></v-checkbox>
              <v-menu
                ref="menu"
                v-model="menu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    color="#003366"
                    outlined
                    :value="request.dob ? moment(request.dob).format('MMMM D, YYYY'):''"
                    :rules="requiredRules(dobHint)"
                    label="Birthdate"
                    readonly
                    v-on="on"
                    id="birthdate"
                    :disabled="enableDisableForm.disabled || !editBirthdate"
                    @keyup="focusBirthdateField"
                    ref="birthdate"
                    autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
                    dense
                  ></v-text-field>
                </template>
                <v-date-picker
                  id='dob'
                  color="#003366"
                  ref="picker"
                  v-model="request.dob"
                  show-current
                  :max="new Date(this.localDate.now().minusYears(5).toString()).toISOString().substr(0, 10)"
                  min="1903-01-01"
                  @change="save"
                ></v-date-picker>
              </v-menu>
            </v-container>
          </v-col>
          <v-col cols="12" sm="6" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-container class="d-flex align-start pa-0" fluid>
              <v-checkbox
                id="editGenderLabelCheckbox"
                class="pt-0 pr-2 mt-0"
                v-model="editGenderLabel"
                label="Change"
                dense
                :disabled="enableDisableForm.disabled"
              ></v-checkbox>
              <v-select
                id='gender'
                color="#003366"
                v-model="request.genderLabel"
                outlined
                :items="genderLabels"
                :hint="genderHint"
                :rules="genderRules()"
                :persistent-hint="!enableDisableForm.disabled && editGenderLabel"
                label="Current Gender"
                :disabled="enableDisableForm.disabled || !editGenderLabel"
                dense
              ></v-select>
            </v-container>
          </v-col>
        </v-row>
      </v-container>

      <v-card-subtitle class="mb-2">
        <span style="font-size: 1.3rem;font-weight: bolder; color: #333333">Contact Information</span>
      </v-card-subtitle>

      <v-container fluid class="py-0">
        <v-row>
          <v-col cols="12" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-container class="d-flex align-start pa-0" fluid>
              <v-checkbox
                id="editEmail"
                class="pt-0 pr-2 mt-0"
                v-model="editEmail"
                label="Change"
                dense
                :disabled="enableDisableForm.disabled"
                v-if="hasStudentRecord"
              ></v-checkbox>
              <v-text-field
                id='email'
                v-model="request.email"
                :rules="emailRules"
                color="#003366"
                :hint="emailHint"
                class="touppercase"
                outlined
                label="E-mail Address"
                :disabled="enableDisableForm.disabled || (!editEmail && hasStudentRecord)"
                autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"
                maxlength="255"
                dense
              ></v-text-field>
            </v-container>
          </v-col>
        </v-row>
      </v-container>
      <v-container fluid noPadding>
        <v-row>
          <v-col cols="12" class="declaration py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-checkbox id="acceptance_chk"
              v-model="acceptance"
              color="green"
              class="mt-0"
              :rules="checkboxRules('')"
              @click.native="clickCheckbox"
            >
              <template v-slot:label>
                <div class="pl-3">
                  The personal demographic data provided above is complete and accurate.
                </div>
              </template>
            </v-checkbox>
          </v-col>
        </v-row>
        <v-row>
          <v-col id="confidential_information" cols="12" class="py-0 px-2 px-sm-2 px-md-3 px-lg-3 px-xl-3">
            <v-card height="100%" width="100%" elevation=2
                    class="black--text pa-4">
              <p><strong>Collection Notice:</strong></p>
              <p>
                The information included in this form is collected under ss. 26(c) of the Freedom of Information and Protection of Privacy Act, R.S.B.C. 1996, c. 165. 
                The information you provide will be used in confirming your identity and communicating with you.
              </p>
              <p>
                If you have any questions about the collection and use of this information, please contact:
              </p>
              <p>
                <a href="mailto:pens.coordinator@gov.bc.ca">PEN Coordinator</a><br/>
                Data Management Unit, Student Data & Educational Resource Services Branch<br/>
                B.C. Ministry of Education<br/>
                PO Box 9886 Stn Prov Govt<br/>
                Victoria BC V8W 9T6<br/>
                OR through Enquiry BC (Victoria): (250) 387-6121
              </p>
            </v-card>
          </v-col>
        </v-row>
        <v-row justify="space-between" class="pt-2">
          <v-col cols="1" sm="2" class="d-flex justify-left align-self-center py-0 px-0 pl-4">
            <v-btn
              to="home"
              color="#003366"
              class="white--text align-self-center"
              id="cancelButton"
            >
              Cancel
            </v-btn>
          </v-col>
          <v-col cols="11" sm="2" class="d-flex justify-end align-self-center py-0 px-0 pr-3">
            <v-card-actions>
              <v-btn
                color="#003366"
                class="white--text align-self-center"
                id="previous-step"
                @click="previousStep"
              >
                Back
              </v-btn>
              <v-btn
                color="#003366"
                class="white--text align-self-center"
                id="next-step"
                @click="validateRequestForm"
                :disabled="!validForm"
              >
                Next
              </v-btn>

            </v-card-actions>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { LocalDate } from '@js-joda/core';
import { isEqual, mapValues, pick } from 'lodash';

import { createHelpers } from 'vuex-map-fields';

// `ump` is the name of the Vuex module.
const { mapFields } = createHelpers({
  getterType: 'ump/getField',
  mutationType: 'ump/updateField',
});

export default {
  name: 'requestForm',
  data() {
    return {
      localDate:LocalDate,
      genderHint: 'As shown on current Government Photo ID',
      genderRequiredHint: 'Valid Gender Required',
      legalLastNameHint: 'As shown on current Government Photo ID. Note, If you have ONE name only – enter it into the Legal Last Name field and leave Legal First Name blank',
      emailHint: 'Valid Email Required',
      dobHint: 'Valid Birthdate Required',
      lastNameHint: 'Valid Legal Last Name Required',
      menu: false,
      validForm: false,
      submitting: false,

      alert: false,
      alertMessage: null,
      enableDisableForm: {
        disabled: true
      },
      acceptance: false
    };
  },
  mounted() {
    this.request.legalLastName = this.editLegalLastName ? this.request.legalLastName : this.recordedData.legalLastName;
    this.request.legalFirstName = this.editLegalFirstName ? this.request.legalFirstName : this.recordedData.legalFirstName;
    this.request.legalMiddleNames = this.editLegalMiddleNames ? this.request.legalMiddleNames : this.recordedData.legalMiddleNames;
    this.request.dob = this.editBirthdate ? this.request.dob : this.recordedData.dob;
    this.request.genderLabel = this.editGenderLabel ? this.request.genderLabel : this.recordedData.genderLabel;
    this.request.email = (this.editEmail || !this.hasStudentRecord) ? this.request.email : this.recordedData.email;

  },
  computed: {
    ...mapGetters('studentRequest', ['genders', 'genderInfo']),
    ...mapGetters(['student']),
    ...mapState('ump', ['recordedData']),
    ...mapState('ump', { request: 'updateData' }),
    ...mapFields([
      'isEditable.editLegalLastName',
      'isEditable.editLegalFirstName',
      'isEditable.editLegalMiddleNames',
      'isEditable.editBirthdate',
      'isEditable.editGenderLabel',
      'isEditable.editEmail',
      'declared'
    ]),
    hasStudentRecord() {
      return !!this.student;
    },
    emailRules() {
      return [
        v => !!v || this.emailHint,
        v => /^[\w!#$%&’*+/=?`{|}~^-]+(?:\.[\w!#$%&’*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}$/.test(v) || this.emailHint,
      ];
    },
    charRules() {
      return [
        v => !(/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u1100-\u11FF\u3040-\u309F\u30A0-\u30FF\u3130-\u318F\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF]/.test(v)) || 'Enter English characters only'
      ];
    },
    genderLabels() {
      return this.genders.map(a => a.label);
    }
  },
  watch: {
    menu(val) {
      val && setTimeout(() => (this.$refs.picker.activePicker = 'YEAR'));
    },
    editLegalLastName(val) {
      this.request.legalLastName = val ? '' : this.recordedData.legalLastName;
    },
    editLegalFirstName(val) {
      this.request.legalFirstName = val ? '' : this.recordedData.legalFirstName;
    },
    editLegalMiddleNames(val) {
      this.request.legalMiddleNames = val ? '' : this.recordedData.legalMiddleNames;
    },
    editBirthdate(val) {
      this.request.dob = val ? '' : this.recordedData.dob;
    },
    editGenderLabel(val) {
      this.request.genderLabel = val ? '' : this.recordedData.genderLabel;
    },
    editEmail(val) {
      this.request.email = val ? '' : this.recordedData.email;
    },
    recordedData: {
      deep: true,
      handler() {
        Object.assign(this.request, this.recordedData);
      }
    }
  },
  methods: {
    requiredRules(hint = 'Required') {
      return [
        v => !!(v && v.trim()) || hint,
        ...this.charRules
      ];
    },
    genderRules() {
      return [
        v => !this.editGenderLabel || !!(v && v.trim()) || (this.request.genderLabel || '') === (this.recordedData.genderLabel || '') || this.genderRequiredHint,
        ...this.charRules
      ];
    },
    checkboxRules(hint = 'Required') {
      this.enableDisableForm.disabled = !this.declared;
      this.validForm = (this.declared && this.acceptance);
      return [v => !!v || hint];
    },
    save(date) {
      this.$refs.menu.save(date);
      this.$refs.birthdate.$el.querySelectorAll('#birthdate')[0].focus();
    },
    validate() {
      this.$refs.form.validate();
    },
    setNoChangeErrorDialog() {
      this.alertMessage = 'You must specify at least one change in order to submit a request.';
      this.alert = true;
      window.scrollTo(0,0);
    },
    validateRequestForm() {
      if (this.$refs.form.validate() && this.validForm) {
        if(this.request.genderLabel) {
          const code = this.genders.filter(it => (it.label === this.request.genderLabel));
          this.request.genderCode = code[0].genderCode;
        }else if(!this.editGenderLabel) {
          this.request.genderCode = this.recordedData.genderCode;
        }
        if(isEqual(mapValues(pick(this.request, ['legalLastName', 'legalFirstName', 'legalMiddleNames', 'dob', 'genderCode']), v=> v === null ? '' : v),
          mapValues(pick(this.recordedData, ['legalLastName', 'legalFirstName', 'legalMiddleNames', 'dob', 'genderCode']), v => v === null ? '' : v))) {
          this.setNoChangeErrorDialog();
        } else {
          this.$emit('next');
        }
      }
    },
    closeDialog() {
      this.dialog = false;
    },
    clickCheckbox() {
      this.validate();
    },
    focusBirthdateField(event) {
      if(event.key === 'Tab' && event.type === 'keyup') {
        this.menu = true;
      }
    },
    previousStep() {
      this.$emit('back');
    }
  }
};
</script>

<style scoped>

  input[autocomplete="6b4437dc-5a5a-11ea-8e2d-0242ac130003"]::-webkit-contacts-auto-fill-button {
    visibility: hidden;
    display: none !important;
    pointer-events: none;
    height: 0;
    width: 0;
    margin: 0;
  }

  .v-dialog {
    max-width: 1vw;
  }

  .declaration /deep/ .v-icon {
    padding-left: 2px;
  }

  .v-input--checkbox /deep/ .v-icon {
    padding-left: 2px;
  }

 /* .v-input--checkbox /deep/ .v-input--selection-controls__input {
    margin-right: 4px;
  } */

  .v-dialog > .v-card > .v-card__text {
    padding: 24px 24px 20px;
  }

  .noPadding {
    padding-top: 0;
    margin-top: 0;
  }

  .top_group {
    padding-top: 15px;
  }

  .bottom_group {
    padding-bottom: 15px;
  }
</style>

<style>
  .touppercase.v-text-field > .v-input__control > .v-input__slot > .v-text-field__slot input {
    text-transform: uppercase
  }
</style>

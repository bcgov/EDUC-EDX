<template>
  <v-container fluid>
    <v-form
      ref="edxUserActivationForm"
      v-model="isValidForm"
      :disabled="isEdxUserActivationFormDisabled"
    >
      <v-row class="pt-2 d-flex justify-center">
        <v-col
          cols="9"
          md="4"
        >
          <v-row>
            <v-col class="pb-0">
              <span class="header-text"><strong>Activate EDX Account</strong></span>
            </v-col>
          </v-row>
          <v-snackbar
            id="activationSnackBar"
            v-model="showActivationSnackBar"
            elevation="24"
            location="top"
            centered
            color="error"
            transition="slide-y-transition"
          >
            {{ activationErrorMessage }}
          </v-snackbar>
          <v-row>
            <v-col cols="12">
              <v-card color="#CED6E2">
                <v-card-text class="text-black">
                  <p>To activate your Edx user account, you will need to enter the following:</p>
                  <ul style="padding: revert;">
                    <li>
                      Your {{ instituteTypeLabel.toLowerCase() }}'s <strong>{{ instituteIdentifierLabel }}</strong>
                    </li>
                    <li>
                      Your <strong>{{ instituteTypeLabel }}'s Primary Activation Code</strong> obtained from your {{ instituteTypeLabel.toLowerCase() }} administrator
                    </li>
                    <li>
                      Your <strong>Personal Activation Code</strong> from your EDX invite email
                    </li>
                  </ul>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-center">
            <v-col cols="8">
              <v-text-field
                id="instituteIdentifierTextField"
                v-model="instituteSpecificCode"
                :rules="instituteSpecificCodeRules && requiredRules"
                variant="underlined"
                :hint="createInstituteSpecificCodeHint"
                :label="createInstituteSpecificCodeLabel"
              />
            </v-col>
          </v-row>
          <v-row class="d-flex justify-center">
            <v-col cols="8">
              <v-text-field
                id="primaryEdxCodeTextField"
                v-model="primaryEdxCode"
                :rules="requiredRules"
                variant="underlined"
                :hint="`Please enter the code obtained from your ${instituteTypeLabel.toLowerCase()} administrator`"
                :label="`${instituteTypeLabel}'s Primary Activation Code`"
              />
            </v-col>
          </v-row>
          <v-row class="d-flex justify-center">
            <v-col cols="8">
              <v-text-field
                id="personalActivationCodeTextField"
                v-model="personalActivationCode"
                :rules="requiredRules"
                variant="underlined"
                label="Personal Activation Code"
                hint="Please enter the personal activation code you have received in your EDX invite email"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col
              cols="12"
              class="d-flex justify-center"
            >
              <PrimaryButton
                id="edxUserActivationSubmitBtn"
                :loading="submissionInProgress"
                :large-icon="true"
                text="Submit"
                :disabled="!isValidForm || isEdxUserActivationFormDisabled || submissionInProgress"
                :click-action="activateEdxUser"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton.vue';
import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import alertMixin from '../../mixins/alertMixin';

export default {
  name: 'ActivateEdxUserAccount',
  components: {PrimaryButton},
  mixins: [alertMixin],
  props:{
    instituteTypeLabel:{
      type:String,
      required:true
    },
    instituteTypeCode:{
      type:String,
      required:true
    },
    instituteIdentifierLabel:{
      type:String,
      required:true
    },
  },
  data() {
    return {
      instituteSpecificCode: null,
      activationErrorMessage:null,
      personalActivationCode: null,
      primaryEdxCode: null,

      instituteSpecificCodeRules: [v => (!v || this.validateInstituteSpecificCode(v)) || 'Invalid schoolID'],
      isValidForm: false,
      requiredRules: [v => !!v || 'Required'],
      submissionInProgress: false,
      isEdxUserActivationFormDisabled: false,
      showActivationSnackBar:false
    };
  },
  computed: {
    createInstituteSpecificCodeHint() {
      if(this.instituteTypeCode === 'SCHOOL') {
        return 'Please enter the mincode of the school you want to register for';
      }
      return 'Please enter the district number of the district you want to register for';
    },
    createInstituteSpecificCodeLabel() {
      if(this.instituteTypeCode === 'SCHOOL') {
        return this.instituteIdentifierLabel;
      }
      return `${this.instituteTypeLabel} ${this.instituteIdentifierLabel}`;
    }
  },
  mounted() {
    this.validateForm();
  },
  methods: {
    validateInstituteSpecificCode(v) {
      if(this.instituteTypeCode === 'SCHOOL') {
        return !(v.length !== 8 || isNaN(v));
      }
      return !(v.length !== 3 || isNaN(v));
    },
    activateEdxUser() {
      this.submissionInProgress = true;
      const body = {
        personalActivationCode: this.personalActivationCode,
        primaryEdxCode: this.primaryEdxCode,
      };

      if(this.instituteTypeCode === 'SCHOOL') {
        body.mincode = this.instituteSpecificCode;
      }else{
        body.districtNumber = this.instituteSpecificCode;
      }
      ApiService.apiAxios.post(ApiRoutes.edx.USER_ACTIVATION, body)
        .then(() => {
          this.setSuccessAlert('User Activation Completed Successfully. Redirecting to your Dashboard...');
          setTimeout(() => this.$router.push('/'), 1000);
        })
        .catch(error => {
          this.showActivationSnackBar=false;
          if (error?.response?.status === 429) {
            this.showActivationSnackBar=true;
            this.activationErrorMessage = error?.response?.data?.message;
            this.isEdxUserActivationFormDisabled = true;
          }
          if (error?.response?.data?.message){
            this.showActivationSnackBar=true;
            this.activationErrorMessage = error?.response?.data?.message;
          } else {
            this.showActivationSnackBar=true;
            this.activationErrorMessage = 'User Activation failed. Please try again.';
          }
          this.submissionInProgress = false;
        });
    },
    async validateForm() {
      const valid = await this.$refs.edxUserActivationForm.validate();
      this.isFormValid = valid.valid;
    },
  },
};
</script>

<style scoped>
.header-text {
  font-size: x-large;
}
</style>

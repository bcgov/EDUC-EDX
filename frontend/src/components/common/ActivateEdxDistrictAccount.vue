<template>
  <v-container fluid>
    <v-form :disabled="isEdxUserActivationFormDisabled" ref="edxUserActivationForm" v-model="isValidForm">

      <v-row class="pt-2 d-flex justify-center">
        <v-col cols="9" md="4">
          <v-row>
            <v-col class="pb-0">
              <span class="header-text"><strong>Activate EDX Account</strong></span>
            </v-col>
          </v-row>
                      <v-snackbar id="activationSnackBar"
                v-model="showActivationSnackBar"
                elevation="24"
                top
                centered
                color="error"
                transition="slide-y-transition"
                >
              {{activationErrorMessage}}
            </v-snackbar>
          <v-row>
            <v-col cols="12">
              <v-card color="#CED6E2">
                <v-card-text class="black--text">
                  <v-icon>
                    mdi-information-outline
                  </v-icon>
                  To activate your Edx user account, you will need to enter the following:
                  <br/>
                  <v-icon class="pl-12">mdi-circle-small</v-icon>
                  Your district's <strong>Number</strong>
                  <br/>
                  <v-icon class="pl-12">mdi-circle-small</v-icon>
                  Your <strong>District's Primary EDX Code</strong> obtained from your school administrator
                  <br/>
                  <v-icon class="pl-12">mdi-circle-small</v-icon>
                  Your <strong>Personal Activation Code</strong> from your EDX invite email
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-center">
            <v-col cols="5">
              <v-text-field id="districtNumberTextField"
                  v-model="districtNumber"
                  :rules="districtNumberRules && requiredRules"
                  hint="Please enter the district number of the district you want to register for"
                  label="District Number"
              ></v-text-field>
            </v-col>

          </v-row>
          <v-row class="d-flex justify-center">
            <v-col cols="5">
              <v-text-field
                  id="primaryEdxCodeTextField"
                  :rules="requiredRules"
                  v-model="primaryEdxCode"
                  hint="Please enter the code obtained from your district administrator"
                  label="District's Primary EDX Code"
              >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-center">
            <v-col cols="5">
              <v-text-field
                  id="personalActivationCodeTextField"
                  :rules="requiredRules"
                  v-model="personalActivationCode"
                  label="Personal Activation Code"
                  hint="Please enter the personal activation code you have received in your EDX invite email"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" class="d-flex justify-center">
              <PrimaryButton
                  :loading="submissionInProgress"
                  :large-icon=true
                  id="edxUserActivationSubmitBtn"
                  text="Submit"
                  :disabled="!isValidForm || isEdxUserActivationFormDisabled || submissionInProgress"
                  @click.native="activateEdxUser"
              ></PrimaryButton>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton';
import ApiService from '@/common/apiService';
import {ApiRoutes} from '@/utils/constants';
import alertMixin from '@/mixins/alertMixin';

export default {
  name: 'ActivateEdxDistrictAccount',
  mixins: [alertMixin],
  components: {PrimaryButton},
  data() {
    return {
      districtNumber: null,
      activationErrorMessage:null,
      personalActivationCode: null,
      primaryEdxCode: null,
      districtNumberRules: [v => (!v || this.validateDistrictNumber(v)) || 'Invalid districtNumber'],
      isValidForm: false,
      requiredRules: [v => !!v || 'Required'],
      validationCode: null,
      submissionInProgress: false,
      isEdxUserActivationFormDisabled: false,
      showActivationSnackBar:false
    };
  },
  computed: {
  },
  methods: {
    validateDistrictNumber(v) {
      return !(v.length !== 3 || isNaN(v));
    },
    activateEdxUser() {
      this.submissionInProgress = true;
      const body = {
        districtCode: this.districtNumber,
        personalActivationCode: this.personalActivationCode,
        primaryEdxCode: this.primaryEdxCode,
        validationCode: this.validationCode,
      };
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
    }
  },
  watch: {}
};
</script>

<style scoped>
.header-text {
  font-size: x-large;
}
</style>

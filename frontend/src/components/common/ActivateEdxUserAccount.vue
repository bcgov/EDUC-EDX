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
                location="top"
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
                  Your {{ instituteTypeLabel.toLowerCase() }}'s <strong>{{instituteIdentifierLabel}}</strong>
                  <br/>
                  <v-icon class="pl-12">mdi-circle-small</v-icon>
                  Your <strong>{{ instituteTypeLabel }}'s Primary Activation Code</strong> obtained from your {{ instituteTypeLabel.toLowerCase() }} administrator
                  <br/>
                  <v-icon class="pl-12">mdi-circle-small</v-icon>
                  Your <strong>Personal Activation Code</strong> from your EDX invite email
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-center">
            <v-col cols="5">
              <v-text-field id="instituteIdentifierTextField"
                  v-model="instituteSpecificCode"
                  :rules="instituteSpecificCodeRules && requiredRules"
                  variant="underlined"
                  :hint="createInstituteSpecificCodeHint"
                  :label="createInstituteSpecificCodeLabel"
              ></v-text-field>
            </v-col>

          </v-row>
          <v-row class="d-flex justify-center">
            <v-col cols="5">
              <v-text-field
                  id="primaryEdxCodeTextField"
                  :rules="requiredRules"
                  variant="underlined"
                  v-model="primaryEdxCode"
                 :hint="`Please enter the code obtained from your ${instituteTypeLabel.toLowerCase()} administrator`"
                  :label="`${instituteTypeLabel}'s Primary Activation Code`"
              >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-center">
            <v-col cols="5">
              <v-text-field
                  id="personalActivationCodeTextField"
                  :rules="requiredRules"
                  variant="underlined"
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
                  :clickAction="activateEdxUser"
              ></PrimaryButton>
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
  name: 'ActivateEdxUserAccount.vue',
  mixins: [alertMixin],
  components: {PrimaryButton},
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
  mounted() {
    this.validateForm();
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
          console.log('Here1 Marco');
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

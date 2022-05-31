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
                      <v-snackbar
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
                  Your school's <strong>Mincode</strong>
                  <br/>
                  <v-icon class="pl-12">mdi-circle-small</v-icon>
                  Your <strong>School's Primary EDX Code</strong> obtained from your school administrator
                  <br/>
                  <v-icon class="pl-12">mdi-circle-small</v-icon>
                  Your <strong>Personal Activation Code</strong> from your EDX invite email
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-center">
            <v-col cols="5">
              <v-text-field
                  v-model="mincode"
                  :rules="mincodeRules && requiredRules"
                  hint="Please enter the mincode of the school you want to register for"
                  label="Mincode"
              ></v-text-field>
            </v-col>

          </v-row>
          <v-row class="d-flex justify-center">
            <v-col cols="5">
              <v-text-field
                  :rules="requiredRules"
                  v-model="primaryEdxCode"
                  hint="Please enter the code obtained from your school administrator"
                  label="School's Primary EDX Code"
              >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-center">
            <v-col cols="5">
              <v-text-field
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
                  :large-icon=true
                  id="edxUserActivationSubmitBtn"
                  text="Submit"
                  :disabled="!isValidForm || isEdxUserActivationFormDisabled "
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
  name: 'ActivateEdxAccount.vue',
  mixins: [alertMixin],
  components: {PrimaryButton},
  data() {
    return {
      mincode: null,
      activationErrorMessage:null,
      personalActivationCode: null,
      primaryEdxCode: null,
      mincodeRules: [v => (!v || this.validateMincode(v)) || 'Invalid mincode'],
      isValidForm: false,
      requiredRules: [v => !!v || 'Required'],
      validationCode: null,
      isEdxUserActivationFormDisabled: false,
      showActivationSnackBar:false
    };
  },
  computed: {
  },
  methods: {
    validateMincode(v) {
      return !(v.length !== 8 || isNaN(v));
    },
    activateEdxUser() {
      const body = {
        mincode: this.mincode,
        personalActivationCode: this.personalActivationCode,
        primaryEdxCode: this.primaryEdxCode,
        validationCode: this.validationCode,
      };
      ApiService.apiAxios.post(ApiRoutes.edx.USER_ACTIVATION, body)
        .then(() => {
          this.setSuccessAlert('User Activation Completed Successfully. You will be redirected to your Dashboard Shortly!');
          setTimeout(() => this.$router.push('/'), 3000);

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

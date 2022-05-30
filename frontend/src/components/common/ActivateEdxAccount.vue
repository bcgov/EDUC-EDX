<template>
  <v-container fluid>
    <v-form :disabled="isEdxUserActivationFormDisabled" ref="edxUserActivationForm" v-model="isValidForm">

      <v-row class="pt-2">
        <v-col cols="2"></v-col>
        <v-col cols="8">
          <v-row>
            <div>
              <span class="header-text"><strong>Activate EDX Account</strong></span>
            </div>
          </v-row>
          <v-row>
            <div>
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

            </div>
          </v-row>
          <v-row>
            <v-col
                cols="12"
                sm="6"
            >
              <v-text-field
                  v-model="mincode"
                  :rules="mincodeRules"
                  :counter="8"
                  hint="Please enter the mincode of the school you want to register for"
                  label="Mincode"
              ></v-text-field>
            </v-col>

          </v-row>
          <v-row>
            <v-col
                cols="12"
                sm="6"
            >
              <v-text-field
                  :rules="requiredRules"
                  v-model="primaryEdxCode"
                  hint="Please enter the code obtained from your school administrator"
                  label="School's Primary EDX Code"
              >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col
                cols="12"
                sm="6"
            >
              <v-text-field
                  :rules="requiredRules"
                  v-model="personalActivationCode"
                  label="Personal Activation Code"
                  hint="Please enter the personal activation code you have received in your EDX invite email"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row class="justify-end">
            <v-col cols="12"
                   sm="6">
              <PrimaryButton
                  :large-icon=true
                  id="edxUserActivationSubmitBtn"
                  text="Submit"
                  :disabled="!isValidForm"
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
      personalActivationCode: null,
      primaryEdxCode: null,
      mincodeRules: [v => (!v || this.validateMincode(v)) || 'Invalid mincode'],
      isValidForm: false,
      requiredRules: [v => !!v || 'Required'],
      validationCode: null,
      isEdxUserActivationFormDisabled: false
    };
  },
  computed: {},
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
          if (error?.response?.status === 429) {
            this.setFailureAlert(error?.response?.data?.message);
            this.isEdxUserActivationFormDisabled = true;
          }
          if (error?.response?.data?.message) {
            this.setFailureAlert(error?.response?.data?.message);
          } else {
            this.setFailureAlert('User Activation failed. Please try again.');
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

<template>
  <v-container fluid class="full-height px-0 pt-0">
    <v-row class="d-flex justify-center">
      <v-col class="pt-0" cols="11">
        <v-row>
          <v-col class="pr-0 pb-0">
            <v-row>
              <v-col>
                <v-card id="newUserCard" flat outlined>
                  <v-row>
                    <v-col class="pb-0">
                      <v-card-text id="newUserCardText" class="pb-0 pt-0">
                        <v-form ref="newUserForm" v-model="isValidForm">
                          <v-row class="d-flex justify-left">
                            <v-col cols="7">
                              <v-text-field id="newUserFirstName"
                                            label="First Name"
                                            v-model="firstName"
                              ></v-text-field>
                            </v-col>
                          </v-row>
                          <v-row class="d-flex justify-left">
                            <v-col cols="7">
                              <v-text-field id="newUserLastName"
                                            label="Last Name"
                                            v-model="lastName"
                              ></v-text-field>
                            </v-col>
                          </v-row>
                          <v-row class="d-flex justify-left">
                            <v-col cols="7">
                              <v-text-field id="newUserEmail"
                                            label="Email"
                                            v-model="email"
                              ></v-text-field>
                            </v-col>
                          </v-row>
                          <v-row class="d-flex justify-left">
                            <v-col cols="7">
                              <v-text-field id="newUserSchool"
                                            label="School"
                                            v-model="schoolNameMincode"
                                            disabled="true"
                              ></v-text-field>
                            </v-col>
                          </v-row>
                          <v-row class="d-flex justify-left">
                            <v-col cols="7">
                              <v-select
                                  :items="userRoles"
                                  item-value='edxRoleID'
                                  item-text='roleName'
                                  v-model='edxActivationRoleIds'
                                  :menu-props="{ maxHeight: '400' }"
                                  label="Roles"
                                  multiple
                                  hint="Pick the roles to be assigned to the new user"
                                  persistent-hint
                              ></v-select>
                            </v-col>
                          </v-row>

                        </v-form>
                      </v-card-text>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>

          </v-col>
        </v-row>
        <v-row class="py-4 justify-end">
          <PrimaryButton id="cancelMessage" secondary text="Cancel" class="mr-2"
                         @click.native="navigateToList"></PrimaryButton>
          <PrimaryButton id="newUserInvitePostBtn" text="Invite" width="8rem" :disabled="!isValidForm" :loading="processing"
                         @click.native="sendNewUserInvite"></PrimaryButton>
        </v-row>
      </v-col>
    </v-row>

    <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
  </v-container>
</template>

<script>
import PrimaryButton from '@/components/util/PrimaryButton';
import ConfirmationDialog from '@/components/util/ConfirmationDialog';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';

import {
  ApiRoutes,
} from '@/utils/constants';
import {mapGetters,mapState} from 'vuex';

export default {
  name: 'newUserPage',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
    ConfirmationDialog,
  },
  props: {
    userRoles: {
      type: Array,
      required: true
    },
  },
  data() {
    return {
      firstName:'',
      lastName:'',
      email:'',
      schoolNameMincode:'',
      schoolName:'',
      edxActivationRoleIds:[],
      mincode:'',
      requiredRules: [v => !!v?.trim() || 'Required'],
      isValidForm: false,
      processing: false
    };
  },
  computed: {
    ...mapGetters('auth', ['userInfo']),
    ...mapState('app', ['mincodeSchoolNames']),

  },
  created() {
    if (this.mincode === '') {
      this.mincode = this.userInfo.activeInstituteIdentifier;
    }
    if(!this.schoolNameMincode){
      console.log('mincodeSchoolNames->',this.mincodeSchoolNames);
      this.schoolName = this.mincodeSchoolNames.get(this.mincode);
      this.schoolNameMincode = this.schoolName+' ('+this.mincode+')';
    }
  },
  methods: {
    navigateToList() {
      this.$emit('access-user:cancelMessage');
    },

    messageSent() {
      this.requiredRules = [v => !!v?.trim() || 'Required'];
      this.$emit('access-user:messageSent');
    },
    sendNewUserInvite() {
      this.processing = true;
      const payload = {
        schoolName: this.schoolName,
        firstName: this.firstName,
        lastName:this.lastName,
        email:this.email,
        mincode:this.mincode,
        edxActivationRoleIds:this.edxActivationRoleIds,
      };
      ApiService.apiAxios.post(`${ApiRoutes['edx'].NEW_SCHOOL_USER_ACTIVATION_INVITE}`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The request is being processed.');
          this.messageSent();
        })
        .catch(error => {
          this.setFailureAlert('An error occurred while sending message. Please try again later.');
          console.log(error);
        })
        .finally(() => {
          this.processing = false;
        });
    },
  }
};
</script>

<style scoped>
.addButton.v-btn--outlined {
  border: thin solid #FFFFFF;
  text-transform: none;
  font-weight: bolder;
}

</style>

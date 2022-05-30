<template>
  <v-container fluid class="full-height px-0 pt-0">
    <v-row class="d-flex justify-center">
      <v-col class="pt-0" cols="11">
        <v-row>
          <v-col class="pr-0 pb-0">
            <v-row><v-col>
              <v-card id="newMessageCard" flat outlined>
                <v-row>
                  <v-col class="pb-0">
                    <v-card-text id="newMessageCardText" class="pb-0 pt-0">
                      <v-form ref="newMessageForm" v-model="isValidForm">
                        <v-text-field
                          :value="getSchoolName()"
                          label="From"
                          class="pt-0"
                          readonly
                        ></v-text-field>
                        <v-select
                          id='schoolNameTxtField'
                          v-model="assignedMinistryTeam"
                          :items="this.ministryTeams"
                          :rules="requiredRules"
                          item-text="teamName"
                          class="pt-0"
                          item-value="ministryOwnershipTeamId"
                          label="To"
                        >
                          <template v-slot:item="{ item }">
                            <v-row>


                              <v-col cols="12" class="pr-0">
                                <div class="body-2" style="color: black;font-weight: bolder">{{ item.teamName }}</div>
                                <div class="body-2" style="color: black;" :style="{'max-width': $vuetify.breakpoint.smAndDown ? '30em' : '36em'}">{{ item.description }}</div>
                              </v-col>
                            </v-row>
                          </template>
                        </v-select>
                        <v-text-field
                          v-model="subject"
                          id='subjectTxtField'
                          label="Subject"
                          :rules="requiredRules"
                          maxlength="255"
                          class="pt-0"
                        ></v-text-field>
                        <v-textarea
                          id="newMessageTextArea"
                          v-model="newMessage"
                          :rules="requiredRules"
                          rows="8"
                          label="Message"
                          no-resize
                          maxlength="4000"
                          class="pt-0"
                          ref="newMessageTextArea">
                        </v-textarea>
                      </v-form>
                    </v-card-text>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col class="d-flex justify-end mr-3 pt-0">
                    <v-btn id="attachFileID"
                           title="Attach File"
                           color="#1A5A96"
                           outlined
                           class="addButton pl-0 pr-2"
                    >
                      <v-icon color="#1A5A96" class="mr-0" right dark>mdi-paperclip</v-icon>
                      <span class="ml-1">Attach File</span>
                    </v-btn>
                    <v-btn id="addStudentID"
                           title="Add Student"
                           color="#1A5A96"
                           outlined
                           class="addButton pl-0 pr-2"
                    >
                      <v-icon color="#1A5A96" class="mr-0" right dark>mdi-account-multiple-plus-outline</v-icon>
                      <span class="ml-1">Add Student</span>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card>
            </v-col></v-row>

          </v-col>
        </v-row>
        <v-row class="py-4 justify-end">
          <PrimaryButton id="cancelMessage" secondary text="Cancel" class="mr-2" @click.native="navigateToList"></PrimaryButton>
          <PrimaryButton id="newMessagePostBtn" text="Send" width="8rem" :disabled="!isValidForm" :loading="processing" @click.native="sendNewMessage"></PrimaryButton>
        </v-row>
      </v-col>
    </v-row>

    <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
  </v-container>
</template>

<script>
import PrimaryButton from '@/components/util/PrimaryButton';
import {mapState} from 'vuex';
import ConfirmationDialog from '@/components/util/ConfirmationDialog';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';

import {
  ApiRoutes,
} from '@/utils/constants';

export default {
  name: 'NewMessagePage',
  mixins: [alertMixin],
  components: {
    PrimaryButton,
    ConfirmationDialog,
  },
  props: {
    mincodeSchoolNames: {
      type: Map,
      required: true
    },
  },
  data() {
    return {
      newMessage: '',
      assignedMinistryTeam: null,
      subject: '',
      requiredRules: [v => !!v?.trim() || 'Required'],
      isValidForm: false,
      processing: false
    };
  },
  computed: {
    ...mapState('auth', ['userInfo']),
    ...mapState('edx', ['ministryTeams', 'exchangeMincodes'])
  },
  created() {
    this.$store.dispatch('edx/getExchangeMincodes');
    this.$store.dispatch('edx/getMinistryTeams');
  },
  methods: {
    navigateToList() {
      this.$emit('secure-exchange:cancelMessage');
    },
    getSchoolName() {
      return this.mincodeSchoolNames.get(this.userInfo.mincode) + ' (' + this.userInfo.mincode + ')';
    },
    messageSent(){
      this.subject = '';
      this.assignedMinistryTeam = null;
      this.newMessage = '';
      this.requiredRules = [v => !!v?.trim() || 'Required'];
      this.$emit('secure-exchange:messageSent');
    },
    sendNewMessage() {
      this.processing = true;
      const payload = {
        ministryOwnershipTeamID: this.assignedMinistryTeam,
        subject: this.subject,
        content: this.newMessage,
      };
      ApiService.apiAxios.post(`${ApiRoutes['edx'].EXCHANGE_URL}`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The message has been sent.');
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

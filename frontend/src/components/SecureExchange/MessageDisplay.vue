<template>
  <v-container fluid>
    <div style="width: 100%;" :overlay=false>
      <v-row class="pt-0"
             :class="{'mr-0 ml-0': $vuetify.breakpoint.smAndDown, 'mr-3 ml-3': $vuetify.breakpoint.mdAndUp}">
        <v-col cols="12 pt-0">
          <v-progress-linear
              absolute
              top
              indeterminate
              color="blue"
              :active="loading"
          ></v-progress-linear>
          <div v-if="!loading && secureExchange" :overlay=false>
            <v-row class="secureExchangeHeader">
              <v-col cols="7" md="10" class="pb-0 pt-0">
                <v-row class="mb-n4">
                  <v-col cols="12" class="pb-2 pt-2 pr-0">
                    <h3 class="subjectHeading">{{ secureExchange.subject }}</h3>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" class="pb-1 pr-0">
                    <span class="ministryOwnershipTeamName"
                          style="color: black">{{ secureExchange.ministryOwnershipTeamName }}</span>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" class="pt-0 pb-1 pr-0">
                    <span class="createDate" style="color: black">{{ secureExchange.createDate }}</span>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="5" md="2" style="text-align: end" class="pb-0 pt-0">
                <v-row class="mb-n4">
                  <v-col cols="12" class="pb-1">
                    <v-icon class="pb-1" :color="getStatusColor(secureExchange.secureExchangeStatusCode)" right dark>
                      mdi-circle-medium
                    </v-icon>
                    <span class="secureExchangeStatusCode">{{ secureExchange.secureExchangeStatusCode }}</span>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" class="pb-2">
                    <v-icon style="margin-bottom: 0.15em" color="grey darken-3" right size="medium" dark>
                      mdi-pound
                    </v-icon>
                    <span class="sequenceNumber">{{ secureExchange.sequenceNumber }}</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-divider class="divider"></v-divider>
            <v-row>
              <v-speed-dial id="editOptionsMenu" v-if="isEditable()" v-model="editOptionsOpen" top left direction="right">
                <template v-slot:activator>
                  <v-btn id="editOptionsMenuBtn" class="mx-2" fab dark large color="#003366">
                    <v-icon v-if="editOptionsOpen" dark large>mdi-close</v-icon>
                    <v-icon v-else dark large>mdi-plus</v-icon>
                  </v-btn>
                </template>
                <v-card>
                  <v-btn id="newMessageToConvBtn" dark small color="green" @click="displayMessageField">
                    <v-icon>mdi-email-outline</v-icon>
                    <span class="ml-1">Message</span>
                  </v-btn>
                  <v-btn dark small color="indigo">
                    <v-icon>mdi-paperclip</v-icon>
                    <span class="ml-1">Document</span>
                  </v-btn>
                  <v-btn dark small color="rgb(252, 186, 25)">
                    <v-icon>mdi-emoticon-happy-outline</v-icon>
                    <span class="ml-1">Student</span>
                  </v-btn>
                </v-card>
              </v-speed-dial>
              <v-col class="d-flex justify-end">
                <v-btn :disabled="!isEditable()" id="markAsButton" :loading="loadingReadStatus" class="my-4"
                       v-on:click="clickMarkAsButton">
                  <v-icon v-if="secureExchange.isReadByExchangeContact">mdi-email-outline</v-icon>
                  <v-icon v-else>mdi-email-open-outline</v-icon>
                  <span class="ml-1 markAsSpan">Mark As {{
                      secureExchange.isReadByExchangeContact ? 'Unread' : 'Read'
                    }}</span>
                </v-btn>
              </v-col>
            </v-row>
            <v-row v-if="isNewMessageDisplayed">
              <v-card-text id="newMessageCardText" class="pb-0 pt-5">
                <v-textarea id="newMessageToConvTextArea"
                            outlined
                            solo
                            label="New Message..."
                            auto-grow
                            v-model="newMessage"
                            rows="8"
                            maxlength="4000"
                            class="pt-0"
                            ref="newMessageToConvTextArea"
                >
                </v-textarea>
              </v-card-text>
              <v-row class="py-4 justify-end pt-0 pr-8">
                <PrimaryButton id="cancelMessage" secondary text="Cancel" class="mr-2" @click.native="hideNewMessageField"></PrimaryButton>
                <PrimaryButton id="newMessagePostBtn" text="Send" width="8rem" :disabled="!newMessage" :loading="processing" @click.native="sendNewExchangeComment"></PrimaryButton>
              </v-row>
            </v-row>
            <v-row>
              <v-col>
                <v-timeline v-if="secureExchange.activities.length > 0" dense>
                  <div v-for="activity in secureExchange.activities"
                       :key="activity.secureExchangeCommentID">
                    <v-timeline-item large :color="getActivityColour(activity)" :icon="getActivityIcon(activity)">
                      <v-card>
                        <v-card-title>
                          <div class="activityTitle">{{ activity.title }}</div>
                          <v-spacer></v-spacer>
                          <div class="activityDisplayDate">{{ activity.displayDate }}</div>
                        </v-card-title>
                        <v-card-text class="activityContent">{{ activity.content }}</v-card-text>
                      </v-card>
                    </v-timeline-item>
                  </div>
                </v-timeline>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {ApiRoutes} from '@/utils/constants';
import PrimaryButton from '@/components/util/PrimaryButton';
import alertMixin from '@/mixins/alertMixin';

export default {
  name: 'MessageDisplay',
  mixins: [alertMixin],
  components: {PrimaryButton},
  props: {
    secureExchangeID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      secureExchange: null,
      assignedMinistryTeam: null,
      subject: '',
      loading: true,
      editOptionsOpen: false,
      loadingReadStatus: false,
      isNewMessageDisplayed: false,
      newMessageBtnDisplayed:false,
      processing: false,
      newMessage:''
    };
  },
  computed: {},
  created() {
    this.setIsReadByExchangeContact(true);
    this.getExchange();
  },
  methods: {
    displayMessageField() {
      this.isNewMessageDisplayed = true;
    },
    hideNewMessageField(){
      this.isNewMessageDisplayed=false;
    },
    getExchange() {
      this.loading = true;
      ApiService.apiAxios.get(ApiRoutes.edx.EXCHANGE_URL + `/${this.secureExchangeID}`)
        .then(response => {
          this.secureExchange = response.data;
        })
        .catch(error => {
          console.log(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    setIsReadByExchangeContact(isRead) {
      this.loadingReadStatus = true;
      let readStatus = isRead ? 'read' : 'unread';
      ApiService.apiAxios.put(ApiRoutes.edx.EXCHANGE_URL + `/${this.secureExchangeID}/markAs/${readStatus}`)
        .then(() => {
          this.secureExchange.isReadByExchangeContact = isRead;
        })
        .catch(error => {
          console.log(error);
        }).finally(() => {
          this.loadingReadStatus = false;
        });
    },
    clickMarkAsButton() {
      this.setIsReadByExchangeContact(false);
      this.$router.push({name: 'inbox'});
    },
    isEditable() {
      return this.secureExchange.secureExchangeStatusCode !== 'Closed';
    },
    getStatusColor(status) {
      if (status === 'Open') {
        return 'green';
      } else if (status === 'Closed') {
        return 'red';
      }
    },
    getActivityColour(activity) {
      return activity.actor === 'school' ? 'rgb(252, 186, 25)' : 'rgb(0, 51, 102)';
    },
    getActivityIcon(activity) {
      switch (activity.type) {
      case 'message':
        return 'mdi-email-outline';
      case 'document':
        return 'md-paperclip';
      case 'student':
        return 'mdi-emoticon-happy-outline';
      default:
        return '';
      }
    },
    messageSent(){
      this.subject = '';
      this.assignedMinistryTeam = null;
      this.newMessage = '';
    },
    sendNewExchangeComment() {
      this.processing = true;
      const payload = {
        content: this.newMessage,
      };
      ApiService.apiAxios.post(ApiRoutes.edx.EXCHANGE_URL + `/${this.secureExchangeID}/comments`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The message has been sent.');
          this.messageSent();
          this.getExchange();
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert('An error occurred while sending message. Please try again later.');

        })
        .finally(() => {
          this.processing = false;
          this.isNewMessageDisplayed=false;

        });
    },
  }
};
</script>

<style scoped>
.subjectHeading {
  overflow-wrap: break-word;
}

@media screen and (max-width: 801px) {
  .subjectHeading {
    font-size: medium;
  }
}

.divider {
  border-color: #FCBA19;
  border-width: medium;
}
</style>

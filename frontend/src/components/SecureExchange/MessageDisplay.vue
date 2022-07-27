<template>
  <v-container class="containerSetup" fluid>
    <v-row v-if="loading">
      <v-col class="d-flex justify-center">
        <v-progress-circular
          class="mt-16"
          :size="70"
          :width="7"
          color="primary"
          indeterminate
          :active="loading"
        ></v-progress-circular>
      </v-col>
    </v-row>
    <div style="width: 100%;">
      <v-row class="pt-0"
             :class="{'mr-0 ml-0': $vuetify.breakpoint.smAndDown, 'mr-3 ml-3': $vuetify.breakpoint.mdAndUp}">
        <v-col cols="12 pt-0">
          <div v-if="!loading && secureExchange">
            <v-row>
              <v-col class="pb-0 pt-0 d-flex justify-start">
                <v-row>
                  <v-col cols="12" class="pb-2 pt-2 pr-0" style="text-align: left">
                    <h2 id="messageDisplaySubjectHeading" class="subjectHeading">{{ secureExchange.subject }}</h2>
                    <div id="messageDisplayMinistryOwnershipTeamName" class="ministryOwnershipTeamName">{{ secureExchange.ministryOwnershipTeamName }}</div>
                    <div id="messageDisplayCreateDate" class="createDate" style="color: black">{{ secureExchange.createDate }}</div>
                  </v-col>
                </v-row>
              </v-col>
              <v-col class="pb-0 pt-0 d-flex justify-end">
                <v-row>
                  <v-col class="d-flex justify-end">
                    <v-card outlined color="transparent" class="mr-5">
                      <v-row>
                        <v-col>
                          <v-icon class="ml-n1" :color="getStatusColor(secureExchange.secureExchangeStatusCode)" dark>
                            mdi-circle-medium
                          </v-icon>
                          <span id="messageDisplayStatusCode" class="ml-n1">{{ secureExchange.secureExchangeStatusCode }}</span>
                        </v-col>
                      </v-row>
                      <v-row no-gutters>
                        <v-col>
                          <v-icon color="grey darken-3" size="medium" dark>
                            mdi-pound
                          </v-icon>
                          <span id="messageDisplaySequenceNumber">{{ secureExchange.sequenceNumber }}</span>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-divider class="divider"></v-divider>
            <v-row>
              <v-speed-dial id="editOptionsMenu" v-if="isEditable() && shouldDisplaySpeedDial" v-model="editOptionsOpen" top left direction="right">
                <template v-slot:activator>
                  <v-btn id="editOptionsMenuBtn" class="ml-4" fab dark color="#003366">
                    <v-icon v-if="editOptionsOpen" dark large>mdi-close</v-icon>
                    <v-icon v-else dark large>mdi-plus</v-icon>
                  </v-btn>
                </template>
                <v-card>
                  <v-btn id="newMessageToConvBtn" small @click="displayMessageField">
                    <v-icon color="#003366">mdi-email-outline</v-icon>
                    <span style="color: #003366" class="ml-1">Message</span>
                  </v-btn>
                  <v-btn id="addAttachmentConvButton" small @click="displayAttachmentPanel">
                    <v-icon color="#003366">mdi-paperclip</v-icon>
                    <span style="color: #003366" class="ml-1">Attachment</span>
                  </v-btn>
                  <v-btn id="addStudentConvButton" small>
                    <v-icon color="#003366">mdi-emoticon-happy-outline</v-icon>
                    <span style="color: #003366" class="ml-1">Student</span>
                  </v-btn>
                </v-card>
              </v-speed-dial>
              <v-col class="d-flex justify-end">
                <v-btn :disabled="!isEditable()"   id="markAsButton" class="my-4" v-on:click="clickMarkAsButton" :loading="loadingReadStatus">
                  <v-icon v-if="secureExchange.isReadByExchangeContact">mdi-email-outline</v-icon>
                  <v-icon v-else>mdi-email-open-outline</v-icon>
                  <span class="ml-1 markAsSpan">{{`MARK AS ${secureExchange.isReadByExchangeContact ? 'UNREAD' : 'READ'}` }}</span>
                </v-btn>
              </v-col>
            </v-row>
            <v-row v-if="isNewMessageDisplayed">
              <v-card-text id="newMessageCardText" class="pb-0 pt-5 pl-16 ml-10 pr-16 mr-10">
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
              <v-row class="py-4 justify-end pt-0 pr-16 mr-10">
                <PrimaryButton id="cancelMessage" secondary text="Cancel" class="mr-2" @click.native="hideNewMessageField"></PrimaryButton>
                <PrimaryButton id="newMessagePostBtn" text="Send" width="8rem" :disabled="!newMessage" :loading="processing" @click.native="sendNewExchangeComment"></PrimaryButton>
              </v-row>
            </v-row>
            <v-row v-if="isNewAttachmentDisplayed">
              <v-col class="d-flex justify-center">
                <DocumentUpload
                  style="min-width: 40em"
                  :small-file-extension="false"
                  :check-file-rules="true"
                  @close:form="hideAttachmentPanel"
                  @upload="upload">
                </DocumentUpload>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-timeline v-if="secureExchange.activities.length > 0">
                  <div v-for="activity in secureExchange.activities"
                       :key="activity.secureExchangeCommentID">
                    <v-timeline-item :left="!activity.isSchool" icon-color="#003366" large color="white" :icon="getActivityIcon(activity)">
                      <v-card v-if="activity.type === 'message'">
                        <v-card-title>
                          <div class="activityTitle">{{ activity.title }}</div>
                          <v-spacer></v-spacer>
                          <div class="activityDisplayDate">{{ activity.displayDate }}</div>
                        </v-card-title>
                        <v-card-text class="activityContent">{{ activity.content }}</v-card-text>
                      </v-card>
                      <v-card v-if="activity.type === 'document'">
                        <v-card-title>
                          <div class="activityTitle">{{ activity.title }}</div>
                          <v-spacer></v-spacer>
                          <div class="activityDisplayDate">{{ activity.displayDate }}</div>
                        </v-card-title>
                        <v-row no-gutters>
                          <v-card-text class="mt-n2 pt-0 pb-0" :class="{'pb-0': activity.documentType.label !== 'Other', 'pb-3': activity.documentType.label === 'Other'}">
                            <router-link :to="{ path: documentUrl(activity) }" target="_blank">{{ activity.fileName }}</router-link>
                          </v-card-text>
                          <v-card-text v-if="activity.documentType.label !== 'Other'" class="pt-0 pb-3">{{ activity.documentType.label }}</v-card-text>
                        </v-row>
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
import PrimaryButton from '../util/PrimaryButton';
import {ChronoUnit, DateTimeFormatter, LocalDate} from '@js-joda/core';
import alertMixin from '@/mixins/alertMixin';
import DocumentUpload from '@/components/common/DocumentUpload';


export default {
  name: 'MessageDisplay',
  mixins: [alertMixin],
  components: {DocumentUpload, PrimaryButton},
  props: {
    secureExchangeID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      secureExchange: null,
      loading: true,
      loadingReadStatus: false,
      editOptionsOpen: false,
      assignedMinistryTeam: null,
      subject: '',
      isNewMessageDisplayed: false,
      isNewAttachmentDisplayed: false,
      newMessageBtnDisplayed:false,
      shouldDisplaySpeedDial: true,
      processing: false,
      newMessage:''
    };
  },
  computed: {},
  created() {
    this.getExchange();
    this.setIsReadByExchangeContact(true);
  },
  methods: {
    async upload(document) {
      try {
        this.items = undefined;
        this.loading = true;
        await ApiService.apiAxios.post(ApiRoutes.edx.EXCHANGE_URL + '/' + this.secureExchangeID + '/documents', document);
        this.setSuccessAlert('Your document was uploaded successfully.');
        this.getExchange();
      } catch (e) {
        console.error(e);
        this.setFailureAlert(e.response?.data?.message || e.message);
      } finally {
        this.dialog = false;
        this.loading = false;
      }
    },
    documentUrl(document) {
      return `${ApiRoutes.edx.EXCHANGE_URL}/${this.secureExchangeID}/documents/${document.documentID}/download/${document.fileName}`;
    },
    displayMessageField() {
      this.isNewAttachmentDisplayed = false;
      this.isNewMessageDisplayed = true;
      this.shouldDisplaySpeedDial = false;
      this.editOptionsOpen = false;
    },
    hideNewMessageField(){
      this.isNewMessageDisplayed = false;
      this.shouldDisplaySpeedDial = true;
      this.resetNewMessageForm();
    },
    displayAttachmentPanel() {
      this.isNewMessageDisplayed = false;
      this.isNewAttachmentDisplayed = true;
      this.shouldDisplaySpeedDial = false;
      this.editOptionsOpen = false;
    },
    hideAttachmentPanel(){
      this.isNewAttachmentDisplayed = false;
      this.shouldDisplaySpeedDial = true;
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
    getActivityIcon(activity) {
      switch (activity.type) {
      case 'message':
        return 'mdi-email-outline';
      case 'document':
        return 'mdi-paperclip';
      case 'student':
        return 'mdi-emoticon-happy-outline';
      default:
        return '';
      }
    },
    getNumberOfDays(start) {
      const start_date = new LocalDate.parse(start, DateTimeFormatter.ofPattern('uuuu/MM/dd'));
      const end_date = LocalDate.now();

      return ChronoUnit.DAYS.between(start_date, end_date) + ' days';
    },
    resetNewMessageForm() {
      this.isNewMessageDisplayed = false;
      this.shouldDisplaySpeedDial = true;
      this.newMessage = '';
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
          this.isNewMessageDisplayed = false;
          this.resetNewMessageForm();
        });
    },
  }
};
</script>

<style scoped>
.subjectHeading {
  overflow-wrap: break-word;
}

.activityDisplayDate{
  font-size: medium;
}

.containerSetup{
  padding-right: 32em !important;
  padding-left: 32em !important;
}

@media screen and (max-width: 1900px) {
  .containerSetup{
    padding-right: 20em !important;
    padding-left: 20em !important;
  }
}

@media screen and (max-width: 1200px) {
  .containerSetup{
    padding-right: 4em !important;
    padding-left: 4em !important;
  }
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

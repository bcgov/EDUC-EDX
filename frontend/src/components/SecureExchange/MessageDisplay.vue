<template>
  <v-container
    class="containerSetup"
    fluid
  >
    <v-row v-if="loading">
      <v-col class="d-flex justify-center">
        <v-progress-circular
          class="mt-16"
          :size="70"
          :width="7"
          color="primary"
          indeterminate
          :active="loading"
        />
      </v-col>
    </v-row>
    <div style="width: 100%;">
      <v-row
        class="pt-7"
        :class="{'mr-0 ml-0': $vuetify.display.smAndDown, 'mr-3 ml-3': $vuetify.display.mdAndUp}"
      >
        <v-col cols="12 pt-0">
          <ImageRenderer
            :dialog="imageRendererDialog"
            :request-id="secureExchangeID"
            :image-id="imageId"
            @close-dialog="closeDialog"
          />
          <div v-if="!loading && secureExchange">
            <v-row>
              <v-col class="pb-0 pt-0 d-flex justify-start">
                <v-row>
                  <v-col
                    cols="12"
                    class="pb-0 pt-2 pr-0"
                    style="text-align: left"
                  >
                    <h2
                      id="messageDisplaySubjectHeading"
                      class="subjectHeading"
                    >
                      {{ secureExchange.subject }}
                    </h2>
                    <div
                      id="messageDisplayMinistryOwnershipTeamName"
                      class="ministryOwnershipTeamName"
                    >
                      {{ secureExchange.ministryOwnershipTeamName }}
                    </div>
                    <div
                      id="messageDisplayCreateDate"
                      class="createDate"
                      style="color: black"
                    >
                      {{ secureExchange.createDate }}
                    </div>
                  </v-col>
                </v-row>
              </v-col>
              <v-col class="pb-0 pt-0 d-flex justify-end">
                <v-row>
                  <v-col class="pb-0 d-flex justify-end">
                    <v-card
                      variant="outlined"
                      color="transparent"
                      class="mr-5"
                    >
                      <v-row no-gutters>
                        <v-col class="pb-0">
                          <v-icon
                            class="ml-n1"
                            :color="getStatusColor(secureExchange.secureExchangeStatusCode)"
                            dark
                          >
                            mdi-circle-medium
                          </v-icon>
                          <span
                            id="messageDisplayStatusCode"
                            style="color: black"
                            class="ml-n1"
                          >{{ secureExchange.secureExchangeStatusCode }}</span>
                        </v-col>
                      </v-row>
                      <v-row no-gutters>
                        <v-col>
                          <v-icon
                            color="black"
                            size="medium"
                            dark
                          >
                            mdi-pound
                          </v-icon>
                          <span
                            id="messageDisplaySequenceNumber"
                            style="color: black"
                          >{{ secureExchange.sequenceNumber }}</span>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col class="d-flex justify-end">
                <v-btn
                  id="markAsButton"
                  :disabled="!isEditable()"
                  class="my-4"
                  variant="outlined"
                  color="#003366"
                  :loading="loadingReadStatus"
                  @click="clickMarkAsButton"
                >
                  <v-icon v-if="secureExchange.isReadByExchangeContact">
                    mdi-email-outline
                  </v-icon>
                  <v-icon v-else>
                    mdi-email-open-outline
                  </v-icon>
                  <span class="ml-1 markAsSpan">{{ `Mark as ${secureExchange.isReadByExchangeContact ? 'unread' : 'read'}` }}</span>
                </v-btn>
              </v-col>
            </v-row>
            <v-divider class="divider" />
            <v-row class="pt-3">
              <v-col>
                <v-menu
                  v-if="shouldDisplaySpeedDial && isEditable()"
                  v-model="editOptionsOpen"
                  transition="fab-transition"
                  location="end"
                  offset="10"
                >
                  <template #activator="{ props }">
                    <v-btn
                      id="editOptionsMenu"
                      dark
                      color="primary"
                      class="ml-6"
                      :icon="editOptionsOpen ? 'mdi-close' : 'mdi-plus'"
                      v-bind="props"
                    />
                  </template>
                  <v-list>
                    <v-list-item
                      id="newMessageToConvBtn"
                      @click="displayMessageField"
                    >
                      <v-icon
                        color="#003366"
                        class="pr-1"
                      >
                        mdi-email-outline
                      </v-icon>
                      <span>Message</span>
                    </v-list-item>
                    <v-list-item
                      id="addAttachmentConvButton"
                      @click="displayAttachmentPanel"
                    >
                      <v-icon
                        color="#003366"
                        class="pr-1"
                      >
                        mdi-paperclip
                      </v-icon>
                      <span>Attachment</span>
                    </v-list-item>
                    <v-list-item
                      id="addStudentConvButton"
                      @click="displayStudentPanel"
                    >
                      <v-icon
                        color="#003366"
                        class="pr-1"
                      >
                        mdi-emoticon-happy-outline
                      </v-icon>
                      <span>Student</span>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-col>
            </v-row>
            <v-expand-transition>
              <v-row
                v-if="isNewMessageDisplayed"
                class="justify-center"
              >
                <v-card
                  class="new-message-card"
                  style="min-width: 50em"
                >
                  <v-card-text
                    id="newMessageCardText"
                  >
                    <v-textarea
                      id="newMessageToConvTextArea"
                      ref="newMessageToConvTextArea"
                      v-model="newMessage"
                      variant="solo"
                      placeholder="New Message..."
                      auto-grow
                      rows="8"
                      maxlength="4000"
                      class="pt-0"
                    />
                  </v-card-text>
                  <v-card-actions>
                    <VSpacer />
                    <PrimaryButton
                      id="cancelMessage"
                      secondary
                      text="Cancel"
                      :click-action="hideNewMessageField"
                    />
                    <PrimaryButton
                      id="newMessagePostBtn"
                      text="Send"
                      :disabled="!newMessage"
                      :loading="loading"
                      width="7rem"
                      :click-action="sendNewExchangeComment"
                    />
                  </v-card-actions>
                </v-card>
              </v-row>
              <v-row v-if="isNewAttachmentDisplayed">
                <v-col class="d-flex justify-center">
                  <DocumentUpload
                    style="min-width: 40em"
                    :small-file-extension="false"
                    :check-file-rules="true"
                    :allowed-file-format="formatMessage"
                    @close:form="hideAttachmentPanel"
                    @upload="upload"
                  />
                </v-col>
              </v-row>
              <v-row
                v-if="isNewStudentDisplayed"
                id="addStudentDialog"
              >
                <v-col class="d-flex justify-center">
                  <AddStudent
                    :additional-student-add-warning="addStudentWarningMessage"
                    @add-student="sendNewSecureExchangeStudent"
                    @close:form="hideStudentPanel"
                    @update-additional-student-add-warning="updateAddStudentWarningMessage"
                  />
                </v-col>
              </v-row>
            </v-expand-transition>
            <v-row>
              <v-col>
                <v-timeline
                  v-if="secureExchange.activities.length > 0"
                  side="end"
                  truncate-line="both"
                  class="mr-8"
                >
                  <v-timeline-item
                    v-for="(activity,index) in secureExchange.activities"
                    :key="activity.secureExchangeCommentID"
                    dot-color="white"
                    fill-dot
                    elevation="1"
                    icon-color="#003366"
                    :icon="getActivityIcon(activity)"
                    size="large"
                    width="100%"
                  >
                    <v-card v-if="activity.type === 'message'">
                      <v-card-text class="activityTitle pb-0">
                        <v-row>
                          <v-col>
                            <span>{{ activity.actor }}</span>
                          </v-col>
                        </v-row>
                      </v-card-text>
                      <v-card-subtitle>
                        <span class="activityDisplayDate">{{ activity.displayDate }}</span>
                      </v-card-subtitle>
                      <v-card-text class="activityContent">
                        {{ activity.content }}
                      </v-card-text>
                    </v-card>
                    <v-card v-if="activity.type === 'document'">
                      <v-card-text class="activityTitle pb-0">
                        <v-row>
                          <v-col>
                            <span>{{ activity.title }}</span>
                          </v-col>
                        </v-row>
                      </v-card-text>
                      <v-card-subtitle>
                        <span class="activityDisplayDate">{{ activity.displayDate }}</span>
                      </v-card-subtitle>
                      <v-card-text
                        class="pb-2"
                        :class="{'pb-0': activity.documentType.label !== 'Other', 'pb-3': activity.documentType.label === 'Other'}"
                      >
                        <a
                          v-if="isImage(activity) && isEditable()"
                          @click="showDocModal(activity)"
                        >
                          {{ activity.fileName }}
                        </a>
                        <router-link
                          v-else-if="isEditable()"
                          :to="{ path: documentUrl(activity) }"
                          target="_blank"
                        >
                          {{ activity.fileName }}
                        </router-link>
                        
                        <span
                          v-else
                          style="color: grey"
                        >
                          {{ activity.fileName }}
                        </span>
                        <div
                          v-if="activity.documentType.label !== 'Other'"
                        >
                          {{ activity.documentType.label }}
                        </div>
                      </v-card-text>
                      <v-card-actions v-show="isOpenDocIndex !== index">
                        <v-btn
                          variant="text"
                          color="red"
                          text="Remove"
                          :disabled="!isEditable()"
                          @click="toggleRemoveDoc(index)"
                        />
                      </v-card-actions>
                      <v-expand-transition>
                        <div
                          v-show="isOpenDocIndex === index"
                          class="greyBackground"
                        >
                          <v-divider />

                          <v-card-text style="background-color: #e7ebf0;">
                            <v-row no-gutters>
                              <v-col class="d-flex justify-start">
                                <span style="font-size: medium; font-weight: bold; color: black">Removing the attachment will remove it for all users.</span>
                              </v-col>
                            </v-row>
                            <v-row no-gutters>
                              <v-col class="pt-3 d-flex justify-start">
                                <span style="font-size: medium; font-weight: bold; color: black">Are you sure you want to remove the attachment?</span>
                              </v-col>
                            </v-row>
                            <v-row no-gutters>
                              <v-col class="mt-3 d-flex justify-end">
                                <v-btn
                                  class="mr-2"
                                  outlined
                                  @click="closeDocIndex()"
                                >
                                  No
                                </v-btn>
                                <v-btn
                                  color="primary"
                                  @click="removeAttachment(activity.documentID)"
                                >
                                  Yes
                                </v-btn>
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </div>
                      </v-expand-transition>
                    </v-card>
                    <v-card v-if="activity.type === 'student'">
                      <v-card-text class="activityTitle pb-0">
                        <v-row>
                          <v-col>
                            <span>{{ activity.title }}</span>
                          </v-col>
                        </v-row>
                      </v-card-text>
                      <v-card-subtitle>
                        <span class="activityDisplayDate">{{ activity.displayDate }}</span>
                      </v-card-subtitle>
                      <v-card-text class="pb-2">
                        <v-row
                          v-if="activity.studentPEN"
                          dense
                        >
                          <v-col cols="2">
                            <span class="activityTitle">PEN:</span>
                          </v-col>
                          <v-col cols="10">
                            <span>{{ activity.studentPEN }}</span>
                          </v-col>
                        </v-row>
                        <v-row
                          v-if="activity.studentLocalID"
                          dense
                        >
                          <v-col
                            cols="2"
                          >
                            <span>Local ID: </span>
                          </v-col>
                          <v-col
                            cols="10"
                          >
                            <span>{{ activity.studentLocalID }}</span>
                          </v-col>
                        </v-row>
                        <v-row
                          v-if="activity.studentSurname"
                          dense
                        >
                          <v-col
                            cols="2"
                          >
                            <span>Surname: </span>
                          </v-col>
                          <v-col
                            cols="10"
                          >
                            <span>{{ activity.studentSurname }}</span>
                          </v-col>
                        </v-row>
                        <v-row
                          v-if="activity.studentGiven"
                          dense
                        >
                          <v-col
                            cols="2"
                          >
                            <span>Given Name: </span>
                          </v-col>
                          <v-col
                            cols="10"
                          >
                            <span>{{ activity.studentGiven }}</span>
                          </v-col>
                        </v-row>
                        <v-row
                          v-if="activity.studentMiddle"
                          dense
                        >
                          <v-col
                            cols="2"
                          >
                            <span>Middle Name: </span>
                          </v-col>
                          <v-col
                            cols="10"
                          >
                            <span>{{ activity.studentMiddle }}</span>
                          </v-col>
                        </v-row>
                        <v-row
                          v-if="activity.studentDOB"
                          dense
                        >
                          <v-col
                            cols="2"
                          >
                            <span>Birth Date: </span>
                          </v-col>
                          <v-col
                            cols="10"
                          >
                            <span>{{ activity.studentDOB }}</span>
                          </v-col>
                        </v-row>
                        <v-row
                          v-if="activity.studentGender"
                          dense
                        >
                          <v-col
                            cols="2"
                          >
                            <span>Gender: </span>
                          </v-col>
                          <v-col
                            cols="10"
                          >
                            <span>{{ activity.studentGender }}</span>
                          </v-col>
                        </v-row>
                      </v-card-text>
                      <v-card-actions v-show="isOpenStudentIndex !== index">
                        <v-btn
                          :disabled="!isEditable()"
                          variant="text"
                          color="red"
                          text="Remove"
                          @click="toggleRemoveStudent(index)"
                        />
                      </v-card-actions>
                      <v-expand-transition>
                        <div
                          v-show="isOpenStudentIndex === index"
                          class="greyBackground"
                        >
                          <v-divider />
                          <v-card-text style="background-color: #e7ebf0;">
                            <v-row no-gutters>
                              <v-col class="d-flex justify-start">
                                <span style="font-size: medium; font-weight: bold; color: black">Removing the student will remove it for all users.</span>
                              </v-col>
                            </v-row>
                            <v-row no-gutters>
                              <v-col class="pt-3 d-flex justify-start">
                                <span style="font-size: medium; font-weight: bold; color: black">Are you sure you want to remove the student?</span>
                              </v-col>
                            </v-row>
                            <v-row no-gutters>
                              <v-col class="mt-3 d-flex justify-end">
                                <v-btn
                                  class="mr-2"
                                  outlined
                                  @click="closeStudentIndex()"
                                >
                                  No
                                </v-btn>
                                <v-btn
                                  color="primary"
                                  @click="removeStudent(activity.secureExchangeStudentId)"
                                >
                                  Yes
                                </v-btn>
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </div>
                      </v-expand-transition>
                    </v-card>
                  </v-timeline-item>
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
import {ApiRoutes} from '../../utils/constants';
import PrimaryButton from '../util/PrimaryButton.vue';
import {ChronoUnit, DateTimeFormatter, LocalDate} from '@js-joda/core';
import alertMixin from '../../mixins/alertMixin';
import DocumentUpload from '../common/DocumentUpload.vue';
import AddStudent from '../AddStudent.vue';
import ImageRenderer from '../common/ImageRenderer.vue';
import { authStore } from '../../store/modules/auth';
import { mapState } from 'pinia';
import {getFileExtensionWithDot} from '../../utils/file';


export default {
  name: 'MessageDisplay',
  components: { DocumentUpload, AddStudent, PrimaryButton, ImageRenderer },
  mixins: [alertMixin],
  props: {
    secureExchangeID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loadingCount: 0,
      secureExchange: null,
      loadingReadStatus: false,
      editOptionsOpen: false,
      assignedMinistryTeam: null,
      subject: '',
      isNewMessageDisplayed: false,
      isNewAttachmentDisplayed: false,
      isNewStudentDisplayed: false,
      newMessageBtnDisplayed: false,
      shouldDisplaySpeedDial: true,
      newMessage:'',
      isOpenDocIndex: false,
      isOpenStudentIndex: false,
      show: false,
      isHideIndex: false,
      imageRendererDialog: false,
      documentId: '',
      imageId: '',
      addStudentWarningMessage: '',
      disableAnchorTagDocumentName: true,
      formatMessage: 'JPEG, PNG, PDF, CSV, MS-WORD, MS-EXCEL, .STD, .VER'
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    loading() {
      return this.loadingCount !== 0;
    }
  },
  created() {
    this.getExchange().then(() => {
      this.setIsReadByExchangeContact(true);
    });
  },
  methods: {
    async upload(document) {
      try {
        this.loadingCount += 1;
        this.items = undefined;
        await ApiService.apiAxios.post(ApiRoutes.edx.EXCHANGE_URL + '/' + this.secureExchangeID + '/documents', document);
        this.setSuccessAlert('Your document was uploaded successfully.');
        this.getExchange();
      } catch (e) {
        console.error(e);
        this.setFailureAlert(e.response?.data?.message || e.message);
      } finally {
        this.loadingCount -= 1;
        this.dialog = false;
      }
    },
    showDocModal(document){
      this.imageId = document.documentID;
      this.imageRendererDialog = true;
    },
    isPdf(document){
      return (
        'fileName' in document &&
          typeof document.fileName === 'string' &&
          document.fileName.toLowerCase().endsWith('.pdf')
      );
    },
    isImage(document) {
      let imageTypes = ['.jpg','.jpeg','.jpe','.jfif','.jif','.jfi', '.png'];
      return (
        'fileName' in document &&
        typeof document.fileName === 'string' &&
        imageTypes.includes(getFileExtensionWithDot(document.fileName.toLowerCase()))
      );
    },
    async closeDialog() {
      this.documentId = '';
      this.imageId = '';
      this.imageRendererDialog = false;
      await this.$nextTick(); //need to wait so update can be made in parent and propagated back down to child component
    },
    documentUrl(document) {
      return `${ApiRoutes.edx.EXCHANGE_URL}/${this.secureExchangeID}/documents/${document.documentID}/download/${document.fileName}`;
    },
    displayMessageField() {
      this.isNewAttachmentDisplayed = false;
      this.isNewMessageDisplayed = true;
      this.isNewStudentDisplayed = false;
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
      this.isNewStudentDisplayed = false;
      this.shouldDisplaySpeedDial = false;
      this.editOptionsOpen = false;
    },
    hideAttachmentPanel(){
      this.isNewAttachmentDisplayed = false;
      this.shouldDisplaySpeedDial = true;
    },
    displayStudentPanel() {
      this.isNewMessageDisplayed = false;
      this.isNewAttachmentDisplayed = false;
      this.isNewStudentDisplayed = true;
      this.shouldDisplaySpeedDial = false;
      this.editOptionsOpen = false;
      if (this.secureExchange.studentsList?.length > 0) {
        this.updateAddStudentWarningMessage('Additional students should only be added if the details are relevant to this request. Requests for separate students should be sent in a new message.');
      }
    },
    hideStudentPanel() {
      this.isNewStudentDisplayed = false;
      this.shouldDisplaySpeedDial = true;
    },
    updateAddStudentWarningMessage(newValue) {
      this.addStudentWarningMessage = newValue;
    },
    getExchange() {
      this.loadingCount += 1;
      return ApiService.apiAxios.get(ApiRoutes.edx.EXCHANGE_URL + `/${this.secureExchangeID}`)
        .then(response => {
          this.secureExchange = response.data;
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while getting the details of the message. Please try again later.');
        })
        .finally(() => {
          this.loadingCount -= 1;
          if (this.isEditable()) {
            this.disableAnchorTagDocumentName = false;
          }
        });
    },
    setIsReadByExchangeContact(isRead) {
      this.loadingReadStatus = true;
      let readStatus = isRead ? 'read' : 'unread';
      ApiService.apiAxios.put(`${ApiRoutes.edx.EXCHANGE_URL}/${this.secureExchangeID}/markAs/${readStatus}`)
        .then(() => {
          this.secureExchange.isReadByExchangeContact = isRead;
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to set the read state of the Secure Exchange. Please try again later.');
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
        if(activity.isSchool === true){
          return 'mdi-email-outline';
        }else{
          return 'mdi-email';
        }
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
      this.loadingCount += 1;
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
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while sending message. Please try again later.');
        })
        .finally(() => {
          this.loadingCount -= 1;
          this.isNewMessageDisplayed = false;
          this.resetNewMessageForm();
        });
    },
    closeAllIndexes(){
      this.closeDocIndex();
      this.closeStudentIndex();
    },
    toggleRemoveDoc(index) {
      this.closeAllIndexes();
      this.isHideIndex = index;
      if( this.isOpenDocIndex !== null ){
        this.isOpenDocIndex = ( this.isOpenDocIndex === index ) ? null : index;
      } else {
        this.isOpenDocIndex = index;
      }
    },
    closeDocIndex() {
      this.isOpenDocIndex = false;
      this.isHideIndex = false;
    },
    toggleRemoveStudent(index) {
      this.closeAllIndexes();
      this.isHideIndex = index;
      if( this.isOpenStudentIndex !== null ){
        this.isOpenStudentIndex = ( this.isOpenStudentIndex === index ) ? null : index;
      } else {
        this.isOpenStudentIndex = index;
      }
    },
    closeStudentIndex() {
      this.isOpenStudentIndex = false;
      this.isHideIndex = false;
    },
    removeAttachment(documentID) {
      this.loadingCount += 1;
      ApiService.apiAxios.delete(ApiRoutes.edx.EXCHANGE_URL + `/${this.secureExchangeID}/documents/${documentID}`)
        .then((response) => {
          this.getExchange();
          if(response.status === 200){
            this.setSuccessAlert('Success! The document has been removed.');
          } else{
            this.setFailureAlert('Error! The document was not removed.');
          }
          this.closeDocIndex();
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while removing the attachment from the Secure Exchange. Please try again later.');
        })
        .finally(() => {
          this.loadingCount -= 1;
        });
    },
    removeStudent(studentID) {
      this.loadingCount += 1;
      ApiService.apiAxios.delete(ApiRoutes.edx.EXCHANGE_URL + `/${this.secureExchangeID}/removeStudent/${studentID}`)
        .then((response) => {
          this.getExchange();
          if(response.status === 200){
            this.setSuccessAlert('Success! The student has been removed.');
          } else{
            this.setFailureAlert('Error! The student was not removed.');
          }
          this.closeStudentIndex();
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while removing the student from the Secure Exchange. Please try again later.');
        })
        .finally(() => {
          this.loadingCount -= 1;
        });
    },
    backButtonClick() {
      this.$router.push({name: 'inbox'});
    },
    sendNewSecureExchangeStudent(student) {
      this.loadingCount += 1;
      const payload = {
        studentID: student.studentID
      };
      ApiService.apiAxios.post(`${ApiRoutes.edx.EXCHANGE_URL}/${this.secureExchangeID}/students`, payload)
        .then(() => {
          this.setSuccessAlert('Success! The student has been added to the Secure Exchange.');
          this.getExchange();
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while adding the student to the Secure Exchange. Please try again later.');
        })
        .finally(() => {
          this.loadingCount -= 1;
          this.isNewStudentDisplayed = false;
        });
    }
  }
};
</script>

<style scoped>
.subjectHeading {
  overflow-wrap: break-word;
}

.activityHeader {
  text-align: right;
  word-break: break-word;
  width: max-content;
  max-width: 20rem;
}

.activityTitle {
  font-size: medium;
}

.activityContent {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 100%;
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

.activityDisplayDate {
  font-style: italic;
}

.divider {
  border-color: #FCBA19;
  border-width: unset;
  opacity: unset;
}
.plainBtn {
  background-color: white !important;
  height: 2em !important;
  min-width: 1em !important;
  bottom: 0;
  right: 0;
}
.greyBackground {
  background-color: #f5f5f5;
}

.v-timeline--vertical.v-timeline--justify-auto {
  grid-template-columns: minmax(min-content, 0em) min-content auto;
}

.new-message-card{
  padding: 1.1rem;
  max-width: 50rem;
  min-width: 10rem;
}

</style>

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
          <PdfRenderer
            :dialog="pdfRenderDialog"
            :request-id="secureExchangeID"
            :document-id="documentId"
            @close-dialog="closeDialog"
          />
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
                            color="grey darken-3"
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
              <v-col class="mt-7 d-flex justify-start">
                <v-icon
                  small
                  color="#1976d2"
                >
                  mdi-arrow-left
                </v-icon>
                <a
                  class="ml-1"
                  @click="backButtonClick"
                >Return to Inbox</a>
              </v-col>
              <v-col class="d-flex justify-end">
                <v-btn
                  id="markAsButton"
                  :disabled="!isEditable()"
                  class="my-4"
                  :loading="loadingReadStatus"
                  @click="clickMarkAsButton"
                >
                  <v-icon v-if="secureExchange.isReadByExchangeContact">
                    mdi-email-outline
                  </v-icon>
                  <v-icon v-else>
                    mdi-email-open-outline
                  </v-icon>
                  <span class="ml-1 markAsSpan">{{ `MARK AS ${secureExchange.isReadByExchangeContact ? 'UNREAD' : 'READ'}` }}</span>
                </v-btn>
              </v-col>
            </v-row>
            <v-divider class="divider" />
            <v-row>
              <v-col class="mt-2">
                <v-btn
                  id="newMessageToConvBtn"
                  small
                  @click="displayMessageField"
                >
                  <v-icon color="#003366">
                    mdi-email-outline
                  </v-icon>
                  <span
                    style="color: #003366"
                    class="ml-1"
                  >Message</span>
                </v-btn>
                <v-btn
                  id="addAttachmentConvButton"
                  small
                  @click="displayAttachmentPanel"
                >
                  <v-icon color="#003366">
                    mdi-paperclip
                  </v-icon>
                  <span
                    style="color: #003366"
                    class="ml-1"
                  >Attachment</span>
                </v-btn>
                <v-btn
                  id="addStudentConvButton"
                  small
                  @click="displayStudentPanel"
                >
                  <v-icon color="#003366">
                    mdi-emoticon-happy-outline
                  </v-icon>
                  <span
                    style="color: #003366"
                    class="ml-1"
                  >Student</span>
                </v-btn>
              </v-col>
            </v-row>
            <v-row v-if="isNewMessageDisplayed">
              <v-card-text
                id="newMessageCardText"
                class="pb-0 pt-5 pl-16 ml-10 pr-16 mr-10"
              >
                <v-textarea
                  id="newMessageToConvTextArea"
                  ref="newMessageToConvTextArea"
                  v-model="newMessage"
                  outlined
                  solo
                  label="New Message..."
                  auto-grow
                  rows="8"
                  maxlength="4000"
                  class="pt-0"
                />
              </v-card-text>
              <v-row class="py-4 justify-end pt-0 pr-16 mr-10">
                <PrimaryButton
                  id="cancelMessage"
                  secondary
                  text="Cancel"
                  class="mr-2"
                  :click-action="hideNewMessageField"
                />
                <PrimaryButton
                  id="newMessagePostBtn"
                  text="Send"
                  width="8rem"
                  :disabled="!newMessage"
                  :loading="loading"
                  :click-action="sendNewExchangeComment"
                />
              </v-row>
            </v-row>
            <v-row v-if="isNewAttachmentDisplayed">
              <v-col class="d-flex justify-center">
                <DocumentUpload
                  style="min-width: 40em"
                  :small-file-extension="false"
                  :check-file-rules="true"
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
                  :school-i-d="userInfo.activeInstituteIdentifier"
                  :additional-student-add-warning="addStudentWarningMessage"
                  @add-student="sendNewSecureExchangeStudent"
                  @close:form="hideStudentPanel"
                  @update-additional-student-add-warning="updateAddStudentWarningMessage"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-timeline
                  v-if="secureExchange.activities.length > 0"
                  side="end"
                  truncate-line="both"
                >
                  <v-timeline-item
                    v-for="(activity,index) in secureExchange.activities"
                    :key="activity.secureExchangeCommentID"
                    dot-color="white"
                    icon-color="#003366"
                    :icon="getActivityIcon(activity)"
                    size="large"
                    width="100%"
                  >
                    <template #opposite>
                      <div class="activityHeader">
                        <div class="activityTitle">
                          {{ activity.title }}
                        </div>
                        <v-spacer />
                        <div class="activityDisplayDate">
                          {{ activity.displayDate }}
                        </div>
                      </div>
                    </template>
                    <v-card v-if="activity.type === 'message'">
                      <v-card-text class="activityContent">
                        {{ activity.content }}
                      </v-card-text>
                    </v-card>
                    <v-card v-if="activity.type === 'document'">
                      <v-row no-gutters>
                        <v-card-text
                          class="mt-n2 pb-0"
                          :class="{'pb-0': activity.documentType.label !== 'Other', 'pb-3': activity.documentType.label === 'Other'}"
                        >
                          <router-link
                            v-if="isEditable() && isPdf(activity)"
                            :to="{ path: documentUrl(activity) }"
                            target="_blank"
                          >
                            {{ activity.fileName }}
                          </router-link>
                          <a
                            v-else-if="isEditable()"
                            @click="showDocModal(activity)"
                          >
                            {{ activity.fileName }}
                          </a>
                          <span
                            v-else
                            style="color: grey"
                          >
                            {{ activity.fileName }}
                          </span>
                        </v-card-text>
                        <v-card-text
                          v-if="activity.documentType.label !== 'Other'"
                          class="pt-0 pb-3"
                        >
                          {{ activity.documentType.label }}
                        </v-card-text>
                        <v-btn
                          v-show="isOpenDocIndex !== index"
                          class="ml-12 mb-2 mr-1 pl-0 pr-0 plainBtn"
                          bottom
                          right
                          absolute
                          elevation="0"
                          :disabled="!isEditable()"
                          @click="toggleRemoveDoc(index)"
                        >
                          <v-icon>mdi-delete-forever-outline</v-icon>
                        </v-btn>
                      </v-row>
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
                                  dark
                                  color="#003366"
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
                      <v-card-text>
                        <v-row v-if="activity.studentPEN">
                          <v-col
                            class="pt-0"
                            cols="3"
                          >
                            <span>PEN: </span>
                          </v-col>
                          <v-col
                            class="studentPenRaw pt-0"
                            cols="9"
                          >
                            {{ activity.studentPEN }}
                          </v-col>
                        </v-row>
                        <v-row v-if="activity.studentLocalID">
                          <v-col
                            class="pt-0"
                            cols="3"
                          >
                            <span>Local ID: </span>
                          </v-col>
                          <v-col
                            class="pt-0"
                            cols="9"
                          >
                            <span>{{ activity.studentLocalID }}</span>
                          </v-col>
                        </v-row>
                        <v-row v-if="activity.studentSurname">
                          <v-col
                            class="pt-0"
                            cols="3"
                          >
                            <span>Surname: </span>
                          </v-col>
                          <v-col
                            class="pt-0"
                            cols="9"
                          >
                            <span>{{ activity.studentSurname }}</span>
                          </v-col>
                        </v-row>
                        <v-row v-if="activity.studentGiven">
                          <v-col
                            class="pt-0"
                            cols="3"
                          >
                            <span>Given Name: </span>
                          </v-col>
                          <v-col
                            class="pt-0"
                            cols="9"
                          >
                            <span>{{ activity.studentGiven }}</span>
                          </v-col>
                        </v-row>
                        <v-row v-if="activity.studentMiddle">
                          <v-col
                            class="pt-0"
                            cols="3"
                          >
                            <span>Middle Name: </span>
                          </v-col>
                          <v-col
                            class="pt-0"
                            cols="9"
                          >
                            <span>{{ activity.studentMiddle }}</span>
                          </v-col>
                        </v-row>
                        <v-row v-if="activity.studentDOB">
                          <v-col
                            class="pt-0"
                            cols="3"
                          >
                            <span>Birth Date: </span>
                          </v-col>
                          <v-col
                            class="pt-0"
                            cols="9"
                          >
                            <span>{{ activity.studentDOB }}</span>
                          </v-col>
                        </v-row>
                        <v-row v-if="activity.studentGender">
                          <v-col
                            class="pt-0"
                            cols="3"
                          >
                            <span>Gender: </span>
                          </v-col>
                          <v-col
                            class="pt-0"
                            cols="9"
                          >
                            <span>{{ activity.studentGender }}</span>
                          </v-col>
                        </v-row>
                      </v-card-text>
                      <v-row>
                        <v-btn
                          v-show="isOpenStudentIndex !== index"
                          class="ml-12 mr-1 mb-2 pl-0 pr-0 plainBtn"
                          bottom
                          right
                          absolute
                          elevation="0"
                          :disabled="!isEditable()"
                          @click="toggleRemoveStudent(index)"
                        >
                          <v-icon>mdi-delete-forever-outline</v-icon>
                        </v-btn>
                      </v-row>
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
                                  dark
                                  color="#003366"
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
import PdfRenderer from '../common/PdfRenderer.vue';
import ImageRenderer from '../common/ImageRenderer.vue';
import { authStore } from '../../store/modules/auth';
import { mapState } from 'pinia';


export default {
  name: 'MessageDisplay',
  components: { DocumentUpload, AddStudent, PrimaryButton, ImageRenderer, PdfRenderer },
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
      pdfRenderDialog: false,
      imageRendererDialog: false,
      documentId: '',
      imageId: '',
      addStudentWarningMessage: '',
      disableAnchorTagDocumentName: true,
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
      if (this.isPdf(document)) {
        this.documentId = document.documentID;
        this.pdfRenderDialog = true;
      }else {
        this.imageId = document.documentID;
        this.imageRendererDialog = true;
      }
    },
    isPdf(document){
      return (
        'fileName' in document &&
          typeof document.fileName === 'string' &&
          document.fileName.toLowerCase().endsWith('.pdf')
      );
    },
    async closeDialog() {
      this.documentId = '';
      this.imageId = '';
      this.pdfRenderDialog = false;
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
}

.activityTitle {
  font-size: medium;
  font-weight: bold;
}

.activityDisplayDate{
  font-size: small;
  color: rgb(149, 149, 149);
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
  grid-template-columns: minmax(min-content, 10em) min-content auto;
}

</style>

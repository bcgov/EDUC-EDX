<template>
  <v-container
    fluid
    class="full-height px-0 pt-0"
  >
    <v-row class="d-flex justify-center">
      <v-col
        class="pt-0"
        cols="11"
      >
        <v-row>
          <v-col class="pr-0 pb-0">
            <v-row>
              <v-col>
                <v-card
                  id="newMessageCard"
                  flat
                  outlined
                >
                  <v-row>
                    <v-col class="pb-0 pt-8">
                      <v-card-text
                        id="newMessageCardText"
                        class="pb-0 pt-0"
                      >
                        <v-form
                          ref="newMessageForm"
                          v-model="isValidForm"
                        >
                          <v-text-field
                            :model-value="getFromName()"
                            label="From"
                            class="pt-0"
                            variant="underlined"
                            readonly
                          />
                          <v-select
                            id="schoolNameTxtField"
                            v-model="assignedMinistryTeam"
                            :items="ministryTeams"
                            item-value="ministryOwnershipTeamId"
                            item-title="teamName"
                            :rules="requiredRules"
                            label="To"
                            variant="underlined"
                            :menu-props="{
                              closeOnClick: true,
                              closeOnContentClick: true,
                            }"
                          >
                            <template #item="{ item, index }">
                              <v-list-item @click="selectItem(item)">
                                <v-row no-gutters>
                                  <v-col
                                    cols="12"
                                    class="pr-0"
                                  >
                                    <div
                                      class="body-2"
                                      style="color: black;font-weight: bolder"
                                    >
                                      {{ item.title }}
                                    </div>
                                    <div
                                      class="body-2"
                                      style="color: black;"
                                      :style="{'max-width': $vuetify.display.smAndDown ? '30em' : '36em'}"
                                    >
                                      {{ item.raw.description }}
                                    </div>
                                  </v-col>
                                </v-row>
                              </v-list-item>
                            </template>
                          </v-select>
                          <v-text-field
                            id="subjectTxtField"
                            v-model="subject"
                            label="Subject"
                            variant="underlined"
                            :rules="requiredRules"
                            maxlength="255"
                            class="pt-0"
                          />
                          <v-textarea
                            id="newMessageTextArea"
                            ref="newMessageTextArea"
                            v-model="newMessage"
                            :rules="requiredRules"
                            rows="8"
                            label="Message"
                            variant="underlined"
                            no-resize
                            maxlength="4000"
                            class="pt-0"
                          />
                        </v-form>
                      </v-card-text>
                    </v-col>
                  </v-row>
                  <v-row
                    class="ml-6 mt-5"
                    no-gutters
                  >
                    <div
                      v-for="(document, index) in secureExchangeDocuments"
                      :key="index"
                    >
                      <v-col class="d-flex justify-start px-0 pb-2">
                        <v-chip
                          :id="`documentChip-${index}`"
                          :class="['ma-1']"
                          close
                          @click:close="removeDocumentByIndex(index)"
                        >
                          <v-avatar left>
                            <v-icon>mdi-paperclip</v-icon>
                          </v-avatar>
                          {{ abbreviateFileName(document.fileName) }}
                        </v-chip>
                      </v-col>
                    </div>
                    <div
                      v-for="(secureExchangeStudent, index) in secureExchangeStudents"
                      :key="secureExchangeStudent.studentID"
                    >
                      <v-col class="d-flex justify-start px-0 pb-2">
                        <v-chip
                          :id="`studentChip-${index}`"
                          :class="['ma-1']"
                          close
                          @click:close="removeSecureExchangeStudentByID(secureExchangeStudent)"
                        >
                          <v-avatar left>
                            <v-icon>mdi-account-circle</v-icon>
                          </v-avatar>
                          {{ secureExchangeStudent.pen }}
                        </v-chip>
                      </v-col>
                    </div>
                  </v-row>
                  <v-row v-if="shouldShowOptions">
                    <v-col class="d-flex justify-end mr-3 pt-0">
                      <v-btn
                        id="attachFileID"
                        title="Attach File"
                        color="#1A5A96"
                        variant="outlined"
                        class="addButton pl-2 pr-2"
                        @click="showAttachFilePanel"
                      >
                        <v-icon
                          color="#1A5A96"
                          class="mr-0"
                          right
                          dark
                        >
                          mdi-paperclip
                        </v-icon>
                        <span class="ml-1">Attach File</span>
                      </v-btn>
                      <v-btn
                        id="addStudentID"
                        title="Add Student"
                        color="#1A5A96"
                        variant="outlined"
                        class="addButton pl-2 pr-2 ml-1"
                        @click="showAddStudentPanel"
                      >
                        <v-icon
                          color="#1A5A96"
                          class="mr-0"
                          right
                          dark
                        >
                          mdi-account-multiple-plus-outline
                        </v-icon>
                        <span class="ml-1">Add Student</span>
                      </v-btn>
                    </v-col>
                  </v-row>
                  <!--pop out for attaching files-->
                  <v-row no-gutters>
                    <v-col class="d-flex justify-center px-2 pb-2 pt-2">
                      <v-expand-transition>
                        <DocumentUpload
                          v-show="expandAttachFile"
                          @close:form="showOptions"
                          @upload="uploadDocument"
                        />
                      </v-expand-transition>
                      <v-expand-transition>
                        <AddStudent
                          v-show="expandAddStudent"
                          :school-i-d="userInfo.activeInstituteIdentifier"
                          :additional-student-add-warning="additionalStudentAddWarningMessage"
                          @close:form="showOptions"
                          @add-student="addSecureExchangeStudent"
                          @update-additional-student-add-warning="updateAdditionalStudentAddWarning"
                        />
                      </v-expand-transition>
                    </v-col>
                  </v-row>
                  <!--end pop out for attaching files-->
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row class="py-4 justify-end pr-3">
          <PrimaryButton
            id="cancelMessage"
            secondary
            text="Cancel"
            class="mr-1"
            :click-action="navigateToList"
          />
          <PrimaryButton
            id="newMessagePostBtn"
            text="Send"
            width="7rem"
            :disabled="!isValidForm"
            :loading="processing"
            :click-action="sendNewMessage"
          />
        </v-row>
      </v-col>
    </v-row>
    <ConfirmationDialog ref="confirmationDialog" />
  </v-container>
</template>

<script>
import PrimaryButton from '../util/PrimaryButton.vue';
import DocumentUpload from '../common/DocumentUpload.vue';
import { authStore } from '../../store/modules/auth';
import { appStore } from '../../store/modules/app';
import { edxStore } from '../../store/modules/edx';
import { mapState } from 'pinia';
import ConfirmationDialog from '../util/ConfirmationDialog.vue';
import alertMixin from '../../mixins/alertMixin';
import ApiService from '../../common/apiService';
import { ApiRoutes } from '../../utils/constants';
import AddStudent from '../AddStudent.vue';

export default {
  name: 'NewMessagePage',
  components: {
    AddStudent,
    PrimaryButton,
    ConfirmationDialog,
    DocumentUpload
  },
  mixins: [alertMixin],
  emits: ['secure-exchange:cancel-message','secure-exchange:message-sent'],
  data() {
    return {
      newMessage: '',
      assignedMinistryTeam: null,
      subject: '',
      requiredRules: [v => !!v?.trim() || 'Required'],
      isValidForm: false,
      processing: false,
      expandAttachFile: false,
      expandAddStudent: false,
      shouldShowOptions: true,
      additionalStudentAddWarningMessage:''
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(edxStore, ['ministryTeams', 'exchangeSchoolIds', 'secureExchangeDocuments','secureExchangeStudents']),
    ...mapState(appStore, ['schoolsMap', 'activeDistrictsMap']),
  },
  mounted() {
    this.validateForm();
  },
  created() {
    edxStore().getExchangeSchoolIds();
    edxStore().getMinistryTeams();
    //ensure uploaded messages are cleared out
    this.clearSecureExchangeDocuments();
    //ensure selected students are cleared out
    this.clearSecureExchangeStudents();
  },
  methods: {
    selectItem(item){
      this.assignedMinistryTeam = item.value;
    },
    updateAdditionalStudentAddWarning(newValue){
      this.additionalStudentAddWarningMessage = newValue;
    },
    navigateToList() {
      this.$emit('secure-exchange:cancel-message');
    },
    getFromName() {
      if(this.userInfo.activeInstituteType === 'DISTRICT') {
        const district = this.activeDistrictsMap.get(this.userInfo.activeInstituteIdentifier);
        return district?.name + ' (' + district?.districtNumber + ')';
      } else {
        const school = this.schoolsMap.get(this.userInfo.activeInstituteIdentifier);
        return school?.schoolName + ' (' + school?.mincode + ')';
      }
    },
    messageSent(){
      this.subject = '';
      this.assignedMinistryTeam = null;
      this.newMessage = '';
      this.requiredRules = [v => !!v?.trim() || 'Required'];
      this.$emit('secure-exchange:message-sent');
      this.clearSecureExchangeDocuments();
      this.clearSecureExchangeStudents();
      this.additionalStudentAddWarningMessage='';
    },
    sendNewMessage() {
      this.processing = true;
      this.additionalStudentAddWarningMessage='';
      const payload = {
        ministryOwnershipTeamID: this.assignedMinistryTeam,
        subject: this.subject,
        content: this.newMessage,
        secureExchangeDocuments: this.secureExchangeDocuments,
        secureExchangeStudents: this.secureExchangeStudents
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
    async uploadDocument(document) {
      await edxStore().setSecureExchangeDocuments([...this.secureExchangeDocuments, document]);
    },
    async addSecureExchangeStudent(secureExchangeStudent) {
      const found =this.secureExchangeStudents.some(el =>el.studentID === secureExchangeStudent.studentID);
      if(!found){
        await edxStore().setSecureExchangeStudents([...this.secureExchangeStudents, secureExchangeStudent]);
      }

    },
    removeDocumentByIndex(index) {
      //since we don't have a unique UUID to identify the document to remove, we will use the index
      edxStore().deleteSecureExchangeDocumentByIndex(index);
    },
    removeSecureExchangeStudentByID(secureExchangeStudent) {
      edxStore().deleteSecureExchangeStudentsByID(secureExchangeStudent);
    },
    clearSecureExchangeDocuments() {
      edxStore().setSecureExchangeDocuments([]);
    },
    clearSecureExchangeStudents() {
      edxStore().setSecureExchangeStudents([]);
    },
    showOptions() {
      this.expandAttachFile = false;
      this.expandAddStudent = false;
      this.shouldShowOptions = true;
    },
    showAttachFilePanel() {
      this.expandAttachFile = true;
      this.expandAddStudent = false;
      this.shouldShowOptions = false;
    },
    abbreviateFileName(fileName){
      if(fileName.length > 8){
        return fileName.substring(0,8) + '...';
      }
      return fileName;
    },
    showAddStudentPanel() {
      if(this.secureExchangeStudents.length > 0){
        this.additionalStudentAddWarningMessage='Additional students should only be added if the details are relevant to this request. Requests for separate students should be sent in a new message.';
      }
      this.expandAttachFile = false;
      this.expandAddStudent = true;
      this.shouldShowOptions = false;
    },
    async validateForm() {
      const valid = await this.$refs.newMessageForm.validate();
      this.isFormValid = valid.valid;
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

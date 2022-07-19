<template>
  <v-container fluid class="full-height px-0 pt-0">
    <v-row class="d-flex justify-center">
      <v-col class="pt-0" cols="11">
        <v-row>
          <v-col class="pr-0 pb-0">
            <v-row>
              <v-col>
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
                                  <div class="body-2" style="color: black;font-weight: bolder">
                                    {{ item.teamName }}
                                  </div>
                                  <div class="body-2" style="color: black;"
                                       :style="{'max-width': $vuetify.breakpoint.smAndDown ? '30em' : '36em'}">
                                    {{ item.description }}
                                  </div>
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
                  <v-row no-gutters>
                    <v-col v-if="secureExchangeDocuments.length > 0 || secureExchangeStudents.length>0" class="d-flex px-0">
                      <v-chip :class="['ma-1']" v-for="(document, index) in secureExchangeDocuments" :key="index" close @click:close="removeDocumentByIndex(index)">
                        <v-avatar left>
                          <v-icon>mdi-paperclip</v-icon>
                        </v-avatar>
                        {{document.fileName}}</v-chip>
                      <v-chip :class="['ma-1']" v-for="(secureExchangeStudent) in secureExchangeStudents" :key="secureExchangeStudent.studentID" close @click:close="removeSecureExchangeStudentByID(secureExchangeStudent)">
                        <v-avatar left>
                          <v-icon>mdi-account-circle</v-icon>
                        </v-avatar>
                        {{secureExchangeStudent.pen}}</v-chip>
                    </v-col>

                  </v-row>
                  <v-row v-if="shouldShowOptions">
                    <v-col class="d-flex justify-end mr-3 pt-0">
                      <v-btn id="attachFileID"
                             title="Attach File"
                             color="#1A5A96"
                             outlined
                             class="addButton pl-0 pr-2"
                             @click="showAttachFilePanel"
                      >
                        <v-icon color="#1A5A96" class="mr-0" right dark>mdi-paperclip</v-icon>
                        <span class="ml-1">Attach File</span>
                      </v-btn>
                      <v-btn id="addStudentID"
                             title="Add Student"
                             color="#1A5A96"
                             outlined
                             class="addButton pl-0 pr-2 ml-1"
                             @click="showAddStudentPanel"
                      >
                        <v-icon color="#1A5A96" class="mr-0" right dark>
                          mdi-account-multiple-plus-outline
                        </v-icon>
                        <span class="ml-1">Add Student</span>
                      </v-btn>
                    </v-col>
                  </v-row>
                  <!--pop out for attaching files-->
                  <v-row no-gutters>
                    <v-col>
                      <v-expand-transition
                          max-width="30rem"
                          max-height="50rem"
                          xl="2" lg="2" md="2" xs="2" sm="2"
                      >
                        <DocumentUpload
                            v-show="expandAttachFile"
                            @close:form="showOptions"
                            @upload="uploadDocument"
                        ></DocumentUpload>
                      </v-expand-transition>
                      <v-expand-transition>
                        <AddStudent
                            v-show="expandAddStudent"
                            @close:form="showOptions"
                            @addStudent="addSecureExchangeStudent"
                         :mincode="userInfo.activeInstituteIdentifier"
                         :addtionalStudentAddWarning="addtionalStudentAddWarningMessage"
                        >
                        </AddStudent>
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
          <PrimaryButton id="cancelMessage" secondary text="Cancel" class="mr-1" @click.native="navigateToList"></PrimaryButton>
          <PrimaryButton id="newMessagePostBtn" text="Send" width="7rem" :disabled="!isValidForm" :loading="processing" @click.native="sendNewMessage"></PrimaryButton>
        </v-row>
      </v-col>
    </v-row>
    <ConfirmationDialog ref="confirmationDialog"></ConfirmationDialog>
  </v-container>
</template>

<script>
import PrimaryButton from '@/components/util/PrimaryButton';
import DocumentUpload from '@/components/common/DocumentUpload';
import {mapState} from 'vuex';
import ConfirmationDialog from '@/components/util/ConfirmationDialog';
import alertMixin from '@/mixins/alertMixin';
import ApiService from '@/common/apiService';

import {
  ApiRoutes,
} from '@/utils/constants';
import AddStudent from '@/components/AddStudent';

export default {
  name: 'NewMessagePage',
  mixins: [alertMixin],
  components: {
    AddStudent,
    PrimaryButton,
    ConfirmationDialog,
    DocumentUpload
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
      processing: false,
      expandAttachFile: false,
      expandAddStudent: false,
      shouldShowOptions: true,
      addtionalStudentAddWarningMessage:''
    };
  },
  computed: {
    ...mapState('auth', ['userInfo']),
    ...mapState('edx', ['ministryTeams', 'exchangeMincodes', 'secureExchangeDocuments','secureExchangeStudents'])
  },
  created() {
    this.$store.dispatch('edx/getExchangeMincodes');
    this.$store.dispatch('edx/getMinistryTeams');
    //ensure uploaded messages are cleared out
    this.clearSecureExchangeDocuments();
    //ensure selected students are cleared out
    this.clearSecureExchangeStudents();
  },
  methods: {
    navigateToList() {
      this.$emit('secure-exchange:cancelMessage');
    },
    getSchoolName() {
      return this.mincodeSchoolNames.get(this.userInfo.activeInstituteIdentifier) + ' (' + this.userInfo.activeInstituteIdentifier + ')';
    },
    messageSent(){
      this.subject = '';
      this.assignedMinistryTeam = null;
      this.newMessage = '';
      this.requiredRules = [v => !!v?.trim() || 'Required'];
      this.$emit('secure-exchange:messageSent');
      this.clearSecureExchangeDocuments();
      this.clearSecureExchangeStudents();
      this.addtionalStudentAddWarningMessage='';
    },
    sendNewMessage() {
      this.processing = true;
      this.addtionalStudentAddWarningMessage='';
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
      this.$store.commit('edx/setSecureExchangeDocuments', [...this.secureExchangeDocuments, document]);
    },
    async addSecureExchangeStudent(secureExchangeStudent) {
      const found =this.secureExchangeStudents.some(el =>el.studentID === secureExchangeStudent.studentID);
      if(!found){
        this.$store.commit('edx/setSecureExchangeStudents', [...this.secureExchangeStudents, secureExchangeStudent]);
      }

    },
    removeDocumentByIndex(index) {
      //since we don't have a unique UUID to identify the document to remove, we will use the index
      this.$store.commit('edx/deleteSecureExchangeDocumentByIndex', index);
    },
    removeSecureExchangeStudentByID(secureExchangeStudent) {
      //since we don't have a unique UUID to identify the document to remove, we will use the index
      this.$store.commit('edx/deleteSecureExchangeStudentsByID', secureExchangeStudent);
    },
    clearSecureExchangeDocuments() {
      this.$store.commit('edx/setSecureExchangeDocuments', []);
    },
    clearSecureExchangeStudents() {
      this.$store.commit('edx/setSecureExchangeStudents', []);
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
    showAddStudentPanel() {
      if(this.secureExchangeStudents.length>0){
        this.addtionalStudentAddWarningMessage='Addtional students should only be added if the details are relevant to this request. Requests for separate students should be sent in a new message. ';
      }
      this.expandAttachFile = false;
      this.expandAddStudent = true;
      this.shouldShowOptions = false;
    }
  }
};
</script>

<style scoped>

</style>

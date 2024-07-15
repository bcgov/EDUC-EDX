<template>
  <div v-if="initialLoad">
    <v-row>
      <v-col>
        <Spinner />
      </v-col>
    </v-row>
  </div>
  <div
    v-else-if="hasFileAttached && fileLoaded"
    class="border"
  >
    <v-row>
      <v-col class="mb-3 d-flex justify-center">
        <h1>Upload Student Level Data</h1>
      </v-col>
    </v-row>
    <v-row v-if="fileUploadErrorMessage">
      <v-col>
        <v-alert
          density="compact"
          variant="tonal"
          type="error"
          :text="fileUploadErrorMessage"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col style="text-align: center;">
        <div style="margin-top: 0.2em">
          <v-icon>
            mdi-file
          </v-icon>
          <span style="padding-top: 0.1em;">{{ fileName }}</span>
        </div>
        <div style="font-size: small; font-style: italic;">
          Uploaded {{ fileUploadDateFormatted }}
        </div>
      </v-col>
      <v-col>
        <v-btn
          id="uploadAgainButton"
          prepend-icon="mdi-file-upload"
          :loading="isReadingFile"
          :disabled="!hasEditPermission"
          style="font-size: 16px;"
          color="#1976d2"
          variant="text"
          @click="clickFileReUpload"
        >
          Upload Replacement File
        </v-btn>
        <span>or</span>
        <v-btn
          id="reportZeroEnrollment"
          prepend-icon="mdi-numeric-0-circle"
          :disabled="!hasEditPermission || isReadingFile"
          style="font-size: 16px;"
          color="#1976d2"
          variant="text"
          @click="clickReportZeroEnrollment"
        >
          Report Zero Enrollment
        </v-btn>
        <div class="pl-4">
          More information on the
          <a
            :href="getLink"
            target="_blank"
            rel="noopener noreferrer"
            style="color: rgb(56, 89, 138); text-decoration: underline"
          >
            1701 submission requirements.
          </a>
        </div>
      </v-col>
    </v-row>
    <v-row v-if="showFileReportDateWarning">
      <v-col class="mb-3 d-flex justify-center">
        <v-alert
          density="compact"
          type="warning"
          variant="tonal"
        >
          <p>
            The date in the uploaded file is <strong>{{ fileReportDateFormatted }}</strong>. Please ensure that you have uploaded the correct data for this collection before continuing.
          </p>
        </v-alert>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-divider class="divider" />
      </v-col>
    </v-row>
    <SummaryComponent />
  </div>
  <div
    v-else-if="hasFileAttached"
    class="border"
  >
    <v-row>
      <v-col class="mb-3 d-flex justify-center">
        <h1>Upload Student Level Data</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="mb-3 d-flex justify-center">
        <span v-if="positionInQueue > 1">We are processing 1701 submissions from multiple schools. Your submission is currently number {{ positionInQueue }} in line to be processed.  Thank you for your patience.</span>
        <span v-else>We're processing your 1701 submission. Currently, {{ totalProcessed }} of {{ totalStudents }} student records have been processed...</span>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="6"
        offset="3"
        class="mb-n2 d-flex justify-center"
      >
        <v-progress-linear
          :size="128"
          :width="12"
          indeterminate
          color="#38598a"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="6"
        offset="3"
        class="d-flex justify-end"
      >
        <span>{{ progress }}% complete</span>
      </v-col>
    </v-row>
  </div>
  <div
    v-else-if="!hasFileAttached"
    class="border"
  >
    <v-row>
      <v-col class="mb-3 d-flex justify-center">
        <h1>Upload Student Level Data</h1>
      </v-col>
    </v-row>
    <v-row v-if="fileUploadErrorMessage">
      <v-col>
        <v-alert
          density="compact"
          variant="tonal"
          type="error"
          :text="fileUploadErrorMessage"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col class="d-flex justify-end mt-1">
        <v-btn
          id="uploadButton"
          prepend-icon="mdi-file-upload"
          style="width: 18em"
          variant="elevated"
          color="#003366"
          text="Upload 1701 Submission"
          :loading="isReadingFile"
          :disabled="!hasEditPermission"
          :click-action="handleFileImport"
        />
      </v-col>
      <v-col class="d-flex justify-start">
        <v-row>
          <v-col>
            <span>
              More information on the
              <a
                :href="getLink"
                target="_blank"
                rel="noopener noreferrer"
                style="color: rgb(56, 89, 138); text-decoration: underline"
              >
                1701 submission requirements.
              </a>
            </span>
            <span v-if="hasEditPermission">
              <br>To manually add all student enrollment data for this collection,
              <a
                rel="noopener noreferrer"
                style="color: rgb(56, 89, 138); text-decoration: underline"
                @click="triggerManualEnrollment"
              >
                click here.
              </a>
            </span>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="d-flex justify-end mt-2">
        <v-btn
          id="reportZeroEnrollment"
          variant="outlined"
          color="#003366"
          style="width: 18em"
          prepend-icon="mdi-numeric-0-circle"
          text="Report Zero Enrollment"
          :disabled="!hasEditPermission"
          @click="clickReportZeroEnrollment"
        />
      </v-col>
      <v-col class="d-flex justify-start">
        <div class="mt-2">
          This option should only be used for schools with no student<br> enrollment to report for this collection.
        </div>
      </v-col>
    </v-row>
  </div>
  <v-row justify="space-between">
    <p class="text-medium-emphasis font-italic ml-3 mb-3">
      Note: Eligible FTE counts are available in Step 3
    </p>
    <PrimaryButton
      id="step-1-next-button-school"
      class="mr-3 ml-3 mb-3"
      icon="mdi-check"
      text="Next"
      :disabled="isDisabled || !canMoveForward()"
      :click-action="next"
    />
  </v-row>
  <v-form
    ref="documentForm"
    v-model="validForm"
  >
    <v-file-input
      id="selectFileInput"
      ref="uploader"
      :key="inputKey"
      v-model="uploadFileValue"
      :rules="fileRules"
      style="display: none"
      :accept="acceptableFileExtensions.join(',')"
    />
  </v-form>
  <ConfirmationDialog ref="confirmReplacementFile">
    <template #message>
      <p>Uploading a replacement file will remove all data associated with the existing file you have uploaded.</p>
          &nbsp;
      <p>Once this action is completed <strong>it cannot be undone</strong> and <strong>any fixes to data issues or changes to student data will need to be completed again.</strong></p>
    </template>
  </ConfirmationDialog>
  <ConfirmationDialog ref="confirmZeroEnrollment">
    <template #message>
      <p>Please confirm if you would like to report zero enrollment for this collection.</p>
      &nbsp;
      <p>Confirming below will <strong>finalize your 1701 submission</strong> and <strong>remove your ability to edit data for this collection.</strong></p>
    </template>
  </ConfirmationDialog>
</template>

<script>
import alertMixin from '../../../../mixins/alertMixin';
import PrimaryButton from '../../../util/PrimaryButton.vue';
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';
import {getFileNameWithMaxNameLength} from '../../../../utils/file';
import { mapState, mapActions } from 'pinia';
import { sdcCollectionStore } from '../../../../store/modules/sdcCollection';
import Spinner from '../../../common/Spinner.vue';
import ConfirmationDialog from '../../../util/ConfirmationDialog.vue';
import {DateTimeFormatter, LocalDate, LocalDateTime, ResolverStyle} from '@js-joda/core';
import SummaryComponent from './SummaryComponent.vue';
import {getCollectionLink} from '../../../../utils/common';
import {authStore} from '../../../../store/modules/auth';
import {PERMISSION} from '../../../../utils/constants/Permission';

export default {
  name: 'StepOneUploadData',
  components: {
    SummaryComponent,
    ConfirmationDialog,
    Spinner,
    PrimaryButton
  },
  mixins: [alertMixin],
  props: {
    schoolCollectionObject: {
      type: Object,
      required: true,
      default: null
    },
    isStepComplete: {
      type: Boolean,
      required: true
    }
  },
  emits: ['next', 'refresh-store'],
  data() {
    return {
      acceptableFileExtensions: ['.std', '.ver'],
      requiredRules: [v => !!v || 'Required'],
      fileRules: [],
      isReadingFile: false,
      uploadFileValue: null,
      fileInputError: [],
      isDisabled: false,
      sdcSchoolProgress: null,
      hasFileAttached: false,
      fileLoaded: false,
      progress: 0,
      processing: false,
      initialLoad: true,
      fileName: null,
      interval: null,
      totalStudents: 0,
      totalProcessed: 0,
      fileUploadErrorMessage: null,
      inputKey: 0,
      validForm: false,
      sdcSchoolCollectionID: this.$route.params.schoolCollectionID,
      positionInQueue: 0
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(sdcCollectionStore, ['currentCollectionTypeCode','currentStepInCollectionProcess', 'schoolCollection']),
    collectionOpenDate() {
      return LocalDate.parse(this.schoolCollectionObject.collectionOpenDate.substring(0,19), DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
    },
    hasEditPermission(){
      return (this.userInfo?.activeInstitutePermissions?.filter(perm => perm === PERMISSION.SCHOOL_SDC_EDIT).length > 0);
    },
    collectionCloseDate() {
      return LocalDate.parse(this.schoolCollectionObject.collectionCloseDate.substring(0,19), DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
    },
    fileReportDate() {
      try {
        return LocalDate.parse(this.sdcSchoolProgress?.uploadReportDate, DateTimeFormatter.ofPattern('uuuuMMdd').withResolverStyle(ResolverStyle.STRICT));
      } catch (e) {
        return null;
      }
    },
    fileReportDateFormatted() {
      if (!this.sdcSchoolProgress?.uploadReportDate) {
        return 'not specified';
      }
      if (!this.fileReportDate) {
        return this.sdcSchoolProgress?.uploadReportDate;
      }
      return this.fileReportDate.toLocaleString();
    },
    showFileReportDateWarning() {
      if (!this.sdcSchoolProgress) {
        return false;
      }
      if (!this.fileReportDate) {
        return true;
      }
      return this.fileReportDate.isBefore(this.collectionOpenDate.minusDays(30)) || this.fileReportDate.isAfter(this.collectionCloseDate.plusDays(30));
    },
    fileUploadDate() {
      try {
        return LocalDateTime.parse(this.sdcSchoolProgress?.uploadDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
      } catch (e) {
        return null;
      }
    },
    fileUploadDateFormatted() {
      if (!this.fileUploadDate) {
        return 'n/a';
      }
      return this.fileUploadDate.format(DateTimeFormatter.ofPattern('yyyy-MM-dd HH:mm'));
    },
    getLink(){
      return getCollectionLink(this.currentCollectionTypeCode);
    }
  },
  watch: {
    uploadFileValue() {
      if(this.uploadFileValue){
        this.importFile();
      }
    },
  },
  async created() {
    await this.fireFileProgress();
  },
  methods: {
    ...mapActions(sdcCollectionStore, ['setSchoolCollection']),
    async fireFileProgress(){
      await this.getFileProgress();
      this.getFileRules();
      if(this.processing){
        this.startPollingStatus();
      }
    },
    canMoveForward(){
      return this.isStepComplete || this.hasEditPermission;
    },
    async clickFileReUpload(){
      const confirmation = await this.$refs.confirmReplacementFile.open('Confirm Replacement File', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Select a Replacement File', rejectText: 'Cancel'});
      if (!confirmation) {
        return;
      }
      await this.handleFileImport();
    },
    async clickReportZeroEnrollment(){
      const confirmation = await this.$refs.confirmZeroEnrollment.open('Confirm Zero Enrollment', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Confirm', rejectText: 'Cancel'});
      if (!confirmation) {
        return;
      }
      await this.handleReportZeroEnrollment();
    },
    getFileRules() {
      this.fileRules = [
        value => {
          const extension = `.${value[0].name.split('.').slice(-1)}`;
          const failMessage = 'File extension is invalid. Extension must be ".ver" or ".std".';

          if(extension && (this.acceptableFileExtensions.find(ext => ext.toUpperCase() === extension.toUpperCase())) !== undefined) {
            return true;
          }

          this.setFailureAlert(failMessage);
          return failMessage;
        }
      ];
    },
    next() {
      if(this.isStepComplete) {
        this.$emit('next');
      } else {
        this.markStepAsComplete();
      }
    },
    markStepAsComplete() {
      let updateCollection = {
        schoolCollection: this.schoolCollectionObject,
        status: 'LOADED'
      };
      ApiService.apiAxios.put(ApiRoutes.sdc.BASE_URL + '/' + this.sdcSchoolCollectionID, updateCollection)
        .then(() => {
          this.$emit('next');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while marking step complete. Please try again later.');
        });
    },
    triggerManualEnrollment() {
      let updateCollection = {
        schoolCollection: this.schoolCollectionObject,
        status: 'REVIEWED'
      };
      ApiService.apiAxios.put(ApiRoutes.sdc.BASE_URL + '/' + this.sdcSchoolCollectionID, updateCollection)
        .then(() => {
          this.$emit('refresh-store');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while triggering manual enrollment. Please try again later.');
        });
    },
    async startPollingStatus() {
      this.interval = setInterval(this.getFileProgress, 10000);  // polling the api every 10 seconds
    },
    async validateForm() {
      await this.$nextTick();
      await this.$refs.documentForm.validate();
    },
    handleFileImport() {
      this.fileUploadErrorMessage = null;
      this.uploadFileValue = null;
      this.$refs.uploader.click();
    },
    handleReportZeroEnrollment() {
      this.fileUploadErrorMessage = null;
      this.uploadFileValue = null;
      this.reportZeroEnrollment(this.sdcSchoolCollectionID);
    },
    async importFile() {
      if(this.uploadFileValue) {
        this.isDisabled = true;
        this.isReadingFile = true;
        let data = null;

        await this.validateForm();

        if (!this.uploadFileValue || !this.validForm) {
          data = 'No File Chosen';
          this.inputKey++;
          this.isReadingFile = false;
        } else {
          let reader = new FileReader();
          reader.readAsText(this.uploadFileValue);
          reader.onload = () => {
            data = reader.result;
            this.uploadFile(data);
          };
          this.inputKey++;
        }
      }
    },
    async uploadFile(fileAsString) {
      try{
        let document = {
          fileName: getFileNameWithMaxNameLength(this.uploadFileValue.name),
          fileContents: btoa(unescape(encodeURIComponent(fileAsString)))
        };
        await ApiService.apiAxios.post(ApiRoutes.sdc.BASE_URL + '/' + this.sdcSchoolCollectionID + '/file', document);
        this.setSuccessAlert('Your document was uploaded successfully.');
        await this.fireFileProgress();
        this.$emit('refresh-store');
      } catch (e) {
        console.error(e);
        this.fileUploadErrorMessage = 'The file could not be processed due to the following issue: ' + e.response.data;
      } finally {
        this.isReadingFile = false;
      }
    },
    async reportZeroEnrollment(sdcSchoolCollectionId) {
      ApiService.apiAxios.post(`${ApiRoutes.sdc.BASE_URL}/${sdcSchoolCollectionId}/reportZeroEnrollment`).then(() => {
        this.setSuccessAlert('Your report of zero enrollment was recorded successfully.');
        this.$emit('refresh-store');
      }).catch(e => {
        console.error(e);
        this.fileUploadErrorMessage = 'An error has occurred when reporting zero enrollment: ' + e.message;
      });
    },
    async getFileProgress() {
      try{
        await ApiService.apiAxios.get(ApiRoutes.sdc.BASE_URL + '/' + this.sdcSchoolCollectionID + '/file').then(response => {
          this.sdcSchoolProgress = response.data;
          this.totalStudents = this.sdcSchoolProgress.totalStudents;
          this.totalProcessed = this.sdcSchoolProgress.totalProcessed;
          this.positionInQueue = this.sdcSchoolProgress.positionInQueue;
          if(!this.sdcSchoolProgress.fileName){
            //Show file upload section
            this.hasFileAttached = false;
            this.fileLoaded = false;
            this.processing = false;
            if (this.schoolCollectionObject?.sdcSchoolCollectionStatusCode !== 'SUBMITTED') {
              this.isDisabled = true;
            }
          }else if(this.totalStudents === this.totalProcessed){
            //Show summary
            this.hasFileAttached = true;
            this.fileLoaded = true;
            this.processing = false;
            this.fileName = this.sdcSchoolProgress.fileName;
            this.isDisabled = false;
            clearInterval(this.interval);
          }else{
            //Show in progress
            this.hasFileAttached = true;
            this.fileLoaded = false;
            this.processing = true;
            this.isDisabled = true;
            this.progress = Math.floor(this.totalProcessed/this.totalStudents * 100);
          }
        });
      } catch (e) {
        clearInterval(this.interval);
        console.error(e);
      } finally {
        this.initialLoad = false;
      }
    }
  }
};
</script>

<style scoped>

 .divider {
     border-color: rgba(42, 45, 38, 0.38);
     border-width: 1px;
     opacity: unset;
 }

  .border {
    border: 2px solid grey;
    border-radius: 5px;
    padding: 35px;
    margin-bottom: 2em;
  }

  .form-hint{
    color: rgb(56, 89, 138);
    font-size: 14px;
  }

 :deep(.mdi-information){
   color: #003366;
 }
</style>

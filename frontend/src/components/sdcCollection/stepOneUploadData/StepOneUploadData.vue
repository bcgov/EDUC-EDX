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
          style="font-size: 16px;"
          color="#1976d2"
          variant="text"
          @click="clickFileReUpload"
        >
          Upload Replacement File
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
          color="#003366"
          density="compact"
          type="info"
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
        <span>We're processing your 1701 submission. Currently, {{ totalProcessed }} of {{ totalStudents }} student records have been processed...</span>
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
          type="error"
          :text="fileUploadErrorMessage"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col offset="4">
        <span
          class="mr-3"
          style="font-weight: bold"
        >Option 1:</span>
        <PrimaryButton
          id="uploadButton"
          secondary
          icon="mdi-file-upload"
          text="Upload 1701 Submission"
          :loading="isReadingFile"
          :click-action="handleFileImport"
        />
        <div class="mt-2">
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
    <v-row>
      <v-col offset="4">
        <v-row>
          <v-col>
            <span style="font-weight: bold">Option 2:</span>
            <span class="ml-4">Report a zero enrollment for the school. This should only be used if ...</span>
            <v-row>
              <v-col style="padding-left: 6.5em">
                <v-checkbox-btn
                  label="This school does not have a file for this collection."
                  style="font-style: italic"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
  <v-row justify="space-between">
    <p class="text-medium-emphasis font-italic ml-3 mb-3">
      Note: Eligible FTE counts are available in Step 3
    </p>
    <PrimaryButton
      id="step-1-next-button-school"
      class="mr-3 mb-3"
      icon="mdi-check"
      text="Next"
      :disabled="isDisabled"
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
</template>

<script>
import alertMixin from '../../../mixins/alertMixin';
import PrimaryButton from '../../util/PrimaryButton.vue';
import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';
import {getFileNameWithMaxNameLength, humanFileSize} from '../../../utils/file';
import { mapState, mapActions } from 'pinia';
import { sdcCollectionStore } from '../../../store/modules/sdcCollection';
import Spinner from '../../common/Spinner.vue';
import ConfirmationDialog from '../../util/ConfirmationDialog.vue';
import {DateTimeFormatter, LocalDate, LocalDateTime, ResolverStyle} from '@js-joda/core';
import {COLLECTIONCODETYPE} from '../../../utils/constants/CollectionCodeType';
import SummaryComponent from './SummaryComponent.vue';

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
      isDisabled: true,
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
      sdcSchoolCollectionID: this.$route.params.schoolCollectionID
    };
  },
  computed: {
    ...mapState(sdcCollectionStore, ['currentCollectionTypeCode','currentStepInCollectionProcess', 'schoolCollection']),
    collectionOpenDate() {
      return LocalDate.parse(this.schoolCollectionObject.collectionOpenDate.substring(0,19), DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
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
    getLink() {
      let collectionLink = '';
      let collectionCodeType = this.currentCollectionTypeCode;
      if (collectionCodeType === COLLECTIONCODETYPE.SEPTEMBER) {
        collectionLink = 'https://www2.gov.bc.ca/gov/content/education-training/k-12/administration/program-management/data-collections/september';
      } else if (collectionCodeType === COLLECTIONCODETYPE.FEBRUARY) {
        collectionLink = 'https://www2.gov.bc.ca/gov/content/education-training/k-12/administration/program-management/data-collections/february';
      } else if (collectionCodeType === COLLECTIONCODETYPE.MAY) {
        collectionLink = 'https://www2.gov.bc.ca/gov/content/education-training/k-12/administration/program-management/data-collections/may';
      } else if (collectionCodeType === COLLECTIONCODETYPE.JULY) {
        collectionLink = 'https://www2.gov.bc.ca/gov/content/education-training/k-12/administration/program-management/data-collections/summer-learning';
      }
      return collectionLink;
    },
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
    async clickFileReUpload(){
      const confirmation = await this.$refs.confirmReplacementFile.open('Confirm Replacement File', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Select a Replacement File', rejectText: 'Cancel'});
      if (!confirmation) {
        return;
      }
      await this.handleFileImport();
    },
    getFileRules() {
      this.fileRules = [
        value => {
          let ret = !value || value.length === 0 || value[0].size < 10485760 || `File size should not be larger than ${humanFileSize(10485760)}!`;
          if (ret !== true) {
            this.setFailureAlert(ret);
          }
          return ret;
        },
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
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while verifying school details. Please try again later.');
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
    async importFile() {
      if(this.uploadFileValue) {
        this.isDisabled = true;
        this.isReadingFile = true;
        let data = null;

        await this.validateForm();

        if (!this.uploadFileValue[0] || !this.validForm) {
          data = 'No File Chosen';
          this.inputKey++;
          this.isReadingFile = false;
        } else {
          let reader = new FileReader();
          reader.readAsText(this.uploadFileValue[0]);
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
          fileName: getFileNameWithMaxNameLength(this.uploadFileValue[0].name),
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
    async getFileProgress() {
      try{
        await ApiService.apiAxios.get(ApiRoutes.sdc.BASE_URL + '/' + this.sdcSchoolCollectionID + '/file').then(response => {
          this.sdcSchoolProgress = response.data;
          this.totalStudents = this.sdcSchoolProgress.totalStudents;
          this.totalProcessed = this.sdcSchoolProgress.totalProcessed;
          if(!this.sdcSchoolProgress.fileName){
            //Show file upload section
            this.hasFileAttached = false;
            this.fileLoaded = false;
            this.processing = false;
            this.isDisabled = true;
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

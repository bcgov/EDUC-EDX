<template>
  <div v-if="initialLoad">
    <v-row>
      <v-col>
        <Spinner flat />
      </v-col>
    </v-row>
  </div>
  <div
    class="border"
  >
    <v-row>
      <v-col class="mb-3 d-flex justify-center">
        <h1>Upload Student Level Data</h1>
      </v-col>
    </v-row>
    <v-row class="centered">
      <span class="mr-3">If the schools in your district are uploading their own data files, then you can continue to the next step.</span>
    </v-row>
    <v-row class="centered">
      <PrimaryButton
        id="uploadButton"
        icon="mdi-file-upload"
        text="Upload 1701 Submission"
        :loading="isLoadingFiles"
        :disabled="!hasEditPermission"
        :click-action="handleFileImport"
        title="Hold down either the Shift or Ctrl/Cmd key to select multiple files"
      />
    </v-row>
    <v-row class="centered">
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
    </v-row>
    <v-row class="schools-in-progress-header">
      Summary of Uploaded Data
    </v-row>
    <v-data-table
      :headers="headers"
      :items="schoolCollectionsInProgress"
      items-per-page="10"
    >
      <template #item.schoolDisplayName="{ item }">
        <router-link
          :to="{ name: 'sdcCollection', params: { schoolCollectionID: item.sdcSchoolCollectionID }}"
          target="_blank"
        >
          {{ item.schoolDisplayName }}
        </router-link>
      </template>
      <template #item.percentageStudentsProcessed="{ item }">
        <v-icon
          v-if="item.percentageStudentsProcessed === '100'"
          icon="mdi-check-circle-outline"
          color="success"
        />
        <span v-if="item.percentageStudentsProcessed === '0'"> - </span>
        <template v-if="item.percentageStudentsProcessed !== '0' && item.percentageStudentsProcessed !== '100'">
          <v-progress-circular
            :size="15"
            :width="3"
            color="primary"
            indeterminate
          />
          <span class="ml-2">{{ item.percentageStudentsProcessed }} %</span>
        </template>
      </template>
    </v-data-table>
  </div>
  <v-row justify="space-between">
    <p class="text-medium-emphasis font-italic ml-3 mb-3">
      Note: Eligible FTE counts are available in Step 3
    </p>
    <PrimaryButton
      id="step-1-next-button-district"
      class="mr-3 ml-3 mb-3"
      icon="mdi-check"
      text="Next"
      :disabled="!canMoveForward()"
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
      style="display: none"
      :accept="acceptableFileExtensions.join(',')"
      multiple
    />
  </v-form>
  <v-overlay
    v-model="isLoadingFiles"
    class="align-center justify-center"
    :persistent="true"
  >
    <v-card width="30em">
      <v-card-text style="overflow-y: scroll; max-height:30em">
        <v-row>
          <v-col>
            <v-alert
              density="compact"
              type="info"
              text="Please wait until all files have completed uploading before leaving the screen."
              variant="tonal"
            />
          </v-col>
        </v-row>
        <v-row
          v-for="(file, index) in fileUploadList"
          :key="index"
          height="20em"
          style="overflow: hidden; overflow-y: auto;"
        >
          <v-col>
            <v-row
              v-if="file.status === fileUploadPending"
              class="mt-1 mx-1 fileUploadWarning"
            >
              <v-col cols="1">
                <v-progress-circular
                  color="#003366"
                  size="15"
                  indeterminate
                />
              </v-col>
              <v-col cols="11">
                <span>{{ file.name + ' - ' + fileUploadPending }}</span>
              </v-col>
            </v-row>
            <v-row
              v-else-if="file.status === fileUploadSuccess && file.warning === null && file.error === null"
              class="mt-1 mx-1 fileUploadSuccess"
            >
              <v-col cols="1">
                <v-icon
                  icon="mdi-file-document"
                />
              </v-col>
              <v-col>
                <span><b>{{ file.name }}</b> - {{ fileUploadSuccess }}</span>
              </v-col>
            </v-row>
            <v-row
              v-else-if="file.warning !== null"
              class="mt-1 mx-1 fileUploadWarning"
            >
              <v-col cols="1">
                <v-icon
                  icon="mdi-file-document"
                />
              </v-col>
              <v-col cols="11">
                <span><b>{{ file.name }}</b> - {{ file.warning }}</span>
              </v-col>
            </v-row>
            <v-row
              v-else-if="file.error !== null"
              class="mt-1 mx-1 fileUploadError"
            >
              <v-col cols="1">
                <v-icon
                  icon="mdi-file-document"
                />
              </v-col>
              <v-col cols="11">
                <span><b>{{ file.name }}</b> - {{ file.error }}</span>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-row>
          <v-col class="d-flex justify-end">
            <span class="mr-2 mt-1">{{ inputKey }} of {{ fileUploadList.length }} Complete</span>
            <v-btn
              id="closeOverlayBtn"
              color="#003366"
              variant="elevated"
              text="Close"
              :disabled="uploadFileValue !== null"
              @click="closeOverlay"
            />
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-overlay>
</template>
<script>

import Spinner from '../../common/Spinner.vue';
import PrimaryButton from '../../util/PrimaryButton.vue';
import {sdcCollectionStore} from '../../../store/modules/sdcCollection';
import {getCollectionLink} from '../../../utils/common';
import {getFileNameWithMaxNameLength} from '../../../utils/file';
import {ApiRoutes} from '../../../utils/constants';
import ApiService from '../../../common/apiService';
import alertMixin from '../../../mixins/alertMixin';
import {mapActions, mapState} from 'pinia';
import {DateTimeFormatter, LocalDate} from '@js-joda/core';
import {setFailureAlert} from '../../composable/alertComposable';
import {authStore} from '../../../store/modules/auth';
import {PERMISSION} from '../../../utils/constants/Permission';
import {FILE_UPLOAD_STATUS} from '../../../utils/constants/FileUploadStatus';

export default {
  name: 'StepOneUploadData',
  components: {
    Spinner,
    PrimaryButton
  },
  mixins: [alertMixin],
  props: {
    districtCollectionObject: {
      type: Object,
      required: true,
      default: null
    },
    isStepComplete: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  emits: ['next'],
  data() {
    return {
      acceptableFileExtensions: ['.std', '.ver'],
      requiredRules: [v => !!v || 'Required'],
      fileRules: [],
      schoolCollectionsInProgress: [],
      isLoadingFiles: false,
      uploadFileValue: null,
      fileInputError: [],
      fileLoaded: false,
      fileUploadPending: FILE_UPLOAD_STATUS.PENDING,
      fileUploadSuccess: FILE_UPLOAD_STATUS.UPLOADED,
      fileUploadError: FILE_UPLOAD_STATUS.ERROR,
      processing: false,
      initialLoad: true,
      interval: null,
      successfulUploadCount: 0,
      successMessage: ' file(s) were successfully uploaded. Files will continue to be processed even if you leave the page.',
      populatedSuccessMessage: null,
      inputKey: 0,
      fileUploadList: [],
      validForm: false,
      sdcDistrictCollectionID: this.$route.params.sdcDistrictCollectionID,
      headers: [
        {
          title: 'School',
          align: 'start',
          key: 'schoolDisplayName',
          value: item => item.schoolDisplayName
        },
        {
          title: 'File Name',
          align: 'center',
          key: 'fileName',
          value: item => item.fileName ? item.fileName : '-'
        },
        {
          title: 'Date Uploaded',
          align: 'center',
          key: 'uploadDate',
          value: item => item.uploadDate ? item.uploadDate.substring(0,10).replaceAll('-', '/') : '-'
        },
        {
          title: 'Processed',
          align: 'center',
          key: 'percentageStudentsProcessed',
          value: item => item.percentageStudentsProcessed
        },
      ]
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(sdcCollectionStore, ['currentCollectionTypeCode','currentStepInCollectionProcess', 'districtCollection']),
    getLink(){
      return getCollectionLink(this.currentCollectionTypeCode);
    },
    hasEditPermission(){
      return (this.userInfo?.activeInstitutePermissions?.filter(perm => perm === PERMISSION.DISTRICT_SDC_EDIT).length > 0);
    },
  },
  watch: {
    uploadFileValue() {
      if(this.uploadFileValue){
        this.importFile();
      }
    }
  },
  async created() {
    await this.fireFileProgress();
  },
  beforeUnmount() {
    clearInterval(this.interval);
  },
  methods: {
    ...mapActions(sdcCollectionStore, ['setDistrictCollection']),
    canMoveForward(){
      return this.isStepComplete || this.hasEditPermission;
    },
    closeOverlay(){
      this.isLoadingFiles = !this.isLoadingFiles;
      this.fileUploadList = [];
      this.uploadFileValue = null;
      this.inputKey=0;
    },
    async fireFileProgress(){
      await this.getFileProgress();
    },
    async validateFileExtension(fileJSON) {
      const extension = `.${fileJSON.name.split('.').slice(-1)}`;
      const failMessage = 'File extension for this file is invalid. Extension must be ".ver" or ".std".';

      if(extension && (this.acceptableFileExtensions.find(ext => ext.toUpperCase() === extension.toUpperCase())) !== undefined) {
        return true;
      }

      fileJSON.status = this.fileUploadError;
      fileJSON.error = failMessage;
    },
    next() {
      if(this.isStepComplete || this.districtCollectionObject.sdcDistrictCollectionStatusCode === 'SUBMITTED') {
        this.$emit('next');
      } else {
        this.markStepAsComplete();
      }
    },
    markStepAsComplete(){
      let updateCollection = {
        districtCollection: this.districtCollectionObject,
        status: 'LOADED'
      };
      ApiService.apiAxios.put(`${ApiRoutes.sdc.SDC_DISTRICT_COLLECTION}/${this.$route.params.sdcDistrictCollectionID}`, updateCollection)
        .then(() => {
          this.$emit('next');
        })
        .catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while updating status. Please try again later.');
        });
    },
    async startPollingStatus() {
      this.interval = setInterval(this.getFileProgress, 30000);  // polling the api every 30 seconds
    },
    async validateForm() {
      await this.$nextTick();
      await this.$refs.documentForm.validate();
    },
    handleFileImport() {
      this.populatedSuccessMessage = null;
      this.successfulUploadCount = 0;

      this.$refs.uploader.click();
    },
    async importFile() {
      if (this.uploadFileValue.length > 0) {
        this.isLoadingFiles = true;

        await this.validateForm();

        if (!this.uploadFileValue[0] || !this.validForm) {
          this.inputKey++;
          this.isLoadingFiles = false;
        } else {
          let fileIndex = 0;
          this.filePromises = this.uploadFileValue.map((fileValue) => {
            return new Promise((resolve, reject) => {
              let reader = new FileReader();
              reader.readAsText(fileValue);
              reader.onload = () => {
                let statusJson = {
                  name: fileValue.name,
                  index: fileIndex++,
                  fileContents: reader.result,
                  status: FILE_UPLOAD_STATUS.PENDING,
                  error: null,
                  warning: null
                };
                this.validateFileExtension(statusJson);
                this.fileUploadList.push(statusJson);
                resolve(statusJson);
              };
              reader.onerror = (error) => {
                let statusJson = {
                  name: fileValue.name,
                  index: fileIndex++,
                  fileContents: null,
                  status: FILE_UPLOAD_STATUS.ERROR,
                  error: error,
                  warning: null
                };
                this.fileUploadList.push(statusJson);
                reject(statusJson);
              };
            });
          });

          await Promise.all(this.filePromises);

          for await (const fileJSON of this.fileUploadList) {
            if(fileJSON.error === null){
              await new Promise(resolve => setTimeout(resolve, 3000));
              await this.uploadFile(fileJSON, fileJSON.index);
              this.inputKey++;
            }
          }
          await this.getFileProgress();
          this.uploadFileValue = null;
        }
      }
    },
    async uploadFile(fileJSON, index) {
      let document;
      try{
        document = {
          fileName: getFileNameWithMaxNameLength(this.uploadFileValue[index].name),
          fileContents: btoa(unescape(encodeURIComponent(fileJSON.fileContents)))
        };
        await ApiService.apiAxios.post(ApiRoutes.sdc.BASE_URL + '/district/' + this.sdcDistrictCollectionID + '/file', document)
          .then((response) => {
            this.addFileReportDateWarningIfRequired(response.data.uploadReportDate, fileJSON);
          });
        this.successfulUploadCount += 1;
        fileJSON.status = this.fileUploadSuccess;
      } catch (e) {
        console.error(e);
        fileJSON.error = e.response.data;
        fileJSON.status = this.fileUploadError;
      } 
    },
    addFileReportDateWarningIfRequired(fileDate, fileJSON) {
      let formattedFileDate = LocalDate.parse(fileDate.substring(0,19), DateTimeFormatter.ofPattern('uuuuMMdd'));
      if(formattedFileDate.isBefore(this.collectionOpenDate().minusDays(30))){
        fileJSON.warning = 'The date in this file is ' + formattedFileDate + '. Please ensure that you have uploaded the correct data for this collection before continuing.';
      }
    },
    collectionOpenDate() {
      return LocalDate.parse(this.districtCollectionObject.collectionOpenDate.substring(0,19), DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
    },
    async getFileProgress() {
      try{
        await ApiService.apiAxios.get(ApiRoutes.sdc.SDC_DISTRICT_COLLECTION + '/' + this.sdcDistrictCollectionID + '/fileProgress').then(response => {
          this.schoolCollectionsInProgress = response.data;

          this.sortSchoolsInProgress();

          clearInterval(this.interval);
          this.startPollingStatus();

        });
      } catch (e) {
        clearInterval(this.interval);
        console.error(e);
      } finally {
        this.initialLoad = false;
      }
    },
    sortSchoolsInProgress(){
      this.schoolCollectionsInProgress.sort((a, b) => {
        const dateA = new Date(a.uploadDate);
        const dateB = new Date(b.uploadDate);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;

        return dateB - dateA;
      });
    }
  }
};
</script>

<style scoped>

.border {
  border: 2px solid grey;
  border-radius: 5px;
  padding: 35px;
  margin-bottom: 2em;
}

:deep(.mdi-information){
  color: #003366;
}

.schools-in-progress-header {
  margin-top: 2em;
  margin-bottom: 2em;
  font-weight: bold;
  text-align: center;
  line-height: 1.5;
  font-size: 1rem;
}

.fileUploadError{
  background-color: #d5304a;
  color: white;
  border-radius: 5px;
}

.fileUploadSuccess{
  background-color: rgba(58, 161, 22, 0.88);
  color: white;
  border-radius: 5px;
}

.fileUploadWarning{
  background-color: #f1e786;
  border-radius: 5px;
}

.centered{
  display: flex;
  justify-content: center;
  margin-bottom: 2em;
}

::v-deep .v-theme--myCustomLightTheme.v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) span {
  color: white !important;
}
</style>

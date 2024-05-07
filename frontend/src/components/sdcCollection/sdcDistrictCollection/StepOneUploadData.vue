<template>
  <div v-if="initialLoad">
    <v-row>
      <v-col>
        <Spinner flat/>
      </v-col>
    </v-row>
  </div>
  <div class="border" v-if="fileUploadErrorMessages.length > 0 || fileDateWarningErrorMessages.length > 0 || populatedSuccessMessage != null">
      <v-row v-for="(fileUploadErrorMessage, index) in fileUploadErrorMessages" :key="index">
        <v-col>
          <v-alert
              density="compact"
              variant="tonal"
              type="error"
              :text="fileUploadErrorMessage"
          />
        </v-col>
      </v-row>
      <v-row v-for="(fileDateWarningMessage, index) in fileDateWarningErrorMessages" :key="index">
        <v-col>
          <v-alert
              density="compact"
              type="warning"
              variant="tonal"
              :text="fileDateWarningMessage"
          />

        </v-col>
      </v-row>
    <v-row v-if="populatedSuccessMessage">
      <v-col>
        <v-alert
            density="compact"
            type="success"
            variant="tonal"
            :text="populatedSuccessMessage"
        />
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
            secondary
            icon="mdi-file-upload"
            text="Upload 1701 Submission"
            :loading="isReadingFile"
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
    <v-row class="schools-in-progress-header">Summary of Uploaded Data</v-row>
    <v-data-table
        :headers="headers"
        :items="schoolCollectionsInProgress"
        items-per-page="10"
    >
      <template #item.percentageStudentsProcessed="{ value }">
        <v-icon
        v-if="value === '100'"
        icon="mdi-check-circle-outline"
        color="success"
        />
        <span v-if="value === '0'"> - </span>
        <template v-if="value !== '0' && value !== '100'">
          <v-progress-circular
              :size="15"
              :width="3"
              color="primary"
              indeterminate
          />
          <span class="ml-2">{{value}} %</span>
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
        multiple
    />
  </v-form>
</template>
<script>

import Spinner from "../../common/Spinner.vue";
import PrimaryButton from "../../util/PrimaryButton.vue";
import {sdcCollectionStore} from "../../../store/modules/sdcCollection";
import {getCollectionLink} from "../../../utils/common"
import {getFileNameWithMaxNameLength} from "../../../utils/file";
import {ApiRoutes} from "../../../utils/constants";
import ApiService from "../../../common/apiService";
import alertMixin from "../../../mixins/alertMixin";
import {mapActions, mapState} from "pinia";
import {DateTimeFormatter, LocalDate} from "@js-joda/core";
import {setFailureAlert} from "../../composable/alertComposable";

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
      isReadingFile: false,
      uploadFileValue: null,
      fileInputError: [],
      fileLoaded: false,
      processing: false,
      initialLoad: true,
      interval: null,
      fileUploadErrorMessages: [],
      fileDateWarningErrorMessages: [],
      successfulUploadCount: 0,
      successMessage: " files were successfully uploaded. Files will continue to be processed even if you leave the page.",
      populatedSuccessMessage: null,
      inputKey: 0,
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
    ...mapState(sdcCollectionStore, ['currentCollectionTypeCode','currentStepInCollectionProcess', 'districtCollection']),
    getLink(){
      return getCollectionLink(this.currentCollectionTypeCode)
    }
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
  methods: {
    ...mapActions(sdcCollectionStore, ['setDistrictCollection']),
    async fireFileProgress(){
      await this.getFileProgress();
      this.getFileRules();
    },
    getFileRules() {
      this.fileRules = [
        value => {
          const extension = `.${value[0].name.split('.').slice(-1)}`;
          const failMessage = 'File extension for file ' + value[0].name + ' is invalid. Extension must be ".ver" or ".std".';

          if(extension && (this.acceptableFileExtensions.find(ext => ext.toUpperCase() === extension.toUpperCase())) !== undefined) {
            return true;
          }

          this.fileUploadErrorMessages.push(failMessage);
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
      this.interval = setInterval(this.getFileProgress, 10000);  // polling the api every 10 seconds
    },
    async validateForm() {
      await this.$nextTick();
      await this.$refs.documentForm.validate();
    },
    handleFileImport() {
      this.fileUploadErrorMessages = [];
      this.fileDateWarningErrorMessages = [];
      this.populatedSuccessMessage = null;
      this.successfulUploadCount = 0;

      this.$refs.uploader.click();
    },
    async importFile() {
      if (this.uploadFileValue.length > 0) {
        this.isReadingFile = true;

        await this.validateForm();

        if (!this.uploadFileValue[0] || !this.validForm) {
          this.inputKey++;
          this.isReadingFile = false;
        } else {
          let listOfFileData = [];
          const filePromises = this.uploadFileValue.map((fileValue) => {
            return new Promise((resolve, reject) => {
              let reader = new FileReader();
              reader.readAsText(fileValue);
              reader.onload = () => {
                resolve(reader.result);
              };
              reader.onerror = (error) => {
                reject(error);
              };
            });
          });

          try {
            listOfFileData = await Promise.all(filePromises);
            await this.bulkUploadFile(listOfFileData);
          } catch (error) {
            console.error("Error reading files:", error);
          } finally {
            this.inputKey++;
            this.isReadingFile = false;
            this.isDisabled = false;
          }
        }
      }
    },
    async bulkUploadFile(listOfFilesAsString){

      const uploadPromises = listOfFilesAsString.map(async (fileAsString, index) => {
        await this.uploadFile(fileAsString, index);
        return `Uploaded file: ${fileAsString}`;
      });

      await Promise.all(uploadPromises).then((results) => {
        console.log("Upload results: ", results);
      })

      this.populatedSuccessMessage = this.successfulUploadCount > 0 ? this.successfulUploadCount.toString() + this.successMessage : null;
    },
    async uploadFile(fileAsString, index) {
      let document;
      try{
        document = {
          fileName: getFileNameWithMaxNameLength(this.uploadFileValue[index].name),
          fileContents: btoa(unescape(encodeURIComponent(fileAsString)))
        };
        await ApiService.apiAxios.post(ApiRoutes.sdc.BASE_URL + '/district/' + this.sdcDistrictCollectionID + '/file', document)
            .then((response) => {
              this.addFileReportDateWarning(response.data.uploadReportDate, response.data.uploadFileName);
            })
        this.successfulUploadCount += 1;
        await this.fireFileProgress();
      } catch (e) {
        console.error(e);
        this.fileUploadErrorMessages.push('The file ' + document["fileName"] + ' could not be processed due to the following issue: ' + e.response.data);
      } finally {
        this.isReadingFile = false;
      }
    },
    addFileReportDateWarning(fileDate, fileName) {
      let formattedFileDate = LocalDate.parse(fileDate.substring(0,19), DateTimeFormatter.ofPattern('uuuuMMdd'));
      if(formattedFileDate.isBefore(this.collectionOpenDate().minusDays(30)) || formattedFileDate.isAfter(this.collectionCloseDate().plusDays(30))){
        let message = "The date in the " + fileName + " file is " + formattedFileDate + ". Please ensure that you have uploaded the correct data for this collection before continuing."
        this.fileDateWarningErrorMessages.push(message);
      }
    },
    collectionOpenDate() {
      return LocalDate.parse(this.districtCollectionObject.collectionOpenDate.substring(0,19), DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
    },
    collectionCloseDate() {
      return LocalDate.parse(this.districtCollectionObject.collectionCloseDate.substring(0,19), DateTimeFormatter.ofPattern('uuuu-MM-dd\'T\'HH:mm:ss'));
    },
    async getFileProgress() {
      try{
        await ApiService.apiAxios.get(ApiRoutes.sdc.SDC_DISTRICT_COLLECTION + '/' + this.sdcDistrictCollectionID + '/fileProgress').then(response => {
          this.schoolCollectionsInProgress = response.data;

          this.sortSchoolsInProgress();

          clearInterval(this.interval);
          this.startPollingStatus()

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
      })
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

.centered{
  display: flex;
  justify-content: center;
  margin-bottom: 2em;
}
</style>

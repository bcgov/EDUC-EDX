<template>
  <div v-if="initialLoad">
    <v-row>
      <v-col>
        <Spinner flat/>
      </v-col>
    </v-row>
  </div>
  <div class="border">
      <v-row v-for="fileUploadErrorMessage in fileUploadErrorMessages" >
        <v-col>
          <v-alert
              density="compact"
              variant="tonal"
              type="error"
              :text="fileUploadErrorMessage"
          />
        </v-col>
      </v-row>
      <v-row v-for="fileDateWarningMessage in fileDateWarningErrorMessages">
        <v-col class="mb-3 d-flex justify-center">
          <v-alert
              density="compact"
              type="warning"
              variant="tonal"
              :text="fileDateWarningMessage"
          />

        </v-col>
      </v-row>
      <v-row v-for="fileUploadSuccessMessage in fileUploadSuccessMessages">
        <v-col class="mb-3 d-flex justify-center">
          <v-alert
              density="compact"
              type="success"
              variant="tonal"
              :text="fileUploadSuccessMessage"
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
    <div v-if="schoolCollectionsInProgress.length > 0">
      <span id="schools-in-progress-header">School Collections Currently Being Processed</span>
      <v-container
          v-for="schoolCollectionRecord in schoolCollectionsInProgress"
          :key="schoolCollectionRecord.sdcSchoolCollectionID"
          fluid
      >
        <v-row>
          <v-col
            cols="8">
            <span>{{schoolCollectionRecord.schoolDisplayName}} - {{schoolCollectionRecord.totalProcessed}} of {{schoolCollectionRecord.totalStudents}} students have been processed</span>
          </v-col>
          <v-col
              cols="4"
              class="pt-6"

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
              class="d-flex justify-end pt-0"
          >
            <span>{{ Math.floor(schoolCollectionRecord.totalProcessed/schoolCollectionRecord.totalStudents * 100) }}% complete</span>
          </v-col>
        </v-row>
      </v-container>
    </div>
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

import ConfirmationDialog from "../../util/ConfirmationDialog.vue";
import Spinner from "../../common/Spinner.vue";
import PrimaryButton from "../../util/PrimaryButton.vue";
import {sdcCollectionStore} from "../../../store/modules/sdcCollection";
import {DateTimeFormatter, LocalDate, LocalDateTime, ResolverStyle} from "@js-joda/core";
import {COLLECTIONCODETYPE} from "../../../utils/constants/CollectionCodeType";
import {getFileNameWithMaxNameLength} from "../../../utils/file";
import {ApiRoutes} from "../../../utils/constants";
import ApiService from "../../../common/apiService";
import alertMixin from "../../../mixins/alertMixin";
import {mapActions, mapState} from "pinia";

export default {
  name: 'StepOneUploadData',
  components: {
    ConfirmationDialog,
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
  emits: ['next', 'refresh-store'],
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
      fileUploadSuccessMessages: [],
      inputKey: 0,
      validForm: false,
      sdcDistrictCollectionID: this.$route.params.sdcDistrictCollectionID,
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
    markStepAsComplete() {
      this.$emit('next');
    },
    async startPollingStatus() {
      this.interval = setInterval(this.getFileProgress, 10000);  // polling the api every 10 seconds
    },
    async validateForm() {
      await this.$nextTick();
      await this.$refs.documentForm.validate();
    },
    handleFileImport() {
      this.$refs.uploader.click();
    },
    async importFile() {
      this.fileUploadErrorMessages = [];
      this.fileUploadSuccessMessages = [];
      this.fileDateWarningErrorMessages = [];

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

      Promise.all(uploadPromises).then((results) => {
        console.log("Upload results: ", results);
      })


    },
    async uploadFile(fileAsString, index) {
      let document;
      try{
        document = {
          fileName: getFileNameWithMaxNameLength(this.uploadFileValue[index].name),
          fileContents: btoa(unescape(encodeURIComponent(fileAsString)))
        };
        await ApiService.apiAxios.post(ApiRoutes.sdc.BASE_URL + '/district/' + this.sdcDistrictCollectionID + '/file', document);
        await this.fireFileProgress();
        this.$emit('refresh-store');
        this.fileUploadSuccessMessages.push(document["fileName"] + ' was successfully uploaded');
        console.log("this.fileUploadSuccessMessages", this.fileUploadSuccessMessages)
      } catch (e) {
        console.error(e);
        this.fileUploadErrorMessages.push('The file ' + document["fileName"] + ' could not be processed due to the following issue: ' + e.response.data);
      } finally {
        this.isReadingFile = false;
      }
    },
    async getFileProgress() {
      try{
        await ApiService.apiAxios.get(ApiRoutes.sdc.SDC_DISTRICT_COLLECTION + '/' + this.sdcDistrictCollectionID + '/fileProgress').then(response => {
          this.schoolCollectionsInProgress = response.data;

          clearInterval(this.interval);
          this.startPollingStatus()

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

.border {
  border: 2px solid grey;
  border-radius: 5px;
  padding: 35px;
  margin-bottom: 2em;
}

:deep(.mdi-information){
  color: #003366;
}

#schools-in-progress-header {
  margin-top: 2em;
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

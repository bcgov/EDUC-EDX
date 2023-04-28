<template>
  <v-container
    class="containerSetup"
    fluid
  >
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
        <v-col>
          <v-divider class="divider" />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="d-flex justify-center">
          <v-icon style="margin-top: 0.2em">
            mdi-file
          </v-icon>
          <div
            style="margin-top: 0.3em"
            class="ml-2"
          >
            {{ fileName }}
          </div>
          <v-btn
            id="uploadAgainButton"
            prepend-icon="mdi-file-upload"
            :loading="isReadingFile"
            style="font-size: 16px;"
            color="#1976d2"
            class="ml-16"
            variant="text"
            @click="handleFileImport"
          >
            Upload Replacement File
          </v-btn>
        </v-col>
      </v-row>
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
    <v-row justify="end">
      <PrimaryButton
        id="nextButton"
        class="mr-2 mb-3"
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
        :rules="fileRules"
        :key="inputKey"
        style="display: none"
        v-model="uploadFileValue"
        :accept="acceptableFileExtensions.join(',')"
      />
    </v-form>
  </v-container>
</template>

<script>
import alertMixin from '../../mixins/alertMixin';
import PrimaryButton from '../util/PrimaryButton.vue';
import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import {getFileNameWithMaxNameLength, humanFileSize} from '../../utils/file';
import { mapState } from 'pinia';
import { useSldCollectionStore } from '../../store/modules/sldCollection';
import Spinner from '../common/Spinner.vue';

export default {
  name: 'StepThreeUploadData',
  components: {
    Spinner,
    PrimaryButton
  },
  mixins: [alertMixin],
  props: {
    schoolCollectionObject: {
      type: Object,
      required: true,
      default: null
    }
  },
  emits: ['next'],
  data() {
    return {
      acceptableFileExtensions: ['.std', '.ver'],
      requiredRules: [v => !!v || 'Required'],
      fileRules: [
        value => {
          let ret = !value || !value.length || value[0].size < 10485760 || `File size should not be larger than ${humanFileSize(10485760)}!`;
          if (ret !== true) {
            this.setFailureAlert(ret);
          }
          return ret;
        },
        value => {
          const extension = `.${value[0].name.split('.')[1]}`;
          const failMessage = 'File type invalid.  Files must be ".ver" or ".std".';
          const foundValidExtension = this.acceptableFileExtensions.find(ext => ext === extension);

          if (foundValidExtension !== undefined) return true;
          this.setFailureAlert(failMessage);
          return failMessage;
        }
      ],
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
    ...mapState(useSldCollectionStore, ['currentStepInCollectionProcess']),
  },
  watch: {
    uploadFileValue() {
      if(this.uploadFileValue){
        this.importFile();
      }
    },
  },
  async mounted() {
    await this.fireFileProgress();
  },
  methods: {
    async fireFileProgress(){
      await this.getFileProgress();
      if(this.processing){
        this.startPollingStatus();
      }
    },
    next() {
      if(this.currentStepInCollectionProcess.isComplete) {
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
      ApiService.apiAxios.put(ApiRoutes.sld.BASE_URL + '/' + this.sdcSchoolCollectionID, updateCollection)
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
        await ApiService.apiAxios.post(ApiRoutes.sld.BASE_URL + '/' + this.sdcSchoolCollectionID + '/file', document);
        this.setSuccessAlert('Your document was uploaded successfully.');
        await this.fireFileProgress();
      } catch (e) {
        console.error(e);
        this.fileUploadErrorMessage = 'The file could not be processed due to the following issue: ' + e.response.data;
      } finally {
        this.isReadingFile = false;
      }
    },
    async getFileProgress() {
      try{
        await ApiService.apiAxios.get(ApiRoutes.sld.BASE_URL + '/' + this.sdcSchoolCollectionID + '/file').then(response => {
          this.sdcSchoolProgress = response.data;
          this.totalStudents = this.sdcSchoolProgress.totalStudents;
          this.totalProcessed = this.sdcSchoolProgress.totalProcessed;
          if(!this.sdcSchoolProgress.fileName){
            //Show file upload section
            this.hasFileAttached = false;
            this.fileLoaded = false;
            this.processing = false;
          }else if(this.totalStudents === this.totalProcessed){
            //Show summary
            this.hasFileAttached = true;
            this.fileLoaded = true;
            this.processing = false;
            this.fileName = this.sdcSchoolProgress.fileName;
            this.isDisabled = false;
            clearInterval(this.interval);
            this.isDisabled = false;
          }else{
            //Show in progress
            this.hasFileAttached = true;
            this.fileLoaded = false;
            this.processing = true;
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
 .containerSetup{
    padding-right: 5em !important;
    padding-left: 5em !important;
  }

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

  @media screen and (max-width: 1200px) {
    .containerSetup{
      padding-right: 3em !important;
      padding-left: 3em !important;
    }
  }

  .form-hint{
    color: rgb(56, 89, 138);
    font-size: 14px;
  }
</style>

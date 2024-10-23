<template>
  <v-container 
    class="containerSetup"
    fluid
  >
  <div class="mt-1 mb-1">
      <v-icon
        small
        color="#1976d2"
      >
        mdi-arrow-left
      </v-icon>
      <a
        class="ml-1"
        @click="backButtonClick"
      >Return to GRAD Dashboard</a>
  </div>
    <div v-if="initialLoad">
      <v-row>
        <v-col>
          <Spinner />
        </v-col>
      </v-row>
    </div>
    <div
      class="border"
    >
      <v-row>
        <v-col class="mb-3 d-flex justify-center">
          <h1>Upload Graduation Data Files</h1>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="d-flex justify-space-evenly mt-1">
          <v-btn
            id="uploadButton"
            prepend-icon="mdi-file-upload"
            variant="elevated"
            color="#003366"
            text="Upload Graduation Data Files"
            :loading="isLoadingFiles"
            @click="handleFileImport"
          />
        </v-col>
      </v-row>
      <v-row class="schools-in-progress-header">
        Summary of Uploaded Data
      </v-row>

      <v-data-table
      :headers="headers"
      :items="progressCounts"
      items-per-page="10"
    >
      <template #item.percentageStudentsProcessed="{ item }">
        <v-icon
          v-if="item.percentageStudentsProcessed === '100'"
          icon="mdi-check-circle-outline"
          color="success"
        />
        <span v-if="item.percentageStudentsProcessed === '0'"> 0% </span>
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
      <!-- <PrimaryButton
        id="step-1-next-button-school"
        class="mr-3 ml-3 mb-3"
        icon="mdi-check"
        text="Next"
        :disabled="isDisabled || !canMoveForward()"
        :click-action="next"
      /> -->
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
      <v-card-title>Uploading Files</v-card-title>
      <v-card-text>
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
        <v-row style="overflow-y: auto; max-height:30em">
          <v-col>
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
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-row>
          <v-col class="d-flex justify-end">
            <span class="mr-2 mt-1">{{ inputKey }} of {{ fileUploadList?.length }} Complete</span>
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
    <ConfirmationDialog ref="confirmReplacementFile">
      <template #message>
        <p>Uploading a replacement file will remove all data associated with the existing file you have uploaded.</p>
            &nbsp;
        <p>Once this action is completed <strong>it cannot be undone</strong> and <strong>any fixes to data issues or changes to student data will need to be completed again.</strong></p>
      </template>
    </ConfirmationDialog>
  </v-container>
  </template>
  
  <script>
  import alertMixin from '../../../mixins/alertMixin';
  import ApiService from '../../../common/apiService';
  import {ApiRoutes} from '../../../utils/constants';
  import {getFileNameWithMaxNameLength} from '../../../utils/file';
  import { mapState, mapActions } from 'pinia';
  import { sdcCollectionStore } from '../../../store/modules/sdcCollection';
  import Spinner from '../../common/Spinner.vue';
  import ConfirmationDialog from '../../util/ConfirmationDialog.vue';
  import {authStore} from '../../../store/modules/auth';
  import {FILE_UPLOAD_STATUS} from '../../../utils/constants/FileUploadStatus';
  
  export default {
    name: 'GradUploadDataComponent',
    components: {
      ConfirmationDialog,
      Spinner
    },
    mixins: [alertMixin],
    props: {
      schoolID: {
      type: String,
      required: false,
      default: null
    },
    },
    emits: [],
    data() {
      return {
        acceptableFileExtensions: ['.stdxam', '.stddem', '.stdcrs'],
        requiredRules: [v => !!v || 'Required'],
        uploadFileValue: null,
        hasFileAttached: false,
        fileLoaded: false,
        progress: 0,
        initialLoad: true,
        interval: null,
        inputKey: 0,
        validForm: false,
        isLoadingFiles: false,
        fileUploadPending: FILE_UPLOAD_STATUS.PENDING,
        fileUploadSuccess: FILE_UPLOAD_STATUS.UPLOADED,
        fileUploadError: FILE_UPLOAD_STATUS.ERROR,
        populatedSuccessMessage: null,
        successfulUploadCount: 0,
        fileUploadList: [],
        progressCounts: [],
        headers: [
        {
          title: 'File Name',
          align: 'start',
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
    beforeUnmount() {
      clearInterval(this.interval);
    },
    methods: {
      ...mapActions(sdcCollectionStore, ['setSchoolCollection']),
      async fireFileProgress(){
        await this.getFileProgress();
      },
      closeOverlay(){
      this.isLoadingFiles = !this.isLoadingFiles;
      this.fileUploadList = [];
      this.uploadFileValue = null;
      this.inputKey=0;
    },
     validateFileExtension(fileJSON) {
        const extension = `.${fileJSON.name.split('.').slice(-1)}`;
        const failMessage = 'File extension is invalid. Extension must be ".stddem" or ".stdxam" or ".stdcrs".';
  
        if(extension && (this.acceptableFileExtensions.find(ext => ext.toUpperCase() === extension.toUpperCase())) !== undefined) {
          return true;
        }
        fileJSON.status = this.fileUploadError;
        fileJSON.error = failMessage;
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
        if(this.uploadFileValue.length > 0) {
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
            this.uploadFileValue = null;
            await this.getFileProgress();
          }
        }
      },
      async uploadFile(fileJSON, index) {
        let document;
        try{
          document = {
            fileName: getFileNameWithMaxNameLength(this.uploadFileValue[index].name),
            fileContents: btoa(unescape(encodeURIComponent(fileJSON.fileContents))),
            fileType: this.uploadFileValue[index].name.split('.')[1]
          };
          await ApiService.apiAxios.post(ApiRoutes.gdc.BASE_URL + '/school/' + this.schoolID + '/upload-file', document)
            .then(() => {});
          this.successfulUploadCount += 1;
          fileJSON.status = this.fileUploadSuccess;
        } catch (e) {
          console.error(e);
          fileJSON.error = e.response.data;
          fileJSON.status = this.fileUploadError;
        } 
      },


      async getFileProgress() {
        try{
          await ApiService.apiAxios.get(ApiRoutes.gdc.BASE_URL + '/school/' + this.schoolID + '/file-progress').then(response => {
            if(response?.data?.counts) {
              this.progressCounts = response?.data?.counts;
              clearInterval(this.interval);
              this.startPollingStatus();
            }
            
          });
        } catch (e) {
          clearInterval(this.interval);
          console.error(e);
        } finally {
          this.initialLoad = false;
        }
      },
      backButtonClick() {
        this.$router.push({name: 'graduation', params: {schoolID: this.schoolID}});
      }
    }
  };
  </script>
  
  <style scoped>
  
    .border {
      border: 2px solid grey;
      border-radius: 5px;
      padding: 35px;
      margin: 2em;
    }

    .schools-in-progress-header {
      margin-top: 2em;
      margin-bottom: 2em;
      font-weight: bold;
      text-align: center;
      line-height: 1.5;
      font-size: 1rem;
    }

  
   :deep(.v-btn__content){
     white-space: break-spaces;
   }

   .containerSetup{
    padding-right: 24em !important;
    padding-left: 24em !important;
  }

  @media screen and (max-width: 1950px) {
    .containerSetup{
      padding-right: 20em !important;
      padding-left: 20em !important;
    }
  }

  @media screen and (max-width: 1800px) {
    .containerSetup{
      padding-right: 10em !important;
      padding-left: 10em !important;
    }
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
  
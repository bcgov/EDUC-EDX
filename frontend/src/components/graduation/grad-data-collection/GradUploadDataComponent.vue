<template>
  <v-container 
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
    <div
      class="border"
    >
      <v-row>
        <v-col class="d-flex justify-center">
          <h1>Upload Graduation Data Files</h1>
        </v-col>
      </v-row>
      <v-row class="centered">
        <span class="mr-1">Please click on the link below to select your three GRAD data files (DEM, XAM and CRS) to upload to GRAD for processing.</span>
        <span class="mr-1">All three files must be present in order for the files to be validated and loaded to GRAD.</span>
        <span class="mr-1">Note the status of your files in the Summary of Uploaded Data table below.</span>
      </v-row>
      <v-row>
        <v-col class="d-flex justify-space-evenly mt-n5">
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
      <v-row>
        <v-col cols="12">
          <p class="schools-in-progress-header">
            Summary of Uploaded Data
          </p>
        </v-col>
      </v-row>
      <v-data-table-server
        v-model:page.sync="pageNumber"
        v-model:items-per-page.sync="pageSize"
        :items-length="totalElements"
        :items="filesetList"
        :headers="headers"
        mobile-breakpoint="0"
      >
        <template #item="props">
          <tr>
            <td
              v-for="column in headers"
              :key="column.key"
            >
              <span v-if="column.key === 'errorLink'">
                <a
                  v-if="isFilesetComplete(props.item)"
                  class="ml-1"
                  @click="navigateToErrors(props.item)"
                >View Errors/Warnings</a>
              </span>
              <span v-else-if="column.key === 'demFileUploadDate' || column.key === 'xamFileUploadDate' || column.key === 'crsFileUploadDate'">
                {{ props.item[column.key] ? props.item[column.key].substring(0,19).replaceAll('-', '/').replaceAll('T', ' ') : '-' }}
              </span>
              <div v-else-if="column.key === 'demFileStatusCode' || column.key === 'xamFileStatusCode' || column.key === 'crsFileStatusCode'">
                <div v-if="props.item[column.key] === 'LOADED'">
                  <span v-if="isFilesetInProgress(props.item)">
                    <v-progress-circular
                      :size="20"
                      :width="4"
                      color="primary"
                      indeterminate
                    />
                    Processing
                  </span>
                  <span v-else>
                    <v-icon
                      icon="mdi-clock-alert-outline"
                      color="warning"
                    />
                    Awaiting Other Files
                  </span>
                </div>
                <span v-if="props.item[column.key] === 'NOTLOADED'">
                  <v-icon
                    icon="mdi-alert-circle-outline"
                    color="error"
                  />
                  Not Loaded
                </span>
                <span v-if="props.item[column.key] === 'COMPLETED'">
                  <v-icon
                    icon="mdi-check-circle-outline"
                    color="success"
                  />
                  Processed
                </span>
              </div>
              <span v-else-if="props.item[column.key]">
                {{ props.item[column.key] }}
              </span>
              <span v-else>-</span>
            </td>
          </tr>
        </template>
      </v-data-table-server>
    </div>
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
import { mapState } from 'pinia';
import ConfirmationDialog from '../../util/ConfirmationDialog.vue';
import {authStore} from '../../../store/modules/auth';
import {FILE_UPLOAD_STATUS} from '../../../utils/constants/FileUploadStatus';
import {isEmpty, omitBy} from 'lodash';
  
export default {
  name: 'GradUploadDataComponent',
  components: {
    ConfirmationDialog
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
      acceptableFileExtensions: ['.xam', '.dem', '.crs'],
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
      filesetList: [],
      totalElements: 0,
      pageNumber: 1,
      pageSize: 15,
      isLoading: false,
      filterSearchParams: {
        moreFilters: {}
      },
      headers: [
        {title: 'DEM File Name', key: 'demFileName'},
        {title: 'DEM File Upload Date', key: 'demFileUploadDate'},
        {title: 'DEM File Status', key: 'demFileStatusCode'},
        {title: 'XAM File Name', key: 'xamFileName'},
        {title: 'XAM File Upload Date', key: 'xamFileUploadDate'},
        {title: 'XAM File Status', key: 'xamFileStatusCode'},
        {title: 'CRS File Name', key: 'crsFileName'},
        {title: 'CRS File Upload Date', key: 'crsFileUploadDate'},
        {title: 'CRS File Status', key: 'crsFileStatusCode'},
        {title: 'Errors/Warnings', key: 'errorLink'},
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
    await this.getFilesetPaginated();
  },
  beforeUnmount() {
    clearInterval(this.interval);
  },
  methods: {
    closeOverlay(){
      this.isLoadingFiles = !this.isLoadingFiles;
      this.fileUploadList = [];
      this.uploadFileValue = null;
      this.inputKey=0;
    },
    validateFileExtension(fileJSON) {
      const extension = `.${fileJSON.name.split('.').slice(-1)}`;
      const failMessage = 'File extension is invalid. Extension must be ".dem" or ".xam" or ".crs".';
  
      if(extension && (this.acceptableFileExtensions.find(ext => ext.toUpperCase() === extension.toUpperCase())) !== undefined) {
        return true;
      }
      fileJSON.status = this.fileUploadError;
      fileJSON.error = failMessage;
    },
    async startPollingStatus() {
      this.interval = setInterval(this.getFilesetPaginated, 30000);  // polling the api every 30 seconds
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
    isFilesetInProgress(fileset){
      return fileset.demFileStatusCode === 'LOADED' && fileset.crsFileStatusCode === 'LOADED' && fileset.xamFileStatusCode === 'LOADED';
    },
    isFilesetComplete(fileset){
      return fileset.demFileStatusCode === 'COMPLETED' && fileset.crsFileStatusCode === 'COMPLETED' && fileset.xamFileStatusCode === 'COMPLETED';
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
          await this.getFilesetPaginated();
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
    async getFilesetPaginated() {
      this.isLoading= true;
      ApiService.apiAxios.get(`${ApiRoutes.gdc.BASE_URL}/fileset/${this.$route.params.schoolID}/paginated`, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          searchParams: omitBy(this.filterSearchParams, isEmpty),
          sort: {
            updateDate: 'DESC'
          },
        }
      }).then(response => {
        this.filesetList = response.data.content;
        this.totalElements = response.data.totalElements;
        clearInterval(this.interval);
        this.startPollingStatus();
      }).catch(error => {
        clearInterval(this.interval);
        console.error(error);
        this.setFailureAlert('An error occurred while trying to fileset list. Please try again later.');
      }).finally(() => {
        this.isLoading = false;
      });
    },
    backButtonClick() {
      this.$router.push({name: 'graduation', params: {schoolID: this.schoolID}});
    },
    navigateToErrors(row) {
      this.$router.push({name: 'error', params: {schoolID: this.schoolID, activeIncomingFilesetID: row.incomingFilesetID}});
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
  margin-top: 12px;
  margin-bottom: 1em;
  font-weight: bold;
  text-align: start;
  line-height: 1.5;
  font-size: 1rem;
}

:deep(.v-btn__content){
  white-space: break-spaces;
}

:deep(.v-data-table__thead) {
  color: #7f7f7f;
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

:deep(.v-data-table-footer__items-per-page) {
       display: none;
 }
  </style>
  

<template>
  <v-row>
    <v-col cols="12">
      <v-row justify="space-between">
        <v-col
          cols="4"
          class="found-align"
        >
          <span
            id="studentsFound"
            class="bold"
          >Students Found:  {{ totalElements }}
          </span>
        </v-col>
        <v-col
          cols="8"
          class="d-flex justify-end"
        >
          <v-btn
            v-if="showExportBtn"
            id="export"
            color="#003366"
            text="Export"
            class="mr-2 mb-1"
            prepend-icon="mdi-tray-arrow-down"
            variant="elevated"
            @click="handleExportClick"
          />
          <v-btn
            id="filters"
            color="#003366"
            text="Filter"
            class="mr-1 mb-1"
            prepend-icon="mdi-filter-multiple-outline"
            variant="outlined"
            @click="toggleFilters"
          >
            <template #append>
              <v-badge
                color="error"
                :content="filterCount"
                floating
                offset-y="-10"
              />
            </template>
          </v-btn>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <CustomTable
            :headers="config.tableHeaders"
            :data="studentList"
            :total-elements="totalElements"
            :is-loading="isLoading"
            :reset="resetFlag"
            :disable-select="!isCollectionActive"
            @reload="reload"
            @editSelectedRow="editStudent"
            @selections="selectedStudents = $event"
            @viewHistory="viewHistory"
          />
        </v-col>
      </v-row>
    </v-col>
    <v-navigation-drawer
      v-model="showFilters"
      location="right"
      :temporary="true"
      width="700"
      :persistent="true"
      scrim="transparent"
      :border="true"
      style="top:0; height: 100%;"
      rounded="true"
    >
      <Filters
        :filters="config.allowedFilters"
        :district="district"
        @apply-filters="applyFilters"
        @clear-filters="clearFilters"
        @close="showFilters= !showFilters"
      />
    </v-navigation-drawer>
  </v-row>
  <v-bottom-sheet
    v-model="editStudentSheet"
    :inset="true"
    :no-click-animation="true"
    :scrollable="true"
    :persistent="true"
  >
    <ViewStudentDetailsComponent
      :selected-student-ids="studentForEdit"
      :is-final-sign-off="isFinalSignOff"
      @reload-students="reloadStudentsFlag = true"
      @close="closeAndLoadStudents"
    />
  </v-bottom-sheet>
  <v-bottom-sheet
    v-model="historySheet"
    :inset="true"
    :no-click-animation="true"
    :scrollable="true"
    :persistent="true"
  >
    <StudentHistoryDialog
      v-if="studentForHistory"
      :sdc-school-collection-student-i-d="studentForHistory"
      @close="closeHistory"
    />
  </v-bottom-sheet>
  <v-dialog
    v-model="showExportDialog"
    :max-width="650"
    :persistent="isGeneratingReports"
  >
    <v-card class="ma-auto">
      <v-card-title>
        Export Student Records
      </v-card-title>
      <v-card-actions class="pa-4">
        <v-btn
          color="#003366"
          variant="elevated"
          style="white-space: pre-wrap;"
          @click="downloadStudentReport"
        >
          All Students with no Errors
        </v-btn>
        <v-btn
          color="#003366"
          variant="elevated"
          style="white-space: pre-wrap;"
          @click="downloadStudentWithErrorsReport"
        >
          All Students with Data Issues
        </v-btn>
        <v-btn
          v-if="isDistrict036"
          color="#003366"
          variant="elevated"
          style="white-space: pre-wrap;"
          @click="toggleDistrictReports"
        >
          All District Reports Package
          <v-icon right>
            {{ showDistrictReportsSection ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
          </v-icon>
        </v-btn>
      </v-card-actions>

      <!-- District Reports Section - Expands Below -->
      <v-card-text v-if="showDistrictReportsSection">
        <v-divider class="mb-4" />
        <div v-if="!isGeneratingReports && !isComplete">
          <v-alert
            color="#003366"
            variant="tonal"
            prominent
            class="mb-4"
          >
            <div class="text-subtitle-1 font-weight-bold mb-2">
              All District Reports Package
            </div>
            <div class="text-body-2">
              This will generate and download a complete package of all district reports including:
            </div>
            <ul class="text-body-2 mt-2 ml-4">
              <li>Grade enrollment headcounts for all schools</li>
              <li>Program headcounts (Career, French, Indigenous, ELL, Special Education)</li>
              <li>District-level summary reports</li>
              <li>Per-school headcount comparisons</li>
            </ul>
            <div class="text-body-2 mt-2">
              All reports will be packaged into a single ZIP file organized by school.
            </div>
          </v-alert>

          <div class="d-flex justify-end gap-2">
            <v-btn
              variant="outlined"
              @click="showDistrictReportsSection = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="#003366"
              variant="elevated"
              @click="confirmAndStartGeneration"
            >
              Generate Reports
            </v-btn>
          </div>
        </div>

        <!-- Generation in Progress -->
        <div v-if="isGeneratingReports && !isComplete">
          <v-alert
            color="#003366"
            variant="tonal"
            prominent
            class="mb-4"
          >
            <div class="text-subtitle-1 font-weight-bold">
              Generating All District Reports...
            </div>
            <div class="text-caption mt-1">
              Please wait while reports are being generated. This may take several minutes.
            </div>
          </v-alert>

          <v-row
            class="mb-3"
            dense
          >
            <v-col cols="4">
              <v-card
                outlined
                class="text-center pa-3"
              >
                <div class="text-overline text-grey">
                  Schools
                </div>
                <div
                  class="text-h5"
                  style="color: #003366;"
                >
                  {{ schoolsProcessed }}
                </div>
              </v-card>
            </v-col>
            <v-col cols="4">
              <v-card
                outlined
                class="text-center pa-3"
              >
                <div class="text-overline text-grey">
                  Reports
                </div>
                <div
                  class="text-h5"
                  style="color: #003366;"
                >
                  {{ reportsGenerated }}
                </div>
              </v-card>
            </v-col>
            <v-col cols="4">
              <v-card
                outlined
                class="text-center pa-3"
              >
                <div class="text-overline text-grey">
                  Files
                </div>
                <div
                  class="text-h5"
                  style="color: #003366;"
                >
                  {{ filesReceived }}
                </div>
              </v-card>
            </v-col>
          </v-row>

          <v-alert
            v-if="currentReportMessage"
            color="#003366"
            density="compact"
            variant="tonal"
            class="mb-3"
          >
            <div class="text-caption">
              {{ currentReportMessage }}
            </div>
          </v-alert>

          <v-alert
            v-if="reportError"
            color="error"
            density="compact"
            dismissible
            class="mb-3"
            @click:close="reportError = null"
          >
            {{ reportError }}
          </v-alert>

          <div class="d-flex justify-end">
            <v-btn
              color="error"
              variant="outlined"
              @click="cancelReportGeneration"
            >
              Cancel
            </v-btn>
          </div>
        </div>

        <!-- Generation Complete -->
        <div v-if="isComplete">
          <v-alert
            color="success"
            variant="tonal"
            prominent
            class="mb-4"
          >
            <div class="text-subtitle-1 font-weight-bold">
              Generation Complete
            </div>
            <div class="text-caption mt-1">
              Your district reports package is ready. Click the button below to download the ZIP file (approximately {{ estimatedSizeMB }} MB).
            </div>
          </v-alert>

          <v-row
            class="mb-3"
            dense
          >
            <v-col cols="4">
              <v-card
                outlined
                class="text-center pa-3"
              >
                <div class="text-overline text-grey">
                  Schools
                </div>
                <div
                  class="text-h5"
                  style="color: #003366;"
                >
                  {{ schoolsProcessed }}
                </div>
              </v-card>
            </v-col>
            <v-col cols="4">
              <v-card
                outlined
                class="text-center pa-3"
              >
                <div class="text-overline text-grey">
                  Reports
                </div>
                <div
                  class="text-h5"
                  style="color: #003366;"
                >
                  {{ reportsGenerated }}
                </div>
              </v-card>
            </v-col>
            <v-col cols="4">
              <v-card
                outlined
                class="text-center pa-3"
              >
                <div class="text-overline text-grey">
                  Files
                </div>
                <div
                  class="text-h5"
                  style="color: #003366;"
                >
                  {{ filesReceived }}
                </div>
              </v-card>
            </v-col>
          </v-row>

          <div class="d-flex justify-end gap-2">
            <v-btn
              variant="outlined"
              :disabled="isPreparingZip"
              @click="closeDistrictReportsSection"
            >
              Close
            </v-btn>
            <v-btn
              color="#003366"
              variant="elevated"
              :loading="isPreparingZip"
              :disabled="isPreparingZip"
              @click="downloadReportsZip"
            >
              <v-icon
                v-if="!isPreparingZip"
                left
              >
                mdi-download
              </v-icon>
              {{ isPreparingZip ? 'Preparing ZIP...' : `Download ZIP (Approx ${estimatedSizeMB} MB)` }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import alertMixin from '../../../../mixins/alertMixin';
import CustomTable from '../../common/SDCCustomTable.vue';
import {
  downloadStudentOnlyReportURL,
  downloadStudentErrorsReportURL,
  downloadStudentProgramReportURL
} from '../../../../utils/common';
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';
import {cloneDeep, isEmpty, omitBy} from 'lodash';
import {sdcCollectionStore} from '../../../../store/modules/sdcCollection';
import ViewStudentDetailsComponent from '../../../common/ViewStudentDetailsComponent.vue';
import Filters from '../../../common/Filters.vue';
import {mapState} from 'pinia';
import StudentHistoryDialog from '../../common/StudentHistoryDialog.vue';
import JSZip from 'jszip';

export default {
  name: 'DetailComponent',
  components: {
    StudentHistoryDialog,
    Filters,
    CustomTable,
    ViewStudentDetailsComponent
  },
  mixins: [alertMixin],
  beforeRouteLeave(to, from, next) {
    if (this.isGeneratingReports && !this.isComplete) {
      const answer = window.confirm(
        'District reports are still being generated. Leaving this page will cancel the generation. Do you want to continue?'
      );
      if (answer) {
        if (this.abortController) {
          this.abortController.abort();
        }
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  },
  props: {
    config: {
      tabFilter: Object,
      required: true,
      type: Object,
      default: null
    },
    district: {
      type: Object,
      required: true,
      default: null
    },
    showExportBtn: {
      type: Boolean,
      default: false
    },
    exportType: {
      type: String,
      required: false,
      default: 'all-students'
    },
    isFinalSignOff: {
      type: Boolean,
      required: false
    },
    isCollectionActive: {
      type: Boolean,
      required: true,
      default: false
    },
    deletedStudentsOnly: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  emits: [],
  data() {
    return {
      chip: true,
      pageNumber: 1,
      pageSize: 15,
      showExportDialog: false,
      studentList: [],
      isLoading: false,
      totalElements: 0,
      selectedStudents: [],
      filterSearchParams: this.deletedStudentsOnly === true ? {
        tabFilter: this.config.defaultFilter,
        sdcSchoolCollectionStudentStatusCode: 'DELETED',
        moreFilters: {}
      } : {
        tabFilter: this.config.defaultFilter,
        notSdcSchoolCollectionStudentStatusCode: 'ERROR,DELETED',
        moreFilters: {}
      },
      showFilters: null,
      studentForEdit: [],
      editStudentSheet: false,
      resetFlag: false,
      reloadStudentsFlag: false,
      historySheet: false,
      studentForHistory: null,
      // District reports streaming
      showDistrictReportsSection: false,
      isGeneratingReports: false,
      isComplete: false,
      isPreparingZip: false,
      schoolsProcessed: 0,
      reportsGenerated: 0,
      filesReceived: 0,
      currentReportMessage: '',
      reportError: null,
      zip: null,
      districtNumber: '',
      abortController: null
    };
  },
  computed: {
    ...mapState(sdcCollectionStore, ['schoolCollection','schoolFundingCodesMap', 'enrolledProgramCodesMap', 'careerProgramCodesMap', 'bandCodesMap', 'specialEducationCodesMap']),
    filterCount() {
      let filters = Object.values(this.filterSearchParams.moreFilters).filter(filter => !!filter).reduce((total, filter) => total.concat(filter), []);
      return new Set(filters.map(filter => filter.title)).size;
    },
    estimatedSizeMB() {
      return (this.filesReceived * 0.2).toFixed(1);
    },
    collectionId() {
      return this.$route?.params?.sdcDistrictCollectionID;
    },
    isDistrict036() {
      return this.district?.districtNumber === '036';
    }
  },
  watch: {
    showExportDialog(newVal) {
      if (!newVal) {
        this.showDistrictReportsSection = false;
        this.isGeneratingReports = false;
        this.isComplete = false;
        this.isPreparingZip = false;
        this.schoolsProcessed = 0;
        this.reportsGenerated = 0;
        this.filesReceived = 0;
        this.currentReportMessage = '';
        this.reportError = null;
        this.zip = null;
        this.districtNumber = '';
        if (this.abortController) {
          this.abortController.abort();
          this.abortController = null;
        }
      }
    }
  },
  created() {
    sdcCollectionStore().getCodes().then(() => {
      this.loadStudents();
    });
  },
  mounted() {
    // for report streaming
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  },
  beforeUnmount() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload);

    // Cancel any ongoing report generation when component unmounts
    if (this.abortController && this.isGeneratingReports) {
      this.abortController.abort();
    }
  },

  methods: {
    handleBeforeUnload(event) {
      if (this.isGeneratingReports && !this.isComplete) {
        event.preventDefault();
        event.returnValue = 'District reports are still being generated. Are you sure you want to leave?';
        if (this.abortController) {
          this.abortController.abort();
        }
        return event.returnValue;
      }
    },
    handleExportClick() {
      if (this.exportType === 'all-students') {
        this.showExportDialog = true;
      } else {
        this.downloadStudentProgramReport();
      }
    },
    closeAndLoadStudents() {
      this.editStudentSheet = !this.editStudentSheet;
      if (this.reloadStudentsFlag === true) {
        this.loadStudents();
      }
      this.reloadStudentsFlag = false;
    },
    viewHistory($event) {
      const selectedStudent = cloneDeep($event);
      this.studentForHistory = selectedStudent?.sdcSchoolCollectionStudentID;
      this.historySheet = true;
    },
    closeHistory() {
      this.historySheet = false;
      this.studentForHistory = null;
    },
    downloadStudentProgramReport(){
      const routeData = this.$router.resolve({path: downloadStudentProgramReportURL(this.$route, this.exportType)});
      window.open(routeData.href, '_blank');
      this.showExportDialog = false;
    },
    downloadStudentReport(){
      const routeData = this.$router.resolve({path: downloadStudentOnlyReportURL(this.$route)});
      window.open(routeData.href, '_blank');
      this.showExportDialog = false;
    },
    downloadStudentWithErrorsReport(){
      const routeData = this.$router.resolve({path: downloadStudentErrorsReportURL(this.$route)});
      window.open(routeData.href, '_blank');
      this.showExportDialog = false;
    },
    editStudent($event) {
      const selectedStudent = cloneDeep($event);
      this.studentForEdit.splice(0);
      this.studentForEdit.push(selectedStudent?.sdcSchoolCollectionStudentID);
      this.editStudentSheet = true;
    },
    applyFilters($event) {
      this.filterSearchParams.moreFilters = cloneDeep($event);
      this.loadStudents();
    },
    clearFilters() {
      this.filterSearchParams.moreFilters = {};
      this.loadStudents();
    },
    loadStudents() {
      this.isLoading= true;
      ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_DISTRICT_COLLECTION}/${this.$route.params.sdcDistrictCollectionID}/paginated?tableFormat=true`, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          searchParams: omitBy(this.filterSearchParams, isEmpty)
        }
      }).then(response => {
        this.studentList = response.data.content;
        this.totalElements = response.data.totalElements;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while trying to retrieve students list. Please try again later.');
      }).finally(() => {
        this.isLoading = false;
      });
    },
    toggleFilters() {
      this.showFilters= !this.showFilters;
    },
    reload(value) {
      if(value?.pageSize) {
        this.pageSize = value?.pageSize;
      } else if(value?.pageNumber) {
        this.pageNumber = value?.pageNumber;
      }
      this.loadStudents();
    },
    // District Reports Streaming Methods
    toggleDistrictReports() {
      this.showDistrictReportsSection = !this.showDistrictReportsSection;
    },
    closeDistrictReportsSection() {
      this.showDistrictReportsSection = false;
    },
    confirmAndStartGeneration() {
      this.startDistrictReportsGeneration();
    },
    async startDistrictReportsGeneration() {
      // Double-check district 036 restriction
      if (!this.isDistrict036) {
        this.reportError = 'This feature is currently only available for district 036';
        this.setFailureAlert('This feature is currently only available for district 036');
        return;
      }

      this.isGeneratingReports = true;
      this.isComplete = false;
      this.schoolsProcessed = 0;
      this.reportsGenerated = 0;
      this.filesReceived = 0;
      this.currentReportMessage = 'Starting generation...';
      this.reportError = null;

      this.zip = new JSZip();
      this.abortController = new AbortController();

      try {
        const collectionId = this.collectionId;

        if (!collectionId) {
          throw new Error('Unable to find collection ID in route.');
        }

        const url = `${ApiRoutes.sdc.SDC_DISTRICT_COLLECTION}/${collectionId}/streamAllReports`;

        const response = await fetch(url, {
          method: 'GET',
          signal: this.abortController.signal
        });

        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage += ` - ${JSON.stringify(errorData)}`;
          }

          throw new Error(errorMessage);
        }

        await this.processNDJSONStream(response.body);

      } catch (err) {
        if (err.name === 'AbortError') {
          this.reportError = 'Generation cancelled';
          this.currentReportMessage = 'Cancelled by user';
        } else if (err.name === 'TypeError') {
          console.error('Network error:', err);
          this.reportError = 'Network error. Please check your connection.';
        } else {
          console.error('Generation error:', err);
          this.reportError = `Failed: ${err.message}`;
        }
        this.isGeneratingReports = false;
      }
    },
    async processNDJSONStream(stream) {
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let done = false;

      while (!done) {
        const result = await reader.read();
        done = result.done;
        const value = result.value;

        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop();

          for (const line of lines) {
            if (line.trim()) {
              try {
                const message = JSON.parse(line);
                await this.handleReportMessage(message);
              } catch (e) {
                console.error('Error parsing message:', line, e);
              }
            }
          }
        }
      }

      if (buffer.trim()) {
        try {
          const message = JSON.parse(buffer);
          await this.handleReportMessage(message);
        } catch (e) {
          console.error('Error parsing final message:', e);
        }
      }
    },
    async handleReportMessage(message) {
      switch (message.type) {
      case 'start':
        this.districtNumber = message.districtNumber;
        this.currentReportMessage = `Starting generation for district ${message.districtNumber}...`;
        break;

      case 'file': {
        const fileData = this.base64ToBytes(message.data);
        this.zip.file(message.path, fileData);
        this.filesReceived++;
        this.currentReportMessage = `Received: ${message.filename}`;
        break;
      }

      case 'progress':
        this.schoolsProcessed = message.schoolsProcessed || this.schoolsProcessed;
        this.reportsGenerated = message.reportsGenerated || this.reportsGenerated;
        this.currentReportMessage = message.message;
        break;

      case 'complete':
        this.schoolsProcessed = message.schoolsProcessed;
        this.reportsGenerated = message.reportsGenerated;
        this.currentReportMessage = 'Generation complete! Click below to download.';
        this.isGeneratingReports = false;
        this.isComplete = true;
        this.setSuccessAlert('All district reports generated successfully!');
        break;

      case 'error':
        console.error('Server error:', message.message);
        if (message.fatal) {
          throw new Error(message.message);
        }
        break;

      case 'warning':
        console.warn('Server warning:', message.message);
        break;
      }
    },
    base64ToBytes(base64) {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    },
    async downloadReportsZip() {
      if (!this.zip) return;

      this.isPreparingZip = true;

      try {
        //  date as YYYY-MM-DD
        const today = new Date();
        const dateStr = today.getFullYear() + '-' +
                       String(today.getMonth() + 1).padStart(2, '0') + '-' +
                       String(today.getDate()).padStart(2, '0');
        const filename = `District_${this.districtNumber}_Reports_${dateStr}.zip`;

        const blob = await this.zip.generateAsync({
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 }
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        this.setSuccessAlert('ZIP file downloaded successfully!');

        // Keep modal open - user can download again or close manually
      } catch (err) {
        this.reportError = `Failed to create ZIP: ${err.message}`;
        console.error('ZIP generation error:', err);
      } finally {
        this.isPreparingZip = false;
      }
    },
    cancelReportGeneration() {
      if (this.abortController) {
        this.abortController.abort();
        this.isGeneratingReports = false;
        this.isComplete = false;
        this.currentReportMessage = 'Generation cancelled by user';
        this.reportError = null;
        this.setWarningAlert('District reports generation was cancelled');
      }
    }
  }
};
</script>

<style scoped>
.search-box {
  background: rgb(235, 237, 239);
  border-radius: 8px;
  padding: 10px;
}

.filter-col {
  color: #7f7f7f;
}

.bold {
  font-weight: bold ;
}

.found-align {
  align-self: flex-end;
}

.export {
  margin-left: 1px;
  color: #003366;
}
</style>

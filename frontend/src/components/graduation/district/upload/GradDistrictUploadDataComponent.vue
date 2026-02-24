<template>
  <v-container 
    fluid
  >
    <div v-if="isSummerPeriod && hasRequiredPermission('GRAD_DIS_UPLOAD')">
      <v-row>
        <v-col cols="12">
          <v-alert
            density="compact"
            type="info"
            variant="tonal"
          >
            There are two options for submitting data during the <a
              target="_blank"
              href="https://www2.gov.bc.ca/gov/content/education-training/k-12/administration/program-management/assessment/graduation/trax-updates"
            >Summer Reporting Period</a>. Review the options below and select the most appropriate method for your school.<br><br>
            Data Submission Error Reports are available after an upload completes. Please review and reconcile the Error Report after each submission. Student graduation status and GRAD System reports (transcript, TVRs, etc.) are available after overnight processing.
          </v-alert>
        </v-col>
      </v-row>
      <v-row class="mt-4">
        <v-col cols="5">
          <v-row>
            <v-col>
              <h3>Option 1 - Manually enter data for Summer Course Completions</h3>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn
                id="uploadButton"
                prepend-icon="mdi-file-upload"
                variant="elevated"
                color="#003366"
                text="Upload Summer School Marks"
                :loading="isLoadingFiles"
                @click="handleFileImportXLS"
              />
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col class="mt-1">
              <span style="font-size: small; color: gray">.XLSX files accepted</span>
            </v-col>
          </v-row>
          <v-row
            class="mt-4"
            no-gutters
          >
            <v-col>
              <v-alert
                density="compact"
                type="info"
                variant="text"
                text="Manual data should only be reported for students completing courses in July and August and not returning to the BC school system in September."
              />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="2">
          <v-row>
            <v-col class="d-flex justify-center">
              <v-divider
                thickness="2"
                vertical
                class="divider"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col class="d-flex justify-center">
              <span>OR</span>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="d-flex justify-center">
              <v-divider
                thickness="2"
                vertical
                class="divider"
              />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="5">
          <v-row>
            <v-col cols="8">
              <h3>Option 2 - Upload Graduation Data Files</h3>
            </v-col>
            <v-col class="d-flex justify-end">
              <v-menu
                location="bottom"
              >
                <template #activator="{ props }">
                  <a
                    class="mt-n1 mr-1"
                    style="font-weight: bold"
                    v-bind="props"
                    @click="toggleMoreInfoTooltip"
                  >...</a>
                  <a
                    v-bind="props"
                    @click="toggleMoreInfoTooltip"
                  >
                    More Info
                  </a>
                </template>
                <v-card
                  style="max-width: 30em;"
                  border="sm"
                  class="pa-2"
                >
                  <div style="font-weight: bold">
                    Data Processing
                  </div>
                  <div>Before graduation data can be processed, all three files must be uploaded. Any unprocessed files will be deleted after 3 hours.</div>
                  <div class="mt-4">
                    Once all errors have been resolved, data will be loaded to the GRAD system for further processing.
                  </div>
                  <div
                    style="font-weight: bold"
                    class="mt-4"
                  >
                    File Formats
                  </div>
                  <div>
                    For more information on the required file formats, see the <a
                      target="_blank"
                      href="https://www2.gov.bc.ca/assets/gov/education/administration/kindergarten-to-grade-12/exams/grad_data_transfer_specifications.pdf"
                    >Graduation Data File Specification</a>.
                  </div>
                  <div class="mt-4">
                    For Summer Reporting file specifications see, <a
                      target="_blank"
                      href="https://www2.gov.bc.ca/gov/content/education-training/k-12/administration/program-management/assessment/graduation/trax-updates"
                    >Summer School Marks Reporting</a>.
                  </div>
                  <div
                    style="font-weight: bold"
                    class="mt-4"
                  >
                    Reporting Mode
                  </div>
                  <div>
                    For more information, see "Replace or Append Course Status" in the <a
                      target="_blank"
                      href="https://www2.gov.bc.ca/assets/gov/education/administration/kindergarten-to-grade-12/exams/grad_data_transfer_specifications.pdf"
                    >Graduation Data File Specification</a>. Note all graduated students are on "Append Mode".
                  </div>
                  <div
                    style="font-weight: bold"
                    class="mt-4"
                  >
                    Data Corrections
                  </div>
                  <div>
                    To make a correction to data outside of the data file uploads, submit a <a
                      target="_blank"
                      href="https://forms.gov.bc.ca/education-training/grad-change-form"
                    >GRAD Change Form</a>
                  </div>
                </v-card>
              </v-menu>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn
                id="uploadButton"
                prepend-icon="mdi-file-upload"
                variant="outlined"
                color="#003366"
                text="Upload Graduation Data Files"
                :loading="isLoadingFiles"
                @click="showUploadConfirmationDialog = !showUploadConfirmationDialog"
              />
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col class="mt-1">
              <span style="font-size: small; color: gray">.DEM, .CRS, and .XAM files accepted</span>
            </v-col>
          </v-row>
          <v-row
            class="mt-4"
            no-gutters
          >
            <v-col>
              <v-alert
                density="compact"
                type="warning"
                icon="mdi-alert"
                variant="text"
                :text="'Only submit data for students who are part of the ' + currentYear + '/' + nextYear + ' reporting cycle. If reporting students in the ' + nextYear + '/' + yearAfterNext + ' school year, wait until the new reporting period opens in October.'"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </div>
    <div v-else-if="hasRequiredPermission('GRAD_DIS_UPLOAD')">
      <v-row v-if="isBeforeSummerSchoolPeriod">
        <v-col cols="12">
          <v-alert
            density="compact"
            type="info"
            variant="tonal"
          >
            Uploads are unavailable, as the School Year Reporting Period is complete. The Summer Reporting Period will open on {{ summerPeriodStart }}.
          </v-alert>
        </v-col>
      </v-row>
      <v-row v-else-if="isBetweenSummerSchoolPeriod">
        <v-col cols="12">
          <v-alert
            density="compact"
            type="info"
            variant="tonal"
          >
            Uploads are unavailable, as the Summer Reporting Period is complete. The next School Reporting Period will begin in October.
          </v-alert>
        </v-col>
      </v-row>
      <v-row v-else>
        <v-col cols="12">
          <v-alert
            density="compact"
            type="info"
            variant="tonal"
          >
            Data Submission Error Reports are available after an upload completes. Please review and reconcile the Error Report after each submission. Student graduation status and GRAD System reports (transcript, TVRs, etc.) are available after overnight processing.
          </v-alert>
        </v-col>
      </v-row>
      <v-row class="mt-1">
        <v-col>
          <v-btn
            id="uploadButton"
            prepend-icon="mdi-file-upload"
            variant="elevated"
            color="#003366"
            text="Upload Graduation Data Files"
            :loading="isLoadingFiles"
            :disabled="isBeforeSummerSchoolPeriod || isBetweenSummerSchoolPeriod"
            @click="handleFileImport"
          />
        </v-col>
        <v-col class="d-flex justify-end">
          <v-menu
            location="bottom"
          >
            <template #activator="{ props }">
              <a
                class="mt-n1 mr-1"
                style="font-weight: bold"
                v-bind="props"
                @click="toggleMoreInfoTooltip"
              >...</a>
              <a
                v-bind="props"
                @click="toggleMoreInfoTooltip"
              >
                More Info
              </a>
            </template>
            <v-card
              style="max-width: 30em;"
              border="sm"
              class="pa-2"
            >
              <div style="font-weight: bold">
                Data Processing
              </div>
              <div>Before graduation data can be processed, all three files must be uploaded. Any unprocessed files will be deleted after 3 hours.</div>
              <div class="mt-4">
                Once all errors have been resolved, data will be loaded to the GRAD system for further processing.
              </div>
              <div
                style="font-weight: bold"
                class="mt-4"
              >
                File Formats
              </div>
              <div>
                For more information on the required file formats, see the <a
                  target="_blank"
                  href="https://www2.gov.bc.ca/assets/gov/education/administration/kindergarten-to-grade-12/exams/grad_data_transfer_specifications.pdf"
                >Graduation Data File Specification</a>.
              </div>
              <div
                style="font-weight: bold"
                class="mt-4"
              >
                Reporting Mode
              </div>
              <div>
                For more information, see "Replace or Append Course Status" in the <a
                  target="_blank"
                  href="https://www2.gov.bc.ca/assets/gov/education/administration/kindergarten-to-grade-12/exams/grad_data_transfer_specifications.pdf"
                >Graduation Data File Specification</a>. Note all graduated students are on "Append Mode".
              </div>
              <div
                style="font-weight: bold"
                class="mt-4"
              >
                Data Corrections
              </div>
              <div>
                To make a correction to data outside of the data file uploads, submit a <a
                  target="_blank"
                  href="https://forms.gov.bc.ca/education-training/grad-change-form"
                >GRAD Change Form</a>
              </div>
            </v-card>
          </v-menu>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col class="mt-2">
          <span style="font-size: small; color: gray">.DEM, .CRS, and .XAM files accepted</span>
        </v-col>
      </v-row>
    </div>
    <v-row class="mt-5">
      <v-col
        cols="6"
        class="pb-0 d-flex justify-start"
      >
        <p class="schools-in-progress-header mb-0">
          Summary of Uploaded Data
        </p>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        class="mt-n2"
        cols="4"
      >
        <GradSchoolCodeNameFilter
          v-model="gradSchoolCodeNameFilter"
          :district-i-d="districtID"
          :collection-object="collectionObject"
          @search="searchButtonClick"
        />
      </v-col>
    </v-row>
    <v-row
      v-if="totalElements > 0"
      class="mt-5 mb-1"
    >
      <v-col
        cols="6"
        class="pb-0 d-flex justify-start"
      >
        <p class="schools-in-progress-header mb-0">
          Processing
        </p>
      </v-col>
    </v-row>
    <v-data-table-server
      v-if="totalElements > 0"
      v-model:page.sync="pageNumber"
      v-model:items-per-page.sync="pageSize"
      :items-length="totalElements"
      :items="filesetList"
      :headers="headers"
      mobile-breakpoint="0"
      @update:page="getFilesetPaginated"
    >
      <template #item="props">
        <tr :style="{background: isFilesetComplete(props.item) ? 'white' : 'lightgoldenrodyellow'}">
          <td
            v-for="column in headers"
            :key="column.key"
          >
            <span v-if="column.key === 'errorLink'">
              <a
                v-if="isFilesetComplete(props.item)"
                class="ml-1"
                @click="navigateToErrors(props.item)"
              >View Report</a>
            </span>
            <span v-else-if="column.key ==='alert'">
              <span v-if="props.item.filesetStatusCode === 'COMPLETED'">
                <v-tooltip text="Files processed. Error report available.">
                  <template #activator="{ props: tooltipProps }">
                    <v-icon
                      icon="mdi-check-circle-outline"
                      v-bind="tooltipProps"
                      color="success"
                    />
                  </template>
                </v-tooltip>
              </span>
              <span v-else-if="isFilesetInProgress(props.item)">
                <v-tooltip text="Your files are in the processing queue. The number indicates your position. Processing will begin automatically — you don't need to stay on this screen.">
                  <template #activator="{ props: tooltipProps }">
                    <v-progress-circular
                      :width="4"
                      color="primary"
                      v-bind="tooltipProps"
                      indeterminate
                    >
                      <span style="color: rgb(0, 51, 102);">{{ props.item.positionInQueue ==='0' ? '' : props.item.positionInQueue }}</span>
                    </v-progress-circular>
                  </template>
                </v-tooltip>
              </span>
              <span v-else>
                <v-tooltip text="Missing files. Upload missing files to continue processing.">
                  <template #activator="{ props: tooltipProps }">
                    <v-icon
                      icon="mdi-clock-alert-outline"
                      v-bind="tooltipProps"
                      color="warning"
                    />
                  </template>
                </v-tooltip>
              </span>
            </span>
            <span v-else-if="column.key === 'updateDate'">
              {{ props.item[column.key] ? props.item[column.key].substring(0,19).replaceAll('-', '/').replaceAll('T', ' ') : '-' }}
            </span>
            <span v-else-if="props.item[column.key]">
              {{ props.item[column.key] }}
            </span>
            <span v-else>-</span>
          </td>
        </tr>
      </template>
    </v-data-table-server>
    <v-row class="mt-0 mb-1">
      <v-col
        cols="6"
        class="pb-0 d-flex justify-start"
      >
        <p class="schools-in-progress-header mb-0">
          Processed Files
        </p>
      </v-col>
    </v-row>
    <v-data-table-server
      v-model:page.sync="pageNumberFinal"
      v-model:items-per-page.sync="pageSizeFinal"
      :items-length="totalElementsFinal"
      :items="finalFilesetList"
      :headers="headersFinal"
      mobile-breakpoint="0"
      @update:page="getFinalFilesetPaginated"
    >
      <template #item="props">
        <tr :style="{background: isFilesetComplete(props.item) ? 'white' : 'lightgoldenrodyellow'}">
          <td
            v-for="column in headersFinal"
            :key="column.key"
          >
            <span v-if="column.key === 'errorLink'">
              <a
                v-if="isFilesetComplete(props.item)"
                class="ml-1"
                @click="navigateToErrors(props.item)"
              >View Report</a>
            </span>
            <span v-else-if="column.key ==='alert'">
              <span v-if="props.item.filesetStatusCode === 'COMPLETED'">
                <v-tooltip text="Files processed. Error report available.">
                  <template #activator="{ props: tooltipProps }">
                    <v-icon
                      icon="mdi-check-circle-outline"
                      v-bind="tooltipProps"
                      color="success"
                    />
                  </template>
                </v-tooltip>
              </span>
              <span v-else-if="isFilesetInProgress(props.item)">
                <v-tooltip text="Your files are in the processing queue. The number indicates your position. Processing will begin automatically — you don't need to stay on this screen.">
                  <template #activator="{ props: tooltipProps }">
                    <v-progress-circular
                      :width="4"
                      color="primary"
                      v-bind="tooltipProps"
                      indeterminate
                    >
                      <span style="color: rgb(0, 51, 102);">{{ props.item.positionInQueue ==='0' ? '' : props.item.positionInQueue }}</span>
                    </v-progress-circular>
                  </template>
                </v-tooltip>
              </span>
              <span v-else>
                <v-tooltip text="Missing files. Upload missing files to continue processing.">
                  <template #activator="{ props: tooltipProps }">
                    <v-icon
                      icon="mdi-clock-alert-outline"
                      v-bind="tooltipProps"
                      color="warning"
                    />
                  </template>
                </v-tooltip>
              </span>
            </span>
            <span v-else-if="column.key === 'updateDate'">
              {{ props.item[column.key] ? props.item[column.key].substring(0,19).replaceAll('-', '/').replaceAll('T', ' ') : '-' }}
            </span>
            <span v-else-if="props.item[column.key]">
              {{ props.item[column.key] }}
            </span>
            <span v-else>-</span>
          </td>
        </tr>
      </template>
    </v-data-table-server>
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
      <v-file-input
        id="selectXLSFileInput"
        ref="uploaderXLS"
        :key="inputKeyXLS"
        v-model="uploadFileValueXLS"
        style="display: none"
        :accept="acceptableXLSFileExtensions.join(',')"
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
                v-for="file in fileUploadList"
                :key="file.name"
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
                    v-else-if="file.status === fileUploadSuccessPENMissing && file.warning === null && file.error === null"
                    class="mt-1 mx-1 fileUploadSuccess"
                  >
                    <v-col cols="1">
                      <v-icon
                        icon="mdi-file-document"
                      />
                    </v-col>
                    <v-col>
                      <span><b>{{ file.name }}</b> - Upload Successful</span>
                      <div style="font-style: italic">
                        {{ file.message }}
                      </div>
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
                    <v-col cols="9">
                      <span><b>{{ file.name }}</b> - {{ file.error }}</span>
                    </v-col>
                    <v-col
                      cols="2"
                      class="d-flex justify-end"
                    >
                      <ClipboardButton
                        id="copyErrorButton"
                        :copy-text="file.error"
                        icon="mdi-content-copy"
                        foreground-style="color: #38598A"
                        background-color="white"
                      />
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
              <span
                v-if="isXlsUpload"
                class="mr-2 mt-1"
              >{{ inputKeyXLS }} of {{ fileUploadList?.length }} Complete</span>
              <span
                v-else
                class="mr-2 mt-1"
              >{{ inputKey }} of {{ fileUploadList?.length }} Complete</span>

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
    <ConfirmationDialog ref="confirmIncorrectDatesFile">
      <template #message>
        <p>Are you submitting the correct files? All reported course session dates are from one month ago or earlier.</p>
        &nbsp;
        <p>Would you like to continue with this submission?</p>
      </template>
    </ConfirmationDialog>
    <div v-if="disableScreen">
      <v-overlay
        :model-value="disableScreen"
        activator="parent"
        class="align-center justify-center"
        :persistent="true"
      >
        <v-row>
          <v-col>
            <v-alert
              density="compact"
              type="warning"
              title="File Re-uploaded!"
              :text="wsNotificationText"
              class="pb-5 pt-5"
            />
          </v-col>
        </v-row>
      </v-overlay>
    </div>
  </v-container>
  <v-dialog
    v-model="showUploadConfirmationDialog"
    :max-width="700"
  >
    <v-card class="ma-auto">
      <v-card-title style="background-color: #003366; color: white">
        Confirm Upload of Graduation Data Files
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col>
            <span>Are you sure you should be reporting data in the summer? Please confirm the details below before proceeding with your upload.</span>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-checkbox
              v-model="uploadConfirmCheck"
              color="#003366"
              style="opacity: 1.0"
              :label="'I am reporting data for the ' + currentYear + '/' + nextYear + ' cycle'"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn
          color="#003366"
          variant="outlined"
          style="white-space: pre-wrap;"
          text="Wait until the next reporting cycle"
          @click="showUploadConfirmationDialog = !showUploadConfirmationDialog"
        />
        <v-btn
          color="#003366"
          variant="elevated"
          style="white-space: pre-wrap;"
          text="Continue with upload"
          :disabled="!uploadConfirmCheck"
          @click="openFileDialogAfterConfirm"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
  <PreviewStudentsDialog ref="previewDialog" />
</template>
  
<script>
import alertMixin from '../../../../mixins/alertMixin';
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';
import {getFileNameWithMaxNameLength} from '../../../../utils/file';
import { mapState } from 'pinia';
import ConfirmationDialog from '../../../util/ConfirmationDialog.vue';
import {authStore} from '../../../../store/modules/auth';
import {FILE_UPLOAD_STATUS} from '../../../../utils/constants/FileUploadStatus';
import {isEmpty, omitBy} from 'lodash';
import {wsNotifications} from '../../../../store/modules/wsNotifications';
import {appStore} from '../../../../store/modules/app';
import GradSchoolCodeNameFilter from '../../GradSchoolCodeNameFilter.vue';
import {LocalDateTime} from '@js-joda/core';
import ClipboardButton from '../../../util/ClipboardButton.vue';
import PreviewStudentsDialog from '../../PreviewStudentsDialog.vue';
import {formatDate} from '../../../../utils/format';

export default {
  name: 'GradDistrictUploadDataComponent',
  components: {
    ClipboardButton,
    GradSchoolCodeNameFilter,
    ConfirmationDialog,
    PreviewStudentsDialog
  },
  mixins: [alertMixin],
  props: {
    districtID: {
      type: String,
      required: false,
      default: null
    },
    collectionObject: {
      type: Object,
      required: false,
      default: null
    }
  },
  emits: [],
  data() {
    return {
      acceptableFileExtensions: ['.xam', '.dem', '.crs'],
      acceptableXLSFileExtensions: ['.xlsx'],
      requiredRules: [v => !!v || 'Required'],
      uploadFileValue: null,
      hasFileAttached: false,
      fileLoaded: false,
      progress: 0,
      initialLoad: true,
      interval: null,
      intervalFinal: null,
      inputKey: 0,
      uploadConfirmCheck: false,
      showUploadConfirmationDialog: false,
      inputKeyXLS: 0,
      validForm: false,
      isLoadingFiles: false,
      fileUploadPending: FILE_UPLOAD_STATUS.PENDING,
      fileUploadSuccess: FILE_UPLOAD_STATUS.UPLOADED,
      fileUploadSuccessPENMissing: FILE_UPLOAD_STATUS.UPLOADED_WITH_MISSING_PENS,
      fileUploadError: FILE_UPLOAD_STATUS.ERROR,
      populatedSuccessMessage: null,
      successfulUploadCount: 0,
      successfulUploadCountXLS: 0,
      fileUploadList: [],
      progressCounts: [],
      filesetList: [],
      finalFilesetList: [],
      totalElements: 0,
      totalElementsFinal: 0,
      currentYear: null,
      yearAfterNext: null,
      nextYear: null,
      isSummerPeriod: false,
      isBeforeSummerSchoolPeriod: false,
      isBetweenSummerSchoolPeriod: false,
      summerPeriodStart: '',
      pageNumber: 1,
      pageSize: 5,
      pageNumberFinal: 1,
      pageSizeFinal: 10,
      isLoading: false,
      uploadFileValueXLS: null,
      filterSearchParams: {
        moreFilters: {}
      },
      headers: [
        {key: 'alert', sortable: false},
        {title: 'School Name', key: 'schoolName', sortable: false},
        {title: 'DEM File', key: 'demFileName', sortable: false},
        {title: 'XAM File', key: 'xamFileName', sortable: false},
        {title: 'CRS File', key: 'crsFileName', sortable: false},
        {title: 'Upload Date', key: 'updateDate', sortable: false},
        {title: 'Upload User', key: 'updateUser', sortable: false}
      ],
      headersFinal: [
        {key: 'alert', sortable: false},
        {title: 'School Name', key: 'schoolName', sortable: false},
        {title: 'DEM File', key: 'demFileName', sortable: false},
        {title: 'XAM File', key: 'xamFileName', sortable: false},
        {title: 'CRS File', key: 'crsFileName', sortable: false},
        {title: 'Upload Date', key: 'updateDate', sortable: false},
        {title: 'Upload User', key: 'updateUser', sortable: false},
        {title: 'Errors/Warnings', key: 'errorLink', sortable: false},
      ],
      activeSchoolsCacheMap: null,
      disableScreen: false,
      wsNotificationText: '',
      gradSchoolCodeNameFilter: null,
      headerSearchParams: {
        schoolNumber: '',
        status: '',
        category: '',
        type: ''
      },
      previewUploadedStudents: false,
      summerHeaders:
      [ 
        {title :'School Code', key: 'schoolCode'},
        {title :'PEN', key: 'pen'},
        {title :'Legal Surname', key: 'legalSurname'},
        {title :'Legal Middle Name', key: 'legalMiddleName'},
        {title :'Legal Given First Name', key: 'legalFirstName'},
        {title :'Birthdate', key: 'dob'},
        {title :'Ministry Course Code', key: 'courseCode'},
        {title :'Ministry Course Level', key: 'courseLevel'},
        {title :'Session Date', key: 'sessionDate'},
        {title :'Final %', key: 'finalPercent'},
        {title :'Final Letter Grade', key: 'finalLetterGrade'},
        {title :'Number of Credits', key: 'noOfCredits'}
      ],
      summerStudents:[],
      isXlsUpload: false
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['activeSchoolsMap', 'schoolsMap']),
    ...mapState(wsNotifications, ['notification']),
  },
  watch: {
    uploadFileValue() {
      if(this.uploadFileValue){
        this.importFile();
      }
    },
    uploadFileValueXLS() {
      if(this.uploadFileValueXLS){
        this.isXlsUpload = !this.isXlsUpload;
        this.importFileXLS();
      }
    },
    notification(notificationData) {
      if (notificationData) {
        try {
          let updateUser = notificationData.updateUser.split('/');
          if (notificationData.eventType === 'GDC_FILE_UPLOAD_EVENT' && notificationData.districtID === this.$route.params.districtID && updateUser[1] !== this.userInfo.edxUserID) {
            let school = this.activeSchoolsCacheMap.get(notificationData?.schoolID);
            this.wsNotificationText = `Another user triggered file upload for school: ${school?.mincode} - ${school?.schoolName}. Please refresh your screen and try again.`;
            this.disableScreen = true;
          }
        } catch (e) {
          console.error(e);
        }
      }
    },
  },
  async created() {
    await this.getFinalFilesetPaginated();
    await this.getFilesetPaginated();
    appStore().getInstitutesData().finally(() => {
      this.activeSchoolsCacheMap = this.activeSchoolsMap;
    });
    this.getActiveReportingDates();
  },
  beforeUnmount() {
    clearInterval(this.interval);
    clearInterval(this.intervalFinal);
  },
  methods: {
    openFileDialogAfterConfirm(){
      this.showUploadConfirmationDialog = false;
      this.handleFileImport();
    },
    closeOverlay(){
      this.isLoadingFiles = !this.isLoadingFiles;
      this.fileUploadList = [];
      this.uploadFileValue = null;
      this.inputKey=0;
      this.inputKeyXLS=0;
      this.isXlsUpload = false;
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
    validateFileExtensionXLS(fileJSON) {
      const extension = `.${fileJSON.name.split('.').slice(-1)}`;
      const failMessage = 'File extension is invalid. Extension must be ".xlsx".';

      if(extension && (this.acceptableXLSFileExtensions.find(ext => ext.toUpperCase() === extension.toUpperCase())) !== undefined) {
        return true;
      }
      fileJSON.status = this.fileUploadError;
      fileJSON.error = failMessage;
    },
    async startPollingStatus() {
      this.interval = setInterval(this.getFinalFilesetPaginated, 180000);  // polling the api every 3 mins
      this.intervalFinal = setInterval(this.getFilesetPaginated, 180000);  
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
    handleFileImportXLS() {
      this.populatedSuccessMessage = null;
      this.successfulUploadCountXLS = 0;
      this.$refs.uploaderXLS.click();
    },
    formatDate,
    isFilesetInProgress(fileset){
      return fileset.demFileName != null && fileset.crsFileName != null && fileset.xamFileName != null;
    },
    isFilesetComplete(fileset){
      return fileset.filesetStatusCode === 'COMPLETED';
    },
    getActiveReportingDates() {
      ApiService.apiAxios.get(ApiRoutes.gdc.ACTIVE_REPORTING_PERIODS)
        .then(response => {
          this.activeReportingPeriod = response.data;
          let reportingPeriodStart = LocalDateTime.parse(this.activeReportingPeriod.periodStart);
          this.currentYear = reportingPeriodStart.year();
          this.nextYear = reportingPeriodStart.plusYears(1).year();
          this.yearAfterNext = reportingPeriodStart.plusYears(2).year();
          this.setPeriodFlags();
        });
    },
    setPeriodFlags(){
      const summerPeriodStart = LocalDateTime.parse(this.collectionObject.summerStart);
      const summerPeriodEnd = LocalDateTime.parse(this.collectionObject.summerEnd);
      const schoolPeriodStart = LocalDateTime.parse(this.collectionObject.schYrStart);
      const schoolPeriodEnd = LocalDateTime.parse(this.collectionObject.schYrEnd);

      this.summerPeriodStart = formatDate(summerPeriodStart.toString().substring(0, 10),'uuuu-MM-dd', 'uuuu/MM/dd');
      const today = LocalDateTime.now();

      this.isSummerPeriod = today.isAfter(summerPeriodStart) && today.isBefore(summerPeriodEnd);
      this.isBetweenSummerSchoolPeriod = (today.isBefore(schoolPeriodStart) && today.isBefore(summerPeriodStart)) || (today.isAfter(summerPeriodEnd) && today.isAfter(schoolPeriodEnd));
      this.isBeforeSummerSchoolPeriod = today.isAfter(schoolPeriodEnd) && today.isBefore(summerPeriodStart);
    },
    async importFileXLS() {
      if(this.uploadFileValueXLS.length > 0) {
        this.isLoadingFiles = true;

        await this.validateForm();
        if (!this.uploadFileValueXLS[0] || !this.validForm) {
          this.inputKeyXLS++;
          this.isLoadingFiles = false;
        } else {
          this.filePromises = this.uploadFileValueXLS.map((fileValue) => {
            return new Promise((resolve, reject) => {
              let reader = new FileReader();
              reader.readAsBinaryString(fileValue);
              reader.onload = () => {
                let statusJson = {
                  name: fileValue.name,
                  fileContents: reader.result,
                  status: FILE_UPLOAD_STATUS.PENDING,
                  error: null,
                  warning: null
                };
                this.validateFileExtensionXLS(statusJson);
                this.fileUploadList.push(statusJson);
                resolve(statusJson);
              };
              reader.onerror = (error) => {
                let statusJson = {
                  name: fileValue.name,
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
              await this.uploadFileXLS(fileJSON);
              this.inputKeyXLS++;
            }
          }
          this.uploadFileValueXLS = null;
          await this.getFilesetPaginated();
        }
      }
    },
    async uploadFileXLS(fileJSON) {
      let document;
      try{
        document = {
          fileName: getFileNameWithMaxNameLength(fileJSON.name),
          fileContents: btoa(fileJSON.fileContents),
          fileType: fileJSON.name.split('.')[1]
        };
        await ApiService.apiAxios.post(ApiRoutes.gdc.BASE_URL + '/district/' + this.districtID + '/upload-file-xls', document)
          .then(response => {
            let detail = {
              fileName: document.fileName,
              data: response.data.summerStudents
            };
            this.summerStudents.push(detail);
            this.successfulUploadCountXLS += 1;
          });
        const previewDialog = await this.$refs.previewDialog.open(this.summerHeaders, this.summerStudents, this.districtID, null, {color: '#fff', closeIcon: false, subtitle: false, dark: false});
        if (!previewDialog) {
          this.summerStudents = [];
          fileJSON.error = 'Upload cancelled by the user';
          fileJSON.status = 'Abandoned';
        } else {
          fileJSON.status = this.fileUploadSuccess;
        }
      } catch (e) {
        console.error(e);
        fileJSON.error = e.response.data;
        fileJSON.status = this.fileUploadError;
      }
    },
    async importFile() {
      if(this.uploadFileValue.length > 0) {
        this.isLoadingFiles = true;
  
        await this.validateForm();
        if (!this.uploadFileValue[0] || !this.validForm) {
          this.inputKey++;
          this.isLoadingFiles = false;
        } else {
          this.filePromises = this.uploadFileValue.map((fileValue) => {
            return new Promise((resolve, reject) => {
              let reader = new FileReader();
              reader.readAsText(fileValue);
              reader.onload = () => {
                let statusJson = {
                  name: fileValue.name,
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
              await this.uploadFile(fileJSON);
              this.inputKey++;
            }
          }
          this.uploadFileValue = null;
          await this.getFilesetPaginated();
        }
      }
    },
    async uploadFile(fileJSON) {
      let document;
      try{
        document = {
          fileName: getFileNameWithMaxNameLength(fileJSON.name),
          fileContents: btoa(unescape(encodeURIComponent(fileJSON.fileContents))),
          fileType: fileJSON.name.split('.')[1]
        };
        await ApiService.apiAxios.post(ApiRoutes.gdc.BASE_URL + '/district/' + this.districtID + '/upload-file', document)
          .then(response => {
            if(response.data.numberOfMissingPENs > 0){
              fileJSON.status = this.fileUploadSuccessPENMissing;
              fileJSON.message = 'Please note, ' + response.data.numberOfMissingPENs + ' record(s) were not loaded due to missing PENs';
            }else{
              fileJSON.status = this.fileUploadSuccess;
            }
            this.successfulUploadCount += 1;
          });
      } catch (e) {
        if(e?.message.includes('428')){
          const confirmation = await this.$refs.confirmIncorrectDatesFile.open('Confirm File ' + fileJSON.name, null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Yes', rejectText: 'No'});
          if (!confirmation) {
            fileJSON.error = 'Abandoned';
            fileJSON.status = this.fileUploadError;
            return;
          }
          try {
            await ApiService.apiAxios.post(ApiRoutes.gdc.BASE_URL + '/district/' + this.districtID + '/upload-file?fileOverride=true', document)
              .then(response => {
                if(response.data.numberOfMissingPENs > 0){
                  fileJSON.status = this.fileUploadSuccessPENMissing;
                  fileJSON.message = 'Please note, ' + response.data.numberOfMissingPENs + ' record(s) were not loaded due to missing PENs';
                }else{
                  fileJSON.status = this.fileUploadSuccess;
                }
                this.successfulUploadCount += 1;
              });
          }catch (e2) {
            console.error(e);
            fileJSON.error = 'Error occurred during upload, please try again later.';
            fileJSON.status = this.fileUploadError;
          }
        }else{
          console.error(e);
          fileJSON.error = e.response.data;
          fileJSON.status = this.fileUploadError;
        }
      } 
    },
    async getFilesetPaginated() {
      this.isLoading= true;
      this.filterSearchParams.collectionObject = this.collectionObject;
      ApiService.apiAxios.get(`${ApiRoutes.gdc.BASE_URL}/fileset/district/${this.districtID}/paginated`, {
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
        this.clearAllIntervals();
        this.startPollingStatus();
      }).catch(error => {
        this.clearAllIntervals();
        console.error(error);
        this.setFailureAlert('An error occurred while trying to get fileset list. Please try again later.');
      }).finally(() => {
        this.isLoading = false;
      });
    },
    clearAllIntervals(){
      clearInterval(this.interval);
      clearInterval(this.intervalFinal);
    },
    async getFinalFilesetPaginated() {
      this.isLoading= true;
      this.filterSearchParams.collectionObject = this.collectionObject;
      ApiService.apiAxios.get(`${ApiRoutes.gdc.BASE_URL}/fileset/district/${this.districtID}/paginated/final`, {
        params: {
          pageNumber: this.pageNumberFinal - 1,
          pageSize: this.pageSizeFinal,
          searchParams: omitBy(this.filterSearchParams, isEmpty),
          sort: {
            updateDate: 'DESC'
          },
        }
      }).then(response => {
        this.finalFilesetList = response.data.content;
        this.totalElementsFinal = response.data.totalElements;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while trying to get final fileset list. Please try again later.');
      }).finally(() => {
        this.isLoading = false;
      });
    },
    hasRequiredPermission(permission){
      return (this.userInfo?.activeInstitutePermissions?.filter(perm => perm === permission).length > 0);
    },
    navigateToErrors(row) {
      const routeData = this.$router.resolve({name: 'grad-gdc-error-report', params: {instituteIdentifierID: this.districtID, activeIncomingFilesetID: row.incomingFilesetID},  query: { schoolID: row.schoolID}});
      window.open(routeData.href, '_blank');
    },
    searchButtonClick() {
      if(this.gradSchoolCodeNameFilter !== null && this.gradSchoolCodeNameFilter!== '') {
        this.headerSearchParams.schoolID = this.gradSchoolCodeNameFilter;
      }else{
        this.headerSearchParams.schoolID = '';
      }
      this.filterSearchParams.schoolID = this.headerSearchParams.schoolID;
      this.getFilesetPaginated();
      this.getFinalFilesetPaginated();
    },
  }
};
</script>
  
<style scoped>
.schools-in-progress-header {
  margin-top: 12px;
  margin-bottom: 1em;
  font-weight: bold;
  text-align: start;
  line-height: 1.5;
  font-size: 1rem;
  color: #38598AFF;
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

:deep(div > div > div.v-input__control > div > label){
  opacity: 1.0;
}

.divider {
  height: 4rem;
}

:deep(.v-data-table-footer__items-per-page) {
       display: none;
 }
  </style>
  

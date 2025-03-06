<template>
  <v-container fluid>
    <div class="mt-1 mb-1">
      <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
      <button type="button" class="link-style ml-1" @click="backButtonClick">Return to GRAD Dashboard</button>
    </div>

    <div class="border">
      <h3>Student Transcripts</h3>
      <div class="sub-category-group mt-2">
        <h4 class="mt-8">Individual Student Transcript Preview by PEN</h4>
        <p>Preview a student's transcript. For school use only. Official transcripts must be ordered by students through the StudentTranscripts Service.</p>
        <v-form class="d-flex" id="transcriptForm" v-model="studentPENTranscriptIsValid">
          <v-col cols="2">
            <v-text-field
                id="studentPENTranscriptField"
                v-model="studentPENTranscript"
                placeholder="Enter PEN"
                :rules="penRules"
                variant="underlined"
                ref="transcriptField"
            />
          </v-col>
          <v-col cols="2" class="pt-6">
            <PrimaryButton
                id="searchPENTranscriptBtn"
                text="Search"
                :disabled="!studentPENTranscriptIsValid"
                :click-action="() => searchStudentForGivenPEN(true)"
            />
          </v-col>
        </v-form>
        <h4 class="mt-8">Individual Student XML Previews by PEN</h4>
        <p>A user-friendly preview of what is currently available to a Post-Secondary institution that has been authorized by a student to receive transcript updates via XML data transfer.</p>
        <v-form class="d-flex" v-model="studentPENXMLIsValid">
          <v-col cols="2">
            <v-text-field
                id="studentPENXMLField"
                v-model="studentPENXML"
                placeholder="Enter PEN"
                :rules="penRules"
                variant="underlined"
                ref="xmlField"
            />
          </v-col>
          <v-col cols="2" class="pt-6">
            <PrimaryButton
                id="searchPENXMLBtn"
                text="Search"
                :disabled="!studentPENXMLIsValid"
                :click-action="() => searchStudentForGivenPEN(false)"
            />
          </v-col>
        </v-form>
      </div>

      <h3 class="mt-8">Graduation Summary Reports ({{ currentStartMoYr }} to {{ currentEndMoYr }})</h3>
      <p>Daily, cumulative lists of students in the current cycle, either graduated or not yet graduated, based on the latest information submitted by the school.</p>
      <div class="sub-category-group">
        <ul>
          <li>
            <button type="button" class="link-style" @click="downloadSummaryReport('graduated')">
              Graduated Students
              <span class="icon-container ml-1">
                <i class="mdi mdi-tray-arrow-down"></i>
              </span>
            </button>
          </li>
          <li>
            <button type="button" class="link-style" @click="downloadSummaryReport('nonGraduated')">
              Not Yet Graduated Students
              <span class="icon-container ml-1">
                <i class="mdi mdi-tray-arrow-down"></i>
              </span>
            </button>
          </li>
        </ul>
      </div>

      <h3> Historical Graduation Summary Reports ({{ histStartMoYr }} to {{ histEndMoYr }})</h3>
      <p>Lists of students in previous cycles, either graduated or not yet graduated, based on the final information submitted by the school during the cycle.</p>
      <div class="sub-category-group">
        <ul>
          <li>
            <button type="button" class="link-style" @click="downloadSummaryReport('historicalGraduated')">
              Graduated Students
              <span class="icon-container ml-1">
                <i class="mdi mdi-tray-arrow-down"></i>
              </span>
            </button>
          </li>
          <li>
            <button type="button" class="link-style" @click="downloadSummaryReport('historicalNongraduated')">
              Not Yet Graduated Students
              <span class="icon-container ml-1">
                <i class="mdi mdi-tray-arrow-down"></i>
              </span>
            </button>
          </li>
        </ul>
      </div>
    </div>
    <PENSearchDialog
        v-model="showPENSearchDialog"
        :student="studentForSearch"
        :download-type="studentDownloadType"
        @close="close"
    />
  </v-container>
</template>

<script>
import {generateGradStartAndEndDateStrings, getFormattedDate} from "../../../../utils/common";
import {isValidPEN} from "../../../../utils/validation";
import alertMixin from "../../../../mixins/alertMixin";
import PrimaryButton from "../../../util/PrimaryButton.vue";
import PENSearchDialog from "../../PENSearchDialog.vue";
import ApiService from "../../../../common/apiService";
import {ApiRoutes, MINISTRY_NAME} from "../../../../utils/constants";
import { appStore } from "../../../../store/modules/app";
import { mapState, mapActions } from "pinia";
import {authStore} from "../../../../store/modules/auth";

export default {
  name: 'GradReportsAndTranscripts',
  components: {
    PrimaryButton,
    PENSearchDialog
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
      isLoading: false,
      currentStartMoYr: '',
      currentEndMoYr: '',
      histStartMoYr: '',
      histEndMoYr: '',
      showPENSearchDialog: false,
      studentForSearch: {},
      studentDownloadType: '',
      studentPENTranscript: null,
      studentPENTranscriptIsValid: false,
      studentPENXML: null,
      studentPENXMLIsValid: false,
      summaryDownloadType:'',
      penRules: [v => !!v || 'Required', v => (!v || isValidPEN(v) || 'Invalid PEN')],
      isSearchingStudent: false,
    };
  },
  computed: {
    ...mapState(appStore, ['alertNotificationQueue', 'alertNotification', 'activeSchoolsMap']),
    ...mapState(authStore, ['userInfo']),
    docTypeFilename() {
      switch (this.summaryDownloadType) {
        case 'graduated': return 'GraduatedSummary';
        case 'nonGraduated': return 'NotGraduatedSummary';
        case 'historicalGraduated': return 'HistoricalGraduatedSummary';
        case 'historicalNongraduated': return 'HistoricalNotGraduatedSummary'
        default: return '';
      }
    },
    docTypeName(){
      switch (this.summaryDownloadType) {
        case 'graduated': return 'Graduated Students Summary';
        case 'nonGraduated': return 'Not Yet Graduated Students Summary';
        case 'historicalGraduated': return 'Historical Graduated Students Summary';
        case 'historicalNongraduated': return 'Historical Not Yet Graduated Students Summary'
        default: return '';
      }
    }
  },
  methods: {
    ...mapActions(appStore, ['addAlertNotification']),

    backButtonClick() {
      this.$router.push({ name: 'graduation', params: { instituteIdentifierID: this.schoolID } });
    },
    populateDateRanges() {
      let datesList = generateGradStartAndEndDateStrings();
      this.currentStartMoYr = datesList.shift();
      this.currentEndMoYr = datesList.shift();
      this.histStartMoYr = datesList.shift();
      this.histEndMoYr = datesList.shift();
    },
    searchStudentForGivenPEN(isTranscriptRequest) {
      this.isSearchingStudent = true;
      this.studentForSearch = {};
      this.studentDownloadType = '';

      ApiService.apiAxios.get(ApiRoutes.studentRequest.SEARCH_URL + "search-grad-pen", {
        params: {
          pen: isTranscriptRequest ? this.studentPENTranscript : this.studentPENXML
        }
      })
          .then(response => {
            this.studentDownloadType = isTranscriptRequest ? "transcript" : "xml";
            this.studentForSearch = this.populateStudentInfo(response.data);
            this.showPENSearchDialog = true;
          })
          .catch(error => {
            if (error?.response?.data?.message) {
              this.setFailureAlert(error.response.data.message);
            } else {
              this.setFailureAlert(`PEN must be a valid PEN associated with a student at the ${MINISTRY_NAME}`);
            }
          }).finally(() => {
        this.isSearchingStudent = false;
      });
    },
    populateStudentInfo(data) {
      let student = {};
      student['pen'] = data.pen;
      student['studentID'] = data.studentID;
      student['fullName'] = data.firstName + ' ' + (data.middleName ?? '') + ' ' + data.lastName;
      student['localID'] = data.localID;
      student['gender'] = data.gender;
      student['dob'] = data.doB;
      return student;
    },
    async downloadSummaryReport(reportType){
      this.isLoading = true;
      this.summaryDownloadType = reportType;
      const schoolID = this.userInfo.activeInstituteIdentifier;
      const url = `${ApiRoutes.gradReports.BASE_URL}/school/${schoolID}/summary`;

      try {
        const response = await ApiService.apiAxios.get(url, {
          params: {
            docType: this.summaryDownloadType
          },
          responseType: 'blob'
        });

        const contentDisposition = response.headers['content-disposition'];
        const schoolMincode = this.activeSchoolsMap.get(schoolID)?.mincode

        let filename = `${schoolMincode}_${this.docTypeFilename}_${getFormattedDate()}`;
        if (contentDisposition) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(contentDisposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }
        filename = filename.replace(/\s/g, '');

        const blob = response.data;
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);

        let successMsg = `${this.docTypeName} downloaded for school.`
        this.setSuccessAlert(successMsg);

      } catch (error) {
        console.error("Error downloading file:", error);
        let errorMsg;

        if(error.code === "ERR_BAD_REQUEST"){
          errorMsg = `${this.docTypeName} not found for school`;
        } else {
          errorMsg = "Error encountered while attempting to retrieve document"
        }

        this.setFailureAlert(errorMsg);

      } finally {
        this.isLoading = false;
      }

    },
    close() {
      this.showPENSearchDialog = false;
      this.studentForSearch = {};
      this.studentPENXML = null;
      this.studentPENTranscript = null;

      this.$refs.transcriptField.reset();
      this.$refs.xmlField.reset();
    },
  },
  async created() {
    this.populateDateRanges();
  },
};
</script>

<style scoped>

.border {
  border: 2px solid grey;
  border-radius: 5px;
  padding: 35px;
  margin: 2em;
}

:deep(.v-btn__content){
  white-space: break-spaces;
}

h3 {
  color: #38598a;
}

button {
  color: #1976d2;
}

.sub-category-group {
  padding-left: 2em;
}

v-text-field{
  width: 4em;
}

ul {
  list-style-type: none;
  padding-top: 1em;
  padding-bottom: 2em;
}

li {
  padding-top: 1em;
}

p {
  padding-top: 1em;
  font-style: italic;
}

i {
  font-size: 1.25em;
}

.link-style {
  display: inline-flex;
  align-items: center;
}

::v-deep .v-theme--myCustomLightTheme.v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) span {
  color: white !important;
}
</style>
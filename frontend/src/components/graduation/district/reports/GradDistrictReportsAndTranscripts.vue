<template>
  <v-container fluid>
    <div class="mt-1 mb-1">
      <v-icon
        small
        color="#1976d2"
      >
        mdi-arrow-left
      </v-icon>
      <button
        type="button"
        class="link-style ml-1"
        @click="backButtonClick"
      >
        Return to GRAD Dashboard
      </button>
    </div>

    <div class="border">
      <h3>District Level Reports</h3>
      <div class="sub-category-group mt-2">
        <button
          type="button"
          class="link-style"
          @click="downloadYearEndReport()"
        >
          Year-End District Credential and Transcript Distribution Reports
          <span class="icon-container ml-1">
            <i class="mdi mdi-tray-arrow-down" />
          </span>
        </button>
      </div>
      <h3 class="mt-8">
        Student Transcripts
      </h3>
      <div class="sub-category-group mt-2">
        <h4 class="mt-8">
          Individual Student Transcript Preview by PEN
        </h4>
        <p>Preview a student's transcript. For school use only. Official transcripts must be ordered by students through the StudentTranscripts Service.</p>
        <v-form
          id="transcriptForm"
          v-model="studentPENTranscriptIsValid"
          class="d-flex"
        >
          <v-col cols="2">
            <v-text-field
              id="studentPENTranscriptField"
              ref="transcriptField"
              v-model="studentPENTranscript"
              placeholder="Enter PEN"
              :rules="penRules"
              variant="underlined"
            />
          </v-col>
          <v-col
            cols="2"
            class="pt-6"
          >
            <PrimaryButton
              id="searchPENTranscriptBtn"
              text="Search"
              :disabled="!studentPENTranscriptIsValid"
              :click-action="() => searchStudentForGivenPEN(true)"
            />
          </v-col>
        </v-form>
        <h4 class="mt-8">
          Individual Student XML Previews by PEN
        </h4>
        <p>A user-friendly preview of what is currently available to a Post-Secondary institution that has been authorized by a student to receive transcript updates via XML data transfer.</p>
        <v-form
          v-model="studentPENXMLIsValid"
          class="d-flex"
        >
          <v-col cols="2">
            <v-text-field
              id="studentPENXMLField"
              ref="xmlField"
              v-model="studentPENXML"
              placeholder="Enter PEN"
              :rules="penRules"
              variant="underlined"
            />
          </v-col>
          <v-col
            cols="2"
            class="pt-6"
          >
            <PrimaryButton
              id="searchPENXMLBtn"
              text="Search"
              :disabled="!studentPENXMLIsValid"
              :click-action="() => searchStudentForGivenPEN(false)"
            />
          </v-col>
        </v-form>
      </div>
    </div>
    <div class="sub-category-group mt-2">
      <h3>School Level Graduation Summary Reports</h3>
      <p>Select a school from the list below to review the Graduation Summary Reports for the school.</p>
      <v-row
          class="align-center searchBox"
      >
        <v-col
            cols="12"
            md="4"
            lg="4"
            class="d-flex justify-start"
        >
          <v-autocomplete
              id="name-text-field"
              v-model="schoolCodeNameFilter"
              label="School Code & Name"
              variant="underlined"
              item-value="schoolID"
              item-title="schoolCodeName"
              autocomplete="off"
              :items="schoolSearchNames"
              :clearable="true"
              @update:model-value="searchButtonClick"
          >
            <template #item="{ props, item }">
              <v-list-item
                  v-bind="props"
                  title=""
              >
                <v-list-item-title style="color: black !important;">
                  {{
                    item.title
                  }}
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
      <div
          id="districtGradReports"
          @click="handleDistrictReportsDivClick"
      >
        <div :class="{ 'disabled-section': !schoolCodeNameFilter }">
          <div class="ps-8">
            <h3 class="mt-8">
              Graduation Summary Reports ({{ currentStartMoYr }} to {{ currentEndMoYr }})
            </h3>
            <p>Daily, cumulative lists of students in the current cycle, either graduated or not yet graduated, based on the latest information submitted by the school.</p>
            <div class="sub-category-group">
              <ul>
                <li>
                  <button
                      type="button"
                      class="link-style"
                      @click="downloadSummaryReport('graduated')"
                  >
                    Graduated Students
                    <span class="icon-container ml-1">
                <i class="mdi mdi-tray-arrow-down" />
              </span>
                  </button>
                </li>
                <li>
                  <button
                      type="button"
                      class="link-style"
                      @click="downloadSummaryReport('nonGraduated')"
                  >
                    Not Yet Graduated Students
                    <span class="icon-container ml-1">
                <i class="mdi mdi-tray-arrow-down" />
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
                  <button
                      type="button"
                      class="link-style"
                      @click="downloadSummaryReport('historicalGraduated')"
                  >
                    Graduated Students
                    <span class="icon-container ml-1">
                <i class="mdi mdi-tray-arrow-down" />
              </span>
                  </button>
                </li>
                <li>
                  <button
                      type="button"
                      class="link-style"
                      @click="downloadSummaryReport('historicalNonGraduated')"
                  >
                    Not Yet Graduated Students
                    <span class="icon-container ml-1">
                <i class="mdi mdi-tray-arrow-down" />
              </span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
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
import {isValidPEN} from '../../../../utils/validation';
import alertMixin from '../../../../mixins/alertMixin';
import PrimaryButton from '../../../util/PrimaryButton.vue';
import PENSearchDialog from '../../PENSearchDialog.vue';
import { mapState} from 'pinia';
import {authStore} from '../../../../store/modules/auth';
import {
  docTypeFilename, docTypeName,
  fetchAndDownloadGradReport,
  generateGradStartAndEndDateStrings,
  searchStudentByPen
} from '../../../../utils/gdc/gradReports';
import {appStore} from "../../../../store/modules/app";

export default {
  name: 'DistrictGradReportsAndTranscripts',
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
      schoolsCacheMap: null,
      schoolCodeNameFilter: null,
      filterSearchParams: null,
      schoolSearchNames: [],
      headerSearchParams: {
        schoolNumber: '',
        status: '',
        category: '',
        type: ''
      },
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['schoolsMap']),
    docTypeFilename() {
      switch (this.summaryDownloadType) {
      case 'yearEnd': return 'YearEnd';
      default: return '';
      }
    },
    docTypeName(){
      switch (this.summaryDownloadType) {
      case 'yearEnd': return 'Year-End District Credential and Transcript Distribution Reports';
      default: return '';
      }
    }
  },
  async created() {
    this.populateDateRanges();
    appStore().getInstitutesData().finally(() => {
      this.schoolsCacheMap = this.schoolsMap;
      this.getSchoolDropDownItems();
    });
  },
  methods: {
    backButtonClick() {
      this.$router.push({ name: 'graduation', params: { instituteIdentifierID: this.userInfo.activeInstituteIdentifier } });
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
      const pen = isTranscriptRequest ? this.studentPENTranscript : this.studentPENXML;
      this.studentDownloadType = isTranscriptRequest ? 'transcript' : 'xml';

      const onSuccess = (studentData) => {
        this.studentForSearch = studentData;
        this.showPENSearchDialog = true;
        this.isSearchingStudent = false;
      };
      searchStudentByPen(this, pen, onSuccess);
    },
    async downloadYearEndReport(){
      this.summaryDownloadType = 'yearEnd';
      const districtID = this.userInfo.activeInstituteIdentifier;
      await fetchAndDownloadGradReport(this, districtID, this.summaryDownloadType, this.docTypeFilename, this.docTypeName, false);
    },
    getSchoolDropDownItems() {
      this.schoolSearchNames = [];
      let now = new Date();
      let currentSchoolYearStart, currentSchoolYearEnd;
      if (now.getMonth() >= 6) {
        currentSchoolYearStart = new Date(now.getFullYear(), 6, 1); // July 1 of this year
        currentSchoolYearEnd = new Date(now.getFullYear() + 1, 5, 30); // June 30 of next year
      } else {
        currentSchoolYearStart = new Date(now.getFullYear() - 1, 6, 1); // July 1 of last year
        currentSchoolYearEnd = new Date(now.getFullYear(), 5, 30); // June 30 of this year
      }
      const windowStart = new Date(currentSchoolYearStart.getFullYear() - 2, currentSchoolYearStart.getMonth(), currentSchoolYearStart.getDate());
      const windowEnd = currentSchoolYearEnd;
      this.schoolsCacheMap.forEach(school => {
        if (school.districtID === this.userInfo.activeInstituteIdentifier && school.schoolCategoryCode === 'PUBLIC' && school.canIssueTranscripts === true) {
          if (!school.effectiveDate) {
            return;
          }
          let schoolOpened = new Date(school.effectiveDate);
          let schoolClosed = school.expiryDate ? new Date(school.expiryDate) : null;
          if (schoolOpened <= windowEnd && (!schoolClosed || schoolClosed >= windowStart)) {
            let schoolItem = {
              schoolCodeName: school.mincode + ' - ' + school.schoolName,
              schoolID: school.schoolID,
            };
            this.schoolSearchNames.push(schoolItem);
          }
        }
      });
    },
    searchButtonClick() {
      if(this.schoolCodeNameFilter !== null && this.schoolCodeNameFilter!== '') {
        this.headerSearchParams.schoolID = this.schoolCodeNameFilter;
      }else{
        this.headerSearchParams.schoolID = '';
      }
    },
    handleDistrictReportsDivClick() {
      if (!this.schoolCodeNameFilter) {
        this.setWarningAlert('Please select a school');
      }
    },
    async downloadSummaryReport(reportType){
      const schoolID = this.headerSearchParams.schoolID;
      await fetchAndDownloadGradReport(this, schoolID, reportType, docTypeFilename(reportType), docTypeName(reportType), true);
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
};
</script>

<style scoped>

.border {
  border: 2px solid grey;
  border-radius: 5px;
  padding: 35px;
  margin: 2em;
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

.disabled-section {
  opacity: 0.5;
  pointer-events: none;
}

</style>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-alert
          density="compact"
          type="info"
          variant="tonal"
        >
          School data submissions completed during business hours will be processed overnight. GRAD System reports are updated by the following day. For troubleshooting, please review your data submission error reports.
        </v-alert>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <h3>Individual Student Reports</h3>
      </v-col>
    </v-row>
    <v-card
      class="mt-2"
      width="30em"
      border="sm"
    >
      <v-card-text
        style="color: gray;font-size: small;"
        class="mt-n3"
      >
        Find TVRs and preview transcripts for individual students in GRAD using their PEN.
      </v-card-text>
      <v-form
        id="transcriptForm"
        v-model="studentPENTranscriptIsValid"
      >
        <v-row class="pl-3">
          <v-col cols="8">
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
            cols="4"
            class="mt-3"
          >
            <PrimaryButton
              id="searchPENTranscriptBtn"
              text="Search"
              :disabled="!studentPENTranscriptIsValid"
              :click-action="() => searchStudentForGivenPEN(true)"
            />
          </v-col>
        </v-row>
        <div v-if="showPENSearchResultArea">
          <v-row class="pl-3 pb-3">
            <v-col
              style="font-weight: bold"
              cols="3"
            >
              Name:
            </v-col>
            <v-col cols="9">
              {{ studentForSearch.fullName }}
            </v-col>
            <v-col
              style="font-weight: bold"
              cols="3"
            >
              Local ID:
            </v-col>
            <v-col cols="9">
              {{ studentForSearch.localID }}
            </v-col>
            <v-col
              style="font-weight: bold"
              cols="3"
            >
              Birthdate:
            </v-col>
            <v-col cols="9">
              {{ studentForSearch.dob }}
            </v-col>
            <v-col
              style="font-weight: bold"
              cols="3"
            >
              Gender:
            </v-col>
            <v-col cols="9">
              {{ studentForSearch.gender }}
            </v-col>
            <v-col cols="12">
              <DownloadLink
                label="TVR"
                :download-action="downloadTVRReport"
              />
            </v-col>
            <v-col
              cols="12"
              class="mt-n2"
            >
              <DownloadLink
                label="Transcript Preview"
                :download-action="downloadTranscriptPreview"
              />
            </v-col>
            <v-col
              cols="12"
              class="mt-n2"
            >
              <DownloadLink
                label="XML Preview"
                :download-action="downloadXMLPreview"
              />
            </v-col>
          </v-row>
        </div>
      </v-form>
    </v-card>
    <v-row class="mt-5">
      <v-col>
        <h3>Transcript Verification Report (TVR) Packages</h3>
      </v-col>
    </v-row>
    <v-card
      class="mt-2"
      width="30em"
      border="sm"
    >
      <v-card-title style="font-size: medium;">
        Current Grade 12 &amp; AD Students
      </v-card-title>
      <v-card-text
        style="color: gray;font-size: small;"
        class="mt-n3"
      >
        TVR packages for all students in their final year of a graduation program.
      </v-card-text>
      <v-form
        id="transcriptForm"
        v-model="studentPENTranscriptIsValid"
      >
        <v-row class="pl-3 pb-3">
          <v-col cols="12">
            <DownloadLink
              label="Projected Non-Graduates"
              :download-action="() => downloadProjectedTVRReport('nonGraduating')"
            />
          </v-col>
          <v-col 
            cols="12" 
            class="mt-n2"
          >
            <DownloadLink
              label="Projected Graduates"
              :download-action="() => downloadProjectedTVRReport('graduating')"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card>
    <v-row class="mt-5">
      <v-col>
        <h3>Graduation Projection Summary Reports</h3>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col>
        <span style="font-size: small; color: gray">Graduation projections based on course and assessment registrations and completions.</span>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="d-flex flex-row"
    >
      <v-card
        class="mt-2 mr-4"
        width="30em"
        border="sm"
      >
        <v-card-title style="font-size: medium;">
          Current Reporting Cycle
        </v-card-title>
        <v-card-text
          style="color: gray;font-size: small;"
          class="mt-n3"
        >
          {{ formattedActiveReportingPeriod }}
        </v-card-text>
        <v-form
          id="transcriptForm"
          v-model="studentPENTranscriptIsValid"
        >
          <v-row class="pl-3 pb-3">
            <v-col cols="12">
              <DownloadLink
                label="Projected Non-Graduates"
                :download-action="() => downloadGradProjections('projNonGrad')"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card>
      <v-card
        class="mt-2"
        width="30em"
        border="sm"
      >
        <v-card-title style="font-size: medium;">
          Previous Reporting Cycle
        </v-card-title>
        <v-card-text
          style="color: gray;font-size: small;"
          class="mt-n3"
        >
          {{ formattedPreviousReportingPeriod }}
        </v-card-text>
        <v-form
          id="transcriptForm"
          v-model="studentPENTranscriptIsValid"
        >
          <v-row class="pl-3 pb-3">
            <v-col cols="12">
              <DownloadLink
                label="Projected Non-Graduates"
                :download-action="() => downloadGradProjections('historicalProjNonGrad')"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card>
    </v-row>
    <v-row class="mt-5">
      <v-col>
        <h3>Graduation Status Summary Reports</h3>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col>
        <span style="font-size: small; color: gray">Current graduation status based on course and assessment completions only.</span>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="d-flex flex-row"
    >
      <v-card
        class="mt-2 mr-4"
        width="30em"
        border="sm"
      >
        <v-card-title style="font-size: medium;">
          Current Reporting Cycle
        </v-card-title>
        <v-card-text
          style="color: gray;font-size: small;"
          class="mt-n3"
        >
          {{ formattedActiveReportingPeriod }}
        </v-card-text>
        <v-form
          id="transcriptForm"
          v-model="studentPENTranscriptIsValid"
        >
          <v-row class="pl-3 pb-3">
            <v-col cols="12">
              <DownloadLink
                label="Graduated Students"
                :download-action="() => downloadSummaryReport('graduated')"
              />
            </v-col>
            <v-col
              cols="12"
              class="mt-n2"
            >
              <DownloadLink
                label="Not Yet Graduated Students"
                :download-action="() => downloadSummaryReport('nonGraduated')"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card>
      <v-card
        class="mt-2"
        width="30em"
        border="sm"
      >
        <v-card-title style="font-size: medium;">
          Previous Reporting Cycle
        </v-card-title>
        <v-card-text
          style="color: gray;font-size: small;"
          class="mt-n3"
        >
          {{ formattedPreviousReportingPeriod }}
        </v-card-text>
        <v-form
          id="transcriptForm"
          v-model="studentPENTranscriptIsValid"
        >
          <v-row class="pl-3 pb-3">
            <v-col cols="12">
              <DownloadLink
                label="Graduated Students"
                :download-action="() => downloadSummaryReport('historicalGraduated')"
              />
            </v-col>
            <v-col
              cols="12"
              class="mt-n2"
            >
              <DownloadLink
                label="Not Yet Graduated Students"
                :download-action="() => downloadSummaryReport('historicalNonGraduated')"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
import DownloadLink from '../../../common/DownloadLink.vue';
import PrimaryButton from '../../../util/PrimaryButton.vue';
import { mapState } from 'pinia';
import { authStore } from '../../../../store/modules/auth';
import { downloadDocument, fetchAndDownloadGradReport, searchStudentByPen, docTypeFilename, docTypeName } from '../../../../utils/gdc/gradReports';
import alertMixin from '../../../../mixins/alertMixin';
import { isValidPEN } from '../../../../utils/validation';
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';

export default {
  name: 'GradSchoolReportsAndTranscripts',
  components: { DownloadLink, PrimaryButton },
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
      loadingCount: 0,
      activeReportingPeriod: null,
      previousReportingPeriod: null,
      showPENSearchResultArea: false,
      studentForSearch: {},
      studentDownloadType: '',
      studentPENTranscript: null,
      studentPENTranscriptIsValid: false,
      studentPENXML: null,
      studentPENXMLIsValid: false,
      penRules: [v => !!v || 'Required', v => (!v || isValidPEN(v) || 'Invalid PEN')],
      isSearchingStudent: false
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    isLoading() {
      return this.loadingCount > 0;
    },
    formattedActiveReportingPeriod() {
      if (this.activeReportingPeriod === null) {
        return 'Loading';
      }
      let formatter = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
      let periodStart = new Date(this.activeReportingPeriod.periodStart);
      let periodEnd = new Date(this.activeReportingPeriod.periodEnd);
      return `${formatter.format(periodStart)} to ${formatter.format(periodEnd)}`;
    },
    formattedPreviousReportingPeriod() {
      if (this.previousReportingPeriod === null) {
        return 'Loading';
      }
      let formatter = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
      let periodStart = new Date(this.previousReportingPeriod.periodStart);
      let periodEnd = new Date(this.previousReportingPeriod.periodEnd);
      return `${formatter.format(periodStart)} to ${formatter.format(periodEnd)}`;
    }
  },
  created() {
    this.getActiveReportingPeriod();
    this.getPreviousReportingPeriod();
  },
  methods: {
    backButtonClick() {
      this.$router.push({ name: 'graduation', params: { instituteIdentifierID: this.schoolID } });
    },
    getActiveReportingPeriod() {
      this.loadingCount += 1;
      ApiService.apiAxios.get(`${ApiRoutes.gdc.BASE_URL}/active-reporting-period`)
        .then(response => {
          this.activeReportingPeriod = response.data;
        }).catch(error => {
          console.error(error);
          this.setFailureAlert('An error occurred while trying to retrieve the active Reporting Period. Please try again later.');
        }).finally(() => {
          this.loadingCount -= 1;
        });
    },
    getPreviousReportingPeriod() {
      this.loadingCount += 1;
      ApiService.apiAxios.get(`${ApiRoutes.gdc.BASE_URL}/previous-reporting-period`)
        .then(response => {
          this.previousReportingPeriod = response.data;
        }).catch(error => {
          console.error(error);
          this.setFailureAlert('An error occurred while trying to retrieve the previous Reporting Period. Please try again later.');
        }).finally(() => {
          this.loadingCount -= 1;
        });
    },
    searchStudentForGivenPEN(isTranscriptRequest) {
      this.isSearchingStudent = true;
      this.studentForSearch = {};
      this.showPENSearchResultArea = false;
      const pen = isTranscriptRequest ? this.studentPENTranscript : this.studentPENXML;
      this.studentDownloadType = isTranscriptRequest ? 'transcript' : 'xml';

      const onSuccess = (studentData) => {
        this.studentForSearch = studentData;
        this.showPENSearchResultArea = true;
        this.isSearchingStudent = false;
      };
      searchStudentByPen(this, pen, onSuccess);
    },
    async downloadTVRReport() {
      await downloadDocument(this, this.studentForSearch.pen, 'tvr');
    },
    async downloadTranscriptPreview() {
      await downloadDocument(this, this.studentForSearch.pen, 'transcript');
    },
    async downloadXMLPreview() {
      await downloadDocument(this, this.studentForSearch.pen, 'xml');
    },
    async downloadSummaryReport(reportType) {
      const schoolID = this.userInfo.activeInstituteIdentifier;
      await fetchAndDownloadGradReport(this, schoolID, reportType, docTypeFilename(reportType), docTypeName(reportType), true);
    },
    async downloadProjectedTVRReport(reportType) {
      const schoolID = this.userInfo.activeInstituteIdentifier;
      await fetchAndDownloadGradReport(this, schoolID, reportType, docTypeFilename(reportType), docTypeName(reportType), true, false);
    },
    async downloadGradProjections(reportType){
      this.loadingCount += 1;
      const schoolID = this.userInfo.activeInstituteIdentifier;
      await fetchAndDownloadGradReport(this, schoolID, reportType, docTypeFilename(reportType), docTypeName(reportType), true, true);
      this.loadingCount -= 1;
    },
    close() {
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

h3 {
  color: #38598a;
}

button {
  color: #1976d2;
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

</style>

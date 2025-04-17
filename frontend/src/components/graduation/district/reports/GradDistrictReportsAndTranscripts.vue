<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <h3>Individual Students</h3>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col>
        <span style="font-size: small; color: gray">View available reports for individual students based on PEN.</span>
      </v-col>
    </v-row>
    <v-card
      class="mt-2"
      width="30em"
      border="sm"
    >
      <v-card-title style="font-size: medium">
        Student Reports
      </v-card-title>
      <v-card-text
        style="color: gray;font-size: small"
        class="mt-n3"
      >
        Any student that exists in GRAD
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
        <h3>School Level Reports</h3>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col>
        <span style="font-size: small; color: gray">Select a school below to find the reports available for the school.</span>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col
        cols="4"
        class="d-flex justify-start"
      >
        <SchoolCodeNameFilter
          v-model="schoolCodeNameFilter"
          :district-i-d="districtID"
          :collection-object="collectionObject"
        />
      </v-col>
    </v-row>
    <div :class="{ 'disabled-section': !schoolCodeNameFilter }">
      <v-row class="mt-2">
        <v-col>
          <h3>Transcript Verification Reports (TVRs)</h3>
        </v-col>
      </v-row>
      <v-card
        class="mt-2"
        width="30em"
        border="sm"
        style="border: 1px solid black;border-radius: 10px;"
      >
        <v-card-title style="font-size: medium;">
          Current Grade 12 &amp; AD Students
        </v-card-title>
        <v-card-text
          style="color: gray;font-size: small"
          class="mt-n3"
        >
          Students in final year of a graduation program
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
          </v-row>
        </v-form>
      </v-card>
      <v-row class="mt-5">
        <v-col>
          <h3>Projection Reports</h3>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col>
          <span style="font-size: small; color: gray">Based on registrations that are not yet complete and are meant to predict graduation.</span>
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="d-flex flex-row"
      >
        <v-card
          class="mt-2 mr-4"
          width="30em"
          style="border: 1px solid black;border-radius: 10px;"
          border="sm"
        >
          <v-card-title style="font-size: medium;">
            Current Reporting Cycle
          </v-card-title>
          <v-card-text
            style="color: gray;font-size: small"
            class="mt-n3"
          >
            October {{ lastYear }} to September {{ currentYear }}
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
          style="border: 1px solid black;border-radius: 10px;"
        >
          <v-card-title style="font-size: medium;">
            Previous Reporting Cycle
          </v-card-title>
          <v-card-text
            style="color: gray;font-size: small"
            class="mt-n3"
          >
            October {{ yearBeforeLast }} to September {{ lastYear }}
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
          <h3>Graduation Reports</h3>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col>
          <span style="font-size: small; color: gray">Based on what students have completed as of the current date.</span>
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
          style="border: 1px solid black;border-radius: 10px;"
        >
          <v-card-title style="font-size: medium;">
            Current Reporting Cycle
          </v-card-title>
          <v-card-text
            style="color: gray;font-size: small"
            class="mt-n3"
          >
            October {{ lastYear }} to September {{ currentYear }}
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
          <v-card-text
            class="pt-1 pb-3"
            style="color: gray"
          >
            * Generated daily based on latest data submissions
          </v-card-text>
        </v-card>
        <v-card
          class="mt-2"
          border="sm"
          width="30em"
          style="border: 1px solid black;border-radius: 10px;"
        >
          <v-card-title style="font-size: medium;">
            Previous Reporting Cycle
          </v-card-title>
          <v-card-text
            style="color: gray;font-size: small"
            class="mt-n3"
          >
            October {{ yearBeforeLast }} to September {{ lastYear }}
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
          <v-card-text
            class="pt-1 pb-3"
            style="color: gray"
          >
            * Generated based on final data submissions
          </v-card-text>
        </v-card>
      </v-row>
    </div>
    <v-row class="mt-5">
      <v-col>
        <h3>District Level Reports</h3>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="mt-n3">
        <DownloadLink
          label="Year-End District Credential and Transcript Distribution Reports"
          :download-action="downloadYearEndReport"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { isValidPEN } from '../../../../utils/validation';
import alertMixin from '../../../../mixins/alertMixin';
import PrimaryButton from '../../../util/PrimaryButton.vue';
import { mapState } from 'pinia';
import { authStore } from '../../../../store/modules/auth';
import {
  docTypeFilename,
  docTypeName,
  downloadDocument,
  fetchAndDownloadGradReport,
  searchStudentByPen
} from '../../../../utils/gdc/gradReports';
import { LocalDate } from '@js-joda/core';
import SchoolCodeNameFilter from '../../../common/SchoolCodeNameFilter.vue';
import DownloadLink from '../../../common/DownloadLink.vue';

export default {
  name: 'GradDistrictReportsAndTranscripts',
  components: { SchoolCodeNameFilter, PrimaryButton, DownloadLink },
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
  data() {
    return {
      isLoading: false,
      currentYear: null,
      lastYear: null,
      schoolCodeNameFilter: null,
      yearBeforeLast: null,
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
  },
  created() {
    this.populateYearValues();
  },
  methods: {
    populateYearValues() {
      const now = LocalDate.now();
      this.currentYear = now.year();
      this.lastYear = now.minusYears(1).year();
      this.yearBeforeLast = now.minusYears(2).year();
    },
    searchStudentForGivenPEN(isTranscriptRequest) {
      this.isSearchingStudent = true;
      const pen = isTranscriptRequest ? this.studentPENTranscript : this.studentPENXML;
      this.studentDownloadType = isTranscriptRequest ? 'transcript' : 'xml';

      const onSuccess = (studentData) => {
        this.studentForSearch = studentData;
        this.showPENSearchResultArea = true;
        this.isSearchingStudent = false;
      };
      searchStudentByPen(this, pen, onSuccess);
    },
    async downloadYearEndReport(){
      this.summaryDownloadType = 'yearEnd';
      const districtID = this.districtID;
      await fetchAndDownloadGradReport(this, districtID, this.summaryDownloadType, docTypeFilename('yearEnd'), docTypeName('yearEnd'), false);
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
      this.isLoading = true;
      const schoolID = this.schoolCodeNameFilter;
      await fetchAndDownloadGradReport(this, schoolID, reportType, docTypeFilename(reportType), docTypeName(reportType), true, true);
      this.isLoading = false;
    },
    async downloadProjectedTVRReport(reportType) {
      this.isLoading = true;
      const schoolID = this.schoolCodeNameFilter;
      await fetchAndDownloadGradReport(this, schoolID, reportType, docTypeFilename(reportType), docTypeName(reportType), true, false);
      this.isLoading = false;
    },
    async downloadGradProjections(reportType){
      this.isLoading = true;
      const schoolID = this.schoolCodeNameFilter;
      await fetchAndDownloadGradReport(this, schoolID, reportType, docTypeFilename(reportType), docTypeName(reportType), true, true);
      this.isLoading = false;
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

v-text-field {
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

.disabled-section {
  opacity: 0.5;
  pointer-events: none;
}

</style>

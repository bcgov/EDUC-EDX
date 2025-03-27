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
      <v-card-title style="font-size: medium;">Student Reports</v-card-title>
      <v-card-text
        style="color: gray;font-size: small;"
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
        <h3>Transcript Verification Reports (TVRs)</h3>
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
        border="sm"
      >
        <v-card-title style="font-size: medium;">Current Reporting Cycle</v-card-title>
        <v-card-text
          style="color: gray;font-size: small;"
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
                :download-action="() => downloadProjectedTVRReport('nonGraduating')"
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
        <v-card-title style="font-size: medium;">Previous Reporting Cycle</v-card-title>
        <v-card-text
          style="color: gray;font-size: small;"
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
                :download-action="() => downloadProjectedTVRReport('nonGraduating')"
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
      >
        <v-card-title style="font-size: medium;">Current Reporting Cycle</v-card-title>
        <v-card-text
          style="color: gray;font-size: small;"
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
          style="color: gray"
          class="pt-1 pb-3"
        >
          * Generated daily based on latest data submissions
        </v-card-text>
      </v-card>
      <v-card
        class="mt-2"
        width="30em"
        border="sm"
      >
        <v-card-title style="font-size: medium;">Previous Reporting Cycle</v-card-title>
        <v-card-text
          style="color: gray;font-size: small;"
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
          style="color: gray"
          class="pt-1 pb-3"
        >
          * Generated based on final data submissions
        </v-card-text>
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
import { LocalDate } from '@js-joda/core';
import alertMixin from '../../../../mixins/alertMixin';
import { isValidPEN } from '../../../../utils/validation';

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
      isLoading: false,
      currentYear: null,
      lastYear: null,
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
  async created() {
    this.populateYearValues();
  },
  methods: {
    backButtonClick() {
      this.$router.push({ name: 'graduation', params: { instituteIdentifierID: this.schoolID } });
    },
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

</style>

<template>
  <v-container fluid>
    <div>
      <h3>Student Transcripts</h3>
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
      penRules: [v => !!v || 'Required', v => (!v || isValidPEN(v) || 'Invalid PEN')],
      isSearchingStudent: false
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
  },
  async created() {
    this.populateDateRanges();
  },
  methods: {
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
      const pen = isTranscriptRequest ? this.studentPENTranscript : this.studentPENXML;
      this.studentDownloadType = isTranscriptRequest ? 'transcript' : 'xml';

      const onSuccess = (studentData) => {
        this.studentForSearch = studentData;
        this.showPENSearchDialog = true;
        this.isSearchingStudent = false;
      };
      searchStudentByPen(this, pen, onSuccess);
    },
    async downloadSummaryReport(reportType){
      const schoolID = this.userInfo.activeInstituteIdentifier;
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

</style>

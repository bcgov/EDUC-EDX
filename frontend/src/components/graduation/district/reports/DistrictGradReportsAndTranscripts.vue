<template>
  <v-container fluid>
    <div class="mt-1 mb-1">
      <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
      <button type="button" class="link-style ml-1" @click="backButtonClick">Return to GRAD Dashboard</button>
    </div>

    <div class="border">
      <h3>District Level Reports</h3>
      <div class="sub-category-group mt-2">
        <button type="button" class="link-style" @click="downloadYearEndReport()">
          Year-End District Credential and Transcript Distribution Reports
          <span class="icon-container ml-1">
                  <i class="mdi mdi-tray-arrow-down"></i>
                </span>
        </button>
      </div>
      <h3 class="mt-8">Student Transcripts</h3>
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
import {isValidPEN} from "../../../../utils/validation";
import alertMixin from "../../../../mixins/alertMixin";
import PrimaryButton from "../../../util/PrimaryButton.vue";
import PENSearchDialog from "../../PENSearchDialog.vue";
import { mapState} from "pinia";
import {authStore} from "../../../../store/modules/auth";
import {
  fetchAndDownloadGradReport,
  generateGradStartAndEndDateStrings,
  searchStudentByPen
} from "../../../../utils/gdc/gradReports";

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
      isSearchingStudent: false
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
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
      this.studentDownloadType = isTranscriptRequest ? "transcript" : "xml";

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

</style>
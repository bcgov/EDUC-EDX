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
      <h3>Transcript Verification Reports (TVRs)</h3>
      <p>For current students reported in final year of a graduation program (Grade 12 or AD)</p>
      <ul>
        <li>
          <button
            type="button"
            class="link-style"
            @click="downloadSummaryReport('nonGraduating')"
          >
            TVRs for Projected Non-Graduating Students
            <span class="icon-container ml-1">
              <i class="mdi mdi-tray-arrow-down" />
            </span>
          </button>
        </li>
        <li>
          <button
            type="button"
            class="link-style"
            @click="downloadSummaryReport('graduating')"
          >
            TVRs for Projected Graduating Students
            <span class="icon-container ml-1">
              <i class="mdi mdi-tray-arrow-down" />
            </span>
          </button>
        </li>
      </ul>
      <div class="sub-category-group mt-2">
        <h4 class="mt-8">
          Individual TVRs by PEN
        </h4>
        <p>Schools can now search for any TVR that exists in GRAD by PEN (not just current grade 12 or AD students). To View / Print an individual student's TVR report enter PEN below.</p>
        <v-form
          v-model="studentPENIsValid"
          class="d-flex"
        >
          <v-col cols="2">
            <v-text-field
              ref="studentPENField"
              v-model="studentPEN"
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
              id="searchPENBtn"
              text="Search"
              :disabled="!studentPENIsValid"
              :click-action="searchStudentForGivenPEN"
            />
          </v-col>
        </v-form>
      </div>
    </div>
    <PENSearchDialog
      v-model="showPENSearchDialog"
      :student="student"
      download-type="tvr"
      @close="close"
    />
  </v-container>
</template>

<script>
import alertMixin from '../../../../mixins/alertMixin';
import PrimaryButton from '../../../util/PrimaryButton.vue';
import {penIsValid} from '../../../../utils/institute/formRules';
import {isValidPEN} from '../../../../utils/validation';
import PENSearchDialog from '../../PENSearchDialog.vue';
import {mapState} from 'pinia';
import {authStore} from '../../../../store/modules/auth';
import {
  fetchAndDownloadGradReport,
  generateGradStartAndEndDateStrings,
  searchStudentByPen
} from '../../../../utils/gdc/gradReports';

export default {
  name: 'GradProjectionsTVR',
  components: {
    PENSearchDialog,
    PrimaryButton
  },
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: false,
      default: null
    },
  },
  data() {
    return {
      currentStartMoYr: '',
      currentEndMoYr: '',
      histStartMoYr: '',
      histEndMoYr: '',
      penRules: [v => !!v || 'Required', v => (!v || isValidPEN(v) || 'Invalid PEN')],
      studentPEN: null,
      studentPENIsValid: false,
      studentExists: false,
      student: {},
      showPENSearchDialog: false,
      summaryDownloadType: '',
      isSearchingStudent: false
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    docTypeFilename() {
      switch(this.summaryDownloadType){
      case 'graduating': return 'TranscriptVerificationGraduatingSummaryReport';
      case 'nonGraduating': return 'TranscriptVerificationNonGraduatingSummaryReport';
      default: return '';
      }
    },
    docTypeName() {
      switch (this.summaryDownloadType) {
      case 'graduating': return 'TVRs for graduating students';
      case 'nonGraduating': return 'TVRs for non-graduating students';
      default: return '';
      }
    },
  },
  async created() {
    this.populateDateRanges();
  },
  methods: {
    penIsValid,
    backButtonClick() {
      this.$router.push({name: 'graduation', params: {instituteIdentifierID: this.schoolID}});
    },
    populateDateRanges(){
      let datesList = generateGradStartAndEndDateStrings();
      this.currentStartMoYr = datesList.shift();
      this.currentEndMoYr = datesList.shift();
      this.histStartMoYr = datesList.shift();
      this.histEndMoYr = datesList.shift();
    },
    searchStudentForGivenPEN() {
      this.isSearchingStudent = true;

      const onSuccess = (studentData) => {
        this.student = studentData;
        this.showPENSearchDialog = true;
        this.isSearchingStudent = false;
      };
      searchStudentByPen(this, this.studentPEN, onSuccess);
    },
    async downloadSummaryReport(reportType){
      this.summaryDownloadType = reportType;
      const schoolID = this.userInfo.activeInstituteIdentifier;
      await fetchAndDownloadGradReport(this, schoolID, reportType, this.docTypeFilename, this.docTypeName, true,false);
    },
    close() {
      this.showPENSearchDialog = false;
      this.student = {};
      this.studentPEN = null;

      this.$refs.studentPENField.reset();
    },
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

:deep(.v-btn__content){
  white-space: break-spaces;
}

h3 {
  color: #38598a;
}

button {
  color: #1976d2;
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

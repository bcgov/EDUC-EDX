<template>
  <v-container fluid>
    <div class="mt-1 mb-1">
      <v-icon small color="#1976d2">mdi-arrow-left</v-icon>
      <a class="ml-1" @click="backButtonClick">Return to GRAD Dashboard</a>
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
            <a href="" class="link-style">
              Graduated Students
              <span class="icon-container ml-1">
                <i class="mdi mdi-tray-arrow-down"></i>
              </span>
            </a>
          </li>
          <li>
            <a href="" class="link-style">
              Not Yet Graduated Students
              <span class="icon-container ml-1">
                <i class="mdi mdi-tray-arrow-down"></i>
              </span>
            </a>
          </li>
        </ul>
      </div>

      <h3> Historical Graduation Summary Reports ({{ histStartMoYr }} to {{ histEndMoYr }})</h3>
      <p>Lists of students in previous cycles, either graduated or not yet graduated, based on the final information submitted by the school during the cycle.</p>
      <div class="sub-category-group">
        <ul>
          <li>
            <a href="" class="link-style">
              Graduated Students
              <span class="icon-container ml-1">
                <i class="mdi mdi-tray-arrow-down"></i>
              </span>
            </a>
          </li>
          <li>
            <a href="" class="link-style">
              Not Yet Graduated Students
              <span class="icon-container ml-1">
                <i class="mdi mdi-tray-arrow-down"></i>
              </span>
            </a>
          </li>
        </ul>
      </div>
    </div>
    <PENSearchDialog
        v-model="showPENSearchDialog"
        :student="studentForSearch"
        :download-type="downloadType"
        @close="close"
    />
  </v-container>
</template>

<script>
import {generateGradStartAndEndDateStrings} from "../../../../utils/common";
import {isValidPEN} from "../../../../utils/validation";
import alertMixin from "../../../../mixins/alertMixin";
import PrimaryButton from "../../../util/PrimaryButton.vue";
import PENSearchDialog from "../../PENSearchDialog.vue";
import ApiService from "../../../../common/apiService";
import {ApiRoutes, MINISTRY_NAME} from "../../../../utils/constants";
import { appStore } from "../../../../store/modules/app"; // Import your store
import { mapState, mapActions } from "pinia";

export default {
  name: 'GradReportsAndTranscripts',
  components: {
    PrimaryButton,
    PENSearchDialog
  },
  mixins: [alertMixin],  // Keep the mixin for the helper methods
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
      currentStartMoYr: '',
      currentEndMoYr: '',
      histStartMoYr: '',
      histEndMoYr: '',
      showPENSearchDialog: false,
      studentForSearch: {},
      downloadType: '',
      studentPENTranscript: null,
      studentPENTranscriptIsValid: false,
      studentPENXML: null,
      studentPENXMLIsValid: false,
      penRules: [v => !!v || 'Required', v => (!v || isValidPEN(v) || 'Invalid PEN')],
      isSearchingStudent: false,
    };
  },
  computed: {
    ...mapState(appStore, ['alertNotificationQueue', 'alertNotification']), // Map the alert state
  },
  methods: {
    ...mapActions(appStore, ['addAlertNotification']), // Use mapActions

    clearAlert() {
      // Remove the *first* element from the queue (FIFO)
      if (this.alertNotificationQueue.length > 0) {
        this.alertNotificationQueue.shift();
      }
      // If the queue is now empty, set alertNotification to false
      if (this.alertNotificationQueue.length === 0) {
        this.setAlertNotification(false); // Correctly calling the action
      }
    },
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
      this.downloadType = '';

      ApiService.apiAxios.get(ApiRoutes.studentRequest.SEARCH_URL + "search-grad-pen", {
        params: {
          pen: isTranscriptRequest ? this.studentPENTranscript : this.studentPENXML
        }
      })
          .then(response => {
            this.downloadType = isTranscriptRequest ? "Transcript" : "XML";
            this.studentForSearch = this.populateStudentInfo(response.data);
            this.showPENSearchDialog = true;
          })
          .catch(error => {
            if (error?.response?.data?.message) {
              // Use the mixin method, which now correctly calls the Pinia action
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

.sub-category-group {
  padding-left: 2em;
}

v-text-field{
  width: 4em;
}

v-card{
  padding: 1.1rem;
  width: 40rem;
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
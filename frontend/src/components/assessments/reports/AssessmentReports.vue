<template>
  <v-container fluid>
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
        style="color: gray;font-size: small"
        class="mt-n3"
      >
        Find assessment results for individual students using their PEN.
      </v-card-text>
      <v-form
        id="studentPENForm"
        v-model="studentPENIsValid"
      >
        <v-row class="pl-3">
          <v-col cols="8">
            <v-text-field
              id="studentPENField"
              ref="studentPENField"
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
              id="searchPENBtn"
              text="Search"
              :disabled="!studentPENIsValid"
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
            <v-col
              cols="12"
              class="mt-n2"
            >
              <DownloadLink
                label="Student Report"
                :download-action="downloadStudentReport"
              />
            </v-col>
          </v-row>
        </div>
      </v-form>
    </v-card>

    <v-row class="mt-2">
      <v-col>
        <h3>Session Results</h3>
      </v-col>
    </v-row>
    <v-row
      v-if="userInfo.activeInstituteType === 'DISTRICT'"
      class="mt-n6"
    >
      <v-col>
        <span
          style="color: gray;font-size: small"
        >
          Select a school and a session below to find the reports available for download.
        </span>
      </v-col>
    </v-row>
    <v-row
      v-else
      class="mt-n6"
    >
      <v-col>
        <span
          style="color: gray;font-size: small"
        >
          Select a session below to find the reports available for download.
        </span>
      </v-col>
    </v-row>

    <v-row class="mt-n2">
      <v-col
        v-if="userInfo.activeInstituteType === 'DISTRICT'"
        cols="4"
      >            
        <v-autocomplete
          id="selectSchool"
          v-model="schoolNameNumberFilter"
          variant="underlined"
          :items="schoolSearchNames"
          color="#003366"
          label="School Name or Number"
          single-line
          :clearable="true"
          item-title="schoolCodeName"
          item-value="schoolCodeValue"
          autocomplete="off"
        />
      </v-col>

      <v-col cols="4">
        <v-select
          id="selectedSession"
          v-model="selectedSessionID"
          variant="underlined"
          :items="sessionSearchNames"
          label="Session"
          item-title="sessionCodeName"
          item-value="sessionCodeValue"
          :rules="[rules.required()]"
          :clearable="true"
        />
      </v-col>
    </v-row>
    <div :class="{ 'disabled-section': disableCondition }">
      <v-row
        no-gutters
        class="d-flex"
      >
        <v-card
          class="mt-2 mr-4"
          width="30em"
          border="sm"
          style="border: 1px solid black;border-radius: 10px;"
        >
          <v-card-title style="font-size: medium;">
            Assessment Results
          </v-card-title>

          <v-row class="pl-3 pb-3">
            <v-col cols="12">
              <DownloadLink
                label="Session Results.csv"
                :download-action="() => downloadDetailedDOARReport()"
              />
            </v-col>
          </v-row>
          <v-row class="pl-3 pb-3 mt-n6">
            <v-col cols="12">
              <DownloadLink
                label="Session Results.xam"
                :download-action="() => downloadXamFile()"
              />
            </v-col>
          </v-row>
          <v-row class="pl-3 pb-3 mt-n6">
            <v-col cols="12">
              <DownloadLink
                label="Session Results by Student.pdf"
                :download-action="() => downloadStudentReport()"
              />
            </v-col>
          </v-row>
          <v-row class="pl-3 pb-3 mt-n6">
            <v-col cols="12">
              <DownloadLink
                label="Session Results by Assessment.pdf"
                :download-action="() => downloadAssessmentResults()"
              />
            </v-col>
          </v-row>
        </v-card>

        <v-card
          class="mt-2"
          width="30em"
          border="sm"
          style="border: 1px solid black;border-radius: 10px;"
        >
          <v-card-title style="font-size: medium;">
            Distribution of Assessment Results (DOAR)
          </v-card-title>
          <v-row class="pl-3 pb-3">
            <v-col 
              cols="12"
            >
              <DownloadLink
                label="Summary DOAR.pdf"
                :download-action="() => downloadDetailedDOARReport('graduating')"
              />
            </v-col>
          </v-row>
          <v-row class="pl-3 pb-3 mt-n6">
            <v-col 
              cols="12"
            >
              <DownloadLink
                label="Detailed DOAR.csv"
                :download-action="() => downloadDetailedDOARReport('graduating')"
              />
            </v-col>
          </v-row>
        </v-card>
      </v-row>
    </div>

    <div :class="{ 'disabled-section': !schoolNameNumberFilter }" />
  </v-container>
</template>

<script>
import { isValidPEN } from '../../../utils/validation';
import alertMixin from '../../../mixins/alertMixin';
import PrimaryButton from '../../util/PrimaryButton.vue';
import { mapState } from 'pinia';
import { authStore } from '../../../store/modules/auth';
import {appStore} from '../../../store/modules/app';
import { LocalDate, LocalDateTime } from '@js-joda/core';
import DownloadLink from '../../common/DownloadLink.vue';
import ApiService from '../../../common/apiService';
import { ApiRoutes } from '../../../utils/constants';
import { sortBy } from 'lodash';
import * as Rules from '../../../utils/institute/formRules';

export default {
  name: 'AssessmentReports',
  components: { PrimaryButton, DownloadLink },
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
      showPENSearchResultArea: false,
      studentForSearch: {},
      studentPENTranscript: null,
      studentPENIsValid: false,
      penRules: [v => !!v || 'Required', v => (!v || isValidPEN(v) || 'Invalid PEN')],
      isSearchingStudent: false,
      sessionSearchNames: [],
      schoolYearSessions: [],
      rules: Rules,
      schoolNameNumberFilter: null,
      schoolSearchNames: [],
      selectedSessionID: null,
      isDistrictUser: false
    };
  },
  computed: {
    ...mapState(appStore, ['schoolsMap']),
    ...mapState(authStore, ['userInfo']),
    disableCondition() {
      return this.userInfo.activeInstituteType === 'DISTRICT' ? (!this.schoolNameNumberFilter || !this.selectedSessionID)  : !this.selectedSessionID;
    }
  },
  async created() {
    authStore().getUserInfo().then(() => {
      this.isDistrictUser = this.userInfo.activeInstituteType !== 'SCHOOL';
    });
    await this.getAllSessions();
    this.setupSchoolLists();
  },
  methods: {
    async getAllSessions() {
      this.loading = true;
      ApiService.apiAxios
        .get(`${ApiRoutes.assessments.GET_ASSESSMENT_SESSIONS}` + '/' + this.userInfo.activeInstituteType).then((response) => {
          this.schoolYearSessions = response.data.sort((a, b) =>
            LocalDateTime.parse(b.activeUntilDate).compareTo(LocalDateTime.parse(a.activeUntilDate))
          );
        }).catch((error) => {
          console.error(error);
        }).finally(() => {
          this.loading = false;
          this.setupSessions();
        });
    },
    setupSessions() {
      let sessions = [];
      let sessionYearMinusTwo = LocalDate.now().minusYears(2).year();
      this.schoolYearSessions?.forEach((session) => {
        if(parseInt(session.courseYear) >= sessionYearMinusTwo){
          sessions.push({
            sessionCodeName: session.courseYear + '/' + session.courseMonth,
            sessionCodeValue: session.sessionID
          });
        }
      });
      this.sessionSearchNames = sortBy(sessions, ['sessionCourseYear','sessionCourseMonth']);
    },
    setupSchoolLists() {
      this.schoolSearchNames = [];
      this.schoolsMap?.forEach((school) => {
        let schoolCodeName = school.schoolName + ' - ' + school.mincode;
        if(school.districtID === this.userInfo.activeInstituteIdentifier) {
          this.schoolSearchNames.push({schoolCodeName: schoolCodeName, schoolCodeValue: school.schoolID});
        }
      });
      this.schoolSearchNames = sortBy(this.schoolSearchNames, ['schoolCodeName']);
    },
    searchStudentForGivenPEN() {
      this.isSearchingStudent = true;

      ApiService.apiAxios.get(ApiRoutes.studentRequest.SEARCH_URL, {
        params: {
          pen: this.studentPENTranscript
        }
      })
        .then(response => {
          this.studentForSearch = {
            pen: response.data.pen,
            studentID: response.data.studentID,
            fullName: response.data.firstName + ' ' + (response.data.middleName ?? '') + ' ' + response.data.lastName,
            localID: response.data.localID,
            gender: response.data.gender,
            dob: response.data.doB.replaceAll('-', '/')
          };
          this.showPENSearchResultArea = true;
          this.isSearchingStudent = false;
        })
        .catch(error => {
          if (error?.response?.data?.message) {
            this.setErrorAlert(error?.response?.data?.message);
          } else {
            this.setErrorAlert('PEN must be a valid.');
          }
        }).finally(() => {
          this.isSearchingStudent = false;
        });
    },
   
    async downloadStudentReport() {
     
    },
    async downloadSummaryReport() {

    },
    async downloadDetailedDOARReport() {

    },
    async downloadAssessmentResults() {

    },
    async downloadXamFile() {
      this.isLoading = true;
      try {
        const url = `${ApiRoutes.assessments.BASE_REPORTS_URL}/${this.userInfo.activeInstituteType}/${this.selectedSessionID}/school/${this.schoolNameNumberFilter}/download`;
        window.open(url);
      } catch (error) {
        console.error(error);
        this.setFailureAlert(
          error?.response?.data?.message
            ? error?.response?.data?.message
            : 'An error occurred while trying to retrieve your school\'s report.'
        );
      } finally {
        this.isLoading = false;
      }
    },
    async downloadGradProjections(){

    }
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

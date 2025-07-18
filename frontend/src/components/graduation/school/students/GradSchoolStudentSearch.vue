<template>
  <v-container fluid>
    <v-row class="mb-1">
      <v-col>
        Enter a PEN below to review the school data submission history for the student within the past two reporting periods.
      </v-col>
    </v-row> 
    <v-form
      ref="gradSchoolStudentSearchForm"
      v-model="studentSearchFormIsValid"
      class="d-flex"
    >
      <v-row>
        <v-col cols="2">
          <v-text-field
            ref="studentPENField"
            v-model="studentPEN"
            label="Enter PEN"
            :rules="[rules.required(),rules.validPEN()]"
            variant="underlined"
          />
        </v-col>
        <v-col cols="2">
          <v-btn
            id="search"
            color="#003366"
            text="Search"
            class="mr-1 mt-2"
            :disabled="!studentSearchFormIsValid"
            @click="searchStudent"
          />
          <v-btn
            id="clear"
            color="#003366"
            text="Clear"
            variant="outlined"
            class="mr-1 mt-2"
            @click="clear"
          />
        </v-col>
      </v-row>
    </v-form>

    <div v-if="isLoading">
      <v-row>
        <v-col class="d-flex justify-center">
          <Spinner
            :flat="true"
            style="margin-bottom: 40rem"
          />
        </v-col>
      </v-row>
    </div>
    <div v-else-if="!isLoading && studentSearched && !studentFound">
      <p>Student not found.</p>
    </div>    
    <div v-else-if="!isLoading && studentSearched && studentFound">
      <v-row
        no-gutters
        class="mb-n2"
      >
        <v-col
          cols="4"
          align-self="center"
        >
          <span class="heading">
            {{ totalFoundSubmissions }} Submissions Found
          </span>
        </v-col>
        <v-col
          cols="8"
          class="d-flex justify-end"
          align-self="center"
        >
          <v-btn
            id="search"
            color="#1976d2"
            :text="selectedSubmissionText"
            variant="text"
            append-icon="mdi-account-details"
            @click="showSubmissionSelector = !showSubmissionSelector"
          />
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="mt-2"
      >
        <v-col>
          <div class="border">
            <v-row class="name-header">
              <v-col>
                <span>
                  <v-icon
                    size="25"
                    :color="getIssueIconColor(demStudentData?.studentStatusCode)"
                  >
                    {{ getIssueIcon(demStudentData?.studentStatusCode) }}
                  </v-icon>
                  {{ demStudentData?.pen }} - {{ getName(demStudentData?.lastName, demStudentData?.firstName, demStudentData?.middleName) }}
                </span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="2">
                <div>
                  <div class="heading">
                    Student Status
                  </div>
                  <div>{{ demStudentData?.studentStatus }}</div>
                </div>
              </v-col>
              <v-col cols="2">
                <div>
                  <div class="heading">
                    Grade
                  </div>
                  <div>{{ demStudentData?.grade }}</div>
                </div>
              </v-col>
              <v-col cols="2">
                <div>
                  <div class="heading">
                    Grad Req. Year
                  </div>
                  <div>{{ demStudentData?.gradRequirementYear }}</div>
                </div>
              </v-col>
              <v-col cols="2">
                <div>
                  <div class="heading">
                    SCCP Date
                  </div>
                  <div>{{ demStudentData?.schoolCertificateCompletionDate }}</div>
                </div>
              </v-col>
              <v-col>
                <div>
                  <div class="heading">
                    Birthdate
                  </div>
                  <div>{{ formatDate(demStudentData?.birthdate) }}</div>
                </div>
              </v-col>
              <v-col>
                <div>
                  <div class="heading">
                    Gender
                  </div>
                  <div>{{ demStudentData?.gender }}</div>
                </div>
              </v-col>
              <v-col>
                <div>
                  <div class="heading">
                    Local ID
                  </div>
                  <div>{{ demStudentData?.localID }}</div>
                </div>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="2">
                <div>
                  <div class="heading">
                    Citizenship
                  </div>
                  <div>{{ demStudentData?.citizenship }}</div>
                </div>
              </v-col>
              <v-col cols="2">
                <div>
                  <div class="heading">
                    Program Cadre
                  </div>
                  <div>{{ demStudentData?.programCadreFlag }}</div>
                </div>
              </v-col>
              <v-col cols="2">
                <div>
                  <div class="heading">
                    Program Codes
                  </div>
                  <div>
                    <span>{{ getProgramsList() }}</span>
                  </div>
                </div>
              </v-col>
              <v-col>
                <div>
                  <div class="heading">
                    Address
                  </div>
                  <div>
                    <span v-if="demStudentData?.addressLine1">{{ demStudentData?.addressLine1 }}, </span>
                    <span v-if="demStudentData?.addressLine2">{{ demStudentData?.addressLine2 }}, </span>
                    <span v-if="demStudentData?.city">{{ demStudentData?.city }}, </span>
                    <span v-if="demStudentData?.provincialCode">{{ demStudentData?.provincialCode }}, </span>
                    <span v-if="demStudentData?.countryCode">{{ demStudentData?.countryCode }}, </span>
                    <span v-if="demStudentData?.postalCode">{{ demStudentData?.postalCode }} </span>
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>

      <v-row class="mt-3 mb-3">
        <v-col>
          <v-btn-toggle rounded="0">
            <v-btn
              id="courses"
              size="large"
              class="course-button"
              :class="{ 'active-button': view === 'course' }"
              @click="showCourse"
            >
              Courses
            </v-btn>
            <v-btn
              id="assessments"
              size="large"
              class="assessment-button"
              :class="{ 'active-button': view === 'assessment' }"
              @click="showAssessment"
            >
              Assessments
            </v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>
      <div v-if="view === 'course'">
        <CourseTable
          :headers="courseHeaders"
          :data="courseData"
        />
      </div>
      <div v-if="view === 'assessment'">
        <AssessmentTable
          :headers="assessmentHeaders"
          :data="assessmentData"
        />
      </div>
    </div>

    <v-navigation-drawer
      v-model="showSubmissionSelector"
      location="right"
      :temporary="true"
      width="500"
      :persistent="true"
      scrim="transparent"
      :border="true"
      style="top:0; height: 100%;"
      rounded="true"
    >
      <StudentSubmission
        :submissions="filesetStudentSubmissions"
        :selected-submission="selectedSubmission"
        @close="showSubmissionSelector = !showSubmissionSelector"
        @refresh-search="refreshSearch"
      />
    </v-navigation-drawer>
  </v-container>
</template>

<script>
import alertMixin from '../../../../mixins/alertMixin';
import * as Rules from '../../../../utils/institute/formRules';
import CourseTable from '../../CourseTable.vue';
import AssessmentTable from '../../AssessmentTable.vue';
import StudentSubmission from '../../StudentSubmission.vue';
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';
import {isEmpty, omitBy} from 'lodash';
import {LocalDateTime, DateTimeFormatter} from '@js-joda/core';
import Spinner from '../../../common/Spinner.vue';
import {setFailureAlert} from '../../../composable/alertComposable';
import {formatDateTime} from '../../../../utils/format';

export default {
  name: 'GradSchoolStudentSearch',
  components: {
    CourseTable,
    AssessmentTable,
    StudentSubmission,
    Spinner
  },
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: false,
      default: null
    }
  },
  emits: [],
  data() {
    return {
      rules: Rules,
      requestCount: 0,
      view: 'course',
      studentSearched: false,
      studentSearchFormIsValid: false,
      showSubmissionSelector: false,
      courseHeaders: [
        { key: 'status', align: 'start', sortable: true },
        { title: 'Course', key: 'course', align: 'start', sortable: true },
        { title: 'Session', key: 'session', align: 'start', sortable: true },
        { title: 'Status', key: 'courseStatus', align: 'start', sortable: true },
        { title: 'Interim Grade', key: 'interimGrade', align: 'start', sortable: true },
        { title: 'Final Grade', key: 'finalGrade', align: 'start', sortable: true },
        { title: 'Credits', key: 'numberOfCredits', align: 'start', sortable: true },
        { title: 'Description', key: 'courseDescription', align: 'start', sortable: true },
        { title: 'Grad Reqt.', key: 'courseGraduationRequirement', align: 'start', sortable: true },
        { title: 'Type', key: 'courseType', align: 'start', sortable: true },
        { title: 'Related Course', key: 'relatedCourseValue', align: 'start', sortable: true },
      ],
      assessmentHeaders: [
        { key: 'status', align: 'start', sortable: true },
        { title: 'Assessment', key: 'courseCode', align: 'start', sortable: true },
        { title: 'Session', key: 'session', align: 'start', sortable: true },
        { title: 'Status', key: 'courseStatus', align: 'start', sortable: true },
        { title: 'Proficiency Score', key: 'finalPercent', align: 'start', sortable: true },
        { title: 'eExam', key: 'isElectronicExam', align: 'start', sortable: true },
        { title: 'Special Case', key: 'provincialSpecialCase', align: 'start', sortable: true },
        { title: 'Local Course ID', key: 'localCourseID', align: 'start', sortable: true },
      ],
      studentPEN: this.$route.query.pen ?? '',
      selectedSubmission: {},
      filesetStudentSubmissions: [],
      totalFoundSubmissions: 0,
      demStudentData: null,
      assessmentData: [],
      courseData: []
    };
  },
  computed: {
    isLoading() {
      return this.requestCount > 0;
    },
    studentFound() {
      return this.totalFoundSubmissions >= 1;
    },
    selectedSubmissionText() {
      if (isEmpty(this.selectedSubmission)) {
        return 'Not Selected';
      }
      return `Submitted: ${this.selectedSubmission.createDate} ${this.selectedSubmission.createTime}`;
    }
  },
  async created() {
    if (isEmpty(this.studentPEN)) {
      return;
    }
    await this.searchStudent();
  },
  methods: {
    async searchStudent() {
      await this.getStudentSubmissions();
      this.studentSearched = true;
      this.selectDefaultStudentSubmission();
      if (this.filesetStudentSubmissions.length === 0) {
        return;
      }
      await this.findStudentInFilesetByPEN();
    },
    async refreshSearch(selectedSubmission) {
      this.selectedSubmission = selectedSubmission[0];
      await this.findStudentInFilesetByPEN();
    },
    clear() {
      this.studentPEN = '';
      this.$refs.gradSchoolStudentSearchForm.reset();
      this.studentSearched = false;
      this.selectedSubmission = {};
      this.filesetStudentSubmissions = [];
      this.totalFoundSubmissions = 0;
      this.demStudentData = null;
      this.assessmentData = [];
      this.courseData = [];
    },
    async getStudentSubmissions() {
      this.requestCount += 1;
      await ApiService.apiAxios.get(`${ApiRoutes.gdc.BASE_URL}/fileset/${this.$route.params.schoolID}/paginated`, {
        params: {
          pageNumber: 0,
          pageSize: 1000,
          searchParams: omitBy({
            pen: this.studentPEN,
            moreFilters: {}
          }, isEmpty),
          sort: {
            updateDate: 'DESC'
          },
        }
      }).then(response => {
        this.filesetStudentSubmissions = response.data.content;
        this.totalFoundSubmissions = response.data.totalElements;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while trying get to fileset list. Please try again later.');
      }).finally(() => {
        this.requestCount -= 1;
      });
    },
    async findStudentInFilesetByPEN() {
      this.requestCount += 1;
      await ApiService.apiAxios.get(`${ApiRoutes.gdc.BASE_URL}/fileset/${this.$route.params.schoolID}/pen/${this.studentPEN}`, {
        params: {
          incomingFilesetID: this.selectedSubmission.incomingFilesetID,
          schoolID: this.$route.params.schoolID
        }
      }).then(response => {
        this.demStudentData = response.data.demographicStudent;
        this.assessmentData = response.data.assessmentStudents;
        this.courseData = response.data.courseStudents;
      }).catch(error => {
        console.error(error);
        setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get student detail. Please try again later.');
      }).finally(() => {
        this.requestCount -= 1;
      });
    },
    selectDefaultStudentSubmission() {
      if (this.filesetStudentSubmissions.length === 0) {
        this.selectedSubmission = {};
        return;
      }
      let matchingSubmission = this.filesetStudentSubmissions.find((submission) => submission.incomingFilesetID === this.$route.query.incomingFilesetID) ?? this.filesetStudentSubmissions[0];
      this.selectedSubmission = {
        incomingFilesetID: matchingSubmission.incomingFilesetID,
        createDate: formatDateTime(matchingSubmission.createDate.substring(0, 19),'uuuu-MM-dd\'T\'HH:mm:ss','uuuu/MM/dd', false),
        createTime: LocalDateTime.parse(matchingSubmission.createDate).format(DateTimeFormatter.ofPattern('HH:mm')),
        updateUser: matchingSubmission.updateUser
      };
    },
    getProgramsList() {
      let programCodes = [this.demStudentData?.programCode1, this.demStudentData?.programCode2, this.demStudentData?.programCode3, this.demStudentData?.programCode4, this.demStudentData?.programCode5];
      let cleanArray = programCodes.filter(x => x != null);
      return cleanArray.join(', ');
    },
    showCourse() {
      this.view = 'course';
    },
    showAssessment() {
      this.view = 'assessment';
    },
    formatDate(inputDate) {
      return formatDateTime(inputDate, 'uuuuMMdd', 'uuuu/MM/dd', false);
    },
    getName(last, first, middle) {
      if (first && middle) {
        return last + ', ' + first + ' ' + middle;
      } else if (first) {
        return last + ', ' + first;
      } else if (middle) {
        return last + ', ' + middle;
      } else if (last) {
        return last;
      }
      return '';
    },
    getIssueIcon(issue) {
      switch (issue) {
      case 'ERROR':
        return 'mdi-alert-circle-outline';
      case 'WARNING':
        return 'mdi-alert-outline';
      default:
        return '';
      }
    },
    getIssueIconColor(issue) {
      switch (issue) {
      case 'ERROR':
        return '#d90606';
      case 'WARNING':
        return '#2196F3';
      default:
        return '';
      }
    },
  },
};
</script>

<style scoped>
h3 {
 color: #38598a;
}
.border {
border: 2px solid grey;
border-radius: 5px;
padding: 35px;
}

.name-header {
font-weight: bold;
}

.heading {
color: grey;
}

.course-button {
border: 1px solid lightgray;
}

.assessment-button {
border: 1px solid lightgray;
}

.active-button {
background-color: #003366 !important;
color: white !important;
border: 1px solid #003366;
}
.align {
  align-items: flex-end;
}


</style>

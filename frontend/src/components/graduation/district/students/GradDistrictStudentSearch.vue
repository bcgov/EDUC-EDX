<template>
  <v-container fluid>
    <v-row class="mb-1">
      <v-col>
        Select a school from the list below and enter a PEN to search for a student in the collection.
      </v-col>
    </v-row>
    <v-form
      v-model="isValid"
      class="d-flex"
    >
      <v-row>
        <v-col cols="3">
          <SchoolCodeNameFilter
            v-model="schoolNameNumber"
            :items="schoolSearchNames"
          />
        </v-col>
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
            :disabled="!isValid"
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

    <div v-if="noDataFlag">
      <p>Student not found.</p>
    </div>
    <div v-else-if="isLoading">
      <v-row>
        <v-col class="d-flex justify-center">
          <Spinner
            :flat="true"
            style="margin-bottom: 40rem"
          />
        </v-col>
      </v-row>
    </div>
    <div v-else-if="!isLoading && demStudentData">
      <v-row justify="space-between align">
        <v-col
          cols="4"
          class="mb-n5"
        >
          <span class="heading ">
            {{ totalElements }} Submissions Found
          </span>
        </v-col>
        <v-col
          cols="8"
          class="d-flex justify-end mb-n6"
        >
          <v-btn
            id="search"
            color="#1976d2"
            :text="selectedSubmissionText"
            variant="text"
            append-icon="mdi-account-details"
            @click="showSubmission = !showSubmission"
          />
        </v-col>
      </v-row>
      <v-row>
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
                    <span v-if="demStudentData?.programCode1">{{ demStudentData?.programCode1 }}, </span>
                    <span v-if="demStudentData?.programCode2">{{ demStudentData?.programCode2 }}, </span>
                    <span v-if="demStudentData?.programCode3">{{ demStudentData?.programCode3 }}, </span>
                    <span v-if="demStudentData?.programCode4">{{ demStudentData?.programCode4 }}, </span>
                    <span v-if="demStudentData?.programCode5">{{ demStudentData?.programCode5 }}</span>
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
      v-model="showSubmission"
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
        @close="showSubmission= !showSubmission"
        @refresh-search="refreshSearch"
      />
    </v-navigation-drawer>
  </v-container>
</template>

<script>
import alertMixin from '../../../../mixins/alertMixin';
import * as Rules from '../../../../utils/institute/formRules';
import { mapState } from 'pinia';
import {appStore} from '../../../../store/modules/app';
import CourseTable from '../../CourseTable.vue';
import AssessmentTable from '../../AssessmentTable.vue';
import StudentSubmission from '../../StudentSubmission.vue';
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';
import {isEmpty, omitBy} from 'lodash';
import {LocalDateTime, DateTimeFormatter} from '@js-joda/core';
import Spinner from '../../../common/Spinner.vue';
import {setFailureAlert} from '../../../composable/alertComposable';
import SchoolCodeNameFilter from '../../../common/SchoolCodeNameFilter.vue';
import {getStatusAuthorityOrSchool} from '../../../../utils/institute/status';
import {formatDateTime} from '../../../../utils/format';

export default {
  name: 'GradSchoolStudentSearch',
  components: {
    CourseTable,
    AssessmentTable,
    StudentSubmission,
    Spinner,
    SchoolCodeNameFilter
  },
  mixins: [alertMixin],
  props: {
    districtID: {
      type: String,
      required: false,
      default: null
    },
  },
  emits: [],
  data() {
    return {
      rules: Rules,
      studentPEN: null,
      isValid: false,
      schoolNameNumber: null,
      schoolSearchNames: [],
      view: 'course',
      showSubmission: false,
      courseHeaders: [
        { key: 'status', align: 'start'},
        { title: 'Course', key: 'course', align: 'start'},
        { title: 'Session', key: 'session', align: 'end'},
        { title: 'Status', key: 'courseStatus', align: 'end'},
        { title: 'Int. Grade', key: 'interimPercentage', align: 'end'},
        { title: 'Final Grade', key: 'finalPercentage', align: 'end'},
        { title: 'Credits', key: 'numberOfCredits', align: 'end'},
        { title: 'Description', key: 'courseDescription', align: 'end'},
        { title: 'Grad Reqt.', key: 'courseGraduationRequirement', align: 'end'},
        { title: 'Type', key: 'courseType', align: 'end'},
        { title: 'Related Course', key: 'relatedCourse', align: 'end'},
      ],
      assessmentHeaders: [
        { key: 'status', align: 'start'},
        { title: 'Assessment', key: 'courseCode', align: 'start'},
        { title: 'Session', key: 'session', align: 'end'},
        { title: 'Status', key: 'courseStatus', align: 'end'},
        { title: 'Proficiency Score', key: 'finalPercent', align: 'end'},
        { title: 'eExam', key: 'isElectronicExam', align: 'end'},
        { title: 'Special Case', key: 'provincialSpecialCase', align: 'end'},
        { title: 'Local Course ID', key: 'localCourseID', align: 'end'},
      ],
      filterSearchParams: {
        moreFilters: {},
        pen: '',
        schoolID: ''
      },
      filesetStudentSubmissions: [],
      totalElements: 0,
      pageNumber: 1,
      pageSize: 1000,
      demStudentData: null,
      assessmentData: [],
      courseData: [],
      selectedSubmission: {},
      selectedSubmissionText: '',
      isLoading: false,
      noDataFlag: false,
      incomingFilesetID: null
    };
  },
  computed: {
    ...mapState(appStore, ['schoolsMap']),
  },
  async created() {
    appStore().getInstitutesData().finally(() => {
      this.schoolsCacheMap = this.schoolsMap;
      this.getSchoolDropDownItems();
    });
  },
  methods: {
    formatDate(inputDate) {
      return formatDateTime(inputDate,'uuuuMMdd','uuuu/MM/dd', false);
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
        if (school.districtID === this.districtID && school.schoolCategoryCode === 'PUBLIC' && school.canIssueTranscripts === true) {
          if (!school.effectiveDate) {
            return;
          }

          let schoolOpened = new Date(school.effectiveDate);
          let schoolClosed = school.expiryDate ? new Date(school.expiryDate) : null;

          if (schoolOpened <= windowEnd && (!schoolClosed || schoolClosed >= windowStart)) {
            let schoolItem = {
              schoolCodeName: school.mincode + ' - ' + school.schoolName,
              schoolID: school.schoolID,
              status: getStatusAuthorityOrSchool(school)
            };
            this.schoolSearchNames.push(schoolItem);
          }
        }
      });
    },
    async refreshSearch(selectedSubmission) {
      this.incomingFilesetID =  selectedSubmission[0].incomingFilesetID;
      this.selectedSubmission = selectedSubmission[0];
      await this.searchStudent();
    },
    async searchStudent() {
      this.isLoading= true;
      this.noDataFlag=false;
      this.filterSearchParams.pen = this.studentPEN;
      this.filterSearchParams.schoolID = this.schoolNameNumber;
      await this.getStudentSubmissions();
      await this.findStudentInFilesetByPEN();
    },
    async findStudentInFilesetByPEN() {
      await ApiService.apiAxios.get(`${ApiRoutes.gdc.BASE_URL}/fileset/district/${this.$route.params.districtID}/pen/${this.studentPEN}`, {
        params: {
          incomingFilesetID: this.incomingFilesetID,
          schoolID: this.schoolNameNumber
        }
      })
        .then(response => {
          this.isLoading = false;
          if(isEmpty(response.data)) {
            this.noDataFlag=true;
          }
          this.demStudentData = response.data.demographicStudent;
          this.assessmentData = response.data.assessmentStudents;
          this.courseData = response.data.courseStudents;
        }).catch(error => {
          console.error(error);
          this.isLoading = false;
          if(error?.response?.status == 404) {
            this.noDataFlag=true;
          } else {
            setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get student detail. Please try again later.');
          }
        });
    },
    async getStudentSubmissions() {
      await ApiService.apiAxios.get(`${ApiRoutes.gdc.BASE_URL}/fileset/district/${this.$route.params.districtID}/paginated`, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          searchParams: omitBy(this.filterSearchParams, isEmpty),
          sort: {
            updateDate: 'DESC'
          },
        }
      }).then(response => {
        this.filesetStudentSubmissions = response.data.content;
        this.totalElements = response.data.totalElements;
        if(response.data.content.length > 0) {
          this.setIncomingFilesetIDSelection();
        } else {
          this.selectedSubmission = null;
        }
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while trying to fileset list. Please try again later.');
      });
    },
    clear() {
      this.studentPEN = null;
      this.isValid = false;
      this.selectedSubmission = null;
      this.selectedSubmissionText = '';
      this.schoolNameNumber =  null;
    },
    setIncomingFilesetIDSelection() {
      if(isEmpty(this.selectedSubmission)) {
        let createDate =  formatDateTime(this.filesetStudentSubmissions[0].createDate,'uuuu-MM-dd\'T\'HH:mm:ss.SSSSSS','uuuu/MM/dd', false);
          let createTime = LocalDateTime.parse(this.filesetStudentSubmissions[0].createDate).format(DateTimeFormatter.ofPattern('HH:mm'));
          this.selectedSubmissionText = 'Submitted:' + createDate + ' ' + createTime;
          this.selectedSubmission = this.filesetStudentSubmissions[0];
        } else {
          let createDate =  this.selectedSubmission.createDate;
          let createTime = this.selectedSubmission.createTime;
          this.selectedSubmissionText = 'Submitted:' + createDate + ' ' + createTime;
        }
    },
    showCourse() {
      this.view = 'course';
    },
    showAssessment() {
      this.view = 'assessment';
    },
    getName(last, first, middle){
      if(first && middle){
        return last + ', ' + first + ' ' + middle;
      }else if(first){
        return last + ', ' + first;
      }else if(middle){
        return last + ', ' + middle;
      }else if(last){
        return last;
      }
      return '';
    },
    getIssueIcon(issue){
      switch (issue) {
      case 'ERROR':
        return 'mdi-alert-circle-outline';
      case 'WARNING':
        return 'mdi-alert-outline';
      default:
        return '';
      }
    },
    getIssueIconColor(issue){
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

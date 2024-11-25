<template>
  <v-container id="enrollmentTab" fluid>
    <v-row>
      <v-col cols="12">
        <v-row justify="space-between">
          <v-col cols="4" class="found-align">
            <span id="currentPage" class="bold">
              Records Found: {{ totalElements }}
            </span>
          </v-col>
          <v-col cols="8" class="d-flex justify-end">
            <v-btn
              id="filters"
              color="#003366"
              text="Filter"
              class="mr-1 mb-1"
              prepend-icon="mdi-filter-multiple-outline"
              variant="outlined"
              @click="toggleFilters"
            >
              <template #append>
                <v-badge
                  color="error"
                  :content="filterCount"
                  floating
                  offset-y="-10"
                />
              </template>
            </v-btn>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <StudentRegistrationsCustomTable
              :headers="config.tableHeaders"
              :data="assessmentStudents"
              :total-elements="totalElements"
              :is-loading="isLoading"
              :reset="resetFlag"
              :can-load-next="canLoadNext"
              :can-load-previous="canLoadPrevious"
              @reload-registrations="reload"
              @editSelectedRow="editRegistration"
              @loadNext="loadNext"
              @loadPrevious="loadPrevious"
            />
          </v-col>
        </v-row>
      </v-col>
      <v-navigation-drawer
        v-model="showFilters"
        location="right"
        :temporary="true"
        width="700"
        :persistent="true"
        scrim="transparent"
        :border="true"
        style="top: 0; height: 100%"
        rounded="true"
      >
        <StudentRegistrationsFilter
          :filters="config.allowedFilters"
          :school-year-sessions="schoolYearSessions"
          :initial-filter-selection="filterSearchParams?.moreFilters"
          @apply-assessment-filters="applyFilters"
          @clear-assessment-filters="clearFilters"
          @close-assessment-filter="showFilters = !showFilters"
        />
      </v-navigation-drawer>
    </v-row>
    <v-dialog
      v-model="editStudentRegistrationSheet"
      :inset="true"
      :no-click-animation="true"
      :scrollable="true"
      :persistent="true"
      width="40%"
    >
      <StudentRegistrationDetail        
        :selected-student-registration-id="studentRegistrationForEdit?.assessmentStudentID"
        :school-year-sessions="schoolYearSessions"
        @reload-student-registrations="reloadStudentRegistrationsFlag = true"
        @close-student-registration="closeEditAndLoadStudentRegistrations"
      />
    </v-dialog>
  </v-container>
</template>

<script>
import StudentRegistrationsCustomTable from './StudentRegistrationsCustomTable.vue';
import { cloneDeep, isEmpty, omitBy } from 'lodash';
import StudentRegistrationsFilter from './StudentRegistrationsFilter.vue';
import moment from 'moment';
import {SCHOOL_YEAR_REGISTRATIONS_VIEW_DISTRICT, SCHOOL_YEAR_REGISTRATIONS_VIEW_SCHOOL} from '../../../utils/eas/StudentRegistrationTableConfiguration';
import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';
import {authStore} from '../../../store/modules/auth';
import {mapState} from 'pinia';
import StudentRegistrationDetail from './StudentRegistrationDetail.vue';

export default {
  name: 'StudentRegistrations',
  components: {
    StudentRegistrationsCustomTable,
    StudentRegistrationsFilter,
    StudentRegistrationDetail
  },
  props: {
    schoolYear: {
      type: String,
      required: true,
    },
    sessionID: {
      type: String,
      required: false,
      default: null,
    },
    schoolYearSessions: {
      type: Object,
      required: true,
    }
  },
  emits: [],
  data() {
    return {
      config: null,
      assessmentStudents: [],
      filterSearchParams: {
        moreFilters: {},
      },
      showFilters: null,
      isLoading: false,
      totalElements: 0,
      pageNumber: 1,
      pageSize: 15,
      canLoadNext: false,
      canLoadPrevious: false,
      resetFlag: false,
      studentRegistrationForEdit: null,
      reloadStudentRegistrationsFlag: false,
      editStudentRegistrationSheet: false,
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    filterCount() {
      return Object.values(this.filterSearchParams.moreFilters).filter(filter => !!filter ).reduce((total, filter) => total.concat(filter), []).length;
    },
  },
  created() {
    this.applyDefaultFilters();
    this.getAssessmentStudents();
    this.selectTableConfig();
  },
  methods: {
    editRegistration($event) {
      this.studentRegistrationForEdit = cloneDeep($event);
      this.editStudentRegistrationSheet = true;
    },
    closeEditAndLoadStudentRegistrations() {
      this.editStudentRegistrationSheet = !this.editStudentRegistrationSheet;
      if (this.reloadStudentRegistrationsFlag === true) {
        this.getAssessmentStudents();
      }
      this.reloadStudentRegistrationsFlag = false;
    },
    selectTableConfig() {
      this.config = this.userInfo.activeInstituteType === 'DISTRICT' ? SCHOOL_YEAR_REGISTRATIONS_VIEW_DISTRICT : SCHOOL_YEAR_REGISTRATIONS_VIEW_SCHOOL;
    },
    applyDefaultFilters() {
      if (this.sessionID) {
        const activeSession = this.schoolYearSessions.find(
          (session) => session.sessionID === this.sessionID
        );
        this.filterSearchParams.moreFilters.session = [
          { title: moment(activeSession.courseMonth, 'MM').format('MMMM') , id: activeSession.sessionID, value: activeSession.sessionID },
        ];
      }
    },
    getAssessmentStudents() {
      this.loading = true;
      let sort = {assessmentStudentID: 'ASC',};
      let assessmentSearchParams = cloneDeep(this.filterSearchParams);
      if (! this.sessionID) {        
        assessmentSearchParams.moreFilters.schoolYear = [
          { title: 'schoolYear', id: 'schoolYear', value: this.schoolYear },
        ];
      }
      if (this.userInfo.activeInstituteType === 'DISTRICT'){
        assessmentSearchParams.moreFilters.districtID = [
          {title: 'districtID', id: 'districtID', value: this.userInfo.activeInstituteIdentifier}
        ]
      } else {
        assessmentSearchParams.moreFilters.schoolID = [
          {title: 'schoolNameNumber', id: 'schoolID', value: this.userInfo.activeInstituteIdentifier}
        ]
      }
      ApiService.apiAxios
        .get(`${ApiRoutes.eas.GET_ASSESSMENT_STUDENTS_PAGINATED}/${this.userInfo.activeInstituteType}`, {
          params: {
            pageNumber: this.pageNumber - 1,
            pageSize: this.pageSize,
            searchParams: omitBy(assessmentSearchParams, isEmpty),
            sort: sort,
          },
        })
        .then((response) => {
          this.assessmentStudents = response.data.content;
          this.totalElements = response.data.totalElements;
          this.canLoadNext = response.data.last === false;
          this.canLoadPrevious = response.data.first === false;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    applyFilters($event) {
      this.filterSearchParams.moreFilters = cloneDeep($event);
      this.pageNumber = 1;
      this.getAssessmentStudents();
    },
    clearFilters() {
      this.filterSearchParams.moreFilters = {};
      this.pageNumber = 1;
      this.getAssessmentStudents();
    },
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
    loadNext() {
      if (this.canLoadNext) {
        this.pageNumber += 1;
        this.getAssessmentStudents();
      }
    },
    loadPrevious() {
      if (this.canLoadPrevious) {
        this.pageNumber -= 1;
        this.getAssessmentStudents();
      }
    },
    reload(value) {
      if(value?.pageSize) {
        this.pageSize = value?.pageSize;
      } else if(value?.pageNumber) {
        this.pageNumber = value?.pageNumber;
      }
      this.getAssessmentStudents();
    }
  },
};
</script>

<style scoped>
.bold {
  font-weight: bold;
}
.found-align {
  align-self: flex-end;
}
</style>

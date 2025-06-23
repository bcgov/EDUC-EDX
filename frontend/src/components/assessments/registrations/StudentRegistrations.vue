<template>
  <v-container
    id="enrollmentTab"
    fluid
  >
    <v-row>
      <v-col cols="12">
        <v-row justify="space-between">
          <v-col
            cols="4"
            class="found-align"
          >
            <span
              id="currentPage"
              class="bold"
            >
              Records Found: {{ totalElements }}
            </span>
          </v-col>
          <v-col
            cols="8"
            class="d-flex justify-end"
          >
            <v-btn
              id="addStudentReg"
              color="#003366"
              text="Add Registration"
              prepend-icon="mdi-plus"
              class="mr-1 mb-1"
              variant="outlined"
              @click="openCreateStudentRegDialog"
            />
            <v-btn
              id="removeStudentReg"
              color="#003366"
              text="Remove Registration"
              prepend-icon="mdi-minus"
              class="mr-1 mb-1"
              :disabled="selectedAssessmentStudents.length <= 0"
              @click="removeStudents"
            />
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
              :selected-rows="selectedAssessmentStudents"
              :total-elements="totalElements"
              :is-loading="isLoading"
              :reset="resetFlag"
              :can-load-next="canLoadNext"
              :can-load-previous="canLoadPrevious"
              @reload-registrations="reload"
              @editSelectedRow="editRegistration"
              @loadNext="loadNext"
              @loadPrevious="loadPrevious"
              @selected-rows-changed="updateSelectedAssessmentStudents"
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
    <v-bottom-sheet
      v-model="newStudentRegistrationSheet"
      :inset="true"
      :no-click-animation="true"
      :persistent="true"
      max-height="90vh"
    >
      <AddStudentRegistration
        :session-id="sessionID"
        :school-year-sessions="schoolYearSessions"
        @reload-student-registrations="reloadStudentRegistrationsFlag = true"
        @close-new-student-registration="closeNewAndLoadStudentRegistrations"
        @update:sessionID="sessionID = $event"
      />
    </v-bottom-sheet>
    <v-bottom-sheet
      v-model="editStudentRegistrationSheet"
      :inset="true"
      :no-click-animation="true"
      :scrollable="true"
      :persistent="true"
    >
      <StudentRegistrationDetail
        :selected-student-registration-id="studentRegistrationForEdit?.assessmentStudentID"
        :school-year-sessions="schoolYearSessions"
        @reload-student-registrations="reloadStudentRegistrationsFlag = true"
        @close-student-registration="closeEditAndLoadStudentRegistrations"
      />
    </v-bottom-sheet>
  </v-container>
  <ConfirmationDialog ref="confirmRemovalOfStudentRegistrations">
    <template #message>
      <p>You have selected one or more registrations to remove. This action cannot be undone. Please confirm that you would like to proceed.</p>
    </template>
  </ConfirmationDialog>
</template>

<script>
import StudentRegistrationsCustomTable from './StudentRegistrationsCustomTable.vue';
import { cloneDeep, isEmpty, omitBy, capitalize } from 'lodash';
import StudentRegistrationsFilter from './StudentRegistrationsFilter.vue';
import { Month } from '@js-joda/core';
import {SCHOOL_YEAR_REGISTRATIONS_VIEW_DISTRICT, SCHOOL_YEAR_REGISTRATIONS_VIEW_SCHOOL} from '../../../utils/eas/StudentRegistrationTableConfiguration';
import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';
import {authStore} from '../../../store/modules/auth';
import {mapState} from 'pinia';
import StudentRegistrationDetail from './StudentRegistrationDetail.vue';
import AddStudentRegistration from './forms/AddStudentRegistration.vue';
import {setFailureAlert, setSuccessAlert} from '../../composable/alertComposable';
import ConfirmationDialog from '../../util/ConfirmationDialog.vue';

export default {
  name: 'StudentRegistrations',
  components: {
    ConfirmationDialog,
    AddStudentRegistration,
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
      selectedAssessmentStudents: [],
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
      newStudentRegistrationSheet: false,
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
    closeNewAndLoadStudentRegistrations(){
      this.newStudentRegistrationSheet = !this.newStudentRegistrationSheet;
      this.getAssessmentStudents();
    },
    openCreateStudentRegDialog() {
      this.newStudentRegistrationSheet = !this.newStudentRegistrationSheet;
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
          { title: capitalize(Month.of(activeSession.courseMonth).toString()) , id: activeSession.sessionID, value: activeSession.sessionID },
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
      ApiService.apiAxios
        .get(`${ApiRoutes.assessments.ASSESSMENT_REGISTRATIONS}/${this.userInfo.activeInstituteType.toLowerCase()}/students/paginated`, {
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
    async removeStudents() {
      const confirmation = await this.$refs.confirmRemovalOfStudentRegistrations.open('Confirm Registration Removal', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Remove Registration(s)', rejectText: 'Cancel'});
      if (!confirmation) {
        return;
      }
      this.loading = true;
      let payload = this.selectedAssessmentStudents.map(sas => sas.assessmentStudentID);
      ApiService.apiAxios.post(`${ApiRoutes.assessments.ASSESSMENT_REGISTRATIONS}/${this.userInfo.activeInstituteType.toLowerCase()}/students/remove`, payload)
        .then(() => {
          setSuccessAlert('The registrations have been removed.');
          this.selectedAssessmentStudents = [];
          this.getAssessmentStudents();
        }).catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to remove the registrations. Please try again later.');
        }).finally(() => {
          this.loading = false;
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
        this.selectedAssessmentStudents = [];
        this.getAssessmentStudents();
      }
    },
    loadPrevious() {
      if (this.canLoadPrevious) {
        this.pageNumber -= 1;
        this.selectedAssessmentStudents = [];
        this.getAssessmentStudents();
      }
    },
    reload(value) {
      if(value?.pageSize) {
        this.pageSize = value?.pageSize;
      } else if(value?.pageNumber) {
        this.pageNumber = value?.pageNumber;
      }
      this.selectedAssessmentStudents = [];
      this.getAssessmentStudents();
    },
    updateSelectedAssessmentStudents(updatedSelectedAssessmentStudents) {
      this.selectedAssessmentStudents = updatedSelectedAssessmentStudents;
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

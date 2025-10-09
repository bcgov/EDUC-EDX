<template>
  <v-container
    id="enrollmentTab"
    fluid
  >
    <v-row v-if="activeSession.assessmentRegistrationsExportDate !== null">
      <v-col class="pb-0">
        <v-alert
          density="compact"
          type="info"
          variant="tonal"
        >
          <span>Registrations for the {{ activeSession?.courseYear }}/{{ activeSession?.courseMonth }} session were transferred to e-Assessments System on 
            {{ activeSession?.assessmentRegistrationsExportDate.substring(0,19).replaceAll('-', '/').replaceAll('T', ' ') }}. Any changes made here or through XAM file submissions after that date will not appear in e-Assessments System unless schools enter them directly.</span>
        </v-alert>
      </v-col>
    </v-row>
    <v-row v-if="activeSession.assessmentRegistrationsExportDate !== null">
      <v-col class="d-flex justify-end pt-0">
        <v-dialog max-width="700">
          <template #activator="{ props: activatorProps }">
            <v-btn
              v-bind="activatorProps"
              text="More Info"
              variant="text"
              prepend-icon="mdi-dots-horizontal"
            />
          </template>
          <template #default="{ isActive }">
            <v-card>
              <v-card-title class="sheetHeader pt-1 pb-1">
                <v-row no-gutters>
                  <v-col class="d-flex justify-start">
                    Graduation Assessment Registration – Key Steps
                  </v-col>
                  <v-col class="d-flex justify-end">
                    <v-btn
                      id="cancel"
                      color="white"
                      text="Close"
                      size="30"
                      icon="mdi-close"
                      variant="tonal"
                      @click="isActive.value = false"
                    />
                  </v-col>
                </v-row>
              </v-card-title>
              <v-divider />
              <v-card-text>
                <ol class="pa-5">
                  <li>
                    <strong>Scheduling Students for a Grad Assessment</strong>
                    <ul class="pl-5">
                      <li>Add students in your school information system (SIS).</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Submitting via EDX Grad Data Collection</strong>
                    <ul class="pl-5">
                      <li>Upload DEM, CRS, and XAM files. Include assessment registrations, with a valid session date, in the XAM file.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Managing Registrations in EDX*</strong>
                    <ul class="pl-5">
                      <li>Confirm, add, or delete student registrations for any future session in the current school year.</li>
                      <li><strong>Transfer to EAS:</strong> Before each session, registrations are copied from EDX into the e-Assessment System (EAS). When this happens, a notice will appear in EDX.</li>
                      <li>
                        <strong>After EAS transfer:</strong> After the EDX registration transfer, administrators will be invited to log in to EAS. New or changed registrations should be updated in:
                        <ul class="pl-5">
                          <li>EAS to ensure students can write the assessment, and</li>
                          <li>EDX to help keep graduation projection reports accurate, but this is not required.</li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ol>
                <p><strong>*Important:</strong> Keep your SIS in sync with any changes in EDX. Changes made only in EDX may be overwritten by your next Graduation Data Collection File upload.</p>
              </v-card-text>
            </v-card>
          </template>
        </v-dialog>
      </v-col>
    </v-row>
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
              v-if="hasEditPermission"
              @click="openCreateStudentRegDialog"
            />
            <v-btn
              id="removeStudentReg"
              color="#003366"
              text="Remove Registration"
              variant="outlined"
              prepend-icon="mdi-trash-can-outline"
              class="mr-1 mb-1"
              v-if="hasEditPermission"
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
              :active-session="activeSession"
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
        :active-session="activeSession"
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
        :active-session="activeSession"
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
import {PERMISSION} from '../../../utils/constants/Permission';

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
      activeSession: null
    };
  },
  watch: {
    schoolYearSessions: {
      handler(value) {
        if(value.length > 0) {
          let sessionArray = value.filter(sch => sch.isOpen);
          sessionArray = sessionArray.sort((a, b) => {
            // Compare years first
            const yearDiff = Number(a.courseYear) - Number(b.courseYear);
            if (yearDiff !== 0) return yearDiff;
            // If years are equal, compare months
            return Number(a.courseMonth) - Number(b.courseMonth);
          });
          this.activeSession = sessionArray[0];
        }
      },
      immediate: true
    }
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    filterCount() {
      return Object.values(this.filterSearchParams.moreFilters).filter(filter => !!filter ).reduce((total, filter) => total.concat(filter), []).length;
    },
    hasEditPermission(){
      return (this.userInfo?.activeInstitutePermissions?.filter(perm => perm === PERMISSION.EAS_SCH_EDIT || perm === PERMISSION.EAS_DIS_EDIT).length > 0);
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
      if (this.activeSession) {
        this.filterSearchParams.moreFilters.session = [
          { title: capitalize(Month.of(this.activeSession.courseMonth).toString()) , id: this.activeSession.sessionID, value: this.activeSession.sessionID }
        ];
        this.filterSearchParams.moreFilters.schoolYear = [
          { title: 'schoolYear', id: 'schoolYear', value: this.schoolYear },
        ];
      }
    },
    getAssessmentStudents() {
      this.isLoading = true;
      let sort = {assessmentStudentID: 'ASC',};
      let assessmentSearchParams = cloneDeep(this.filterSearchParams);
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
      this.isLoading = true;
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
      this.applyDefaultFilters();
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

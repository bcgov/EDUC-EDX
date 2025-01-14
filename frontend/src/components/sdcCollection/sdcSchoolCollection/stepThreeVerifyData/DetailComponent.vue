<template>
  <v-row>
    <v-col cols="12">
      <v-row justify="space-between">
        <v-col
          cols="4"
          class="found-align"
        >
          <span
            id="studentsFound"
            class="bold"
          >Students Found:  {{ totalElements }}
          </span>
          <router-link
            v-if="showExportBtn"
            class="ml-2"
            :to="{ path: downloadReportURL() }"
            target="_blank"
          >
            <v-icon
              small
              class="ml-1"
              color="#003366"
            >
              mdi-tray-arrow-down
            </v-icon>
            <span class="export">Export All Student Records</span>
          </router-link>
        </v-col>
        <v-col
          cols="8"
          class="d-flex justify-end"
        >
          <v-btn
            v-if="isCollectionActive && !isSubmitted"
            id="add"
            color="#003366"
            text="Add Student"
            class="mr-1 mb-1"
            prepend-icon="mdi-plus"
            variant="outlined"
            :disabled="!hasEditPermission"
            @click="addStudent"
          />
          <v-btn
            v-if="isCollectionActive && !isSubmitted"
            id="remove"
            color="#003366"
            class="mr-1 mb-1"
            text="Remove"
            prepend-icon="mdi-delete"
            variant="outlined"
            :disabled="selectedStudents.length === 0 || !hasEditPermission"
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
          <CustomTable
            :headers="config.tableHeaders"
            :data="studentList"
            :total-elements="totalElements"
            :is-loading="isLoading"
            :reset="resetFlag"
            :school-collection="schoolCollection" 
            :disable-select="!isCollectionActive || isSubmitted"           
            @reload="reload"
            @editSelectedRow="editStudent"
            @selections="selectedStudents = $event"
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
      style="top:0; height: 100%;"
      rounded="true"
    >
      <Filters
        :filters="config.allowedFilters"
        :school="school"
        @apply-filters="applyFilters"
        @clear-filters="clearFilters"
        @close="showFilters= !showFilters"
      />
    </v-navigation-drawer>
  </v-row>
  <v-bottom-sheet
    v-model="editStudentSheet"
    :inset="true"
    :no-click-animation="true"
    :scrollable="true"
    :persistent="true"
  >
    <ViewStudentDetailsComponent
      :selected-student-ids="studentForEdit"
      :is-final-sign-off="isFinalSignOff"
      @reload-students="reloadStudentsFlag = true"
      @close="closeEditAndLoadStudents"
    />
  </v-bottom-sheet>
  <v-bottom-sheet
    v-model="addStudentSheet"
    :inset="true"
    :no-click-animation="true"
    :scrollable="true"
    :persistent="true"
  >
    <AddStudentDetails
      @reload-students="reloadStudentsFlag = true"
      @close="closeAddAndLoadStudents"
      @open-edit="closeAddStudentWindow"
    />
  </v-bottom-sheet>
  <ConfirmationDialog ref="confirmRemovalOfStudentRecord">
    <template #message>
      <p>Are you sure that you would like to remove the selected student(s) from the 1701 submission?</p>
    </template>
  </ConfirmationDialog>
</template>

<script>
import alertMixin from '../../../../mixins/alertMixin';
import CustomTable from '../../../common/CustomTable.vue';
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';
import {cloneDeep, isEmpty, omitBy} from 'lodash';
import {mapState} from 'pinia';
import {sdcCollectionStore} from '../../../../store/modules/sdcCollection';
import Filters from '../../../common/Filters.vue';
import {setFailureAlert, setSuccessAlert} from '../../../composable/alertComposable';
import ConfirmationDialog from '../../../util/ConfirmationDialog.vue';
import ViewStudentDetailsComponent from '../../../common/ViewStudentDetailsComponent.vue';
import AddStudentDetails from './AddStudentDetails.vue';
import {PERMISSION} from '../../../../utils/constants/Permission';
import {authStore} from '../../../../store/modules/auth';

export default {
  name: 'DetailComponent',
  components: {
    ConfirmationDialog,
    CustomTable,
    Filters,
    ViewStudentDetailsComponent,
    AddStudentDetails
  },
  mixins: [alertMixin],
  props: {
    config: {
      tabFilter: Object,
      required: true,
      type: Object,
      default: null
    },
    school: {
      type: Object,
      required: true,
      default: null
    },
    showExportBtn: {
      type: Boolean,
      default: false
    },
    isFinalSignOff: {
      type: Boolean,
      required: false
    },
    isCollectionActive: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  emits: [],
  data() {
    return {
      chip: true,
      pageNumber: 1,
      pageSize: 15,
      studentList: [],
      isLoading: false,
      totalElements: 0,
      selectedStudents: [],
      filterSearchParams: {
        tabFilter: this.config.defaultFilter,
        notSdcSchoolCollectionStudentStatusCode: 'ERROR,DELETED',
        moreFilters: {}
      },
      showFilters: null,
      studentForEdit: [],
      editStudentSheet: false,
      addStudentSheet: false,
      resetFlag: false,
      reloadStudentsFlag: false,
      submittedStatuses: ['SUBMITTED', 'P_DUP_POST', 'P_DUP_VRFD', 'COMPLETED']
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(sdcCollectionStore, ['schoolCollection','schoolFundingCodesMap', 'enrolledProgramCodesMap', 'careerProgramCodesMap', 'bandCodesMap', 'specialEducationCodesMap']),
    filterCount() {
      return Object.values(this.filterSearchParams.moreFilters).filter(filter => !!filter).reduce((total, filter) => total.concat(filter), []).length;
    },
    hasEditPermission(){
      return (this.userInfo?.activeInstitutePermissions?.filter(perm => perm === PERMISSION.SCHOOL_SDC_EDIT).length > 0);
    },
    isSubmitted(){
      return this.submittedStatuses.includes(this.schoolCollection?.sdcSchoolCollectionStatusCode);
    }
  },
  created() {
    sdcCollectionStore().getCodes().then(() => {
      this.loadStudents();
    });

  },
  methods: {
    downloadReportURL() {
      return `${ApiRoutes.sdc.BASE_URL}/${this.$route.params.schoolCollectionID}/report/csv_school/download`;
    },
    editStudent($event) {
      const selectedStudent = cloneDeep($event);
      this.studentForEdit.splice(0);
      this.studentForEdit.push(selectedStudent?.sdcSchoolCollectionStudentID);
      this.editStudentSheet = true;
    },
    closeEditAndLoadStudents() {
      this.editStudentSheet = !this.editStudentSheet;
      if (this.reloadStudentsFlag === true) {
        this.loadStudents();
      }
      this.reloadStudentsFlag = false;
    },
    closeAddAndLoadStudents() {
      this.addStudentSheet = !this.addStudentSheet;
      if (this.reloadStudentsFlag === true) {
        this.loadStudents();
      }
      this.reloadStudentsFlag = false;
    },
    closeAddStudentWindow($event) {
      this.addStudentSheet = !this.addStudentSheet; 
      this.editStudent($event);
    },
    addStudent() {
      this.addStudentSheet = true;
    },
    applyFilters($event) {
      this.filterSearchParams.moreFilters = cloneDeep($event);
      this.loadStudents();
    },
    clearFilters() {
      this.filterSearchParams.moreFilters = {};
      this.loadStudents();
    },
    async removeStudents(){
      this.resetFlag = false;
      const confirmation = await this.$refs.confirmRemovalOfStudentRecord.open('Confirm Removal of Student Record(s)', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Yes', rejectText: 'No'});
      if (!confirmation) {
        return;
      }
      this.loadingCount += 1;
      ApiService.apiAxios.post(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${this.$route.params.schoolCollectionID}/students/remove`, this.selectedStudents.map(stud => stud.sdcSchoolCollectionStudentID))
        .then(() => {
          this.selectedStudents = [];
          this.loadStudents();
          setSuccessAlert('Success! The students have been removed.');
        }).catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to remove students. Please try again later.');
        }).finally(() => {
          this.loadingCount -= 1;
          this.resetFlag = true;
          this.reloadStudentsFlag = true;
        });
    },
    loadStudents() {
      this.isLoading= true;
      ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${this.$route.params.schoolCollectionID}/paginated?tableFormat=true`, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          searchParams: omitBy(this.filterSearchParams, isEmpty),
          sort: {
            legalLastName: 'ASC'
          },
        }
      }).then(response => {
        this.studentList = response.data.content;
        this.totalElements = response.data.totalElements;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while trying to retrieve students list. Please try again later.');
      }).finally(() => {
        this.isLoading = false;
      });
    },
    toggleFilters() {
      this.showFilters= !this.showFilters;
    },
    reload(value) {
      if(value?.pageSize) {
        this.pageSize = value?.pageSize;
      } else if(value?.pageNumber) {
        this.pageNumber = value?.pageNumber;
      }
      this.loadStudents();
    },
  }
};
</script>

<style scoped>
.search-box {
  background: rgb(235, 237, 239);
  border-radius: 8px;
  padding: 10px;
}

.filter-col {
  color: #7f7f7f;
}

.bold {
  font-weight: bold ;
}

.found-align {
  align-self: flex-end;
}

.chip-margin {
  margin-right: 5px;
  margin-bottom: 5px;
  color: #003366;
}

.export {
  margin-left: 1px;
  color: #003366;
}
</style>

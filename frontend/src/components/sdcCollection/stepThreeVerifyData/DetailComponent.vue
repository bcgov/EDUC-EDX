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
            <v-icon
              small
              class="ml-1"
              color="#003366"
            >
              mdi-tray-arrow-down
            </v-icon>
          </span>
        </v-col>
        <v-col
          cols="8"
          class="d-flex justify-end"
        >
          <v-btn
            id="add"
            color="#003366"
            text="Add Student"
            class="mr-1 mb-1"
            prepend-icon="mdi-plus"
            variant="outlined"
            @click="addStudent"
          />
          <v-btn
            id="remove"
            color="#003366"
            class="mr-1 mb-1"
            text="Remove"
            prepend-icon="mdi-delete"
            variant="outlined"
            :disabled="selectedStudents.length === 0"
            @click="removeStudents"
          />
          <v-btn
            id="bulkEdit"
            color="#003366"
            class="mr-1 mb-1"
            text="Bulk Edit"
            prepend-icon="mdi-pencil-outline"
            variant="outlined"
            :disabled="selectedStudents.length < 2"
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
      @close="editStudentSheet = !editStudentSheet; loadStudents()"
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
      @close="addStudentSheet = !addStudentSheet; loadStudents()"
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
import alertMixin from '../../../mixins/alertMixin';
import CustomTable from '../../common/CustomTable.vue';
import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';
import {isEmpty, omitBy, cloneDeep} from 'lodash';
import {mapState} from 'pinia';
import {sdcCollectionStore} from '../../../store/modules/sdcCollection';
import {enrolledProgram} from '../../../utils/sdc/enrolledProgram';
import Filters from '../../common/Filters.vue';
import {setFailureAlert, setSuccessAlert} from '../../composable/alertComposable';
import ConfirmationDialog from '../../util/ConfirmationDialog.vue';
import ViewStudentDetailsComponent from './ViewStudentDetailsComponent.vue';
import AddStudentDetails from './AddStudentDetails.vue';

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
        sdcSchoolCollectionStudentStatusCode: 'INFOWARN,FUNDWARN,VERIFIED',
        moreFilters: []
      },
      showFilters: null,
      studentForEdit: [],
      editStudentSheet: false,
      addStudentSheet: false,
      resetFlag: false,
      filterCount: 0
    };
  },
  computed: {
    ...mapState(sdcCollectionStore, ['schoolFundingCodesMap', 'enrolledProgramCodesMap', 'careerProgramCodesMap', 'bandCodesMap', 'specialEducationCodesMap']),
  },
  created() {
    sdcCollectionStore().getCodes().then(() => {
      this.loadStudents();
    });

  },
  methods: {
    editStudent($event) {
      const selectedStudent = cloneDeep($event);
      this.studentForEdit.splice(0);
      this.studentForEdit.push(selectedStudent?.sdcSchoolCollectionStudentID);
      this.editStudentSheet = true;
    },
    closeAddStudentWindow($event) {
      this.addStudentSheet = !this.addStudentSheet; 
      this.editStudent($event);
    },
    addStudent() {
      this.addStudentSheet = true;
    },
    applyFilters($event) {
      const clonedFilter = cloneDeep($event);
      this.filterSearchParams.moreFilters = clonedFilter;
      let allFilterValues = clonedFilter.map(filter => filter.value).flat();
      this.filterCount = allFilterValues.length;
      this.loadStudents();
    },
    clearFilters() {
      this.filterSearchParams.moreFilters = [];
      this.filterCount = 0;
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
        });
    },
    loadStudents() {
      this.isLoading= true;
      ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${this.$route.params.schoolCollectionID}/paginated`, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          searchParams: omitBy(this.filterSearchParams, isEmpty),
          sort: {
            sdcSchoolCollectionStudentID: 'ASC'
          },
        }
      }).then(response => {
        this.studentList = response.data.content.map(this.toTableRow);
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
    enrolledProgramMapping(student, enrolledProgramFilter) {
      if(!student.enrolledProgramCodes) {
        return '';
      }
      return student.enrolledProgramCodes
        .match(/.{1,2}/g)
        .filter(programCode => enrolledProgramFilter.includes(programCode))
        .map(programCode => {
          const enrolledProgram = this.enrolledProgramCodesMap.get(programCode);
          return enrolledProgram ? `${enrolledProgram.description} (${programCode})` : programCode;
        })
        .join(',');
    },
    toTableRow(student) {
      student.mappedSpedCode = this.specialEducationCodesMap.get(student.specialEducationCategoryCode) !== undefined ? `${this.specialEducationCodesMap.get(student.specialEducationCategoryCode)?.description} (${this.specialEducationCodesMap.get(student.specialEducationCategoryCode)?.specialEducationCategoryCode})` : null;
      student.mappedAncestryIndicator = student.nativeAncestryInd === null ? null : this.nativeAncestryInd(student);
      student.mappedFrenchEnrolledProgram = this.enrolledProgramMapping(student, enrolledProgram.FRENCH_ENROLLED_PROGRAM_CODES);
      student.mappedEllEnrolledProgram = this.enrolledProgramMapping(student, enrolledProgram.ENGLISH_ENROLLED_PROGRAM_CODES);
      student.careerProgram = this.enrolledProgramMapping(student, enrolledProgram.CAREER_ENROLLED_PROGRAM_CODES);
      student.mappedIndigenousEnrolledProgram = this.enrolledProgramMapping(student, enrolledProgram.INDIGENOUS_ENROLLED_PROGRAM_CODES);
      student.mappedBandCode = this.bandCodesMap.get(student.bandCode) !== undefined ? `${this.bandCodesMap.get(student.bandCode)?.description} (${this.bandCodesMap.get(student.bandCode)?.bandCode})` : null;
      student.careerProgramCode = this.careerProgramCodesMap.get(student.careerProgramCode) !== undefined ? `${this.careerProgramCodesMap.get(student.careerProgramCode)?.description} (${this.careerProgramCodesMap.get(student.careerProgramCode)?.careerProgramCode})` : null;
      student.mappedSchoolFunding = this.schoolFundingCodesMap.get(student.schoolFundingCode) !== undefined ? `${this.schoolFundingCodesMap.get(student.schoolFundingCode)?.description} (${this.schoolFundingCodesMap.get(student.schoolFundingCode)?.schoolFundingCode})` : null;
      student.indProgramEligible = student.indigenousSupportProgramNonEligReasonCode !== null ? 'No' : 'Yes';
      student.frenchProgramEligible = student.frenchProgramNonEligReasonCode !== null ? 'No' : 'Yes';
      student.ellProgramEligible = student.ellNonEligReasonCode !== null ? 'No' : 'Yes';
      student.careerProgramEligible = student.careerProgramNonEligReasonCode !== null ? 'No' : 'Yes';
      student.spedProgramEligible = student.specialEducationNonEligReasonCode !== null ? 'No' : 'Yes';
      student.yearsInEll = student.sdcStudentEll ? student.sdcStudentEll.yearsInEll : '';
      let noOfCourses = student.numberOfCourses;
      if(noOfCourses && noOfCourses.length === 4) {
        student.mappedNoOfCourses = (Number.parseInt(noOfCourses) / 100).toFixed(2);
      }
      return student;
    },
    nativeAncestryInd(student) {
      return student.nativeAncestryInd === 'Y' ? 'Yes' : 'No';
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
</style>

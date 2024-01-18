<template>
  <v-row>
    <v-col cols="12">
      <v-row
        id="search-box"
        class="search-box mt-2"
      > 
        <v-col cols="12">
          <v-row>
            <v-col
              class="d-flex justify-start"
              cols="4"
            >
              <v-text-field
                v-model="penLocalIdNameFilter"
                label="PEN or Local ID or Name"
                color="primary"
                variant="underlined"
              />
            </v-col>

            <v-col
              class="d-flex justify-start filter-col"
              cols="6"
            >
              <p v-if="config.defaultFilter.description === '' && filterSearchParams.moreFilters.length == 0">
                No filters applied
              </p>

              <span v-if="filterSearchParams.moreFilters.length > 0 || config.defaultFilter.description != ''">
                <v-chip-group>
                  <v-chip v-if="config.defaultFilter.description"
                    class="chip-margin"
                  >
                    {{ config.defaultFilter.description }}
                  </v-chip>
                  <span
                    v-for="(filter, index) in filterSearchParams.moreFilters"
                    :key="index"
                  >
                    <v-chip
                      v-for="(val, i) in filter.value"
                      :key="i"
                      append-icon="mdi-close-circle"
                      class="chip-margin"
                      @click="removeFilter(filter.key, val.title);"
                    >
                      {{ val.title }}
                    </v-chip>
                  </span>
                </v-chip-group>
              </span>
            </v-col>
            <v-col
              class="d-flex justify-end"
              cols="2"
            >
              <PrimaryButton
                id="filters"
                secondary
                large-icon
                icon="mdi-filter-multiple-outline"
                text="Filters"
                :click-action="toggleFilters"
                class="mt-n1"
              />
            </v-col>
          </v-row>
          <v-row class="mt-n2">
            <v-col>
              <PrimaryButton
                id="clear"
                secondary
                text="Clear"
                :click-action="clear"
              />
              <PrimaryButton
                id="search"
                text="Search"
                class="ml-3"
                :click-action="search"
              />
            </v-col>
          </v-row>
        </v-col>
        <v-row />
      </v-row>

      <v-row justify="space-between">
        <v-col cols="4">
          <span
            id="studentsFound"
            class="bold"
          >Students Found:  {{ totalElements }} </span>
          <v-icon
            small
            class="ml-1"
            color="#003366"
          >
            mdi-tray-arrow-down
          </v-icon>
        </v-col>
        <v-col
          cols="8"
          class="d-flex justify-end"
        >
          <PrimaryButton
            id="add"
            secondary
            text="Add Student"
            class="mr-1 mb-1"
            large-icon
            icon="mdi-plus"
          />

          <PrimaryButton
            id="remove"
            secondary
            text="Remove"
            class="mr-1 mb-1"
            large-icon
            icon="mdi-delete"
          />

          <PrimaryButton
            id="edit"
            secondary
            text="Bulk Edit"
            class="mr-1 mb-1"
            large-icon
            icon="mdi-pencil-outline"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <CustomTable
            :headers="config.tableHeaders"
            :data="studentList"
            :total-elements="totalElements"
            :is-loading="isLoading"
            @reload="reload"
          />
        </v-col>
      </v-row>
    </v-col>
    <v-navigation-drawer
      v-model="showFilters"
      location="right"
      temporary
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
        :updated-filters="updatedFilters"
        @close-filters="updateFilters"
      />
    </v-navigation-drawer>
  </v-row>
</template>

<script>
import alertMixin from '../../../mixins/alertMixin';
import PrimaryButton from '../../util/PrimaryButton.vue';
import CustomTable from '../../common/CustomTable.vue';
import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';
import {capitalize, isEmpty, omitBy} from 'lodash';
import {mapState} from 'pinia';
import {sdcCollectionStore} from '../../../store/modules/sdcCollection';
import {enrolledProgram} from '../../../utils/sdc/enrolledProgram';
import Filters from '../../common/Filters.vue';

export default {
  name: 'DetailComponent',
  components: {
    PrimaryButton,
    CustomTable,
    Filters
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
      pageSize: 50,
      studentList: [],
      isLoading: false,
      totalElements: 0,
      penLocalIdNameFilter: null,
      filterSearchParams: {
        tabFilter: this.config.defaultFilter,
        sdcSchoolCollectionStudentStatusCode: 'INFOWARN,FUNDWARN,VERIFIED',
        moreFilters: []
      },
      showFilters:null,
      updatedFilters:[]
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
    updateFilters($event) {
      this.showFilters=!this.showFilters;
      this.filterSearchParams.moreFilters = $event;
      this.loadStudents();
    },
    removeFilter(toRemoveKey, toRemoveValue) {
      let filteredKey = this.filterSearchParams.moreFilters.find(value => value.key === toRemoveKey);
      if(filteredKey?.value?.length == 1) {
        const idx =this.filterSearchParams.moreFilters.findIndex(value => value.key === toRemoveKey);
        this.filterSearchParams.moreFilters.splice(idx, 1);
      } else {
        this.filterSearchParams.moreFilters.map(filter => {
          if(filter.key === toRemoveKey) {
            filter.value.splice(filter.value.findIndex(value => value.title === toRemoveValue), 1);
          }
        });
      }
      this.updatedFilters.splice();
      this.updatedFilters = [...this.filterSearchParams.moreFilters];
      this.loadStudents();
    },
    loadStudents() {
      this.isLoading= true;
      ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${this.$route.params.schoolCollectionID}/paginated`, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          searchParams: omitBy(this.filterSearchParams, isEmpty),
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
          return enrolledProgram ? `${programCode}-${capitalize(enrolledProgram.description)}` : programCode;
        })
        .join('\n');
    },
    toTableRow(student) {
      student.mappedSpedCode = this.specialEducationCodesMap.get(student.specialEducationCategoryCode) !== undefined ? this.specialEducationCodesMap.get(student.specialEducationCategoryCode)?.specialEducationCategoryCode + '-' +  capitalize(this.specialEducationCodesMap.get(student.specialEducationCategoryCode)?.description) : null;
      student.mappedAncestryIndicator = student.nativeAncestryInd === null ? null : this.nativeAncestryInd(student);
      student.mappedFrenchEnrolledProgram = this.enrolledProgramMapping(student, enrolledProgram.FRENCH_ENROLLED_PROGRAM_CODES);
      student.mappedEllEnrolledProgram = this.enrolledProgramMapping(student, enrolledProgram.ENGLISH_ENROLLED_PROGRAM_CODES);
      student.careerProgram = this.enrolledProgramMapping(student, enrolledProgram.CAREER_ENROLLED_PROGRAM_CODES);
      student.mappedIndigenousEnrolledProgram = this.enrolledProgramMapping(student, enrolledProgram.INDIGENOUS_ENROLLED_PROGRAM_CODES);
      student.mappedBandCode = this.bandCodesMap.get(student.bandCode) !== undefined ? this.bandCodesMap.get(student.bandCode)?.bandCode + '-' + capitalize(this.bandCodesMap.get(student.bandCode)?.description) : null;
      student.careerProgramCode = this.careerProgramCodesMap.get(student.careerProgramCode) !== undefined ? this.careerProgramCodesMap.get(student.careerProgramCode)?.careerProgramCode + '-' +  capitalize(this.careerProgramCodesMap.get(student.careerProgramCode)?.description) : null;
      student.mappedSchoolFunding = this.schoolFundingCodesMap.get(student.schoolFundingCode) !== undefined ? this.schoolFundingCodesMap.get(student.schoolFundingCode)?.schoolFundingCode + '-' +  this.schoolFundingCodesMap.get(student.schoolFundingCode)?.description : null;
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

    search() {
      this.filterSearchParams.penLocalIdNameFilter = this.penLocalIdNameFilter;
      this.loadStudents();
    },

    clear() {
      this.penLocalIdNameFilter = null;
      this.filterSearchParams.penLocalIdNameFilter = this.penLocalIdNameFilter;
      this.loadStudents();
    }

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

.chip-margin {
  margin-right: 5px;
  margin-bottom: 5px;
  color: #003366;
}
</style>

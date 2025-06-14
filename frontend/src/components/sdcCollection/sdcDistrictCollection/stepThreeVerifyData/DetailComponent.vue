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
        </v-col>
        <v-col
          cols="8"
          class="d-flex justify-end"
        >
          <v-btn
            v-if="showExportBtn"
            id="export"
            color="#003366"
            text="Export"
            class="mr-2 mb-1"
            prepend-icon="mdi-tray-arrow-down"
            variant="elevated"
            @click="handleExportClick"
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
            :disable-select="!isCollectionActive"
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
        :district="district"
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
      @close="closeAndLoadStudents"
    />
  </v-bottom-sheet>
  <v-dialog
    v-model="showExportDialog"
    :max-width="443"
  >
    <v-card class="ma-auto">
      <v-card-title>
        Export Student Records
      </v-card-title>
      <v-card-actions>
        <v-btn
          color="#003366"
          variant="elevated"
          style="white-space: pre-wrap;"
          text="All Students with no Errors"
          @click="downloadStudentReport"
        />
        <v-btn
          color="#003366"
          variant="elevated"
          style="white-space: pre-wrap;"
          text="All Students with Data Issues"
          @click="downloadStudentWithErrorsReport"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import alertMixin from '../../../../mixins/alertMixin';
import CustomTable from '../../common/SDCCustomTable.vue';
import {
  downloadStudentOnlyReportURL,
  downloadStudentErrorsReportURL,
  downloadStudentProgramReportURL
} from '../../../../utils/common';
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';
import {cloneDeep, isEmpty, omitBy} from 'lodash';
import {sdcCollectionStore} from '../../../../store/modules/sdcCollection';
import ViewStudentDetailsComponent from '../../../common/ViewStudentDetailsComponent.vue';
import Filters from '../../../common/Filters.vue';
import {mapState} from 'pinia';

export default {
  name: 'DetailComponent',
  components: {
    Filters,
    CustomTable,
    ViewStudentDetailsComponent
  },
  mixins: [alertMixin],
  props: {
    config: {
      tabFilter: Object,
      required: true,
      type: Object,
      default: null
    },
    district: {
      type: Object,
      required: true,
      default: null
    },
    showExportBtn: {
      type: Boolean,
      default: false
    },
    exportType: {
      type: String,
      required: false,
      default: 'all-students'
    },
    isFinalSignOff: {
      type: Boolean,
      required: false
    },
    isCollectionActive: {
      type: Boolean,
      required: true,
      default: false
    },
    deletedStudentsOnly: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  emits: [],
  data() {
    return {
      chip: true,
      pageNumber: 1,
      pageSize: 15,
      showExportDialog: false,
      studentList: [],
      isLoading: false,
      totalElements: 0,
      selectedStudents: [],
      filterSearchParams: this.deletedStudentsOnly === true ? {
        tabFilter: this.config.defaultFilter,
        sdcSchoolCollectionStudentStatusCode: 'DELETED',
        moreFilters: {}
      } : {
        tabFilter: this.config.defaultFilter,
        notSdcSchoolCollectionStudentStatusCode: 'ERROR,DELETED',
        moreFilters: {}
      },
      showFilters: null,
      studentForEdit: [],
      editStudentSheet: false,
      resetFlag: false,
      reloadStudentsFlag: false,
    };
  },
  computed: {
    ...mapState(sdcCollectionStore, ['schoolCollection','schoolFundingCodesMap', 'enrolledProgramCodesMap', 'careerProgramCodesMap', 'bandCodesMap', 'specialEducationCodesMap']),
    filterCount() {
      let filters = Object.values(this.filterSearchParams.moreFilters).filter(filter => !!filter).reduce((total, filter) => total.concat(filter), []);
      return new Set(filters.map(filter => filter.title)).size;
    }
  },
  created() {
    sdcCollectionStore().getCodes().then(() => {
      this.loadStudents();
    });
  },
  methods: {
    handleExportClick() {
      if (this.exportType === 'all-students') {
        this.showExportDialog = true;
      } else {
        this.downloadStudentProgramReport();
      }
    },
    closeAndLoadStudents() {
      this.editStudentSheet = !this.editStudentSheet;
      if (this.reloadStudentsFlag === true) {
        this.loadStudents();
      }
      this.reloadStudentsFlag = false;
    },
    downloadStudentProgramReport(){
      const routeData = this.$router.resolve({path: downloadStudentProgramReportURL(this.$route, this.exportType)});
      window.open(routeData.href, '_blank');
      this.showExportDialog = false;
    },
    downloadStudentReport(){
      const routeData = this.$router.resolve({path: downloadStudentOnlyReportURL(this.$route)});
      window.open(routeData.href, '_blank');
      this.showExportDialog = false;
    },
    downloadStudentWithErrorsReport(){
      const routeData = this.$router.resolve({path: downloadStudentErrorsReportURL(this.$route)});
      window.open(routeData.href, '_blank');
      this.showExportDialog = false;
    },
    editStudent($event) {
      const selectedStudent = cloneDeep($event);
      this.studentForEdit.splice(0);
      this.studentForEdit.push(selectedStudent?.sdcSchoolCollectionStudentID);
      this.editStudentSheet = true;
    },
    applyFilters($event) {
      this.filterSearchParams.moreFilters = cloneDeep($event);
      this.loadStudents();
    },
    clearFilters() {
      this.filterSearchParams.moreFilters = {};
      this.loadStudents();
    },
    loadStudents() {
      this.isLoading= true;
      ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_DISTRICT_COLLECTION}/${this.$route.params.sdcDistrictCollectionID}/paginated?tableFormat=true`, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          searchParams: omitBy(this.filterSearchParams, isEmpty)
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

.found-align {
  align-self: flex-end;
}

.export {
  margin-left: 1px;
  color: #003366;
}
</style>

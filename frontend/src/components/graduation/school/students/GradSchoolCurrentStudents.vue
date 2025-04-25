<template>
  <v-container fluid>
    <v-row
      no-gutters
    >
      <v-col>
        <v-alert
          density="compact"
          type="info"
          variant="tonal"
          text="The table columns marked with an asterisk (*) are updated nightly. All other columns are updated on a per-student basis, using only uploaded data that is error-free."
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <h4 style="font-weight: normal">
          Students with {{ schoolName }} as their School of Record in GRAD and a Current status.
        </h4>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        class="d-flex justify-end"
      >
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
        <CommonCustomTable
          :headers="config.tableHeaders"
          :data="studentList"
          :page-number="pageNumber"
          :total-elements="totalElements"
          :is-loading="isLoading"
          :reset="resetVal"
          @reload="reload"
        >
          <template #resolution="{ student }">
            <v-menu
              transition="fab-transition"
              location="end"
              offset="10"
            >
              <template #activator="{ props }">
                <v-btn
                  color="primary"
                  icon="mdi-file-document-multiple-outline"
                  variant="text"
                  v-bind="props"
                />
              </template>
              <v-list>
                <v-list-item
                  id="tvrButton"
                  @click="downloadTVRReport(student)"
                >
                  <v-icon
                    color="#003366"
                    class="pr-1 mb-1"
                  >
                    mdi-download
                  </v-icon>
                  <span class="ml-2">Transcript Verification Report (TVR)</span>
                </v-list-item>
                <v-list-item
                  id="transcriptPreviewButton"
                  @click="downloadTranscriptPreview(student)"
                >
                  <v-icon
                    color="#003366"
                    class="pr-1 mb-1"
                  >
                    mdi-download
                  </v-icon>
                  <span class="ml-2">Transcript Preview</span>
                </v-list-item>
                <v-list-item
                  id="xmlPreviewButton"
                  @click="downloadXMLPreview(student)"
                >
                  <v-icon
                    color="#003366"
                    class="pr-1 mb-1"
                  >
                    mdi-download
                  </v-icon>
                  <span class="ml-2">XML Preview</span>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </CommonCustomTable>
      </v-col>
    </v-row>
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
      <GradErrorFilters
        :filters="config.allowedFilters"
        :show-program-field="true"
        @apply-filters="applyFilters"
        @clear-filters="clearFilters"
        @close="showFilters= !showFilters"
      />
    </v-navigation-drawer>
  </v-container>
</template>

<script>
import alertMixin from '../../../../mixins/alertMixin';
import { mapState} from 'pinia';
import {authStore} from '../../../../store/modules/auth';
import {GRAD_CURRENT_STUDENTS} from '../../../../utils/constants/TableConfiguration';
import {cloneDeep, isEmpty, omitBy} from 'lodash';
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';
import GradErrorFilters from '../../GradFilters.vue';
import {
  downloadDocument
} from '../../../../utils/gdc/gradReports';
import CommonCustomTable from '../../../common/CommonCustomTable.vue';
import {appStore} from '../../../../store/modules/app';

export default {
  name: 'GradSchoolCurrentStudents',
  components: {
    CommonCustomTable,
    GradErrorFilters
  },
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: false,
      default: null
    },
  },
  emits: [],
  data() {
    return {
      isLoading: false,
      studentList: [],
      showFilters: null,
      schoolName: '',
      totalElements: 0,
      resetVal: false,
      pageNumber: 1,
      pageSize: 15,
      config: GRAD_CURRENT_STUDENTS,
      filterSearchParams: {
        tabFilter: [],
        moreFilters: {}
      },
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['schoolsMap']),
    filterCount() {
      let filters = Object.values(this.filterSearchParams.moreFilters).filter(filter => !!filter).reduce((total, filter) => total.concat(filter), []);
      return new Set(filters.map(filter => filter.title)).size;
    }
  },
  async created() {
    appStore().getInstitutesData().then(() => {
      this.getSchoolNameFromID();
    });
  },
  methods: {
    toggleFilters() {
      this.showFilters= !this.showFilters;
    },
    getSchoolNameFromID(){
      let curSchool = this.schoolsMap.get(this.schoolID);
      this.schoolName = curSchool.schoolName;
    },
    applyFilters($event) {
      this.pageNumber = 1;
      this.resetVal = true;
      this.filterSearchParams.moreFilters = cloneDeep($event);
      this.loadStudents();
    },
    clearFilters() {
      this.pageNumber = 1;
      this.resetVal = true;
      this.filterSearchParams.moreFilters = {};
      this.loadStudents();
    },
    async downloadTVRReport(student){
      let reportType = 'tvr';
      await downloadDocument(this, student.pen, reportType);
    },
    async downloadTranscriptPreview(student){
      let reportType = 'transcript';
      await downloadDocument(this, student.pen, reportType);
    },
    async downloadXMLPreview(student){
      let reportType = 'xml';
      await downloadDocument(this, student.pen, reportType);
    },
    loadStudents() {
      this.isLoading= true;
      this.filterSearchParams.schoolID = this.schoolID;

      ApiService.apiAxios.get(ApiRoutes.gdc.BASE_URL + '/school/' + this.schoolID + '/current-students', {
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
        this.resetVal = false;
      });
    },
    reload(value) {
      if(value?.pageSize) {
        this.pageSize = value?.pageSize;
      } else if(value?.pageNumber) {
        this.pageNumber = value?.pageNumber;
      }
      this.loadStudents();
    }
  },
};
</script>
<style scoped>

</style>

<template>
  <v-container 
    fluid
  >
    <div
      class="borderSpace"
    >
      <v-row v-if="schoolID">
        <v-col>
          <h2 class="school-header">{{schoolNameAndMincode}}</h2>
        </v-col>
      </v-row>
      <v-row justify="space-between">
        <v-col
          cols="4"
          class="found-align"
        >
          <router-link
            class="ml-2"
            :to="downloadReportURL()"
            target="_blank"
          >
            <v-icon
              small
              class="mr-1"
              color="#1976d2"
            >
              mdi-tray-arrow-down
            </v-icon>
            <span class="export">Export Error Report</span>
          </router-link>
        </v-col>
        <v-col
          cols="8"
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
          <GradErrorTable
            :data="errorList"
            :headers="headers"
            :total-elements="totalElements"
            :is-loading="isLoading"
            @reload="reload"
          />
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
          @apply-filters="applyFilters"
          @clear-filters="clearFilters"
          @close="showFilters= !showFilters"
        />
      </v-navigation-drawer>
    </div>
  </v-container>
</template>
      
<script>
import alertMixin from '../../../../mixins/alertMixin';
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';
import { authStore } from '../../../../store/modules/auth';
import { mapState } from 'pinia';
import {isEmpty, omitBy, cloneDeep} from 'lodash';
import GradErrorTable from './GradErrorTable.vue';
import GradErrorFilters from '../../GradFilters.vue';
import { ERROR_REPORT_FILTERS } from '../../../../utils/gdc/Filters';
import { gdcStore } from '../../../../store/modules/gdc';
import {appStore} from '../../../../store/modules/app';
      
export default {
  name: 'GradErrorsView',
  components: {
    GradErrorTable,
    GradErrorFilters
  },
  mixins: [alertMixin],
  props: {
    instituteIdentifierID: {
      type: String,
      required: false,
      default: null
    },
    activeIncomingFilesetID: {
      type: String,
      required: false,
      default: null
    }
  },
  emits: [],
  data() {
    return {
      errorList: [],
      totalElements: 0,
      pageNumber: 1,
      pageSize: 15,
      filterSearchParams: {
        moreFilters: {}
      },
      schoolID: null,
      schoolNameAndMincode: null,
      isLoading: false,
      headers: [
        { title: 'PEN', key: 'pen', align: 'start',},
        { title: 'Local ID', key: 'localID', align: 'end'},
        { title: 'Last Name', key: 'lastName', align: 'end'},
        { title: 'First Name', key: 'firstName', align: 'end'},
        { title: 'Details', key: 'details', 
          subHeader: 
      [
        {title: 'File Type', key: 'fileType'},
        {title: 'Error/Warning', key: 'errors'},
        {title: 'Error Context', key: 'errorContext'},
        {title: 'Error Field', key: 'field'},
        {title: 'Description', key: 'desc', cols:'4'}
      ]
        },
      ],
      showFilters: false,
      config: ERROR_REPORT_FILTERS
    };
  },
  computed: {
    ...mapState(appStore, ['schoolsMap']),
    ...mapState(authStore, ['userInfo']),
    filterCount() {
      return Object.values(this.filterSearchParams.moreFilters).filter(filter => !!filter).reduce((total, filter) => total.concat(filter), []).length;
    },
  },
  async created() {
    this.getErrorFilesetStudentPaginated();
    gdcStore().getValidationFieldCodes();
    this.schoolID = this.$route.query.schoolID;
    appStore().getInstitutesData().then(() => {
      this.schoolNameAndMincode = this.getSchoolNameAndID();
    });
  },
  methods: {
    getSchoolNameAndID(){
      let curSchool = this.schoolsMap.get(this.schoolID);
      return curSchool.mincode + ' - ' + curSchool.schoolName;
    },
    downloadReportURL() {
      let query = {};
      if (this.userInfo && this.userInfo.activeInstituteType === 'SCHOOL') {
        query.schoolID = this.instituteIdentifierID;
      } else {
        query.districtID = this.instituteIdentifierID;
      }
      return {
        path: `${ApiRoutes.gdc.BASE_URL}/filesetErrors/${this.$route.params.activeIncomingFilesetID}/errorReportDownload`,
        query
      };
    },
    toggleFilters() {
      this.showFilters= !this.showFilters;
    },
    backButtonClick() {
      if(this.userInfo.activeInstituteType === 'SCHOOL') {
        this.$router.push({name: 'grad-school-upload', params: {schoolID: this.instituteIdentifierID}});
      } else {
        this.$router.push({name: 'grad-district-upload', params: {districtID: this.instituteIdentifierID}});
      }
    },
    getErrorFilesetStudentPaginated() {
      this.isLoading= true;
      ApiService.apiAxios.get(`${ApiRoutes.gdc.BASE_URL}/filesetErrors/${this.$route.params.activeIncomingFilesetID}/paginated`, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          searchParams: omitBy(this.filterSearchParams, isEmpty),
          ...(this.userInfo.activeInstituteType === 'SCHOOL' ? { schoolID: this.instituteIdentifierID } : { districtID: this.instituteIdentifierID })
        }
      }).then(response => {
        this.errorList = response.data.content;
        this.totalElements = response.data.totalElements;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while trying to retrieve students list. Please try again later.');
      }).finally(() => {
        this.isLoading = false;
      });
    },
    reload(value) {
      if(value?.pageSize) {
        this.pageSize = value?.pageSize;
      } else if(value?.pageNumber) {
        this.pageNumber = value?.pageNumber;
      }
      this.getErrorFilesetStudentPaginated();
    },
    applyFilters($event) {
      this.filterSearchParams.moreFilters = cloneDeep($event);
      this.getErrorFilesetStudentPaginated();
    },
    clearFilters() {
      this.filterSearchParams.moreFilters = {};
      this.getErrorFilesetStudentPaginated();
    },
  }
};
</script>
      
<style scoped>
  .school-header {
    margin-top: 12px;
    margin-bottom: 1em;
    font-weight: bold;
    text-align: start;
    line-height: 1.5;
    font-size: 1.2rem;
    color: #38598AFF;
  }

  .borderSpace {
    padding-left: 35px;
    padding-right: 35px;
  }

  :deep(.v-btn__content){
   white-space: break-spaces;
  }

  ::v-deep .v-theme--myCustomLightTheme.v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) span {
  color: white !important;
  }
</style>
      
  

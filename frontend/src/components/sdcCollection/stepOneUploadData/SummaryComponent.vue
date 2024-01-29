<template>
  <v-row align-content="space-between">
    <v-col class="font-weight-bold">
      Summary of Uploaded Data
    </v-col>
    <v-col cols="12">
      <v-alert
        v-if="studentsInError > 0"
        density="compact"
        type="error"
        variant="tonal"
        data-cy="headcount-error-banner"
      >
        <strong>{{ studentsInError }} students</strong> reported with errors - these students are <strong>not included in the summary counts</strong>. Eligible FTE count will be generated once all errors have been fixed in the next step.
      </v-alert>
      <v-alert
        v-else
        color="#003366"
        density="compact"
        type="info"
        variant="tonal"
        data-cy="headcount-info-banner"
      >
        Eligible FTE counts are available in Step 3.
      </v-alert>
    </v-col>
  </v-row>
  <v-row>
    <v-tabs
      v-model="selectedTab"
      color="#38598a"
      show-arrows
    >
      <v-tab
        v-for="name in tabs"
        :key="name"
        class="tab-divider"
        :value="name"
        :data-cy="name"
      >
        {{ name }}
      </v-tab>
    </v-tabs>

    <v-window v-model="selectedTab">
      <v-window-item value="FTE">
        <HeadCountReportComponent
          data-cy="fteTab"
          :headcount-table-data="headcountTableData"
        />
      </v-window-item>
      <v-window-item value="French Programs">
        <HeadCountReportComponent
          data-cy="frenchTab"
          :headcount-table-data="headcountTableData"
        />
      </v-window-item>
      <v-window-item value="Career Programs">
        <HeadCountReportComponent
          data-cy="careerTab"
          :headcount-table-data="headcountTableData"
        />
      </v-window-item>
      <v-window-item value="Indigenous Students & Support Programs">
        <HeadCountReportComponent
          data-cy="indigenousTab"
          :headcount-table-data="headcountTableData"
        />
      </v-window-item>
      <v-window-item value="Special Education">
        <HeadCountReportComponent
          data-cy="spedTab"
          :headcount-table-data="headcountTableData"
        />
      </v-window-item>
      <v-window-item value="English Language Learning">
        <HeadCountReportComponent
          data-cy="ellTab"
          :headcount-table-data="headcountTableData"
        />
      </v-window-item>
      <v-window-item value="Refugee">
        <HeadCountReportComponent
          :headcount-table-data="headcountTableData"
        />
      </v-window-item>
    </v-window>
  </v-row>
</template>
<script>
import {defineComponent} from 'vue';
import HeadCountReportComponent from '../stepThreeVerifyData/HeadCountReportComponent.vue';
import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';
import {SDC_VERIFY_TABS} from '../../../utils/sdc/SdcVerifyTabs';
import {FTE, FRENCH_PR, CAREER_PR, SPECIALED_PR} from '../../../utils/sdc/TableConfiguration';
import {isEmpty, omitBy} from 'lodash';

export default defineComponent({
  name: 'SummaryComponent',
  components: {
    HeadCountReportComponent},
  data() {
    return {
      isLoading: false,
      headcountHeaders: [],
      headcountTableData: {},
      compareSwitch: false,
      tabs: SDC_VERIFY_TABS,
      selectedTab: null,
      studentsInError: null,
      headerSearchParams: {}
    };
  },
  computed: {
    config() {
      if(this.selectedTab==='FTE') {
        return FTE;
      } else if(this.selectedTab==='French Programs') {
        return FRENCH_PR;
      } else if(this.selectedTab==='Career Programs') {
        return CAREER_PR;
      } else if(this.selectedTab==='Special Education') {
        return SPECIALED_PR;
      }
      return FTE;
    }
  },
  watch: {
    selectedTab() {
      this.getStudentHeadCounts();
    }
  },
  created() {
    this.getStudentsErrorCount();
  },
  methods: {
    getStudentHeadCounts() {
      this.isLoading= true;
      this.headcountHeaders = null;
      this.headcountTableData = {};
      ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/getStudentHeadcounts/${this.$route.params.schoolCollectionID}`, {
        params: {
          type: this.config?.headcountEndpoint,
          compare: this.compareSwitch
        }
      }).then(response => {
        this.headcountHeaders = response.data.headcountHeaders;
        this.headcountTableData = response.data.headcountResultsTable;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while trying to retrieve students list. Please try again later.');
      }).finally(() => {
        this.isLoading = false;
      });
    },
    getStudentsErrorCount() {
      this.headerSearchParams.sdcSchoolCollectionStudentStatusCode = 'ERROR';
      ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${this.$route.params.schoolCollectionID}/paginated`, {
        params: {
          pageNumber: 0,
          pageSize: 1,
          searchParams: omitBy(this.headerSearchParams, isEmpty)
        }
      }).then(response => {
        this.studentsInError = response.data.totalElements;
      }).catch(error => {
        console.error(error);
      });
    }
  }
});
</script>

<style scoped>
.v-window {
  width: 100%;
}
</style>

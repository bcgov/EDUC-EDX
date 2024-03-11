<template>
  <v-row justify="space-between">
    <v-col class="font-weight-bold">
      Summary of Uploaded Data
    </v-col>
    <v-col>
        <v-switch
          v-model="compareSwitch"
          color="primary"
          label="compare to previous September Collection"
          style="justify-items: right;"
          @update:model-value="compare()"
        />
      </v-col>
  </v-row>
  <v-row>
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

    <v-window
      v-model="selectedTab"
      class="pt-3"
    >
      <v-window-item value="Overall">
        <EnrollmentHeadcountsComponent
          v-if="selectedTab==='Overall'"
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
        <IndigenousHeadcountsComponent
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
import {FTE, FRENCH_PR, CAREER_PR, SPECIALED_PR, INDSUPPORT_PR, ELL} from '../../../utils/sdc/TableConfiguration';
import {isEmpty, omitBy} from 'lodash';
import EnrollmentHeadcountsComponent from './EnrollmentHeadcountsComponent.vue';
import IndigenousHeadcountsComponent from './IndigenousHeadcountsComponent.vue';

export default defineComponent({
  name: 'SummaryComponent',
  components: {
    IndigenousHeadcountsComponent,
    EnrollmentHeadcountsComponent,
    HeadCountReportComponent},
  data() {
    return {
      isLoading: false,
      headcountHeaders: [],
      headcountTableData: {},
      compareSwitch: false,
      tabs: [
        'Overall',
        'French Programs',
        'Career Programs',
        'Indigenous Students & Support Programs',
        'Special Education',
        'English Language Learning',
        'Refugee'
      ],
      selectedTab: null,
      studentsInError: null,
      headerSearchParams: {}
    };
  },
  computed: {
    config() {
      if(this.selectedTab==='Overall') {
        return FTE;
      } else if(this.selectedTab==='French Programs') {
        return FRENCH_PR;
      } else if(this.selectedTab==='Career Programs') {
        return CAREER_PR;
      } else if(this.selectedTab==='Special Education') {
        return SPECIALED_PR;
      } else if(this.selectedTab==='Indigenous Students & Support Programs') {
        return INDSUPPORT_PR;
      } else if(this.selectedTab==='English Language Learning') {
        return ELL;
      }
      return null;
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
    },
    compare() {
      this.getStudentHeadCounts();
    }
  }
});
</script>

<style scoped>
.v-window {
  width: 100%;
}
</style>

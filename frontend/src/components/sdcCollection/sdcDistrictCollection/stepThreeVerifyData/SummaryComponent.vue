<template>
  <div>Summary Component</div>
  <slot
    name="reports"
    :data="headcountTableData"
    :report-type="reportType"
  >
    <HeadCountReportComponent
      v-if="headcountTableData"
      :headcount-table-data="headcountTableData"
    />
  </slot>
</template>

<script>
import alertMixin from '../../../../mixins/alertMixin';
import {getComparisonIcon, getStatusColor} from '../../../../utils/common';
import HeadCountReportComponent from './HeadCountReportComponent.vue';
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';

export default {
  name: 'SummaryComponent',
  components: {
    HeadCountReportComponent
  },
  mixins: [alertMixin],
  props: {
    headcountType: {
      type: Array,
      required: true,
    }
  },
  emits: [],
  data() {
    return {
      isLoading: false,
      headcountHeaders: [],
      headcountTableData: null,
      compareSwitch: false,
      reportType: null
    };
  },
  watch: {
    headcountType: {
      handler() {
        this.reportType = this.headcountType[0]?.endpoint;
        this.getStudentHeadCounts();
      },
      immediate: true
    }
  },
  mounted() {

  },
  created() {
  },
  methods: {
    getComparisonIcon,
    getStatusColor,
    getStudentHeadCounts() {
      this.isLoading= true;
      ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_DISTRICT_COLLECTION_STUDENT_HEADCOUNTS}/${this.$route.params.sdcDistrictCollectionID}`, {
        params: {
          type: this.reportType,
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
    getTitle() {
      return this.headcountType.find(type => type.endpoint === this.reportType).title;
    },

  }
};
</script>
       
<style scoped>

.column-header {
  font-weight: bold;
  text-align: center;
  line-height: 1.5;
  font-size: 1rem;
}

.column-data {
  text-align: center;
  line-height: 1.5;
  font-size: 1rem;
  white-space: nowrap;
}

.compare-text {
  color: gray;
}

.row-data {
  flex-wrap: nowrap;
}
 
</style>
       
       
     
   

<template>
  <v-row v-if="isLoading">
    <v-col
      cols="12"
      class="d-flex justify-center"
    >
      <v-progress-circular
        class="mt-16"
        :size="70"
        :width="7"
        color="primary"
        indeterminate
        :active="isLoading"
      />
    </v-col>
  </v-row>

  <div v-else>
    <v-row
      justify="end"
      class="mb-n6"
    >
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

    <v-row class="mt-n6">
      <v-slide-group
        class="py-4"
        show-arrows
      >
        <v-slide-group-item
          v-for="(header, index) in headcountHeaders"
          :key="index"
        >
          <div :class="headcountType + '-headcount-header border ma-1'">
            <v-row>
              <v-col class="column-header">
                {{ header.title }}
              </v-col>
            </v-row>

            <v-row
              v-if="header.orderedColumnTitles"
              align="center"
              justify="space-around"
              no-gutters
            >
              <div
                v-for="key in header.orderedColumnTitles"
                :key="key"
                class="divider"
              >
                <v-col :class="headcountType + '-headcount-header-column column-data'">
                  <div>{{ key }} </div>
                  <span
                    v-if="header.columns[key].comparisonValue !== null"
                    class="compare-text"
                  >
                    {{ header.columns[key].comparisonValue }}
                  </span>
                  <span v-if="header.columns[key].comparisonValue !== null">
                    <v-icon
                      size="x-small"
                      :color="getStatusColor(header.columns[key].comparisonValue, header.columns[key].currentValue)"
                    >
                      {{ getComparisonIcon(header.columns[key].comparisonValue, header.columns[key].currentValue) }}
                    </v-icon>

                  </span>
                  <span>
                    {{ header.columns[key].currentValue }}
                  </span>
                </v-col>
              </div>
            </v-row>
            <v-row class="justify-center" v-else>
              <span v-if="header?.headCountValue?.comparisonValue" class="compare-text">{{ header?.headCountValue?.comparisonValue }}</span>
              <span v-if="header?.headCountValue?.comparisonValue">
                <v-icon
                  size="x-small"
                  :color="getStatusColor(header?.headCountValue?.comparisonValue, header?.headCountValue?.currentValue)"
                >
                  {{ getComparisonIcon(header?.headCountValue?.comparisonValue, header?.headCountValue?.currentValue) }}
                </v-icon>
              </span>
              <span>
                {{ header?.headCountValue?.currentValue }}
              </span>
            </v-row>
          </div>
        </v-slide-group-item>
      </v-slide-group>
    </v-row>
  </div>
  <v-row align-content="space-between">
    <v-col class="font-weight-bold">
      {{ getTitle() }}
    </v-col>
    <v-col class="text-right">
      <a>
        <v-icon>mdi-tray-arrow-down</v-icon>
        Download Report
      </a>
    </v-col>
  </v-row>
  <HeadCountReportComponent
    v-if="headcountTableData"
    :headcount-table-data="headcountTableData"
  />
</template>

<script>
import alertMixin from '../../../mixins/alertMixin';
import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';
import HeadCountReportComponent from './HeadCountReportComponent.vue';
 
export default {
  name: 'SummaryComponent',
  components: {
    HeadCountReportComponent
  },
  mixins: [alertMixin],
  props: {
    headcountType: {
      type: String,
      required: true,
    }
  },
  emits: [],
  data() {
    return {
      isLoading: false,
      headcountHeaders: [],
      headcountTableData: null,
      compareSwitch: false
    };
  },
  mounted() {
    this.getStudentHeadCounts();
  },
  created() {
  },
  methods: {
    getStudentHeadCounts() {
      this.isLoading= true;
      ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/getStudentHeadcounts/${this.$route.params.schoolCollectionID}`, {
        params: {
          type: this.headcountType,
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
    getComparisonIcon(comparisonValue, currentValue) {
      if(comparisonValue > currentValue) {
        return 'mdi-arrow-down';
      } else if(comparisonValue < currentValue) {
        return 'mdi-arrow-up';
      } else {
        return 'mdi-equal';
      }
    },
    getStatusColor(comparisonValue, currentValue) {
      if(comparisonValue > currentValue) {
        return 'red';
      } else if(comparisonValue < currentValue) {
        return 'green';
      } else {
        return '#1976d2';
      }
    },
    getTitle() {
      switch (this.headcountType) {
      case 'career':
        return 'Eligible Career Program Headcount';
      case 'french':
        return 'Eligible French Program Headcount';
      case 'enrollment':
        return 'Grade Enrolment & Eligible FTE';
      }
    },
    compare() {
      this.getStudentHeadCounts();
    }
  }
};
</script>
       
<style scoped>

.border {
  border: 2px solid grey;
  border-radius: 5px;
  padding: 10px;
}
.border-right {
  border-right: thin solid grey;
}

.column-header {
  font-weight: bold;
  text-align: center;
}

.column-data {
  text-align: center;
}

.divider { 
   border-right: 1px solid lightgray;
   border-radius: 0px;
} 
   
.divider:last-child  { 
   border-right: 0
}

.compare-text {
  color: gray;
}
 
</style>
       
       
     
   

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
    <v-row class="mt-n6">
      <v-spacer />
      <v-slide-group
        class="py-4"
        show-arrows
      >
        <v-slide-group-item
          v-for="(header, index) in headcountHeaders"
          :key="index"
        >
          <v-col>
            <v-card
              :class="`${reportType}-headcount-card`"
              height="100%"
            >
              <v-card-item class="pb-0">
                <v-card-title :class="`${reportType}-headcount-header column-header`">
                  {{ header.title }}
                </v-card-title>
              </v-card-item>
              <v-card-text>
                <v-row
                  v-if="header.orderedColumnTitles"
                  class="row-data"
                >
                  <template
                    v-for="(key, idx) in header.orderedColumnTitles"
                    :key="idx"
                  >
                    <v-col :class="`${reportType}-headcount-column-data column-data`">
                      <div>{{ key }}</div>
                      <div style="display: flex; justify-content: center">
                        <span
                          v-if="header?.columns[key]?.comparisonValue !== null"
                          class="compare-text"
                        >
                          {{ header?.columns[key]?.comparisonValue }}
                        </span>
                        <span
                          v-if="header?.columns[key]?.comparisonValue !== null"
                          style="display: flex;  align-items: center"
                        >
                          <v-icon
                            size="x-small"
                            :color="getStatusColor(header?.columns[key]?.comparisonValue, header?.columns[key]?.currentValue)"
                          >
                            {{ getComparisonIcon(header?.columns[key]?.comparisonValue, header?.columns[key]?.currentValue) }}
                          </v-icon>

                        </span>
                        <span>
                          {{ header?.columns[key]?.currentValue }}
                        </span>
                      </div>
                    </v-col>
                    <v-divider
                      v-if="idx !== header?.orderedColumnTitles?.length - 1"
                      class="my-4 divider"
                      :vertical="true"
                    />
                  </template>
                </v-row>
                <v-row
                  v-else
                >
                  <v-col :class="`${reportType}-headcount-column-data column-data`">
                    <span
                      v-if="header?.headCountValue?.comparisonValue"
                      class="compare-text"
                    >{{ header?.headCountValue?.comparisonValue }}</span>
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
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-slide-group-item>
      </v-slide-group>
      <v-spacer />
    </v-row>
  </div>

  <v-row align-content="space-between">
    <v-col cols="5">
      <v-select
        id="reports"
        v-model="reportType"
        :items="headcountType"
        item-value="endpoint"
        item-title="title"
        label="Reports"
        variant="underlined"
        @update:model-value="getStudentHeadCounts()"
      />
    </v-col>

    <v-col>
      <v-switch
        id="compare-switch"
        v-model="compareSwitch"
        color="primary"
        label="compare to previous September Collection"
        style="justify-items: right;"
        @update:model-value="compare()"
      />
    </v-col>
  </v-row>

  <v-row align-content="space-between">
    <v-col class="font-weight-bold">
      {{ getTitle() }}
    </v-col>
    <v-col class="text-right">
      <router-link
        id="downloadReport"
        :to="{ path: downloadReportURL() }"
        target="_blank"
      >
        <v-icon>mdi-tray-arrow-down</v-icon>
        Download Report
      </router-link>
    </v-col>
  </v-row>
  <slot
    name="reports"
    :data="headcountTableData"
    :report-type="reportType"
  >
    <HeadCountReportComponent
      v-if="headcountTableData"
      :headcount-table-data="headcountTableData"
      :table-i-d="tableID"
    />
  </slot>
</template>

<script>
import alertMixin from '../../mixins/alertMixin';
import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import HeadCountReportComponent from './HeadCountReportComponent.vue';
import {getComparisonIcon, getStatusColor} from '../../utils/common';
 
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
    },
    isDistrictSummary: {
      type: Boolean,
      required: false
    }
  },
  emits: [],
  data() {
    return {
      isLoading: false,
      headcountHeaders: [],
      headcountTableData: null,
      compareSwitch: false,
      reportType: null,
      tableID: null
    };
  },
  watch: {
    headcountType: {
      handler() {
        this.reportType = this.headcountType[0]?.endpoint;
        this.tableID = this.headcountType[0]?.tableID;
        this.getStudentHeadCounts();
      },
      immediate: true
    },

  },
  methods: {
    getComparisonIcon,
    getStatusColor,
    getStudentHeadCounts() {
      this.isLoading= true;
      if(this.isDistrictSummary) {
        this.fetchDistrictSummaryCounts();
      } else {
        this.fetchSchoolSummaryCounts();
      }
    },
    fetchSchoolSummaryCounts() {
      ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/getStudentHeadcounts/${this.$route.params.schoolCollectionID}`, {
        params: {
          type: this.reportType,
          compare: this.compareSwitch
        }
      }).then(response => {
        this.headcountHeaders = response.data.headcountHeaders;
        this.headcountTableData = response.data.headcountResultsTable;
        this.tableID = this.headcountType.filter(headcount => headcount.endpoint === this.reportType).pop().tableID;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while trying to retrieve students list. Please try again later.');
      }).finally(() => {
        this.isLoading = false;
      });
    },
    fetchDistrictSummaryCounts() {
      ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/getDistrictHeadcounts/${this.$route.params.sdcDistrictCollectionID}`, {
        params: {
          type: this.reportType,
          compare: this.compareSwitch
        }
      }).then(response => {
        this.headcountHeaders = response.data.headcountHeaders;
        this.headcountTableData = response.data.headcountResultsTable;
        this.tableID = this.headcountType.filter(headcount => headcount.endpoint === this.reportType).pop().tableID;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert('An error occurred while trying to retrieve students list. Please try again later.');
      }).finally(() => {
        this.isLoading = false;
      });
    },
    downloadReportURL() {
      if (this.isDistrictSummary) {
        return `${ApiRoutes.sdc.SDC_DISTRICT_COLLECTION}/${this.$route.params.sdcDistrictCollectionID}/report/${this.reportType}_dis/download`;
      } else {
        return `${ApiRoutes.sdc.BASE_URL}/${this.$route.params.schoolCollectionID}/report/${this.reportType}/download`;
      }
    },
    getTitle() {
      return this.headcountType.find(type => type.endpoint === this.reportType).title;
    },
    compare() {
      this.getStudentHeadCounts();
    }
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

.divider {
  height: 3rem;
  margin-top: 1rem;
}

.row-data {
  flex-wrap: nowrap;
}

#downloadReport {
  color: #003366;
}
 
</style>
       
       
     
   

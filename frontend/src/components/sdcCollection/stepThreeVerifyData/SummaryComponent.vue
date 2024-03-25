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
          id="compare-switch"
          v-model="compareSwitch"
          color="primary"
          label="compare to previous September Collection"
          style="justify-items: right;"
          @update:model-value="compare()"
        />
      </v-col>
    </v-row>

    <v-row class="mt-n6">
      <v-spacer />
      <v-slide-group
          v-if="showHeadcountHeaders"
        class="py-4"
        show-arrows
      >
        <v-slide-group-item
          v-for="(header, index) in headcountHeaders"
          :key="index"
        >
          <v-col>
            <v-card
              :class="`${headcountType}-headcount-card`"
              height="100%"
            >
              <v-card-item class="pb-0">
                <v-card-title :class="`${headcountType}-headcount-header column-header`">
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
                    <v-col :class="`${headcountType}-headcount-column-data column-data`">
                      <div>{{ key }}</div>
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
                    <v-divider
                      v-if="idx !== header.orderedColumnTitles.length - 1"
                      class="my-4"
                      :vertical="true"
                    />
                  </template>
                </v-row>
                <v-row
                  v-else
                >
                  <v-col :class="`${headcountType}-headcount-column-data column-data`">
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
    <v-col class="font-weight-bold">
      {{ getTitle() }}
    </v-col>
    <v-col class="text-right">
      <router-link
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
  >
    <HeadCountReportComponent
      v-if="headcountTableData"
      :headcount-table-data="headcountTableData"
    />
  </slot>
</template>

<script>
import alertMixin from '../../../mixins/alertMixin';
import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';
import HeadCountReportComponent from './HeadCountReportComponent.vue';
import {getComparisonIcon, getStatusColor} from '../../../utils/common';
 
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
    },
    showHeadcountHeaders: {
      type: Boolean,
      default: true
    }
  },
  emits: [],
  data() {
    return {
      isLoading: false,
      headcountHeaders: [],
      headcountTableData: null,
      compareSwitch: false,
      notBandHeadcount: this.headcountType !== "band-codes"
    };
  },
  mounted() {
    this.getStudentHeadCounts();
  },
  created() {
  },
  methods: {
    getComparisonIcon,
    getStatusColor,
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
    downloadReportURL() {
      return `${ApiRoutes.sdc.BASE_URL}/${this.$route.params.schoolCollectionID}/report/${this.headcountType}/download`;
    },
    getTitle() {
      switch (this.headcountType) {
      case 'career':
        return 'Eligible Career Program Headcount';
      case 'french':
        return 'Eligible French Program Headcount';
      case 'enrollment':
        return 'Grade Enrolment & Eligible FTE';
      case 'ell':
        return 'Eligible English Language Learning Headcount';
      case 'special-ed':
        return 'Eligible Special Education Headcount';
      case 'indigenous':
        return 'Eligible Indigenous Support Program Headcount';
      case 'band-codes':
        return 'Eligible Band of Residence Headcount';
      }
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

.row-data {
  flex-wrap: nowrap;
}
 
</style>
       
       
     
   

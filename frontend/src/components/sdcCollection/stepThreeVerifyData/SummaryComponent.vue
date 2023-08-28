<template>
  <v-row>
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

    <v-row v-else>
      <v-col>
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
              @update:modelValue="compare()"
            />
          </v-col>
        </v-row>

        <v-row class="mt-n6">
          <v-slide-group
            class="pa-4"
            show-arrows
          >
            <v-slide-group-item
              v-for="(header, index) in headcountHeaders"
              :key="index"
            >
              <div class="border ma-1">
                <v-row>
                  <v-col class="column-header">
                    {{ header.title }}
                  </v-col>
                </v-row>
               
                <v-row
                  align="center"
                  justify="space-around"
                  no-gutters
                >
                  <div
                    v-for="key in header.orderedColumnTitles"
                    :key="key"
                    class="divider"
                  >       
                    <v-col class="column-data">
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
              </div>
            </v-slide-group-item>
          </v-slide-group>
        </v-row>
      </v-col>
    </v-row>
  </v-row>
</template>

<script>
import alertMixin from '../../../mixins/alertMixin';
import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';
 
export default {
  name: 'SummaryComponent',
  components: {
  },
  mixins: [alertMixin],
  props: {

  },
  emits: [],
  data() {
    return {
      isLoading: false,
      headcountHeaders: [],
      headcountTableDataList: [],
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
          type: 'enrollment',
          compare: this.compareSwitch
        }
      }).then(response => {
        this.headcountHeaders = response.data.headcountHeaders;
        this.headcountTableDataList = response.data.headcountTableDataList;
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
       
       
     
   

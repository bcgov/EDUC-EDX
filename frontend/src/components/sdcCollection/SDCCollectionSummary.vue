<template>
  <v-container
    class="containerSetup"
    fluid
  >
    <v-row class="d-flex justify-start">
      <v-col>
        <h2 class="subjectHeading">
          Open Collections
        </h2>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="mt-2 mb-2 d-flex justify-start"
    >
      <v-col class="mt-1 d-flex justify-start">
        <v-icon
          small
          color="#1976d2"
        >
          mdi-arrow-left
        </v-icon>
        <a
          class="ml-1"
          @click="backToDashboard()"
        >Return to Dashboard</a>
      </v-col>
    </v-row>
    <v-row
      v-if="isLoading"
      class="mt-0"
    >
      <v-col class="d-flex justify-center">
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
      <div
        v-if="isCollectionOpen()"
        class="border"
      >
        <v-row>
          <v-col cols="4">
            <DoughnutChart :incoming-chart-data="incomingChartData" />
          </v-col>
          <v-col cols="8">
            <h2 class="subjectHeading">
              Student Level Data (1701)
            </h2>
            <p>
              {{ currentCollectionTypeCode }} 
              {{ currentCollectionYear }} Collection
            </p>
            <p v-if="submissionDate">
              <i
                id="submissionDueDate"
                style="color: red;"
              >
                Submission Due: {{ submissionDate }}
              </i>
            </p>
          </v-col>
        </v-row>
        <v-row justify="space-around">
          <v-col
            cols="4"
            class="steps"
          >
            <span>{{ noOfStepsCompleted }} / {{ totalStepsInCollection }} Steps Complete</span>
          </v-col>
          <v-col
            cols="8"
            class="navigate"
          >
            <a
              class="ml-1"
              @click="startCollection()"
            >Continue</a>
            <v-icon
              small
              color="#1976d2"
            >
              mdi-arrow-right
            </v-icon>
          </v-col>
        </v-row>
      </div>
      <div v-else>
        <p>Currently, there are no open collections.</p>
      </div>
    </v-row>
  </v-container>
</template>

<script>
import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import alertMixin from '../../mixins/alertMixin';
import DoughnutChart from '../common/DoughnutChart.vue';
import { mapState, mapActions } from 'pinia';
import { sdcCollectionStore } from '../../store/modules/sdcCollection';
import router from '../../router';
import {capitalize} from 'lodash';
import {SDC_STEPS_DISTRICT, SDC_STEPS_SCHOOL} from '../../utils/institute/SdcSteps';
import {LocalDateTime} from '@js-joda/core';
import {getDateFormatter} from '../../utils/format';

export default {
  name: 'SdcCollectionSummary',
  components: {
    DoughnutChart
  },
  mixins: [alertMixin],
  props: {
    districtID: {
      type: String,
      default: null
    },
    schoolID: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      noOfStepsCompleted: 0,
      incomingChartData: null,
      instituteCollectionID: null,
      isLoading: false,
      currentStepIndex: 0,
      toFormatter: getDateFormatter('uuuu/MM/dd'),
      submissionDate: null
    };
  },
  computed: {
    ...mapState(sdcCollectionStore, ['currentCollectionTypeCode', 'currentStepInCollectionProcess','currentCollectionYear']),
    isSchoolCollection() {
      return !!this.schoolID;
    },
    totalStepsInCollection() {
      if(this.isSchoolCollection) {
        return SDC_STEPS_SCHOOL.length;
      } else {
        return SDC_STEPS_DISTRICT.length;
      }
    }
  },
  created() {
    if(this.isSchoolCollection) {
      this.getSDCCollectionByInstituteId(ApiRoutes.sdc.SDC_COLLECTION_BY_SCHOOL_ID + `/${this.$route.params.schoolID}`);
    } else {
      this.getSDCCollectionByInstituteId(ApiRoutes.sdc.SDC_COLLECTION_BY_DISTRICT_ID + `/${this.$route.params.districtID}`);
    }
  },
  methods: {
    ...mapActions(sdcCollectionStore, ['setCurrentCollectionTypeCode', 'setCollectionMetaData', 'setCurrentCollectionYear']),
    startCollection() {
      if(this.isSchoolCollection) {
        router.push({name: 'sdcCollection', params: {schoolCollectionID: this.instituteCollectionID}});
      } else {
        router.push({name: 'sdcDistrictCollection', params: {sdcDistrictCollectionID: this.instituteCollectionID}});
      }
    },
    backToDashboard() {
      this.$router.push({name: 'home'});
    },
    isCollectionOpen() {
      return this.instituteCollectionID !== null;
    },
    calculateStep() {
      if(this.currentStepIndex <= 6) {
        this.noOfStepsCompleted = this.currentStepIndex;
      }
      this.incomingChartData = [this.noOfStepsCompleted, (this.totalStepsInCollection - this.noOfStepsCompleted)];
    },
    getSDCCollectionByInstituteId(url) {
      this.isLoading = true;
      ApiService.apiAxios.get(url).then(response => {
        if(response.data) {
          this.setCurrentCollectionTypeCode(capitalize(response.data.collectionTypeCode));
          this.submissionDate = response.data.submissionDueDate;

          let instituteStatusCode;
          if(this.isSchoolCollection) {
            this.instituteCollectionID = this.districtID ? response.data.sdcDistrictCollectionID : response.data.sdcSchoolCollectionID;
            instituteStatusCode = response.data.sdcSchoolCollectionStatusCode;
          } else {
            this.instituteCollectionID = response.data.sdcDistrictCollectionID;
            instituteStatusCode = response.data.sdcDistrictCollectionStatusCode;
          }
          this.currentStepIndex = this.getIndexOfSDCCollectionByStatusCode(instituteStatusCode);
          this.setCurrentCollectionYear(LocalDateTime.parse(response.data.collectionOpenDate, getDateFormatter('uuuu-MM-dd\'T\'HH:mm:ss')).year());
          this.calculateStep();
        }
      }).catch(error => {
        console.error(error);
        this.setFailureAlert(error.response?.data?.message || error.message);
      }).finally(() => {
        this.isLoading = false;
      });
    },
    getIndexOfSDCCollectionByStatusCode(statusCode) {
      if(this.isSchoolCollection) {
        return SDC_STEPS_SCHOOL.find(step => step.sdcSchoolCollectionStatusCode === statusCode)?.step;
      } else {
        return SDC_STEPS_DISTRICT.find(step => step.sdcDistrictCollectionStatusCode === statusCode)?.step;
      }
    }
  }
};
</script>

<style scoped>
.containerSetup{
  padding-right: 10em !important;
  padding-left: 10em !important;
}

@media screen and (max-width: 1200px) {
  .containerSetup{
    padding-right: 3em !important;
    padding-left: 3em !important;
  }
}
.border {
  border: 2px solid grey;
  border-radius: 5px;
  padding: 35px;
  margin-bottom: 2em;
  margin-top: 2em;
  width: 70%;
}

.steps {
  text-align: center;
}

.navigate {
  text-align: end;
}
</style>
    
    
  

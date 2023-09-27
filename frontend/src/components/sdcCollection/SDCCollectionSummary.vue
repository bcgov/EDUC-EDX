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
            <p>{{ currentCollectionTypeCode }} 2022 Collection</p>
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

export default {
  name: 'SdcCollectionSummary',
  components: {
    DoughnutChart
  },
  mixins: [alertMixin],
  props: {
    schoolID: {
      type: String,
      required: true,
      default: null
    }
  },
  data() {
    return {
      noOfStepsCompleted: 0,
      incomingChartData: null,
      schoolCollectionID: null,
      isLoading: false,
    };
  },
  computed: {
    ...mapState(sdcCollectionStore, ['currentCollectionTypeCode', 'totalStepsInCollection', 'currentStepInCollectionProcess',])
  },
  created() {
    this.getSDCCollectionBySchoolId();
  },
  methods: {
    ...mapActions(sdcCollectionStore, ['setCurrentCollectionTypeCode', 'setCollectionMetaData']),
    startCollection() {
      router.push({name: 'sdcCollection', params: {schoolCollectionID: this.schoolCollectionID}});
    },
    backToDashboard() {
      this.$router.push({name: 'home'});
    },
    isCollectionOpen() {
      return this.schoolCollectionID !== null;
    },
    calcuateStep() {
      if(this.currentStepInCollectionProcess?.index <= 5) {
        this.noOfStepsCompleted = this.currentStepInCollectionProcess?.index;
      }
      this.incomingChartData = [this.noOfStepsCompleted, (this.totalStepsInCollection - this.noOfStepsCompleted)];
    },
    getSDCCollectionBySchoolId() {
      this.isLoading = true;
      ApiService.apiAxios.get(ApiRoutes.sdc.SDC_COLLECTION_BY_SCHOOL_ID + `/${this.$route.params.schoolID}`).then(response => {
        if(response.data) {
          this.setCurrentCollectionTypeCode(capitalize(response.data.collectionTypeCode));
          this.setCollectionMetaData(response.data.sdcSchoolCollectionStatusCode);
          this.schoolCollectionID = response.data.sdcSchoolCollectionID;
          this.calcuateStep();
        }
      }).catch(error => {
        console.error(error);
        this.setFailureAlert(error.response?.data?.message || error.message);
      }).finally(() => {
        this.isLoading = false;
      });
    },

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
    
    
  

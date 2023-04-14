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
    <v-row no-gutters class="mt-2 mb-2 d-flex justify-start">
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
  </v-container>
</template>
  
<script>
import alertMixin from '../../mixins/alertMixin';
import DoughnutChart from '../common/DoughnutChart.vue';
import { mapState } from 'pinia';
import { useSldCollectionStore } from '../../store/modules/sldCollection';
import router from '../../router';

export default {
  name: 'SLDCollectionSummary',
  components: {
    DoughnutChart
  },
  mixins: [alertMixin],
  props: {
    
  },
  data() {
    return {
      noOfStepsCompleted: 0,
      incomingChartData: null
    };
  },
  computed: {
    ...mapState(useSldCollectionStore, ['currentCollectionTypeCode', 'totalStepsInCollection', 'currentStepInCollectionProcess', 'schoolCollectionID'])
  },
  created() {
    this.calcuateStep();
  },
  methods: {
    startCollection() {
      router.push({name: 'sldCollection', params: {schoolCollectionID: this.schoolCollectionID}});
    },
    backToDashboard() {
      this.$router.push({name: 'home'});
    },
    isCollectionOpen() {
      return this.schoolCollectionID !== null;
    },
    calcuateStep() {
      if(this.currentStepInCollectionProcess?.index <= 4) {
        this.noOfStepsCompleted = this.currentStepInCollectionProcess?.index;
      }
      this.incomingChartData = [this.noOfStepsCompleted, (this.totalStepsInCollection - this.noOfStepsCompleted)];
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
    
    
  

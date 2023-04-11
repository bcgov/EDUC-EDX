<template>
  <v-container 
    class="containerSetup"
    fluid
  >
    <v-row class="d-flex justify-start">
      <v-col>
        <h2 class="subjectHeading">
          Student Level Data (1701)
        </h2>
      </v-col>
    </v-row>
    <v-row class="d-flex justify-start">
      <v-col>
        <p>{{ currentCollectionTypeCode }} 2022 Collection</p>
      </v-col>
    </v-row>
    <v-row class="d-flex justify-start">
      <v-col class="mt-1 d-flex justify-start">
        <v-icon
          small
          color="#1976d2"
        >
          mdi-arrow-left
        </v-icon>
        <a
          class="ml-1"
          @click="backToCollectionDashboard()"
        >Return to Data Collections</a>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-divider class="divider" />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="2">
        <StepperComponent
          :steps="steps"
          :next-event="registerNextEvent"
          @on-navigation-complete="navigationCompleted()"
        />
      </v-col>
      <v-col>
        <router-view
          @next="next"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import alertMixin from '../../mixins/alertMixin';
import StepperComponent from '../common/StepperComponent.vue';
import RouterView from '../RouterView.vue';
import { mapState, mapActions } from 'pinia';
import { useSldCollectionStore } from '../../store/modules/sldCollection';

export default {
  name: 'SLDCollectionView',
  components: {
    StepperComponent,
    RouterView
  },
  mixins: [alertMixin],
  props: {
    schoolCollectionID: {
      type: String,
      required: true,
      default: null
    }
  },
  data() {
    return {
      steps: [],
      registerNextEvent: false
    };
  },
  computed: {
    ...mapState(useSldCollectionStore, ['stepsInCollectionProcess', 'currentCollectionTypeCode'])
  },
  created() {
    this.steps = [...this.stepsInCollectionProcess];
    this.setActiveStep();
  },
  methods: {
    ...mapActions(useSldCollectionStore, ['setCurrentStepInCollectionProcess']),
    next() {
      this.registerNextEvent = true;
    },
    navigationCompleted() {
      this.registerNextEvent = false;
    },
    backToCollectionDashboard() {
      this.$router.push({name: 'home'});
    },
    setActiveStep() {
      const stepName = 'STEP-1';
      const currentStep = this.steps.find(step => step.label === stepName);
      this.setCurrentStepInCollectionProcess(currentStep);
    }
  }
};
</script>
  
  <style scoped>
  .divider {
  border-color: #FCBA19;
  border-width: 3px;
  opacity: unset;
}
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
  </style>
  
  

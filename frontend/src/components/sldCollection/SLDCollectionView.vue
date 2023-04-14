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
    <v-row no-gutters class="mt-1 d-flex justify-start">
      <v-col>
        <h4>{{ currentCollectionTypeCode }} 2022 Collection</h4>
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
          @click="backToCollectionDashboard()"
        >Return to Data Collections</a>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col>
        <v-divider class="divider" />
      </v-col>
    </v-row>
    <v-row class="mt-0" v-if="isLoading">
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
      <v-col cols="2">
        <StepperComponent
          style="cursor: pointer"
          :steps="steps"
          :next-event="registerNextEvent"
          @on-navigation-complete="navigationCompleted()"
        />
      </v-col>
      <v-col>
        <router-view
          :school-collection-object="schoolCollectionObject"
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
      registerNextEvent: false,
      schoolCollectionObject: {},
      isLoading: false,
    };
  },
  computed: {
    ...mapState(useSldCollectionStore, ['stepsInCollectionProcess', 'currentCollectionTypeCode', 'schoolCollection'])
  },
  created() {
    this.isLoading = !this.isLoading;
    this.steps = [...this.stepsInCollectionProcess];
    useSldCollectionStore().getSchoolCollection(this.$route.params.schoolCollectionID).finally(() => {
      this.schoolCollectionObject = this.schoolCollection;
      this.isLoading = !this.isLoading;
    });
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
      this.$router.push({name: 'sldCollectionSummary'});
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
  
  

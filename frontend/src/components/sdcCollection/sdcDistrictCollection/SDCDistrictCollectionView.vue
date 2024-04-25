<template>
  <v-container
    class="containerSetup"
    :fluid="true"
  >
    <v-row
      no-gutters
      class="mt-1 d-flex justify-start"
    >
      <v-col>
        <h2>{{ currentCollectionTypeCode }} {{ currentCollectionYear }} Collection</h2>
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
          @click="backToCollectionDashboard()"
        >Return to Data Collections</a>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col>
        <v-divider class="divider" />
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
      <v-col>
        <v-stepper
          ref="stepper"
          hide-actions
          non-linear
          :model-value="currentStep"
          :elevation="0"
          :alt-labels="$vuetify.display.lgAndDown"
          @update:model-value="updateCurrentStep"
        >
          <template #default>
            <v-stepper-header>
              <template
                v-for="step in SDC_STEPS_DISTRICT()"
                :key="step.step"
              >
                <v-stepper-item
                  :id="step.id"
                  :value="step.step"
                  :title="step.title"
                  :editable="step.step < currentStep"
                  :complete="step.step < stepInCollection"
                  :color="'rgba(56, 89, 138, 1)'"
                />
                <v-divider
                  v-if="step.step < SDC_STEPS_DISTRICT().length"
                  :class="{'step-previous-divider': step.step < currentStep}"
                  :thickness="step.step < currentStep ? 5 : 0"
                  :color="'rgba(56, 89, 138, 1)'"
                />
              </template>
            </v-stepper-header>
            <v-stepper-window>
              <v-stepper-window-item
                :value="1"
                transition="false"
                reverse-transition="false"
              >
                <StepOneUploadData
                :is-step-complete="isStepComplete"
                :district-collection-object="districtCollectionObject"
                @next="next"/>
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="2"
                transition="false"
                reverse-transition="false"
              >
                <StepTwoMonitor
                  :district-collection-object="districtCollectionObject"
                  :is-step-complete="isStepComplete"
                  @next="next"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="3"
                transition="false"
                reverse-transition="false"
              >
                <StepThreeVerifyData
                  :is-step-complete="isStepComplete"
                  @next="next"
                />
              </v-stepper-window-item>
            </v-stepper-window>
          </template>
        </v-stepper>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {defineComponent} from 'vue';
import StepOneUploadData from './StepOneUploadData.vue';
import {sdcCollectionStore} from '../../../store/modules/sdcCollection';
import {SDC_STEPS_DISTRICT} from '../../../utils/institute/SdcSteps';
import {mapState} from 'pinia';
import StepTwoMonitor from './StepTwoMonitor.vue';
import StepThreeVerifyData from './stepThreeVerifyData/StepThreeVerifyData.vue';


export default defineComponent({
  name: 'SDCDistrictCollectionView',
  components: {
    StepOneUploadData,
    StepTwoMonitor,
    StepThreeVerifyData
  },
  data() {
    return {
      currentStep: 0,
      districtID: null,
      isLoading: false,
      districtCollectionObject: {},
    };
  },
  computed: {
    ...mapState(sdcCollectionStore, ['currentCollectionTypeCode', 'districtCollection','currentCollectionYear']),
    stepInCollection() {
      return this.getIndexOfSDCCollectionByStatusCode(this.districtCollection?.sdcDistrictCollectionStatusCode);
    },
    isStepComplete() {
      let indexCurrentCollection = this.getIndexOfSDCCollectionByStatusCode(this.districtCollection.sdcDistrictCollectionStatusCode);
      return this.currentStep < indexCurrentCollection;
    }
  },
  created() {
    this.isLoading = !this.isLoading;
    sdcCollectionStore().getDistrictCollection(this.$route.params.sdcDistrictCollectionID).finally(() => {
      this.districtCollectionObject = this.districtCollection;
      this.districtID = this.districtCollection?.districtID;
      this.currentStep = this.getIndexOfSDCCollectionByStatusCode(this.districtCollection?.sdcDistrictCollectionStatusCode);
      this.isLoading = !this.isLoading;
    });
  },
  methods: {
    SDC_STEPS_DISTRICT() {
      return SDC_STEPS_DISTRICT;
    },
    next() {
      this.checkIfWeNeedToUpdateDistrictCollection(this.currentStep);
      this.$refs.stepper.next();
    },
    checkIfWeNeedToUpdateDistrictCollection(index) {
      const stepTwoIndex = 2;
      if (index === stepTwoIndex) {
        this.refreshStore(true);
      }
      if (index < this.getIndexOfSDCCollectionByStatusCode(this.districtCollectionObject.sdcDistrictCollectionStatusCode)) {
        return;
      }
      sdcCollectionStore().getSchoolCollection(this.$route.params.schoolCollectionID);
    },
    backToCollectionDashboard() {
      this.$router.push({name: 'sdcDistrictCollectionSummary', params: {districtID: this.districtID}});
    },
    updateCurrentStep(step) {
      this.currentStep = step;
    },
    getIndexOfSDCCollectionByStatusCode(sdcDistrictCollectionStatusCode) {
      return SDC_STEPS_DISTRICT.find(step => step.sdcDistrictCollectionStatusCode === sdcDistrictCollectionStatusCode)?.step;
    }
  }
});
</script>

<style scoped>
.v-stepper-window {
  margin: 0 !important;
}

.v-stepper-header {
  box-shadow: none !important;
}
</style>

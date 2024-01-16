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
                v-for="step in SDC_STEPS_SCHOOL()"
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
                  v-if="step.step < SDC_STEPS_SCHOOL().length"
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
                  :school-collection-object="schoolCollectionObject"
                  @next="next"
                  @refresh-store="refreshStore"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="2"
                transition="false"
                reverse-transition="false"
              >
                <StepTwoViewDataIssues
                  :is-step-complete="isStepComplete"
                  :school-collection-object="schoolCollectionObject"
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
                  :school-collection-object="schoolCollectionObject"
                  @next="next"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="4"
                transition="false"
                reverse-transition="false"
              >
                <StepFourSchoolDetails
                  :is-step-complete="isStepComplete"
                  :school-collection-object="schoolCollectionObject"
                  @next="next"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="5"
                transition="false"
                reverse-transition="false"
              >
                <StepFiveSchoolContacts
                  :is-step-complete="isStepComplete"
                  :school-collection-object="schoolCollectionObject"
                  @next="next"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="6"
                transition="false"
                reverse-transition="false"
              >
                <div>placeholder</div>
              </v-stepper-window-item>
            </v-stepper-window>
          </template>
        </v-stepper>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {mapState} from 'pinia';
import { sdcCollectionStore } from '../../store/modules/sdcCollection';
import {SDC_STEPS_SCHOOL} from '../../utils/institute/SdcSteps';

import StepOneUploadData from './stepOneUploadData/StepOneUploadData.vue';
import StepTwoViewDataIssues from './stepTwoValidateData/StepTwoViewDataIssues.vue';
import StepThreeVerifyData from './stepThreeVerifyData/StepThreeVerifyData.vue';
import StepFourSchoolDetails from './StepFourSchoolDetails.vue';
import StepFiveSchoolContacts from './StepFiveSchoolContacts.vue';

export default {
  name: 'SDCCollectionView',
  components: {
    StepFiveSchoolContacts,
    StepFourSchoolDetails,
    StepThreeVerifyData,
    StepTwoViewDataIssues,
    StepOneUploadData
  },
  props: {
    schoolCollectionID: {
      type: String,
      required: true,
      default: null
    }
  },
  data() {
    return {
      currentStep: 0,
      steps: [],
      registerNextEvent: false,
      schoolCollectionObject: {},
      isLoading: false,
      schoolID: null
    };
  },
  computed: {
    ...mapState(sdcCollectionStore, ['currentCollectionTypeCode', 'schoolCollection','currentCollectionYear']),
    stepInCollection() {
      return this.getIndexOfSDCCollectionByStatusCode(this.schoolCollection?.sdcSchoolCollectionStatusCode);
    },
    isStepComplete() {
      let indexCurrentCollection = this.getIndexOfSDCCollectionByStatusCode(this.schoolCollection.sdcSchoolCollectionStatusCode);
      return this.currentStep < indexCurrentCollection;
    }
  },
  created() {
    this.isLoading = !this.isLoading;
    sdcCollectionStore().getSchoolCollection(this.$route.params.schoolCollectionID).finally(() => {
      this.schoolCollectionObject = this.schoolCollection;
      this.schoolID = this.schoolCollection.schoolID;
      this.currentStep = this.getIndexOfSDCCollectionByStatusCode(this.schoolCollection.sdcSchoolCollectionStatusCode);
      this.isLoading = !this.isLoading;
    });
  },
  methods: {
    SDC_STEPS_SCHOOL() {
      return SDC_STEPS_SCHOOL;
    },
    next() {
      this.checkIfWeNeedToUpdateSchoolCollection(this.currentStep);
      this.$refs.stepper.next();
    },
    checkIfWeNeedToUpdateSchoolCollection(index) {
      if (index < this.getIndexOfSDCCollectionByStatusCode(this.schoolCollection.sdcSchoolCollectionStatusCode)) {
        return;
      }
      sdcCollectionStore().getSchoolCollection(this.$route.params.schoolCollectionID);
    },
    refreshStore() {
      this.isLoading = !this.isLoading;
      sdcCollectionStore().getSchoolCollection(this.$route.params.schoolCollectionID).finally(() => {
        this.schoolCollectionObject = this.schoolCollection;
        this.schoolID = this.schoolCollection.schoolID;
        this.currentStep = this.getIndexOfSDCCollectionByStatusCode(this.schoolCollection.sdcSchoolCollectionStatusCode);
        this.isLoading = !this.isLoading;
      });
    },
    backToCollectionDashboard() {
      this.$router.push({name: 'sdcCollectionSummary', params: {schoolID: this.schoolID}});
    },
    updateCurrentStep(step) {
      this.currentStep = step;
    },
    getIndexOfSDCCollectionByStatusCode(sdcSchoolCollectionStatusCode) {
      return SDC_STEPS_SCHOOL.find(step => step.sdcSchoolCollectionStatusCode === sdcSchoolCollectionStatusCode)?.step;
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

.v-stepper-window {
    margin: 0rem !important;
}

.v-stepper-header {
  box-shadow: none !important;
}

</style>



<template>
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
      :is-collection-active="isSdcSchoolCollectionActive"
      @next="next"
    />
  </v-stepper-window-item>
  <v-stepper-window-item
    :value="4"
    transition="false"
    reverse-transition="false"
  >
    <StepFourDuplicatesProcessing
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
    <StepSevenSubmitData
      :is-step-complete="isStepComplete"
      :school-collection-object="schoolCollectionObject"
      :is-collection-active="isSdcSchoolCollectionActive"
      :show-final-submission-tabs="true"
      @refresh-store="refreshStore"
      @next="next"
    />
  </v-stepper-window-item>
</template>

<script>
import {defineComponent} from 'vue';
import StepSevenSubmitData from '../StepSevenSubmitData.vue';
import StepFourDuplicatesProcessing from '../StepFourDuplicatesProcessing.vue';
import StepOneUploadData from '../stepOneUploadData/StepOneUploadData.vue';
import StepTwoViewDataIssues from '../stepTwoValidateData/StepTwoViewDataIssues.vue';
import StepThreeVerifyData from '../stepThreeVerifyData/StepThreeVerifyData.vue';

export default defineComponent({
  name: 'IndySchoolSteps',
  components: {
    StepThreeVerifyData,
    StepTwoViewDataIssues,
    StepOneUploadData,
    StepFourDuplicatesProcessing,
    StepSevenSubmitData
  },
  props: {
    schoolCollectionObject: {
      type: Object,
      required: true,
      default: null
    },
    isStepComplete: {
      type: Boolean,
      required: true
    },
    isSdcSchoolCollectionActive: {
      type: Boolean,
      required: true
    }
  },
  emits: ['next', 'refresh-store'],
  methods: {
    next() {
      this.$emit('next');
    },
    refreshStore() {
      this.$emit('refresh-store');
    }
  }
});
</script>

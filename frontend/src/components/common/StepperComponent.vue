<template>
  <v-hover v-slot="{ isHovering, props }">
    <v-row v-bind="props">
      <v-col class="pr-0">
        <v-row
          v-for="(step, index) in steps"
          :key="index"
          :class="{'mt-5': true, 'step': true, 'step-previous': step.index < currentStepInCollectionProcess.index, 'step-current': step.index === currentStepInCollectionProcess.index, 'step-future': step.isStarted && step.index > currentStepInCollectionProcess.index, 'step-disabled': !step.isStarted && step.index > currentStepInCollectionProcess.index}"
          @click="onStepClick(step)"
        >
          <v-col
            v-if="!hideStepper"
            :id="step.id"
            class="step-base"
            cols="9"
          >
            <div
              class="pb-7"
            >
              {{ step.name }}
            </div>
          </v-col>
          <v-col
            class="wrapper"
            :cols="hideStepper?12:3"
          >
            <div class="circle">
              <v-icon v-if="step.isComplete">
                mdi-check
              </v-icon>
              <span v-else>{{ index+1 }}</span>
            </div>
            <div
              v-if="index < steps.length -1"
              class="vertical"
            />
          </v-col>
        </v-row>
      </v-col>
      <v-col
        align-self="center"
        cols="auto"
        class="pl-0"
      >
        <v-btn
          v-if="isHovering"
          class="ml-n3"
          position="absolute"
          size="xs"
          :icon="hideStepper?'mdi-chevron-right':'mdi-chevron-left'"
          @click="toggleStepper"
        />
      </v-col>
    </v-row>
  </v-hover>
</template>

<script>
import alertMixin from '../../mixins/alertMixin';
import { mapActions, mapState } from 'pinia';
import { sdcCollectionStore } from '../../store/modules/sdcCollection';

export default {
  name: 'StepperComponent',
  components: {
  },
  mixins: [alertMixin],
  props: {
    steps: {
      type: Array,
      required: true,
      default: null
    },
    nextEvent: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  emits: ['on-navigation-complete'],
  data() {
    return {
      displayCloseIcon: false
    };
  },
  computed: {
    ...mapState(sdcCollectionStore, ['currentStepInCollectionProcess', 'hideStepper'])
  },
  watch: {
    nextEvent(value) {
      if(value) {
        this.moveToNextStep();
      }
    }
  },
  created() {
    this.loadDefaultStep();
  },
  methods: {
    ...mapActions(sdcCollectionStore, ['setCurrentStepInCollectionProcess', 'setHideStepper']),
    onStepClick(step) {
      if (step.index >= this.currentStepInCollectionProcess.index) {
        return;
      }
      this.setCurrentStepInCollectionProcess(step);
      this.$router.push({name: step.route});
    },
    moveToNextStep() {
      const currentIndex = this.currentStepInCollectionProcess.index;
      if (!this.steps[currentIndex].isComplete) {
        this.markStepComplete(currentIndex);
      }
      this.$emit('on-navigation-complete');
      if (currentIndex < (this.steps.length - 1)) {
        this.setNextStepInProgressAndNavigate(currentIndex);       
      }
    },
    markStepComplete(currentIndex) {
      let currentStep = this.steps[currentIndex];
      currentStep.isComplete = true;
    },
    setNextStepInProgressAndNavigate(currentIndex) {
      let nextStep = this.steps[currentIndex + 1];
      nextStep.isStarted = true;
      this.setCurrentStepInCollectionProcess(nextStep);
      this.$router.push({name: nextStep.route});
    },
    loadDefaultStep() {
      const stepToLoad = this.currentStepInCollectionProcess;
      this.$router.push({name: stepToLoad.route});
    },
    toggleStepper() {
      this.setHideStepper(!this.hideStepper);
    }
  }
};
</script>
  
<style scoped>

.step-base {
  margin: 20px auto 0 auto;
}

.step {
  font-weight: bold;
}

.step.step-previous, .step.step-current {
  color: rgb(56, 89, 138);
  cursor: pointer;
}

.step.step-future {
  color: #9dc3e6;
  cursor: not-allowed;
}

.step.step-disabled {
  color: grey;
  cursor: not-allowed;
}

.circle {
    border-radius: 50%;
    width: 34px;
    height: 34px; 
    padding: 2px;   
    color: #fff;
    text-align: center;
    font-size: 16px;
    margin: 20px auto 0 auto;
    position: relative;
}

.step.step-previous .circle, .step.step-current .circle {
  background: rgb(56, 89, 138);
  border: 3px solid rgb(56, 89, 138);
}

.step.step-future .circle {
  background: #9dc3e6;
  border: 3px solid #9dc3e6;
}

.step.step-disabled .circle {
  background: grey;
  border: 3px solid grey;
}

.vertical{
    width: 2px;
    height: 35px;
    background: lightgrey;
    margin: 20px auto 0 auto;
}

.wrapper{
  width: auto;
  height: auto;
}
</style>
  
  

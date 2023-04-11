<template>
  <v-row class="d-flex mt-5">
    <v-col>
      <v-row
        v-for="(step, index) in steps"
        :key="index"
      >
        <v-col
          class="step-base"
          cols="9"
        >
          <div
            :class="{'complete' : step.isComplete, 'not-started': !step.isComplete && step.index > currentStepInCollectionProcess.index, 'in-progress': step.index === currentStepInCollectionProcess.index}"
            class="pb-7"
            @click="onStepClick(step)"
          >
            {{ step.name }}
          </div>
        </v-col>
        <v-col
          class="wrapper"
          cols="3"
        >
          <div :class="{'circle circle-inactive': !step.isComplete && step.index > currentStepInCollectionProcess.index, 'circle circle-active': step.isComplete || step.index === currentStepInCollectionProcess.index}">
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
  </v-row>
</template>

<script>
import alertMixin from '../../mixins/alertMixin';
import { mapActions, mapState } from 'pinia';
import { useSldCollectionStore } from '../../store/modules/sldCollection';

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
    };
  },
  computed: {
    ...mapState(useSldCollectionStore, ['currentStepInCollectionProcess'])
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
    ...mapActions(useSldCollectionStore, ['setCurrentStepInCollectionProcess']),
    onStepClick(step) {
      this.setCurrentStepInCollectionProcess(step);
      this.$router.push({name: step.route});
    },
    moveToNextStep() {
      const currentIndex = this.currentStepInCollectionProcess.index;
      if(!this.steps[currentIndex].isComplete) {
        this.markStepComplete(currentIndex);
      }
      this.$emit('on-navigation-complete');
      if(currentIndex < (this.steps.length - 1)) {
        this.setNextStepInProgressAndNavigate(currentIndex);       
      }
    },
    markStepComplete(currentIndex) {
      let currentStep = this.steps[currentIndex];
      currentStep.isComplete = true;
    },
    setNextStepInProgressAndNavigate(currentIndex) {
      let nextStep = this.steps[currentIndex + 1];
      this.setCurrentStepInCollectionProcess(nextStep);
      this.$router.push({name: nextStep.route});
    },
    loadDefaultStep() {
      const stepToLoad = this.currentStepInCollectionProcess;
      this.$router.push({name: stepToLoad.route});
    }
  }
};
</script>
  
<style scoped>

.step-base {
    margin: 20px auto 0 auto;
}

.in-progress, .complete {
  color: rgb(56, 89, 138);
  font-weight: bold;
}

.not-started {
  cursor: not-allowed;
  pointer-events: none;
  color: grey;
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

.circle-active {
    background: rgb(56, 89, 138);
    border: 3px solid rgb(56, 89, 138);
}

.circle-inactive {
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
  
  

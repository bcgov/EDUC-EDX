import { defineStore } from 'pinia';
import {SLD_STEPS} from '../../utils/institute/SldSteps';

export const useSldCollectionStore = defineStore('sldCollection', {
  id: 'sldCollection',
  state: () => ({
    currentStepInCollectionProcess: null,
    stepsInCollectionProcess: SLD_STEPS,
    currentCollectionTypeCode: null,
    totalStepsInCollection: SLD_STEPS.length
  }),
  getters: {
    getCurrentStepInCollectionProcess: state => state.currentStepInCollectionProcess,
    getStepsInCollectionProcess: state => state.stepsInCollectionProcess,
    getCurrentCollectionTypeCode: state => state.currentCollectionTypeCode,
    getTotalStepsInCollection: state => state.totalStepsInCollection
  },
  actions: {
    setCurrentStepInCollectionProcess(currentStepInCollectionProcess) {
      this.currentStepInCollectionProcess = currentStepInCollectionProcess;
    },
    setCollectionMetaData(sdcSchoolCollectionStatusCode, currentCollectionTypeCode) {
      this.currentCollectionTypeCode = currentCollectionTypeCode;
      switch(sdcSchoolCollectionStatusCode) {
      case 'SCH_D_VRFD':
        this.currentStepInCollectionProcess = this.stepsInCollectionProcess.find(step => step.label === 'STEP-1');
        break;
      case 'SCH_C_VRFD':
        this.currentStepInCollectionProcess = this.stepsInCollectionProcess.find(step => step.label === 'STEP-2');
        break;
      case 'LOADED':
        this.currentStepInCollectionProcess = this.stepsInCollectionProcess.find(step => step.label === 'STEP-3');
        break;
      case 'REVIEWED':
        this.currentStepInCollectionProcess = this.stepsInCollectionProcess.find(step => step.label === 'STEP-4');
        break;
      case 'VERIFIED':
        this.currentStepInCollectionProcess = this.stepsInCollectionProcess.find(step => step.label === 'STEP-5');
        break;
      default: 
        this.currentStepInCollectionProcess = this.stepsInCollectionProcess.find(step => step.label === 'STEP-1');
        break;
      }
    }
  }
});

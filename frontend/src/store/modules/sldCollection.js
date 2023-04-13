import { defineStore } from 'pinia';
import {SLD_STEPS} from '../../utils/institute/SldSteps';
import ApiService from '../../common/apiService';
import { ApiRoutes } from '../../utils/constants';

export const useSldCollectionStore = defineStore('sldCollection', {
  id: 'sldCollection',
  state: () => ({
    currentStepInCollectionProcess: null,
    stepsInCollectionProcess: SLD_STEPS,
    currentCollectionTypeCode: null,
    totalStepsInCollection: SLD_STEPS.length,
    schoolCollectionID: null,
    schoolCollection: null
  }),
  getters: {
    getCurrentStepInCollectionProcess: state => state.currentStepInCollectionProcess,
    getStepsInCollectionProcess: state => state.stepsInCollectionProcess,
    getCurrentCollectionTypeCode: state => state.currentCollectionTypeCode,
    getTotalStepsInCollection: state => state.totalStepsInCollection,
    getSchoolCollectionID: state => state.schoolCollectionID,
  },
  actions: {
    setStepsInCollectionProcess(stepsInCollectionProcess) {
      this.stepsInCollectionProcess = stepsInCollectionProcess;
    },
    setCurrentStepInCollectionProcess(currentStepInCollectionProcess) {
      this.currentStepInCollectionProcess = currentStepInCollectionProcess;
    },
    setSchoolCollectionID(schoolCollectionID) {
      this.schoolCollectionID = schoolCollectionID;
    },
    setCurrentCollectionTypeCode(currentCollectionTypeCode) {
      this.currentCollectionTypeCode = currentCollectionTypeCode;
    },
    setSchoolCollection(schoolCollection) {
      this.schoolCollection = schoolCollection;
    },
    async getSchoolCollection(schoolCollectionId) {
      if(this.schoolCollection == null) {
        const response = await ApiService.apiAxios.get(ApiRoutes.sld.BASE_URL + '/' + schoolCollectionId);
        this.setSchoolCollection(response.data);
        this.setCollectionMetaData(response.data.sdcSchoolCollectionStatusCode);
      }
    },
    setCollectionMetaData(sdcSchoolCollectionStatusCode) {     
      switch(sdcSchoolCollectionStatusCode) {
      case 'NEW':
        this.setCurrentStepInCollectionProcess(this.stepsInCollectionProcess.find(step => step.label === 'STEP-1'));
        break;
      case 'SCH_D_VRFD':
        this.setCurrentStepInCollectionProcess(this.stepsInCollectionProcess.find(step => step.label === 'STEP-2'));
        break;
      case 'SCH_C_VRFD':
        this.setCurrentStepInCollectionProcess(this.stepsInCollectionProcess.find(step => step.label === 'STEP-3'));
        break;
      case 'LOADED': 
        this.setCurrentStepInCollectionProcess(this.stepsInCollectionProcess.find(step => step.label === 'STEP-4'));
        break;
      case 'REVIEWED':
        this.setCurrentStepInCollectionProcess(this.stepsInCollectionProcess.find(step => step.label === 'STEP-5'));
        break;
      default: 
        this.setCurrentStepInCollectionProcess(this.stepsInCollectionProcess.find(step => step.label === 'STEP-1'));
        break;
      }
      this.markStepsComplete();
    },
    markStepsComplete() {   
      this.stepsInCollectionProcess.forEach(step => {
        if(step.index < this.currentStepInCollectionProcess.index) {
          step.isComplete = true;
        }
      });
    }
  }
});

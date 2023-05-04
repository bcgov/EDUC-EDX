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
    schoolCollection: null,
    bandCodesMap: new Map(),
    bandCodes: [],
    careerProgramCodesMap: new Map(),
    careerProgramCodes: [],
    enrolledGradeCodesMap: new Map(),
    enrolledGradeCodes: [],
    homeLanguageSpokenCodesMap: new Map(),
    homeLanguageSpokenCodes: [],
    schoolFundingCodesMap: new Map(),
    schoolFundingCodes: [],
    specialEducationCodesMap: new Map(),
    specialEducationCodes: [],
    validationIssueTypeCodesMap: new Map(),
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
    setBandCodes(bandCodes) {
      this.bandCodes = bandCodes;
      this.bandCodesMap = new Map();
      bandCodes.forEach(bandCode => {
        this.bandCodesMap.set(bandCode.bandCode, bandCode);
      });
    },
    setCareerProgramCodes(careerProgramCodes) {
      this.careerProgramCodes = careerProgramCodes;
      this.careerProgramCodesMap = new Map();
      careerProgramCodes.forEach(careerProgramCode => {
        this.careerProgramCodesMap.set(careerProgramCode.careerProgramCode, careerProgramCode);
      });
    },
    setEnrolledGradeCodes(enrolledGradeCodes) {
      this.enrolledGradeCodes = enrolledGradeCodes;
      this.enrolledGradeCodesMap = new Map();
      enrolledGradeCodes.forEach(enrolledGradeCode => {
        this.enrolledGradeCodesMap.set(enrolledGradeCode.enrolledGradeCode, enrolledGradeCode);
      });
    },
    setHomeLanguageSpokenCodes(homeLanguageSpokenCodes) {
      this.homeLanguageSpokenCodes = homeLanguageSpokenCodes;
      this.homeLanguageSpokenCodesMap = new Map();
      homeLanguageSpokenCodes.forEach(homeLanguageSpokenCode => {
        this.homeLanguageSpokenCodesMap.set(homeLanguageSpokenCode.homeLanguageSpokenCode, homeLanguageSpokenCode);
      });
    },
    setSchoolFundingCodes(schoolFundingCodes) {
      this.schoolFundingCodes = schoolFundingCodes;
      this.schoolFundingCodesMap = new Map();
      schoolFundingCodes.forEach(schoolFundingCode => {
        this.schoolFundingCodesMap.set(schoolFundingCode.schoolFundingCode, schoolFundingCode);
      });
    },
    setSpecialEducationCodes(specialEducationCodes) {
      this.specialEducationCodes = specialEducationCodes;
      this.specialEducationCodesMap = new Map();
      specialEducationCodes.forEach(specialEducationCategoryCode => {
        this.specialEducationCodesMap.set(specialEducationCategoryCode.specialEducationCategoryCode, specialEducationCategoryCode);
      });
    },
    setValidationIssueTypeCodes(validationIssueTypeCodes) {
      this.validationIssueTypeCodesMap = new Map();
      validationIssueTypeCodes.forEach(validationIssue => {
        this.validationIssueTypeCodesMap.set(validationIssue.validationIssueTypeCode, validationIssue);
      });
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
    },
    async getCodes() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is no token.
        if(this.bandCodesMap.size === 0) {
          const response = await ApiService.getAllBandCodes();
          await this.setBandCodes(response.data);
        }
        if(this.careerProgramCodesMap.size === 0) {
          const response = await ApiService.getAllCareerProgramCodes();
          await this.setCareerProgramCodes(response.data);
        }
        if(this.enrolledGradeCodesMap.size === 0) {
          const response = await ApiService.getAllEnrolledGradeCodes();
          await this.setEnrolledGradeCodes(response.data);
        }
        if(this.homeLanguageSpokenCodesMap.size === 0) {
          const response = await ApiService.getAllHomeLanguageSpokenCodes();
          await this.setHomeLanguageSpokenCodes(response.data);
        }
        if(this.schoolFundingCodesMap.size === 0) {
          const response = await ApiService.getAllSchoolFundingCodes();
          await this.setSchoolFundingCodes(response.data);
        }
        if(this.specialEducationCodesMap.size === 0) {
          const response = await ApiService.getAllSpecialEdCodes();
          await this.setSpecialEducationCodes(response.data);
        }
        if(this.validationIssueTypeCodesMap.size === 0) {
          const response = await ApiService.getAllValidationIssueTypeCodes();
          await this.setValidationIssueTypeCodes(response.data);
        }
      }
    }
  }
});

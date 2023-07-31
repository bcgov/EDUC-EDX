import { defineStore } from 'pinia';
import {SDC_STEPS} from '../../utils/institute/SdcSteps';
import ApiService from '../../common/apiService';
import { ApiRoutes } from '../../utils/constants';
import {capitalize} from 'lodash';

export const useSdcCollectionStore = defineStore('sdcCollection', {
  id: 'sdcCollection',
  state: () => ({
    currentStepInCollectionProcess: null,
    stepsInCollectionProcess: SDC_STEPS,
    currentCollectionTypeCode: null,
    totalStepsInCollection: SDC_STEPS.length,
    schoolCollection: null,
    bandCodesMap: new Map(),
    bandCodes: [],
    careerProgramCodesMap: new Map(),
    careerProgramCodes: [],
    enrolledGradeCodesMap: new Map(),
    enrolledGradeCodes: [],
    enrolledProgramCodesMap: new Map(),
    enrolledProgramCodes: [],
    genderCodesMap: new Map(),
    genderCodes: [],
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
  },
  actions: {
    setStepsInCollectionProcess(stepsInCollectionProcess) {
      this.stepsInCollectionProcess = stepsInCollectionProcess;
    },
    setCurrentStepInCollectionProcess(currentStepInCollectionProcess) {
      this.currentStepInCollectionProcess = currentStepInCollectionProcess;
    },
    setCurrentCollectionTypeCode(currentCollectionTypeCode) {
      this.currentCollectionTypeCode = currentCollectionTypeCode;
    },
    setSchoolCollection(schoolCollection) {
      this.schoolCollection = schoolCollection;
    },
    setBandCodes(bandCodes) {
      this.bandCodes = bandCodes.map(item => {
        return {...item, dropdownText: `${item.bandCode} - ${item.label}`};
      });
      this.bandCodesMap = new Map();
      bandCodes.forEach(bandCode => {
        this.bandCodesMap.set(bandCode.bandCode, bandCode);
      });
    },
    setCareerProgramCodes(careerProgramCodes) {
      this.careerProgramCodes = careerProgramCodes.map(item => {
        return {...item, dropdownText: `${item.careerProgramCode} - ${item.label}`};
      });
      this.careerProgramCodesMap = new Map();
      careerProgramCodes.forEach(careerProgramCode => {
        this.careerProgramCodesMap.set(careerProgramCode.careerProgramCode, careerProgramCode);
      });
    },
    setEnrolledProgramCodes(enrolledProgramCodes) {
      this.enrolledProgramCodes = enrolledProgramCodes.map(item => {
        return {...item, dropdownText: `${item.enrolledProgramCode} - ${item.label}`};
      });
      this.enrolledProgramCodesMap = new Map();
      enrolledProgramCodes.forEach(enrolledProgramCode => {
        this.enrolledProgramCodesMap.set(enrolledProgramCode.enrolledProgramCode, enrolledProgramCode);
      });
    },
    setEnrolledGradeCodes(enrolledGradeCodes) {
      this.enrolledGradeCodes = enrolledGradeCodes.map(item => {
        return {...item, dropdownText: `${item.enrolledGradeCode} - ${item.label}`};
      });
      this.enrolledGradeCodesMap = new Map();
      enrolledGradeCodes.forEach(enrolledGradeCode => {
        this.enrolledGradeCodesMap.set(enrolledGradeCode.enrolledGradeCode, enrolledGradeCode);
      });
    },
    setGenderCodes(genderCodes) {
      this.genderCodes = genderCodes.map(item => {
        return {...item, dropdownText: `${item.genderCode} - ${item.label}`};
      });
      this.genderCodesMap = new Map();
      genderCodes.forEach(genderCode => {
        this.genderCodesMap.set(genderCode.genderCode, genderCode);
      });
    },
    setHomeLanguageSpokenCodes(homeLanguageSpokenCodes) {
      this.homeLanguageSpokenCodes = homeLanguageSpokenCodes.map(item => {
        return {...item, dropdownText: `${item.homeLanguageSpokenCode} - ${item.label}`};
      });
      this.homeLanguageSpokenCodesMap = new Map();
      homeLanguageSpokenCodes.forEach(homeLanguageSpokenCode => {
        this.homeLanguageSpokenCodesMap.set(homeLanguageSpokenCode.homeLanguageSpokenCode, homeLanguageSpokenCode);
      });
    },
    setSchoolFundingCodes(schoolFundingCodes) {
      this.schoolFundingCodes = schoolFundingCodes.map(item => {
        return {...item, dropdownText: `${item.schoolFundingCode} - ${item.label}`};
      });
      this.schoolFundingCodesMap = new Map();
      schoolFundingCodes.forEach(schoolFundingCode => {
        this.schoolFundingCodesMap.set(schoolFundingCode.schoolFundingCode, schoolFundingCode);
      });
    },
    setSpecialEducationCodes(specialEducationCodes) {
      this.specialEducationCodes = specialEducationCodes.map(item => {
        return {...item, dropdownText: `${item.specialEducationCode} - ${item.label}`};
      });
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
        const response = await ApiService.apiAxios.get(ApiRoutes.sdc.BASE_URL + '/' + schoolCollectionId);
        this.setSchoolCollection(response.data);
        this.setCurrentCollectionTypeCode(capitalize(response.data.collectionTypeCode));
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
      this.setStepsProgressState();
    },
    setStepsProgressState() {
      this.stepsInCollectionProcess.forEach(step => {
        if (step.index <= this.currentStepInCollectionProcess.index) {
          step.isStarted = true;
        }
        if(step.index < this.currentStepInCollectionProcess.index) {
          step.isComplete = true;
        }
      });
    },
    async getCodes() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is no token.
        if(this.bandCodesMap.size === 0) {
          const response = await ApiService.getAllBandCodes();
          this.setBandCodes(response.data);
        }
        if(this.careerProgramCodesMap.size === 0) {
          const response = await ApiService.getAllCareerProgramCodes();
          this.setCareerProgramCodes(response.data);
        }
        if(this.enrolledGradeCodesMap.size === 0) {
          const response = await ApiService.getAllEnrolledGradeCodes();
          this.setEnrolledGradeCodes(response.data);
        }
        if(this.enrolledProgramCodesMap.size === 0) {
          const response = await ApiService.getAllEnrolledProgramCodes();
          this.setEnrolledProgramCodes(response.data);
        }
        if(this.genderCodesMap.size === 0) {
          const response = await ApiService.getAllGenderCodes();
          this.setGenderCodes(response.data);
        }
        if(this.homeLanguageSpokenCodesMap.size === 0) {
          const response = await ApiService.getAllHomeLanguageSpokenCodes();
          this.setHomeLanguageSpokenCodes(response.data);
        }
        if(this.schoolFundingCodesMap.size === 0) {
          const response = await ApiService.getAllSchoolFundingCodes();
          this.setSchoolFundingCodes(response.data);
        }
        if(this.specialEducationCodesMap.size === 0) {
          const response = await ApiService.getAllSpecialEdCodes();
          this.setSpecialEducationCodes(response.data);
        }
        if(this.validationIssueTypeCodesMap.size === 0) {
          const response = await ApiService.getAllValidationIssueTypeCodes();
          this.setValidationIssueTypeCodes(response.data);
        }
      }
    }
  }
});

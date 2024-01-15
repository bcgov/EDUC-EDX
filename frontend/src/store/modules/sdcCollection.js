import { defineStore } from 'pinia';
import {SDC_STEPS_SCHOOL} from '../../utils/institute/SdcSteps';
import ApiService from '../../common/apiService';
import { ApiRoutes } from '../../utils/constants';
import {capitalize} from 'lodash';
import {LocalDateTime} from '@js-joda/core';
import {getDateFormatter} from '../../utils/format';

export const sdcCollectionStore = defineStore('sdcCollection', {
  id: 'sdcCollection',
  state: () => ({
    currentStepInCollectionProcess: null,
    currentCollectionTypeCode: null,
    currentCollectionYear: null,
    totalStepsInCollection: SDC_STEPS_SCHOOL.length,
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
    ancestryItems: [{code:'Y', dropdownText:'Yes'}, {code:'N', dropdownText:'No'}],
    hideStepper: false
  }),
  getters: {
    getCurrentCollectionTypeCode: state => state.currentCollectionTypeCode,
    getTotalStepsInCollection: state => state.totalStepsInCollection,
  },
  actions: {
    setHideStepper(hideStepper) {
      this.hideStepper = hideStepper;
    },
    setCurrentStepInCollectionProcess(currentStepInCollectionProcess) {
      this.currentStepInCollectionProcess = currentStepInCollectionProcess;
    },
    setCurrentCollectionTypeCode(currentCollectionTypeCode) {
      this.currentCollectionTypeCode = currentCollectionTypeCode;
    },
    setCurrentCollectionYear(currentCollectionYear) {
      this.currentCollectionYear = currentCollectionYear;
    },
    setSchoolCollection(schoolCollection) {
      this.schoolCollection = schoolCollection;
    },
    setBandCodes(bandCodes) {
      this.bandCodes = bandCodes.map(item => {
        return {...item, dropdownText: `${item.bandCode} - ${item.description}`};
      });
      this.bandCodesMap = new Map();
      this.bandCodes.unshift({'bandCode': '', 'dropdownText': 'No Band Code'});
      bandCodes.forEach(bandCode => {
        this.bandCodesMap.set(bandCode.bandCode, bandCode);
      });
    },
    setCareerProgramCodes(careerProgramCodes) {
      this.careerProgramCodes = careerProgramCodes.map(item => {
        return {...item, dropdownText: `${item.careerProgramCode} - ${item.description}`};
      });
      this.careerProgramCodesMap = new Map();
      this.careerProgramCodes.unshift({'careerProgramCode': '', 'dropdownText': 'No Career Code'});
      careerProgramCodes.forEach(careerProgramCode => {
        this.careerProgramCodesMap.set(careerProgramCode.careerProgramCode, careerProgramCode);
      });
    },
    setEnrolledProgramCodes(enrolledProgramCodes) {
      this.enrolledProgramCodes = enrolledProgramCodes.map(item => {
        return {...item, dropdownText: `${item.enrolledProgramCode} - ${item.description}`};
      });
      this.enrolledProgramCodesMap = new Map();
      enrolledProgramCodes.forEach(enrolledProgramCode => {
        this.enrolledProgramCodesMap.set(enrolledProgramCode.enrolledProgramCode, enrolledProgramCode);
      });
    },
    setEnrolledGradeCodes(enrolledGradeCodes) {
      this.enrolledGradeCodes = enrolledGradeCodes.map(item => {
        return {...item, dropdownText: `${item.enrolledGradeCode} - ${item.description}`};
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
        return {...item, dropdownText: `${item.homeLanguageSpokenCode} - ${item.description}`};
      });
      this.homeLanguageSpokenCodesMap = new Map();
      this.homeLanguageSpokenCodes.unshift({'homeLanguageSpokenCode': '', 'dropdownText': 'No Home Language Code'});
      homeLanguageSpokenCodes.forEach(homeLanguageSpokenCode => {
        this.homeLanguageSpokenCodesMap.set(homeLanguageSpokenCode.homeLanguageSpokenCode, homeLanguageSpokenCode);
      });
    },
    setSchoolFundingCodes(schoolFundingCodes) {
      this.schoolFundingCodes = schoolFundingCodes.map(item => {
        return {...item, dropdownText: `${item.schoolFundingCode} - ${item.description}`};
      });
      this.schoolFundingCodesMap = new Map();
      this.schoolFundingCodes.unshift({'schoolFundingCode': '', 'dropdownText': 'No Funding Code'});
      schoolFundingCodes.forEach(schoolFundingCode => {
        this.schoolFundingCodesMap.set(schoolFundingCode.schoolFundingCode, schoolFundingCode);
      });
    },
    setSpecialEducationCodes(specialEducationCodes) {
      this.specialEducationCodes = specialEducationCodes.map(item => {
        return {...item, dropdownText: `${item.specialEducationCategoryCode} - ${item.description}`};
      });
      this.specialEducationCodesMap = new Map();
      this.specialEducationCodes.unshift({'specialEducationCategoryCode': '', 'dropdownText': 'No Special Ed Category Code'});
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
      const response = await ApiService.apiAxios.get(ApiRoutes.sdc.BASE_URL + '/' + schoolCollectionId);
      this.setSchoolCollection(response.data);
      this.setCurrentCollectionTypeCode(capitalize(response.data.collectionTypeCode));
      this.setCurrentCollectionYear(LocalDateTime.parse(response.data.collectionOpenDate, getDateFormatter('uuuu-MM-dd\'T\'HH:mm:ss')).year());
    },
    async getCodes() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is no token.
        if(this.bandCodesMap.size === 0) {
          const response = await ApiService.getAllActiveBandCodes();
          this.setBandCodes(response.data);
        }
        if(this.careerProgramCodesMap.size === 0) {
          const response = await ApiService.getAllActiveCareerProgramCodes();
          this.setCareerProgramCodes(response.data);
        }
        if(this.enrolledGradeCodesMap.size === 0) {
          const response = await ApiService.getAllActiveEnrolledGradeCodes();
          this.setEnrolledGradeCodes(response.data);
        }
        if(this.enrolledProgramCodesMap.size === 0) {
          const response = await ApiService.getAllActiveEnrolledProgramCodes();
          this.setEnrolledProgramCodes(response.data);
        }
        if(this.genderCodesMap.size === 0) {
          const response = await ApiService.getAllActiveGenderCodes();
          this.setGenderCodes(response.data);
        }
        if(this.homeLanguageSpokenCodesMap.size === 0) {
          const response = await ApiService.getAllActiveHomeLanguageSpokenCodes();
          this.setHomeLanguageSpokenCodes(response.data);
        }
        if(this.schoolFundingCodesMap.size === 0) {
          const response = await ApiService.getAllActiveSchoolFundingCodes();
          this.setSchoolFundingCodes(response.data);
        }
        if(this.specialEducationCodesMap.size === 0) {
          const response = await ApiService.getAllActiveSpecialEdCodes();
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

import { defineStore } from 'pinia';
import ApiService from '../../common/apiService';
import { ApiRoutes } from '../../utils/constants';
import {capitalize} from 'lodash';
import {LocalDate, LocalDateTime} from '@js-joda/core';

export const sdcCollectionStore = defineStore('sdcCollection', {
  id: 'sdcCollection',
  state: () => ({
    collectionTypeCodes: [],
    collectionTypeCodesMap: new Map(),
    currentStepInCollectionProcess: null,
    currentCollectionTypeCode: null,
    currentCollectionYear: null,
    currentCollectionSubmissionDueDate: null,
    currentCollectionResolveDupDueDate: null,
    currentCollectionSignOffDueDate: null,
    schoolCollection: null,
    districtCollection: null,
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
    schoolCollectionStatusCodesMap: new Map(),
    schoolFundingCodesMap: new Map(),
    schoolFundingCodes: [],
    specialEducationCodesMap: new Map(),
    specialEducationCodes: [],
    validationIssueTypeCodesMap: new Map(),
    ancestryItems: [{code:'Y', dropdownText:'Yes'}, {code:'N', dropdownText:'No'}],
    hideStepper: false,
    programEligibilityCodesMap: new Map(),
    zeroFteReasonCodesMap: new Map(),
    otherCoursesValidNumbers: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    supportBlocksValidNumbers: ['0', '1', '2', '3', '4', '5', '6', '7', '8']
  }),
  getters: {
    getCurrentCollectionTypeCode: state => state.currentCollectionTypeCode
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
    setCurrentCollectionSubmissionDueDate(currentCollectionSubmissionDueDate) {
      this.currentCollectionSubmissionDueDate = currentCollectionSubmissionDueDate;
    },
    setCurrentCollectionResolveDupDueDate(currentCollectionResolveDupDueDate) {
      this.currentCollectionResolveDupDueDate = currentCollectionResolveDupDueDate;
    },
    setCurrentCollectionSignOffDueDate(currentCollectionSignOffDueDate) {
      this.currentCollectionSignOffDueDate = currentCollectionSignOffDueDate;
    },
    setDistrictCollection(districtCollection) {
      this.districtCollection = districtCollection;
    },
    setSchoolCollection(schoolCollection) {
      this.schoolCollection = schoolCollection;
    },
    setBandCodes(bandCodes) {
      this.bandCodes = bandCodes.sort((a,b) => {
        if (a.bandCode<b.bandCode) return -1;
        if (a.bandCode>b.bandCode) return 1;
        return 0;

      }).map(item => {
        return {...item, dropdownText: `${item.description} (${item.bandCode})`};
      });

      this.bandCodesMap = new Map();
      this.bandCodes.unshift({'bandCode': null, 'dropdownText': 'No Band Code'});
      bandCodes.forEach(bandCode => {
        this.bandCodesMap.set(bandCode.bandCode, bandCode);
      });
    },
    setCareerProgramCodes(careerProgramCodes) {
      this.careerProgramCodes = careerProgramCodes.map(item => {
        return {...item, dropdownText: `${item.description} (${item.careerProgramCode})`};
      });
      this.careerProgramCodesMap = new Map();
      this.careerProgramCodes.unshift({'careerProgramCode': null, 'dropdownText': 'No Career Code'});
      careerProgramCodes.forEach(careerProgramCode => {
        this.careerProgramCodesMap.set(careerProgramCode.careerProgramCode, careerProgramCode);
      });
    },
    setEnrolledProgramCodes(enrolledProgramCodes) {
      this.enrolledProgramCodes = enrolledProgramCodes.map(item => {
        return {...item, dropdownText: `${item.description} (${item.enrolledProgramCode})`};
      });
      this.enrolledProgramCodesMap = new Map();
      enrolledProgramCodes.forEach(enrolledProgramCode => {
        this.enrolledProgramCodesMap.set(enrolledProgramCode.enrolledProgramCode, enrolledProgramCode);
      });
    },
    setEnrolledGradeCodes(enrolledGradeCodes) {
      this.enrolledGradeCodes = enrolledGradeCodes.map(item => {
        return {...item, dropdownText: `${item.description} (${item.enrolledGradeCode})`};
      });
      this.enrolledGradeCodesMap = new Map();
      enrolledGradeCodes.forEach(enrolledGradeCode => {
        this.enrolledGradeCodesMap.set(enrolledGradeCode.enrolledGradeCode, enrolledGradeCode);
      });
    },
    setGenderCodes(genderCodes) {
      this.genderCodes = genderCodes.map(item => {
        return {...item, dropdownText: `${item.label} (${item.genderCode})`};
      });
      this.genderCodesMap = new Map();
      genderCodes.forEach(genderCode => {
        this.genderCodesMap.set(genderCode.genderCode, genderCode);
      });
    },
    setHomeLanguageSpokenCodes(homeLanguageSpokenCodes) {
      this.homeLanguageSpokenCodes = homeLanguageSpokenCodes.map(item => {
        return {...item, dropdownText: `${item.description} (${item.homeLanguageSpokenCode})`};
      });
      this.homeLanguageSpokenCodesMap = new Map();
      this.homeLanguageSpokenCodes.unshift({'homeLanguageSpokenCode': null, 'dropdownText': 'No Home Language Code'});
      homeLanguageSpokenCodes.forEach(homeLanguageSpokenCode => {
        this.homeLanguageSpokenCodesMap.set(homeLanguageSpokenCode.homeLanguageSpokenCode, homeLanguageSpokenCode);
      });
    },
    setSchoolFundingCodes(schoolFundingCodes) {
      this.schoolFundingCodes = schoolFundingCodes.map(item => {
        return {...item, dropdownText: `${item.description} (${item.schoolFundingCode})`};
      });
      this.schoolFundingCodesMap = new Map();
      this.schoolFundingCodes.unshift({'schoolFundingCode': null, 'dropdownText': 'No Funding Code'});
      schoolFundingCodes.forEach(schoolFundingCode => {
        this.schoolFundingCodesMap.set(schoolFundingCode.schoolFundingCode, schoolFundingCode);
      });
    },
    setSchoolCollectionStatusCodes(schoolCollectionStatusCodes){
      this.schoolCollectionStatusCodes = schoolCollectionStatusCodes.map(item => {
        return {...item, dropdownText: `${item.label}`};
      });
      this.schoolCollectionStatusCodesMap = new Map();
      schoolCollectionStatusCodes.forEach(schoolCollectionCode => {
        this.schoolCollectionStatusCodesMap.set(schoolCollectionCode.sdcSchoolCollectionStatusCode, schoolCollectionCode);
      });
    },
    setSpecialEducationCodes(specialEducationCodes) {
      this.specialEducationCodes = specialEducationCodes.map(item => {
        return {...item, dropdownText: `${item.description} (${item.specialEducationCategoryCode})`};
      });
      this.specialEducationCodesMap = new Map();
      this.specialEducationCodes.unshift({'specialEducationCategoryCode': null, 'dropdownText': 'No Inclusive Ed Category Code'});
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
    setProgramEligibilityCodesMap(programEligibilityCodesMap) {
      programEligibilityCodesMap.forEach(issue => {
        this.programEligibilityCodesMap.set(issue.programEligibilityIssueTypeCode, issue);
      });
    },
    setZeroFteReasonCodesMap(zeroFteReasonCodesMap) {
      zeroFteReasonCodesMap.forEach(issue => {
        this.zeroFteReasonCodesMap.set(issue.fteZeroReasonCode, issue);
      });
    },
    async setCollectionTypeCodes(collectionTypes) {
      try {
        collectionTypes.sort((a, b) => {
          const dateA = LocalDateTime.parse(a.effectiveDate);
          const dateB = LocalDateTime.parse(b.effectiveDate);

          return dateA.compareTo(dateB);
        });
      } catch (error) {
        console.error("Error parsing date in setCollectionTypeCodes:", error);
      }

      this.collectionTypeCodes = collectionTypes;
      this.collectionTypeCodesMap = new Map();
      collectionTypes.forEach(element => {
        this.collectionTypeCodesMap.set(element.collectionTypeCode, element);
      });
    },
    async getSchoolCollectionStatusCodeMap(){
      if(this.schoolCollectionStatusCodesMap.size === 0) {
        await ApiService.getAllSchoolCollectionStatusCodes().then((res) => {
          this.setSchoolCollectionStatusCodes(res.data);
        });
      }
      return this.schoolCollectionStatusCodesMap;
    },
    async getSchoolCollection(schoolCollectionId) {
      const response = await ApiService.apiAxios.get(ApiRoutes.sdc.SDC_SCHOOL_COLLECTION + '/' + schoolCollectionId);
      this.setSchoolCollection(response.data);
      this.setCurrentCollectionTypeCode(capitalize(response.data.collectionTypeCode));
      this.setCurrentCollectionYear(LocalDate.parse(response.data.submissionDueDate)?.year());
    },
    async getDistrictCollection(districtCollectionId) {
      const response = await ApiService.apiAxios.get(ApiRoutes.sdc.SDC_DISTRICT_COLLECTION + '/' + districtCollectionId);
      this.setDistrictCollection(response.data);
      this.setCurrentCollectionTypeCode(capitalize(response.data.collectionTypeCode));
      this.setCurrentCollectionYear(LocalDate.parse(response.data.submissionDueDate)?.year());
    },
    async getCollectionTypeCodesMap() {
      if(this.collectionTypeCodesMap.size === 0) {
        ApiService.getAllCollectionTypeCodes().then((res) => this.setCollectionTypeCodes(res.data));
      }
      return this.collectionTypeCodesMap;
    },
    async getCodes() {
      if(localStorage.getItem('jwtToken')) { // DONT Call api if there is no token.
        const promises = [
          ... this.bandCodesMap.size === 0 ? [ApiService.getAllActiveBandCodes().then((res) => this.setBandCodes(res.data))] : [],
          ... this.careerProgramCodesMap.size === 0 ? [ApiService.getAllActiveCareerProgramCodes().then((res) => this.setCareerProgramCodes(res.data))] : [],
          ... this.enrolledGradeCodesMap.size === 0 ? [ApiService.getAllActiveEnrolledGradeCodes().then((res) => this.setEnrolledGradeCodes(res.data))] : [],
          ... this.enrolledProgramCodesMap.size === 0 ? [ApiService.getAllActiveEnrolledProgramCodes().then((res) => this.setEnrolledProgramCodes(res.data))] : [],
          ... this.genderCodesMap.size === 0 ? [ApiService.getAllActiveGenderCodes().then((res) => this.setGenderCodes(res.data))] : [],
          ... this.homeLanguageSpokenCodesMap.size === 0 ? [ApiService.getAllActiveHomeLanguageSpokenCodes().then((res) => this.setHomeLanguageSpokenCodes(res.data))] : [],
          ... this.schoolFundingCodesMap.size === 0 ? [ApiService.getAllActiveSchoolFundingCodes().then((res) => this.setSchoolFundingCodes(res.data))] : [],
          ... this.specialEducationCodesMap.size === 0 ? [ApiService.getAllActiveSpecialEdCodes().then((res) => this.setSpecialEducationCodes(res.data))] : [],
          ... this.validationIssueTypeCodesMap.size === 0 ? [ApiService.getAllValidationIssueTypeCodes().then((res) => this.setValidationIssueTypeCodes(res.data))] : [],
          ... this.programEligibilityCodesMap.size === 0 ? [ApiService.getAllProgramEligibilityTypeCodes().then((res) => this.setProgramEligibilityCodesMap(res.data))]: [],
          ... this.zeroFteReasonCodesMap.size === 0 ? [ApiService.getAllZeroFteReasonCodes().then((res) => this.setZeroFteReasonCodesMap(res.data))] : [],
          ... this.schoolCollectionStatusCodesMap.size === 0 ? [ApiService.getAllSchoolCollectionStatusCodes().then((res) => this.setSchoolCollectionStatusCodes(res.data))] : [],
        ];
        return Promise.all(promises);
      }
    },
    async getCollectionByDistrictId(districtId) {
      const response = await ApiService.apiAxios.get(ApiRoutes.sdc.SDC_COLLECTION_BY_DISTRICT_ID + '/' + districtId);
      this.setCurrentCollectionSubmissionDueDate(response.data.submissionDueDate);
      this.setCurrentCollectionResolveDupDueDate(response.data.duplicationResolutionDueDate);
      this.setCurrentCollectionSignOffDueDate(response.data.signOffDueDate);
    },
    async getCollectionBySchoolId(schoolId) {
      const response = await ApiService.apiAxios.get(ApiRoutes.sdc.SDC_COLLECTION_BY_SCHOOL_ID + '/' + schoolId);
      this.setCurrentCollectionSubmissionDueDate(response.data.submissionDueDate);
    }
  }
});

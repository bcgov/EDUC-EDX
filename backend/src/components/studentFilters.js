'use strict';
const log = require('./logger');
const { FILTER_OPERATION, VALUE_TYPE, CONDITION } = require('../util/constants');
const cacheService = require('./cache-service');

function createMoreFiltersSearchCriteria(searchFilter = []) {
    let searchCriteriaList = [];
    let studentTypeFilterList = [];
    let fteFilterList = [];
    let supportBlockList = [];
    let careerProgramFundingList = [];
    let careerCodeList = [];
    let careerProgramsList = [];
    let frenchProgramsList = [];
    let frenchProgramFundingList = [];
    let indigenousProgramList = [];
    let ancestryList = [];
    let indigenousProgramsFundingList = [];
    let bandCodeList = [];
    searchFilter.forEach((elem) => {
      let pValue = elem.value ? elem.value.map(filter => filter.value) : null;
      if (elem.key === 'studentType' && pValue) {
        if (pValue.includes('isSchoolAged')) {
          studentTypeFilterList.push({ key: 'isSchoolAged', value: 'true', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.BOOLEAN, condition: CONDITION.OR });
        }
        if (pValue.includes('isAdult')) {
          studentTypeFilterList.push({ key: 'isAdult', value: 'true', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.BOOLEAN, condition: CONDITION.OR });
        }
      }
      if (elem.key === 'fte' && pValue) {
        if (pValue.includes('fteEq0')) {
          fteFilterList.push({ key: 'fte', value: 0, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.OR });
        }
        if (pValue.includes('fteLt1')) {
          fteFilterList.push({ key: 'fte', value: 1, operation: FILTER_OPERATION.LESS_THAN, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.OR });
        }
        if (pValue.includes('fteGt0')) {
          fteFilterList.push({ key: 'fte', value: 0, operation: FILTER_OPERATION.GREATER_THAN, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.OR });
        }
      }
      if (elem.key === 'grade' && pValue) {
        validateGradeFilter(pValue);
        searchCriteriaList.push({ key: 'enrolledGradeCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
      }
      if (elem.key === 'careerCode' && pValue) {
        validateCareerCodeFilter(pValue);
        careerCodeList.push({ key: 'careerProgramCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
      }
      if (elem.key === 'careerPrograms' && pValue) {
        validateEnrolledProgramFilter(pValue);
        careerProgramsList.push({ key: 'sdcStudentEnrolledProgramEntities.enrolledProgramCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
      }
      if (elem.key === 'frenchProgram' && pValue) {
        validateEnrolledProgramFilter(pValue);
        frenchProgramsList.push({ key: 'sdcStudentEnrolledProgramEntities.enrolledProgramCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
      }
      if( elem.key === 'indigenousPrograms' && pValue) {
        validateEnrolledProgramFilter(pValue);
        indigenousProgramList.push({ key: 'sdcStudentEnrolledProgramEntities.enrolledProgramCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
      }
      if (elem.key === 'warnings' && pValue) {
        searchCriteriaList.push({ key: 'sdcStudentValidationIssueEntities.validationIssueSeverityCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
      }
      if (elem.key === 'support' && pValue) {
        if (pValue.toString() === 'hasSupportBlocks') {
          supportBlockList.push({ key: 'supportBlocks', value: '0', operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
          supportBlockList.push({ key: 'supportBlocks', value: null, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
        } else if (pValue.toString() === 'noSupportBlocks') {
          supportBlockList.push({ key: 'supportBlocks', value: '0', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
          supportBlockList.push({ key: 'supportBlocks', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
        }
      }
      if(elem.key === 'careerProgramsFunding' && pValue) {
        if (pValue.toString() === 'isCareerFundingEligible') {
          careerProgramFundingList.push({ key: 'careerProgramNonEligReasonCode', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
        } else if (pValue.toString() === 'isNotCareerFundingEligible') {
          careerProgramFundingList.push({ key: 'careerProgramNonEligReasonCode', value: null, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
        }
      }
      if (elem.key === 'ancestry' && pValue) {
        if (pValue.toString() === 'true') {
          ancestryList.push({ key: 'nativeAncestryInd', value: 'Y', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
        } else if (pValue.toString() === 'false') {
          ancestryList.push({ key: 'nativeAncestryInd', value: 'N', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
        }
      }
      if (elem.key === 'indigenousProgramsFunding' && pValue) {
        if (pValue.toString() === 'true') {
          indigenousProgramsFundingList.push({ key: 'indigenousSupportProgramNonEligReasonCode', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
        } else if (pValue.toString() === 'false') {
          indigenousProgramsFundingList.push({ key: 'indigenousSupportProgramNonEligReasonCode', value: null, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
        }
      }
      if(elem.key === 'frenchFunding' && pValue) {
        if (pValue.toString() === 'true') {
          frenchProgramFundingList.push({ key: 'frenchProgramNonEligReasonCode', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
        } else if (pValue.toString() === 'false') {
          frenchProgramFundingList.push({ key: 'frenchProgramNonEligReasonCode', value: null, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
        }
      }
      if (elem.key === 'fteZero' && pValue) {
        validateFteZeroFilter(pValue);
        searchCriteriaList.push({ key: 'fteZeroReasonCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
      }
      if (elem.key === 'fundingType' && pValue) {
        validateFundingTypeFilter(pValue);
  
        if (pValue.includes('14')) {
          searchCriteriaList.push({ key: 'schoolFundingCode', value: '14', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
        }
        if (pValue.includes('20')) {
          searchCriteriaList.push({ key: 'schoolFundingCode', value: '20', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
        }
        if (pValue.includes('16')) {
          searchCriteriaList.push({ key: 'schoolFundingCode', value: '16', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
        }
        if (pValue.includes('No Funding')) {
          searchCriteriaList.push({ key: 'schoolFundingCode', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
        }
      }
      if (elem.key === 'bandResidence' && pValue) {
        bandCodeList.push({ key: 'bandCode', value: pValue.toString(), operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
      }
      if (elem.key === 'bandCode' && pValue) {
        if (pValue.toString() === 'true') {
          bandCodeList.push({ key: 'bandCode', value: null, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
        } else if (pValue.toString() === 'false') {
          bandCodeList.push({ key: 'bandCode', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
        }   
      }
    });
    const search = [];
    if (searchCriteriaList.length > 0) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: searchCriteriaList
      });
    }
    if (studentTypeFilterList.length > 0) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: studentTypeFilterList
      });
    }
    if (fteFilterList.length > 0) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: fteFilterList
      });
    }
    if (supportBlockList.length > 0) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: supportBlockList
      });
    }
    if (careerProgramFundingList.length > 0) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: careerProgramFundingList
      });
    }
    if (careerCodeList.length > 0) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: careerCodeList
      });
    }
    if (careerProgramsList.length > 0) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: careerProgramsList
      });
    }
    if (frenchProgramsList.length > 0) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: frenchProgramsList
      });
    }
    if (frenchProgramFundingList.length > 0) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: frenchProgramFundingList
      });
    }
    if(indigenousProgramList.length > 0) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: indigenousProgramList
      });
    }
    if(ancestryList.length > 0) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: ancestryList
      });
    }
    if(indigenousProgramsFundingList.length > 0) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: indigenousProgramsFundingList
      });
    }
    if(bandCodeList.length > 0) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: bandCodeList
      });
    }
    return search;
  }

  function validateFteZeroFilter(filters) {
    let fteZeroCategories = [
      'OUTOFPROV',
      'NOMROLL',
      'TOOYOUNG',
      'INDYADULT',
      'INACTIVE',
      'DISTDUP',
      'AUTHDUP'
    ];
    if (filters.length > 0) {
      if (filters.every(value => fteZeroCategories.includes(cat => value === cat))) {
        log.error('Invalid zero fte reason code.');
        throw new Error('400');
      }
    }
  }
  
  function validateGradeFilter(filterGrades = []) {
    const activeGradeCodes = cacheService.getActiveEnrolledGradeCodes();
    if (filterGrades.length > 0) {
      if (filterGrades.every(value => activeGradeCodes.includes(grade => value === grade.enrolledGradeCode))) {
        log.error('Invalid grade filter.');
        throw new Error('400');
      }
    }
  }
  
  function validateFundingTypeFilter(filterFunding = []) {
    const activeFundingCodes = cacheService.getActiveFundingCodes();
    if (filterFunding.length > 0) {
      if (filterFunding.every(value => activeFundingCodes.includes(code => code !== 'No Funding' && value === code.schoolFundingCode))) {
        log.error('Invalid funding code filter.');
        throw new Error('400');
      }
    }
  }
  
  function validateCareerCodeFilter(filterCareerCodes = []) {
    const activeFundingCodes = cacheService.getActiveCareerCodes();
    if (filterCareerCodes.length > 0) {
      if (filterCareerCodes.every(value => activeFundingCodes.includes(code => value === code.careerProgramCode))) {
        log.error('Invalid career code filter.');
        throw new Error('400');
      }
    }
  }
  
  function validateEnrolledProgramFilter(filterGrades = []) {
    const activeFundingCodes = cacheService.getActiveEnrolledPrograms();
    if (filterGrades.length > 0) {
      if (filterGrades.every(value => activeFundingCodes.includes(code => value === code.enrolledProgramCode))) {
        log.error('Invalid enrolled program filter.');
        throw new Error('400');
      }
    }
  }


module.exports = {
    createMoreFiltersSearchCriteria
}
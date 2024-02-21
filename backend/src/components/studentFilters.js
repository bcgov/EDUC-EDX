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
    let spedCodeList = [];
    let spedFundingList = [];
    let ellList = [];
    let ellFunding = [];
    let fundingTypeList = [];
    let courseRangeList = [];
    searchFilter.forEach((elem) => {
      let pValue = elem.value ? elem.value.map(filter => filter.value) : null;
      if (elem.key === 'studentType' && pValue) {
        studentTypeFilterList = createStudentTypeFilter(pValue);
      }
      if (elem.key === 'fte' && pValue) {
        fteFilterList = createFteFilter(pValue);
      }
      if (elem.key === 'careerCode' && pValue) {
        careerCodeList = careerCodeFilter(pValue);
      }
      if (elem.key === 'careerPrograms' && pValue) {
        careerProgramsList = createCareerProgramFilter(pValue);
      }
      if (elem.key === 'frenchProgram' && pValue) {
        frenchProgramsList = createFrenchProgramFilter(pValue);
      }
      if( elem.key === 'indigenousPrograms' && pValue) {
        indigenousProgramList = createIndigenousProgramFilter(pValue);
      }
      if (elem.key === 'support' && pValue) {
        supportBlockList = createSupportBlockFilter(pValue);
      }
      if(elem.key === 'careerProgramsFunding' && pValue) {
        careerProgramFundingList = createCareerProgramFundingfilter(pValue);
      }
      if(elem.key === 'ancestry' && pValue) {
        ancestryList = createAncestryFilter(pValue);
      }
      if(elem.key === 'indigenousProgramsFunding' && pValue) {
        indigenousProgramsFundingList = createIndigenousFundingFilter(pValue);
      }
      if(elem.key === 'frenchFunding' && pValue) {
        frenchProgramFundingList = createFrenchFundingFilter(pValue);
      }
      if(elem.key === 'sped' && pValue) {
        spedCodeList = createSpedFilter(pValue);
      }
      if(elem.key === 'spedFunding' && pValue) {
        spedFundingList = createSpedFundingFilter(pValue)
      }
      if(elem.key === 'ellYears' && pValue) {
        ellList = createEllYearsFilter(pValue);
      }
      if(elem.key === 'ellFunding' && pValue) {
        ellFunding = createEllFundingFilter(pValue);
      }
      if (elem.key === 'warnings' && pValue) {
        validateWarningFilter(pValue);
        searchCriteriaList.push({ key: 'sdcStudentValidationIssueEntities.validationIssueSeverityCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
      }
      if (elem.key === 'grade' && pValue) {
        validateGradeFilter(pValue);
        searchCriteriaList.push({ key: 'enrolledGradeCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
      }
      if (elem.key === 'fteZero' && pValue) {
        validateFteZeroFilter(pValue);
        searchCriteriaList.push({ key: 'fteZeroReasonCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
      }
      if (elem.key === 'fundingType' && pValue) {
        fundingTypeList = createFundingTypeFilter(pValue);
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
      if (elem.key === 'numberOfCoursesDec' && pValue) {
          courseRangeList = createCourseRangeFilter(pValue);
      }
    });
    const search = [];
    if (searchCriteriaList.length > 0) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: searchCriteriaList
      });
    }
    if (fundingTypeList.length > 0) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: fundingTypeList
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
    if(spedCodeList.length > 0) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: spedCodeList
      });
    }
    if(spedFundingList.length > 0) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: spedFundingList
      });
    }
    if(ellFunding.length > 0) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: ellFunding
      });
    }
    if(ellList.length > 0) {
      search.push({
        condition: CONDITION.AND,
        searchCriteriaList: ellList
      });
    }
    if(courseRangeList.length > 0) {
        search.push({
            condition: CONDITION.AND,
            searchCriteriaList: courseRangeList
        })
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

  function validateWarningFilter(filters = []) {
    let allowedWarningValues = [
      'FUNDING_WARNING',
      'INFO_WARNING'
      ];
    if (filters.length > 0) {
      if (filters.every(value => allowedWarningValues.includes(cat => value === cat))) {
        log.error('Invalid warning filter.');
        throw new Error('400');
      }
    }
  }

  function validateSpedCodes(filters = []) {
    const activeSpedCodes = cacheService.getActiveSpedCodes();
    if (filters.length > 0) {
      if (filters.every(value => activeSpedCodes.includes(code => value === code.specialEducationCategoryCode))) {
        log.error('Invalid special education filter.');
        throw new Error('400');
      }
    }
  }

  function createFundingTypeFilter(pValue) {
    let fundingTypeList = []
    validateFundingTypeFilter(pValue);
  
        if (pValue.includes('14')) {
          fundingTypeList.push({ key: 'schoolFundingCode', value: '14', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
        }
        if (pValue.includes('20')) {
          fundingTypeList.push({ key: 'schoolFundingCode', value: '20', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
        }
        if (pValue.includes('16')) {
          fundingTypeList.push({ key: 'schoolFundingCode', value: '16', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
        }
        if (pValue.includes('No Funding')) {
          fundingTypeList.push({ key: 'schoolFundingCode', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
        }
    return fundingTypeList;
  }

  function createEllYearsFilter(pValue) {
    let ellList = []
    if(pValue.includes('ell1Between5')) {
        ellList.push({ key: 'sdcStudentEllEntity.yearsInEll', value: 1, operation: FILTER_OPERATION.GREATER_THAN_OR_EQUAL_TO, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.AND });
        ellList.push({ key: 'sdcStudentEllEntity.yearsInEll', value: 5, operation: FILTER_OPERATION.LESS_THAN_OR_EQUAL_TO, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.AND });
    }
    if(pValue.includes('ellGtEq6')) {
        ellList.push({ key: 'sdcStudentEllEntity.yearsInEll', value: 6, operation: FILTER_OPERATION.GREATER_THAN_OR_EQUAL_TO, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.OR });
    }
    return ellList;
  }

  function createFrenchFundingFilter(pValue) {
    let frenchProgramFundingList = [];

        if (pValue.toString() === 'true') {
          frenchProgramFundingList.push({ key: 'frenchProgramNonEligReasonCode', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
        } else if (pValue.toString() === 'false') {
          frenchProgramFundingList.push({ key: 'frenchProgramNonEligReasonCode', value: null, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
        }

      return frenchProgramFundingList;
  }

  function createIndigenousFundingFilter(pValue) {
    let indigenousProgramsFundingList = [];

        if (pValue.toString() === 'true') {
          indigenousProgramsFundingList.push({ key: 'indigenousSupportProgramNonEligReasonCode', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
        } else if (pValue.toString() === 'false') {
          indigenousProgramsFundingList.push({ key: 'indigenousSupportProgramNonEligReasonCode', value: null, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
        }

      return indigenousProgramsFundingList;
  }

  function createSpedFundingFilter(pValue) {
    let spedFundingList = [];

    if (pValue.toString() === 'true') {
      spedFundingList.push({ key: 'specialEducationNonEligReasonCode', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    } else if (pValue.toString() === 'false') {
      spedFundingList.push({ key: 'specialEducationNonEligReasonCode', value: null, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }

    return spedFundingList;
  }

    function createSpedFilter(pValue) {
      let spedCodeList = [];
      validateSpedCodes(pValue);
      spedCodeList.push({ key: 'specialEducationCategoryCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
      return spedCodeList;
    }

    function createEllFundingFilter(pValue) {
      let ellFundingList = [];
    
      if (pValue.toString() === 'true') {
        ellFundingList.push({ key: 'ellNonEligReasonCode', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
      } else if (pValue.toString() === 'false') {
        ellFundingList.push({ key: 'ellNonEligReasonCode', value: null, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
      }
    
      return ellFundingList;
      }

  function createAncestryFilter(pValue) {
    let ancestryList = [];

        if (pValue.toString() === 'true') {
          ancestryList.push({ key: 'nativeAncestryInd', value: 'Y', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
        } else if (pValue.toString() === 'false') {
          ancestryList.push({ key: 'nativeAncestryInd', value: 'N', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
        }

      return ancestryList;
  }

  function createCareerProgramFundingfilter(pValue) {
    let careerProgramFundingList = [];

        if (pValue.toString() === 'isCareerFundingEligible') {
          careerProgramFundingList.push({ key: 'careerProgramNonEligReasonCode', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
        } else if (pValue.toString() === 'isNotCareerFundingEligible') {
          careerProgramFundingList.push({ key: 'careerProgramNonEligReasonCode', value: null, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
        }

    return careerProgramFundingList;
  }

  function createSupportBlockFilter(pValue) {
    let supportBlockList = [];

        if (pValue.toString() === 'hasSupportBlocks') {
          supportBlockList.push({ key: 'supportBlocks', value: '0', operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
          supportBlockList.push({ key: 'supportBlocks', value: null, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
        } else if (pValue.toString() === 'noSupportBlocks') {
          supportBlockList.push({ key: 'supportBlocks', value: '0', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
          supportBlockList.push({ key: 'supportBlocks', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.OR });
        }

      return supportBlockList;
  }

  function createIndigenousProgramFilter(pValue) {
    let indigenousProgramList = [];

        validateEnrolledProgramFilter(pValue);
        indigenousProgramList.push({ key: 'sdcStudentEnrolledProgramEntities.enrolledProgramCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });

      return indigenousProgramList;
  }

  function createFrenchProgramFilter(pValue) {
    let frenchProgramsList = [];

        validateEnrolledProgramFilter(pValue);
        frenchProgramsList.push({ key: 'sdcStudentEnrolledProgramEntities.enrolledProgramCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });

      return frenchProgramsList;
  }

  function createCareerProgramFilter(pValue) {
    let careerProgramsList = [];

        validateEnrolledProgramFilter(pValue);
        careerProgramsList.push({ key: 'sdcStudentEnrolledProgramEntities.enrolledProgramCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });

      return careerProgramsList;
  }

  function careerCodeFilter(pValue) {
    let careerCodeList = [];

        validateCareerCodeFilter(pValue);
        careerCodeList.push({ key: 'careerProgramCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });

      return careerCodeList;
  }

  function createFteFilter(pValue) {
    let fteFilterList = [];

        if (pValue.includes('fteEq0')) {
          fteFilterList.push({ key: 'fte', value: 0, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.OR });
        }
        if (pValue.includes('fteLt1')) {
          fteFilterList.push({ key: 'fte', value: 1, operation: FILTER_OPERATION.LESS_THAN, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.OR });
        }
        if (pValue.includes('fteGt0')) {
          fteFilterList.push({ key: 'fte', value: 0, operation: FILTER_OPERATION.GREATER_THAN, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.OR });
        }

      return fteFilterList;
  }

  function createCourseRangeFilter(pValue) {
    let courseRangeList = []
    if(pValue[0] !== 0){
        courseRangeList.push({key:'numberOfCoursesDec', value: pValue[0]['[0]'], operation: FILTER_OPERATION.GREATER_THAN_OR_EQUAL_TO, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.AND});
    }
    if(pValue[1] !== 15){
        courseRangeList.push({key:'numberOfCoursesDec', value: pValue[0]['[1]'], operation: FILTER_OPERATION.LESS_THAN_OR_EQUAL_TO, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.AND})
    }
    return courseRangeList;
  }

  function createStudentTypeFilter(pValue) {
    let studentTypeFilterList = [];
    if (pValue.includes('isSchoolAged')) {
      studentTypeFilterList.push({ key: 'isSchoolAged', value: 'true', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.BOOLEAN, condition: CONDITION.OR });
    }
    if (pValue.includes('isAdult')) {
      studentTypeFilterList.push({ key: 'isAdult', value: 'true', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.BOOLEAN, condition: CONDITION.OR });
    }
    if (pValue.includes('isUnderSchoolAged')) {
      studentTypeFilterList.push({ key: 'isSchoolAged', value: 'false', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.BOOLEAN, condition: CONDITION.OR });
      studentTypeFilterList.push({ key: 'isAdult', value: 'false', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.BOOLEAN, condition: CONDITION.AND });
    }
    return studentTypeFilterList;
  }

module.exports = {
    createMoreFiltersSearchCriteria
}
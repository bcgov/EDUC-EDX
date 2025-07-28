'use strict';
const { FILTER_OPERATION, VALUE_TYPE, CONDITION} = require('../../util/constants');
const cacheService = require('../cache-service');

function createMoreFiltersSearchCriteria(searchFilter = []) {
  let searchCriteriaList = [];

  let schoolNameNumberFilter = [];
  let assessmentCenterNameNumberFilter = [];

  for (const [key, filter] of Object.entries(searchFilter)) {
    let pValue = filter ? filter.map(filter => filter.value) : null;
    
    //Default Filter Begin
    if (key === 'schoolYear' && pValue) {
      searchCriteriaList.push({ key: 'assessmentEntity.assessmentSessionEntity.schoolYear', value: pValue[0].replace('-', '/'), operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }  
    //Default Filter End
    
    if (key === 'surName' && pValue) {
      searchCriteriaList.push({ key: 'surName', value: pValue.toString(), operation: FILTER_OPERATION.CONTAINS_IGNORE_CASE, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }

    if (key === 'givenName' && pValue) {
      searchCriteriaList.push({ key: 'givenName', value: pValue.toString(), operation: FILTER_OPERATION.CONTAINS_IGNORE_CASE, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }

    if (key === 'pen' && pValue) {
      searchCriteriaList.push({ key: 'pen', value: pValue.toString(), operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }

    if (key === 'localID' && pValue) {
      searchCriteriaList.push({ key: 'localID', value: pValue.toString(), operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }

    if (key === 'districtID' && pValue) {
      let schools = cacheService.getAllSchoolIDsForDistrictID(pValue[0]);
      searchCriteriaList.push({key: 'schoolOfRecordSchoolID', value: schools.join(','), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND});
    }

    if (key === 'schoolID' && pValue) {
      searchCriteriaList.push({key: 'schoolOfRecordSchoolID', value: pValue[0], operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND});
    }

    if (key === 'schoolNameNumber' && pValue) {
      let schoolNameNumberCriteria = createSchoolNameNumberSearchCriteria(pValue.toString());
      schoolNameNumberFilter = [...schoolNameNumberCriteria];
    }

    if (key === 'assessmentCenterNameNumber' && pValue) {
      let schoolNameNumberCriteria = createAssessmentCenterNameNumberSearchCriteria(pValue.toString());
      assessmentCenterNameNumberFilter = [...schoolNameNumberCriteria];
    }

    if (key === 'session' && pValue) {
      searchCriteriaList.push({ key: 'assessmentEntity.assessmentSessionEntity.sessionID', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND });
    }

    if (key === 'assessmentTypeCode' && pValue) {
      searchCriteriaList.push({ key: 'assessmentEntity.assessmentTypeCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }
    
    if (key === 'provincialSpecialCaseCode' && pValue) {
      if(pValue.length === 1 && pValue[0] === 'N') {
        searchCriteriaList.push({ key: 'provincialSpecialCaseCode', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });  
      }else{
        searchCriteriaList.push({ key: 'provincialSpecialCaseCode', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
      }
    }

    if (key === 'proficiencyScore' && pValue) {
      if(pValue.length === 1 && pValue[0] === 'N') {
        searchCriteriaList.push({ key: 'proficiencyScore', value: 0, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.AND });        
      } else {
        searchCriteriaList.push({ key: 'proficiencyScore', value:0, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.AND });        
      }     
    }

    if (key === 'proficiencyScoreValue' && pValue) {
      if(pValue.length === 1 && pValue[0] === 'N') {
        searchCriteriaList.push({ key: 'proficiencyScore', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
      } else {
        searchCriteriaList.push({ key: 'proficiencyScore', value: pValue.toString(), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.INTEGER, condition: CONDITION.AND });
      }
      
    }

  }
  const search = [];
  if (schoolNameNumberFilter.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: schoolNameNumberFilter
    });
  }
  if (assessmentCenterNameNumberFilter.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: assessmentCenterNameNumberFilter
    });
  }
  if (searchCriteriaList.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: searchCriteriaList
    });
  }
  return search;
}

function createSchoolNameNumberSearchCriteria(value) {
  const searchSchoolCriteriaList = [];

  searchSchoolCriteriaList.push({
    key: 'schoolID',
    operation: FILTER_OPERATION.EQUAL,
    value: value,
    valueType: VALUE_TYPE.UUID,
    condition: CONDITION.AND
  });

  return searchSchoolCriteriaList;
}

function createAssessmentCenterNameNumberSearchCriteria(value) {
  const searchAssessmentCenterCriteriaList = [];

  searchAssessmentCenterCriteriaList.push({
    key: 'assessmentCenterID',
    operation: FILTER_OPERATION.EQUAL,
    value: value,
    valueType: VALUE_TYPE.UUID,
    condition: CONDITION.AND
  });

  return searchAssessmentCenterCriteriaList;
}


module.exports = {
  createMoreFiltersSearchCriteria
};

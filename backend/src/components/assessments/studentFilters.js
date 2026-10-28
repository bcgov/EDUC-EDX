'use strict';
const { FILTER_OPERATION, VALUE_TYPE, CONDITION} = require('../../util/constants');
const cacheService = require('../cache-service');

const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

function createMoreFiltersSearchCriteria(searchFilter = [], schoolID) {
  let searchCriteriaList = [];

  let writingSiteFilter = [];
  let schoolNameNumberFilter = [];
  let assessmentCenterNameNumberFilter = [];
  const search = [];

  //Always filter on ACTIVE students
  searchCriteriaList.push({ key: 'studentStatusCode', value: 'ACTIVE', operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });

  for (const [key, filter] of Object.entries(searchFilter)) {
    let pValue = filter ? filter.map(filter => filter.value) : null;

    if (key === 'schoolYear' && pValue) {
      searchCriteriaList.push({ key: 'assessmentEntity.assessmentSessionEntity.schoolYear', value: pValue[0].replace('-', '/'), operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
      searchCriteriaList.push({ key: 'assessmentEntity.assessmentSessionEntity.completionDate', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }
    
    if (key === 'openSessions' && pValue) {
      searchCriteriaList.push({ key: 'assessmentEntity.assessmentSessionEntity.sessionID', value: pValue.join(','), operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND });
      searchCriteriaList.push({ key: 'assessmentEntity.assessmentSessionEntity.completionDate', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
    }

    if (key === 'transfer' && pValue) {
      if(pValue.toString() === 'transfered') {
        searchCriteriaList.push({ key: 'downloadDate', value: null, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
      } else if(pValue.toString() === 'notTransfered') {
        searchCriteriaList.push({ key: 'downloadDate', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
      }
    }

    if (key === 'writingSite' && pValue) {
      if(pValue.toString() === 'anyWritingAtMySchool') {
        const searchWriteCriteria = [];
        searchWriteCriteria.push({ key: 'schoolOfRecordSchoolID', value: schoolID, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID, condition: CONDITION.OR });
        searchWriteCriteria.push({ key: 'assessmentCenterSchoolID', value: schoolID, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID, condition: CONDITION.OR });
        writingSiteFilter = [...searchWriteCriteria];
      } else if(pValue.toString() === 'writingAtMySchool') {
        searchCriteriaList.push({ key: 'schoolOfRecordSchoolID', value: schoolID, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND });
      } else if(pValue.toString() === 'writingAtAnotherSchool') {
        searchCriteriaList.push({ key: 'assessmentCenterSchoolID', value: schoolID, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND });
        searchCriteriaList.push({ key: 'schoolOfRecordSchoolID', value: schoolID, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND });
      } else if(pValue.toString() === 'nonSORStudents') {
        searchCriteriaList.push({ key: 'assessmentCenterSchoolID', value: schoolID, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND });
        searchCriteriaList.push({ key: 'schoolOfRecordSchoolID', value: schoolID, operation: FILTER_OPERATION.NOT_EQUAL, valueType: VALUE_TYPE.UUID, condition: CONDITION.AND });
      }
    }

    if (key === 'surName' && pValue) {
      searchCriteriaList.push({ key: 'surname', value: pValue.toString(), operation: FILTER_OPERATION.CONTAINS_IGNORE_CASE, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
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
      searchCriteriaList.push({ key: 'assessmentEntity.assessmentSessionEntity.completionDate', value: null, operation: FILTER_OPERATION.EQUAL, valueType: VALUE_TYPE.STRING, condition: CONDITION.AND });
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
  if (schoolNameNumberFilter.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: schoolNameNumberFilter
    });
  }
  if (writingSiteFilter.length > 0) {
    search.push({
      condition: CONDITION.AND,
      searchCriteriaList: writingSiteFilter
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

// Scope comes from the session, never the client filters. Pushed last so it wraps every filter group.
function createAssessmentStudentSearchCriteria(searchFilter, activeInstituteType, activeInstituteIdentifier) {
  const search = createMoreFiltersSearchCriteria(searchFilter, activeInstituteIdentifier);
  search.push(createInstituteScopeSearchCriteria(activeInstituteType, activeInstituteIdentifier));
  return search;
}

function createInstituteScopeSearchCriteria(activeInstituteType, activeInstituteIdentifier) {
  if (!activeInstituteIdentifier) {
    throw new Error('Active institute identifier is required to search assessment students.');
  }
  let schoolIDs;
  if (activeInstituteType === 'SCHOOL') {
    schoolIDs = [activeInstituteIdentifier];
  } else if (activeInstituteType === 'DISTRICT') {
    schoolIDs = cacheService.getAllPublicSchoolIDsForDistrictID(activeInstituteIdentifier);
  } else {
    throw new Error(`Unsupported institute type for assessment student search: ${activeInstituteType}`);
  }
  // pass an empty guid when a district has no schools. Ensures a valid IN clause that matches nothing
  const schoolIDValues = schoolIDs.length > 0 ? schoolIDs.join(',') : EMPTY_GUID;

  return {
    condition: CONDITION.AND,
    searchCriteriaList: [
      { key: 'schoolOfRecordSchoolID', value: schoolIDValues, operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.UUID, condition: CONDITION.OR },
      { key: 'assessmentCenterSchoolID', value: schoolIDValues, operation: FILTER_OPERATION.IN, valueType: VALUE_TYPE.UUID, condition: CONDITION.OR }
    ]
  };
}

function createSchoolNameNumberSearchCriteria(value) {
  const searchSchoolCriteriaList = [];

  searchSchoolCriteriaList.push({
    key: 'schoolOfRecordSchoolID',
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
    key: 'assessmentCenterSchoolID',
    operation: FILTER_OPERATION.EQUAL,
    value: value,
    valueType: VALUE_TYPE.UUID,
    condition: CONDITION.AND
  });

  return searchAssessmentCenterCriteriaList;
}


module.exports = {
  createAssessmentStudentSearchCriteria
};

export enum SearchFilter {
  EQUAL = 'eq',
  NOT_EQUAL = 'neq',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL_TO = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL_TO = 'lte',
  IN = 'in',
  NOT_IN = 'nin',
  BETWEEN = 'btn',
  CONTAINS = 'like',
  CONTAINS_IGNORE_CASE = 'like_ignore_case',
  STARTS_WITH = 'starts_with',
  NOT_STARTS_WITH = 'not_starts_with',
  STARTS_WITH_IGNORE_CASE = 'starts_with_ignore_case',
  ENDS_WITH = 'ends_with'
}

export enum SearchCondition {
  AND = 'AND',
  OR = 'OR'
}

export enum SearchValueType {
  STRING = 'STRING',
  INTEGER = 'INTEGER',
  LONG = 'LONG',
  DATE = 'DATE',
  DATE_TIME = 'DATE_TIME',
  UUID = 'UUID'
}

interface SearchCriteriaListItem {
  key: string;
  operation: SearchFilter;
  value: string | null;
  valueType: SearchValueType;
  condition: SearchCondition;
}

export interface SearchCriteria {
  pageNumber?: number;
  pageSize?: number;
  sort?: "sort" | "ASC" | "DESC";
  condition: SearchCondition | null;
  searchCriteriaList: SearchCriteriaListItem[];
}


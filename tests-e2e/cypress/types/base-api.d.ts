declare interface BaseApiEntity {
  createUser: string;
  updateUser: string;
  createDate: string;
  updateDate: string;
}

declare interface SearchParams {
  params: {
    searchCriteriaList: string;
  }
}

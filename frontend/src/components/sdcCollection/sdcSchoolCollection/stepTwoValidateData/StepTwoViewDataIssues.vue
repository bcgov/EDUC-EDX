<template>
  <div
    v-if="!openEditView"
  >
    <v-row v-if="isLoading()">
      <v-col>
        <Spinner />
      </v-col>
    </v-row>
    <v-row
      v-else
      class="justify-center mt-1"
    >
      <v-col cols="5">
        <v-row
          class="inner-border box-height"
          style="padding: 0;"
        >
          <v-row>
            <v-col>
              <h3 class="heading">
                Data Issues
              </h3>
            </v-col>
          </v-row>
          <v-row>
            <v-col
              id="warningAndErrorSummary"
              class="d-flex flex-wrap justify-space-evenly"
              style="text-align: center;"
            >
              <div class="divider flex-grow-1">
                <span class="section-heading">Errors</span>
                <br>
                <div class="flex-container-align-vertically-center ">
                  <v-icon
                    size="38"
                    color="#d90606"
                  >
                    mdi-alert-circle-outline
                  </v-icon>
                  <span
                    id="errorCount"
                    style="font-size: x-large"
                  >{{ errorCount }}</span>
                </div>
              </div>
              <div class="divider flex-grow-1">
                <span class="section-heading">Funding Warnings</span>
                <br>
                <div class="flex-container-align-vertically-center ">
                  <v-icon
                    size="38"
                    color="orange"
                  >
                    mdi-alert-outline
                  </v-icon>
                  <span
                    id="fundingWarningCount"
                    style="font-size: x-large"
                  >{{ fundingWarningCount }}</span>
                </div>
              </div>
              <div class="flex-grow-1">
                <span class="section-heading">Info Warnings</span>
                <br>
                <div class="flex-container-align-vertically-center ">
                  <v-icon
                    size="38"
                    color="blue"
                  >
                    mdi-alert-circle-outline
                  </v-icon>
                  <span
                    id="infoWarningCount"
                    style="font-size: x-large"
                  >{{ infoWarningCount }}</span>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-row>
      </v-col>
      <v-col cols="3">
        <v-row
          class="inner-border box-height"
          style="padding: 0;"
        >
          <v-row>
            <v-col>
              <h3 class="heading">
                Records with Data Issues
              </h3>
            </v-col>
          </v-row>
          <v-row>
            <v-col
              id="totalStudentsWithIssues"
              class="d-flex flex-wrap justify-space-evenly"
              style="text-align: center;"
            >
              <div class="divider flex-grow-1">
                <span class="section-heading">Total Students</span>
                <br>
                <span
                  id="totalStudentsWithIssuesCount"
                  style="font-size: x-large"
                >{{ totalNumIssueStudentsInCollection }}</span>
              </div>
            </v-col>
          </v-row>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        v-if="totalNumIssueStudentsInCollection > 0 || filterCount > 0"
        class="pr-0"
      >
        <v-navigation-drawer
          v-model="showFilters"
          location="right"
          :temporary="true"
          width="700"
          :persistent="true"
          scrim="transparent"
          :border="true"
          style="top:0; height: 100%;"
          rounded="true"
        >
          <Filters
            :filters="{}"
            :show-student-search="true"
            @apply-filters="applyFilters"
            @clear-filters="clearFilters"
            @close="showFilters= !showFilters"
          >
            <template #custom-filter>
              <v-select
                id="fundingWarningCategorySelect"
                v-model="fundingWarningCategoryFilter"
                :items="fundingWarningCategories"
                item-title="message"
                item-value="validationIssueTypeCode"
                label="Funding Warning Category"
                variant="underlined"
                hide-details="auto"
                :clearable="true"
                @update:model-value="applyFundingWarningFilter"
              >
                <template #prepend-inner>
                  <v-icon
                    v-if="fundingWarningCategoryFilter"
                    :icon="getIcon(fundingWarningCategories.find(item => item.validationIssueTypeCode === fundingWarningCategoryFilter)?.severityTypeCode)"
                    :color="getIconColour(fundingWarningCategories.find(item => item.validationIssueTypeCode === fundingWarningCategoryFilter)?.severityTypeCode)"
                  />
                </template>
                <template #item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    :prepend-icon="getIcon(item.raw.severityTypeCode)"
                    :base-color="getIconColour(item.raw.severityTypeCode)"
                    title=""
                  >
                    <v-list-item-title style="color: black !important;">
                      {{
                        item.title
                      }}
                    </v-list-item-title>
                  </v-list-item>
                </template>
              </v-select>
            </template>
          </Filters>
        </v-navigation-drawer>
        <v-row>
          <v-col class="text-right">
            <v-btn
              id="filters"
              color="#003366"
              text="Filter"
              class="mr-4 mb-1"
              prepend-icon="mdi-filter-multiple-outline"
              variant="outlined"
              @click="toggleFilters"
            >
              <template #append>
                <v-badge
                  color="error"
                  :content="filterCount"
                  floating
                  offset-y="-10"
                />
              </template>
            </v-btn>
          </v-col>
        </v-row>
        <v-row
          class="pt-3 pb-3"
        >
          <v-col
            v-if="studentListData?.length > 0"
            class="text-right"
          >
            <PrimaryButton
              id="fixSelected"
              text="Review & Fix Selected"
              :click-action="toggleEditView"
              :disabled="selectedStudents.length === 0 || schoolCollectionObject?.sdcSchoolCollectionStatusCode === 'SUBMITTED'"
              class="mr-4"
            />
            <PrimaryButton
              id="fixAll"
              text="Review & Fix All"
              class="mr-3"
              :loading="allIssueLoader"
              :click-action="getAllIssuesAndNavigate"
              :disabled="selectedStudents.length !== 0 || schoolCollectionObject?.sdcSchoolCollectionStatusCode === 'SUBMITTED'"
            />
          </v-col>
          <v-col
            v-else
            class="mr-3"
          >
            <v-alert
              type="warning"
              variant="tonal"
              text="No results found."
            />
          </v-col>
        </v-row>
        <v-row>
          <v-data-table-server
            v-model:items-per-page="pageSize"
            v-model:page="pageNumber"
            v-model="selectedStudents"
            :headers="headers"
            :items-length="totalStudents"
            :items="studentListData"
            :loading="isLoading()"
            item-value="sdcSchoolCollectionStudentID"
            class="mt-2"
            mobile-breakpoint="0"
            :show-select="schoolCollectionObject?.sdcSchoolCollectionStatusCode !== 'SUBMITTED'"
          >
            <template #header.error="{ column }">
              <v-icon
                class="mt-2 mr-3"
                size="25"
                color="#d90606"
              >
                mdi-alert-circle-outline
              </v-icon>
            </template>
            <template #header.fundingWarning="{ column }">
              <v-icon
                class="mt-2 mr-3"
                size="25"
                color="#ff9800"
              >
                mdi-alert-outline
              </v-icon>
            </template>
            <template #header.infoWarning="{ column }">
              <v-icon
                class="mt-2 mr-3"
                size="25"
                color="#2196F3"
              >
                mdi-alert-circle-outline
              </v-icon>
            </template>

            <template #item.studentPen="{ item }">
              {{ item?.studentPen === null ? "-" : item?.studentPen }}
            </template>
            <template #item.localID="{ item }">
              {{ item?.localID === null ? "-" : item?.localID }}
            </template>
            <template #item.legalName="{ item }">
              {{ (item?.legalLastName === null && item?.legalMiddleNames === null && item?.legalFirstName === null) ? "-" :
                item?.legalLastName === null ? getNameWithoutSurname(item.legalFirstName, item.legalMiddleNames) : getLegalName(item.legalFirstName, item.legalMiddleNames, item.legalLastName)
              }}
            </template>
            <template #item.usualName="{ item }">
              {{ (item?.usualLastName === null && item?.usualMiddleNames === null && item?.usualFirstName === null) ? "-" :
                item?.usualLastName === null ? getNameWithoutSurname(item.usualFirstName, item.usualMiddleNames) : getLegalName(item.usualFirstName, item.usualMiddleNames, item.usualLastName)
              }}
            </template>
            <template #item.error="{ item }">
              <td class="td-class">
                {{ getIssueCount('ERROR', item.sdcSchoolCollectionStudentValidationIssues) }}
              </td>
            </template>
            <template #item.fundingWarning="{ item }">
              <span>{{ getIssueCount('FUNDING_WARNING', item.sdcSchoolCollectionStudentValidationIssues) }}</span>
            </template>
            <template #item.infoWarning="{ item }">
              <span>{{ getIssueCount('INFO_WARNING', item.sdcSchoolCollectionStudentValidationIssues) }}</span>
            </template>
          </v-data-table-server>
        </v-row>
      </v-col>
      <v-col v-else-if="!isLoading()">
        <v-alert
          type="success"
          variant="tonal"
          text="Congratulations! There are no errors or warnings in the 1701 Submission"
        />
      </v-col>
    </v-row>
    <v-row justify="end">
      <PrimaryButton
        id="step-2-next-button-school"
        class="mr-3 mt-3 mb-3"
        icon="mdi-check"
        text="Next"
        :disabled="nextButtonIsDisabled() || !canMoveForward()"
        :click-action="next"
      />
    </v-row>
    <v-row
      v-if="nextButtonIsDisabled()"
      class="my-0"
    >
      <v-col class="error-message py-0">
        <p class="form-hint">
          All errors must be fixed
        </p>
      </v-col>
    </v-row>
  </div>
  <v-bottom-sheet
    v-model="openEditView"
    :inset="true"
    :no-click-animation="true"
    :scrollable="true"
    :persistent="true"
  >
    <EditAndFixStudentData
      :selected-students="selectedStudents"
      :total-students="totalNumIssueStudentsInCollection"
      @close="refresh"
      @reset-pagination="getSDCSchoolCollectionStudentPaginated"
    />
  </v-bottom-sheet>
</template>

<script>

import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';
import {cloneDeep, isEmpty, omitBy} from 'lodash';
import Spinner from '../../../common/Spinner.vue';
import PrimaryButton from '../../../util/PrimaryButton.vue';
import {setFailureAlert} from '../../../composable/alertComposable';
import { sdcCollectionStore } from '../../../../store/modules/sdcCollection';
import EditAndFixStudentData from './EditAndFixStudentData.vue';
import Filters from '../../../common/Filters.vue';
import {mapState} from 'pinia';
import {authStore} from '../../../../store/modules/auth';
import {PERMISSION} from '../../../../utils/constants/Permission';

export default {
  name: 'StepTwoViewDataIssues',
  components: {
    Filters,
    Spinner,
    PrimaryButton,
    EditAndFixStudentData
  },
  props: {
    schoolCollectionObject: {
      type: Object,
      required: true,
      default: null
    },
    isStepComplete: {
      type: Boolean,
      required: true
    }
  },
  emits: ['next'],
  data() {
    return {
      filterSearchParams: {
        tabFilter: { label: 'DATA_ISSUES' },
        sdcSchoolCollectionStudentStatusCode: 'ERROR,INFOWARN,FUNDWARN',
        moreFilters: {}
      },
      showFilters: false,
      selectedStudents: [],
      openEditView: false,
      headers: [
        { title: 'PEN', key: 'studentPen'},
        { title: 'Local ID', key: 'localID'},
        { title: 'Legal Surname, Given (Middle)', key: 'legalName'},
        { title: 'Usual Surname, Given (Middle)', key: 'usualName'},
        { title: 'error', key: 'error'},
        { title: 'fundingWarning', key: 'fundingWarning'},
        { title: 'infoWarning', key: 'infoWarning'},
      ],
      pageNumber: 1,
      pageSize: 10,
      studentListData: [],
      totalStudents: 0,
      sdcCollection: sdcCollectionStore(),
      totalNumIssueStudentsInCollection: 0,
      selectedSdcStudentID: null,
      selectedSdcStudentIndex: 0,
      fundingWarningCategoryFilter: null,
      loadingCount: 0,
      allIssueLoader:false,
      errorCount: 0,
      fundingWarningCount: 0,
      infoWarningCount: 0,
      fundingWarningCategories: []
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    filterCount() {
      let numFilters = Object.values(this.filterSearchParams.moreFilters).filter(filter => !!filter).reduce((total, filter) => total.concat(filter), []).length;
      if(this.fundingWarningCategoryFilter !== null) {
        numFilters++;
      }
      return numFilters;
    },
    hasEditPermission(){
      return (this.userInfo?.activeInstitutePermissions?.filter(perm => perm === PERMISSION.SCHOOL_SDC_EDIT).length > 0);
    },
  },
  watch: {
    pageNumber: {
      handler() {
        this.getSDCSchoolCollectionStudentPaginated();
      },
      immediate: true
    }
  },
  mounted() {
    this.getStudentValidationIssueCodesInCollection();
    sdcCollectionStore().getCodes().then(async () => {
      this.getSummaryCounts();
      await this.getSDCSchoolCollectionStudentPaginated();
    });
  },
  methods: {
    canMoveForward(){
      return this.isStepComplete || this.hasEditPermission;
    },
    applyFilters($event) {
      this.filterSearchParams.moreFilters = cloneDeep($event);
      this.getSummaryCounts();
      this.getSDCSchoolCollectionStudentPaginated();
    },
    applyFundingWarningFilter() {
      this.filterSearchParams.fundingWarningCategory = this.fundingWarningCategoryFilter;
      this.getSummaryCounts();
      this.getSDCSchoolCollectionStudentPaginated();
    },
    clearFilters() {
      this.filterSearchParams.moreFilters = {};
      this.filterSearchParams.fundingWarningCategory = null;
      this.fundingWarningCategoryFilter = null;
      this.getSummaryCounts();
      this.getSDCSchoolCollectionStudentPaginated();
    },
    next() {
      if(this.isStepComplete) {
        this.$emit('next');
      } else {
        this.markStepAsComplete();
      }
    },
    toggleEditView() {
      this.openEditView = !this.openEditView;
    },
    refresh() {
      this.openEditView = !this.openEditView;
      this.getSummaryCounts();
      this.getSDCSchoolCollectionStudentPaginated();
      this.selectedStudents=[];
    },
    getIcon(severityTypeCode) {
      let icon = '';
      if(severityTypeCode === 'ERROR') {
        icon = 'mdi-alert-circle-outline';
      } else if(severityTypeCode === 'INFO_WARNING') {
        icon = 'mdi-alert-circle-outline';
      } else if(severityTypeCode === 'FUNDING_WARNING') {
        icon = 'mdi-alert-outline';
      }
      return icon;
    },
    getIconColour(severityTypeCode) {
      let colour = '';
      if(severityTypeCode === 'ERROR') {
        colour = '#d90606';
      } else if(severityTypeCode === 'INFO_WARNING') {
        colour = 'blue';
      } else if(severityTypeCode === 'FUNDING_WARNING') {
        colour = 'orange';
      }
      return colour;
    },
    getStudentValidationIssueCodesInCollection() {
      ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION}/${this.$route.params.schoolCollectionID}/student-validation-issue-codes`)
        .then((response) => {
          this.fundingWarningCategories = response.data;
        })
        .catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred attempting to load the page. Please refresh to try again.');
        });
    },
    markStepAsComplete(){
      let updateCollection = {
        schoolCollection: this.schoolCollectionObject,
        status: 'REVIEWED'
      };
      ApiService.apiAxios.put(`${ApiRoutes.sdc.BASE_URL}/${this.$route.params.schoolCollectionID}`, updateCollection)
        .then(() => {
          this.$emit('next');
        })
        .catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while verifying school details. Please try again later.');
        });
    },
    nextButtonIsDisabled(){
      return this.errorCount > 0 || this.isLoading();
    },
    getSummaryCounts(){
      this.loadingCount += 1;

      ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/stats/error-warning-count/${this.$route.params.schoolCollectionID}`, {
      }).then(response => {
        this.setCounts(response?.data);
      }).catch(error => {
        console.error(error);
        setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get summary counts. Please try again later.');
      }).finally(() => {
        this.loadingCount -= 1;
      });
    },
    setCounts(summaryCounts) {
      let error = summaryCounts.find(val => val.severityCode === 'ERROR');
      let fundingWarn = summaryCounts.find(val => val.severityCode === 'FUNDING_WARNING');
      let infoWarn = summaryCounts.find(val => val.severityCode === 'INFO_WARNING');

      this.errorCount = error === undefined ? 0 : error.total;
      this.fundingWarningCount = fundingWarn === undefined ? 0 : fundingWarn.total;
      this.infoWarningCount = infoWarn === undefined ? 0 : infoWarn.total;

    },
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
    async getSDCSchoolCollectionStudentPaginated(){
      this.loadingCount += 1;
      await ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${this.$route.params.schoolCollectionID}/paginated`, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          searchParams: omitBy(this.filterSearchParams, isEmpty),
          sort: {
            sdcSchoolCollectionStudentStatusCode: 'ASC'
          },
        }
      }).then(response => {
        this.studentListData = response.data.content;
        this.totalStudents = response.data.totalElements;
        this.totalNumIssueStudentsInCollection = response.data.totalElements;
      }).catch(error => {
        console.error(error);
        setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get sdc school collection students paginated. Please try again later.');
      }).finally(() => {
        this.loadingCount -= 1;
      });
    },
    getAllIssuesAndNavigate() {
      this.allIssueLoader = true;

      ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${this.$route.params.schoolCollectionID}/paginated`, {
        params: {
          pageNumber: 0,
          pageSize: 2000,
          searchParams: omitBy(this.filterSearchParams, isEmpty),
          sort: {
            sdcSchoolCollectionStudentStatusCode: 'ASC'
          },
          returnKey: 'sdcSchoolCollectionStudentID'
        }
      }).then(response => {
        this.selectedStudents = response.data;
        this.openEditView = !this.openEditView;
      }).catch(error => {
        console.error(error);
        setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get sdc school collection students paginated. Please try again later.');
      }).finally(() => {
        this.allIssueLoader = false;
      });
    },
    isLoading(){
      return this.loadingCount > 0;
    },
    getLegalName(first, middle, last){
      if(first && middle){
        return last + ', ' + first + ' (' + middle + ')';
      }else if(first){
        return last + ', ' + first;
      }else if(middle){
        return last + ' (' + middle + ')';
      }else if(last){
        return last;
      }
      return '';
    },
    getNameWithoutSurname(first, middle) {
      if(first && middle){
        return first + ' (' + middle + ')';
      }else if(first){
        return first;
      }else if(middle){
        return ' (' + middle + ')';
      }
      return '';
    },
    getIssueCount(validationIssueSeverityCode, validationIssues = []){
      let validationIssueMap = new Map();
      for (let issue of validationIssues) {
        if (!validationIssueMap.has(issue.validationIssueCode)) {
          validationIssueMap.set(issue.validationIssueCode, issue);
        } 
      }
      return Array.from(validationIssueMap.values()).filter(issues => issues.validationIssueSeverityCode === validationIssueSeverityCode)?.length;
    }
  }
};
</script>

  <style scoped>
    .border {
      border: 2px solid grey;
      border-radius: 5px;
      padding: 35px;
      margin-bottom: 2em;
    }

    .clear-message {
      color: darkgreen;
      background-color: rgb(227, 240, 217);
      padding: 0.6em;
    }

    .clear-message-error {
      border: 0.05em solid orange;
      color: #ff8000;
      background-color: rgba(255, 220, 185, 0.66);
      padding: 0.6em;
    }

    .flex-container-align-vertically-center {
      display: flex;
      flex-direction: row;
      gap: 0.1rem;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap;
    }

   .inner-border {
     display: inline-block;
     min-width: 100%;
     border: 1px solid rgba(42, 45, 38, 0.38);
     border-width: thin;
     border-radius: 5px;
     padding: 2em;
     margin-bottom: 1em;
   }

   :deep(.v-data-table-footer__items-per-page) {
       display: none;
   }

   .headerVal{
      color: #7f7f7f;
   }

   .isSelected{
     background-color: #E1F5FE;
   }

   .tableItemVal{
       font-size: small;
   }

   .scroll{
     overflow-y: auto;
     overflow-x: hidden;
     max-height: 100vh;
   }

   .form-hint{
     color: rgb(56, 89, 138);
     font-size: 14px;
   }

   .searchBox {
     margin-left: 1em;
     margin-right: 1em;
     border-radius: 5px;
     background-color: rgb(235, 237, 239);
   }

   #warningAndErrorSummary div {
     margin-bottom: 1em;
   }

   #totalStudentsWithIssues span {
    margin-bottom: 1em;
   }

   .heading {
     text-align: center;
     padding: 1em 1em 0em;
   }

   .section-heading {
     font-weight: bold;
   }

   .divider {
    box-shadow: 0 0 0 0 grey, 1px 0 0 0 grey;
   }

   .td-class {
    text-align: center;
   }

   .box-height {
    height: 100%
   }

   .success-message{
    vertical-align: sub;
   }

   .error-message {
    text-align: end;
   }

  </style>


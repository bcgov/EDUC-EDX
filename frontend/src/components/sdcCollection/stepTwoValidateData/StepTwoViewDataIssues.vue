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
                  >{{ summaryCounts.error }}</span>
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
                  >{{ summaryCounts.fundingWarning }}</span>
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
                  >{{ summaryCounts.infoWarning }}</span>
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
                Student Records with Data Issues
              </h3>
            </v-col>
          </v-row>
          <v-row>
            <v-col
              id="totalStudentsWithIssues"
              class="d-flex flex-wrap justify-space-evenly"
              style="text-align: center;"
            >
              <span
                id="totalStudentsWithIssuesCount"
                style="font-size: x-large"
              >{{ numIssueStudentsInCollection }}</span>
            </v-col>
          </v-row>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        v-if="numIssueStudentsInCollection > 0"
        class="pr-0"
      >
        <v-row class="searchBox">
          <v-col class="mx-4 pb-6">
            <v-row>
              <v-col class="d-flex justify-center">
                <v-select
                  id="fundingWarningCategorySelect"
                  v-model="fundingWarningCategoryFilter"
                  :items="fundingWarningCategories"
                  item-title="category"
                  item-value="categoryCode"
                  label="Funding Warning Category"
                  variant="underlined"
                  hide-details="auto"
                />
              </v-col>

              <v-col class="d-flex justify-center">
                <v-text-field
                  id="legalUsualNameSearch"
                  v-model="legalUsualNameFilter"
                  label="Legal or Usual Name"
                  variant="underlined"
                  hide-details="auto"
                />
              </v-col>

              <v-col

                class="d-flex justify-start"
              >
                <v-text-field
                  id="penSearch"
                  v-model="penFilter"
                  label="PEN or Local ID"
                  variant="underlined"
                  hide-details="auto"
                />
              </v-col>

              <v-col
                cols="1"
                align-self="end"
              >
                <PrimaryButton
                  id="clearSearch"
                  :click-action="clearSearchFields"
                  secondary
                  width="100%"
                  text="Clear"
                  class="mr-2"
                />
              </v-col>

              <v-col
                cols="1"
                align-self="end"
              >
                <PrimaryButton
                  id="searchButton"
                  :click-action="getSDCSchoolCollectionStudentPaginated"
                  text="Search"
                  width="100%"
                  class="mr-2"
                />
              </v-col>
            </v-row>
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
              :disabled="selectedStudents.length === 0"
              class="mr-4"
            />
            <PrimaryButton
              id="fixAll"
              text="Review & Fix All"
              class="mr-3"
              :loading="allIssueLoader"
              :click-action="getAllIssuesAndNavigate"
              :disabled="selectedStudents.length != 0"
            />
          </v-col>
          <v-col
            v-else
            class="mr-3"
          >
            <v-alert
              dismissible="false"
              class="clear-message-error"
            >
              <v-icon
                class="mt-2 mr-3"
                size="30"
                color="orange"
              >
                mdi-alert-outline
              </v-icon>
              <span class="error-message">There are no results for the selected category.</span>
            </v-alert>
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
            show-select
          >
            <template #column.error="{ column }">
              <v-icon
                class="mt-2 mr-3"
                size="25"
                color="#d90606"
              >
                mdi-alert-circle-outline
              </v-icon>
            </template>
            <template #column.fundingWarning="{ column }">
              <v-icon
                class="mt-2 mr-3"
                size="25"
                color="#ff9800"
              >
                mdi-alert-outline
              </v-icon>
            </template>
            <template #column.infoWarning="{ column }">
              <v-icon
                class="mt-2 mr-3"
                size="25"
                color="#2196F3"
              >
                mdi-alert-circle-outline
              </v-icon>
            </template>

            <template #item.legalName="{ item }">
              {{ item?.raw?.legalLastName === null ? getNameWithoutSurname(item.raw.legalFirstName, item.raw.legalMiddleNames) : getLegalName(item.raw.legalFirstName, item.raw.legalMiddleNames, item.raw.legalLastName) }}
            </template>
            <template #item.usualName="{ item }">
              {{ item?.raw?.usualLastName === null ? getNameWithoutSurname(item.raw.usualFirstName, item.raw.usualMiddleNames) : getLegalName(item.raw.usualFirstName, item.raw.usualMiddleNames, item.raw.usualLastName) }}
            </template>
            <template #item.error="{ item }">
              <td class="td-class">
                {{ getIssueCount('ERROR', item.raw.sdcSchoolCollectionStudentValidationIssues) }}
              </td>
            </template>
            <template #item.fundingWarning="{ item }">
              <span>{{ getIssueCount('FUNDING_WARNING', item.raw.sdcSchoolCollectionStudentValidationIssues) }}</span>
            </template>
            <template #item.infoWarning="{ item }">
              <span>{{ getIssueCount('INFO_WARNING', item.raw.sdcSchoolCollectionStudentValidationIssues) }}</span>
            </template>
          </v-data-table-server>
        </v-row>
      </v-col>
      <v-col v-else-if="!isLoading()">
        <v-alert
          dismissible="true"
          class="clear-message"
        >
          <v-icon
            class="mt-2 mr-3"
            size="30"
            color="darkgreen"
          >
            mdi-check-circle-outline
          </v-icon>
          <span class="success-message">Congratulations! There are no errors or warnings in the 1701 Submission</span>
        </v-alert>
      </v-col>
    </v-row>
    <v-row
      v-if="nextButtonIsDisabled()"
    >
      <v-col class="error-message">
        <p class="form-hint">
          All errors must be fixed
        </p>
      </v-col>
    </v-row>
    <v-row justify="end">
      <PrimaryButton
        id="step-2-next-button-school"
        class="mr-3 mb-3"
        icon="mdi-check"
        text="Next"
        :disabled="nextButtonIsDisabled()"
        :click-action="next"
      />
    </v-row>
  </div>
  <div v-if="openEditView">
    <EditAndFixStudentData
      :selected-students="selectedStudents"
      :total-students="numIssueStudentsInCollection"
      @show-issues="refresh"
      @clear-filter="clearFiltersAndReload"
      @filter-pen="filterStudentsByPen"
    />
  </div>
</template>

<script>

import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';
import {isEmpty, omitBy} from 'lodash';
import Spinner from '../../common/Spinner.vue';
import PrimaryButton from '../../util/PrimaryButton.vue';
import {setFailureAlert} from '../../composable/alertComposable';
import { sdcCollectionStore } from '../../../store/modules/sdcCollection';
import EditAndFixStudentData from './EditAndFixStudentData.vue';

export default {
  name: 'StepTwoViewDataIssues',
  components: {
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
      numIssueStudentsInCollection: 0,
      sdcCollection: sdcCollectionStore(),
      legalUsualNameFilter: null,
      penFilter: null,
      selectedSdcStudentID: null,
      selectedSdcStudentIndex: 0,
      fundingWarningCategoryFilter: null,
      loadingCount: 0,
      allIssueLoader:false,
      summaryCounts: {error: 0, infoWarning: 0, fundingWarning:0},
      headerSearchParams: {
        penNumber: '',
        sdcSchoolCollectionStudentStatusCode: 'ERROR,INFOWARN,FUNDWARN'
      },
      fundingWarningCategories: [
        {
          category: 'No program funding for home school students',
          categoryCode: 'NOPROGFUNDINGHS'
        },
        {
          category: 'Zero courses reported',
          categoryCode: 'ZEROCOURSE'
        },
        {
          category: 'Student too young',
          categoryCode: 'STUDTOOYOUNG'
        },
        {
          category: 'No Indigenous Support Program funding',
          categoryCode: 'NOINDIGFUND'
        },
        {
          category: 'No program funding for Out-of-Province/International Students',
          categoryCode: 'NOPROGFUNDINGOOP'
        },
        {
          category: 'No funding for Support Blocks',
          categoryCode: 'NOFUNDSUPPORT'
        },
        {
          category: 'No funding for Graduated Adults',
          categoryCode: 'NOFUNDGRADADULT'
        }
      ]
    };
  },
  watch: {
    pageNumber: {
      handler() {
        this.getSDCSchoolCollectionStudentPaginated();
      },
      immediate: true
    },
  },
  mounted() {
    sdcCollectionStore().getCodes().then(async () => {
      this.getSummaryCounts();
      await this.getSDCSchoolCollectionStudentPaginated();
    });
  },
  methods: {
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
    clearFiltersAndReload() {
      this.openEditView = !this.openEditView;
      this.selectedStudents=[];
      this.penFilter = '';
      this.fundingWarningCategoryFilter = '';
      this.legalUsualNameFilter = '';
      this.getAllIssuesAndNavigate();
    },
    async filterStudentsByPen(pen) {
      this.openEditView = !this.openEditView;
      this.selectedStudents=[];
      this.penFilter = pen;
      this.fundingWarningCategoryFilter = '';
      this.legalUsualNameFilter = '';
      this.getAllIssuesAndNavigate();
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
      return this.summaryCounts.error > 0 || this.isLoading();
    },
    getSummaryCounts(){
      this.loadingCount += 1;

      ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/stats/error-warning-count/${this.$route.params.schoolCollectionID}`, {
      }).then(response => {
        this.summaryCounts = response.data;
      }).catch(error => {
        console.error(error);
        setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get summary counts. Please try again later.');
      }).finally(() => {
        this.loadingCount -= 1;
      });
    },
    async getSDCSchoolCollectionStudentPaginated(){
      this.loadingCount += 1;
      this.headerSearchParams.penLocalIdNumber = this.penFilter;
      this.headerSearchParams.fundingWarningCategory = this.fundingWarningCategoryFilter;
      this.headerSearchParams.multiFieldName = this.legalUsualNameFilter;

      await ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${this.$route.params.schoolCollectionID}/paginated`, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          searchParams: omitBy(this.headerSearchParams, isEmpty),
          sort: {
            sdcSchoolCollectionStudentStatusCode: 'ASC'
          },
        }
      }).then(response => {
        this.studentListData = response.data.content;
        this.totalStudents = response.data.totalElements;
        this.numIssueStudentsInCollection = response.data.totalElements;
      }).catch(error => {
        console.error(error);
        setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get sdc school collection students paginated. Please try again later.');
      }).finally(() => {
        this.loadingCount -= 1;
      });
    },
    getAllIssuesAndNavigate() {
      this.allIssueLoader = true;
      this.headerSearchParams.penLocalIdNumber = this.penFilter;
      this.headerSearchParams.fundingWarningCategory = this.fundingWarningCategoryFilter;
      this.headerSearchParams.multiFieldName = this.legalUsualNameFilter;

      ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${this.$route.params.schoolCollectionID}/paginated`, {
        params: {
          pageNumber: 0,
          pageSize: 2000,
          searchParams: omitBy(this.headerSearchParams, isEmpty),
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
    clearSearchFields(){
      this.fundingWarningCategoryFilter = null;
      this.legalUsualNameFilter = null;
      this.penFilter = null;
      this.getSDCSchoolCollectionStudentPaginated();
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
    getIssueCount(validationIssueSeverityCode, validationIssues) {
      return validationIssues?.filter(issues => issues.validationIssueSeverityCode === validationIssueSeverityCode)?.length;
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
      border: 0.05em solid darkgreen;
      color: darkgreen;
      background-color: transparent;
      padding: 0.6em;
    }

    .clear-message-error {
      border: 0.05em solid orange;
      color: orange;
      background-color: transparent;
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


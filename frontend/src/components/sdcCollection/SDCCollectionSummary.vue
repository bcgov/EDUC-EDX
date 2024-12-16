<template>
  <v-container
    class="containerSetup"
    fluid
  >
    <v-row class="d-flex justify-start">
      <v-col>
        <h2 class="subjectHeading">
          Open Collections
        </h2>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="mt-2 mb-2 d-flex justify-start"
    >
      <v-col class="mt-1 d-flex justify-start">
        <v-icon
          small
          color="#1976d2"
        >
          mdi-arrow-left
        </v-icon>
        <a
          class="ml-1"
          @click="backToDashboard()"
        >Return to Dashboard</a>
      </v-col>
    </v-row>
    <v-row
      v-if="isLoading"
      class="mt-0"
    >
      <v-col class="d-flex justify-center">
        <v-progress-circular
          class="mt-16"
          :size="70"
          :width="7"
          color="primary"
          indeterminate
          :active="isLoading"
        />
      </v-col>
    </v-row>
    <v-container class="border">
      <v-row
        v-if="!isLoading"
      >
        <v-col v-if="isCollectionOpen()">
          <v-row>
            <v-col cols="4">
              <DoughnutChart :incoming-chart-data="incomingChartData" />
            </v-col>
            <v-col cols="8">
              <h2 class="subjectHeading">
                Student Level Data (1701)
              </h2>
              <p>
                {{ currentCollectionTypeCode }}
                {{ currentCollectionYear }} Collection
              </p>
              <p v-if="submissionDate">
                <i
                  id="submissionDueDate"
                  style="color: red;"
                >
                  Submission Due: {{ submissionDate }}
                </i>
              </p>
            </v-col>
          </v-row>
          <v-row justify="space-around">
            <v-col
              cols="4"
              class="steps"
            >
              <span>Current Step: {{ noOfStepsCompleted }} of {{ totalStepsInCollection }}</span>
            </v-col>
            <v-col
              cols="8"
              class="navigate"
            >
              <a
                class="ml-1"
                @click="startCollection()"
              >Continue</a>
              <v-icon
                small
                color="#1976d2"
              >
                mdi-arrow-right
              </v-icon>
            </v-col>
          </v-row>
        </v-col>
        <v-col v-else>
          <p>Currently, there are no open collections.</p>
        </v-col>
      </v-row>
      <v-divider class="py-6 mt-6" />
      <v-row>
        <v-icon icon="mdi-history" />
        <h3 class="pl-2">
          Collection History
        </h3>
      </v-row>
      <v-row>
        <v-col>
          <v-select
            v-model="searchParams.collectionType"
            label="Collection Type"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            :items="collectionTypeCodes"
            item-value="collectionTypeCode"
            item-text="label"
            item-title="label"
            @update:model-value="getHistoricCollections"
          />
        </v-col>
        <v-col>
          <VueDatePicker
            v-model="searchParams.year"
            placeholder="Year"
            year-picker
            reverse-years
            :year-range="[1990, maxDate]"
            auto-apply
            @update:model-value="getHistoricCollections"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-data-table-server
          id="collection-history-dataTable"
          :items-per-page="itemsPerPage"
          :page="pageNumber"
          :items="collections"
          :items-length="totalElements"
          :headers="headers"
          :loading="searchLoading"
          hover
          @update:options="loadItems"
          @click:row="openCollection"
        />
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import alertMixin from '../../mixins/alertMixin';
import DoughnutChart from '../common/DoughnutChart.vue';
import { mapState, mapActions } from 'pinia';
import { sdcCollectionStore } from '../../store/modules/sdcCollection';
import router from '../../router';
import {LocalDate, LocalDateTime} from '@js-joda/core';
import {capitalize} from 'lodash';
import {SDC_STEPS_DISTRICT, SDC_STEPS_SCHOOL, SDC_STEPS_INDP_SCHOOL, SDC_STEPS_SUMMER_DISTRICT, SDC_STEPS_SUMMER_INDP_SCHOOL, SDC_STEPS_SUMMER_SCHOOL} from '../../utils/sdc/SdcSteps';
import {getDateFormatter} from '../../utils/format';
import VueDatePicker from '@vuepic/vue-datepicker';

export default {
  name: 'SdcCollectionSummary',
  components: {
    DoughnutChart,
    VueDatePicker
  },
  mixins: [alertMixin],
  props: {
    districtID: {
      type: String,
      default: null
    },
    schoolID: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      noOfStepsCompleted: 0,
      incomingChartData: null,
      instituteCollectionID: null,
      sdcDistrictCollectionID: null,
      isLoading: false,
      currentStepIndex: 0,
      toFormatter: getDateFormatter('uuuu/MM/dd'),
      submissionDate: null,
      headers: [
        {
          title: 'Collection Type',
          key: 'collectionTypeCode',
          sortable: false
        },
        {
          title: 'Year',
          key: 'submissionDueDate',
          sortable: false,
          value: item => LocalDate.parse(item.submissionDueDate)?.year()
        }
      ],
      itemsPerPage: 5,
      pageNumber: 1,
      collections: [],
      searchLoading: false,
      searchParams: {
        collectionType: null,
        year: ''
      },
      submissionDueDate: null,
      totalElements: 0,
    };
  },
  computed: {
    ...mapState(sdcCollectionStore, ['currentCollectionTypeCode', 'currentStepInCollectionProcess','currentCollectionYear','collectionTypeCodes','collectionTypeCodesMap']),
    maxDate() {
      return LocalDate.now().year();
    },
    isSchoolCollection() {
      return !!this.schoolID;
    },
    totalStepsInCollection() {
      if(this.isSchoolCollection) {
        return this.SDC_STEPS_SCHOOL_CALC.length;
      } else {
        return this.SDC_STEPS_DISTRICT_CALC.length;
      }
    },
    SDC_STEPS_DISTRICT_CALC() {
      return this.isSummerCollection ? SDC_STEPS_SUMMER_DISTRICT : SDC_STEPS_DISTRICT;
    },
    SDC_STEPS_SCHOOL_CALC() {
      if(this.sdcDistrictCollectionID){
        return this.isSummerCollection ? SDC_STEPS_SUMMER_SCHOOL : SDC_STEPS_SCHOOL;
      } else {
        return this.isSummerCollection ? SDC_STEPS_SUMMER_INDP_SCHOOL : SDC_STEPS_INDP_SCHOOL;
      }
    },
    historicCollectionUrl() {
      if(this.isSchoolCollection) {
        return `${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION}/${this.schoolID}/historic-paginated`;
      } else {
        return `${ApiRoutes.sdc.SDC_DISTRICT_COLLECTION}/${this.districtID}/historic-paginated`;
      }
    }
  },
  async created() {
    if(this.isSchoolCollection) {
      this.getSDCCollectionByInstituteId(ApiRoutes.sdc.SDC_COLLECTION_BY_SCHOOL_ID + `/${this.$route.params.schoolID}`);
    } else {
      this.getSDCCollectionByInstituteId(ApiRoutes.sdc.SDC_COLLECTION_BY_DISTRICT_ID + `/${this.$route.params.districtID}`);
    }
    await sdcCollectionStore().getCollectionTypeCodesMap();
  },
  methods: {
    ...mapActions(sdcCollectionStore, ['setCurrentCollectionTypeCode', 'setCollectionMetaData', 'setCurrentCollectionYear']),
    startCollection() {
      if(this.isSchoolCollection) {
        router.push({name: 'sdcCollection', params: {schoolCollectionID: this.instituteCollectionID}});
      } else {
        router.push({name: 'sdcDistrictCollection', params: {sdcDistrictCollectionID: this.instituteCollectionID}});
      }
    },
    backToDashboard() {
      this.$router.push({name: 'home'});
    },
    isCollectionOpen() {
      return this.instituteCollectionID !== null;
    },
    calculateStep() {
      this.noOfStepsCompleted = this.currentStepIndex ?? 0;
      this.incomingChartData = [this.noOfStepsCompleted, (this.totalStepsInCollection - this.noOfStepsCompleted)];
    },
    getHistoricCollections() {
      this.searchLoading = true;
      ApiService.apiAxios.get(this.historicCollectionUrl, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.itemsPerPage,
          searchParams: this.searchParams,
          sort: {
            'collectionEntity.submissionDueDate': 'DESC'
          },
        }
      })
        .then(response => {
          this.collections = response?.data?.content.map(collection => {
            return { ...collection, collectionTypeCode: this.collectionTypeCodes.find(value => value.collectionTypeCode === collection.collectionTypeCode)?.label};
          });
          this.totalElements = response?.data?.totalElements;
        })
        .finally(() => {
          this.searchLoading = false;
        });
    },
    getSDCCollectionByInstituteId(url) {
      this.isLoading = true;
      ApiService.apiAxios.get(url).then(response => {
        if(response.data) {
          this.setCurrentCollectionTypeCode(capitalize(response.data.collectionTypeCode));
          this.isSummerCollection = this.currentCollectionTypeCode === 'July';
          this.submissionDate = response.data.submissionDueDate;

          let instituteStatusCode;
          if(this.isSchoolCollection) {
            this.instituteCollectionID = this.districtID ? response.data.sdcDistrictCollectionID : response.data.sdcSchoolCollectionID;
            instituteStatusCode = response.data.sdcSchoolCollectionStatusCode;
            this.sdcDistrictCollectionID = response.data.sdcDistrictCollectionID;
          } else {
            this.instituteCollectionID = response.data.sdcDistrictCollectionID;
            instituteStatusCode = response.data.sdcDistrictCollectionStatusCode;
          }
          this.currentStepIndex = this.getIndexOfSDCCollectionByStatusCode(instituteStatusCode);
          this.setCurrentCollectionYear(LocalDate.parse(response.data.submissionDueDate)?.year());
          this.calculateStep();
        }
      }).catch(error => {
        console.error(error);
        this.setFailureAlert(error.response?.data?.message || error.message);
      }).finally(() => {
        this.isLoading = false;
      });
    },
    getIndexOfSDCCollectionByStatusCode(statusCode) {
      if(this.isSchoolCollection) {
        return this.SDC_STEPS_SCHOOL_CALC.find(step => step.sdcSchoolCollectionStatusCode.includes(statusCode))?.index;
      } else {
        return this.SDC_STEPS_DISTRICT_CALC.find(step => step.sdcDistrictCollectionStatusCode.includes(statusCode))?.index;
      }
    },
    getStepOfSDCCollectionByStatusCode(statusCode) {
      if(this.isSchoolCollection) {
        return this.SDC_STEPS_SCHOOL_CALC.find(step => step.sdcSchoolCollectionStatusCode.includes(statusCode))?.step;
      } else {
        return this.SDC_STEPS_DISTRICT_CALC.find(step => step.sdcDistrictCollectionStatusCode.includes(statusCode))?.step;
      }
    },
    loadItems({ page, itemsPerPage }) {
      this.pageNumber = page;
      this.itemsPerPage = itemsPerPage;
      this.getHistoricCollections();
    },
    openCollection(e, { item }) {
      if(this.isSchoolCollection) {
        router.push({name: 'sdcCollection', params: {schoolCollectionID: item?.sdcSchoolCollectionID}});
      } else {
        router.push({name: 'sdcDistrictCollection', params: {sdcDistrictCollectionID: item?.sdcDistrictCollectionID}});
      }
    }
  }
};
</script>

<style scoped>
:deep(.v-data-table-footer__items-per-page) {
  display: none;
}
.containerSetup{
  padding-right: 10em !important;
  padding-left: 10em !important;
}

@media screen and (max-width: 1200px) {
  .containerSetup{
    padding-right: 3em !important;
    padding-left: 3em !important;
  }
}
.border {
  border: 2px solid grey;
  border-radius: 5px;
  padding: 35px;
  margin-bottom: 2em;
  margin-top: 2em;
}

.steps {
  text-align: center;
}

.navigate {
  text-align: end;
}
</style>
    
    
  

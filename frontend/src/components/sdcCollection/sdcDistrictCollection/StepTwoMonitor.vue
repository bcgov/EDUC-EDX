<template>
  <v-row v-if="isLoading">
    <v-col>
      <Spinner />
    </v-col>
  </v-row>
  <v-row
    v-else
    class="mt-n6"
  >
    <v-spacer />
    <v-slide-group
      class="py-4"
      show-arrows
    >
      <v-slide-group-item>
        <v-col>
          <v-card
            height="100%"
          >
            <v-card-item class="pb-0">
              <v-card-title class="column-header">
                Data Uploaded
              </v-card-title>
            </v-card-item>
            <v-card-text>
              <v-row
                class="row-data"
              >
                <v-col class="column-data">
                  <div>Have Data</div>
                  <span id="hasUploadedValue">
                    {{ monitorSdcSchoolCollectionsResponse?.schoolsWithData }}
                  </span>
                </v-col>
                <v-divider
                  class="divider"
                  vertical
                />
                <v-col class="column-data">
                  <div>Missing Data</div>
                  <span id="missingUploadedValue">
                    {{
                      monitorSdcSchoolCollectionsResponse?.totalSchools - monitorSdcSchoolCollectionsResponse?.schoolsWithData
                    }}
                  </span>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-slide-group-item>
      <v-slide-group-item>
        <v-col>
          <v-card
            height="100%"
          >
            <v-card-item class="pb-0">
              <v-card-title class="column-header">
                Data Issues
              </v-card-title>
            </v-card-item>
            <v-card-text>
              <v-row
                class="row-data"
              >
                <v-col class="column-data">
                  <div>Errors</div>
                  <v-icon color="#d90606">
                    mdi-alert-circle-outline
                  </v-icon>
                  <span id="dataErrorValue">
                    {{ monitorSdcSchoolCollectionsResponse?.totalErrors }}
                  </span>
                </v-col>
                <v-divider
                  class="divider"
                  vertical
                />
                <v-col class="column-data">
                  <div>Funding Warnings</div>
                  <v-icon color="orange">
                    mdi-alert-outline
                  </v-icon>
                  <span id="dataFundingWarnValue">
                    {{ monitorSdcSchoolCollectionsResponse?.totalFundingWarnings }}
                  </span>
                </v-col>
                <v-divider
                  class="divider"
                  vertical
                />
                <v-col class="column-data">
                  <div>Info Warnings</div>
                  <v-icon color="blue">
                    mdi-alert-circle-outline
                  </v-icon>
                  <span id="dataInfoWarnValue">
                    {{ monitorSdcSchoolCollectionsResponse?.totalInfoWarnings }}
                  </span>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-slide-group-item>
      <v-slide-group-item>
        <v-col>
          <v-card
            height="100%"
          >
            <v-card-item class="pb-0">
              <v-card-title class="column-header">
                Submitted to District
              </v-card-title>
            </v-card-item>
            <v-card-text>
              <v-row
                class="row-data"
              >
                <v-col class="column-data">
                  <div>Submitted</div>
                  <span id="submittedValue">
                    {{ monitorSdcSchoolCollectionsResponse?.schoolsSubmitted }}
                  </span>
                </v-col>
                <v-divider
                  class="divider"
                  vertical
                />
                <v-col class="column-data">
                  <div>Not Submitted</div>
                  <span id="notSubmittedValue">
                    {{
                      monitorSdcSchoolCollectionsResponse?.totalSchools - monitorSdcSchoolCollectionsResponse?.schoolsSubmitted
                    }}
                  </span>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-slide-group-item>
    </v-slide-group>
    <v-spacer />
  </v-row>
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
      :filters="allowedFilters"
      :district="district"
      :show-student-search="false"
      @apply-filters="applyFilters"
      @clear-filters="clearFilters"
      @close="toggleFilters()"
    />
  </v-navigation-drawer>
  <v-row
    justify="end"
    no-gutters
  >
    <v-btn
      id="export"
      color="#003366"
      text="Export"
      class="mr-2 mb-1"
      prepend-icon="mdi-tray-arrow-down"
      variant="elevated"
      @click="showExportDialog = true"
    />
    <v-btn
      id="filters"
      color="#003366"
      text="Filter"
      class="mr-1 mb-1"
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
  </v-row>
  <v-data-table
    id="monitoring-table"
    :headers="headers"
    :items="filteredItems"
    :sort-by="sortBy"
    items-per-page="-1"
  >
    <template #item.schoolTitle="{ value }">
      <router-link
        class="linkToSdcSchoolCollection"
        :to="{ name: 'sdcCollection', params: { schoolCollectionID: value.sdcSchoolCollectionId }}"
        target="_blank"
      >
        {{ value.title }}
      </router-link>
    </template>
    <template #item.uploadDate="{ value }">
      <span v-if="value">
        <template v-if="value.includes('.')">
          {{ formatDate(value, "uuuu-MM-dd'T'HH:mm:ss.SSSSSS") }}
          <v-tooltip activator="parent">
            {{ formatDateTime(value, "uuuu-MM-dd'T'HH:mm:ss.SSSSSS", 'uuuu/MM/dd HH:mm:ss', true) }}
          </v-tooltip>
        </template>
        <template v-else>
          {{ formatDate(value, "uuuu-MM-dd'T'HH:mm:ss") }}
          <v-tooltip activator="parent">
            {{ formatDateTime(value, "uuuu-MM-dd'T'HH:mm:ss", 'uuuu/MM/dd HH:mm:ss', true) }}
          </v-tooltip>
        </template>
      </span>
      <span v-else>
        -
      </span>
    </template>
    <template #item.unsubmit="{ value, item }">
      <v-btn
        :id="'unsubmitBtn' + value.sdcSchoolCollectionId"
        color="primary"
        icon="mdi-lock-open"
        variant="text"
        :disabled="!value.isSubmitted || isDistrictCollectionSubmitted() || !hasEditPermission"
        @click="unsubmitSdcSchoolCollection(item)"
      />
    </template>
    <template #bottom />
  </v-data-table>
  <v-row justify="end">
    <PrimaryButton
      id="step-2-next-button-district"
      class="mr-3 mt-4 mb-3"
      icon="mdi-check"
      text="Next"
      :disabled="!canMoveForward()"
      :click-action="next"
    />
  </v-row>
  <ConfirmationDialog ref="confirmRemovalOfCollection">
    <template #message />
  </ConfirmationDialog>
  <v-dialog
    v-model="showExportDialog"
    :max-width="443"
  >
    <v-card class="ma-auto">
      <v-card-title>
        Export Student Records
      </v-card-title>
      <v-card-actions>
        <v-btn
          color="#003366"
          variant="elevated"
          style="white-space: pre-wrap;"
          text="All Students with no Errors"
          @click="downloadStudentReport"
        />
        <v-btn
          color="#003366"
          variant="elevated"
          style="white-space: pre-wrap;"
          text="All Students with Data Issues"
          @click="downloadStudentWithErrorsReport"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>  
</template>
<script>
import {defineComponent} from 'vue';
import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';
import {downloadStudentOnlyReportURL,downloadStudentErrorsReportURL} from '../../../utils/common';
import {setFailureAlert, setSuccessAlert} from '../../composable/alertComposable';
import PrimaryButton from '../../util/PrimaryButton.vue';
import Filters from '../../common/Filters.vue';
import {cloneDeep} from 'lodash';
import Spinner from '../../common/Spinner.vue';
import {MONITORING} from '../../../utils/sdc/DistrictCollectionTableConfiguration';
import {DateTimeFormatter, LocalDateTime} from '@js-joda/core';
import ConfirmationDialog from '../../util/ConfirmationDialog.vue';
import {appStore} from '../../../store/modules/app';
import {mapState} from 'pinia';
import {sdcCollectionStore} from '../../../store/modules/sdcCollection';
import {authStore} from '../../../store/modules/auth';
import {PERMISSION} from '../../../utils/constants/Permission';

export default defineComponent({
  name: 'StepTwoMonitor',
  components: {ConfirmationDialog, Spinner, Filters, PrimaryButton},
  props: {
    districtCollectionObject: {
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
      allowedFilters: MONITORING.allowedFilters,
      showExportDialog: false,
      filters: {},
      sortBy: [{ key: 'schoolTitle', order:'asc'}],
      headers: [
        {
          title: 'School',
          align: 'start',
          key: 'schoolTitle',
          value: item => { return { title: item.schoolTitle, sdcSchoolCollectionId: item.sdcSchoolCollectionId }; }
        },
        {
          title: 'Data Uploaded',
          align: 'center',
          key: 'uploadDate'
        },
        {
          title: 'Errors',
          align: 'center',
          key: 'errors',
          value: item => item.uploadDate ? item.errors : '-'
        },
        {
          title: 'Funding Warnings',
          align: 'center',
          key: 'fundingWarnings',
          value: item => item.uploadDate ? item.fundingWarnings : '-'
        },
        {
          title: 'Info Warnings',
          align: 'center',
          key: 'infoWarnings',
          value: item => item.uploadDate ? item.infoWarnings : '-'
        },
        {
          title: 'School Status',
          align: 'center',
          key: 'schoolStatus',
          value: item => this.schoolCollectionStatusCodes.get(item.schoolStatus)?.label
        },
        {
          title: 'Unsubmit',
          align: 'center',
          key: 'unsubmit',
          value: item => { return { isSubmitted: item.schoolStatus === 'SUBMITTED', sdcSchoolCollectionId: item.sdcSchoolCollectionId }; }
        }
      ],
      isLoading: false,
      monitorSdcSchoolCollectionsResponse: [],
      showFilters: false,
      district: {},
      schoolCollectionStatusCodes: null
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['activeDistrictsMap']),
    ...mapState(sdcCollectionStore, ['schoolCollectionStatusCodesMap']),
    filterCount() {
      return Object.values(this.filters).filter(filter => !!filter).reduce((acc, filter) => acc.concat(filter), []).length;
    },
    hasEditPermission(){
      return (this.userInfo?.activeInstitutePermissions?.filter(perm => perm === PERMISSION.DISTRICT_SDC_EDIT).length > 0);
    },
    filteredItems() {
      const { schoolNameNumber, issuesFilter, uploadDataFilter } = this.filters || {};

      return this.monitorSdcSchoolCollectionsResponse?.monitorSdcSchoolCollections?.filter(school => {
        if (schoolNameNumber && schoolNameNumber[0]?.value && school.schoolId !== schoolNameNumber[0]?.value) {
          return false;
        }
        if (issuesFilter?.length > 0 && !this.filterForErrorsOrWarnings(school)) {
          return false;
        }
        if (uploadDataFilter?.length > 0 && !this.filterForUploadData(school)) {
          return false;
        }
        return this.filterForStatus(school); //last check so return true if match is found
      });
    },
  },
  async created() {
    await appStore().getInstitutesData().then(() => {
      this.district = this.activeDistrictsMap.get(this.districtCollectionObject.districtID);
    });
    this.schoolCollectionStatusCodes = await sdcCollectionStore().getSchoolCollectionStatusCodeMap();
    await this.getSdcSchoolCollections();

  },
  methods: {
    downloadStudentReport(){
      const routeData = this.$router.resolve({path: downloadStudentOnlyReportURL(this.$route)});
      window.open(routeData.href, '_blank');
      this.showExportDialog = false;
    },
    downloadStudentWithErrorsReport(){
      const routeData = this.$router.resolve({path: downloadStudentErrorsReportURL(this.$route)});
      window.open(routeData.href, '_blank');
      this.showExportDialog = false;
    },
    canMoveForward(){
      return this.isStepComplete || this.hasEditPermission;
    },
    applyFilters($event) {
      this.filters = cloneDeep($event);
    },
    clearFilters() {
      this.filters = {};
    },
    filterForErrorsOrWarnings(school) {
      const { issuesFilter = [] } = this.filters || {};

      const filterFunctions = {
        'infoWarnings': () => school.infoWarnings > 0,
        'fundingWarnings': () => school.fundingWarnings > 0,
        'errors': () => school.errors > 0
      };

      return issuesFilter.length === 0 || issuesFilter.some(filter => filterFunctions[filter.value]?.());
    },
    filterForStatus(school) {
      const { detailsFilter = [], contactsFilter = [], submittedFilter = [] } = this.filters || {};

      const filterFunctions = {
        'detailsConfirmed': () => school.detailsConfirmed,
        'contactsConfirmed': () => school.contactsConfirmed,
        'submittedToDistrict': () => school.submittedToDistrict,
        'notDetailsConfirmed': () => !school.detailsConfirmed,
        'notContactsConfirmed': () => !school.contactsConfirmed,
        'notSubmittedToDistrict': () => !school.submittedToDistrict
      };

      const allFilters = [...detailsFilter, ...contactsFilter, ...submittedFilter];

      return allFilters.length === 0 || allFilters.every(filter => filterFunctions[filter.value]());
    },
    filterForUploadData(school) {
      const { uploadDataFilter = [] } = this.filters || {};

      const filterFunctions = {
        'uploadDate': () => !!school.uploadDate,
        'notUploadDate': () => !school.uploadDate
      };

      return uploadDataFilter.length === 0 || uploadDataFilter.every(filter => filterFunctions[filter.value]?.());
    },
    formatDate(inputDate) {
      const date = LocalDateTime.parse(inputDate);
      return date.format(DateTimeFormatter.ofPattern('yyyy/MM/dd'));
    },
    formatDateTime(inputDateTime) {
      const dateTime = LocalDateTime.parse(inputDateTime);
      return dateTime.format(DateTimeFormatter.ofPattern('yyyy/MM/dd HH:mm:ss'));
    },
    async getSdcSchoolCollections(){
      this.isLoading = true;
      await ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_DISTRICT_COLLECTION}/${this.$route.params.sdcDistrictCollectionID}/sdcSchoolCollectionMonitoring`, {
      }).then(response => {
        this.monitorSdcSchoolCollectionsResponse = response?.data;
      }).catch(error => {
        console.error(error);
        setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get sdc school collections. Please try again later.');
      }).finally(() => {
        this.isLoading = false;
      });
    },
    isDistrictCollectionSubmitted(){
      return this.districtCollectionObject.sdcDistrictCollectionStatusCode === 'SUBMITTED';
    },
    markStepAsComplete(){
      let updateCollection = {
        districtCollection: this.districtCollectionObject,
        status: 'REVIEWED'
      };
      ApiService.apiAxios.put(`${ApiRoutes.sdc.SDC_DISTRICT_COLLECTION}/${this.$route.params.sdcDistrictCollectionID}`, updateCollection)
        .then(() => {
          this.$emit('next');
        })
        .catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while updating status. Please try again later.');
        });
    },
    next() {
      if(this.isStepComplete || this.districtCollectionObject.sdcDistrictCollectionStatusCode === 'SUBMITTED') {
        this.$emit('next');
      } else {
        this.markStepAsComplete();
      }
    },
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
    async unsubmitSdcSchoolCollection(sdcSchoolCollection) {
      let schoolName = sdcSchoolCollection.schoolTitle.split('-')[1];
      const confirmation = await this.$refs.confirmRemovalOfCollection.open('Confirm Unsubmit of SDC School Collection', `Are you sure that you would like to unsubmit ${schoolName}'s data collection?`, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Yes', rejectText: 'No'});
      if (!confirmation) {
        return;
      }
      ApiService.apiAxios.post(`${ApiRoutes.sdc.BASE_URL}/${sdcSchoolCollection.sdcSchoolCollectionId}/unsubmit`)
        .then(() => {
          setSuccessAlert('School collection has been unsubmitted');
          this.getSdcSchoolCollections();
        })
        .catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while unsubmitting school collection. Please try again later.');
        });
      
    }
  }
});
</script>

<style scoped>
.column-header {
  font-weight: bold;
  text-align: center;
  line-height: 1.5;
  font-size: 1rem;
}
.column-data {
  text-align: center;
  line-height: 1.5;
  font-size: 1rem;
  white-space: nowrap;
}
.divider {
  height: 3rem;
  margin-top: 1rem;
}
.form-hint{
  color: rgb(56, 89, 138);
  font-size: 14px;
}
.row-data {
  flex-wrap: nowrap;
}
</style>

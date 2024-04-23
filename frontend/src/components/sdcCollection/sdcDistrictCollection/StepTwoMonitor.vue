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
                  <span>
                    {{ monitorSdcSchoolCollectionsResponse?.schoolsWithData }}
                  </span>
                </v-col>
                <v-divider
                  class="divider"
                  vertical
                />
                <v-col class="column-data">
                  <div>Missing Data</div>
                  <span>
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
                  <span>
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
                  <span>
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
                  <span>
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
                Details Confirmed
              </v-card-title>
            </v-card-item>
            <v-card-text>
              <v-row
                class="row-data"
              >
                <v-col class="column-data">
                  <div>Confirmed</div>
                  <span>
                    {{ monitorSdcSchoolCollectionsResponse?.schoolsDetailsConfirmed }}
                  </span>
                </v-col>
                <v-divider
                  class="divider"
                  vertical
                />
                <v-col class="column-data">
                  <div>Not Confirmed</div>
                  <span>
                    {{
                      monitorSdcSchoolCollectionsResponse?.totalSchools - monitorSdcSchoolCollectionsResponse?.schoolsDetailsConfirmed
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
                Contacts Confirmed
              </v-card-title>
            </v-card-item>
            <v-card-text>
              <v-row
                class="row-data"
              >
                <v-col class="column-data">
                  <div>Confirmed</div>
                  <span>
                    {{ monitorSdcSchoolCollectionsResponse?.schoolsContactsConfirmed }}
                  </span>
                </v-col>
                <v-divider
                  class="divider"
                  vertical
                />
                <v-col class="column-data">
                  <div>Not Confirmed</div>
                  <span>
                    {{
                      monitorSdcSchoolCollectionsResponse?.totalSchools - monitorSdcSchoolCollectionsResponse?.schoolsContactsConfirmed
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
                Submitted to District
              </v-card-title>
            </v-card-item>
            <v-card-text>
              <v-row
                class="row-data"
              >
                <v-col class="column-data">
                  <div>Submitted</div>
                  <span>
                    {{ monitorSdcSchoolCollectionsResponse?.schoolsSubmitted }}
                  </span>
                </v-col>
                <v-divider
                  class="divider"
                  vertical
                />
                <v-col class="column-data">
                  <div>Not Submitted</div>
                  <span>
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
      @apply-filters="applyFilters"
      @clear-filters="clearFilters"
      @close="toggleFilters()"
    >
      <template #text-search>
        <v-text-field
          id="searchInput"
          v-model="filters.schoolFilter"
          label="School Name or Number"
          color="primary"
          variant="underlined"
          class="mt-n4 mb-n4"
        />
      </template>
    </Filters>
  </v-navigation-drawer>
  <v-row
    justify="end"
    no-gutters
  >
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
    :headers="headers"
    :items="filteredItems"
    items-per-page="-1"
  >
    <template #item.schoolTitle="{ value }">
      <router-link
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
    <template #item.detailsConfirmed="{ value }">
      <v-icon
        :icon="value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
        :color="value ? 'success' : 'error'"
      />
    </template>
    <template #item.contactsConfirmed="{ value }">
      <v-icon
        :icon="value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
        :color="value ? 'success' : 'error'"
      />
    </template>
    <template #item.submittedToDistrict="{ value }">
      <v-icon
        :icon="value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
        :color="value ? 'success' : 'error'"
      />
    </template>
    <template #bottom />
  </v-data-table>
  <v-row justify="end">
    <PrimaryButton
      id="step-2-next-button-school"
      class="mr-3 mt-4 mb-1"
      icon="mdi-check"
      text="Next"
      :disabled="disableNextButton()"
      :click-action="next"
    />
  </v-row>
  <v-row
    v-if="disableNextButton()"
    justify="end"
    class="mb-0"
  >
    <p class="form-hint mr-3">
      {{ monitorSdcSchoolCollectionsResponse?.totalSchools - monitorSdcSchoolCollectionsResponse?.schoolsSubmitted }}
      schools not
      submitted
    </p>
  </v-row>
</template>
<script>
import {defineComponent} from 'vue';
import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';
import {setFailureAlert} from '../../composable/alertComposable';
import {formatDate, formatDateTime} from '../../../utils/format';
import PrimaryButton from '../../util/PrimaryButton.vue';
import Filters from '../../common/Filters.vue';
import {cloneDeep} from 'lodash';
import Spinner from '../../common/Spinner.vue';
import {MONITORING} from '../../../utils/sdc/DistrictCollectionTableConfiguration';
export default defineComponent({
  name: 'StepTwoMonitor',
  components: {Spinner, Filters, PrimaryButton},
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
      filters: {},
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
          title: 'Details Confirmed',
          align: 'center',
          key: 'detailsConfirmed'
        },
        {
          title: 'Contacts Confirmed',
          align: 'center',
          key: 'contactsConfirmed'
        },
        {
          title: 'Submitted to District',
          align: 'center',
          key: 'submittedToDistrict'
        },
      ],
      isLoading: false,
      monitorSdcSchoolCollectionsResponse: [],
      showFilters: false
    };
  },
  computed: {
    filterCount() {
      return Object.values(this.filters).filter(filter => !!filter).reduce((acc, filter) => acc.concat(filter), []).length;
    },
    filteredItems() {
      const { schoolFilter, issuesFilter, uploadDataFilter } = this.filters || {};

      return this.monitorSdcSchoolCollectionsResponse?.monitorSdcSchoolCollections?.filter(school => {
        if (schoolFilter && !school.schoolTitle.toLowerCase().includes(schoolFilter.toLowerCase())) {
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
    }
  },
  async created() {
    await this.getSdcSchoolCollections();
  },
  methods: {
    applyFilters($event) {
      const schoolFilter = this.filters?.schoolFilter;
      this.filters = cloneDeep($event);
      this.filters.schoolFilter = schoolFilter;
    },
    clearFilters() {
      this.filters = {};
    },
    disableNextButton() {
      return this.monitorSdcSchoolCollectionsResponse?.totalSchools - this.monitorSdcSchoolCollectionsResponse?.schoolsSubmitted !== 0;
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
    formatDateTime,
    formatDate,
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
      if(this.isStepComplete) {
        this.$emit('next');
      } else {
        this.markStepAsComplete();
      }
    },
    toggleFilters() {
      this.showFilters = !this.showFilters;
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

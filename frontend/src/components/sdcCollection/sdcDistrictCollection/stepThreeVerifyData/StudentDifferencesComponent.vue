<template>
  <v-row v-if="isLoading">
    <v-col>
      <Spinner />
    </v-col>
  </v-row>
  <div
    v-else
    class="border"
  >
    <v-row justify="space-between">
      <v-col
        cols="4"
        class="found-align"
      >
        <span
          id="studentsFound"
          class="bold"
        >Students Found:  {{ totalElements }}
        </span>
      </v-col>
      <v-col
        cols="8"
        class="d-flex justify-end"
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
      </v-col>
    </v-row>
    <v-data-iterator
      v-model:page.sync="pageNumber"
      :items="studentDifferences"
      :items-per-page="10"
    >
      <template #default="{ items }">
        <v-row
          v-for="difference in items"
          :key="difference?.raw"
          class="pt-4"
          no-gutters
        >
          <v-col class="pa-0">
            <v-row no-gutters>
              <v-col class="pb-2">
                <v-chip color="primary">
                  <v-col><b>Assigned PEN:</b> {{ difference?.raw?.currentStudent?.assignedPen }}</v-col>
                  <v-col><b>School:</b> {{ difference?.raw?.currentStudent?.schoolName }}</v-col>
                </v-chip>
              </v-col>
            </v-row>

            <CustomTable
              :headers="headers"
              :data="[difference?.raw?.originalStudent, difference?.raw?.currentStudent]"
              :is-loading="false"
              :reset="false"
              :show-diff="true"
              :total-elements="2"
              :hide-pagination="true"
            />
          </v-col>
        </v-row>
      </template>
    </v-data-iterator>
    <v-pagination
      v-if="studentDifferences?.length > 0"
      v-model="pageNumber"
      :length="Math.ceil(studentDifferences?.length/10)"
      total-visible="5"
      rounded="circle"
    />
  </div>
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
      @apply-filters="applyFilters"
      @clear-filters="clearFilters"
      @close="showFilters= !showFilters"
    />
  </v-navigation-drawer>
</template>
<script>
import {defineComponent} from 'vue';
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';
import {
  DISTRICT_STUDENT_DIFFERENCES
} from '../../../../utils/sdc/DistrictCollectionTableConfiguration';
import {sdcCollectionStore} from '../../../../store/modules/sdcCollection';
import Spinner from '../../../common/Spinner.vue';
import alertMixin from '../../../../mixins/alertMixin';
import CustomTable from '../../../common/CustomTable.vue';
import Filters from '../../../common/Filters.vue';
import {cloneDeep, isEmpty, omitBy} from 'lodash';
import {appStore} from '../../../../store/modules/app';
import {mapState} from 'pinia';

export default defineComponent({
  name: 'StudentDifferencesComponent',
  components: {
    Filters,
    CustomTable,
    Spinner,
  },
  mixins: [alertMixin],
  props: {
    district: {
      type: Object,
      required: false,
      default: null
    }
  },
  emits: ['next'],
  data() {
    return {
      isLoading: true,
      studentDifferences: null,
      totalElements: 0,
      showFilters: null,
      pageNumber: 1,
      filterSearchParams: {
        tabFilter: null,
        moreFilters: {}
      },
      allowedFilters: DISTRICT_STUDENT_DIFFERENCES.allowedFilters,
      headers: DISTRICT_STUDENT_DIFFERENCES.tableHeaders,
      sdcDistrictCollectionID: this.$route.params.sdcDistrictCollectionID,
      sdcSchoolCollectionID: this.$route.params.sdcSchoolCollectionID,
    };
  },
  computed: {
    ...mapState(appStore, ['activeDistrictsMap']),
    filterCount() {
      return Object.values(this.filterSearchParams.moreFilters).filter(filter => !!filter).reduce((total, filter) => total.concat(filter), []).length;
    },
  },
  async created() {
    sdcCollectionStore().getCodes().then(() => {
      this.getStudentDifferences();
    });
  },
  methods: {
    applyFilters($event) {
      this.filterSearchParams.moreFilters = cloneDeep($event);
      this.getStudentDifferences();
    },
    clearFilters() {
      this.filterSearchParams.moreFilters = {};
      this.getStudentDifferences();
    },
    toggleFilters() {
      this.showFilters= !this.showFilters;
    },
    getStudentDifferences(){
      this.isLoading = true;
      ApiService.apiAxios.get(ApiRoutes.sdc.SDC_DISTRICT_COLLECTION + '/'+ this.sdcDistrictCollectionID + '/studentDifferences', {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          searchParams: omitBy(this.filterSearchParams, isEmpty)
        }}).then(response => {
        this.studentDifferences = response.data;
        this.totalElements = response.data.length;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert(error.response?.data?.message || error.message);
        this.apiError = true;
      }).finally(() => {
        this.isLoading = false;
      });
    },

  }
});
</script>

<style scoped>
.border {
  border: 2px solid grey;
  border-radius: 5px;
  padding: 35px;
  margin-bottom: 2em;
}
.form-hint{
  color: rgb(56, 89, 138);
  font-size: 14px;
}
</style>

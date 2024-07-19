<template>
  <v-row v-if="isLoading">
    <v-col>
      <Spinner />
    </v-col>
  </v-row>
  <v-row
    v-else-if="apiError"
    justify="center"
  >
    <v-col>
      <v-alert
        id="api-error-alert"
        density="compact"
        type="error"
        variant="tonal"
        text="There was an error loading the data, please try again."
      />
    </v-col>
  </v-row>
  <v-container
    v-else
    id="resolvedSchoolDuplicates"
    fluid
  >
    <v-row class="mt-3 mb-3 pl-3">
      <v-btn
        id="resolvedEnrollmentDuplicateButton"
        value="1"
        size="large"
        class="duplicate-type-button"
        :class="{ 'active-button': duplicateView === '1' }"
        @click="switchView('1')"
      >
        Resolved Enrollment Duplicates ({{ resolvedDuplicates?.length }})
      </v-btn>
      <v-btn
        id="resolvedProgramDuplicateButton"
        value="2"
        size="large"
        class="duplicate-type-button"
        :class="{ 'active-button': duplicateView === '2' }"
        @click="switchView('2')"
      >
        Resolved Program Duplicates ({{ resolvedProgramDuplicates?.length }})
      </v-btn>
    </v-row>
    <template v-if="duplicateView==='1'">
      <strong>Duplicate Students Found: {{ resolvedDuplicates?.length }}</strong>
      <v-data-iterator
        v-model:page.sync="pageNumber"
        :items="resolvedDuplicates"
        :items-per-page="10"
      >
        <template #default="{ items }">
          <v-row
            v-for="duplicate in items"
            :key="duplicate?.raw?.sdcDuplicateID"
            class="pt-4"
            no-gutters
          >
            <v-col class="pa-0">
              <v-row no-gutters>
                <v-col class="pb-2">
                  <v-chip color="primary">
                    <v-col>
                      Assigned PEN: {{ duplicate?.raw?.sdcSchoolCollectionStudent1Entity?.assignedPen }}
                    </v-col>
                  </v-chip>
                </v-col>
              </v-row>
              <CustomTable
                :headers="IN_DISTRICT_DUPLICATES.resolvedTableHeaders"
                :data="[duplicate?.raw?.sdcSchoolCollectionStudent1Entity, duplicate?.raw?.sdcSchoolCollectionStudent2Entity]"
                :is-loading="false"
                :reset="false"
                :total-elements="2"
                :hide-pagination="true"
                :school-collection="schoolCollectionObject"
              />
            </v-col>
          </v-row>
        </template>
      </v-data-iterator>
      <v-pagination
        v-if="resolvedDuplicates?.length > 0"
        v-model="pageNumber"
        :length="Math.ceil(resolvedDuplicates?.length/10)"
        total-visible="5"
        rounded="circle"
      />
      <v-row
        v-if="resolvedDuplicates?.length === 0"
        class="pt-4"
        no-gutters
      >
        <v-alert
          :id="'enrolled' + 'resolved-alert'"
          density="compact"
          type="info"
          variant="tonal"
          text="There are no resolved enrollment duplicates."
        />
      </v-row>
    </template>
    <template v-else-if="duplicateView==='2'">
      <strong>Duplicate Students Found: {{ resolvedProgramDuplicates?.length }}</strong>
      <v-data-iterator
        v-model:page.sync="pageNumber"
        :items="resolvedProgramDuplicates"
        :items-per-page="10"
      >
        <template #default="{ items }">
          <v-row
            v-for="duplicate in items"
            :key="duplicate?.raw?.sdcDuplicateID"
            class="pt-4"
            no-gutters
          >
            <v-col class="pa-0">
              <v-row no-gutters>
                <v-col class="pb-2">
                  <v-chip color="primary">
                    <v-col>
                      Assigned PEN: {{ duplicate?.raw?.sdcSchoolCollectionStudent1Entity?.assignedPen }}
                    </v-col>
                    <v-col>
                      Duplicate Program: {{ duplicate?.raw?.programDuplicateTypeCodeDescription }}
                    </v-col>
                  </v-chip>
                </v-col>
              </v-row>
              <CustomTable
                :headers="IN_DISTRICT_DUPLICATES.resolvedProgramDuplicateTableHeaders"
                :data="[duplicate?.raw?.sdcSchoolCollectionStudent1Entity, duplicate?.raw?.sdcSchoolCollectionStudent2Entity]"
                :is-loading="false"
                :reset="false"
                :total-elements="2"
                :hide-pagination="true"
                :school-collection="schoolCollectionObject"
              />
            </v-col>
          </v-row>
        </template>
      </v-data-iterator>
      <v-pagination
        v-if="resolvedDuplicates?.length > 0"
        v-model="pageNumber"
        :length="Math.ceil(resolvedDuplicates?.length/10)"
        total-visible="5"
        rounded="circle"
      />
      <v-row
        v-if="resolvedDuplicates?.length === 0"
        class="pt-4"
        no-gutters
      >
        <v-alert
          :id="'program' + 'resolved-alert'"
          density="compact"
          type="info"
          variant="tonal"
          text="There are no resolved program duplicates."
        />
      </v-row>
    </template>
  </v-container>
</template>

<script>
import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';
import {sdcCollectionStore} from '../../../store/modules/sdcCollection';
import CustomTable from '../../common/CustomTable.vue';
import Spinner from '../../common/Spinner.vue';
import {IN_DISTRICT_DUPLICATES} from '../../../utils/sdc/DistrictCollectionTableConfiguration';

export default {
  name: 'ResolvedDuplicates',
  components: {Spinner, CustomTable},
  props: {
    schoolCollectionObject: {
      type: Object,
      required: true,
      default: null
    },
  },
  data() {
    return {
      pageNumber: 1,
      duplicateView: '1',
      isLoading: true,
      apiError: false,
      resolvedDuplicates: [],
      resolvedProgramDuplicates: [],
    };
  },
  computed: {
    IN_DISTRICT_DUPLICATES() {
      return IN_DISTRICT_DUPLICATES;
    },
  },
  async created() {
    sdcCollectionStore().getCodes().then(() => {
      this.duplicateResolutionCodesMap = sdcCollectionStore().getDuplicateResolutionCodesMap();
      this.getSchoolDuplicates();
    });
  },
  methods: {
    switchView(view) {
      this.duplicateView = view;
    },
    getSchoolDuplicates(){
      this.isLoading = true;
      ApiService.apiAxios.get(ApiRoutes.sdc.SDC_SCHOOL_COLLECTION + '/'+ this.$route.params.schoolCollectionID + '/sdc-duplicates')
        .then(response => {
          this.resolvedDuplicates = response.data?.enrollmentDuplicates?.RESOLVED;
          this.resolvedProgramDuplicates = response.data?.programDuplicates?.RESOLVED;
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.isLoading = false;
        });
    },
  }
};
</script>

<style scoped>
.duplicate-type-button {
  border: 1px solid lightgray;
}
.active-button {
  background-color: #003366 !important;
  color: white !important;
  border: 1px solid #003366;
}
</style>


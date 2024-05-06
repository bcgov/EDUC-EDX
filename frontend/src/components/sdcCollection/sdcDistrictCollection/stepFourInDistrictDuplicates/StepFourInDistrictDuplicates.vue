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
  <div
    v-else
    class="border"
  >
    <v-tabs
      v-model="tab"
      color="#38598a"
      show-arrows
    >
      <v-tab
        v-for="name in tabs"
        :key="name"
        class="divider"
        :value="name"
      >
        {{ name }}
      </v-tab>
    </v-tabs>
    <v-row class="mt-3 mb-3 pl-3">
      <v-btn-toggle
        v-model="duplicateView"
        color="#003366"
        rounded="0"
        :divided="true"
      >
        <v-btn
          id="nonAllowableButton"
          value="nonAllowable"
          size="large"
          class="duplicate-type-button"
        >
          Non-Allowable ({{ nonAllowableDuplicates.length }})
        </v-btn>
        <v-btn
          id="allowableButton"
          value="allowable"
          size="large"
          class="duplicate-type-button"
        >
          Allowable ({{ allowableDuplicates.length }})
        </v-btn>
        <v-btn
          id="resolvedButton"
          value="resolved"
          size="large"
          class="duplicate-type-button"
        >
          Resolved ({{ resolvedDuplicates.length }})
        </v-btn>
      </v-btn-toggle>
    </v-row>
    <template v-if="duplicateView==='nonAllowable'">
      <strong>Duplicate Students Found: {{ nonAllowableDuplicates.length }}</strong>
      <v-row
        v-for="duplicate in nonAllowableDuplicates"
        :key="duplicate.sdcDuplicateID"
        class="pt-4"
        no-gutters
      >
        <v-col class="pa-0">
          <v-row no-gutters>
            <v-col class="pb-2">
              <v-chip color="primary">
                <v-col>Assigned PEN: {{ duplicate.sdcSchoolCollectionStudent1Entity.assignedPen }}</v-col>
                <v-col>Error: {{ duplicate.duplicateErrorDescriptionCode }}</v-col>
              </v-chip>
            </v-col>
          </v-row>
          <CustomTable
            :headers="IN_DISTRICT_DUPLICATES.nonAllowableTableHeaders"
            :data="[duplicate?.sdcSchoolCollectionStudent1Entity, duplicate?.sdcSchoolCollectionStudent2Entity]"
            :is-loading="false"
            :reset="false"
            :total-elements="2"
            :hide-pagination="true"
          >
            <template #resolution="{ sdcSchoolCollectionStudent }">
              <v-menu
                v-model="editOptionsOpen[sdcSchoolCollectionStudent.sdcSchoolCollectionStudentID + duplicate.sdcDuplicateID]"
                transition="fab-transition"
                location="end"
                offset="10"
              >
                <template #activator="{ props }">
                  <v-btn
                    :id="'resolveMenuBtn' + sdcSchoolCollectionStudent.sdcSchoolCollectionStudentID"
                    color="primary"
                    icon="mdi-playlist-edit"
                    variant="text"
                    v-bind="props"
                  />
                </template>
                <v-list>
                  <v-list-item v-if="sdcSchoolCollectionStudent.canChangeGrade">
                    <v-icon
                      color="#003366"
                      class="pr-1 mb-1"
                    >
                      mdi-pencil
                    </v-icon>
                    <span class="ml-2">Change Grade</span>
                  </v-list-item>
                  <v-list-item>
                    <v-icon
                      color="#003366"
                      class="pr-1 mb-1"
                    >
                      mdi-check
                    </v-icon>
                    <span class="ml-2">Resolve</span>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </CustomTable>
        </v-col>
      </v-row>
      <v-row
        v-if="nonAllowableDuplicates.length === 0"
        class="pt-4"
        no-gutters
      >
        <v-alert
          id="enrollment-non-allowable-alert"
          density="compact"
          type="success"
          variant="tonal"
          text="Congratulations! There are no non-allowable duplicates."
        />
      </v-row>
    </template>
    <template v-if="duplicateView==='allowable'">
      <strong>Duplicate Students Found: {{ allowableDuplicates.length }}</strong>
      <v-row
        v-for="duplicate in allowableDuplicates"
        :key="duplicate.sdcDuplicateID"
        class="pt-4"
        no-gutters
      >
        <v-col class="pa-0">
          <v-row no-gutters>
            <v-col class="pb-2">
              <v-chip color="primary">
                <v-col>
                  Assigned PEN: {{ duplicate.sdcSchoolCollectionStudent1Entity.assignedPen }}
                </v-col>
              </v-chip>
            </v-col>
          </v-row>
          <CustomTable
            :headers="IN_DISTRICT_DUPLICATES.allowableTableHeaders"
            :data="[duplicate?.sdcSchoolCollectionStudent1Entity, duplicate?.sdcSchoolCollectionStudent2Entity]"
            :is-loading="false"
            :reset="false"
            :total-elements="2"
            :hide-pagination="true"
          />
        </v-col>
      </v-row>
      <v-row
        v-if="allowableDuplicates.length === 0"
        class="pt-4"
        no-gutters
      >
        <v-alert
          id="enrollment-allowable-alert"
          density="compact"
          type="info"
          variant="tonal"
          text="There are no allowable duplicates."
        />
      </v-row>
    </template>
    <template v-if="duplicateView==='resolved'">
      <strong>Duplicate Students Found: {{ resolvedDuplicates.length }}</strong>
      <v-row
        v-for="duplicate in resolvedDuplicates"
        :key="duplicate.sdcDuplicateID"
        class="pt-4"
        no-gutters
      >
        <v-col class="pa-0">
          <v-row no-gutters>
            <v-col class="pb-2">
              <v-chip color="primary">
                <v-col>
                  Assigned PEN: {{ duplicate.sdcSchoolCollectionStudent1Entity.assignedPen }}
                </v-col>
              </v-chip>
            </v-col>
          </v-row>
          <CustomTable
            :headers="IN_DISTRICT_DUPLICATES.resolvedTableHeaders"
            :data="[duplicate?.sdcSchoolCollectionStudent1Entity, duplicate?.sdcSchoolCollectionStudent2Entity]"
            :is-loading="false"
            :reset="false"
            :total-elements="2"
            :hide-pagination="true"
          />
        </v-col>
      </v-row>
      <v-row
        v-if="resolvedDuplicates.length === 0"
        class="pt-4"
        no-gutters
      >
        <v-alert
          id="enrollment-resolved-alert"
          density="compact"
          type="info"
          variant="tonal"
          text="There are no resolved duplicates."
        />
      </v-row>
    </template>
  </div>

  <v-row justify="end">
    <PrimaryButton
      id="step-4-next-button-district"
      class="mr-3 mb-3"
      :disabled="disableNextButton() || apiError"
      icon="mdi-check"
      text="Verify as Correct"
      :click-action="next"
    />
  </v-row>
  <v-row
    v-if="disableNextButton()"
    justify="end"
    class="my-0"
  >
    <p class="form-hint mr-3">
      <span v-if="nonAllowableDuplicates.length > 0">
        {{ nonAllowableDuplicates.length }} enrollment
      </span>
      <span v-if="nonAllowableDuplicates.length > 0 && nonAllowableProgramDuplicates.length > 0">
        and
      </span>
      <span v-if="nonAllowableProgramDuplicates.length > 0">
        {{ nonAllowableProgramDuplicates.length }} program
      </span>
      duplicate(s) unresolved
    </p>
  </v-row>
</template>
<script>
import {defineComponent} from 'vue';
import PrimaryButton from '../../../util/PrimaryButton.vue';
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';
import {setFailureAlert} from '../../../composable/alertComposable';
import CustomTable from '../../../common/CustomTable.vue';
import {IN_DISTRICT_DUPLICATES} from '../../../../utils/sdc/DistrictCollectionTableConfiguration';
import {sdcCollectionStore} from '../../../../store/modules/sdcCollection';
import Spinner from '../../../common/Spinner.vue';
import alertMixin from '../../../../mixins/alertMixin';

export default defineComponent({
  name: 'StepFourInDistrictDuplicates',
  components: {
    Spinner,
    CustomTable,
    PrimaryButton,
  },
  mixins: [alertMixin],
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
      apiError: false,
      editOptionsOpen: [],
      nonAllowableDuplicates: [],
      allowableDuplicates: [],
      resolvedDuplicates: [],
      nonAllowableProgramDuplicates: [],
      allowableProgramDuplicates: [],
      isLoading: true,
      panel: [0],
      programDuplicates: [],
      duplicateView: 'nonAllowable',
      duplicateResolutionCodesMap: null,
      sdcDistrictCollectionID: this.$route.params.sdcDistrictCollectionID,
      tab: null,
      tabs: [
        'Enrollment Duplicates',
        'Program Duplicates'
      ],
    };
  },
  computed: {
    IN_DISTRICT_DUPLICATES() {
      return IN_DISTRICT_DUPLICATES;
    }
  },
  async created() {
    this.duplicateResolutionCodesMap = await sdcCollectionStore().getDuplicateResolutionCodesMap();
    this.getInDistrictDuplicates();
  },
  methods: {
    disableNextButton() {
      return this.nonAllowableDuplicates.length > 0 || this.nonAllowableProgramDuplicates.length > 0;
    },
    getInDistrictDuplicates(){
      this.isLoading = true;
      ApiService.apiAxios.get(ApiRoutes.sdc.SDC_DISTRICT_COLLECTION + '/'+ this.sdcDistrictCollectionID + '/in-district-duplicates').then(response => {
        this.nonAllowableDuplicates = response.data?.enrollmentDuplicates?.NON_ALLOW;
        this.allowableDuplicates = response.data?.enrollmentDuplicates?.ALLOWABLE;
        this.resolvedDuplicates = response.data?.enrollmentDuplicates?.RESOLVED;
        this.programDuplicates = response.data?.programDuplicates;
      }).catch(error => {
        console.error(error);
        this.setFailureAlert(error.response?.data?.message || error.message);
        this.apiError = true;
      }).finally(() => {
        this.isLoading = false;
      });
    },
    markStepAsComplete(){
      let updateCollection = {
        districtCollection: this.districtCollectionObject,
        status: 'D_DUP_VRFD'
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
.duplicate-type-button {
  border: 1px solid lightgray;
}
.form-hint{
  color: rgb(56, 89, 138);
  font-size: 14px;
}
</style>

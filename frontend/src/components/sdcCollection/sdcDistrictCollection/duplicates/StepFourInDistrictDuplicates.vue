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
        {{ name }} {{ name === 'Enrolment Duplicates' ? '(' + nonAllowableDuplicates.length + ')': '(' + nonAllowableProgramDuplicates.length + ')' }}
      </v-tab>
    </v-tabs>
    <v-window v-model="tab">
      <v-window-item
        value="Enrolment Duplicates"
        transition="false"
        reverse-transition="false"
      >
        <DuplicateTab
          v-if="tab==='Enrolment Duplicates'"
          duplicate-type="enrollment"
          duplicate-level="DISTRICT"
          :headers-config="IN_DISTRICT_DUPLICATES"
          :non-allowable-duplicates="nonAllowableDuplicates"
          :can-resolve-duplicates="hasEditPermission"
          @refresh-duplicates="getInDistrictDuplicates()"
        />
      </v-window-item>
      <v-window-item
        value="Program Duplicates"
        transition="false"
        reverse-transition="false"
      >
        <DuplicateTab
          v-if="tab==='Program Duplicates'"
          duplicate-type="program"
          duplicate-level="DISTRICT"
          :headers-config="IN_DISTRICT_DUPLICATES"
          :non-allowable-duplicates="nonAllowableProgramDuplicates"
          :can-resolve-duplicates="hasEditPermission"
          @refresh-duplicates="getInDistrictDuplicates()"
        />
      </v-window-item>
    </v-window>
  </div>

  <v-row justify="end">
    <PrimaryButton
      id="step-4-next-button-district"
      class="mr-3 mb-3"
      :disabled="disableNextButton() || apiError || !canMoveForward()"
      icon="mdi-check"
      text="Next"
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
        {{ nonAllowableDuplicates.length }} enrolment
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
import {IN_DISTRICT_DUPLICATES} from '../../../../utils/sdc/DistrictCollectionTableConfiguration';
import {sdcCollectionStore} from '../../../../store/modules/sdcCollection';
import Spinner from '../../../common/Spinner.vue';
import alertMixin from '../../../../mixins/alertMixin';
import DuplicateTab from '../../../common/DuplicateTab.vue';
import {mapState} from 'pinia';
import {authStore} from '../../../../store/modules/auth';
import {PERMISSION} from '../../../../utils/constants/Permission';

export default defineComponent({
  name: 'StepFourInDistrictDuplicates',
  components: {
    DuplicateTab,
    Spinner,
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
      nonAllowableProgramDuplicates: [],
      resolvedProgramDuplicates: [],
      isLoading: true,
      panel: [0],
      duplicateView: 'nonAllowable',
      programDuplicateView: 'nonAllowableProgram',
      sdcDistrictCollectionID: this.$route.params.sdcDistrictCollectionID,
      tab: null,
      tabs: [
        'Enrolment Duplicates',
        'Program Duplicates'
      ],
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    IN_DISTRICT_DUPLICATES() {
      return IN_DISTRICT_DUPLICATES;
    },
    hasEditPermission(){
      return (this.userInfo?.activeInstitutePermissions?.filter(perm => perm === PERMISSION.DISTRICT_SDC_EDIT).length > 0);
    },
  },
  async created() {
    sdcCollectionStore().getCodes().then(() => {
      this.getInDistrictDuplicates();
    });
  },
  methods: {
    canMoveForward(){
      return this.isStepComplete || this.hasEditPermission;
    },
    disableNextButton() {
      return this.nonAllowableDuplicates.length > 0 || this.nonAllowableProgramDuplicates.length > 0;
    },
    getInDistrictDuplicates(){
      this.isLoading = true;
      ApiService.apiAxios.get(ApiRoutes.sdc.SDC_DISTRICT_COLLECTION + '/'+ this.sdcDistrictCollectionID + '/in-district-duplicates').then(response => {
        this.nonAllowableDuplicates = response.data?.enrollmentDuplicates?.NON_ALLOW;
        this.nonAllowableProgramDuplicates = response.data?.programDuplicates?.NON_ALLOW;
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
      if(this.isStepComplete || this.districtCollectionObject.sdcDistrictCollectionStatusCode === 'SUBMITTED') {
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
.form-hint{
  color: rgb(56, 89, 138);
  font-size: 14px;
}
</style>

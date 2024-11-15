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
    <v-window v-model="tab">
      <v-window-item
        value="Enrolment Duplicates"
        transition="false"
        reverse-transition="false"
      >
        <DuplicateTab
          v-if="tab==='Enrolment Duplicates'"
          duplicate-type="enrollment"
          duplicate-level="PROVINCIAL"
          :headers-config="PROVINCIAL_DUPLICATES"
          :non-allowable-duplicates="nonAllowableDuplicates"
          :can-resolve-duplicates="schoolCollectionObject.sdcSchoolCollectionStatusCode === 'P_DUP_POST' && hasEditPermission()"
          @refresh-duplicates="getProvincialDuplicates()"
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
          duplicate-level="PROVINCIAL"
          :headers-config="PROVINCIAL_DUPLICATES"
          :non-allowable-duplicates="nonAllowableProgramDuplicates"
          :can-resolve-duplicates="false"
          @refresh-duplicates="getProvincialDuplicates()"
        />
      </v-window-item>
    </v-window>
  </div>

  <v-row justify="end">
    <PrimaryButton
      id="step-4-next-button-district"
      class="mr-3 mb-3"
      :disabled="disableNextButton() || apiError || !hasEditPermission()"
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
import PrimaryButton from '../../util/PrimaryButton.vue';
import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';
import {setFailureAlert} from '../../composable/alertComposable';
import {SCHOOL_PROVINCIAL_DUPLICATES} from '../../../utils/sdc/DistrictCollectionTableConfiguration';
import {sdcCollectionStore} from '../../../store/modules/sdcCollection';
import Spinner from '../../common/Spinner.vue';
import alertMixin from '../../../mixins/alertMixin';
import DuplicateTab from '../../common/DuplicateTab.vue';
import {PERMISSION} from '../../../utils/constants/Permission';
import {mapState} from 'pinia';
import {authStore} from '../../../store/modules/auth';

export default defineComponent({
  name: 'ProvincialDuplicatesStep',
  components: {
    DuplicateTab,
    Spinner,
    PrimaryButton,
  },
  mixins: [alertMixin],
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
  emits: ['next', 'refresh-store'],
  data() {
    return {
      apiError: false,
      editOptionsOpen: [],
      nonAllowableDuplicates: [],
      nonAllowableProgramDuplicates: [],
      isLoading: true,
      panel: [0],
      duplicateView: 'nonAllowable',
      programDuplicateView: 'nonAllowableProgram',
      tab: null,
      tabs: [
        'Enrolment Duplicates',
        'Program Duplicates'
      ],
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    PROVINCIAL_DUPLICATES() {
      return SCHOOL_PROVINCIAL_DUPLICATES;
    }
  },
  async created() {
    sdcCollectionStore().getCodes().then(() => {
      this.getProvincialDuplicates();
    });
  },
  methods: {
    hasEditPermission(){
      return (this.userInfo?.activeInstitutePermissions?.filter(perm => perm === PERMISSION.SCHOOL_SDC_EDIT).length > 0);
    },
    disableNextButton() {
      return this.nonAllowableDuplicates.length > 0 || this.nonAllowableProgramDuplicates.length > 0;
    },
    getProvincialDuplicates(){
      this.isLoading = true;
      ApiService.apiAxios.get(ApiRoutes.sdc.SDC_SCHOOL_COLLECTION + '/'+ this.$route.params.schoolCollectionID + '/provincial-duplicates').then(response => {
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
    markSchoolStepAsComplete(){
      let updateCollection = {
        schoolCollection: this.schoolCollectionObject,
        status: 'COMPLETED'
      };
      ApiService.apiAxios.put(`${ApiRoutes.sdc.BASE_URL}/${this.$route.params.schoolCollectionID}`, updateCollection)
        .then(() => {
          this.$emit('refresh-store');
        })
        .catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while updating status. Please try again later.');
        });
    },
    next() {
      this.markSchoolStepAsComplete();
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

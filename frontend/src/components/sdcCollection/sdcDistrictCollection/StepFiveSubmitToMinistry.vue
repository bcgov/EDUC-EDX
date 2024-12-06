<template>
  <div class="border">
    <div v-if="isLoading">
      <v-row>
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
    </div>
    <div v-else>
      <div
        v-if="!isSubmitted"
        style="display: flex; flex-direction: column; gap: 2rem;"
      >
        <div>
          <span>You are about to submit your district's 1701 data to the Ministry. <span style="font-weight: bold">Once this is completed, you will lose the ability to edit the 1701 data for your district.</span></span>
        </div>
        <div>
          <span>Please ensure your data is correct before completing the submission. Data can be reviewed on the "Edit/Verify Data" step.</span>
        </div>
        <div>
          <span>All FTE Values, Program Headcounts, and Program Eligibility are estimated results and still require a final review from the ministry staff.</span>
        </div>
      </div>
      <div v-else>
        <v-alert
          id="collection-submission"
          class="justify-start mb-3"
          type="success"
          variant="tonal"
          text="Congratulations! The 1701 data has been submitted."
        />

        <StepThreeVerifyData
          :district-collection-object="districtCollectionObject"
          :is-final-sign-off="true"
          :is-collection-active="isCollectionActive"
        />
      </div>
    </div>
  </div>

  <v-row justify="end">
    <PrimaryButton
      v-if="!displayNextBtn "
      id="step-5-submit-data-button"
      class="mr-3 mb-3"
      icon="mdi-check"
      text="Submit 1701 Data to Ministry"
      :disabled="isSubmitted || !hasEditPermission"
      :click-action="submit"
    />
    <PrimaryButton
      v-else-if="districtCollectionObject?.collectionTypeCode !== 'JULY'"
      id="step-5-submit-data-button"
      class="mr-3 mb-3"
      icon="mdi-check"
      text="Next"
      :disabled="!canMoveForward()"
      :click-action="next"
    />
  </v-row>
</template>

<script>
import alertMixin from '../../../mixins/alertMixin';
import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';
import {setFailureAlert} from '../../composable/alertComposable';
import PrimaryButton from '../../util/PrimaryButton.vue';
import {sdcCollectionStore} from '../../../store/modules/sdcCollection';
import {mapState} from 'pinia';
import {authStore} from '../../../store/modules/auth';
import {PERMISSION} from '../../../utils/constants/Permission';
import StepThreeVerifyData from './stepThreeVerifyData/StepThreeVerifyData.vue';

export default {
  name: 'StepFiveSubmitToMinistry',
  components: {
    PrimaryButton,
    StepThreeVerifyData
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
    },
    isCollectionActive: {
      type: Boolean,
      required: true
    }
  },
  emits: ['previous', 'next', 'refresh'],
  data() {
    return {
      afterSubmittedStatuses: ['P_DUP_POST', 'P_DUP_VRFD', 'COMPLETED'],
      isSubmitted: false,
      isLoading: true,
      sdcDistrictCollectionID: this.$route.params.sdcDistrictCollectionID,
      submittedStatuses: ['SUBMITTED', 'P_DUP_POST', 'P_DUP_VRFD', 'COMPLETED']
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    displayNextBtn() {
      return this.afterSubmittedStatuses.includes(this.districtCollectionObject?.sdcDistrictCollectionStatusCode);
    },
    hasEditPermission(){
      return (this.userInfo?.activeInstitutePermissions?.filter(perm => perm === PERMISSION.DISTRICT_SDC_EDIT).length > 0);
    }
  },
  mounted() {
    sdcCollectionStore().getDistrictCollection(this.$route.params.sdcDistrictCollectionID).finally(() => {
      this.isSubmitted = this.submittedStatuses.includes(this.districtCollectionObject.sdcDistrictCollectionStatusCode);
      this.isLoading = !this.isLoading;
    });
  },
  methods: {
    canMoveForward(){
      return this.isStepComplete || this.hasEditPermission;
    },
    submit() {
      if(this.districtCollectionObject?.collectionTypeCode === 'JULY') {
        this.markStepAsComplete('COMPLETED');
      } else {
        this.markStepAsComplete('SUBMITTED');
      }
    },
    markStepAsComplete(status){
      this.isLoading = true;
      let updateCollection = {
        districtCollection: this.districtCollectionObject,
        status: status
      };
      ApiService.apiAxios.put(`${ApiRoutes.sdc.SDC_DISTRICT_COLLECTION}/${this.$route.params.sdcDistrictCollectionID}`, updateCollection)
        .then(() => {
          this.isSubmitted = true;          
        })
        .catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while updating status. Please try again later.');
        })
        .finally(() => {
          this.isLoading = false;
          this.$emit('refresh');
        });
    },
    next() {
      this.$emit('next');
    },
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

</style>

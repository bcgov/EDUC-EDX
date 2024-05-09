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
          class="justify-center"
          type="success"
          variant="tonal"
          text="Congratulations! The 1701 data has been submitted."
        />
      </div>
    </div>
  </div>

  <v-row justify="end">
    <PrimaryButton
      id="step-5-submit-data-button"
      class="mr-3 mb-3"
      icon="mdi-check"
      text="Submit 1701 Data to Ministry"
      :disabled="isSubmitted"
      :click-action="submit"
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

export default {
  name: 'StepFiveSubmitToMinistry',
  components: {
    PrimaryButton
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
  emits: ['previous'],
  data() {
    return {
      isSubmitted: false,
      isLoading: true,
      sdcDistrictCollectionID: this.$route.params.sdcDistrictCollectionID
    };
  },
  mounted() {
    sdcCollectionStore().getDistrictCollection(this.$route.params.sdcDistrictCollectionID).finally(() => {
      this.isSubmitted = this.districtCollectionObject.sdcDistrictCollectionStatusCode === 'SUBMITTED';
      this.isLoading = !this.isLoading;
    });
  },
  methods: {
    submit() {
      if(this.districtCollectionObject?.sdcDistrictCollectionStatusCode !== 'SUBMITTED') {
        this.markStepAsComplete();
      }
    },
    markStepAsComplete(){
      this.isLoading = true;
      let updateCollection = {
        districtCollection: this.districtCollectionObject,
        status: 'SUBMITTED'
      };
      ApiService.apiAxios.put(`${ApiRoutes.sdc.SDC_DISTRICT_COLLECTION}/${this.$route.params.sdcDistrictCollectionID}`, updateCollection)
        .then(() => {
          this.isSubmitted = true;
        })
        .catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while updating status. Please try again later.');
        }).finally(() => {
          this.isLoading = !this.isLoading;
        });
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

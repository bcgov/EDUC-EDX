<template>
  <div
    class="border"
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

  <v-row justify="end">
    <PrimaryButton
      id="step-5-submit-data-button"
      class="mr-3 mb-3"
      icon="mdi-check"
      text="Submit 1701 Data to Ministry"
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
  emits: ['next', 'previous'],
  data() {
    return {
    };
  },
  computed: {
  },
  created() {

  },
  methods: {
    markStepAsComplete(){
      let updateCollection = {
        districtCollection: this.districtCollectionObject,
        status: 'VERIFIED'
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
};
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

.divider {
  border-right: 1px solid lightgray;
  border-radius: 0px;
}

.divider:last-child  {
  border-right: 0
}
</style>

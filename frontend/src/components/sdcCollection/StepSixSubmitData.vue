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
      <v-row v-if="!isSubmitted">
      <v-col cols="12" v-if="getSchoolCategory() === 'INDP_FNS' || getSchoolCategory() === 'INDEPEND'">
        <p>
          You are about to submit your school’s 1701 data to the Ministry. <b>Once this is completed, you will lose the ability to edit the 1701 data for your school</b> 
          and all data changes will need to go through the Ministry.
        </p>
        <br>
        <p>
          Please ensure your data is correct before completing the submission. Data can be reviewed on the “Edit/Verify Data Issues” step.
        </p>
      </v-col>
      <v-col cols="12" v-else>
        <p>
          You are about to submit your school’s 1701 data to your district. <b>Once this is completed, you will lose the ability to edit the 1701 data for your school</b> 
          and all data changes will need to go through your district.
        </p>
        <br>
        <p>
          Please ensure your data is correct before completing the submission. Data can be reviewed on the “Edit/Verify Data Issues” step.
        </p>
      </v-col>

      <br>
      <v-alert
            density="compact"
            type="info"
            variant="tonal"
            text="All FTE Values, Program Headcounts, and Program Eligibility are estimated results and still require a final review from the ministry staff."
      />
    </v-row>

    <v-row v-else>
      <v-alert
            density="compact"
            type="success"
            variant="tonal"
            text="Congratulations! The 1701 data has been submitted."
      />
      <v-col cols="12" v-if="getSchoolCategory() === 'INDP_FNS' || getSchoolCategory() === 'INDEPEND'">
        <p>
          Any additional changes to 1701 must be coordinated through the Ministry.
        </p>
      </v-col>
      <v-col cols="12" v-else>
        <p>
          Any additional changes to 1701 must be coordinated through your district.
        </p>
      </v-col>
    </v-row>
    </div>

  </div>

  <v-row justify="end">
    <PrimaryButton
      id="step-4-next-button-school"
      class="mr-3 mb-3"
      icon="mdi-check"
      :disabled="isSubmitted"
      :text="getButtonText()"
      :click-action="next"
    />
  </v-row>
</template>
  
<script>
import alertMixin from '../../mixins/alertMixin';
import PrimaryButton from '../util/PrimaryButton.vue';
import { mapState } from 'pinia';
import { sdcCollectionStore } from '../../store/modules/sdcCollection';
import { appStore } from '../../store/modules/app';
import ApiService from '../../common/apiService';
import { ApiRoutes } from '../../utils/constants';

export default {
  name: 'StepSixSubmitData',
  components: {
    PrimaryButton
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
  emits: ['previous'],
  data() {
    return {
      sdcSchoolCollectionID: this.$route.params.schoolCollectionID,
      school: {},
      isSubmitted: false,
      isLoading: true
    };
  },
  computed: {
    ...mapState(sdcCollectionStore, ['currentStepInCollectionProcess', 'schoolCollection']),
    ...mapState(appStore, ['activeSchoolsMap']),
  },
  mounted() {
    sdcCollectionStore().getSchoolCollection(this.$route.params.schoolCollectionID).finally(() => {
      this.isSubmitted = this.schoolCollection.sdcSchoolCollectionStatusCode === 'SUBMITTED';
      this.isLoading = !this.isLoading;
    });
  },
  created() {
    appStore().getInstitutesData().finally(() => {
      this.school = this.activeSchoolsMap.get(this.schoolCollectionObject.schoolID);
    });
  },
  methods: {
    next() {
      if(this.schoolCollectionObject?.sdcSchoolCollectionStatusCode !== 'SUBMITTED') {
        this.markStepAsComplete();
      }
    },
    markStepAsComplete() {
      this.isLoading = true;
      let updateCollection = {
        schoolCollection: this.schoolCollectionObject,
        status: 'SUBMITTED'
      };
      ApiService.apiAxios.put(ApiRoutes.sdc.BASE_URL + '/' + this.sdcSchoolCollectionID, updateCollection)
        .then(() => {
          this.isSubmitted = true;
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while verifying school details. Please try again later.');
        })
        .finally(() => {
          this.isLoading = !this.isLoading;
        });    
    },
    getSchoolCategory() {
      return this.school.schoolCategoryCode;
    },
    getButtonText() {
      if(this.getSchoolCategory() === 'INDP_FNS' || this.getSchoolCategory() === 'INDEPEND') {
        return 'Submit 1701 Data to Ministry';
      } else {
        return 'Submit 1701 Data to District';
      }
    }
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

  .error-message {
    text-align: end;
   }

</style>
    
    
  

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
      <v-row
        v-if="!isSubmitted && isCollectionActive"
        class="mb-4"
      >
        <v-col
          v-if="getSchoolCategory() === 'INDP_FNS' || getSchoolCategory() === 'INDEPEND'"
          cols="12"
        >
          <p>
            You are about to submit your school’s 1701 data to the Ministry. <b>Once this is completed, you will lose the ability to edit the 1701 data for your school</b> 
            and all data changes will need to go through the Ministry.
          </p>
          <br>
          <p>
            Please ensure your data is correct before completing the submission. Data can be reviewed on the “Edit/Verify Data Issues” step.
          </p>
        </v-col>
        <v-col
          v-else
          cols="12"
        >
          <p>
            You are about to submit your school’s 1701 data to your district. <b>Once this is completed, you will lose the ability to edit the 1701 data for your school</b> 
            and all data changes will need to go through your district.
          </p>
          <br>
          <p>
            Please ensure your data is correct before completing the submission. Data can be reviewed on the “Edit/Verify Data Issues” step.
          </p>
        </v-col>
      </v-row>

      <v-row v-else-if="isCollectionActive">
        <v-col class="mb-1">
          <v-alert
            id="collection-submission"
            density="compact"
            type="success"
            variant="tonal"
            :text=" getSchoolCategory() === 'INDP_FNS' || getSchoolCategory() === 'INDEPEND' ? 'Congratulations! The 1701 data has been submitted. Any additional changes to 1701 must be coordinated through the Ministry.' : 'Congratulations! The 1701 data has been submitted. Any additional changes to 1701 must be coordinated through your district.'"
          />
        </v-col>
      </v-row>
      <StepThreeVerifyData
        :school-collection-object="schoolCollectionObject"
        :is-step-complete="true"
        :is-final-sign-off="true"
        :is-collection-active="isCollectionActive"
        :show-final-submission-tabs="showFinalSubmissionTabs"
      />
    </div>
    <v-alert
      v-if="!isSubmitted && !isLoading"
      id="fte-info"
      density="compact"
      type="info"
      variant="tonal"
      text="All FTE Values, Program Headcounts, and Program Eligibility are estimated results and still require a final review from the ministry staff."
    />
  </div>

  <v-row
    v-if="isCollectionActive"
    justify="end"
  >
    <PrimaryButton
      v-if="!displayNextBtn && !isSubmitted "
      id="step-4-next-button-school"
      class="mr-3 mb-3"
      icon="mdi-check"
      :disabled="isSubmitted || !hasEditPermission"
      :text="getButtonText()"
      :click-action="submit"
    />
    <PrimaryButton
      v-else-if="!isSubmitted && schoolCollectionObject.collectionTypeCode !== 'JULY'"
      id="step-4-next-button-school"
      class="mr-3 mb-3"
      icon="mdi-check"
      text="Next"
      :click-action="next"
    />
  </v-row>
</template>
  
<script>
import alertMixin from '../../../mixins/alertMixin';
import PrimaryButton from '../../util/PrimaryButton.vue';
import { mapState } from 'pinia';
import { sdcCollectionStore } from '../../../store/modules/sdcCollection';
import { appStore } from '../../../store/modules/app';
import ApiService from '../../../common/apiService';
import { ApiRoutes } from '../../../utils/constants';
import {authStore} from '../../../store/modules/auth';
import {PERMISSION} from '../../../utils/constants/Permission';
import StepThreeVerifyData from './stepThreeVerifyData/StepThreeVerifyData.vue';

export default {
  name: 'StepSevenSubmitData',
  components: {
    PrimaryButton,
    StepThreeVerifyData
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
    },
    isCollectionActive: {
      type: Boolean,
      required: true
    },
    showFinalSubmissionTabs: {
      type: Boolean,
      default: false
    }
  },
  emits: ['previous', 'next', 'refresh-store'],
  data() {
    return {
      sdcSchoolCollectionID: this.$route.params.schoolCollectionID,
      school: {},
      isSubmitted: false,
      isLoading: true,
      submittedStatuses: ['SUBMITTED', 'P_DUP_POST', 'P_DUP_VRFD', 'COMPLETED'],
      afterSubmittedStatuses: ['P_DUP_POST', 'P_DUP_VRFD', 'COMPLETED'],
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(sdcCollectionStore, ['currentStepInCollectionProcess', 'schoolCollection']),
    ...mapState(appStore, ['activeSchoolsMap']),
    displayNextBtn() {
      return this.afterSubmittedStatuses.includes(this.schoolCollectionObject?.sdcSchoolCollectionStatusCode);
    },
    hasEditPermission(){
      return (this.userInfo?.activeInstitutePermissions?.filter(perm => perm === PERMISSION.SCHOOL_SDC_EDIT).length > 0);
    },
  },
  mounted() {
    sdcCollectionStore().getSchoolCollection(this.$route.params.schoolCollectionID).finally(() => {
      this.isSubmitted = this.submittedStatuses.includes(this.schoolCollection.sdcSchoolCollectionStatusCode);
      this.isLoading = !this.isLoading;

    });
  },
  created() {
    appStore().getInstitutesData().finally(() => {
      this.school = this.activeSchoolsMap.get(this.schoolCollectionObject.schoolID);
    });
  },
  methods: {
    submit() {
      if(this.schoolCollectionObject?.collectionTypeCode === 'JULY') {
        this.markStepAsComplete('COMPLETED');
      } else {
        this.markStepAsComplete('SUBMITTED');
      }
    },
    markStepAsComplete(status) {
      this.isLoading = true;
      let updateCollection = {
        schoolCollection: this.schoolCollectionObject,
        status: status
      };
      ApiService.apiAxios.put(ApiRoutes.sdc.BASE_URL + '/' + this.sdcSchoolCollectionID, updateCollection)
        .then(() => {
          this.$emit('refresh-store');
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
    },
    next() {
      this.$emit('next');
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

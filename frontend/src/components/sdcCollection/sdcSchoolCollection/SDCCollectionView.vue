<template>
  <v-container
    class="containerSetup"
    :fluid="true"
  >
    <v-row
      no-gutters
      class="mt-1 d-flex justify-start"
    >
      <v-col v-if="userInfo.activeInstituteType === 'DISTRICT'">
        <h2>{{ sdcSchoolSchool?.schoolName }} ({{ sdcSchoolSchool?.mincode }})</h2>
        <h3 id="collectionTypeYear">
          {{ currentCollectionTypeCode }} {{ currentCollectionYear }} Collection
        </h3>
      </v-col>
      <v-col v-else>
        <h2 id="collectionTypeYear">
          {{ currentCollectionTypeCode }} {{ currentCollectionYear }} Collection
        </h2>
      </v-col>
    </v-row>
    <v-row
      class="mt-2"
      no-gutters
    >
      <v-col>
        <v-divider class="divider mb-6" />
      </v-col>
    </v-row>
    <v-row
      v-if="isLoading"
      class="mt-0"
    >
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
    <v-row
      v-else-if="isSdcSchoolCollectionActive"
      no-gutters
      class="mt-0"
    >
      <v-col class="pt-0">
        <v-stepper
          ref="stepper"
          hide-actions
          non-linear
          :model-value="currentStep"
          :elevation="0"
          :alt-labels="$vuetify.display.lgAndDown"
          @update:model-value="updateCurrentStep"
        >
          <template #default>
            <v-stepper-header 
              v-show="!isStepperHidden"
            >
              <template
                v-for="step in compiledSdcSteps()"
                :key="step.step"
              >
                <v-stepper-item
                  :id="step.id"
                  :value="step.step"
                  :title="step.title"
                  :subtitle="step.showSubmissionDate ? submissionDueDate : null"
                  :editable="step.step < currentStep && !submittedStatuses.includes(schoolCollection?.sdcSchoolCollectionStatusCode)"
                  :complete="step.index < stepInCollection"
                  :color="'rgba(56, 89, 138, 1)'"
                />
                <v-divider
                  v-if="step.step < compiledSdcSteps().length"
                  :class="{'step-previous-divider': step.step < currentStep}"
                  :thickness="step.step < currentStep ? 5 : 0"
                  :color="'rgba(56, 89, 138, 1)'"
                />
              </template>
            </v-stepper-header>
            <v-stepper-window v-if="schoolCollectionObject?.sdcDistrictCollectionID === null && schoolCollectionObject?.collectionTypeCode === 'JULY'">
              <IndySummerSchoolSteps
                :is-sdc-school-collection-active="isSdcSchoolCollectionActive"
                :is-step-complete="isStepComplete"
                :school-collection-object="schoolCollectionObject"
                @next="next"
                @refresh-store="refreshStore"
              />
            </v-stepper-window>
            <v-stepper-window v-else-if="schoolCollectionObject?.sdcDistrictCollectionID === null">
              <IndySchoolSteps
                :is-sdc-school-collection-active="isSdcSchoolCollectionActive"
                :is-step-complete="isStepComplete"
                :school-collection-object="schoolCollectionObject"
                @next="next"
                @refresh-store="refreshStore"
              />
            </v-stepper-window>
            <v-stepper-window
              v-else-if="schoolCollectionObject?.collectionTypeCode === 'JULY'"
            >
              <SummerSchoolSteps
                :is-sdc-school-collection-active="isSdcSchoolCollectionActive"
                :is-step-complete="isStepComplete"
                :school-collection-object="schoolCollectionObject"
                @next="next"
                @refresh-store="refreshStore"
              />
            </v-stepper-window>
            <v-stepper-window
              v-else
            >
              <SchoolSteps
                :is-sdc-school-collection-active="isSdcSchoolCollectionActive"
                :is-step-complete="isStepComplete"
                :school-collection-object="schoolCollectionObject"
                @next="next"
                @refresh-store="refreshStore"
              />
            </v-stepper-window>
          </template>
        </v-stepper>
      </v-col>
    </v-row>
    <StepSevenSubmitData
      v-else
      :is-step-complete="true"
      :school-collection-object="schoolCollectionObject"
      :is-collection-active="isSdcSchoolCollectionActive"
      @refresh-store="refreshStore"
      @next="next"
    />
    <div v-if="disableScreen">
      <v-overlay
        :model-value="disableScreen"
        activator="parent"
        class="align-center justify-center"
        :persistent="true"
      >
        <v-row>
          <v-col>
            <v-alert
              density="compact"
              type="warning"
              title="File Re-uploaded!"
              :text="wsNotificationText"
              class="pb-5 pt-5"
            />
          </v-col>
        </v-row>
      </v-overlay>
    </div>
  </v-container>
</template>

<script>
import {mapActions, mapState} from 'pinia';
import { sdcCollectionStore } from '../../../store/modules/sdcCollection';
import {SDC_STEPS_SCHOOL, SDC_STEPS_INDP_SCHOOL, SDC_STEPS_SUMMER_SCHOOL, SDC_STEPS_SUMMER_INDP_SCHOOL} from '../../../utils/sdc/SdcSteps';
import {wsNotifications} from '../../../store/modules/wsNotifications';
import StepSevenSubmitData from './StepSevenSubmitData.vue';
import {authStore} from '../../../store/modules/auth';
import {appStore} from '../../../store/modules/app';
import {formatSubmissionDate} from '../../../utils/format';
import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';
import IndySchoolSteps from './steppers/IndySchoolSteps.vue';
import IndySummerSchoolSteps from './steppers/IndySummerSchoolSteps.vue';
import SummerSchoolSteps from './steppers/SummerSchoolSteps.vue';
import SchoolSteps from './steppers/SchoolSteps.vue';

export default {
  name: 'SDCCollectionView',
  components: {
    IndySchoolSteps,
    IndySummerSchoolSteps,
    SchoolSteps,
    SummerSchoolSteps,
    StepSevenSubmitData
  },
  props: {
    schoolCollectionID: {
      type: String,
      required: true,
      default: null
    }
  },
  data() {
    return {
      currentStep: 0,
      steps: [],
      isStepperHidden:false,
      registerNextEvent: false,
      schoolCollectionObject: {},
      submissionDueDate: null,
      isLoading: false,
      schoolID: null,
      school: {},
      disableScreen: false,
      wsNotificationText: '',
      schoolsMap: null,
      submittedStatuses: ['SUBMITTED', 'P_DUP_POST', 'P_DUP_VRFD', 'COMPLETED'],
      isSdcSchoolCollectionActive: false
    };
  },
  computed: {
    ...mapState(sdcCollectionStore, ['currentCollectionTypeCode', 'schoolCollection','currentCollectionYear']),
    ...mapState(appStore, ['activeSchoolsMap']),
    ...mapState(authStore, ['userInfo']),
    ...mapState(wsNotifications, ['notification']),
    stepInCollection() {
      return this.getIndexOfSDCCollectionByStatusCode(this.schoolCollection?.sdcSchoolCollectionStatusCode);
    },
    isStepComplete() {
      let indexCurrentCollection = this.getStepOfSDCCollectionByStatusCode(this.schoolCollection?.sdcSchoolCollectionStatusCode);
      return this.currentStep < indexCurrentCollection;
    },
    sdcSchoolSchool() {
      if (!this.schoolID) {
        return null;
      }
      return this.activeSchoolsMap.get(this.schoolID);
    }
  },
  watch: {
    notification(notificationData) {
      if (notificationData) {
        try {
          let updateUser = notificationData.updateUser.split('/');
          if (notificationData.sdcSchoolCollectionID === this.$route.params.schoolCollectionID && updateUser[1] !== this.userInfo.edxUserID) {
            let school = this.schoolsMap.get(notificationData?.schoolID);
            this.wsNotificationText = `Another user triggered file upload for school: ${school?.mincode} - ${school?.schoolName}. Please refresh your screen and try again.`;
            this.disableScreen = true;
          }
        } catch (e) {
          console.error(e);
        }
      }
    },
  },
  async created() {
    this.isLoading = !this.isLoading;
    appStore().getInstitutesData().finally(() => {
      this.schoolsMap = this.activeSchoolsMap;
    });
    await sdcCollectionStore().getSchoolCollection(this.$route.params.schoolCollectionID)
      .then(() => {
        this.schoolCollectionObject = this.schoolCollection;
        this.schoolID = this.schoolCollection.schoolID;
        this.currentStep = this.getStepOfSDCCollectionByStatusCode(this.schoolCollection?.sdcSchoolCollectionStatusCode);
        this.hideStepperWhenComplete();
    
      })
      .finally(() => {
        this.isLoading = !this.isLoading;
      });
    this.getActiveSdcSchoolCollection();
  },
  methods: {
    ...mapActions(sdcCollectionStore, ['setCurrentCollectionSubmissionDueDate']),
    compiledSdcSteps() {
      if(this.schoolCollectionObject.sdcDistrictCollectionID != null){
        return this.schoolCollectionObject.collectionTypeCode === 'JULY' ? SDC_STEPS_SUMMER_SCHOOL : SDC_STEPS_SCHOOL;
      } else {
        return this.schoolCollectionObject.collectionTypeCode === 'JULY' ? SDC_STEPS_SUMMER_INDP_SCHOOL : SDC_STEPS_INDP_SCHOOL;
      }
    },
    hideStepperWhenComplete(){
      if (this.schoolCollection) {
        this.isStepperHidden = this.schoolCollection.sdcSchoolCollectionStatusCode === 'COMPLETED';
      }
    },
    next() {
      this.checkIfWeNeedToUpdateSchoolCollection(this.currentStep);
      this.$refs.stepper.next();
    },
    checkIfWeNeedToUpdateSchoolCollection(index) {
      this.refreshStore(true);
      if (index < this.getStepOfSDCCollectionByStatusCode(this.schoolCollection?.sdcSchoolCollectionStatusCode)) {
        return;
      }
      sdcCollectionStore().getSchoolCollection(this.$route.params.schoolCollectionID);
    },
    refreshStore(skipGetIndexOfSDCCollectionByStatusCode = false) {
      this.isLoading = !this.isLoading;
      sdcCollectionStore().getSchoolCollection(this.$route.params.schoolCollectionID).finally(() => {
        this.schoolCollectionObject = this.schoolCollection;
        this.schoolID = this.schoolCollection.schoolID;
        if (!skipGetIndexOfSDCCollectionByStatusCode) {
          this.currentStep = this.getStepOfSDCCollectionByStatusCode(this.schoolCollection?.sdcSchoolCollectionStatusCode);
          this.hideStepperWhenComplete();
        }
        this.isLoading = !this.isLoading;
      });
    },
    backToCollectionDashboard() {
      this.$router.push({name: 'sdcCollectionSummary', params: {schoolID: this.schoolID}});
    },
    updateCurrentStep(step) {
      if (step < this.currentStep) {
        this.refreshStore(true);
      }
      this.currentStep = step;
      this.hideStepperWhenComplete();
    },
    getIndexOfSDCCollectionByStatusCode(sdcSchoolCollectionStatusCode) {
      return this.compiledSdcSteps().find(step => step.sdcSchoolCollectionStatusCode?.includes(sdcSchoolCollectionStatusCode))?.index;
    },
    getStepOfSDCCollectionByStatusCode(sdcSchoolCollectionStatusCode) {
      return this.compiledSdcSteps().find(step => step.sdcSchoolCollectionStatusCode?.includes(sdcSchoolCollectionStatusCode))?.step;
    },
    getActiveSdcSchoolCollection() {
      this.isLoading = true;
      ApiService.apiAxios.get(ApiRoutes.sdc.SDC_COLLECTION_BY_SCHOOL_ID + `/${this.schoolID}`).then(response => {
        if(response.data) {
          this.isSdcSchoolCollectionActive = response.data.sdcSchoolCollectionID === this.schoolCollectionObject?.sdcSchoolCollectionID;
          this.setCurrentCollectionSubmissionDueDate(response.data.submissionDueDate);
          this.submissionDueDate = 'Due: ' + formatSubmissionDate(sdcCollectionStore().currentCollectionSubmissionDueDate);
        }
      }).catch(error => {
        console.error(error);
        this.setFailureAlert(error.response?.data?.message || error.message);
      }).finally(() => {
        this.isLoading = false;
      });
    }
  }
};
</script>

<style scoped>
.divider {
  border-color: #FCBA19;
  border-width: 3px;
  opacity: unset;
}
.containerSetup{
  padding-right: 5em !important;
  padding-left: 5em !important;
}

@media screen and (max-width: 1200px) {
  .containerSetup{
    padding-right: 3em !important;
    padding-left: 3em !important;
  }
}

.v-stepper-window {
    margin: 0rem !important;
}

.v-stepper-header {
  box-shadow: none !important;
}

</style>

<style>
.v-stepper-item__subtitle {
  color: red;
  margin-top: .1em;
  font-style: italic;
}
</style>


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
      v-if="userInfo.activeInstituteType !== 'DISTRICT'"
      no-gutters
      class="mt-2 d-flex justify-start"
    >
      <v-col class="mt-1 d-flex justify-start">
        <v-icon
          small
          color="#1976d2"
        >
          mdi-arrow-left
        </v-icon>
        <a
          class="ml-1"
          @click="backToCollectionDashboard()"
        >Return to Data Collections</a>
      </v-col>
    </v-row>
    <v-row
      class="mt-2"
      no-gutters
    >
      <v-col>
        <v-divider class="divider" />
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
    <v-column
      v-else-if="submittedStatuses.includes(schoolCollection?.sdcSchoolCollectionStatusCode)"
    >
      <CollectionSubmissionDetails
        :school-collection-object="schoolCollectionObject"
      />
    </v-column>
    <v-row v-else>
      <v-col>
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
            <v-stepper-header>
              <template
                v-for="step in compiledSdcSteps()"
                :key="step.step"
              >
                <v-stepper-item
                  :id="step.id"
                  :value="step.step"
                  :title="step.title"
                  :subtitle="step.step === stepToShowSubmissionDueDate ? submissionDueDate : null"
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
            <v-stepper-window
              v-if="schoolCollectionObject?.sdcDistrictCollectionID === null"
            >
              <v-stepper-window-item
                :value="1"
                transition="false"
                reverse-transition="false"
              >
                <StepOneUploadData
                  :is-step-complete="isStepComplete"
                  :school-collection-object="schoolCollectionObject"
                  @next="next"
                  @refresh-store="refreshStore"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="2"
                transition="false"
                reverse-transition="false"
              >
                <StepTwoViewDataIssues
                  :is-step-complete="isStepComplete"
                  :school-collection-object="schoolCollectionObject"
                  @next="next"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="3"
                transition="false"
                reverse-transition="false"
              >
                <StepThreeVerifyData
                  :is-step-complete="isStepComplete"
                  :school-collection-object="schoolCollectionObject"
                  @next="next"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="4"
                transition="false"
                reverse-transition="false"
              >
                <StepFourDuplicatesProcessing
                  :is-step-complete="isStepComplete"
                  :school-collection-object="schoolCollectionObject"
                  @next="next"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="5"
                transition="false"
                reverse-transition="false"
              >
                <StepFiveSchoolDetails
                  :is-step-complete="isStepComplete"
                  :school-collection-object="schoolCollectionObject"
                  @next="next"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="6"
                transition="false"
                reverse-transition="false"
              >
                <StepSixSchoolContacts
                  :is-step-complete="isStepComplete"
                  :school-collection-object="schoolCollectionObject"
                  @next="next"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="7"
                transition="false"
                reverse-transition="false"
              >
                <StepSevenSubmitData
                  :is-step-complete="isStepComplete"
                  :school-collection-object="schoolCollectionObject"
                  @refresh-store="refreshStore"
                  @next="next"
                />
              </v-stepper-window-item>
            </v-stepper-window>
            <v-stepper-window
              v-else
            >
              <v-stepper-window-item
                :value="1"
                transition="false"
                reverse-transition="false"
              >
                <StepOneUploadData
                  :is-step-complete="isStepComplete"
                  :school-collection-object="schoolCollectionObject"
                  @next="next"
                  @refresh-store="refreshStore"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="2"
                transition="false"
                reverse-transition="false"
              >
                <StepTwoViewDataIssues
                  :is-step-complete="isStepComplete"
                  :school-collection-object="schoolCollectionObject"
                  @next="next"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="3"
                transition="false"
                reverse-transition="false"
              >
                <StepThreeVerifyData
                  :is-step-complete="isStepComplete"
                  :school-collection-object="schoolCollectionObject"
                  @next="next"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="4"
                transition="false"
                reverse-transition="false"
              >
                <StepFourDuplicatesProcessing
                  :is-step-complete="isStepComplete"
                  :school-collection-object="schoolCollectionObject"
                  @next="next"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="5"
                transition="false"
                reverse-transition="false"
              >
                <StepSevenSubmitData
                  :is-step-complete="isStepComplete"
                  :school-collection-object="schoolCollectionObject"
                  @refresh-store="refreshStore"
                  @next="next"
                />
              </v-stepper-window-item>
            </v-stepper-window>
          </template>
        </v-stepper>
      </v-col>
    </v-row>
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
import {mapState} from 'pinia';
import { sdcCollectionStore } from '../../../store/modules/sdcCollection';
import {SDC_STEPS_SCHOOL, SDC_STEPS_INDP_SCHOOL} from '../../../utils/institute/SdcSteps';
import {wsNotifications} from '../../../store/modules/wsNotifications';
import StepOneUploadData from './stepOneUploadData/StepOneUploadData.vue';
import StepTwoViewDataIssues from './stepTwoValidateData/StepTwoViewDataIssues.vue';
import StepFourDuplicatesProcessing from './StepFourDuplicatesProcessing.vue';
import StepThreeVerifyData from './stepThreeVerifyData/StepThreeVerifyData.vue';
import StepFiveSchoolDetails from './StepFiveSchoolDetails.vue';
import StepSixSchoolContacts from './StepSixSchoolContacts.vue';
import StepSevenSubmitData from './StepSevenSubmitData.vue';
import CollectionSubmissionDetails from './CollectionSubmissionDetails.vue';
import {authStore} from '../../../store/modules/auth';
import {appStore} from '../../../store/modules/app';
import {formatSubmissionDate} from '../../../utils/format';

export default {
  name: 'SDCCollectionView',
  components: {
    StepFourDuplicatesProcessing,
    StepFiveSchoolDetails,
    StepThreeVerifyData,
    StepTwoViewDataIssues,
    StepOneUploadData,
    StepSixSchoolContacts,
    StepSevenSubmitData,
    CollectionSubmissionDetails
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
    },
    stepToShowSubmissionDueDate() {
      if (this.schoolCollectionObject?.sdcDistrictCollectionID === null) {
        //Step 7 for independent schools.
        return 7;
      }
      return 5;
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
  created() {
    this.isLoading = !this.isLoading;
    appStore().getInstitutesData().finally(() => {
      this.schoolsMap = this.activeSchoolsMap;
    });
    sdcCollectionStore().getSchoolCollection(this.$route.params.schoolCollectionID)
      .then(() => {
        this.schoolCollectionObject = this.schoolCollection;
        this.schoolID = this.schoolCollection.schoolID;
        this.currentStep = this.getStepOfSDCCollectionByStatusCode(this.schoolCollection?.sdcSchoolCollectionStatusCode);
      })
      .finally(() => {
        this.isLoading = !this.isLoading;
      })
      .then(() => {
        return sdcCollectionStore().getCollectionBySchoolId(this.schoolID);
      })
      .then(() => {
        this.submissionDueDate = 'Due: ' + formatSubmissionDate(sdcCollectionStore().currentCollectionSubmissionDueDate);
      });
  },
  methods: {
    compiledSdcSteps() {
      let stepMap = {};

      if(this.schoolCollectionObject.sdcDistrictCollectionID != null){
        return SDC_STEPS_SCHOOL.filter(obj => {
          if (!stepMap[obj.step]) {
            stepMap[obj.step] = true;
            return true;
          }
          return false;
        });
      } else {
        return SDC_STEPS_INDP_SCHOOL.filter(obj => {
          if (!stepMap[obj.step]) {
            stepMap[obj.step] = true;
            return true;
          }
          return false;
        });
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
    },
    getIndexOfSDCCollectionByStatusCode(sdcSchoolCollectionStatusCode) {
      if(this.schoolCollectionObject.sdcDistrictCollectionID != null){
        return SDC_STEPS_SCHOOL.find(step => step.sdcSchoolCollectionStatusCode?.includes(sdcSchoolCollectionStatusCode))?.index;
      } else {
        return SDC_STEPS_INDP_SCHOOL.find(step => step.sdcSchoolCollectionStatusCode?.includes(sdcSchoolCollectionStatusCode))?.index;
      }
    },
    getStepOfSDCCollectionByStatusCode(sdcSchoolCollectionStatusCode) {
      if(this.schoolCollectionObject.sdcDistrictCollectionID != null) {
        return SDC_STEPS_SCHOOL.find(step => step.sdcSchoolCollectionStatusCode?.includes(sdcSchoolCollectionStatusCode))?.step;
      } else {
        return SDC_STEPS_INDP_SCHOOL.find(step => step.sdcSchoolCollectionStatusCode?.includes(sdcSchoolCollectionStatusCode))?.step;
      }
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


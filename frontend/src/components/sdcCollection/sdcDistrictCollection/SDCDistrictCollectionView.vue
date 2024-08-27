<template>
  <v-container
    class="containerSetup"
    :fluid="true"
  >
    <v-row
      no-gutters
      class="mt-1 d-flex justify-start"
    >
      <v-col>
        <h2>{{ currentCollectionTypeCode }} {{ currentCollectionYear }} Collection</h2>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      class="mt-2 mb-2 d-flex justify-start"
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
      v-if="isSdcDistrictCollectionActive"
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
    <v-row
      v-else-if="isSdcDistrictCollectionActive"
      no-gutters
    >
      <v-col>
        <v-stepper
          ref="stepper"
          class="customStepper"
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
                v-for="step in SDC_STEPS_DISTRICT()"
                :key="step.step"
              >
                <v-stepper-item
                  v-if="step.step === 5"
                  :id="step.id"
                  :value="step.step"
                  :title="step.title"
                  :subtitle="submissionDueDate"
                  :editable="step.step < currentStep"
                  :complete="step.step < stepInCollection || districtCollection?.sdcDistrictCollectionStatusCode === 'SUBMITTED'"
                  :color="'rgba(56, 89, 138, 1)'"
                />
                <v-stepper-item
                  v-else-if="step.step === 6"
                  :id="step.id"
                  :value="step.step"
                  :title="step.title"
                  :subtitle="duplicationResolutionDueDate"
                  :editable="step.step < currentStep"
                  :complete="step.step < stepInCollection"
                  :color="'rgba(56, 89, 138, 1)'"
                />
                <v-stepper-item
                  v-else-if="step.step === 7"
                  :id="step.id"
                  :value="step.step"
                  :title="step.title"
                  :subtitle="signOffDueDate"
                  :editable="step.step < currentStep"
                  :complete="step.step < stepInCollection"
                  :color="'rgba(56, 89, 138, 1)'"
                />
                <v-stepper-item
                  v-else
                  :id="step.id"
                  :value="step.step"
                  :title="step.title"
                  :editable="step.step < currentStep && !submittedStatuses.includes(districtCollectionObject.sdcDistrictCollectionStatusCode)"
                  :complete="step.index < stepInCollection"
                  :color="'rgba(56, 89, 138, 1)'"
                />
                <v-divider
                  v-if="step.step < SDC_STEPS_DISTRICT().length"
                  :class="{'step-previous-divider': step.step < currentStep}"
                  :thickness="step.step < currentStep ? 5 : 0"
                  :color="'rgba(56, 89, 138, 1)'"
                />
              </template>
            </v-stepper-header>
            <v-stepper-window v-if="!isSummerCollection">
              <v-stepper-window-item
                :value="1"
                transition="false"
                reverse-transition="false"
              >
                <StepOneUploadData
                  :is-step-complete="isStepComplete"
                  :district-collection-object="districtCollectionObject"
                  @next="next"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="2"
                transition="false"
                reverse-transition="false"
              >
                <StepTwoMonitor
                  :district-collection-object="districtCollectionObject"
                  :is-step-complete="isStepComplete"
                  @next="next"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="3"
                transition="false"
                reverse-transition="false"
              >
                <StepThreeVerifyData
                  :district-collection-object="districtCollectionObject"
                  :is-step-complete="isStepComplete"
                  :is-collection-active="isSdcDistrictCollectionActive"
                  @next="next"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="4"
                transition="false"
                reverse-transition="false"
              >
                <StepFourInDistrictDuplicates
                  :district-collection-object="districtCollectionObject"
                  :is-step-complete="isStepComplete"
                  @next="next"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="5"
                transition="false"
                reverse-transition="false"
              >
                <StepFiveSubmitToMinistry
                  :district-collection-object="districtCollectionObject"
                  :is-step-complete="isStepComplete"
                  :is-collection-active="isSdcDistrictCollectionActive"
                  @next="next"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="6"
                transition="false"
                reverse-transition="false"
              >
                <StepSixProvincialDuplicates
                  :district-collection-object="districtCollectionObject"
                  :is-step-complete="isStepComplete"
                  @next="next"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="7"
                transition="false"
                reverse-transition="false"
              >
                <StepSevenFinalSubmission
                  :district-collection-object="districtCollectionObject"
                  :is-step-complete="isStepComplete"
                  :is-collection-active="isSdcDistrictCollectionActive"
                />
              </v-stepper-window-item>
            </v-stepper-window>

            <v-stepper-window v-else>
              <v-stepper-window-item
                :value="1"
                transition="false"
                reverse-transition="false"
              >
                <StepOneUploadData
                  :is-step-complete="isStepComplete"
                  :district-collection-object="districtCollectionObject"
                  @next="next"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="2"
                transition="false"
                reverse-transition="false"
              >
                <StepTwoMonitor
                  :district-collection-object="districtCollectionObject"
                  :is-step-complete="isStepComplete"
                  @next="next"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="3"
                transition="false"
                reverse-transition="false"
              >
                <StepThreeVerifyData
                  :district-collection-object="districtCollectionObject"
                  :is-step-complete="isStepComplete"
                  :is-collection-active="isSdcDistrictCollectionActive"
                  @next="next"
                />
              </v-stepper-window-item>
              <v-stepper-window-item
                :value="4"
                transition="false"
                reverse-transition="false"
              >
                <StepFiveSubmitToMinistry
                  :district-collection-object="districtCollectionObject"
                  :is-step-complete="isStepComplete"
                  :is-collection-active="isSdcDistrictCollectionActive"
                  @next="next"
                />
              </v-stepper-window-item>
            </v-stepper-window>
          </template>
        </v-stepper>
      </v-col>
    </v-row>
    <StepSevenFinalSubmission
      v-else
      :district-collection-object="districtCollectionObject"
      :is-step-complete="isStepComplete"
      :is-collection-active="isSdcDistrictCollectionActive"
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
import {defineComponent} from 'vue';
import StepOneUploadData from './StepOneUploadData.vue';
import {sdcCollectionStore} from '../../../store/modules/sdcCollection';
import {wsNotifications} from '../../../store/modules/wsNotifications';
import {SDC_STEPS_DISTRICT, SDC_STEPS_SUMMER_DISTRICT} from '../../../utils/sdc/SdcSteps';
import {mapActions, mapState} from 'pinia';
import StepTwoMonitor from './StepTwoMonitor.vue';
import StepThreeVerifyData from './stepThreeVerifyData/StepThreeVerifyData.vue';
import StepFourInDistrictDuplicates from './duplicates/StepFourInDistrictDuplicates.vue';
import StepFiveSubmitToMinistry from './StepFiveSubmitToMinistry.vue';
import {formatSubmissionDate} from '../../../utils/format';
import StepSixProvincialDuplicates from './duplicates/StepSixProvincialDuplicates.vue';
import { appStore } from '../../../store/modules/app';
import {authStore} from '../../../store/modules/auth';
import StepSevenFinalSubmission from './StepSevenFinalSubmission.vue';
import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';

export default defineComponent({
  name: 'SDCDistrictCollectionView',
  components: {
    StepSixProvincialDuplicates,
    StepOneUploadData,
    StepTwoMonitor,
    StepThreeVerifyData,
    StepFourInDistrictDuplicates,
    StepFiveSubmitToMinistry,
    StepSevenFinalSubmission
  },
  data() {
    return {
      currentStep: 0,
      districtID: null,
      submissionDueDate: null,
      duplicationResolutionDueDate: null,
      signOffDueDate: null,
      isLoading: false,
      districtCollectionObject: {},
      disableScreen: false,
      wsNotificationText: '',
      schoolsMap: null,
      submittedStatuses: ['SUBMITTED', 'P_DUP_POST', 'P_DUP_VRFD', 'COMPLETED'],
      isSdcDistrictCollectionActive: false,
      isSummerCollection: false
    };
  },
  computed: {
    ...mapState(sdcCollectionStore, ['currentCollectionTypeCode', 'districtCollection','currentCollectionYear']),
    ...mapState(wsNotifications, ['notification']),
    ...mapState(appStore, ['activeSchoolsMap','activeDistrictsMap']),
    ...mapState(authStore, ['userInfo']),
    stepInCollection() {
      return this.getIndexOfSDCCollectionByStatusCode(this.districtCollection?.sdcDistrictCollectionStatusCode);
    },
    isStepComplete() {
      let indexCurrentCollection = this.getStepOfSDCCollectionByStatusCode(this.districtCollection.sdcDistrictCollectionStatusCode);
      return this.currentStep < indexCurrentCollection;
    }
  },
  watch: {
    notification(notificationData) {
      if (notificationData) {
        try {
          let updateUser = notificationData.updateUser.split('/');
          if (notificationData.sdcDistrictCollectionID === this.$route.params.sdcDistrictCollectionID && updateUser[1] !== this.userInfo.edxUserID) { 
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
    await sdcCollectionStore().getDistrictCollection(this.$route.params.sdcDistrictCollectionID)
      .then(async () => {
        this.districtCollectionObject = this.districtCollection;
        this.isSummerCollection = this.districtCollectionObject?.collectionTypeCode === 'JULY';
        this.districtID = this.districtCollection?.districtID;
        this.currentStep = this.getStepOfSDCCollectionByStatusCode(this.districtCollection?.sdcDistrictCollectionStatusCode);
        await this.getActiveSdcDistrictCollection();
      })
      .finally(() => {
        this.isLoading = !this.isLoading;
      });
  },
  methods: {
    ...mapActions(sdcCollectionStore, ['setCurrentCollectionSubmissionDueDate', 'setCurrentCollectionResolveDupDueDate', 'setCurrentCollectionSignOffDueDate']),
    SDC_STEPS_DISTRICT() {
      return this.isSummerCollection ? SDC_STEPS_SUMMER_DISTRICT : SDC_STEPS_DISTRICT;
    },
    next() {
      this.refreshStore(true);
      this.$refs.stepper.next();
    },
    backToCollectionDashboard() {
      this.$router.push({name: 'sdcDistrictCollectionSummary', params: {districtID: this.districtID}});
    },
    refreshStore(skipGetIndexOfSDCCollectionByStatusCode = false) {
      this.isLoading = !this.isLoading;
      sdcCollectionStore().getDistrictCollection(this.$route.params.sdcDistrictCollectionID).finally(() => {
        this.districtCollectionObject = this.districtCollection;
        this.districtID = this.districtCollection.districtID;
        if (!skipGetIndexOfSDCCollectionByStatusCode) {
          this.currentStep = this.getStepOfSDCCollectionByStatusCode(this.districtCollection?.sdcDistrictCollectionStatusCode);
        }
        this.isLoading = !this.isLoading;
      });
    },
    updateCurrentStep(step) {
      if (step < this.currentStep) {
        this.refreshStore(true);
      }
      this.currentStep = step;
    },
    getIndexOfSDCCollectionByStatusCode(sdcDistrictCollectionStatusCode) {
      return this.SDC_STEPS_DISTRICT().find(step => step.sdcDistrictCollectionStatusCode.includes(sdcDistrictCollectionStatusCode))?.index;
    },
    getStepOfSDCCollectionByStatusCode(sdcDistrictCollectionStatusCode) {
      return this.SDC_STEPS_DISTRICT().find(step => step.sdcDistrictCollectionStatusCode.includes(sdcDistrictCollectionStatusCode))?.step;
    },
    async getActiveSdcDistrictCollection() {
      await ApiService.apiAxios.get(ApiRoutes.sdc.SDC_COLLECTION_BY_DISTRICT_ID + '/' + this.districtID)
        .then(response => {
          this.setCurrentCollectionSubmissionDueDate(response.data.submissionDueDate);
          this.setCurrentCollectionResolveDupDueDate(response.data.duplicationResolutionDueDate);
          this.setCurrentCollectionSignOffDueDate(response.data.signOffDueDate);
          this.isSdcDistrictCollectionActive = response.data.sdcDistrictCollectionID === this.districtCollectionObject?.sdcDistrictCollectionID;

          this.submissionDueDate = 'Due: ' + formatSubmissionDate(sdcCollectionStore().currentCollectionSubmissionDueDate);
          this.duplicationResolutionDueDate = 'Due: ' + formatSubmissionDate(sdcCollectionStore().currentCollectionResolveDupDueDate);
          this.signOffDueDate = 'Due: ' + formatSubmissionDate(sdcCollectionStore().currentCollectionSignOffDueDate);
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        });
    }
  }
});
</script>

<style scoped>
.v-stepper-window {
  margin: 0 !important;
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

.customStepper .v-stepper-item .v-stepper-item__subtitle {
  text-align: center !important;
}

.customStepper .v-stepper--alt-labels .v-stepper-item__avatar.v-avatar {
  margin-bottom: 16px;
  margin-inline-end: 0;
}

.customStepper .v-stepper-item__avatar.v-avatar {
  margin-inline-end: 0px;
  margin-bottom: 16px;
}

.customStepper .v-stepper-item {
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  flex-basis: 175px;
}
</style>

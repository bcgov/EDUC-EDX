<template>
  <v-row v-if="isLoading">
    <v-col>
      <Spinner />
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
        v-for="name in visibleTabs"
        :key="name"
        class="divider"
        :value="name"
      >
        <div style="white-space:pre-wrap">
          {{ getTabLabel(name) }}
        </div>
      </v-tab>
      <v-tab
        v-if="isFinalSignOff && !isMigratedCollection && showFinalSubmissionTabs"
        key="StudentDifferences"
        value="StudentDifferences"
        class="divider"
      >
        Student <br> Differences
      </v-tab>
      <v-tab
        v-if="isFinalSignOff && !isMigratedCollection && showFinalSubmissionTabs"
        key="DeletedStudents"
        value="DeletedStudents"
        class="divider"
      >
        Deleted <br> Students
      </v-tab>
      <v-tab
        v-if="isFinalSignOff && !isMigratedCollection && showFinalSubmissionTabs"
        key="SignOff"
        value="SignOff"
        class="divider"
      >
        Signatures
      </v-tab>      
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item
        value="All Students"
        transition="false"
        reverse-transition="false"
      >
        <AllStudentsComponent
          v-if="tab==='All Students'"
          :district="district"
          :is-final-sign-off="isFinalSignOff"
          :is-collection-active="isCollectionActive"
          :is-migrated-collection="isMigratedCollection"
        />
      </v-window-item>
      <v-window-item
        value="French Programs"
        transition="false"
        reverse-transition="false"
      >
        <FrenchProgramsComponent
          v-if="tab==='French Programs'"
          :district="district"
          :is-final-sign-off="isFinalSignOff"
          :is-collection-active="isCollectionActive"
        />
      </v-window-item>
      <v-window-item
        value="Career Programs"
        transition="false"
        reverse-transition="false"
      >
        <CareerProgramsComponent
          v-if="tab==='Career Programs'"
          :district="district"
          :is-final-sign-off="isFinalSignOff"
          :is-collection-active="isCollectionActive"
        />
      </v-window-item>
      <v-window-item
        value="Indigenous Students & Support Programs"
        transition="false"
        reverse-transition="false"
      >
        <IndSupportProgramsComponent
          v-if="tab==='Indigenous Students & Support Programs'"
          :district="district"
          :is-final-sign-off="isFinalSignOff"
          :is-collection-active="isCollectionActive"
        />
      </v-window-item>
      <v-window-item
        value="Inclusive Education"
        transition="false"
        reverse-transition="false"
      >
        <SpecialEduComponent
          v-if="tab==='Inclusive Education'"
          :district="district"
          :is-final-sign-off="isFinalSignOff"
          :is-collection-active="isCollectionActive"
        />
      </v-window-item>
      <v-window-item
        value="English Language Learning"
        transition="false"
        reverse-transition="false"
      >
        <EnglishLangComponent
          v-if="tab==='English Language Learning'"
          :district="district"
          :is-final-sign-off="isFinalSignOff"
          :is-collection-active="isCollectionActive"
        />
      </v-window-item>
      <v-window-item
        value="Refugee"
        transition="false"
        reverse-transition="false"
      >
        <RefugeeComponent
          v-if="tab==='Refugee'"
          :district="district"
          :is-final-sign-off="isFinalSignOff"
          :is-collection-active="isCollectionActive"
        />
      </v-window-item>
      <v-window-item
        v-if="isFinalSignOff && !isMigratedCollection && showFinalSubmissionTabs"
        value="StudentDifferences"
        transition="false"
        reverse-transition="false"
      >
        <StudentDifferencesComponent
          :district="district"
          :table-config="DISTRICT_STUDENT_DIFFERENCES"
        />
      </v-window-item>
      <v-window-item
        v-if="isFinalSignOff && !isMigratedCollection && showFinalSubmissionTabs"
        value="DeletedStudents"
      >
        <DeletedStudentsComponent
          :district="district"
          :is-final-sign-off="isFinalSignOff"
          :is-collection-active="isCollectionActive"
        />
      </v-window-item>
      <v-window-item
        v-if="isFinalSignOff && !isMigratedCollection && showFinalSubmissionTabs"
        value="SignOff"
        transition="false"
        reverse-transition="false"
      >
        <SignOffSignatures
          :district="district"
          :district-collection-object="districtCollectionObject"
          :is-collection-active="isCollectionActive"
          @refresh-collection-store="refreshStore"
        />
      </v-window-item>
    </v-window> 
  </div>

  <v-row
    v-if="!isFinalSignOff && isCollectionActive"
    justify="end"
  >
    <PrimaryButton
      v-if="!isStepComplete"
      id="step-3-next-button-school"
      class="mr-3 mb-3"
      icon="mdi-check"
      :disabled="disableNextButton() || !canMoveForward()"
      text="Verify all program tabs as correct"
      :click-action="next"
    />
    <PrimaryButton
      v-else
      id="step-3-next-button-school"
      class="mr-3 mb-3"
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
    <p
      id="schoolNotSubmittedWarning"
      class="form-hint mr-3"
    >
      {{ monitorSdcSchoolCollectionsResponse?.totalSchools - monitorSdcSchoolCollectionsResponse?.schoolsSubmitted }}
      school(s) not
      submitted
    </p>
  </v-row>
</template>

<script>
import alertMixin from '../../../../mixins/alertMixin';
import PrimaryButton from '../../../util/PrimaryButton.vue';
import { SDC_VERIFY_TABS, getSdcVerifyTabLabel } from '../../../../utils/sdc/SdcVerifyTabs';
import AllStudentsComponent from './AllStudentsComponent.vue';
import CareerProgramsComponent from './CareerProgramsComponent.vue';
import IndSupportProgramsComponent from './IndSupportProgramsComponent.vue';
import SpecialEduComponent from './SpecialEduComponent.vue';
import EnglishLangComponent from './EnglishLangComponent.vue';
import RefugeeComponent from './RefugeeComponent.vue';
import FrenchProgramsComponent from './FrenchProgramsComponent.vue';
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';
import {setFailureAlert} from '../../../composable/alertComposable';
import {appStore} from '../../../../store/modules/app';
import {mapState} from 'pinia';
import {sdcCollectionStore} from '../../../../store/modules/sdcCollection';
import {PERMISSION} from '../../../../utils/constants/Permission';
import {authStore} from '../../../../store/modules/auth';
import SignOffSignatures from '../../../common/SignOffSignatures.vue';
import StudentDifferencesComponent from './StudentDifferencesComponent.vue';
import {DISTRICT_STUDENT_DIFFERENCES} from '../../../../utils/sdc/DistrictCollectionTableConfiguration';
import {LocalDate, LocalDateTime} from '@js-joda/core';
import Spinner from '../../../common/Spinner.vue';
import DeletedStudentsComponent from './DeletedStudentsComponent.vue';

export default {
  name: 'StepThreeVerifyData',
  components: {
    DeletedStudentsComponent,
    Spinner,
    PrimaryButton,
    AllStudentsComponent,
    CareerProgramsComponent,
    IndSupportProgramsComponent,
    SpecialEduComponent,
    EnglishLangComponent,
    RefugeeComponent,
    FrenchProgramsComponent,
    SignOffSignatures,
    StudentDifferencesComponent
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
      required: false
    },
    isFinalSignOff: {
      type: Boolean,
      required: false
    },
    isCollectionActive: {
      type: Boolean,
      required: true
    },
    showFinalSubmissionTabs: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  emits: ['next', 'previous', 'refresh-collection-store'],
  data() {
    return {
      tab: null,
      isLoading: true,
      monitorSdcSchoolCollectionsResponse: [],
      tabs: SDC_VERIFY_TABS,
      type: 'SDC',
      sdcDistrictCollectionID: this.$route.params.districtCollectionID,
      district: {}
    };
  },
  computed: {
    DISTRICT_STUDENT_DIFFERENCES() {
      return DISTRICT_STUDENT_DIFFERENCES;
    },
    ...mapState(authStore, ['userInfo']),
    ...mapState(sdcCollectionStore, ['currentCollectionTypeCode']),
    ...mapState(appStore, ['activeDistrictsMap', 'config']),
    hasEditPermission(){
      return (this.userInfo?.activeInstitutePermissions?.filter(perm => perm === PERMISSION.DISTRICT_SDC_EDIT).length > 0);
    },
    showRefugeeTab() {
      return (
        !this.isMigratedCollection &&
        this.currentCollectionTypeCode === 'February'
      );
    },
    visibleTabs() {
      return this.showRefugeeTab ? this.tabs : this.tabs.filter((tab) => tab !== 'Refugee');
    },
    isMigratedCollection() { //we don't show student differences or resolved duplicates for collections before EDX go live
      return LocalDateTime.parse(this.districtCollectionObject.createDate).toLocalDate().isBefore(LocalDate.parse(this.config.SLD_MIGRATION_DATE));
    }
  },
  created() {
    appStore().getInstitutesData().finally(() => {
      this.district = this.activeDistrictsMap.get(this.districtCollectionObject.districtID);
    });
    this.getSdcSchoolCollections();
  },
  methods: {
    canMoveForward(){
      return this.isStepComplete || this.hasEditPermission;
    },
    async getSdcSchoolCollections(){
      this.isLoading = true;
      await ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_DISTRICT_COLLECTION}/${this.$route.params.sdcDistrictCollectionID}/sdcSchoolCollectionMonitoring`, {
      }).then(response => {
        this.monitorSdcSchoolCollectionsResponse = response?.data;
      }).catch(error => {
        console.error(error);
        setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get sdc school collections. Please try again later.');
      }).finally(() => {
        this.isLoading = false;
      });
    },
    disableNextButton() {
      if(this.districtCollectionObject.collectionTypeCode !== 'JULY') {
        return this.monitorSdcSchoolCollectionsResponse?.totalSchools - this.monitorSdcSchoolCollectionsResponse?.schoolsSubmitted !== 0;
      }
    },
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
      if(this.isStepComplete || this.districtCollectionObject.sdcDistrictCollectionStatusCode === 'SUBMITTED') {
        this.$emit('next');
      } else {
        this.markStepAsComplete();
      }
    },
    refreshStore() {
      this.$emit('refresh-collection-store');
    },
    getTabLabel: getSdcVerifyTabLabel
  },
  
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

.sign-off-tab {
    background-color: #003366 !important;
    color: white !important;
    border: 1px solid #003366;
}
</style>

<template>
  <div class="border">
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
    </v-tabs>
    <v-window v-model="tab">
      <v-window-item
        value="All Students"
        transition="false"
        reverse-transition="false"
      >
        <FTEComponent
          v-if="tab==='All Students'"
          :school="school"
          :is-final-sign-off="isFinalSignOff"
          :is-collection-active="isCollectionActive"
        />
      </v-window-item>
      <v-window-item
        value="French Programs"
        transition="false"
        reverse-transition="false"
      >
        <FrenchProgramsComponent
          v-if="tab==='French Programs'"
          :school="school"
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
          :school="school"
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
          :school="school"
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
          :school="school"
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
          :school="school"
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
          :school="school"
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
          :school="school"
          :table-config="SCHOOL_STUDENT_DIFFERENCES"
        />
      </v-window-item>
      <v-window-item
        v-if="isFinalSignOff && !isMigratedCollection && showFinalSubmissionTabs"
        value="DeletedStudents"
      >
        <DeleteSchoolStudentsComponent
          :school="school"
          :is-final-sign-off="isFinalSignOff"
          :is-collection-active="isCollectionActive"
          :is-migrated-collection="isMigratedCollection"
        />
      </v-window-item>
    </v-window>
  </div>

  <v-row
    v-if="!isFinalSignOff"
    justify="end"
  >
    <PrimaryButton
      v-if="!isStepComplete"
      id="step-3-next-button-school"
      class="mr-3 mb-3"
      icon="mdi-check"
      :disabled="!canMoveForward()"
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
</template>

<script>
import alertMixin from '../../../../mixins/alertMixin';
import PrimaryButton from '../../../util/PrimaryButton.vue';
import { mapState } from 'pinia';
import { sdcCollectionStore } from '../../../../store/modules/sdcCollection';
import { appStore } from '../../../../store/modules/app';
import { SDC_VERIFY_TABS, getSdcVerifyTabLabel } from '../../../../utils/sdc/SdcVerifyTabs';
import FTEComponent from './FTEComponent.vue';
import CareerProgramsComponent from './CareerProgramsComponent.vue';
import IndSupportProgramsComponent from './IndSupportProgramsComponent.vue';
import SpecialEduComponent from './SpecialEduComponent.vue';
import EnglishLangComponent from './EnglishLangComponent.vue';
import RefugeeComponent from './RefugeeComponent.vue';
import FrenchProgramsComponent from './FrenchProgramsComponent.vue';
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';
import {PERMISSION} from '../../../../utils/constants/Permission';
import {authStore} from '../../../../store/modules/auth';
import StudentDifferencesComponent
  from '../../sdcDistrictCollection/stepThreeVerifyData/StudentDifferencesComponent.vue';
import {SCHOOL_STUDENT_DIFFERENCES} from '../../../../utils/sdc/DistrictCollectionTableConfiguration';
import {LocalDate, LocalDateTime} from '@js-joda/core';
import DeletedStudentsComponent from '../../sdcDistrictCollection/stepThreeVerifyData/DeletedStudentsComponent.vue';
import DeleteSchoolStudentsComponent from './DeletedSchoolStudentsComponent.vue';

export default {
  name: 'StepThreeVerifyData',
  components: {
    DeleteSchoolStudentsComponent,
    DeletedStudentsComponent,
    StudentDifferencesComponent,
    PrimaryButton,
    FTEComponent,
    CareerProgramsComponent,
    IndSupportProgramsComponent,
    SpecialEduComponent,
    EnglishLangComponent,
    RefugeeComponent,
    FrenchProgramsComponent
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
      default: false
    }
  },
  emits: ['next', 'previous'],
  data() {
    return {
      tab: null,
      tabs: SDC_VERIFY_TABS,
      type: 'SDC',
      sdcSchoolCollectionID: this.$route.params.schoolCollectionID,
      school: {}
    };
  },
  computed: {
    SCHOOL_STUDENT_DIFFERENCES() {
      return SCHOOL_STUDENT_DIFFERENCES;
    },
    ...mapState(authStore, ['userInfo']),
    ...mapState(sdcCollectionStore, ['currentStepInCollectionProcess', 'currentCollectionTypeCode']),
    ...mapState(appStore, ['activeSchoolsMap', 'config']),
    hasEditPermission(){
      return (this.userInfo?.activeInstitutePermissions?.filter(perm => perm === PERMISSION.SCHOOL_SDC_EDIT).length > 0);
    },
    showRefugeeTab() {
      const validPublicTypes = [
        'STANDARD',
        'ALT_PROGS',
        'YOUTH',
        'SHORT_PRP',
        'LONG_PRP',
      ];
      return (
        !this.isMigratedCollection &&
        this.currentCollectionTypeCode === 'February' &&
        this.school.schoolCategoryCode === 'PUBLIC' &&
        validPublicTypes.includes(this.school.facilityTypeCode)
      );
    },
    visibleTabs() {
      return this.showRefugeeTab ? this.tabs : this.tabs.filter((tab) => tab !== 'Refugee');
    },
    isMigratedCollection() { //we don't show student differences or resolved duplicates for collections before EDX go live
      return LocalDateTime.parse(this.schoolCollectionObject.createDate).toLocalDate().isBefore(LocalDate.parse(this.config.SLD_MIGRATION_DATE));
    }
  },
  created() {
    appStore().getInstitutesData().finally(() => {
      this.school = this.activeSchoolsMap.get(this.schoolCollectionObject.schoolID);
    });
  },
  methods: {
    next() {
      if(this.isStepComplete) {
        this.$emit('next');
      } else {
        this.markStepAsComplete();
      }
    },
    canMoveForward(){
      return this.isStepComplete || this.hasEditPermission;
    },
    markStepAsComplete() {
      let updateCollection = {
        schoolCollection: this.schoolCollectionObject,
        status: 'VERIFIED'
      };
      ApiService.apiAxios.put(ApiRoutes.sdc.BASE_URL + '/' + this.sdcSchoolCollectionID, updateCollection)
        .then(() => {
          this.$emit('next');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while verifying data. Please try again later.');
        });
    },
    getTabLabel: getSdcVerifyTabLabel
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

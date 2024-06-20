<template>
  <v-row class="mt-3 mb-3 pl-3">
    <v-btn-toggle
      v-model="duplicateView"
      color="#003366"
      rounded="0"
      :divided="true"
    >
      <v-btn
        :id="'nonAllowable' + duplicateType + 'Button'"
        value="1"
        size="large"
        class="duplicate-type-button"
      >
        Non-Allowable ({{ nonAllowableDuplicates.length }})
      </v-btn>
      <v-btn
        v-if="allowableDuplicates"
        id="allowableButton"
        value="2"
        size="large"
        class="duplicate-type-button"
      >
        Allowable ({{ allowableDuplicates.length }})
      </v-btn>
      <v-btn
        :id="'resolved' + duplicateType + 'Button'"
        value="3"
        size="large"
        class="duplicate-type-button"
      >
        Resolved ({{ resolvedDuplicates.length }})
      </v-btn>
    </v-btn-toggle>
  </v-row>
  <template v-if="duplicateView==='1'">
    <strong>Duplicate Students Found: {{ nonAllowableDuplicates.length }}</strong>
    <v-row
      v-for="duplicate in nonAllowableDuplicates"
      :key="duplicate.sdcDuplicateID"
      class="pt-4"
      no-gutters
    >
      <v-col class="pa-0">
        <v-row no-gutters>
          <v-col class="pb-2">
            <v-chip color="primary">
              <v-col>Assigned PEN: {{ duplicate.sdcSchoolCollectionStudent1Entity.assignedPen }}</v-col>
              <v-col
                v-if="duplicateType==='enrollment'"
              >
                Error: {{ duplicate.duplicateErrorDescriptionCode }}
              </v-col>
              <v-col v-else>
                Duplicate Program: {{ duplicate.programDuplicateTypeCodeDescription }}
              </v-col>
            </v-chip>
          </v-col>
        </v-row>
        <CustomTable
          :headers="headersConfig.nonAllowableTableHeaders"
          :data="[duplicate?.sdcSchoolCollectionStudent1Entity, duplicate?.sdcSchoolCollectionStudent2Entity]"
          :is-loading="false"
          :reset="false"
          :total-elements="2"
          :hide-pagination="true"
        >
          <template #resolution="{ sdcSchoolCollectionStudent }">
            <v-menu
              v-if="sdcSchoolCollectionStudent.sdcSchoolCollectionStudentID"
              v-model="editOptionsOpen[sdcSchoolCollectionStudent.sdcSchoolCollectionStudentID + duplicate.sdcDuplicateID]"
              transition="fab-transition"
              location="end"
              offset="10"
            >
              <template #activator="{ props }">
                <v-btn
                  :id="'resolve' + duplicateType +'MenuBtn' + sdcSchoolCollectionStudent.sdcSchoolCollectionStudentID + duplicate.sdcDuplicateID"
                  color="primary"
                  icon="mdi-playlist-edit"
                  variant="text"
                  v-bind="props"
                  :disabled="!canResolveDuplicates"
                />
              </template>
              <v-list>
                <v-list-item 
                  v-if="sdcSchoolCollectionStudent.canChangeGrade"
                  id="change-grade"
                  @click="changeGrade(sdcSchoolCollectionStudent, duplicate)"
                >
                  <v-icon
                    color="#003366"
                    class="pr-1 mb-1"
                  >
                    mdi-pencil
                  </v-icon>
                  <span class="ml-2">Change Grade</span>
                </v-list-item>
                <v-list-item
                  v-if="duplicateType === 'program'"
                  id="resolve"
                  @click="resolveProgramDuplicate(duplicate)"
                >
                  <v-icon
                    color="#003366"
                    class="pr-1 mb-1"
                  >
                    mdi-check
                  </v-icon>
                  <span class="ml-2">Resolve</span>
                </v-list-item>
                <v-list-item
                  v-if="duplicateType === 'enrollment'"
                  id="resolveEnrollmentDuplicateViaRemove"
                  @click="resolveEnrollmentDuplicateViaRemove(duplicate, sdcSchoolCollectionStudent)"
                >
                  <v-icon
                    color="#003366"
                    class="pr-1 mb-1"
                  >
                    mdi-delete
                  </v-icon>
                  <span class="ml-2">Remove</span>
                </v-list-item>
                <v-list-item
                  v-if="duplicateType === 'enrollment' && sdcSchoolCollectionStudent.canMoveToCrossEnrollment"
                  id="enrollmentResolveViaRemoveAndMoveToCrossEnrollment"
                >
                  <v-icon
                    color="#003366"
                    class="pr-1 mb-1"
                  >
                    mdi-pencil
                  </v-icon>
                  <span class="ml-2">Remove & Move to 8/9 Cross Enrollment</span>
                </v-list-item>
                <v-list-item
                  id="markStudAsDiff"
                  @click="markStudentAsDifferent(sdcSchoolCollectionStudent)"
                >
                  <v-icon
                    color="#003366"
                    class="pr-1 mb-1"
                  >
                    mdi-account-question
                  </v-icon>
                  <span class="ml-2">Request Review of PEN</span>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </CustomTable>
      </v-col>
    </v-row>
    <v-row
      v-if="nonAllowableDuplicates.length === 0"
      class="pt-4"
      no-gutters
    >
      <v-alert
        :id="duplicateType + 'non-allowable-alert'"
        density="compact"
        type="success"
        variant="tonal"
        text="Congratulations! There are no non-allowable duplicates."
      />
    </v-row>
  </template>
  <template v-if="duplicateView==='2'">
    <strong>Duplicate Students Found: {{ allowableDuplicates.length }}</strong>
    <v-row
      v-for="duplicate in allowableDuplicates"
      :key="duplicate.sdcDuplicateID"
      class="pt-4"
      no-gutters
    >
      <v-col class="pa-0">
        <v-row no-gutters>
          <v-col class="pb-2">
            <v-chip color="primary">
              <v-col>
                Assigned PEN: {{ duplicate.sdcSchoolCollectionStudent1Entity.assignedPen }}
              </v-col>
            </v-chip>
          </v-col>
        </v-row>
        <CustomTable
          :headers="headersConfig.allowableTableHeaders"
          :data="[duplicate?.sdcSchoolCollectionStudent1Entity, duplicate?.sdcSchoolCollectionStudent2Entity]"
          :is-loading="false"
          :reset="false"
          :total-elements="2"
          :hide-pagination="true"
        />
      </v-col>
    </v-row>
    <v-row
      v-if="allowableDuplicates.length === 0"
      class="pt-4"
      no-gutters
    >
      <v-alert
        :id="duplicateType + 'allowable-alert'"
        density="compact"
        type="info"
        variant="tonal"
        text="There are no allowable duplicates."
      />
    </v-row>
  </template>
  <template v-if="duplicateView==='3'">
    <strong>Duplicate Students Found: {{ resolvedDuplicates.length }}</strong>
    <v-row
      v-for="duplicate in resolvedDuplicates"
      :key="duplicate.sdcDuplicateID"
      class="pt-4"
      no-gutters
    >
      <v-col class="pa-0">
        <v-row no-gutters>
          <v-col class="pb-2">
            <v-chip color="primary">
              <v-col>
                Assigned PEN: {{ duplicate.sdcSchoolCollectionStudent1Entity.assignedPen }}
              </v-col>
            </v-chip>
          </v-col>
        </v-row>
        <CustomTable
          :headers="headersConfig.resolvedTableHeaders"
          :data="[duplicate?.sdcSchoolCollectionStudent1Entity, duplicate?.sdcSchoolCollectionStudent2Entity]"
          :is-loading="false"
          :reset="false"
          :total-elements="2"
          :hide-pagination="true"
        />
      </v-col>
    </v-row>
    <v-row
      v-if="resolvedDuplicates.length === 0"
      class="pt-4"
      no-gutters
    >
      <v-alert
        :id="duplicateType + 'resolved-alert'"
        density="compact"
        type="info"
        variant="tonal"
        text="There are no resolved duplicates."
      />
    </v-row>
  </template>
  <v-bottom-sheet
    v-model="openProgramResolutionView"
    :no-click-animation="true"
    :scrollable="true"
    :persistent="true"
  >
    <ProgramDuplicateResolution
      :selected-program-duplicate="selectedDuplicate"
      @close="openProgramResolutionView = !openProgramResolutionView"
      @close-refresh="closeAndRefreshDuplicates()"
    />
  </v-bottom-sheet>

  <v-bottom-sheet
    v-model="openChangeGradeView"
    :inset="true"
    :no-click-animation="true"
    :scrollable="true"
    :persistent="true"
  >
    <ChangeGrade
      :selected-student="selectedSdcSchoolCollectionStudent"
      :selected-duplicate-id="selectedDuplicate.sdcDuplicateID"
      @close="openChangeGradeView = !openChangeGradeView"
      @close-refresh="closeAndRefreshDuplicates()"  
    />
  </v-bottom-sheet>
  <EnrollmentDuplicateResolveViaRemove
    ref="resolveEnrollmentDuplicateViaRemoveStudent"
    @close-refresh="closeAndRefreshDuplicates()"
  />
  <ConfirmationDialog ref="confirmMarkDifferent">
    <template #message>
      <p>We will look into the assigned PEN we found for this student. Would you like to proceed?</p>
    </template>
  </ConfirmationDialog>
</template>
<script>
import {defineComponent} from 'vue';
import CustomTable from './CustomTable.vue';
import ProgramDuplicateResolution from '../sdcCollection/sdcDistrictCollection/duplicates/ProgramDuplicateResolution.vue';
import ChangeGrade from '../sdcCollection/sdcDistrictCollection/duplicates/ChangeGrade.vue';
import EnrollmentDuplicateResolveViaRemove from '../sdcCollection/sdcDistrictCollection/duplicates/EnrollmentDuplicateResolveViaRemove.vue';
import {cloneDeep} from 'lodash';
import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import {setFailureAlert, setSuccessAlert} from '../composable/alertComposable';
import ConfirmationDialog from '../util/ConfirmationDialog.vue';

export default defineComponent({
  name: 'DuplicateTab',
  components: {
    ConfirmationDialog,
    EnrollmentDuplicateResolveViaRemove,
    CustomTable, 
    ProgramDuplicateResolution,
    ChangeGrade
  },
  props: {
    duplicateType: {
      type: String,
      required: true
    },
    nonAllowableDuplicates: {
      type: Array,
      required: true
    },
    allowableDuplicates: {
      type: Array,
      default: null
    },
    headersConfig: {
      type: Object,
      required: true
    },
    resolvedDuplicates: {
      type: Array,
      required: true
    },
    canResolveDuplicates: {
      type: Boolean,
      required: true
    }
  },
  emits:['refresh-duplicates'],
  data() {
    return {
      duplicateView: '1',
      editOptionsOpen: [],
      openProgramResolutionView: false,
      openChangeGradeView: false,
      selectedDuplicate: {},
      selectedSdcSchoolCollectionStudent: {}
    };
  },
  methods: {
    async markStudentAsDifferent(sdcSchoolCollectionStudent){
      const selectedStudent = cloneDeep(sdcSchoolCollectionStudent);
      const confirmation = await this.$refs.confirmMarkDifferent.open('Request Review of PEN?', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Yes', rejectText: 'No'});
      if (!confirmation) {
        return;
      }
      ApiService.apiAxios.post(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${sdcSchoolCollectionStudent.sdcSchoolCollectionID}/markDiff`, selectedStudent)
        .then(() => {
          setSuccessAlert('Success! The student details have been updated.');
          this.closeAndRefreshDuplicates();
        }).catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to update student details. Please try again later.');
        });
    },
    resolveProgramDuplicate(duplicate) {
      this.selectedDuplicate = duplicate;
      this.openProgramResolutionView = !this.openProgramResolutionView;
    },
    resolveEnrollmentDuplicateViaRemove(duplicate, sdcSchoolCollectionStudent) {
      this.selectedDuplicate = duplicate;
      this.selectedSdcSchoolCollectionStudent = sdcSchoolCollectionStudent;
      this.$refs.resolveEnrollmentDuplicateViaRemoveStudent.removeAndResolveStudent(duplicate, sdcSchoolCollectionStudent);
    },
    closeAndRefreshDuplicates() {
      this.openProgramResolutionView = false;
      this.openChangeGradeView = false;
      this.$emit('refresh-duplicates');
    },
    async changeGrade(sdcSchoolCollectionStudent, duplicate) {
      this.selectedDuplicate = duplicate;
      this.selectedSdcSchoolCollectionStudent = sdcSchoolCollectionStudent;
      this.openChangeGradeView = !this.openChangeGradeView;
    }
  }
});
</script>
<style scoped>
.duplicate-type-button {
  border: 1px solid lightgray;
}
</style>

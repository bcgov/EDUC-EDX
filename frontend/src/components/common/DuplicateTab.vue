<template>
  <v-row class="mt-3 mb-3 pl-3">
    <v-btn-toggle
      v-model="duplicateView"
      color="#003366"
      rounded="0"
      mandatory="true"
      :divided="true"
    >
      <v-btn
        :id="'nonAllowable' + duplicateType + 'Button'"
        value="1"
        size="large"
        class="duplicate-type-button"
      >
        Non-Allowable ({{ nonAllowableDuplicates?.length }})
      </v-btn>
      <v-btn
        v-if="allowableDuplicates"
        id="allowableButton"
        value="2"
        size="large"
        class="duplicate-type-button"
      >
        Allowable ({{ allowableDuplicates?.length }})
      </v-btn>
      <v-btn
        :id="'resolved' + duplicateType + 'Button'"
        value="3"
        size="large"
        class="duplicate-type-button"
      >
        Resolved ({{ resolvedDuplicates?.length }})
      </v-btn>
    </v-btn-toggle>
  </v-row>
  <template v-if="duplicateView==='1'">
    <strong>Duplicate Students Found: {{ nonAllowableDuplicates?.length }}</strong>
    <v-data-iterator
      v-model:page.sync="pageNumber"
      :items="nonAllowableDuplicates"
      :items-per-page="10"
    >
      <template #default="{ items }">
        <v-row
          v-for="duplicate in items"
          :key="duplicate?.raw?.sdcDuplicateID"
          class="pt-4"
          no-gutters
        >
          <v-col class="pa-0">
            <v-row no-gutters>
              <v-col class="pb-2">
                <v-chip color="primary">
                  <v-col>Assigned PEN: {{ duplicate?.raw?.sdcSchoolCollectionStudent1Entity?.assignedPen }}</v-col>
                  <v-col
                    v-if="duplicateType==='enrollment'"
                  >
                    Error: {{ duplicate?.raw?.duplicateErrorDescriptionCode }}
                  </v-col>
                  <v-col v-else>
                    Duplicate Program: {{ duplicate?.raw?.programDuplicateTypeCodeDescription }}
                  </v-col>
                </v-chip>
              </v-col>
            </v-row>

            <CustomTable
              :headers="headersConfig.nonAllowableTableHeaders"
              :data="[duplicate?.raw?.sdcSchoolCollectionStudent1Entity, duplicate?.raw?.sdcSchoolCollectionStudent2Entity]"
              :is-loading="false"
              :reset="false"
              :total-elements="2"
              :hide-pagination="true"
            >
              <template #resolution="{ sdcSchoolCollectionStudent }">
                <v-menu
                  v-if="sdcSchoolCollectionStudent.sdcSchoolCollectionStudentID"
                  v-model="editOptionsOpen[sdcSchoolCollectionStudent.sdcSchoolCollectionStudentID + duplicate?.raw?.sdcDuplicateID]"
                  transition="fab-transition"
                  location="end"
                  offset="10"
                >
                  <template #activator="{ props }">
                    <v-btn
                      :id="'resolve' + duplicateType +'MenuBtn' + sdcSchoolCollectionStudent.sdcSchoolCollectionStudentID + duplicate?.raw?.sdcDuplicateID"
                      color="primary"
                      prepend-icon="mdi-playlist-edit"
                      text="Resolve"
                      variant="text"
                      v-bind="props"
                      :disabled="!canResolveDuplicates"
                    />
                  </template>
                  <v-list>
                    <v-list-item 
                      v-if="sdcSchoolCollectionStudent.canChangeGrade"
                      id="change-grade"
                      @click="changeGrade(sdcSchoolCollectionStudent, duplicate?.raw)"
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
                      @click="resolveProgramDuplicate(duplicate?.raw)"
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
                      @click="resolveEnrollmentDuplicateViaRemove(duplicate?.raw, sdcSchoolCollectionStudent)"
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
                      v-if="duplicateType === 'enrollment'"
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
                <div v-if="sdcSchoolCollectionStudent.showContact">
                  <v-menu
                    v-model="contactMenu[sdcSchoolCollectionStudent.sdcSchoolCollectionStudentID + duplicate?.raw?.sdcDuplicateID]"
                    :close-on-content-click="false"
                    transition="fab-transition"
                    location="end"
                  >
                    <template #activator="{ props }">
                      <v-btn
                        :id="'Contact' + duplicateType + sdcSchoolCollectionStudent.sdcSchoolCollectionStudentID + duplicate?.raw?.sdcDuplicateID"
                        color="primary"
                        icon="mdi-phone-outline"
                        variant="text"
                        v-bind="props"
                      />
                    </template>
                    <v-card min-width="300">
                      <v-list>
                        <v-list-item
                          :title="sdcSchoolCollectionStudent?.contactInfo?.isSchoolContact ? sdcSchoolCollectionStudent?.schoolName : sdcSchoolCollectionStudent?.districtName"
                        />
                      </v-list>
                      <v-divider />

                      <v-list>
                        <v-list-item>
                          <v-icon
                            icon="mdi-phone"
                            :start="true"
                          />
                          {{ formatPhoneNumber(sdcSchoolCollectionStudent?.contactInfo?.phoneNumber) }}
                          <template #append>
                            <v-tooltip
                              v-model="showTooltip"
                              location="right"
                              :open-on-hover="false"
                            >
                              <template #activator="{ props }">
                                <v-btn
                                  id="copyPhone"
                                  color="primary"
                                  icon="mdi-content-copy"
                                  variant="text"
                                  v-bind="props"
                                  @click="copy(formatPhoneNumber(sdcSchoolCollectionStudent?.contactInfo?.phoneNumber))"
                                />
                              </template>
                              <span>Copied {{ formatPhoneNumber(sdcSchoolCollectionStudent?.contactInfo?.phoneNumber) }}.</span>
                            </v-tooltip>
                          </template>
                        </v-list-item>
                      </v-list>
                    </v-card>
                  </v-menu>
                </div>
              </template>
            </CustomTable>
          </v-col>
        </v-row>
      </template>
    </v-data-iterator>
    <v-pagination
      v-if="nonAllowableDuplicates?.length > 0"
      v-model="pageNumber"
      :length="Math.ceil(nonAllowableDuplicates?.length/10)"
      total-visible="5"
      rounded="circle"
    />

    <v-row
      v-if="nonAllowableDuplicates?.length === 0"
      class="pt-4"
      no-gutters
    >
      <v-alert
        :id="duplicateType + 'non-allowable-alert'"
        density="compact"
        type="success"
        variant="tonal"
        text="Congratulations! There are no related duplicates and no action required from you on this tab"
      />
    </v-row>
  </template>

  <template v-if="duplicateView==='2'">
    <strong>Duplicate Students Found: {{ allowableDuplicates?.length }}</strong>
    <v-data-iterator
      v-model:page.sync="pageNumber"
      :items="allowableDuplicates"
      :items-per-page="10"
    >
      <template #default="{ items }">
        <v-row
          v-for="duplicate in items"
          :key="duplicate?.raw?.sdcDuplicateID"
          class="pt-4"
          no-gutters
        >
          <v-col class="pa-0">
            <v-row no-gutters>
              <v-col class="pb-2">
                <v-chip color="primary">
                  <v-col>
                    Assigned PEN: {{ duplicate?.raw?.sdcSchoolCollectionStudent1Entity?.assignedPen }}
                  </v-col>
                </v-chip>
              </v-col>
            </v-row>
            <CustomTable
              :headers="headersConfig.allowableTableHeaders"
              :data="[duplicate?.raw?.sdcSchoolCollectionStudent1Entity, duplicate?.raw?.sdcSchoolCollectionStudent2Entity]"
              :is-loading="false"
              :reset="false"
              :total-elements="2"
              :hide-pagination="true"
            />
          </v-col>
        </v-row>
      </template>
    </v-data-iterator>
    <v-pagination
      v-if="allowableDuplicates?.length > 0"
      v-model="pageNumber"
      :length="Math.ceil(allowableDuplicates?.length/10)"
      total-visible="5"
      rounded="circle"
    />
    <v-row
      v-if="allowableDuplicates?.length === 0"
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
    <strong>Duplicate Students Found: {{ resolvedDuplicates?.length }}</strong>
    <v-data-iterator
      v-model:page.sync="pageNumber"
      :items="resolvedDuplicates"
      :items-per-page="10"
    >
      <template #default="{ items }">
        <v-row
          v-for="duplicate in items"
          :key="duplicate?.raw?.sdcDuplicateID"
          class="pt-4"
          no-gutters
        >
          <v-col class="pa-0">
            <v-row no-gutters>
              <v-col class="pb-2">
                <v-chip color="primary">
                  <v-col>
                    Assigned PEN: {{ duplicate?.raw?.sdcSchoolCollectionStudent1Entity?.assignedPen }}
                  </v-col>
                  <v-col
                    v-if="duplicateType==='program'"
                  >
                    Duplicate Program: {{ duplicate?.raw?.programDuplicateTypeCodeDescription }}
                  </v-col>
                </v-chip>
              </v-col>
            </v-row>
            <CustomTable
              :headers="duplicateType ==='program' ? headersConfig.resolvedProgramDuplicateTableHeaders : headersConfig.resolvedTableHeaders"
              :data="[duplicate?.raw?.sdcSchoolCollectionStudent1Entity, duplicate?.raw?.sdcSchoolCollectionStudent2Entity]"
              :is-loading="false"
              :reset="false"
              :total-elements="2"
              :hide-pagination="true"
            />
          </v-col>
        </v-row>
      </template>
    </v-data-iterator>
    <v-pagination
      v-if="resolvedDuplicates?.length > 0"
      v-model="pageNumber"
      :length="Math.ceil(resolvedDuplicates?.length/10)"
      total-visible="5"
      rounded="circle"
    />
    <v-row
      v-if="resolvedDuplicates?.length === 0"
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
    <ProvincialProgramDuplicateResolution
      v-if="duplicateLevel==='PROVINCIAL'"
      :selected-program-duplicate="selectedDuplicate"
      @close="openProgramResolutionView = !openProgramResolutionView"
      @close-refresh="closeAndRefreshDuplicates()"
    />
    <ProgramDuplicateResolution
      v-else
      :selected-program-duplicate="selectedDuplicate"
      @close="openProgramResolutionView = !openProgramResolutionView"
      @close-refresh="closeAndRefreshDuplicates()"
    />
  </v-bottom-sheet>

  <v-dialog
    v-model="openChangeGradeView"
    :max-width="600"
    :inset="true"
    :no-click-animation="true"
    :scrollable="true"
    :persistent="true"
  >
    <ChangeGrade
      :selected-student="selectedSdcSchoolCollectionStudent"
      :selected-duplicate="selectedDuplicate"
      @close="openChangeGradeView = !openChangeGradeView"
      @close-refresh="closeAndRefreshDuplicates()"  
    />
  </v-dialog>
  <EnrollmentDuplicateResolveViaRemove
    ref="resolveEnrollmentDuplicateViaRemoveStudent"
    @close-refresh="closeAndRefreshDuplicates()"
  />
  <ConfirmationDialog ref="confirmMarkDifferent">
    <template #message>
      <p>Requesting the review of the PEN will send the student record to the Ministry staff for review. This action cannot be undone.</p>
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
import {formatPhoneNumber} from '../../utils/format';
import ProvincialProgramDuplicateResolution
  from '../sdcCollection/sdcDistrictCollection/duplicates/ProvincialProgramDuplicateResolution.vue';

export default defineComponent({
  name: 'DuplicateTab',
  components: {
    ConfirmationDialog,
    EnrollmentDuplicateResolveViaRemove,
    CustomTable, 
    ProgramDuplicateResolution,
    ProvincialProgramDuplicateResolution,
    ChangeGrade
  },
  props: {
    duplicateLevel: {
      type: String,
      required: true
    },
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
      selectedSdcSchoolCollectionStudent: {},
      pageNumber: 1,
      contactMenu: [],
      showTooltip: false
    };
  },
  methods: {
    formatPhoneNumber,
    async markStudentAsDifferent(sdcSchoolCollectionStudent){
      const selectedStudent = cloneDeep(sdcSchoolCollectionStudent);
      const confirmation = await this.$refs.confirmMarkDifferent.open('Request Review of PEN?', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Confirm', rejectText: 'Cancel'});
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
    },
    copy(text) {
      navigator.clipboard.writeText(text).then(() => {
        this.showTooltip = true;
        setTimeout(() => this.showTooltip = false, 2000);
      });
    }
  }
});
</script>
<style scoped>
.duplicate-type-button {
  border: 1px solid lightgray;
}
</style>

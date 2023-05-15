<template>
  <v-container
    class="containerSetup"
    fluid
  >
    <div class="inner-border">
      <v-row>
        <v-col
          class="pr-0"
          cols="3"
        >
          <Spinner v-if="isLoading()" />
          <div
            v-else
            class="inner-border"
          >
            <v-row>
              <v-col class="d-flex justify-center">
                <h3>Summary of Data Issues</h3>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="mr-5">
                <v-row>
                  <v-col class="d-flex justify-end">
                    <span>Errors</span>
                  </v-col>
                </v-row>
                <v-row
                  no-gutters
                  class="mt-1"
                >
                  <v-col class="d-flex justify-end">
                    <v-icon
                      size="35"
                      color="#d90606"
                    >
                      mdi-alert-circle-outline
                    </v-icon>
                    <span style="font-size: x-large">{{ summaryCounts.errors }}</span>
                  </v-col>
                </v-row>
              </v-col>
              <v-divider
                :thickness="1"
                inset
                color="#b3b0b0"
                class="border-opacity-75"
                vertical
              />
              <v-col class="ml-5 mr-5">
                <v-row>
                  <v-col class="d-flex justify-start">
                    <span>Warnings</span>
                  </v-col>
                </v-row>
                <v-row
                  no-gutters
                  class="mt-1"
                >
                  <v-col class="d-flex justify-start">
                    <v-icon
                      size="35"
                      color="blue"
                    >
                      mdi-alert-outline
                    </v-icon>
                    <span style="font-size: x-large">{{ summaryCounts.warnings }}</span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </div>
          <div style="border-radius: 5px; background-color: #f6f5f5">
            <v-row>
              <v-col class="mx-4 mt-1">
                <v-row>
                  <v-col class="d-flex justify-center">
                    <v-text-field
                      id="legalUsualNameSearch"
                      placeholder="Legal or Usual Name"
                      density="compact"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col class="ml-5">
                <v-row
                  no-gutters
                  class="mt-1"
                >
                  <v-col
                    cols="5"
                    class="d-flex justify-start"
                  >
                    <v-text-field
                      id="penSearch"
                      placeholder="PEN"
                      density="compact"
                    />
                  </v-col>
                  <v-col class="d-flex justify-end">
                    <PrimaryButton
                      id="clearSearch"
                      secondary
                      width="3em"
                      text="Clear"
                      class="mr-2"
                    />
                  </v-col>
                  <v-col>
                    <PrimaryButton
                      id="searchButton"
                      text="Search"
                      width="6em"
                      class="mr-2"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </div>
          <div>
            <Spinner v-if="isLoading()" />
            <v-data-table-server
              v-model:page="pageNumber"
              else
              :items-per-page="pageSize"
              :items-length="totalStudents"
              :items="studentListData"
              :loading="isLoading()"
              class="mt-2"
              item-title="name"
              item-value="name"
            >
              <template #headers>
                <v-row
                  no-gutters
                  :class="[]"
                  style="border-bottom-style: groove; border-bottom-color: rgb(255 255 255 / 45%);"
                >
                  <v-col
                    cols="5"
                    offset="1"
                  >
                    <v-row>
                      <v-col>
                        <span class="headerVal">PEN</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <span class="headerVal">Local ID</span>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="5">
                    <v-row>
                      <v-col>
                        <span class="headerVal">Legal Name</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <span class="headerVal">Usual Name</span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </template>
              <template #item="{ item, index }">
                <v-row
                  id="sdcStudentDataRow"
                  :class="tableRowClass(item.value.sdcSchoolCollectionStudentID, index)"
                  no-gutters
                  style="border-bottom-style: groove; border-bottom-color: rgb(255 255 255 / 45%);"
                  @click="studentSelected(item.value.sdcSchoolCollectionStudentID)"
                >
                  <v-col cols="1">
                    <v-icon
                      class="mt-2"
                      size="25"
                      :color="getIssueIconColor(item.value.sdcSchoolCollectionStudentStatusCode)"
                    >
                      {{ getIssueIcon(item.value.sdcSchoolCollectionStudentStatusCode) }}
                    </v-icon>
                  </v-col>
                  <v-col cols="5">
                    <v-row no-gutters>
                      <v-col>
                        <span class="tableItemVal">{{ item.value.studentPen }}</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <span class="tableItemVal">{{ item.value.localID }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col>
                    <v-row no-gutters>
                      <v-col>
                        <span class="tableItemVal">{{ `${item.value.legalLastName} ${item.value.legalFirstName}` }}</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <span class="tableItemVal">{{ `${item.value.usualLastName} ${item.value.usualFirstName}` }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </template>
            </v-data-table-server>
          </div>
        </v-col>
        <v-col cols="9">
          <Spinner v-if="isLoading()" />
          <div
            v-else
            class="inner-border"
          >
            <v-row>
              <v-col cols="6">
                <v-row>
                  <v-col class="d-flex justify-start">
                    <h3>Student Record</h3>
                  </v-col>
                  <v-col class="d-flex justify-end">
                    <PrimaryButton
                      id="removeRecord"
                      secondary
                      large-icon
                      icon="mdi-trash-can-outline"
                      text="Remove Record"
                      class="mt-n1"
                    />
                  </v-col>
                </v-row>
                <v-row class="mt-6">
                  <v-col cols="12">
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          id="studentPen"
                          v-model="sdcSchoolCollectionStudentDetailCopy.studentPen"
                          label="PEN"
                          density="compact"
                          variant="plain"
                          readonly
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="studentLocalID"
                          v-model="sdcSchoolCollectionStudentDetailCopy.localID"
                          label="Local ID"
                          density="compact"
                          variant="plain"
                          readonly
                        />
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          id="studentDob"
                          v-model="sdcSchoolCollectionStudentDetailCopy.dob"
                          label="Birthdate"
                          density="compact"
                          variant="plain"
                          readonly
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="studentGender"
                          v-model="sdcSchoolCollectionStudentDetailCopy.gender"
                          label="Gender"
                          density="compact"
                          variant="plain"
                          readonly
                        />
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          id="studentLegalLastName"
                          v-model="sdcSchoolCollectionStudentDetailCopy.legalLastName"
                          label="Legal Surname"
                          density="compact"
                          variant="plain"
                          readonly
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="studentUsualLastName"
                          v-model="sdcSchoolCollectionStudentDetailCopy.usualLastName"
                          label="Usual Surname"
                          density="compact"
                          variant="plain"
                          readonly
                        />
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          id="studentLegalFirstName"
                          v-model="sdcSchoolCollectionStudentDetailCopy.legalFirstName"
                          label="Legal Given"
                          density="compact"
                          variant="plain"
                          readonly
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="studentUsualFirstName"
                          v-model="sdcSchoolCollectionStudentDetailCopy.usualFirstName"
                          label="Usual Given"
                          density="compact"
                          variant="plain"
                          readonly
                        />
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          id="studentLegalMiddleNames"
                          v-model="sdcSchoolCollectionStudentDetailCopy.legalMiddleNames"
                          label="Legal Middle"
                          density="compact"
                          variant="plain"
                          readonly
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="studentUsualMiddleNames"
                          v-model="sdcSchoolCollectionStudentDetailCopy.usualMiddleNames"
                          label="Usual Middle"
                          density="compact"
                          variant="plain"
                          readonly
                        />
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          id="studentEnrolledGradeCode"
                          label="Grade"
                          density="compact"
                          variant="plain"
                          readonly
                          :model-value="getEnrolledGradeCodesLabel(sdcSchoolCollectionStudentDetailCopy.enrolledGradeCode)"
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="studentSchoolFundingCode"
                          label="Funding Code"
                          density="compact"
                          variant="plain"
                          readonly
                          :model-value="getSchoolFundingCodeLabel(sdcSchoolCollectionStudentDetailCopy.schoolFundingCode)"
                        />
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          id="studentNumberOfCourses"
                          v-model="sdcSchoolCollectionStudentDetailCopy.numberOfCourses"
                          label="Number of Courses"
                          density="compact"
                          variant="plain"
                          readonly
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="studentOtherCourses"
                          v-model="sdcSchoolCollectionStudentDetailCopy.otherCourses"
                          label="Other Courses"
                          density="compact"
                          variant="plain"
                          readonly
                        />
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          id="studentSupportBlocks"
                          v-model="sdcSchoolCollectionStudentDetailCopy.supportBlocks"
                          label="Support Blocks"
                          density="compact"
                          variant="plain"
                          readonly
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="studentSpecialEducationCategoryCode"
                          label="Special Ed. Category"
                          density="compact"
                          variant="plain"
                          readonly
                          :model-value="getSpecialEducationCodesLabel(sdcSchoolCollectionStudentDetailCopy.specialEducationCategoryCode)"
                        />
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          id="studentNativeAncestryInd"
                          v-model="sdcSchoolCollectionStudentDetailCopy.nativeAncestryInd"
                          label="Indigenous Ancestry"
                          density="compact"
                          variant="plain"
                          readonly
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="studentBandCode"
                          label="Band of Residence"
                          density="compact"
                          variant="plain"
                          readonly
                          :model-value="getBandCodesLabel(sdcSchoolCollectionStudentDetailCopy.bandCode)"
                        />
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          id="studentHomeLanguageSpokenCode"
                          label="Home Language"
                          density="compact"
                          variant="plain"
                          readonly
                          :model-value="getHomeLanguageSpokenCodesLabel(sdcSchoolCollectionStudentDetailCopy.homeLanguageSpokenCode)"
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="studentPostalCode"
                          v-model="sdcSchoolCollectionStudentDetailCopy.postalCode"
                          label="Postal Code"
                          density="compact"
                          variant="plain"
                          readonly
                        />
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          id="studentCareerProgramCode"
                          label="Career Code"
                          density="compact"
                          variant="plain"
                          readonly
                          :model-value="getCareerProgramCodesLabel(sdcSchoolCollectionStudentDetailCopy.careerProgramCode)"
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="studentEnrolledProgramCodes"
                          label="Program Codes"
                          density="compact"
                          variant="plain"
                          readonly
                          :model-value="sdcSchoolCollectionStudentDetailCopy.enrolledProgramCodes"
                        />
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
              <v-divider
                :thickness="1"
                inset
                color="#b3b0b0"
                class="border-opacity-75 mt-16"
                vertical
              />
              <v-col>
                <v-row>
                  <v-col class="d-flex justify-end">
                    <PrimaryButton
                      id="revertChanges"
                      secondary
                      large-icon
                      icon="mdi-arrow-u-left-top"
                      text="Revert Changes"
                      class="mt-n1"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col class="pl-0 pr-6 scroll">
                    <v-timeline
                      v-if="sdcSchoolCollectionStudentDetailCopy.sdcSchoolCollectionStudentValidationIssues"
                      side="end"
                      align="start"
                      truncate-line="start"
                    >
                      <v-timeline-item
                        v-for="(issue) in formatAndSortValidationIssues(sdcSchoolCollectionStudentDetailCopy.sdcSchoolCollectionStudentValidationIssues)"
                        :key="issue.sdcSchoolCollectionStudentValidationIssueID"
                        dot-color="white"
                        fill-dot
                        :icon-color="getIssueIconColor(issue.validationIssueSeverityCode)"
                        :icon="getIssueIcon(issue.validationIssueSeverityCode)"
                        size="large"
                        width="100%"
                      >
                        <v-row class="mt-n1">
                          <v-col>
                            <h3 :style="`color:` + getIssueIconColor(issue.validationIssueSeverityCode)">
                              {{ getValidationIssueSeverityCodeLabel(issue.validationIssueSeverityCode) }}
                            </h3>
                          </v-col>
                        </v-row>
                        <v-row no-gutters>
                          <v-col>
                            <span> {{ getValidationIssueTypeCodesDescription(issue.validationIssueCode) }}</span>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col>
                            <div
                              v-for="(field) in issue.validationIssueFieldCode"
                              :key="field"
                            >
                              <v-text-field
                                v-if="SDC_VALIDATION_FIELD_MAPPINGS[field].type === 'input'"
                                :id="`${SDC_VALIDATION_FIELD_MAPPINGS[field].key}ValidationTextInput`"
                                v-model:model-value="sdcSchoolCollectionStudentDetailCopy[SDC_VALIDATION_FIELD_MAPPINGS[field].key]"
                                :label="SDC_VALIDATION_FIELD_MAPPINGS[field].label"
                                :rules="SDC_VALIDATION_FIELD_MAPPINGS[field].options.rules"
                                density="compact"
                                variant="underlined"
                              />
                              <v-autocomplete
                                v-else-if="SDC_VALIDATION_FIELD_MAPPINGS[field].type === 'select'"
                                :id="`${SDC_VALIDATION_FIELD_MAPPINGS[field].key}ValidationDropdown`"
                                v-model="sdcSchoolCollectionStudentDetailCopy[SDC_VALIDATION_FIELD_MAPPINGS[field].key]"
                                :rules="SDC_VALIDATION_FIELD_MAPPINGS[field].options.rules"
                                :items="sdcCollectionStore[SDC_VALIDATION_FIELD_MAPPINGS[field].options.items]"
                                :item-value="SDC_VALIDATION_FIELD_MAPPINGS[field].options.itemValue"
                                item-title="dropdownText"
                                :label="SDC_VALIDATION_FIELD_MAPPINGS[field].label"
                              />
                              <v-autocomplete
                                v-else-if="SDC_VALIDATION_FIELD_MAPPINGS[field].type === 'multiselect'"
                                :id="`${SDC_VALIDATION_FIELD_MAPPINGS[field].key}ValidationMultiSelect`"
                                v-model="sdcSchoolCollectionStudentDetailCopy[SDC_VALIDATION_FIELD_MAPPINGS[field].key]"
                                :rules="SDC_VALIDATION_FIELD_MAPPINGS[field].options.rules"
                                :items="sdcCollectionStore[SDC_VALIDATION_FIELD_MAPPINGS[field].options.items]"
                                :item-value="SDC_VALIDATION_FIELD_MAPPINGS[field].options.itemValue"
                                item-title="dropdownText"
                                :label="SDC_VALIDATION_FIELD_MAPPINGS[field].label"
                                multiple
                                :selectable="() => sdcSchoolCollectionStudentDetailCopy[SDC_VALIDATION_FIELD_MAPPINGS[field].key].length < 8"
                                @update:model-value="syncWithEnrolledProgramCodeOnUserInput"
                              />
                              <div v-else-if="SDC_VALIDATION_FIELD_MAPPINGS[field].type === 'datePicker'">
                                <v-menu
                                  id="dobValidationDatePicker"
                                  ref="dobDateFilter"
                                  :close-on-content-click="false"
                                  transition="scale-transition"
                                  offset-y
                                  min-width="auto"
                                >
                                  <template #activator="{ on, attrs }">
                                    <v-text-field
                                      :id="`${SDC_VALIDATION_FIELD_MAPPINGS[field].key}ValidationDatePicker`"
                                      v-model="sdcSchoolCollectionStudentDetailCopy[SDC_VALIDATION_FIELD_MAPPINGS[field].key]"
                                      :rules="SDC_VALIDATION_FIELD_MAPPINGS[field].options.rules"
                                      class="pt-0 mt-0"
                                      variant="underlined"
                                      label="Start Date"
                                      prepend-inner-icon="mdi-calendar"
                                      clearable
                                      readonly
                                      v-bind="attrs"
                                      @click:clear="clearDobDate"
                                      @click="openDobDatePicker"
                                    />
                                  </template>
                                </v-menu>
                                <VueDatePicker
                                  ref="dobDatePicker"
                                  v-model="sdcSchoolCollectionStudentDetailCopy[SDC_VALIDATION_FIELD_MAPPINGS[field].key]"
                                  :rules="SDC_VALIDATION_FIELD_MAPPINGS[field].options.rules"
                                  :enable-time-picker="false"
                                  format="yyyy-MM-dd"
                                  @update:model-value="saveDobDate"
                                />
                              </div>
                            </div>
                          </v-col>
                        </v-row>
                      </v-timeline-item>
                    </v-timeline>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="d-flex justify-center">
                <v-btn
                  icon="mdi-arrow-left-circle-outline"
                  size="35"
                  class="mr-2"
                  variant="text"
                  :disabled="disablePreviousSdcSchoolCollectionStudentNavigation()"
                  @click="previousSdcSchoolCollectionStudent"
                />
                <PrimaryButton
                  id="saveAndRefreshButton"
                  text="Save & Refresh List"
                />
                <v-btn
                  icon="mdi-arrow-right-circle-outline"
                  size="35"
                  class="ml-2"
                  variant="text"
                  :disabled="disableNextSdcSchoolCollectionStudentNavigation()"
                  @click="nextSdcSchoolCollectionStudent"
                />
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
      <v-row
        v-if="nextButtonIsDisabled()"
        justify="end"
      >
        <p class="form-hint">
          All errors must be fixed
        </p>
      </v-row>
      <v-row justify="end">
        <PrimaryButton
          id="nextButton"
          class="mr-2 mb-3"
          icon="mdi-check"
          text="Next"
          :disabled="nextButtonIsDisabled()"
          :click-action="next"
        />
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import {SDC_VALIDATION_FIELD_MAPPINGS} from '../../utils/sdc/sdcValidationFieldMappings';
import {isEmpty, omitBy, cloneDeep, sortBy} from 'lodash';
import {formatDate} from '../../utils/format';
import moment from 'moment/moment';

//components
import Spinner from '../common/Spinner.vue';
import PrimaryButton from '../util/PrimaryButton.vue';
import VueDatePicker from '@vuepic/vue-datepicker';

import {setFailureAlert} from '../composable/alertComposable';

//pinia store
import { useSdcCollectionStore } from '../../store/modules/sdcCollection';
const sdcCollectionStore = useSdcCollectionStore();

const props = defineProps({
  schoolCollectionObject: {
    type: Object,
    required: true,
    default: null
  }
});

const emit = defineEmits(['next']);

onMounted(() => {
  sdcCollectionStore.getCodes().then(() => {
    getSummaryCounts();
    getSDCSchoolCollectionStudentPaginated();
  });
});

//next logic
const next = () => {
  if(sdcCollectionStore.currentStepInCollectionProcess.isComplete) {
    emit('next');
  } else {
    markStepAsComplete();
  }
};

const markStepAsComplete = () => {
  let updateCollection = {
    schoolCollection: props.schoolCollectionObject,
    status: 'REVIEWED'
  };
  ApiService.apiAxios.put(`${ApiRoutes.sdc.BASE_URL}/${route.params.schoolCollectionID}`, updateCollection)
    .then(() => {
      emit('next');
    })
    .catch(error => {
      console.error(error);
      setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while verifying school details. Please try again later.');
    });
};

const nextButtonIsDisabled = () => {
  return summaryCounts.value.errors > 0 || isLoading();
};
//end next logic

//page summary counts
const loadingCount = ref(0);
const summaryCounts = ref({errors: 0, warnings: 0});

const getSummaryCounts = () => {
  loadingCount.value += 1;

  ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${route.params.schoolCollectionID}/summaryCounts`, {
  }).then(response => {
    summaryCounts.value = response.data;
  }).catch(error => {
    console.error(error);
    setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get summary counts. Please try again later.');
  }).finally(() => {
    loadingCount.value -= 1;
  });
};

//sdc school collection student list pagination
const headerSearchParams = ref({
  penNumber: '',
  sdcSchoolCollectionStudentStatusCode: 'ERROR, WARNING'
});

const pageNumber = ref(1);
const pageSize = ref(10);
const studentListData = ref([]);
const totalStudents = ref(0);

const selectedSdcStudentID = ref();
const selectedSdcStudentIndex = ref(0);

watch(pageNumber, () => {
  getSDCSchoolCollectionStudentPaginated();
});

const getSDCSchoolCollectionStudentPaginated = () => {
  loadingCount.value += 1;

  ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${route.params.schoolCollectionID}/paginated`, {
    params: {
      pageNumber: pageNumber.value - 1,
      pageSize: pageSize.value,
      searchParams: omitBy(headerSearchParams.value, isEmpty),
    }
  }).then(response => {
    studentListData.value = response.data.content;
    totalStudents.value = response.data.totalElements;
    selectedSdcStudentID.value = response.data.content[0]?.sdcSchoolCollectionStudentID;
  }).catch(error => {
    console.error(error);
    setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get sdc school collection students paginated. Please try again later.');
  }).finally(() => {
    loadingCount.value -= 1;
  });
};

//arrow navigation
watch(selectedSdcStudentID, (sdcSchoolCollectionStudentID) => {
  getSdcSchoolCollectionStudentDetail(sdcSchoolCollectionStudentID);
});

const studentSelected = (sdcSchoolCollectionStudentID) => {
  selectedSdcStudentID.value = sdcSchoolCollectionStudentID;
};

const nextSdcSchoolCollectionStudent = () => {
  selectedSdcStudentIndex.value = selectedSdcStudentIndex.value + 1;
  selectedSdcStudentID.value = studentListData.value[selectedSdcStudentIndex.value].sdcSchoolCollectionStudentID;
};

const previousSdcSchoolCollectionStudent = () => {
  selectedSdcStudentIndex.value = selectedSdcStudentIndex.value - 1;
  selectedSdcStudentID.value = studentListData.value[selectedSdcStudentIndex.value].sdcSchoolCollectionStudentID;
};

const disableNextSdcSchoolCollectionStudentNavigation = () => {
  return selectedSdcStudentIndex.value === studentListData.value.length - 1;
};

const disablePreviousSdcSchoolCollectionStudentNavigation = () => {
  return selectedSdcStudentIndex.value === 0;
};

const tableRowClass = (sdcSchoolCollectionStudentID, index) => {
  let rowClass = ['hoverTable'];
  if (sdcSchoolCollectionStudentID === selectedSdcStudentID.value) {
    rowClass.push('isSelected');
    selectedSdcStudentIndex.value = index;
  }
  return  rowClass;
};
//end arrow navigation

//sdc student details
let sdcSchoolCollectionStudentDetail = ref({});
let sdcSchoolCollectionStudentDetailCopy = ref({});

const getSdcSchoolCollectionStudentDetail = (sdcSchoolCollectionStudentID) => {
  loadingCount.value += 1;

  ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${route.params.schoolCollectionID}/${sdcSchoolCollectionStudentID}`)
    .then(response => {
      let filteredResponse = {...response.data, filteredEnrolledProgramCodes: filterEnrolledProgramCodes(response.data.enrolledProgramCodes), dob: formatDate(response.data.dob, from, pickerFormat)};

      sdcSchoolCollectionStudentDetail.value = filteredResponse;
      sdcSchoolCollectionStudentDetailCopy.value = cloneDeep(filteredResponse);
    }).catch(error => {
      console.error(error);
      setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get student detail counts. Please try again later.');
    }).finally(() => {
      loadingCount.value -= 1;
    });
};

const filterEnrolledProgramCodes = (enrolledProgramCodes = []) => {
  return enrolledProgramCodes.filter(enrolledProgramCode => sdcCollectionStore.enrolledProgramCodesMap.has(enrolledProgramCode));
};

const syncWithEnrolledProgramCodeOnUserInput = (value) => {
  sdcSchoolCollectionStudentDetailCopy.value.enrolledProgramCodes = value;
};

const getBandCodesLabel = (key) => {
  let label = key;
  if (sdcCollectionStore.bandCodesMap.get(key)) {
    label = `${sdcCollectionStore.bandCodesMap.get(key)?.bandCode} - ${sdcCollectionStore.bandCodesMap.get(key)?.label}`;
  }
  return label;
};

const getCareerProgramCodesLabel = (key) => {
  let label = key;
  if (sdcCollectionStore.careerProgramCodesMap.get(key)) {
    label = `${sdcCollectionStore.careerProgramCodesMap.get(key)?.careerProgramCode} - ${sdcCollectionStore.careerProgramCodesMap.get(key)?.label}`;
  }
  return label;
};

const getEnrolledGradeCodesLabel = (key) => {
  let label = key;
  if (sdcCollectionStore.enrolledGradeCodesMap.get(key)) {
    label = `${sdcCollectionStore.enrolledGradeCodesMap.get(key)?.enrolledGradeCode} - ${sdcCollectionStore.enrolledGradeCodesMap.get(key)?.label}`;
  }
  return label;
};

const getHomeLanguageSpokenCodesLabel = (key) => {
  let label = key;
  if (sdcCollectionStore.homeLanguageSpokenCodesMap.get(key)) {
    label = `${sdcCollectionStore.homeLanguageSpokenCodesMap.get(key)?.homeLanguageSpokenCode} - ${sdcCollectionStore.homeLanguageSpokenCodesMap.get(key)?.label}`;
  }
  return label;
};

const getSchoolFundingCodeLabel = (key) => {
  let label = key;
  if (sdcCollectionStore.schoolFundingCodesMap.get(key)) {
    label = `${sdcCollectionStore.schoolFundingCodesMap.get(key)?.schoolFundingCode} - ${sdcCollectionStore.schoolFundingCodesMap.get(key)?.label}`;
  }
  return label;
};

const getSpecialEducationCodesLabel = (key) => {
  let label = key;
  if (sdcCollectionStore.specialEducationCodesMap.get(key)) {
    label = `${sdcCollectionStore.specialEducationCodesMap.get(key)?.specialEducationCode} - ${sdcCollectionStore.specialEducationCodesMap.get(key)?.label}`;
  }
  return label;
};

const getValidationIssueTypeCodesDescription = (key) => {
  return sdcCollectionStore.validationIssueTypeCodesMap.get(key)?.message;
};

const getValidationIssueSeverityCodeLabel = (severityCode) => {
  if (severityCode === 'ERROR') {
    return 'Error';
  } else if (severityCode === 'WARNING') {
    return 'Warning';
  }
};

const formatAndSortValidationIssues = (validationIssues = []) => {
  let validationIssueMap = new Map();
  for (let issue of validationIssues) {
    if (!validationIssueMap.has(issue.validationIssueCode)) {
      validationIssueMap.set(issue.validationIssueCode, {...issue, validationIssueFieldCode: [issue.validationIssueFieldCode]});
    } else {
      validationIssueMap.get(issue.validationIssueCode).validationIssueFieldCode.push(issue.validationIssueFieldCode);
    }
  }

  return sortBy(Array.from(validationIssueMap.values()), ['validationIssueSeverityCode']);
};

const getIssueIcon = (issue) => {
  switch (issue) {
  case 'ERROR':
    return 'mdi-alert-circle-outline';
  case 'WARNING':
    return 'mdi-alert-outline';
  default:
    return '';
  }
};

const getIssueIconColor = (issue) => {
  switch (issue) {
  case 'ERROR':
    return '#d90606';
  case 'WARNING':
    return '#2196F3';
  default:
    return '';
  }
};
//end sdc student details

//date picker functions
const dobDatePicker = ref(null);
const from = 'uuuuMMdd';
const pickerFormat = 'uuuu-MM-dd';

const clearDobDate = () => {
  sdcSchoolCollectionStudentDetailCopy.value.dob = null;
};

const openDobDatePicker = () => {
  dobDatePicker.value[0].openMenu();
};

const saveDobDate = () => {
  sdcSchoolCollectionStudentDetailCopy.value.dob = moment(sdcSchoolCollectionStudentDetailCopy.value.dob).format('YYYY-MM-DD').toString();
};
//end date picker functions

const isLoading = () => {
  return loadingCount.value > 0;
};

</script>
      
<style scoped>
 .containerSetup{
    padding-right: 0em !important;
    padding-left: 0em !important;
  }

  .border {
    border: 2px solid grey;
    border-radius: 5px;
    padding: 35px;
    margin-bottom: 2em;
  }

 .inner-border {
     border: 1px solid grey;
     border-radius: 5px;
     padding: 20px;
     margin-bottom: 2em;
 }

  @media screen and (max-width: 1200px) {
    .containerSetup{
      padding-right: 3em !important;
      padding-left: 3em !important;
    }
  }

 :deep(.v-data-table-footer__items-per-page) {
     display: none;
 }

 .hoverTable:hover{
     background-color: #e8e8e8;
     cursor: pointer;
 }

 .headerVal{
    color: #7f7f7f;
 }

 .isSelected{
   background-color: #E1F5FE;
 }

 .tableItemVal{
     font-size: small;
 }

 .scroll{
   overflow-y: auto;
   overflow-x: hidden;
   height: 100vh;
 }

 :deep(.dp__input_wrap){
   height: 0px;
   width: 0px;
 }

 :deep(.dp__input){
   display: none;
 }

 :deep(.dp__icon){
   display: none;
 }

 .form-hint{
   color: rgb(56, 89, 138);
   font-size: 14px;
 }
</style>





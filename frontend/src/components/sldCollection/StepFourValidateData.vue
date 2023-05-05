<template>
  <v-container 
    class="containerSetup"
    fluid
  >
    <div class="inner-border">
      <v-row>
        <v-col class="pr-0" cols="3">
          <Spinner v-if="isLoading()"/>
          <div class="inner-border" v-else>
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
                <v-row no-gutters class="mt-1">
                  <v-col class="d-flex justify-end">
                    <v-icon size="35" color="#d90606">mdi-alert-circle-outline</v-icon>
                    <span style="font-size: x-large">{{summaryCounts.errors}}</span>
                  </v-col>
                </v-row>
              </v-col>
              <v-divider :thickness="1" inset color="#b3b0b0" class="border-opacity-75" vertical></v-divider>
              <v-col class="ml-5 mr-5">
                <v-row>
                  <v-col class="d-flex justify-start">
                    <span>Warnings</span>
                  </v-col>
                </v-row>
                <v-row no-gutters class="mt-1">
                  <v-col class="d-flex justify-start">
                    <v-icon size="35" color="blue">mdi-alert-outline</v-icon>
                    <span style="font-size: x-large">{{summaryCounts.warnings}}</span>
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
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col class="ml-5">
                <v-row no-gutters class="mt-1">
                  <v-col cols="5" class="d-flex justify-start">
                    <v-text-field
                      id="penSearch"
                      placeholder="PEN"
                      density="compact"
                    ></v-text-field>
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
            <v-data-table-server
              :items-per-page="pageSize"
              v-model:page="pageNumber"
              :headers="headers"
              :items-length="totalStudents"
              :items="studentListData"
              :loading="isLoading()"
              class="mt-2"
              item-title="name"
              item-value="name"

            >
              <template v-slot:headers>
                <v-row no-gutters style="border-bottom-style: groove; border-bottom-color: rgb(255 255 255 / 45%);">
                  <v-col cols="5" offset="1">
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
              <template v-slot:item="{ item, index }">
                <v-row @click="studentSelected(item.value.sdcSchoolCollectionStudentID)" class="hoverTable" no-gutters style="border-bottom-style: groove; border-bottom-color: rgb(255 255 255 / 45%);">
                  <v-col cols="1">
                    <v-icon class="mt-2" size="25" :color="getIssueIconColor(item.value.sdcSchoolCollectionStudentStatusCode)">{{getIssueIcon(item.value.sdcSchoolCollectionStudentStatusCode)}}</v-icon>
                  </v-col>
                  <v-col cols="5">
                    <v-row no-gutters>
                      <v-col>
                        <span class="tableItemVal">{{item.value.studentPen}}</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <span class="tableItemVal">{{item.value.localID}}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col>
                    <v-row no-gutters>
                      <v-col>
                        <span class="tableItemVal">{{`${item.value.legalLastName} ${item.value.legalFirstName}`}}</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <span class="tableItemVal">{{`${item.value.usualLastName} ${item.value.usualFirstName}`}}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </template>
            </v-data-table-server>
          </div>
        </v-col>
        <v-col cols="9">
          <Spinner v-if="isLoading()"/>
          <div class="inner-border" v-else>
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
                          label="PEN"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetailCopy.studentPen"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Local ID"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetailCopy.localID"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          label="Birthdate"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetailCopy.dob"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Gender"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetailCopy.gender"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          label="Legal Surname"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetailCopy.legalLastName"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Usual Surname"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetailCopy.usualLastName"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          label="Legal Given"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetailCopy.legalFirstName"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Usual Given"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetailCopy.usualFirstName"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          label="Legal Middle"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetailCopy.legalMiddleNames"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Usual Middle"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetailCopy.usualMiddleNames"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          label="Grade"
                          density="compact"
                          variant="plain"
                          readonly
                          :model-value="getEnrolledGradeCodesLabel(sdcSchoolCollectionStudentDetailCopy.enrolledGradeCode)"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Funding Code"
                          density="compact"
                          variant="plain"
                          readonly
                          :model-value="getSchoolFundingCodeLabel(sdcSchoolCollectionStudentDetailCopy.schoolFundingCode)"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          label="Number of Courses"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetailCopy.numberOfCourses"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Other Courses"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetailCopy.otherCourses"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          label="Support Blocks"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetailCopy.supportBlocks"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Special Ed. Category"
                          density="compact"
                          variant="plain"
                          readonly
                          :model-value="getSpecialEducationCodesLabel(sdcSchoolCollectionStudentDetailCopy.specialEducationCategoryCode)"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          label="Indigenous Ancestry"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetailCopy.nativeAncestryInd"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Band of Residence"
                          density="compact"
                          variant="plain"
                          readonly
                          :model-value="getBandCodesLabel(sdcSchoolCollectionStudentDetailCopy.bandCode)"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          label="Home Language"
                          density="compact"
                          variant="plain"
                          readonly
                          :model-value="getHomeLanguageSpokenCodesLabel(sdcSchoolCollectionStudentDetailCopy.homeLanguageSpokenCode)"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Postal Code"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetailCopy.postalCode"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          label="Career Code"
                          density="compact"
                          variant="plain"
                          readonly
                          :model-value="getCareerProgramCodesLabel(sdcSchoolCollectionStudentDetailCopy.careerProgramCode)"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Program Codes"
                          density="compact"
                          variant="plain"
                          readonly
                          :model-value="getEnrolledProgramCodesLabel(sdcSchoolCollectionStudentDetailCopy.enrolledProgramCodes)"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
              <v-divider :thickness="1" inset color="#b3b0b0" class="border-opacity-75 mt-16" vertical></v-divider>
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
                        v-for="(issue) in sdcSchoolCollectionStudentDetailCopy.sdcSchoolCollectionStudentValidationIssues"
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
                            <h3 :style="`color:` + getIssueIconColor(issue.validationIssueSeverityCode)">{{ issue.validationIssueSeverityCode }}</h3>
                          </v-col>
                        </v-row>
                        <v-row no-gutters>
                          <v-col>
                            <span> {{ getValidationIssueTypeCodesDescription(issue.validationIssueCode) }}</span>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col>
                            <v-text-field
                                v-if="SDC_VALIDATION_FIELD_MAPPINGS[issue.validationIssueFieldCode].type === 'input'"
                                :label="SDC_VALIDATION_FIELD_MAPPINGS[issue.validationIssueFieldCode].label"
                                density="compact"
                                variant="underlined"
                                v-model:model-value="sdcSchoolCollectionStudentDetailCopy[SDC_VALIDATION_FIELD_MAPPINGS[issue.validationIssueFieldCode].key]"
                            />
                            <v-autocomplete
                                v-else-if="SDC_VALIDATION_FIELD_MAPPINGS[issue.validationIssueFieldCode].type === 'select'"
                                v-model="sdcSchoolCollectionStudentDetailCopy[SDC_VALIDATION_FIELD_MAPPINGS[issue.validationIssueFieldCode].key]"
                                :items="sldCollectionStore[SDC_VALIDATION_FIELD_MAPPINGS[issue.validationIssueFieldCode].options.items]"
                                :item-value="SDC_VALIDATION_FIELD_MAPPINGS[issue.validationIssueFieldCode].options.itemValue"
                                item-title="dropdownText"
                                :label="SDC_VALIDATION_FIELD_MAPPINGS[issue.validationIssueFieldCode].label"
                            />
                            <v-autocomplete
                                v-else-if="SDC_VALIDATION_FIELD_MAPPINGS[issue.validationIssueFieldCode].type === 'multiselect'"
                                v-model="sdcSchoolCollectionStudentDetailCopy[SDC_VALIDATION_FIELD_MAPPINGS[issue.validationIssueFieldCode].key]"
                                :items="sldCollectionStore[SDC_VALIDATION_FIELD_MAPPINGS[issue.validationIssueFieldCode].options.items]"
                                :item-value="SDC_VALIDATION_FIELD_MAPPINGS[issue.validationIssueFieldCode].options.itemValue"
                                item-title="dropdownText"
                                :label="SDC_VALIDATION_FIELD_MAPPINGS[issue.validationIssueFieldCode].label"
                                multiple
                                :selectable="() => sdcSchoolCollectionStudentDetailCopy[SDC_VALIDATION_FIELD_MAPPINGS[issue.validationIssueFieldCode].key].length < 8"
                                @update:modelValue="syncWithEnrolledProgramCodeOnUserInput"
                            />
                              <!--                            <div v-for="(field,index) in issue.validationIssueFieldCode"-->
<!--                                 :key="field.fieldName">-->
<!--                              <v-text-field-->
<!--                                :label="field.fieldName"-->
<!--                                density="compact"-->
<!--                                variant="underlined"-->
<!--                                v-model="field.fieldValue"-->
<!--                              >-->
<!--                              </v-text-field>-->
<!--                            </div>-->
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
                >
                </v-btn>
                <PrimaryButton
                  id="saveAndRefreshButton"
                  text="Save & Refresh List"
                />
                <v-btn
                  icon="mdi-arrow-right-circle-outline"
                  size="35"
                  class="ml-2"
                  variant="text"
                >
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import _ from 'lodash';
const route = useRoute();
import ApiService from '../../common/apiService';
import {ApiRoutes, SDC_VALIDATION_FIELD_MAPPINGS} from '../../utils/constants';
import {isEmpty, omitBy} from 'lodash';
import {ALERT_NOTIFICATION_TYPES} from '../../utils/constants/AlertNotificationTypes';

//components
import Spinner from '../common/Spinner.vue';
import PrimaryButton from '../util/PrimaryButton.vue';

import { appStore } from '../../store/modules/app';
import { useSldCollectionStore } from '../../store/modules/sldCollection';

const useAppStore = appStore();
const sldCollectionStore = useSldCollectionStore();


onMounted(() => {
  sldCollectionStore.getCodes().then(() => {
    getSummaryCounts();
    getSDCSchoolCollectionStudentPaginated();
  });
});

const loadingCount = ref(0);
const summaryCounts = ref({errors: 0, warnings: 0});

const getSummaryCounts = () => {
  loadingCount.value += 1;

  ApiService.apiAxios.get(`${ApiRoutes.sld.SLD_SCHOOL_COLLECTION_STUDENT}/${route.params.schoolCollectionID}/summaryCounts`, {
  }).then(response => {
    summaryCounts.value = response.data;
  }).catch(error => {
    console.error(error);
    useAppStore.addAlertNotification({text: error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get summary counts. Please try again later.', alertType: ALERT_NOTIFICATION_TYPES.ERROR});
  }).finally(() => {
    loadingCount.value -= 1;
  });
};

//sdc school collection student list pagination
const headerSearchParams = ref({
  penNumber: '',
});

const pageNumber = ref(1);
const pageSize = ref(10);
const studentListData = ref([]);
const totalStudents = ref(0);
const headers = ref([
  {
    title: 'PEN',
    align: 'start',
    sortable: false,
    key: 'name',
  },
  { title: 'Local ID', key: 'calories', align: 'end' }
]);

watch(pageNumber, () => {
  getSDCSchoolCollectionStudentPaginated();
});

const selectedSdcStudentID = ref();

const getSDCSchoolCollectionStudentPaginated = () => {
  loadingCount.value += 1;

  ApiService.apiAxios.get(`${ApiRoutes.sld.SLD_SCHOOL_COLLECTION_STUDENT}/${route.params.schoolCollectionID}/paginated`, {
    params: {
      pageNumber: pageNumber.value - 1,
      pageSize: pageSize.value,
      searchParams: omitBy(headerSearchParams.value, isEmpty),
    }
  }).then(response => {
    console.log(response.data.content);
    studentListData.value = response.data.content;
    totalStudents.value = response.data.totalElements;
    selectedSdcStudentID.value = response.data.content[0].sdcSchoolCollectionStudentID;
  }).catch(error => {
    console.error(error);
    useAppStore.addAlertNotification({text: error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get sdc school collection students paginated. Please try again later.', alertType: ALERT_NOTIFICATION_TYPES.ERROR});
  }).finally(() => {
    loadingCount.value -= 1;
  });
};

let sdcSchoolCollectionStudentDetail = ref({});
let sdcSchoolCollectionStudentDetailCopy = ref({});

watch(selectedSdcStudentID, (sdcSchoolCollectionStudentID) => {
  getSdcSchoolCollectionStudentDetail(sdcSchoolCollectionStudentID);
});

const studentSelected = (sdcSchoolCollectionStudentID) => {
  selectedSdcStudentID.value = sdcSchoolCollectionStudentID;
};

const getSdcSchoolCollectionStudentDetail = (sdcSchoolCollectionStudentID) => {
  loadingCount.value += 1;

  ApiService.apiAxios.get(`${ApiRoutes.sld.SLD_SCHOOL_COLLECTION_STUDENT}/${route.params.schoolCollectionID}/${sdcSchoolCollectionStudentID}`)
    .then(response => {
      let filteredResponse = {...response.data, filteredEnrolledProgramCodes: filterEnrolledProgramCodes(response.data.enrolledProgramCodes)};

      sdcSchoolCollectionStudentDetail.value = filteredResponse;
      sdcSchoolCollectionStudentDetailCopy.value = _.cloneDeep(filteredResponse);
      console.log(response.data);
    }).catch(error => {
      console.error(error);
      useAppStore.addAlertNotification({text: error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get student detail counts. Please try again later.', alertType: ALERT_NOTIFICATION_TYPES.ERROR});
    }).finally(() => {
      loadingCount.value -= 1;
    });
};

const filterEnrolledProgramCodes = (enrolledProgramCodes = []) => {
  return enrolledProgramCodes.filter(enrolledProgramCode => sldCollectionStore.enrolledProgramCodesMap.has(enrolledProgramCode));
};

const syncWithEnrolledProgramCodeOnUserInput = (value) => {
  sdcSchoolCollectionStudentDetailCopy.value.enrolledProgramCodes = value;
};

const isLoading = () => {
  return loadingCount.value > 0;
};

const getBandCodesLabel = (key) => {
  let label = key;
  if (sldCollectionStore.bandCodesMap.get(key)) {
    label = `${sldCollectionStore.bandCodesMap.get(key)?.bandCode} - ${sldCollectionStore.bandCodesMap.get(key)?.label}`;
  }
  return label;
};

const getCareerProgramCodesLabel = (key) => {
  let label = key;
  if (sldCollectionStore.careerProgramCodesMap.get(key)) {
    label = `${sldCollectionStore.careerProgramCodesMap.get(key)?.careerProgramCode} - ${sldCollectionStore.careerProgramCodesMap.get(key)?.label}`;
  }
  return label;
};

const getEnrolledGradeCodesLabel = (key) => {
  let label = key;
  console.log(key);
  if (sldCollectionStore.enrolledGradeCodesMap.get(key)) {
    label = `${sldCollectionStore.enrolledGradeCodesMap.get(key)?.enrolledGradeCode} - ${sldCollectionStore.enrolledGradeCodesMap.get(key)?.label}`;
  }
  return label;
};

const getEnrolledProgramCodesLabel = (text = '') => {
  return(text);
};

const getHomeLanguageSpokenCodesLabel = (key) => {
  let label = key;
  if (sldCollectionStore.homeLanguageSpokenCodesMap.get(key)) {
    label = `${sldCollectionStore.homeLanguageSpokenCodesMap.get(key)?.homeLanguageSpokenCode} - ${sldCollectionStore.homeLanguageSpokenCodesMap.get(key)?.label}`;
  }
  return label;
};

const getSchoolFundingCodeLabel = (key) => {
  let label = key;
  if (sldCollectionStore.schoolFundingCodesMap.get(key)) {
    label = `${sldCollectionStore.schoolFundingCodesMap.get(key)?.schoolFundingCode} - ${sldCollectionStore.schoolFundingCodesMap.get(key)?.label}`;
  }
  return label;
};

const getSpecialEducationCodesLabel = (key) => {
  let label = key;
  if (sldCollectionStore.specialEducationCodesMap.get(key)) {
    label = `${sldCollectionStore.specialEducationCodesMap.get(key)?.specialEducationCode} - ${sldCollectionStore.specialEducationCodesMap.get(key)?.label}`;
  }
  return label;
};

const getValidationIssueTypeCodesDescription = (key) => {
  return sldCollectionStore.validationIssueTypeCodesMap.get(key)?.message;
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

</script>
    
<script>
import alertMixin from '../../mixins/alertMixin';
    
export default {
  name: 'StepFourValidateData',
  mixins: [alertMixin],
  props: {
  },
  emits: ['next'],
  methods: {
    next() {
      this.$emit('next');
    },
  },
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

 .tableItemVal{
     font-size: small;
 }

 .scroll{
   overflow-y: auto;
   overflow-x: hidden;
   height: 100vh;
 }
</style>





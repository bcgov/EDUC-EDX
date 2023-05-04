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
                          v-model="sdcSchoolCollectionStudentDetail.studentPen"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Local ID"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetail.localID"
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
                          v-model="sdcSchoolCollectionStudentDetail.dob"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Gender"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetail.gender"
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
                          v-model="sdcSchoolCollectionStudentDetail.legalLastName"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Usual Surname"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetail.usualLastName"
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
                          v-model="sdcSchoolCollectionStudentDetail.legalFirstName"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Usual Given"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetail.usualFirstName"
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
                          v-model="sdcSchoolCollectionStudentDetail.legalMiddleNames"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Usual Middle"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetail.usualMiddleNames"
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
                          v-model="sdcSchoolCollectionStudentDetail.enrolledGradeCode"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Funding Code"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetail.schoolFundingCode"
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
                          v-model="sdcSchoolCollectionStudentDetail.numberOfCourses"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Other Courses"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetail.otherCourses"
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
                          v-model="sdcSchoolCollectionStudentDetail.supportBlocks"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Special Ed. Category"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetail.specialEducationCategoryCode"
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
                          v-model="sdcSchoolCollectionStudentDetail.nativeAncestryInd"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Band of Residence"
                          density="compact"
                          variant="plain"
                          readonly
                          :v-model="getBandCodesLabel(sdcSchoolCollectionStudentDetail.bandCode)"
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
                          :v-model="getHomeLanguageSpokenCodesLabel(sdcSchoolCollectionStudentDetail.homeLanguageSpokenCode)"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Postal Code"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetail.postalCode"
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
                          :v-model="getCareerProgramCodesLabel(sdcSchoolCollectionStudentDetail.careerProgramCode)"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          label="Program Codes"
                          density="compact"
                          variant="plain"
                          readonly
                          v-model="sdcSchoolCollectionStudentDetail.enrolledProgramCodes"
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
                  <v-col class="pl-0 pr-6">
                    <v-timeline
                      v-if="sdcSchoolCollectionStudentDetail.sdcSchoolCollectionStudentValidationIssues"
                      side="end"
                      align="start"
                      truncate-line="start"
                    >
                      <v-timeline-item
                        v-for="(issue) in sdcSchoolCollectionStudentDetail.sdcSchoolCollectionStudentValidationIssues"
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
                                :label="issue.validationIssueFieldCode"
                                density="compact"
                                variant="underlined"
                                v-model="issue.validationIssueFieldCode"
                            >
                            </v-text-field>
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
const route = useRoute();
import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
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
    useAppStore.addAlertNotification({text: error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get summary counts. Please try again later.', alertType: ALERT_NOTIFICATION_TYPES.ERROR})
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
    useAppStore.addAlertNotification({text: error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get sdc school collection students paginated. Please try again later.', alertType: ALERT_NOTIFICATION_TYPES.ERROR})
  }).finally(() => {
    loadingCount.value -= 1;
  });
};

const sdcSchoolCollectionStudentDetail = ref({});

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
      sdcSchoolCollectionStudentDetail.value = response.data;
      console.log(response.data);
    }).catch(error => {
      console.error(error);
      useAppStore.addAlertNotification({text: error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get student detail counts. Please try again later.', alertType: ALERT_NOTIFICATION_TYPES.ERROR})
    }).finally(() => {
      loadingCount.value -= 1;
    });
};

const isLoading = () => {
  return loadingCount.value > 0;
};

const getBandCodesLabel = (key) => {
  return sldCollectionStore.bandCodesMap.get(key)?.label;
};

const getCareerProgramCodesLabel = (key) => {
  return sldCollectionStore.careerProgramCodesMap.get(key)?.label;
};

const getHomeLanguageSpokenCodesLabel = (key) => {
  return sldCollectionStore.homeLanguageSpokenCodesMap.get(key)?.label;
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
  data() {
    return {
      studentIssues: [
        {
          issueID: '1',
          type: 'Error',
          description: 'PEN reported more than once. Correct the PEN or remove the appropriate student from the submission.',
          fields: [
            {
              fieldName: 'PEN',
              fieldValue: '123456789'
            }
          ]
        },
        {
          issueID: '2',
          type: 'Error',
          description: 'Students must be reported with both a Band of Residence and a Funding Code of Living on Reserve (20). Add or remove both values.',
          fields: [
            {
              fieldName: 'Funding Code',
              fieldValue: '20 - Living on Reserve',
            },
            {
              fieldName: 'Band of Residence',
              fieldValue: ' ',
            }
          ]
        },
        {
          issueID: '3',
          type: 'Warning',
          description: 'Missing Postal Code.',
          fields: [
            {
              fieldName: 'Postal Code',
              fieldValue: ' '
            }
          ]
        },
      ]
    };
  },
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
</style>





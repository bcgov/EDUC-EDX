<template>
  <v-container
    class="containerSetup"
    fluid
  >
    <div class="inner-border">
      <v-row>
        <v-col
          class="pr-0"
          cols="4"
        >
          <Spinner v-if="isLoading()" />
          <div
            v-else
            class="inner-border"
            style="padding: 0;"
          >
            <v-row>
              <v-col>
                <h3 style="text-align: center; padding: 1em;">Data Issues</h3>
              </v-col>
            </v-row>
            <v-row>
              <v-col
                id="warningAndErrorSummary"
                class="d-flex flex-wrap justify-space-evenly"
                style="text-align: center;"
              >
                <div class="flex-grow-1">
                  <span>Errors</span>
                  <br>
                  <v-icon
                    size="35"
                    color="#d90606"
                  >
                    mdi-alert-circle-outline
                  </v-icon>
                  <span style="font-size: x-large">{{ summaryCounts.error }}</span>
                </div>
                <div class="flex-grow-1">
                  <span>Funding Warnings</span>
                  <br>
                  <v-icon
                    size="35"
                    color="orange"
                  >
                    mdi-alert-outline
                  </v-icon>
                  <span style="font-size: x-large">{{ summaryCounts.fundingWarning }}</span>
                </div>
                <div class="flex-grow-1">
                  <span>Info Warnings</span>
                  <br>
                  <v-icon
                    size="35"
                    color="blue"
                  >
                    mdi-alert-circle-outline
                  </v-icon>
                  <span style="font-size: x-large">{{ summaryCounts.infoWarning }}</span>
                </div>
              </v-col>
            </v-row>
          </div>
          <div class="searchBox">
            <v-row>
              <v-col class="mx-4 mt-1">
                <v-row no-gutters>
                  <v-col class="d-flex justify-center">
                    <v-select
                      id="fundingWarningCategorySelect"
                      v-model="fundingWarningCategoryFilter"
                      :items="fundingWarningCategories"
                      item-title="category"
                      item-value="categoryCode"
                      label="Funding Warning Category"
                      density="compact"
                      variant="underlined"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col class="mx-4">
                <v-row>
                  <v-col class="d-flex justify-center">
                    <v-text-field
                      id="legalUsualNameSearch"
                      v-model="legalUsualNameFilter"
                      label="Legal or Usual Name"
                      density="compact"
                      variant="underlined"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col class="ml-5 mb-2">
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
                      v-model="penFilter"
                      label="PEN"
                      density="compact"
                      variant="underlined"
                    />
                  </v-col>
                  <v-col class="d-flex justify-end">
                    <PrimaryButton
                      id="clearSearch"
                      :click-action="clearSearchFields"
                      secondary
                      width="3em"
                      text="Clear"
                      class="mr-2"
                    />
                  </v-col>
                  <v-col>
                    <PrimaryButton
                      id="searchButton"
                      :click-action="getSDCSchoolCollectionStudentPaginated"
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
                    class="mt-3 mb-3"
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
                  <v-col
                    cols="5"
                    class="mt-3 mb-3"
                  >
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
                  :class="tableRowClass(item.raw.sdcSchoolCollectionStudentID, index)"
                  no-gutters
                  style="border-bottom-style: groove; border-bottom-color: rgb(255 255 255 / 45%);"
                  @click="studentSelected(item.raw.sdcSchoolCollectionStudentID)"
                >
                  <v-col cols="1">
                    <v-icon
                      class="mt-2 mr-3"
                      size="25"
                      :color="getIssueIconColor(getStudentStatus(item.raw))"
                    >
                      {{ getIssueIcon(getStudentStatus(item.raw)) }}
                    </v-icon>
                  </v-col>
                  <v-col cols="5">
                    <v-row no-gutters>
                      <v-col>
                        <span class="tableItemVal">{{ fieldOrHyphen(item.raw.studentPen) }}</span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <span class="tableItemVal">{{ fieldOrHyphen(item.raw.localID) }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col>
                    <v-row no-gutters>
                      <v-col>
                        <span class="tableItemVal">
                          {{ getLegalName(item.raw.legalFirstName, item.raw.legalMiddleNames, item.raw.legalLastName) }}
                        </span>
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <span class="tableItemVal">
                          {{ getLegalName(item.raw.usualFirstName, item.raw.usualMiddleNames, item.raw.usualLastName) }}
                        </span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </template>
            </v-data-table-server>
          </div>
        </v-col>
        <v-col
          v-if="showStudentDetails()"
        >
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
                      icon="mdi-delete"
                      text="Remove Record"
                      class="mt-n1"
                      :click-action="deleteSdcSchoolCollectionStudent"
                    />
                  </v-col>
                </v-row>
                <v-row class="mt-6">
                  <v-col cols="12">
                    <v-row no-gutters>
                      <v-col>
                        <v-text-field
                          id="studentPen"
                          :model-value="fieldOrHyphen(sdcSchoolCollectionStudentDetailCopy.studentPen)"
                          label="PEN"
                          density="compact"
                          variant="plain"
                          readonly
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="localID"
                          :model-value="fieldOrHyphen(sdcSchoolCollectionStudentDetailCopy.localID)"
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
                          id="dob"
                          :model-value="fieldOrHyphen(formatDob(sdcSchoolCollectionStudentDetailCopy.dob))"
                          label="Birthdate"
                          density="compact"
                          variant="plain"
                          readonly
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="gender"
                          :model-value="fieldOrHyphen(sdcSchoolCollectionStudentDetailCopy.gender)"
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
                          id="legalLastName"
                          :model-value="fieldOrHyphen(sdcSchoolCollectionStudentDetailCopy.legalLastName)"
                          label="Legal Surname"
                          density="compact"
                          variant="plain"
                          readonly
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="usualLastName"
                          :model-value="fieldOrHyphen(sdcSchoolCollectionStudentDetailCopy.usualLastName)"
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
                          id="legalFirstName"
                          :model-value="fieldOrHyphen(sdcSchoolCollectionStudentDetailCopy.legalFirstName)"
                          label="Legal Given"
                          density="compact"
                          variant="plain"
                          readonly
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="usualFirstName"
                          :model-value="fieldOrHyphen(sdcSchoolCollectionStudentDetailCopy.usualFirstName)"
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
                          id="legalMiddleNames"
                          :model-value="fieldOrHyphen(sdcSchoolCollectionStudentDetailCopy.legalMiddleNames)"
                          label="Legal Middle"
                          density="compact"
                          variant="plain"
                          readonly
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="usualMiddleNames"
                          :model-value="fieldOrHyphen(sdcSchoolCollectionStudentDetailCopy.usualMiddleNames)"
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
                          id="enrolledGradeCode"
                          label="Grade"
                          density="compact"
                          variant="plain"
                          readonly
                          :model-value="getEnrolledGradeCodesLabel(sdcSchoolCollectionStudentDetailCopy.enrolledGradeCode)"
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="schoolFundingCode"
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
                          id="numberOfCourses"
                          :model-value="fieldOrHyphen(sdcSchoolCollectionStudentDetailCopy.numberOfCourses)"
                          label="Number of Courses"
                          density="compact"
                          variant="plain"
                          readonly
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="otherCourses"
                          :model-value="fieldOrHyphen(sdcSchoolCollectionStudentDetailCopy.otherCourses)"
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
                          id="supportBlocks"
                          :model-value="fieldOrHyphen(sdcSchoolCollectionStudentDetailCopy.supportBlocks)"
                          label="Support Blocks"
                          density="compact"
                          variant="plain"
                          readonly
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="specialEducationCategoryCode"
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
                          id="nativeAncestryInd"
                          :model-value="fieldOrHyphen(sdcSchoolCollectionStudentDetailCopy.nativeAncestryInd)"
                          label="Indigenous Ancestry"
                          density="compact"
                          variant="plain"
                          readonly
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="bandCode"
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
                          id="homeLanguageSpokenCode"
                          label="Home Language"
                          density="compact"
                          variant="plain"
                          readonly
                          :model-value="getHomeLanguageSpokenCodesLabel(sdcSchoolCollectionStudentDetailCopy.homeLanguageSpokenCode)"
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="postalCode"
                          :model-value="fieldOrHyphen(sdcSchoolCollectionStudentDetailCopy.postalCode)"
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
                          id="careerProgramCode"
                          label="Career Code"
                          density="compact"
                          variant="plain"
                          readonly
                          :model-value="getCareerProgramCodesLabel(sdcSchoolCollectionStudentDetailCopy.careerProgramCode)"
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="filteredEnrolledProgramCodes"
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
                        <v-row>
                          <v-col>
                            <span> {{ getValidationIssueTypeCodesDescription(issue.validationIssueCode) }}</span>
                          </v-col>
                        </v-row>
                        <v-form
                          ref="form"
                          v-model="isValid"
                        >
                          <v-row>
                            <v-col>
                              <div
                                v-for="(field) in issue.validationIssueFieldCode"
                                :key="field"
                              >
                                <v-text-field
                                  v-if="sdcFieldMappings[field]?.type === 'input'"
                                  :id="`${sdcFieldMappings[field]?.key}ValidationTextInput`"
                                  v-model:model-value="sdcSchoolCollectionStudentDetailCopy[sdcFieldMappings[field]?.key]"
                                  :label="sdcFieldMappings[field]?.label"
                                  :rules="sdcFieldMappings[field]?.options.rules"
                                  density="compact"
                                  variant="underlined"
                                  @update:focused="onFieldClick(sdcFieldMappings[field]?.key, $event, issue?.validationIssueSeverityCode)"
                                />
                                <v-autocomplete
                                  v-else-if="sdcFieldMappings[field]?.type === 'select'"
                                  :id="`${sdcFieldMappings[field].key}ValidationDropdown`"
                                  v-model="sdcSchoolCollectionStudentDetailCopy[sdcFieldMappings[field].key]"
                                  :rules="sdcFieldMappings[field].options.rules"
                                  :items="sdcCollection[sdcFieldMappings[field].options.items]"
                                  :item-value="sdcFieldMappings[field].options.itemValue"
                                  item-title="dropdownText"
                                  :label="sdcFieldMappings[field].label"
                                  @update:focused="onFieldClick(sdcFieldMappings[field]?.key, $event, issue?.validationIssueSeverityCode)"
                                />
                                <v-autocomplete
                                  v-else-if="sdcFieldMappings[field]?.type === 'multiselect'"
                                  :id="`${sdcFieldMappings[field].key}ValidationMultiSelect`"
                                  v-model="sdcSchoolCollectionStudentDetailCopy[sdcFieldMappings[field].key]"
                                  :rules="sdcFieldMappings[field].options.rules"
                                  :items="sdcCollection[sdcFieldMappings[field].options.items]"
                                  :item-value="sdcFieldMappings[field].options.itemValue"
                                  item-title="dropdownText"
                                  :label="sdcFieldMappings[field].label"
                                  multiple
                                  placeholder="No Program Codes"
                                  :persistent-placeholder="true"
                                  :selectable="() => sdcSchoolCollectionStudentDetailCopy[sdcFieldMappings[field].key].length < 8"
                                  @update:model-value="syncWithEnrolledProgramCodeOnUserInput"
                                  @update:focused="onFieldClick(sdcFieldMappings[field]?.key, $event, issue?.validationIssueSeverityCode)"
                                />
                                <div v-else-if="sdcFieldMappings[field]?.type === 'datePicker'">
                                  <DatePicker
                                    v-model="sdcSchoolCollectionStudentDetailCopy[sdcFieldMappings[field].key]"
                                    :label="sdcFieldMappings[field]?.label"
                                    :rules="sdcFieldMappings[field].options.rules"
                                    model-type="yyyyMMdd"
                                  />
                                </div>
                              </div>
                            </v-col>
                          </v-row>
                        </v-form>
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
                  :disabled="!isValid"
                  :click-action="save"
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
        <v-col v-else-if="!nextButtonIsDisabled()">
          <v-alert
            dismissible="true"
            class="clear-message"
          >
            Congratulations! There are no errors or warnings in the 1701 Submission
          </v-alert>
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
    <ConfirmationDialog ref="confirmRemovalOfStudentRecord">
      <template #message>
        <p>Are you sure that you would like to remove this student from the 1701 submission?</p>
      </template>
    </ConfirmationDialog>
  </v-container>
</template>

<script>

import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import {SDC_VALIDATION_FIELD_MAPPINGS} from '../../utils/sdc/sdcValidationFieldMappings';
import {isEmpty, omitBy, cloneDeep, sortBy} from 'lodash';
import {formatDob} from '../../utils/format';
import Spinner from '../common/Spinner.vue';
import PrimaryButton from '../util/PrimaryButton.vue';
import {setSuccessAlert, setFailureAlert} from '../composable/alertComposable';
import { sdcCollectionStore } from '../../store/modules/sdcCollection';
import ConfirmationDialog from '../util/ConfirmationDialog.vue';
import DatePicker from '../util/DatePicker.vue';

export default {
  name: 'StepTwoValidateData',
  components: {
    ConfirmationDialog,
    Spinner,
    PrimaryButton,
    DatePicker
  },
  props: {
    schoolCollectionObject: {
      type: Object,
      required: true,
      default: null
    }
  },
  emits: ['next'],
  data() {
    return {
      sdcFieldMappings: SDC_VALIDATION_FIELD_MAPPINGS,
      pageNumber: 1,
      pageSize: 10,
      studentListData: [],
      totalStudents: 0,
      sdcCollection: sdcCollectionStore(),
      legalUsualNameFilter: null,
      penFilter: null,
      selectedSdcStudentID: null,
      selectedSdcStudentIndex: 0,
      fundingWarningCategoryFilter: null,
      isValid: false,
      sdcSchoolCollectionStudentDetail: {},
      sdcSchoolCollectionStudentDetailCopy: {},
      loadingCount: 0,
      confirmRemovalOfStudentRecord: null,
      summaryCounts: {error: 0, infoWarning: 0, fundingWarning:0},
      headerSearchParams: {
        penNumber: '',
        sdcSchoolCollectionStudentStatusCode: 'ERROR,INFOWARN,FUNDWARN'
      },
      fundingWarningCategories: [
        {
          category: 'No program funding for home school students',
          categoryCode: 'NOPROGFUNDINGHS'
        },
        {
          category: 'Zero courses reported',
          categoryCode: 'ZEROCOURSE'
        },
        {
          category: 'Student too young',
          categoryCode: 'STUDTOOYOUNG'
        },
        {
          category: 'No Indigenous Support Program funding',
          categoryCode: 'NOINDIGFUND'
        },
        {
          category: 'No program funding for Out-of-Province/International Students',
          categoryCode: 'NOPROGFUNDINGOOP'
        },
        {
          category: 'No funding for Support Blocks',
          categoryCode: 'NOFUNDSUPPORT'
        },
        {
          category: 'No funding for Special Education',
          categoryCode: 'NOFUNDSPED'
        },
        {
          category: 'No funding for Graduated Adults',
          categoryCode: 'NOFUNDGRADADULT'
        },
        {
          category: 'No career program funding',
          categoryCode: 'NOCAREERPROGFUND'
        }
      ]
    };
  },
  computed: {

  },
  watch: {
    pageNumber: {
      handler() {
        this.getSDCSchoolCollectionStudentPaginated();
      },
      immediate: true
    },
    selectedSdcStudentID: {
      handler(sdcSchoolCollectionStudentID) {
        if(this.selectedSdcStudentID) {
          this.getSdcSchoolCollectionStudentDetail(sdcSchoolCollectionStudentID);
        }
      },
      immediate: true
    }
  },
  mounted() {
    sdcCollectionStore().getCodes().then(() => {
      this.getSummaryCounts();
      this.getSDCSchoolCollectionStudentPaginated();
    });
  },
  async created() {

  },
  methods: {
    next() {
      if(sdcCollectionStore().currentStepInCollectionProcess.isComplete) {
        this.$emit('next');
      } else {
        this.markStepAsComplete();
      }
    },
    onFieldClick(fieldName, $event, errorType) {
      if ($event) {
        if (errorType === 'ERROR') {
          document.getElementById(fieldName).style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
        } else {
          document.getElementById(fieldName).style.backgroundColor = 'lightblue';
        }

        document.getElementById(fieldName).style.marginTop = '7px';
        document.getElementById(fieldName).style.marginRight = '20px';
      } else {
        document.getElementById(fieldName).style.backgroundColor = 'transparent';
      }
    },
    markStepAsComplete(){
      let updateCollection = {
        schoolCollection: this.schoolCollectionObject,
        status: 'REVIEWED'
      };
      ApiService.apiAxios.put(`${ApiRoutes.sdc.BASE_URL}/${this.$route.params.schoolCollectionID}`, updateCollection)
        .then(() => {
          this.$emit('next');
        })
        .catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while verifying school details. Please try again later.');
        });
    },
    nextButtonIsDisabled(){
      return this.summaryCounts.error > 0 || this.isLoading();
    },
    showStudentDetails(){
      return this.totalStudents > 0;
    },
    getSummaryCounts(){
      this.loadingCount += 1;

      ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/stats/error-warning-count/${this.$route.params.schoolCollectionID}`, {
      }).then(response => {
        this.summaryCounts = response.data;
      }).catch(error => {
        console.error(error);
        setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get summary counts. Please try again later.');
      }).finally(() => {
        this.loadingCount -= 1;
      });
    },
    getSDCSchoolCollectionStudentPaginated(){
      this.loadingCount += 1;

      this.headerSearchParams.fundingWarningCategory = this.fundingWarningCategoryFilter;

      ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${this.$route.params.schoolCollectionID}/paginated`, {
        params: {
          pageNumber: this.pageNumber - 1,
          pageSize: this.pageSize,
          searchParams: omitBy(this.headerSearchParams, isEmpty),
          sort: {
            sdcSchoolCollectionStudentStatusCode: 'ASC'
          },
        }
      }).then(response => {
        this.studentListData = response.data.content;
        this.totalStudents = response.data.totalElements;
        this.selectedSdcStudentID = response.data.content[0]?.sdcSchoolCollectionStudentID;
      }).catch(error => {
        console.error(error);
        setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get sdc school collection students paginated. Please try again later.');
      }).finally(() => {
        this.loadingCount -= 1;
      });
    },
    studentSelected(sdcSchoolCollectionStudentID) {
      this.selectedSdcStudentID = sdcSchoolCollectionStudentID;
    },
    nextSdcSchoolCollectionStudent(){
      this.selectedSdcStudentIndex = this.selectedSdcStudentIndex + 1;
      this.selectedSdcStudentID = this.studentListData[this.selectedSdcStudentIndex].sdcSchoolCollectionStudentID;
    },
    previousSdcSchoolCollectionStudent(){
      this.selectedSdcStudentIndex = this.selectedSdcStudentIndex - 1;
      this.selectedSdcStudentID = this.studentListData[this.selectedSdcStudentIndex].sdcSchoolCollectionStudentID;
    },
    isLoading(){
      return this.loadingCount > 0;
    },
    disableNextSdcSchoolCollectionStudentNavigation(){
      return this.selectedSdcStudentIndex === this.studentListData.length - 1;
    },
    disablePreviousSdcSchoolCollectionStudentNavigation(){
      return this.selectedSdcStudentIndex === 0;
    },
    tableRowClass(sdcSchoolCollectionStudentID, index){
      let rowClass = ['hoverTable'];
      if (sdcSchoolCollectionStudentID === this.selectedSdcStudentID) {
        rowClass.push('isSelected');
        this.selectedSdcStudentIndex = index;
      }
      return  rowClass;
    },
    getSdcSchoolCollectionStudentDetail(sdcSchoolCollectionStudentID) {
      this.loadingCount += 1;

      ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${sdcSchoolCollectionStudentID}`)
        .then(response => {
          let filteredResponse = {...response.data, filteredEnrolledProgramCodes: this.filterEnrolledProgramCodes(response.data.enrolledProgramCodes)};
          this.sdcSchoolCollectionStudentDetail = filteredResponse;
          this.sdcSchoolCollectionStudentDetailCopy = cloneDeep(filteredResponse);
        }).catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get student detail counts. Please try again later.');
        }).finally(() => {
          this.loadingCount -= 1;
        });
    },
    save(){
      ApiService.apiAxios.put(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${this.$route.params.schoolCollectionID}/student/${this.selectedSdcStudentID}`, this.sdcSchoolCollectionStudentDetailCopy)
        .then(() => {
          setSuccessAlert('Success! The student details have been updated.');
        }).catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to update student details. Please try again later.');
        }).finally(() => {
          this.selectedSdcStudentID = null;
          this.getSummaryCounts();
          this.getSDCSchoolCollectionStudentPaginated();
        });
    },
    async deleteSdcSchoolCollectionStudent(){
      const confirmation = await this.confirmRemovalOfStudentRecord.open('Confirm Removal of Student Record', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Yes', rejectText: 'No'});
      if (!confirmation) {
        return;
      }
      this.loadingCount += 1;
      ApiService.apiAxios.delete(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${this.$route.params.schoolCollectionID}/student/${this.selectedSdcStudentID}`, this.sdcSchoolCollectionStudentDetailCopy)
        .then(() => {
          setSuccessAlert('Success! The student details have been deleted.');
        }).catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to update student details. Please try again later.');
        }).finally(() => {
          this.selectedSdcStudentID = null;
          this.loadingCount -= 1;
          this.getSummaryCounts();
          this.getSDCSchoolCollectionStudentPaginated();
        });
    },
    filterEnrolledProgramCodes(enrolledProgramCodes = []){
      if(enrolledProgramCodes) {
        return enrolledProgramCodes.filter(enrolledProgramCode => sdcCollectionStore().enrolledProgramCodesMap.has(enrolledProgramCode));
      }
    },
    syncWithEnrolledProgramCodeOnUserInput(value){
      this.sdcSchoolCollectionStudentDetailCopy.enrolledProgramCodes = value;
    },
    getBandCodesLabel(key){
      let label = key;
      if (sdcCollectionStore().bandCodesMap.get(key)) {
        label = `${sdcCollectionStore().bandCodesMap.get(key)?.bandCode} - ${sdcCollectionStore().bandCodesMap.get(key)?.label}`;
      }
      return label || '-';
    },
    getCareerProgramCodesLabel(key){
      let label = key;
      if (sdcCollectionStore().careerProgramCodesMap.get(key)) {
        label = `${sdcCollectionStore().careerProgramCodesMap.get(key)?.careerProgramCode} - ${sdcCollectionStore().careerProgramCodesMap.get(key)?.label}`;
      }
      return label || '-';
    },
    getEnrolledGradeCodesLabel(key){
      let label = key;
      if (sdcCollectionStore().enrolledGradeCodesMap.get(key)) {
        label = `${sdcCollectionStore().enrolledGradeCodesMap.get(key)?.enrolledGradeCode} - ${sdcCollectionStore().enrolledGradeCodesMap.get(key)?.label}`;
      }
      return label || '-';
    },
    getHomeLanguageSpokenCodesLabel(key) {
      let label = key;
      if (sdcCollectionStore().homeLanguageSpokenCodesMap.get(key)) {
        label = `${sdcCollectionStore().homeLanguageSpokenCodesMap.get(key)?.homeLanguageSpokenCode} - ${sdcCollectionStore().homeLanguageSpokenCodesMap.get(key)?.label}`;
      }
      return label || '-';
    },
    getSchoolFundingCodeLabel(key){
      let label = key;
      if (sdcCollectionStore().schoolFundingCodesMap.get(key)) {
        label = `${sdcCollectionStore().schoolFundingCodesMap.get(key)?.schoolFundingCode} - ${sdcCollectionStore().schoolFundingCodesMap.get(key)?.label}`;
      }
      return label || '-';
    },
    getSpecialEducationCodesLabel(key){
      let label = key;
      if (sdcCollectionStore().specialEducationCodesMap.get(key)) {
        label = `${sdcCollectionStore().specialEducationCodesMap.get(key)?.specialEducationCategoryCode} - ${sdcCollectionStore().specialEducationCodesMap.get(key)?.label}`;
      }
      return label || '-';
    },
    clearSearchFields(){
      this.fundingWarningCategoryFilter = null;
      this.legalUsualNameFilter = null;
      this.penFilter = null;
      this.getSDCSchoolCollectionStudentPaginated();
    },
    getValidationIssueTypeCodesDescription(key){
      return sdcCollectionStore().validationIssueTypeCodesMap.get(key)?.message;
    },
    getValidationIssueSeverityCodeLabel(severityCode){
      if (severityCode === 'ERROR') {
        return 'Error';
      } else if (severityCode === 'INFO_WARNING') {
        return 'Info Warning';
      } else if (severityCode === 'FUNDING_WARNING') {
        return 'Funding Warning';
      }
    },
    fieldOrHyphen(field){
      return field || '-';
    },
    getLegalName(first, middle, last){
      if(first && middle){
        return last + ', ' + first + ' ' + middle;
      }else if(first){
        return last + ', ' + first;
      }else if(middle){
        return last + ', ' + middle;
      }else if(last){
        return last;
      }
      return '';
    },
    formatAndSortValidationIssues(validationIssues = []){
      let validationIssueMap = new Map();
      for (let issue of validationIssues) {
        if (!validationIssueMap.has(issue.validationIssueCode)) {
          validationIssueMap.set(issue.validationIssueCode, {...issue, validationIssueFieldCode: [issue.validationIssueFieldCode]});
        } else {
          validationIssueMap.get(issue.validationIssueCode).validationIssueFieldCode.push(issue.validationIssueFieldCode);
        }
      }

      return sortBy(Array.from(validationIssueMap.values()), ['validationIssueSeverityCode']);
    },
    getStudentStatus(student){
      let studentValidationIssueStatus = student.sdcSchoolCollectionStudentStatusCode;
      if(studentValidationIssueStatus === 'ERROR') {
        return 'ERROR';
      } else if(studentValidationIssueStatus === 'FUNDWARN') {
        return 'FUNDING_WARNING';
      } else if(studentValidationIssueStatus === 'INFOWARN') {
        return 'INFO_WARNING';
      }
    },
    getIssueIcon(issue){
      switch (issue) {
      case 'ERROR':
        return 'mdi-alert-circle-outline';
      case 'INFO_WARNING':
        return 'mdi-alert-circle-outline';
      case 'FUNDING_WARNING':
        return 'mdi-alert-outline';
      default:
        return '';
      }
    },
    getIssueIconColor(issue){
      switch (issue) {
      case 'ERROR':
        return '#d90606';
      case 'INFO_WARNING':
        return '#2196F3';
      case 'FUNDING_WARNING':
        return '#ff9800';
      default:
        return '';
      }
    },
    formatDob
  }
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

  .clear-message {
    background-color: #bee7be;
    padding: 5px;
  }

 .inner-border {
   display: inline-block;
   min-width: 100%;
   border: 1px solid grey;
   border-radius: 5px;
   padding: 2em;
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
   max-height: 100vh;
 }

 .form-hint{
   color: rgb(56, 89, 138);
   font-size: 14px;
 }

 .searchBox {
   padding-left: 1em;
   padding-right: 1em;
   border-radius: 5px;
   background-color: rgb(235, 237, 239);
 }

 #warningAndErrorSummary div {
   padding: 1em;
   margin-bottom: 1em;
   box-shadow: 0 0 0 0 grey, 1px 0 0 0 grey;
 }

</style>

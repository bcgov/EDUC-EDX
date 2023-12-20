<template>
  <v-container
    class="containerSetup"
    fluid
  >
    <div class="inner-border">
      <v-row
        no-gutters
        class="mt-2 mb-2 d-flex justify-start"
      >
        <v-col
          cols="6"
          class="mt-1 d-flex justify-start"
        >
          <v-icon
            small
            color="#1976d2"
          >
            mdi-arrow-left
          </v-icon>
          <a
            class="ml-1"
            @click="backToDataIssues()"
          >Return to List of Data Issues</a>
        </v-col>
        <v-col class="d-flex justify-end">
          <PrimaryButton
            id="removeRecord"
            secondary
            large-icon
            icon="mdi-delete"
            text="Remove Record"
            class="mr-1"
            :click-action="deleteStudent"
          />
          <PrimaryButton
            id="revertChanges"
            disabled
            large-icon
            icon="mdi-arrow-u-left-top"
            text="Revert Changes"
            class="mr-1"
          />
          <PrimaryButton
            id="saveRecord"
            text="Validate & Save"
            class="mr-1"
            :click-action="save"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <Spinner v-if="isLoading()" />
          <div
            v-else
          >
            <v-row>
              <v-col cols="6">
                <v-form
                  ref="studentDetailsForm"
                  v-model="studentDetailsFormValid"
                >
                  <v-row>
                    <v-col cols="12">
                      <v-row>
                        <v-col>
                          <v-text-field
                            id="studentPen"
                            v-model="sdcSchoolCollectionStudentDetailCopy.studentPen"
                            label="PEN"
                            variant="underlined"
                            :maxlength="9"
                            :rules="penRules"
                            class="mt-n3"
                          />
                        </v-col>
                        <v-col>
                          <v-text-field
                            id="localID"
                            v-model="sdcSchoolCollectionStudentDetailCopy.localID"
                            label="Local ID"
                            variant="underlined"
                            :maxlength="12"
                            class="mt-n3"
                          />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <DatePicker
                            v-model="sdcSchoolCollectionStudentDetailCopy.dob"
                            label="Birthdate"
                            :rules="[rules.required()]"
                            model-type="yyyyMMdd"
                            class="mt-n3"
                          />
                        </v-col>
                        <v-col>
                          <v-select
                            id="gender"
                            v-model="sdcSchoolCollectionStudentDetailCopy.gender"
                            :items="sdcCollection.genderCodes"
                            item-value="genderCode"
                            item-title="dropdownText"
                            label="Gender"
                            dense
                            variant="underlined"
                            :rules="[rules.required()]"
                            class="mt-n3"
                          />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <v-text-field
                            id="legalLastName"
                            v-model="sdcSchoolCollectionStudentDetailCopy.legalLastName"
                            label="Legal Surname"
                            variant="underlined"
                            :rules="[rules.required()]"
                            :maxlength="225"
                            class="mt-n3"
                          />
                        </v-col>
                        <v-col>
                          <v-text-field
                            id="usualLastName"
                            v-model="sdcSchoolCollectionStudentDetailCopy.usualLastName"
                            label="Usual Surname"
                            variant="underlined"
                            :maxlength="225"
                            class="mt-n3"
                          />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <v-text-field
                            id="legalFirstName"
                            v-model="sdcSchoolCollectionStudentDetailCopy.legalFirstName"
                            label="Legal Given"
                            variant="underlined"
                            :maxlength="225"
                            class="mt-n3"
                          />
                        </v-col>
                        <v-col>
                          <v-text-field
                            id="usualFirstName"
                            v-model="sdcSchoolCollectionStudentDetailCopy.usualFirstName"
                            label="Usual Given"
                            variant="underlined"
                            :maxlength="225"
                            class="mt-n3"
                          />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <v-text-field
                            id="legalMiddleNames"
                            v-model="sdcSchoolCollectionStudentDetailCopy.legalMiddleNames"
                            label="Legal Middle"
                            variant="underlined"
                            :maxlength="225"
                            class="mt-n3"
                          />
                        </v-col>
                        <v-col>
                          <v-text-field
                            id="usualMiddleNames"
                            v-model="sdcSchoolCollectionStudentDetailCopy.usualMiddleNames"
                            label="Usual Middle"
                            variant="underlined"
                            :maxlength="225"
                            class="mt-n3"
                          />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <v-select
                            id="enrolledGradeCode"
                            v-model="sdcSchoolCollectionStudentDetailCopy.enrolledGradeCode"
                            label="Grade"
                            variant="underlined"
                            dense
                            :items="sdcCollection.enrolledGradeCodes"
                            item-value="enrolledGradeCode"
                            item-title="dropdownText"
                            :rules="[rules.required()]"
                            class="mt-n3"
                          />
                        </v-col>
                        <v-col>
                          <v-select
                            id="schoolFundingCode"
                            v-model="sdcSchoolCollectionStudentDetailCopy.schoolFundingCode"
                            label="Funding Code"
                            dense
                            variant="underlined"
                            :items="sdcCollection.schoolFundingCodes"
                            item-value="schoolFundingCode"
                            item-title="dropdownText"
                            class="mt-n3"
                          />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <v-text-field
                            id="numberOfCourses"
                            v-model="sdcSchoolCollectionStudentDetailCopy.numberOfCourses"
                            label="Number of Courses"
                            variant="underlined"
                            :maxlength="4"
                            class="mt-n3"
                          />
                        </v-col>
                        <v-col>
                          <v-text-field
                            id="otherCourses"
                            v-model="sdcSchoolCollectionStudentDetailCopy.otherCourses"
                            label="Other Courses"
                            variant="underlined"
                            :maxlength="1"
                            class="mt-n3"
                          />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <v-text-field
                            id="supportBlocks"
                            v-model="sdcSchoolCollectionStudentDetailCopy.supportBlocks"
                            label="Support Blocks"
                            variant="underlined"
                            :maxlength="1"
                            class="mt-n3"
                          />
                        </v-col>
                        <v-col>
                          <v-select
                            id="specialEducationCategoryCode"
                            v-model="sdcSchoolCollectionStudentDetailCopy.specialEducationCategoryCode"
                            label="Special Ed. Category"
                            dense
                            variant="underlined"
                            :items="sdcCollection.specialEducationCodes"
                            item-value="specialEducationCategoryCode"
                            item-title="dropdownText"
                            class="mt-n3"
                          />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <v-select
                            id="nativeAncestryInd"
                            v-model="sdcSchoolCollectionStudentDetailCopy.nativeAncestryInd"
                            label="Indigenous Ancestry"
                            dense
                            variant="underlined"
                            :items="sdcCollection.ancestryItems"
                            item-value="code"
                            item-title="dropdownText"
                            class="mt-n3"
                            :rules="[rules.required()]"
                          />
                        </v-col>
                        <v-col>
                          <v-select
                            id="bandCode"
                            v-model="sdcSchoolCollectionStudentDetailCopy.bandCode"
                            label="Band of Residence"
                            dense
                            variant="underlined"
                            :items="sdcCollection.bandCodes"
                            item-value="bandCode"
                            item-title="dropdownText"
                            class="mt-n3"
                          />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <v-select
                            id="homeLanguageSpokenCode"
                            v-model="sdcSchoolCollectionStudentDetailCopy.homeLanguageSpokenCode"
                            label="Home Language"
                            dense
                            variant="underlined"
                            :items="sdcCollection.homeLanguageSpokenCodes"
                            item-value="homeLanguageSpokenCode"
                            item-title="dropdownText"
                            class="mt-n3"
                          />
                        </v-col>
                        <v-col>
                          <v-text-field
                            id="postalCode"
                            v-model="sdcSchoolCollectionStudentDetailCopy.postalCode"
                            label="Postal Code"
                            variant="underlined"
                            :maxlength="6"
                            class="mt-n3"
                          />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <v-select
                            id="careerProgramCode"
                            v-model="sdcSchoolCollectionStudentDetailCopy.careerProgramCode"
                            label="Career Code"
                            variant="underlined"
                            :items="sdcCollection.careerProgramCodes"
                            item-value="careerProgramCode"
                            item-title="dropdownText"
                            dense
                            class="mt-n3"
                          />
                        </v-col>
                        <v-col>
                          <v-select
                            id="filteredEnrolledProgramCodes"
                            v-model="sdcSchoolCollectionStudentDetailCopy.filteredEnrolledProgramCodes"
                            label="Program Codes"
                            variant="underlined"
                            :items="sdcCollection.enrolledProgramCodes"
                            item-value="enrolledProgramCode"
                            item-title="dropdownText"
                            multiple
                            dense
                            class="mt-n3"
                            :rules="enrolledProgramRules"
                            @update:model-value="syncWithEnrolledProgramCodeOnUserInput"
                          />
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-form>
              </v-col>
              <v-divider
                :thickness="1"
                inset
                color="#b3b0b0"
                class="border-opacity-75"
                vertical
              />
              <v-col v-if="sdcSchoolCollectionStudentDetailCopy.sdcSchoolCollectionStudentValidationIssues.length > 0">
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
                            <span> {{ getValidationIssueTypeCodesDescription(issue.validationIssueCode) }} </span>
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
                                  :maxlength="sdcFieldMappings[field]?.options.maxlength"
                                  density="compact"
                                  variant="underlined"
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
                        <a
                          v-if="issue.validationIssueCode==='STUDENTPENDUPLICATE'"
                          @click="filterByPen"
                        >Filter to records with this PEN</a>
                      </v-timeline-item>
                    </v-timeline>
                  </v-col>
                </v-row>
              </v-col>
              <v-col v-else-if="sdcSchoolCollectionStudentDetailCopy.sdcSchoolCollectionStudentValidationIssues.length === 0">
                <v-alert
                  dismissible="true"
                  class="clear-message"
                >
                  <v-icon
                    class="mt-2 mr-3"
                    size="30"
                    color="darkgreen"
                  >
                    mdi-check-circle-outline
                  </v-icon>
                  <span class="success-message">There are no errors or warnings on this student record.</span>
                </v-alert>
              </v-col>
            </v-row>
            <div class="text-center">
              <v-pagination 
                v-model="page"
                :length="selectedStudents.length"
                :total-visible="2"
                rounded="circle"
                @update:model-value="navigate"
              />
            </div>
            <div class="text-center">
              <span class="footer-text">Reviewing {{ selectedStudents.length }} of  {{ totalStudents }} Records </span>
              <a
                v-if="selectedStudents.length < totalStudents"
                class="filter-text"
                @click="clearFilter()"
              >- Clear Filters & Show all Records</a>
            </div>
          </div>
        </v-col>
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

import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';
import {SDC_VALIDATION_FIELD_MAPPINGS} from '../../../utils/sdc/sdcValidationFieldMappings';
import {cloneDeep, sortBy} from 'lodash';
import {formatDob} from '../../../utils/format';
import Spinner from '../../common/Spinner.vue';
import PrimaryButton from '../../util/PrimaryButton.vue';
import {setSuccessAlert, setFailureAlert} from '../../composable/alertComposable';
import { sdcCollectionStore } from '../../../store/modules/sdcCollection';
import ConfirmationDialog from '../../util/ConfirmationDialog.vue';
import DatePicker from '../../util/DatePicker.vue';
import * as Rules from '../../../utils/institute/formRules';
import {isValidPEN} from '../../../utils/validation';

export default {
  name: 'EditAndFixStudentData',
  components: {
    ConfirmationDialog,
    Spinner,
    PrimaryButton,
    DatePicker
  },
  props: {
    selectedStudents: {
      type: Array,
      required: true,
      default: null
    },
    totalStudents: {
      type: Number,
      required: false,
      default: null
    }
  },
  emits: ['next', 'show-issues', 'clear-filter', 'filter-pen'],
  data() {
    return {
      page: 1,
      penRules: [v => !!v || 'Required', v => (!v || isValidPEN(v) || 'Must be a valid PEN')],
      sdcFieldMappings: SDC_VALIDATION_FIELD_MAPPINGS,
      sdcCollection: sdcCollectionStore(),
      selectedSdcStudentID: null,
      isValid: false,
      sdcSchoolCollectionStudentDetail: {},
      sdcSchoolCollectionStudentDetailCopy: {},
      loadingCount: 0,
      rules: Rules,
      studentDetailsFormValid:false,
      removeIndex: null,
      enrolledProgramRules: [v => v?.length <= 8 || 'Select a maximum of 8 Enrolled Programs']
    };
  },
  computed: {

  },
  watch: {
    selectedStudents: {
      handler(value) {
        if(value.length > 0) {
          this.getSdcSchoolCollectionStudentDetail(value[0]);
        }
      },
      immediate: true
    }
  },
  mounted() {
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
    backToDataIssues() {
      this.$emit('show-issues');
    },
    clearFilter() {
      this.$emit('clear-filter');
    },
    navigate() {
      this.getSdcSchoolCollectionStudentDetail(this.selectedStudents[this.page - 1]);
    },
    isLoading(){
      return this.loadingCount > 0;
    },
    getSdcSchoolCollectionStudentDetail(sdcSchoolCollectionStudentID) {
      this.loadingCount += 1;
      this.selectedSdcStudentID=sdcSchoolCollectionStudentID;

      ApiService.apiAxios.get(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${sdcSchoolCollectionStudentID}`)
        .then(response => {
          let filteredResponse = {...response.data, filteredEnrolledProgramCodes: this.filterEnrolledProgramCodes(response.data.enrolledProgramCodes)};
          this.sdcSchoolCollectionStudentDetail = filteredResponse;
          this.sdcSchoolCollectionStudentDetailCopy = cloneDeep(filteredResponse);
        }).catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get student detail counts. Please try again later.');
        }).finally(() => {
          this.removeIndex = null;
          this.loadingCount -= 1;
        });
    },
    save(){
      this.loadingCount += 1;
      ApiService.apiAxios.put(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${this.$route.params.schoolCollectionID}/student/${this.selectedSdcStudentID}`, this.sdcSchoolCollectionStudentDetailCopy)
        .then(() => {
          setSuccessAlert('Success! The student details have been updated.');
        }).catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to update student details. Please try again later.');
        }).finally(() => {
          this.loadingCount -= 1;
          this.getSdcSchoolCollectionStudentDetail(this.selectedSdcStudentID);
        });
    },
    async deleteStudent(){
      const confirmation = await this.$refs.confirmRemovalOfStudentRecord.open('Confirm Removal of Student Record', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Yes', rejectText: 'No'});
      if (!confirmation) {
        return;
      }
      this.loadingCount += 1;
      ApiService.apiAxios.delete(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${this.$route.params.schoolCollectionID}/student/${this.selectedSdcStudentID}`, this.sdcSchoolCollectionStudentDetailCopy)
        .then(() => {
          this.removeIndex = this.selectedStudents.findIndex(value => value === this.selectedSdcStudentID);
          this.selectedStudents.splice(this.removeIndex, 1);
          setSuccessAlert('Success! The student details have been deleted.');
        }).catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to update student details. Please try again later.');
        }).finally(() => {
          this.loadingCount -= 1;
          if(this.selectedStudents.length > 0) {
            this.page = (this.page  === 1 ? 1 : this.page - 1);
            this.removeIndex === 0 ? this.getSdcSchoolCollectionStudentDetail(this.selectedStudents[0]) :this.getSdcSchoolCollectionStudentDetail(this.selectedStudents[this.removeIndex - 1]);
          }
          else {
            this.$emit('show-issues');
          }
        });
    },
    filterEnrolledProgramCodes(enrolledProgramCodes = []){
      if(enrolledProgramCodes) {
        return enrolledProgramCodes.filter(enrolledProgramCode => sdcCollectionStore().enrolledProgramCodesMap.has(enrolledProgramCode));
      }
    },
    filterByPen() {
      this.page=1;
      this.$emit('filter-pen', this.sdcSchoolCollectionStudentDetailCopy.studentPen);
    },
    syncWithEnrolledProgramCodeOnUserInput(value){
      this.sdcSchoolCollectionStudentDetailCopy.enrolledProgramCodes = value;
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
    border: 1px solid darkgreen;
    color: darkgreen;
    background-color: transparent;
    padding: 10px;
  }

 .inner-border {
   display: inline-block;
   min-width: 100%;
   border: 1px solid rgba(42, 45, 38, 0.38);
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

  .footer-text {
    font-style: italic;
    color: grey;
  }

  .filter-text {
    font-style: italic;
    color: rgb(56, 89, 138);
  }

  .filter-text:hover {
  text-decoration: underline;
  }

  .success-message{
    vertical-align: sub;
   }

</style>

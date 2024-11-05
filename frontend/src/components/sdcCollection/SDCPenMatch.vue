<template>
  <v-card v-if="isLoadingMatches">
    <v-card-text>
      <Spinner
        :flat="true"
      />
    </v-card-text>
  </v-card>
  <div v-else>
    <v-card>
      <v-card-title>
        <span>PEN Match</span>
      </v-card-title>
      <v-card-text>
        <div
          ref="topDiv"
        >
          <v-row>
            <v-col
              class="pt-0"
              cols="12"
            >
              <v-form
                ref="studentDetailsForm"
                v-model="studentDetailsFormValid"
              >
                <v-row>
                  <v-col cols="12">
                    <v-row class="mt-4">
                      <v-col>
                        <v-text-field
                          id="legalLastName"
                          v-model="sdcStudent.legalLastName"
                          label="Legal Surname"
                          variant="underlined"
                          :rules="[rules.required()]"
                          :maxlength="25"
                          :error-messages="err.legalLastNameError"
                          density="compact"
                          @update:model-value="formUpdated"
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="usualLastName"
                          v-model="sdcStudent.usualLastName"
                          label="Usual Surname"
                          variant="underlined"
                          :maxlength="25"
                          :error-messages="err.usualLastNameError"
                          density="compact"
                          @update:model-value="formUpdated"
                        />
                      </v-col>
                    </v-row>
                    <v-row class="mt-n4">
                      <v-col>
                        <v-text-field
                          id="legalFirstName"
                          v-model="sdcStudent.legalFirstName"
                          label="Legal Given"
                          variant="underlined"
                          :maxlength="25"
                          :error-messages="err.legalFirstNameError"
                          density="compact"
                          @update:model-value="formUpdated"
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="usualFirstName"
                          v-model="sdcStudent.usualFirstName"
                          label="Usual Given"
                          variant="underlined"
                          :maxlength="25"
                          :error-messages="err.usualFirstNameError"
                          density="compact"
                          @update:model-value="formUpdated"
                        />
                      </v-col>
                    </v-row>
                    <v-row class="mt-n4">
                      <v-col>
                        <v-text-field
                          id="legalMiddleNames"
                          v-model="sdcStudent.legalMiddleNames"
                          label="Legal Middle"
                          variant="underlined"
                          :maxlength="25"
                          :error-messages="err.legalMiddleNamesError"
                          density="compact"
                          @update:model-value="formUpdated"
                        />
                      </v-col>
                      <v-col>
                        <v-text-field
                          id="usualMiddleNames"
                          v-model="sdcStudent.usualMiddleNames"
                          label="Usual Middle"
                          variant="underlined"
                          :maxlength="25"
                          :error-messages="err.usualMiddleNamesError"
                          density="compact"
                          @update:model-value="formUpdated"
                        />
                      </v-col>
                    </v-row>
                    <v-row class="mt-n4">
                      <v-col>
                        <DatePicker
                          id="dobPicker"
                          v-model="sdcStudent.dob"
                          label="Birthdate"
                          :rules="[rules.required()]"
                          model-type="yyyyMMdd"
                          :error-message="err.birthDateError"
                          density="compact"
                          :readonly="isReadOnly"
                          @update:model-value="formUpdated"
                        />
                      </v-col>
                      <v-col>
                        <v-select
                          id="gender"
                          v-model="sdcStudent.gender"
                          :items="sdcCollection.genderCodes"
                          item-value="genderCode"
                          item-title="dropdownText"
                          label="Gender"
                          variant="underlined"
                          :rules="[rules.required()]"
                          :error-messages="err.genderError"
                          density="compact"
                          @update:model-value="formUpdated"
                        />
                      </v-col>
                    </v-row>
                    <v-row class="mt-n4">
                      <v-col>
                        <v-text-field
                          id="localID"
                          v-model="sdcStudent.localID"
                          label="Local ID"
                          variant="underlined"
                          :maxlength="12"
                          density="compact"
                          @update:model-value="formUpdated"
                        />
                      </v-col>
                      <v-col>
                        <v-select
                          id="enrolledGradeCode"
                          v-model="sdcStudent.enrolledGradeCode"
                          label="Grade"
                          variant="underlined"
                          :items="sdcCollection.enrolledGradeCodes"
                          item-value="enrolledGradeCode"
                          item-title="dropdownText"
                          :rules="[rules.required()]"
                          density="compact"
                          @update:model-value="formUpdated"
                        />
                      </v-col>
                    </v-row>
                    <v-row class="mt-n4">
                      <v-col cols="6">
                        <v-text-field
                          id="postalCode"
                          v-model="sdcStudent.postalCode"
                          label="Postal Code"
                          variant="underlined"
                          :maxlength="6"
                          density="compact"
                          @update:model-value="formUpdated"
                        />
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-form>
            </v-col>
          </v-row>
        </div>
        <v-row v-if="showMatchStatus">
          <v-col>
            <v-alert
              id="collection-submission"
              density="compact"
              type="success"
              variant="tonal"
              text="We have a run a PEN match for this student and have found a single result. Do you wish to use it as your submitted PEN?"
            />
          </v-col>
        </v-row>
        <v-row v-else-if="showMultiStatus">
          <v-col>
            <v-alert
              id="collection-submission"
              density="compact"
              type="warning"
              variant="tonal"
              text="We have a run a PEN match for this student and have found multiple results. One of our Ministry representatives will determine the right PEN. Do you wish to proceed?"
            />
          </v-col>
        </v-row>
        <v-row v-else-if="showNewStatus">
          <v-col>
            <v-alert
              id="collection-submission"
              density="compact"
              type="warning"
              variant="tonal"
              text="We have a run a PEN match for this student and have no results. Do you wish to generate a PEN for this student now?"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-row>
          <v-col class="d-flex justify-end">
            <v-btn
              id="cancelMatchButton"
              color="#003366"
              text="Cancel"
              variant="outlined"
              @click="cancelClicked"
            />
            <v-btn
              v-if="!showMatchStatus && !showMultiStatus && !showNewStatus"
              id="runMatchButton"
              color="#003366"
              text="Match Student"
              variant="elevated"
              :disabled="!studentDetailsFormValid"
              @click="runPenMatch"
            />
            <v-btn
              v-if="showMatchStatus"
              id="useFoundPENButton"
              color="#003366"
              variant="elevated"
              text="Use PEN"
              @click="useFoundPEN"
            />
            <v-btn
              v-else-if="showMultiStatus"
              id="penRequestButton"
              color="#003366"
              variant="elevated"
              text="Yes"
              @click="requestStaffPENCheck"
            />
            <v-btn
              v-else-if="showNewStatus"
              id="generatePEN"
              color="#003366"
              variant="elevated"
              text="Generate PEN"
              :disabled="!studentDetailsFormValid"
              @click="issueNewPEN"
            />
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>

import {constructPenMatchObjectFromSdcStudent, getDemogValidationResults} from '../../utils/common';
import Spinner from '../common/Spinner.vue';
import alertMixin from '../../mixins/alertMixin';
import ApiService from '../../common/apiService';
import {ApiRoutes} from '../../utils/constants';
import DatePicker from '../util/DatePicker.vue';
import {isValidPEN} from '../../utils/validation';
import * as Rules from '../../utils/institute/formRules';
import {sdcCollectionStore} from '../../store/modules/sdcCollection';
import {mapState} from 'pinia';
import {penServicesStore} from '../../store/modules/penServices';

export default {
  name: 'SDCPenMatch',
  components: {DatePicker, Spinner},
  mixins: [alertMixin],
  props: {
    sdcStudent: {
      type: Object,
      required: true
    },
    isReadOnly: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  emits: ['cancel', 'useFoundPEN', 'requestStaffPENCheck'],
  data() {
    return {
      penRules: [v => (!v || isValidPEN(v) || 'Must be a valid PEN')],
      rules: Rules,
      err: {
        usualMiddleNamesError: '',
        usualFirstNameError: '',
        usualLastNameError: '',
        legalMiddleNamesError: '',
        legalFirstNameError: '',
        legalLastNameError: '',
        birthDateError: '',
        genderError: ''
      },
      sdcCollection: sdcCollectionStore(),
      studentDetailsFormValid: false,
      penMatchStatus: null,
      isLoadingMatches: false,
      isSearchingStudent: false,
      showMatchStatus: false,
      showMultiStatus: false,
      showNewStatus: false,
      bestMatchPEN: null
    };
  },
  computed: {
    ...mapState(penServicesStore, ['prbValidationIssueTypeCodes'])
  },
  created() {
    penServicesStore().getCodes();
    this.$nextTick().then(this.validateForm);
  },
  methods: {
    cancelClicked(){
      this.$emit('cancel');
    },
    formUpdated(){
      Object.keys(this.err).forEach(key => {
        this.err[key] = '';
      });
    },
    useFoundPEN(){
      this.$emit('useFoundPEN', this.bestMatchPEN);
    },
    requestStaffPENCheck(){
      this.$emit('requestStaffPENCheck');
    },
    async issueNewPEN() {
      if (this.$refs.studentDetailsForm.validate()) {
        this.isLoadingMatches = true;
        try {
          const payload = {
            student: {
              ...this.sdcStudent
            }
          };
          const result = await getDemogValidationResults(payload, this.sdcStudent.sdcSchoolCollectionID);
          const onlyErrors = result.filter(el => el.penRequestBatchValidationIssueSeverityCode === 'ERROR');
          let validationIssues = onlyErrors.map(y => {
            y.penRequestBatchValidationIssueTypeCode = this.prbValidationIssueTypeCodes.find(obj => obj.code === y.penRequestBatchValidationIssueTypeCode)?.description || y.penRequestBatchValidationIssueTypeCode;
            return y;
          });
          if (validationIssues?.length > 0) {
            this.err.legalLastNameError = validationIssues.find(el => el.penRequestBatchValidationFieldCode === 'LEGALLAST')?.penRequestBatchValidationIssueTypeCode || '';
            this.err.legalFirstNameError = validationIssues.find(el => el.penRequestBatchValidationFieldCode === 'LEGALFIRST')?.penRequestBatchValidationIssueTypeCode || '';
            this.err.legalMiddleNamesError = validationIssues.find(el => el.penRequestBatchValidationFieldCode === 'LEGALMID')?.penRequestBatchValidationIssueTypeCode || '';
            this.err.usualFirstNameError = validationIssues.find(el => el.penRequestBatchValidationFieldCode === 'USUALFIRST')?.penRequestBatchValidationIssueTypeCode || '';
            this.err.usualLastNameError = validationIssues.find(el => el.penRequestBatchValidationFieldCode === 'USUALLAST')?.penRequestBatchValidationIssueTypeCode || '';
            this.err.usualMiddleNamesError = validationIssues.find(el => el.penRequestBatchValidationFieldCode === 'USUALMID')?.penRequestBatchValidationIssueTypeCode || '';
            this.err.birthDateError = validationIssues.find(el => el.penRequestBatchValidationFieldCode === 'BIRTHDATE')?.penRequestBatchValidationIssueTypeCode || '';
            this.err.genderError = validationIssues.find(el => el.penRequestBatchValidationFieldCode === 'GENDER')?.penRequestBatchValidationIssueTypeCode || '';
          } else {
            const studentResponse = await ApiService.apiAxios.post(ApiRoutes.studentRequest.ROOT_ENDPOINT + '/sdcSchoolCollection/' + this.sdcStudent.sdcSchoolCollectionID + '/createStudent', payload);
            this.bestMatchPEN = studentResponse.data.pen;
            this.setSuccessAlert('PEN record was generated successfully for this student!');
            this.useFoundPEN();
          }
        } catch (e) {
          console.error(e);
          this.setFailureAlert('PEN could not be created, Please retry later.');
        } finally {
          this.isLoadingMatches = false;
        }
      }
    },
    async runPenMatch() {
      this.isLoadingMatches = true;
      try {
        let url = `${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${this.sdcStudent.sdcSchoolCollectionStudentID}/penMatch`;
        if(!this.sdcStudent.sdcSchoolCollectionStudentID){
          url = `${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION}/${this.sdcStudent.sdcSchoolCollectionID}/newStudent/penMatch`;
        }
        const result =  await ApiService.apiAxios.post(url, constructPenMatchObjectFromSdcStudent(this.sdcStudent));
        this.penMatchStatus = result.data.status;
        if(this.penMatchStatus === 'MATCH'){
          this.bestMatchPEN = result.data.bestMatchPEN;
          this.bestMatchStudentID = result.data.bestMatchStudentID;
          this.showMatchStatus = true;
        }else if(this.penMatchStatus === 'MULTI'){
          this.showMultiStatus = true;
        }else if(this.penMatchStatus === 'NEW'){
          this.showNewStatus = true;
        }
      } catch (error) {
        console.log(error);
        this.setFailureAlert('PEN Match API call failed, please try again.');
      } finally {
        this.isLoadingMatches = false;
      }
    },
    validateForm() {
      this.$refs?.studentDetailsForm?.validate();
    }
  }
};
</script>

<style scoped>
:deep(#dobPicker > div.dp__outer_menu_wrap.dp--menu-wrapper > div){
  position: fixed;
}
</style>

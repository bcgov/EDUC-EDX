<template>
  <v-row class="mt-0" :class="functionType !== 'add' ? 'mb-12' : 'mb-2'">
    <v-col class="pt-0">
      <v-row v-if="isLoading()">
        <v-col class="d-flex justify-center">
          <Spinner
            :flat="true"
            style="margin-bottom: 15.5rem"
          />
        </v-col>
      </v-row>
      <div 
        v-else
        ref="topDiv"        
      >
        <v-col
          class="pt-0"
          cols="12"
        >
          <v-form
            ref="registrationDetailsForm"
            v-model="studentRegistrationDetailsFormValid"
          >
            <v-row>
              <v-col cols="12">
                <v-row class="mt-n4">
                  <v-col>        
                    <v-autocomplete
                      id="Session"
                      v-model="assessmentStudentDetail.sessionID"
                      variant="underlined"                     
                      :items="sessionSearchNames"
                      label="Session"
                      item-title="sessionCodeName"
                      item-value="sessionCodeValue"
                      autocomplete="off"
                      :color="getFieldColor()"
                      :readonly="!isActive"
                      :class="!isActive ? 'readonly-text' : 'fieldtext'"
                      :rules="[rules.required()]"      
                      @update:model-value="refreshAssessmentTypes($event)"                
                    />
                  </v-col>               
                
                  <v-col cols="6">   
                    <v-autocomplete
                      id="AssessmentCourse"
                      v-model="assessmentStudentDetail.assessmentTypeName_desc"
                      variant="underlined"                      
                      :items="assessmentTypeSearchNames"
                      label="Assessment Course"
                      item-title="assessmentCodeName"
                      item-value="assessmentCodeValue"
                      autocomplete="off"
                      :color="getFieldColor()"
                      :readonly="!isActive"
                      :class="!isActive ? 'readonly-text' : 'fieldtext'"
                      :rules="[rules.required()]"      
                      @update:model-value="syncAssessmentValue($event)"                
                    /> 
                  </v-col>                  
                </v-row>
                <v-row class="mt-n4">
                  <v-col  cols="6">
                    <v-text-field
                      id="District"
                      v-model="assessmentStudentDetail.districtName_desc"
                      label="District"
                      variant="underlined"
                      :maxlength="25"
                      density="compact"
                      :readonly="true"
                      :class="['readonly-text']"
                    />
                  </v-col>    
                  <v-col>
                    <v-text-field
                      id="School"
                      v-model="assessmentStudentDetail.schoolName_desc"
                      label="School"
                      variant="underlined"
                      :maxlength="25"
                      density="compact"
                      :readonly="true"
                      :class="['readonly-text']"
                    />
                  </v-col>                  
                </v-row>
                <v-row class="mt-n4">
                  <v-col cols="6">                    
                    <v-autocomplete
                      id="AssessmentCenter"
                      v-model="assessmentStudentDetail.assessmentCenterID"
                      variant="underlined"                      
                      :items="assessmentCenterSearchNames"
                      label="Assessment Center Name or Number"
                      :clearable="true"
                      item-title="schoolCodeName"
                      item-value="schoolCodeValue"
                      autocomplete="off"
                      density="compact"
                      :color="getFieldColor()"
                      :readonly="!isActive"
                      :class="!isActive ? 'readonly-text' : 'fieldtext'"
                      :rules="[rules.required()]"   
                    />
                  </v-col>   
                  <v-col>     
                    <v-text-field
                      id="SpecialCase"
                      v-model="assessmentStudentDetail.provincialSpecialCaseName_desc"
                      label="Special Case"
                      variant="underlined"
                      :maxlength="25"
                      density="compact"
                      :readonly="true"
                      :class="['readonly-text']"
                    />               
                  </v-col>               
                </v-row>
                <v-row class="mt-n4">
                  <v-col>
                    <v-text-field
                      id="PEN"
                      v-model="assessmentStudentDetail.pen"
                      label="Personal Education Number (PEN)"
                      variant="underlined"
                      :maxlength="25"
                      density="compact"
                      :readonly="true"
                      :class="['readonly-text']"
                    />
                  </v-col>                  
            
                  <v-col>
                    <v-text-field
                      id="LocalID"
                      v-model="assessmentStudentDetail.localID"
                      label="Local ID"
                      variant="underlined"
                      :maxlength="25"
                      density="compact"
                      :readonly="true"
                      :class="['readonly-text']"
                    />
                  </v-col>                  
                </v-row>
                <v-row class="mt-n4">
                  <v-col>
                    <v-text-field
                      id="GivenName"
                      v-model="assessmentStudentDetail.givenName"
                      label="Given Name"
                      variant="underlined"
                      :maxlength="25"
                      density="compact"
                      :readonly="true"
                      :class="['readonly-text']"
                    />
                  </v-col>                  
           
                  <v-col>
                    <v-text-field
                      id="SurName"
                      v-model="assessmentStudentDetail.surName"
                      label="SurName"                      
                      variant="underlined"
                      density="compact"
                      :readonly="true"
                      :class="['readonly-text']"
                    />
                  </v-col>                  
                </v-row>
                <v-row class="mt-n4">
                  <v-col>
                    <v-text-field
                      id="AttemptNumber"
                      v-model="assessmentStudentDetail.numberOfAttempts"
                      label="Attempt Number"
                      variant="underlined"
                      :readonly="true"
                      density="compact"
                      :class="['readonly-text']"
                    />
                  </v-col> 
                  <v-col>
                    <v-text-field
                      id="ProficiencyScore"
                      v-model="assessmentStudentDetail.proficiencyScore"
                      label="Proficiency Score"
                      variant="underlined"
                      :readonly="true"
                      density="compact"
                      :class="['readonly-text']"
                    />
                  </v-col>                 
                </v-row>                                                
              </v-col>
            </v-row>
          </v-form>
        </v-col>
      </div>
      <v-row 
        v-if="isActive"
        :class="functionType !== 'add' ? 'footer' : ''" 
        no-gutters 
      >
        <v-col class="d-flex justify-end mr-3 mt-3">
          <v-btn
            v-if="functionType !== 'add'"
            id="removeRecord"
            color="#003366"
            large-icon
            prepend-icon="mdi-delete"
            text="Remove"
            variant="outlined"
            class="mr-1"
            :disabled="!studentRegistrationDetailsFormValid"
            @click="deleteStudentRegistration"
          />
          <v-btn
            id="saveRecord"
            color="#003366"
            text="Validate & Save"
            class="mr-1"
            :disabled="!studentRegistrationDetailsFormValid"
            @click="saveStudentRegistration"
          />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
  <ConfirmationDialog ref="confirmRemoveStudentRegistration">
    <template #message>
      <p>Are you sure you want to remove this student registration from the session?</p>
    </template>
  </ConfirmationDialog>
</template>

<script>
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';
import ConfirmationDialog from '../../../util/ConfirmationDialog.vue';
import * as Rules from '../../../../utils/institute/formRules';
import Spinner from '../../../common/Spinner.vue';
import {
  setFailureAlert,
  setSuccessAlert,
} from '../../../composable/alertComposable';
import { sortBy } from 'lodash';
import { appStore } from '../../../../store/modules/app';
import {authStore} from '../../../../store/modules/auth';
import { mapState } from 'pinia';
import {easStore} from '../../../../store/modules/eas';

import moment from 'moment';

export default {
  name: 'EditStudentRegistration',
  components: {
    ConfirmationDialog,
    Spinner
  },
  props: {   
    selectedAssessmentStudentId: {
      type: String,
      required: true,
      default: null,
    }, 
    schoolYearSessions: {
      type: Object,
      required: true,
      default: null,
    },
    saveEvent: {
      type: Boolean,
      required: false,
      default: false,
    },
    removeEvent: {
      type: Boolean,
      required: false,
      default: false,
    },    
    functionType: {
      type: String,
      required: false,
      default: null
    },
  },
  emits: ['form-validity','reset-student-registration-parent', 'reset-student-registration-pagination'],
  data() {
    return {
      rules: Rules,
      sessionSearchNames: [],
      assessmentTypeSearchNames: [],
      assessmentCenterSearchNames: [],
      specialCaseSearchNames: [],
      selectedAssessmentStudentID: null,
      studentRegistrationDetailsFormValid: false,
      assessmentStudentDetail: {},
      loadingCount: 0,
      isActive: false
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['activeSchoolsMap', 'schoolsMap', 'config']),
    ...mapState(easStore, ['specialCaseCodes']),
  },
  watch: {
    selectedAssessmentStudentId: {
      handler(value) {
        this.setupAssessmentSessions();  
        this.getAssessmentStudentDetail(value);        
      },
      immediate: true
    },
    saveEvent: {
      handler(value) {
        if (value) {
          this.saveStudentRegistration();
        }
      },
    },
    removeEvent: {
      handler(value) {
        if (value) {
          this.deleteRegistration();
        }
      },
    },    
    studentRegistrationDetailsFormValid: {
      handler() {
        this.$emit('form-validity', this.studentRegistrationDetailsFormValid);
      }
    },
  },  
  async beforeMount() {
    this.selected = {...this.initialFilterSelection};
    if (this.activeSchoolsMap.size === 0) {
      await appStore().getInstitutesData();
    }    
  },
  created() {
    authStore()
      .getUserInfo()
      .then(() => {
        appStore()
          .getInstitutesData()
          .then(() => {
            this.setupSchoolList();
            this.loading = false;
          });
        easStore()
          .getSpecialCaseCodes()
          .then(() => {            
            this.setupSpecialCaseCodes();     
            this.loading = false;
          });
      });    
  },
  methods: {
    isLoading(){
      return this.loadingCount > 0;
    },
    setupSchoolList() {
      this.schoolSearchNames = [];
      this.activeSchoolsMap?.forEach((school) => {
        this.schoolSearchNames.push({
          schoolCodeName: school.schoolName + ' - ' + school.mincode,
          schoolCodeValue: school.schoolID
        });
      });
      this.assessmentCenterSearchNames = sortBy(this.schoolSearchNames, ['schoolCodeName']);
    },
    setupAssessmentSessions() {
      this.sessionSearchNames = [];
      let sessions = [];
      this.schoolYearSessions?.forEach((session) => {
        sessions.push({
          sessionCourseMonth: parseInt(session.courseMonth),
          sessionCourseYear: parseInt(session.courseYear),
          sessionCodeName: this.formatMonth(session.courseMonth) + ' ' + session.courseYear,
          sessionCodeValue: session.sessionID
        });
      });
      this.sessionSearchNames = sortBy(sessions, ['sessionCourseYear','sessionCourseMonth']); 
    },
    setupSpecialCaseCodes() {
      this.specialCaseSearchNames = [];
      let specialCases = [];
      Object.keys(this.specialCaseCodes).forEach(key => {
        specialCases.push({
          specialCaseCodeName: this.specialCaseCodes[key],
          specialCaseCodeValue: key
        });
      });
      this.specialCaseSearchNames = sortBy(specialCases, ['specialCaseCodeName']); 
    },
    refreshAssessmentTypes($event) {
      let session = this.schoolYearSessions.find(session => session.sessionID === $event);
      this.assessmentTypeSearchNames = [];
      let assessmentTypes = [];
      let assessmentID = null;
      session?.assessments.forEach((assessment) => {
        if(assessment.assessmentTypeName === this.assessmentStudentDetail.assessmentTypeName_desc) {
          assessmentID = assessment.assessmentID;
        }
        assessmentTypes.push({
          assessmentCodeName: assessment.assessmentTypeName,
          assessmentCodeValue: assessment.assessmentTypeName,
          displayOrder: assessment.displayOrder
        });
      });            
      this.assessmentTypeSearchNames = sortBy(assessmentTypes, ['displayOrder']); 
      if(assessmentID) {
        this.assessmentStudentDetail.assessmentID = assessmentID;        
      } else {
        this.assessmentStudentDetail.assessmentID = null;
        this.assessmentStudentDetail.assessmentTypeName_desc = null;
      }
    },
    syncAssessmentValue($event) {
      let session = this.schoolYearSessions.find(session => session.sessionID === this.assessmentStudentDetail.sessionID);
      let assessment = session?.assessments.find(assessment => assessment.assessmentTypeName === $event);
      if(assessment) {
        this.assessmentStudentDetail.assessmentID = assessment.assessmentID; 
      }
    },        
    getAssessmentStudentDetail(assessmentStudentID) {
      this.loadingCount += 1;
      this.selectedAssessmentStudentID=assessmentStudentID;
      ApiService.apiAxios.get(`${ApiRoutes.eas.ASSESSMENT_STUDENTS}/${this.userInfo.activeInstituteType}/${assessmentStudentID}`)
        .then(response => {
          this.assessmentStudentDetail = response.data;
          this.refreshAssessmentTypes(this.assessmentStudentDetail.sessionID);
          this.setupActiveFlag();
        }).catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to get student registration details. Please try again later.');
        }).finally(() => {
          this.loadingCount -= 1;
          if (!this.isLoading()) {
            this.$nextTick().then(this.validateForm);
          }
        });
    },
    setupActiveFlag() {
      this.isActive = this.schoolYearSessions.find(session => session.sessionID === this.assessmentStudentDetail.sessionID)?.isOpen && !parseInt(this.assessmentStudentDetail.proficiencyScore) > 0;
    },
    saveStudentRegistration() {
      this.loadingCount += 1;
      const putAssessmentStudentDetail = Object.fromEntries(
        Object.entries(this.assessmentStudentDetail).filter(([key]) => !key.endsWith('_desc'))
      );
      ApiService.apiAxios
        .put(
          `${ApiRoutes.eas.ASSESSMENT_STUDENTS}/${this.userInfo.activeInstituteType}/`+this.selectedAssessmentStudentID, 
          putAssessmentStudentDetail
        )
        .then(() => {
          setSuccessAlert('Success! The student registration details have been updated.');    
          this.$emit('reset-student-registration-pagination');
        })
        .catch((error) => {
          console.error(error);
          setFailureAlert(
            error?.response?.data?.message
              ? error?.response?.data?.message
              : 'An error occurred while trying to update student registration details. Please try again later.'
          );
        })
        .finally(() => {          
          this.loadingCount -= 1;
          this.$emit('reset-student-registration-parent');
        });
    },
    deleteStudentRegistration() {
      const confirmation = this.$refs.confirmRemoveStudentRegistration.open('Confirm Removal of Student Registration', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Remove', rejectText: 'Cancel'});
      if (!confirmation) {
        return;
      }
    },
    validateForm() {
      this.$refs?.registrationDetailsForm?.validate();
    },
    formatMonth(month) {
      return moment(month, 'MM').format('MMMM');
    },
    getFieldColor() {
      return !this.isActive ? '#7f7f7f' : '#003366';
    }
  },
};
</script>
<style>
.readonly-text {
  color: #7f7f7f;
}
</style>

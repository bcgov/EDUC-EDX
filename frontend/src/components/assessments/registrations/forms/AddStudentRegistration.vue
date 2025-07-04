<template>
  <v-card>
    <v-card-title
      id="viewAddStudentRegistrationCardTitle"
      class="sheetHeader pt-1 pb-1"
    >
      <v-row no-gutters>
        <v-col class="d-flex justify-start">
          Add Graduation Assessment Registration
        </v-col>
        <v-col class="d-flex justify-end">
          <v-btn
            id="cancel"
            color="white"
            text="Close"
            size="30"
            icon="mdi-close"
            variant="tonal"
            @click="cancel"
          />
        </v-col>
      </v-row>
    </v-card-title>

    <v-card-text class="mt-0 mb-6">
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
        <v-row class="d-flex">
          <v-col :cols="newStudentDetail.assessmentStudentValidationIssues.length > 0 ? 6 : 12">
            <v-form
              ref="addRegistrationForm"
              v-model="addStudentRegistrationFormValid"
            >
              <v-row>
                <v-col>
                  <v-text-field
                    id="PEN"
                    v-model="newStudentDetail.pen"
                    label="Personal Education Number (PEN)"
                    variant="underlined"
                    :maxlength="25"
                    density="compact"
                    :rules="[rules.required(), rules.penIsValid()]"
                  />
                </v-col>
                <v-col>
                  <v-text-field
                    id="LocalID"
                    v-model="newStudentDetail.localID"
                    label="Local ID"
                    variant="underlined"
                    :maxlength="25"
                    density="compact"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    id="GivenName"
                    v-model="newStudentDetail.givenName"
                    label="Student's Legal First Name"
                    variant="underlined"
                    density="compact"
                    :rules="[rules.required()]"
                  />
                </v-col>
                <v-col>
                  <v-text-field
                    id="SurName"
                    v-model="newStudentDetail.surname"
                    label="Student's Legal Last Name"
                    variant="underlined"
                    density="compact"
                    :rules="[rules.required()]"
                  />
                </v-col>
              </v-row>
              <v-row v-if="isDistrictUser">
                <v-col>
                  <v-autocomplete
                    id="School"
                    v-model="newStudentDetail.schoolOfRecordSchoolID"
                    variant="underlined"
                    :items="schoolSearchNames"
                    label="School"
                    item-title="schoolCodeName"
                    item-value="schoolID"
                    autocomplete="off"
                    :rules="[rules.required()]"
                  />
                </v-col>
              </v-row>
              <v-row class="mt-n2">
                <v-col>
                  <v-select
                    id="Session"
                    v-model="selectedSessionID"
                    variant="underlined"
                    :items="sessionSearchNames"
                    label="Session"
                    item-title="sessionCodeName"
                    item-value="sessionCodeValue"
                    :disabled="!!sessionID"
                    :rules="[rules.required()]"
                    @update:model-value="refreshAssessmentTypes($event)"
                  />
                </v-col>
                <v-col>
                  <v-autocomplete
                    id="AssessmentCourse"
                    v-model="newStudentDetail.assessmentID"
                    variant="underlined"
                    :items="assessmentTypeSearchNames"
                    label="Assessment Code"
                    item-title="assessmentCodeName"
                    item-value="assessmentCodeValue"
                    autocomplete="off"
                    :rules="[rules.required()]"
                    :disabled="!sessionID && !selectedSessionID"
                    @update:model-value="syncAssessmentValue($event)"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-autocomplete
                    id="AssessmentCenter"
                    v-model="newStudentDetail.assessmentCenterSchoolID"
                    variant="underlined"
                    :items="assessmentCenterSearchNames"
                    label="Assessment Center"
                    :clearable="true"
                    item-title="schoolCodeName"
                    item-value="schoolID"
                    autocomplete="off"
                    density="compact"
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-col>
          <v-col
            v-if="newStudentDetail?.assessmentStudentValidationIssues?.length > 0"
            cols="12"
            md="6"
          >
            <v-row v-if="hasError">
              <v-col>
                <v-alert
                  type="warning"
                  variant="tonal"
                  text="Warning! Updates to student details will not be saved until all errors are fixed."
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col class="pl-0">
                <div class="timeline-container">
                  <v-timeline
                    side="end"
                    density="compact"
                    style="margin-left: 1em"
                    align="start"
                    truncate-line="start"
                  >
                    <v-timeline-item
                      v-for="(issue, index) in newStudentDetail.assessmentStudentValidationIssues"
                      :key="index"
                      dot-color="white"
                      fill-dot
                      icon-color="#d90606"
                      icon="mdi-alert-circle-outline"
                      size="large"
                      width="100%"
                    >
                      <v-row class="mt-n1">
                        <v-col>
                          <h3 class="validation-issue">
                            {{ issue.validationLabel }}
                          </h3>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <span> {{ issue.validationMessage }}</span>
                        </v-col>
                      </v-row>
                    </v-timeline-item>
                  </v-timeline>
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </div>
      <v-row
        cols="24"
        class="justify-end"
      >
        <v-col class="d-flex justify-end">
          <v-btn
            id="cancelRecord"
            color="#003366"
            text="Cancel"
            class="mr-2"
            variant="outlined"
            @click="cancel"
          />
          <v-btn
            id="saveRecord"
            color="#003366"
            text="Validate & Save"
            :disabled="!addStudentRegistrationFormValid"
            @click="saveStudentRegistration"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>

import { sortBy } from 'lodash';
import { mapState } from 'pinia';
import {appStore} from '../../../../store/modules/app';
import {ApiRoutes} from '../../../../utils/constants';
import {setFailureAlert, setSuccessAlert} from '../../../composable/alertComposable';
import ApiService from '../../../../common/apiService';
import Spinner from '../../../common/Spinner.vue';
import * as Rules from '../../../../utils/institute/formRules';
import {authStore} from '../../../../store/modules/auth';


export default {
  name: 'AddStudentRegistration',
  components: {
    Spinner
  },
  props: {
    schoolYearSessions: {
      type: Object,
      required: true,
      default: null,
    },
    sessionID: {
      type: String,
      required: false,
      default: null
    },
    saveEvent: {
      type: Boolean,
      required: false,
      default: false,
    }
  },
  emits: ['form-validity','reload-student-registrations', 'close-new-student-registration'],
  data() {
    return {
      rules: Rules,
      sessionSearchNames: [],
      schoolSearchNames: [],
      assessmentTypeSearchNames: [],
      assessmentCenterSearchNames: [],
      addStudentRegistrationFormValid: false,
      hasError: false,
      newStudentDetail: {
        assessmentID: null,
        schoolOfRecordSchoolID: null,
        assessmentCenterSchoolID: null,
        givenName: null,
        surname: null,
        pen: null,
        localID: null,
        isElectronicExam: null,
        proficiencyScore: null,
        assessmentStudentValidationIssues: []
      },
      selectedSessionID: null,
      studentRegistrationValidationIssues: [],
      loadingCount: 0,
      isActive: false,
      isDistrictUser: false
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(appStore, ['activeSchoolsMap', 'config']),
  },
  watch: {
    saveEvent: {
      handler(value) {
        if (value) {
          this.saveStudentRegistration();
        }
      },
    },
    addStudentRegistrationFormValid: {
      handler() {
        this.$emit('form-validity', this.addStudentRegistrationFormValid);
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
    authStore().getUserInfo().then(() => {
      this.isDistrictUser = this.userInfo.activeInstituteType !== 'SCHOOL';
    });
    this.setupSchoolList();
    this.setupSessions();
    if(this.sessionID){
      this.selectedSessionID = this.sessionID;
      this.refreshAssessmentTypes(this.sessionID);
    }
  },
  methods: {
    isLoading(){
      return this.loadingCount > 0;
    },
    setupSchoolList() {
      this.activeSchoolsMap?.forEach((school) => {
        this.schoolSearchNames.push({
          schoolCodeName: school.mincode + ' - ' + school.schoolName,
          schoolID: school.schoolID,
        });
      });
      this.assessmentCenterSearchNames = sortBy(this.schoolSearchNames, ['schoolCodeName']);
      this.schoolSearchNames = sortBy(this.schoolSearchNames, ['schoolCodeName']);
    },
    setupSessions() {
      let sessions = [];
      this.schoolYearSessions?.forEach((session) => {
        sessions.push({
          sessionCourseMonth: parseInt(session.courseMonth),
          sessionCourseYear: parseInt(session.courseYear),
          sessionCodeName: session.courseYear + '/' + session.courseMonth,
          sessionCodeValue: session.sessionID
        });
      });
      this.sessionSearchNames = sortBy(sessions, ['sessionCourseYear','sessionCourseMonth']);
    },
    refreshAssessmentTypes($event) {
      let session = this.schoolYearSessions.find(session => session.sessionID === $event);
      let assessmentTypes = [];
      let assessmentID = null;
      session?.assessments.forEach((assessment) => {
        if(assessment.assessmentTypeName === this.newStudentDetail.assessmentTypeName_desc) {
          assessmentID = assessment.assessmentID;
        }
        assessmentTypes.push({
          assessmentCodeName: assessment.assessmentTypeName,
          assessmentCodeValue: assessment.assessmentID,
          displayOrder: assessment.displayOrder
        });
      });
      this.assessmentTypeSearchNames = sortBy(assessmentTypes, ['displayOrder']);
      if(assessmentID) {
        this.newStudentDetail.assessmentID = assessmentID;
      } else {
        this.newStudentDetail.assessmentID = null;
        this.newStudentDetail.assessmentTypeName_desc = null;
      }
    },
    syncAssessmentValue($event) {
      let session = this.schoolYearSessions.find(session => session.sessionID === this.newStudentDetail.sessionID);
      let assessment = session?.assessments.find(assessment => assessment.assessmentTypeName === $event);
      if(assessment) {
        this.newStudentDetail.assessmentID = assessment.assessmentID;
      }
    },
    saveStudentRegistration() {
      this.loadingCount += 1;

      const newAssessmentStudentDetail = Object.fromEntries(
        Object.entries(this.newStudentDetail).filter(([key]) => !key.endsWith('_desc'))
      );

      if(!this.isDistrictUser){
        newAssessmentStudentDetail.schoolOfRecordSchoolID = this.userInfo.activeInstituteIdentifier;
      }

      ApiService.apiAxios
        .post(
          `${ApiRoutes.assessments.ASSESSMENT_REGISTRATIONS}/${this.userInfo.activeInstituteType.toLowerCase()}/students`,
          newAssessmentStudentDetail
        )
        .then((res) => {
          this.newStudentDetail = res.data;
          if(this.newStudentDetail.assessmentStudentValidationIssues){
            this.hasError = true;
          } else if(!this.newStudentDetail.assessmentStudentValidationIssues) {
            this.hasError = false;
            setSuccessAlert('Success! The new student registration has been created.');
            this.$emit('close-new-student-registration');
          }
          this.loadingCount -= 1;
        })
        .catch((error) => {
          console.error(error);
          setFailureAlert(
            error?.response?.data?.message
              ? error?.response?.data?.message
              : 'An error occurred while trying to update student registration details. Please try again later.'
          );
        });

      this.loadingCount -= 1;
    },
    validateForm() {
      this.$refs?.addRegistrationForm?.validate();
    },
    cancel() {
      this.$emit('close-new-student-registration');
    },
  },
};
</script>
<style>
.sheetHeader {
  background-color: #003366;
  color: white;
  font-size: medium !important;
  font-weight: bolder !important;
}
.validation-issue{
  color: #d90606;
}

</style>

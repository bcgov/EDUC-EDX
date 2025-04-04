<template>
  <v-card
    id="programDuplicate"
  >
    <v-card-title
      id="programDuplicateTitle"
      class="sheetHeader pt-1 pb-1"
    >
      <v-row no-gutters>
        <v-col class="d-flex justify-start">
          Resolve Program Duplicates
        </v-col>
        <v-col class="d-flex justify-end">
          <v-btn
            id="cancel"
            color="white"
            text="Close"
            size="30"
            icon="mdi-close"
            variant="tonal"
            @click="close"
          />
        </v-col>
      </v-row>
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-row>
        <v-col>
          <v-alert
            id="duplicateTypeAlert"
            class="justify-center"
            type="error"
            variant="tonal"
            :text="duplicateTypeHeading"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col
          class="border mr-1"
          cols="6"
        >
          <StudentDetail
            :student="selectedProgramDuplicate?.sdcSchoolCollectionStudent1Entity"
            :duplicate-type-code="selectedProgramDuplicate?.programDuplicateTypeCode"
          />
        </v-col>           
        <v-col class="border ml-1">
          <StudentDetail
            :student="selectedProgramDuplicate?.sdcSchoolCollectionStudent2Entity"
            :duplicate-type-code="selectedProgramDuplicate?.programDuplicateTypeCode"
          />
        </v-col>
      </v-row>

      <v-row class="mt-6">
        <v-col class="label">
          <span>Select which school to remove the program code from for this student:</span>
        </v-col>
      </v-row>

      <v-form
        ref="studentForm"
        v-model="validForm"
      >
        <v-row>
          <v-col>
            <div
              v-for="(prog, index) in getDuplicatePrograms()"
              :key="index"
            >
              <span>{{ prog?.description }}</span>

              <v-radio-group
                v-model="selected[index]"
                direction="horizontal"
                :inline="true"
                :rules="[v => !!v || 'Required']"
                validate-on="input"
                required
              >
                <v-radio
                  :id="`index`"
                  :label="prog?.studentOne?.schoolName"
                  :value="{dupeCode: prog?.code, studentId: prog?.studentOne?.sdcSchoolCollectionStudentID}"
                />
                <v-radio
                  :id="`index`"
                  :label="prog?.studentTwo?.schoolName"
                  :value="{dupeCode: prog?.code, studentId: prog?.studentTwo?.sdcSchoolCollectionStudentID}"
                />
              </v-radio-group>
            </div>
          </v-col>
        </v-row>
      </v-form>

      <v-row class="mt-n2">
        <v-col
          cols="12"
          class="d-flex justify-end"
        >
          <v-btn
            id="release"
            color="#003366"
            class="mb-1 release-button"
            text="Release selected program from School"
            variant="elevated"
            :disabled="!validForm"
            @click="releaseStudent()"
          />
        </v-col>
      </v-row>
   
      <ConfirmationDialog ref="confirmReleaseProgram">
        <template #message>
          <p>Are you sure you want to release selected program from school?</p>
        </template>
      </ConfirmationDialog>
    </v-card-text>
  </v-card>
</template>
<script>

import StudentDetail from '../../../common/StudentDetail.vue';
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';
import {setSuccessAlert, setFailureAlert} from '../../../composable/alertComposable';
import {cloneDeep} from 'lodash';
import {sdcCollectionStore} from '../../../../store/modules/sdcCollection';
import {enrolledProgram}  from '../../../../utils/sdc/enrolledProgram';
import ConfirmationDialog from '../../../util/ConfirmationDialog.vue';

export default {
  name: 'ProgramDuplicateResolution',
  components: {
    StudentDetail,
    ConfirmationDialog
  },
  props: {
    selectedProgramDuplicate: {
      type: Object,
      required: true,
      default: null
    }
  },
  emits: ['close', 'close-refresh'],
  data() {
    return {
      selected:[],
      sdcStudentOneDetailCopy: {},
      sdcStudentTwoDetailCopy: {},
      validForm: false,
      type: 'PROGRAM',
      duplicateStudents: []
    };
  },
  computed: {
    duplicateTypeHeading(){  return this.selectedProgramDuplicate?.programDuplicateTypeCodeDescription + ' Program Duplicate';}
  },
  watch: {
    selectedProgramDuplicate: {
      handler(value) {
        if(value) {
          this.sdcStudentOneDetailCopy = this.selectedProgramDuplicate?.sdcSchoolCollectionStudent1Entity;
          this.sdcStudentTwoDetailCopy = this.selectedProgramDuplicate?.sdcSchoolCollectionStudent2Entity;
          this.sdcStudentOne = cloneDeep(this.selectedProgramDuplicate?.sdcSchoolCollectionStudent1Entity);
          this.sdcStudentTwo = cloneDeep(this.selectedProgramDuplicate?.sdcSchoolCollectionStudent2Entity);
          this.duplicateStudents = [this.sdcStudentOne, this.sdcStudentTwo];
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.validateForm();
  },
  async created() {
  
  },
  methods: {
    validateForm() {
      this.$refs?.studentForm?.validate();
    },
    close() {
      this.$emit('close');
    },
    cancel() {
      this.$emit('close-refresh');
    },
    async releaseStudent() {
      const confirmation = await this.$refs.confirmReleaseProgram.open('Confirm Release of Program', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Release', rejectText: 'Cancel'});
      if (!confirmation) {
        return;
      }
      for(let value of this.selected) {
        this.updateStudentObject(value.dupeCode, value.studentId);
      }

      this.saveAndResolve();
    },
    saveAndResolve() {
      this.loadingCount += 1;
      let payload = {
        students: this.duplicateStudents,
        duplicate: this.selectedProgramDuplicate
      };
      ApiService.apiAxios.post(ApiRoutes.sdc.SDC_DUPLICATE_RESOLVE + '/' +this.type, payload)
        .then(() => {
          setSuccessAlert('Success! The student details have been updated.');
          this.cancel();
        }).catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to update student details. Please try again later.');
          this.cancel();
        }).finally(() => {
          this.loadingCount -= 1;
          this.selected = [];
          this.$nextTick().then(this.validateForm);
        });
    },
    updateStudentObject(valueToBeRemoved, studentId) {
      let studentToBeUpdated = this.duplicateStudents.find(student => student.sdcSchoolCollectionStudentID === studentId);
      let otherStudent = this.duplicateStudents.find(student => student.sdcSchoolCollectionStudentID !== studentId);
      otherStudent.enrolledProgramCodes = studentToBeUpdated?.enrolledProgramCodes?.join('');

      if(this.selectedProgramDuplicate?.programDuplicateTypeCode === 'SPECIAL_ED'){
        studentToBeUpdated.specialEducationCategoryCode = null;
        studentToBeUpdated.enrolledProgramCodes = studentToBeUpdated?.enrolledProgramCodes?.join('');
      } else if(this.selectedProgramDuplicate?.programDuplicateTypeCode === 'CAREER'){
        studentToBeUpdated.careerProgramCode = null;
        let updateEnrolledPrograms = studentToBeUpdated.enrolledProgramCodes.filter(value => !enrolledProgram.CAREER_ENROLLED_PROGRAM_CODES.includes(value));
        studentToBeUpdated.enrolledProgramCodes = updateEnrolledPrograms.join('');
      } else {
        let updateEnrolledPrograms = studentToBeUpdated.enrolledProgramCodes.filter(value => !value.includes(valueToBeRemoved));
        studentToBeUpdated.enrolledProgramCodes = updateEnrolledPrograms.join('');
      }
    },
    getDuplicatePrograms() {
      let programs = [];
      if(this.selectedProgramDuplicate?.programDuplicateTypeCode === 'SPECIAL_ED') {
        programs.push({code: this.sdcStudentOneDetailCopy.specialEducationCategoryCode, description: '', studentOne: this.sdcStudentOneDetailCopy, studentTwo: this.sdcStudentTwoDetailCopy});
      } else if (this.selectedProgramDuplicate?.programDuplicateTypeCode === 'INDIGENOUS') {
        let mappedPrograms = this.mapEnrolledProgram(enrolledProgram.INDIGENOUS_ENROLLED_PROGRAM_CODES);

        for(let progs of mappedPrograms) {
          programs.push(progs);
        }
      } else if(this.selectedProgramDuplicate?.programDuplicateTypeCode === 'CAREER') {
        let mappedPrograms = this.mapEnrolledProgram(enrolledProgram.CAREER_ENROLLED_PROGRAM_CODES);

        // Dupe is in the career program code
        if(mappedPrograms.length === 0){
          mappedPrograms.push({code: this.sdcStudentOneDetailCopy.careerProgramCode, description: `${this.sdcStudentOneDetailCopy.careerProgramCode} - ${sdcCollectionStore().careerProgramCodesMap.get(this.sdcStudentOneDetailCopy.careerProgramCode)?.description}`, studentOne: this.sdcStudentOneDetailCopy, studentTwo: this.sdcStudentTwoDetailCopy});
        }

        for(let progs of mappedPrograms){
          programs.push(progs)
        }
      } else if(this.selectedProgramDuplicate?.programDuplicateTypeCode === 'LANGUAGE') {
        let mappedPrograms = this.mapEnrolledProgram(enrolledProgram.LANGUAGE_PROGRAM_CODES);

        for(let progs of mappedPrograms) {
          programs.push(progs);
        }
      }
      return programs;
    },
    mapEnrolledProgram(enrolledProgramFilter) {
      console.log(this.sdcStudentOneDetailCopy)
      return this.sdcStudentOneDetailCopy?.enrolledProgramCodes
        ?.filter(programCode => enrolledProgramFilter.includes(programCode) &&
            this.sdcStudentTwoDetailCopy?.enrolledProgramCodes.includes(programCode))
        .map(programCode => {
          const enrolledProgram = sdcCollectionStore().enrolledProgramCodesMap.get(programCode);
          return {code: programCode, description: `${programCode} - ${enrolledProgram.description}`, studentOne: this.sdcStudentOneDetailCopy, studentTwo: this.sdcStudentTwoDetailCopy};
        });
    },
  }
};
</script>
  
  <style scoped>
   .containerSetup{
      padding-right: 0em !important;
      padding-left: 0em !important;
    }
  

  
    @media screen and (max-width: 1200px) {
      .containerSetup{
        padding-right: 3em !important;
        padding-left: 3em !important;
      }
    }

  
    .success-message{
      vertical-align: sub;
     }
  
    .sheetHeader {
      background-color: #003366;
      color: white;
      font-size: medium !important;
      font-weight: bolder !important;
    }

    .label {
      font-weight: bold;
   }
   .border {
    border: 1px thin lightgrey;
   }
  
  </style>
  

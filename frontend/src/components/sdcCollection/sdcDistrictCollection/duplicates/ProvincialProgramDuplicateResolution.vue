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
            :student="currentStudent"
            :duplicate-type-code="selectedProgramDuplicate?.programDuplicateTypeCode"
          />
        </v-col>           
        <v-col class="border ml-1">
          <StudentDetail
            :student="otherStudent"
            :duplicate-type-code="selectedProgramDuplicate?.programDuplicateTypeCode"
          />
        </v-col>
      </v-row>

      <v-row class="mt-6">
        <v-col class="label">
          <span>Select the program codes to remove from your school for this student:</span>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <div
            v-for="(prog, index) in getDuplicatePrograms()"
            :key="index"
          >
            <v-checkbox
              :id="`${prog?.code}-checkbox`"
              v-model="selected[index]"
              color="#003366"
              :label="prog?.description"
              :value="prog?.code"
              density="compact"
              hide-details
            />
          </div>
        </v-col>
      </v-row>
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
            :disabled="!selected.some(value => value !== false)"
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
import ConfirmationDialog from '../../../util/ConfirmationDialog.vue';
import {enrolledProgram}  from '../../../../utils/sdc/enrolledProgram';

export default {
  name: 'ProvincialProgramDuplicateResolution',
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
      currentUsersStudent: {},
      otherSchoolsStudent: {},
      currentStudent: {},
      otherStudent: {},
      type: 'PROGRAM',
      duplicateStudents: []
    };
  },
  computed: {
    duplicateTypeHeading(){  return this.selectedProgramDuplicate?.programDuplicateTypeCodeDescription + ' Program Duplicate';}
  },
  watch: {
  },
  mounted() {
    this.validateForm();
  },
  async created() {
    if(!this.selectedProgramDuplicate?.sdcSchoolCollectionStudent1Entity?.sdcSchoolCollectionStudentID) {
      this.currentUsersStudent = cloneDeep(this.selectedProgramDuplicate?.sdcSchoolCollectionStudent2Entity);
      this.otherSchoolsStudent = cloneDeep(this.selectedProgramDuplicate?.sdcSchoolCollectionStudent1Entity);
      this.currentStudent = this.selectedProgramDuplicate?.sdcSchoolCollectionStudent2Entity;
      this.otherStudent = this.selectedProgramDuplicate?.sdcSchoolCollectionStudent1Entity;
    } else {
      this.currentUsersStudent = cloneDeep(this.selectedProgramDuplicate?.sdcSchoolCollectionStudent1Entity);
      this.otherSchoolsStudent = cloneDeep(this.selectedProgramDuplicate?.sdcSchoolCollectionStudent2Entity);
      this.currentStudent = this.selectedProgramDuplicate?.sdcSchoolCollectionStudent1Entity;
      this.otherStudent = this.selectedProgramDuplicate?.sdcSchoolCollectionStudent2Entity;
    }
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
        this.updateStudentObject(value, this.currentUsersStudent.sdcSchoolCollectionStudentID);
      }
      this.saveAndResolve();
    },
    saveAndResolve() {
      this.loadingCount += 1;
      let payload = {
        students: [this.currentUsersStudent],
        duplicate: this.selectedProgramDuplicate
      };
      ApiService.apiAxios.post(ApiRoutes.sdc.SDC_DUPLICATE_RESOLVE + '/'+this.type, payload)
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
    updateStudentObject(valueToBeRemoved) {
      if(this.selectedProgramDuplicate?.programDuplicateTypeCode === 'SPECIAL_ED') {
        this.currentUsersStudent.specialEducationCategoryCode = null;
        this.currentUsersStudent.enrolledProgramCodes = this.currentUsersStudent.enrolledProgramCodes.join('');
      } else if(this.selectedProgramDuplicate?.programDuplicateTypeCode === 'CAREER') {
        let updateEnrolledPrograms = this.currentUsersStudent.enrolledProgramCodes.filter(value => !enrolledProgram.CAREER_ENROLLED_PROGRAM_CODES.includes(value));
        this.currentUsersStudent.enrolledProgramCodes = updateEnrolledPrograms.join('');
        this.currentUsersStudent.careerProgramCode = null;
      } else {
        let updateEnrolledPrograms = this.currentUsersStudent.enrolledProgramCodes.filter(value => !value.includes(valueToBeRemoved));
        this.currentUsersStudent.enrolledProgramCodes = updateEnrolledPrograms.join('');
      } 
    },
    getDuplicatePrograms() {
      let programs = [];
      if(this.selectedProgramDuplicate?.programDuplicateTypeCode === 'SPECIAL_ED') {
        programs.push({code: this.currentUsersStudent.specialEducationCategoryCode, description: this.currentUsersStudent?.mappedSpedCode});
      } else if (this.selectedProgramDuplicate?.programDuplicateTypeCode === 'INDIGENOUS') {
        let mappedPrograms = this.currentUsersStudent.mappedIndigenousEnrolledProgram.split(',').filter(value => this.otherSchoolsStudent.mappedIndigenousEnrolledProgram.split(',').includes(value));
        for(let progs of mappedPrograms) {
          programs.push({code: progs.match(/(?<=\()\d+(?=\))/)?.[0], description: progs});
        }
      } else if(this.selectedProgramDuplicate?.programDuplicateTypeCode === 'CAREER') {
        let mappedPrograms = this.currentUsersStudent.mappedCareerProgram.split(',').filter(value => this.otherSchoolsStudent.mappedCareerProgram.split(',').includes(value));

        if(mappedPrograms.length === 0){
          programs.push({code: this.currentUsersStudent.careerProgramCode, description: this.currentUsersStudent.mappedCareerProgramCode});
        } else {
          for(let progs of mappedPrograms) {
            programs.push({code: progs.match(/(?<=\()\d+(?=\))/)?.[0], description: progs});
          }
        }
        
      } else if(this.selectedProgramDuplicate?.programDuplicateTypeCode === 'LANGUAGE') {

        let mappedPrograms = this.currentUsersStudent.mappedLanguageEnrolledProgram.split(',').filter(value => this.otherSchoolsStudent.mappedLanguageEnrolledProgram.split(',').includes(value));
        for(let progs of mappedPrograms) {
          programs.push({code: progs.match(/(?<=\()\d+(?=\))/)?.[0], description: progs});
        }
      }
      return programs.sort((a, b) => a.code - b.code);
    }
  }
};
</script>
  
  <style scoped>
   .containerSetup{
      padding-right: 0 !important;
      padding-left: 0 !important;
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
   :deep(.v-checkbox .v-label) {
     opacity: 1;
   }
  
  </style>
  

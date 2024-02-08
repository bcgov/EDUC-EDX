<template>
    <v-card
     id="viewStudentCard"
    >
            <v-card-title
              id="viewStudentCardTitle"
              class="sheetHeader pt-1 pb-1"
            >
              Student Details
            </v-card-title>
            <v-divider />
            <v-card-text>
                <v-row>
                    <v-col cols="10" class="d-flex">
                        <v-alert
                            color="#003366"
                            density="compact"
                            type="info"
                            variant="tonal"
                            id="eligible-fte-banner"
                        >
                            <b>Eligible FTE: </b> {{ studentForEdit?.fte }}
                        </v-alert>
                    </v-col>
                    <v-col cols="1" class="d-flex justify-end">
                        <v-btn
                            class="mr-2"
                            id="cancel"
                            color="#003366"
                            text="Cancel"
                            variant="outlined"
                            @click="cancel"
                        />
                    </v-col>
                    <v-col cols="1" class="d-flex justify-end">
                        <v-btn
                            class="ml-4"
                            id="save"
                            color="#003366"
                            text="Save"
                            @click="save"
                            :disabled="studentDetailsFormValid"
                        />
                    </v-col>
                </v-row>

                <EditStudent
                 :selected-students="selectedStudent"
                 :total-students="1"
                 :save-event="saveStudent"
                 @form-validity="isValid"
                 @reset-parent="reset()"
                 @student-object="setStudentContext"
                >
                </EditStudent>

                <v-divider class="mt-2 mb-2" />
                <v-row v-if="studentForEdit?.fte === 0">
                    <v-col>
                        <span><b>Reason for FTE of 0:</b></span>
                    </v-col>
                </v-row>
                <v-row v-if="showFundingEligibilitySection()">
                    <v-col>
                        <span><b>Program Funding Ineligiblity:</b></span>
                        <li v-if="studentForEdit?.careerProgramNonEligReasonCode !== null && studentForEdit?.careerProgramNonEligReasonCode !== 'NTENRCAREE'">
                            {{ getProgramEligibiltyTypeCodesDescription(studentForEdit?.careerProgramNonEligReasonCode) }}
                        </li>

                        <li v-if="studentForEdit?.frenchProgramNonEligReasonCode !== null && studentForEdit?.frenchProgramNonEligReasonCode !== 'NTENRFRENC'">
                            {{ getProgramEligibiltyTypeCodesDescription(studentForEdit?.frenchProgramNonEligReasonCode) }}
                        </li>

                        <li v-if="studentForEdit?.indigenousSupportProgramNonEligReasonCode !== null && studentForEdit?.indigenousSupportProgramNonEligReasonCode !== 'NTENRINDIG'">
                            {{ getProgramEligibiltyTypeCodesDescription(studentForEdit?.indigenousSupportProgramNonEligReasonCode) }}
                        </li>

                        <li v-if="studentForEdit?.specialEducationNonEligReasonCode !== null && studentForEdit?.specialEducationNonEligReasonCode !== 'NTENRSPED'">
                            {{ getProgramEligibiltyTypeCodesDescription(studentForEdit?.specialEducationNonEligReasonCode) }}
                        </li>

                        <li v-if="studentForEdit?.ellNonEligReasonCode !== null && studentForEdit?.ellNonEligReasonCode !== 'NTENRELL'">
                            {{ getProgramEligibiltyTypeCodesDescription(studentForEdit?.ellNonEligReasonCode) }}
                        </li>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <span><b>Graduated:</b>{{ studentForEdit?.isGraduated === 'true' ? 'Yes' : 'No' }}</span>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <span><b>Adult:</b>{{ studentForEdit?.isAdult === 'true' ? 'Yes' : 'No' }}</span>
                    </v-col>
                </v-row>
            </v-card-text>
          </v-card>

  </template>
  
  <script>
  import PrimaryButton from '../../util/PrimaryButton.vue';
  import alertMixin from '../../../mixins/alertMixin';
  import EditStudent from '../../common/EditStudent.vue';
  import { sdcCollectionStore } from '../../../store/modules/sdcCollection';
  
  export default {
    name: 'ViewStudentDetailsComponent',
    components: {
      PrimaryButton,
      EditStudent
    },
    mixins: [alertMixin],
    props: {
     selectedStudentIds: {
        type: Array,
        required: true,
        default: null,
     }
    },
    emits: ['close'],
    data() {
      return {
        selectedStudent: [],
        studentDetailsFormValid: true,
        saveStudent: false,
        sdcCollection: sdcCollectionStore(),
        studentForEdit: {}
      };
    },
    created() {
        this.selectedStudent.splice(0);
      this.selectedStudent.push(this.selectedStudentIds);
    },
    mounted() {
      
    },
    methods: {
        setStudentContext($event) {
            this.studentForEdit = $event;
        },
        save() {
            this.saveStudent =true;
        },
        cancel() {
            this.$emit('close');
        },
        isValid($event) {
            this.studentDetailsFormValid = $event;
        },
        reset() {
            this.saveStudent =false;
        },
        showFundingEligibilitySection() {
            return (this.studentForEdit?.careerProgramNonEligReasonCode !== null && this.studentForEdit?.careerProgramNonEligReasonCode !== 'NTENRCAREE') 
            || (this.studentForEdit?.frenchProgramNonEligReasonCode !== null && this.studentForEdit?.frenchProgramNonEligReasonCode !== 'NTENRFRENC')
            || (this.studentForEdit?.indigenousSupportProgramNonEligReasonCode !== null && this.studentForEdit?.indigenousSupportProgramNonEligReasonCode !== 'NTENRINDIG')
            || (this.studentForEdit?.specialEducationNonEligReasonCode !== null && this.studentForEdit?.specialEducationNonEligReasonCode !== 'NTENRSPED')
            || (this.studentForEdit?.ellNonEligReasonCode !== null && this.studentForEdit?.ellNonEligReasonCode !== 'NTENRELL');
        },
        getProgramEligibiltyTypeCodesDescription(key){
        return sdcCollectionStore().programEligibilityCodesMap.get(key)?.message;
      },
    }
  };
  </script>
  
  <style scoped>
    .sheetHeader {
        background-color: #003366;
        color: white;
        font-size: medium !important;
        font-weight: bolder !important;
    }

    .headerVal{
    color: #7f7f7f;
 }
  </style>
  
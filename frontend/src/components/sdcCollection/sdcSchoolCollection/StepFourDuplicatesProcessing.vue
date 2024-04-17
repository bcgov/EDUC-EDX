<template>
  <Spinner v-if="isLoading" />
  <div
    v-for="duplicateStudent in duplicateStudents"
    v-else-if="duplicateStudents.length > 0"
    :key="duplicateStudent.assignedPen"
  >
    <v-row>
      <v-col>
        <v-chip color="primary"><span style="font-weight: bold">Assigned PEN: </span>&nbsp;{{ duplicateStudent.assignedPen }}</v-chip>
      </v-col>
    </v-row>
    <v-data-table
      class="mb-10"
      :items="duplicateStudent.items"
      :headers="headers"
      mobile-breakpoint="0"
    >
      <template #top>
        <v-progress-linear
          v-show="isLoading"
          :indeterminate="true"
          color="primary"
        />
      </template>
      <template #headers>
        <tr class="header-row">
          <th
            v-for="column in headers"
            id="header"
            :key="column.key"
          >
            <div v-if="column.title === 'PEN'">
              <div class="header-text">
                PEN
              </div>
              <div
                v-if="column.hasOwnProperty('subHeader')"
                class="header-text"
              >
                {{ column.subHeader.title }}
              </div>
            </div>
            <div v-else-if="column.title !== 'select'">
              <div class="header-text">
                {{ column.title }}
              </div>
              <div
                v-if="column.hasOwnProperty('subHeader')"
                class="header-text"
              >
                {{ column.subHeader.title }}
              </div>
            </div>
          </th>
        </tr>
      </template>
      <template #item="props">
        <tr
          class="hoverTable"
        >
          <td
            v-for="column in headers"
            :key="column.key"
            class="td-data"
          >
            <div>
              <span v-if="column.key === 'studentPen'">
                {{ props.item['studentPen'] }}
              </span>

              <span v-else-if="column.key === 'legalName'">
                {{ displayName(props.item['legalFirstName'], props.item['legalMiddleNames'], props.item['legalLastName']) }}
              </span>

              <div v-else-if="column.key === 'isAdult'">
                <span v-if="props.item['isAdult'] !== null || props.item['isAdult' !== undefined]">{{ props.item['isAdult'] === "true" ? 'Yes' : 'No' }}</span>
              </div>

              <div v-else-if="column.key === 'action'">
                <v-menu
                  v-model="editOptionsOpen[props.item['sdcSchoolCollectionStudentID']]"
                  transition="fab-transition"
                  location="end"
                  offset="10"
                >
                  <template #activator="{ props }">
                    <v-btn
                      id="editOptionsMenu"
                      class="icon-button"
                      color="primary"
                      variant="outlined"
                      density="comfortable"
                      icon="mdi-playlist-edit"
                      v-bind="props"
                    />
                  </template>
                  <v-list>
                    <v-list-item
                      id="newMessageToConvBtn"
                      @click="editStudent(props.item)"
                    >
                      <v-icon
                        color="#003366"
                        class="pr-1 mb-1"
                      >
                        mdi-pencil
                      </v-icon>
                      <span class="ml-2">Edit</span>
                    </v-list-item>
                    <v-list-item
                      id="addAttachmentConvButton"
                      @click="removeStudent(props.item)"
                    >
                      <v-icon
                        color="#003366"
                        class="pr-1 mb-1"
                      >
                        mdi-trash-can
                      </v-icon>
                      <span class="ml-2">Remove</span>
                    </v-list-item>
                    <v-list-item
                      id="addStudentConvButton"
                      @click="markStudentAsDifferent(props.item)"
                    >
                      <v-icon
                        color="#003366"
                        class="pr-1 mb-1"
                      >
                        mdi-account-question
                      </v-icon>
                      <span class="ml-2">Request Review of PEN</span>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>

              <div v-else-if="column.key === 'mappedIndigenousEnrolledProgram' || column.key === 'mappedLanguageEnrolledProgram'">
                <template v-if="props.item[column.key]">
                  <span
                    v-for="(progs, idx) in props.item[column.key].split(',')"
                    :key="idx"
                  >
                    <div>{{ progs }}</div>
                  </span>
                </template>
                <template v-else>
                  <div>-</div>
                </template>
              </div>
              <span v-else-if="props.item[column.key]">{{ props.item[column.key] }}</span>
              <span v-else-if="column.title !== 'select'">-</span>

              <div v-if="column.hasOwnProperty('subHeader')">
                <div v-if="column.subHeader.key === 'usualName'">
                  <span v-if="props.item['usualLastName'] || props.item['usualFirstName'] || props.item['usualMiddleNames']">
                    {{ displayName(props.item['usualFirstName'], props.item['usualMiddleNames'], props.item['usualLastName']) }}
                  </span>
                  <span v-else>-</span>
                </div>
                <div v-else-if="column.subHeader.key === 'isGraduated'">
                  <span v-if="props.item['isGraduated'] !== null || props.item['isGraduated'] !== undefined">{{ props.item['isGraduated'] === "true" ? 'Yes' :'No' }}</span>
                </div>
                <div v-else-if="column.subHeader.key === 'dob'">
                  <span>{{ convertDate(props.item['dob']) }}</span>
                </div>
                <span v-else-if="props.item[column.subHeader.key]">{{ props.item[column.subHeader.key] }}</span>
                <span v-else>-</span>
              </div>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>
  </div>
  <v-alert
    v-else
    type="success"
    class="mb-6"
    variant="tonal"
    text="Congratulations! There are no duplicates in your school 1701 Submission"
  />
  <v-row>
    <v-col class="d-flex justify-end">
      <PrimaryButton
        v-if="!isLoading"
        id="step-3-next-button-school"
        class="mr-3 mb-3"
        icon="mdi-check"
        text="Next"
        :click-action="next"
        :disabled="duplicateStudents.length > 0"
      />
    </v-col>
  </v-row>

  <v-bottom-sheet
    v-model="editStudentSheet"
    :inset="true"
    :no-click-animation="true"
    :scrollable="true"
    :persistent="true"
  >
    <ViewStudentDetailsComponent
      :selected-student-ids="studentForEdit"
      @close="editStudentSheet = !editStudentSheet; getSchoolDuplicates()"
    />
  </v-bottom-sheet>
  <ConfirmationDialog ref="confirmRemovalOfStudentRecord">
    <template #message>
      <p>Are you sure that you would like to remove the selected student from the 1701 submission?</p>
    </template>
  </ConfirmationDialog>

  <ConfirmationDialog ref="confirmMarkDifferent">
    <template #message>
      <p>We will look into the assigned PEN we found for this student. Would you like to proceed?</p>
    </template>
  </ConfirmationDialog>
</template>

<script>
import alertMixin from '../../../mixins/alertMixin';
import PrimaryButton from '../../util/PrimaryButton.vue';
import { mapState } from 'pinia';
import { sdcCollectionStore } from '../../../store/modules/sdcCollection';
import ApiService from '../../../common/apiService';
import {ApiRoutes} from '../../../utils/constants';
import {displayName} from '../../../utils/format';
import {SCH_DUPLICATES} from '../../../utils/sdc/TableConfiguration';
import {cloneDeep} from 'lodash';
import ViewStudentDetailsComponent from '../../common/ViewStudentDetailsComponent.vue';
import {setFailureAlert, setSuccessAlert} from '../../composable/alertComposable';
import ConfirmationDialog from '../../util/ConfirmationDialog.vue';
import Spinner from '../../common/Spinner.vue';
import {DateTimeFormatter, LocalDate, ResolverStyle} from '@js-joda/core';

export default {
  name: 'StepFourDuplicatesProcessing',
  components: {
    Spinner,
    ConfirmationDialog,
    ViewStudentDetailsComponent,
    PrimaryButton
  },
  mixins: [alertMixin],
  props: {
    schoolCollectionObject: {
      type: Object,
      required: true,
      default: null
    },
    isStepComplete: {
      type: Boolean,
      required: true
    }
  },
  emits: ['next', 'previous'],
  data() {
    return {
      type: 'SDC',
      isLoading: true,
      editStudentSheet: false,
      studentForEdit: [],
      headers: SCH_DUPLICATES.tableHeaders,
      duplicateStudents: [],
      schoolCollection: null,
      editOptionsOpen: [],
      sdcSchoolCollectionID: this.$route.params.schoolCollectionID,
      school: {}
    };
  },
  computed: {
    ...mapState(sdcCollectionStore, ['currentStepInCollectionProcess']),
  },
  created() {
    this.getSchoolDuplicates();
  },
  methods: {
    next() {
      if(this.isStepComplete) {
        this.$emit('next');
      } else {
        this.markStepAsComplete();
      }
    },
    getSchoolDuplicates(){
      this.isLoading = true;
      ApiService.apiAxios.get(ApiRoutes.sdc.SDC_SCHOOL_COLLECTION + '/'+ this.sdcSchoolCollectionID + '/duplicates')
        .then(response => {
          this.duplicateStudents = response.data;
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.isLoading = false;
        });
    },
    convertDate(dob) {
      return LocalDate.parse(dob, DateTimeFormatter.ofPattern('uuuuMMdd').withResolverStyle(ResolverStyle.STRICT));
    },
    displayName,
    editStudent($event) {
      const selectedStudent = cloneDeep($event);
      this.studentForEdit.splice(0);
      this.studentForEdit.push(selectedStudent?.sdcSchoolCollectionStudentID);
      this.editStudentSheet = true;
    },
    async markStudentAsDifferent($event){
      const selectedStudent = cloneDeep($event);
      const confirmation = await this.$refs.confirmMarkDifferent.open('Request Review of PEN?', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Yes', rejectText: 'No'});
      if (!confirmation) {
        return;
      }
      ApiService.apiAxios.post(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${this.$route.params.schoolCollectionID}/markDiff`, selectedStudent)
        .then(() => {
          setSuccessAlert('Success! The student details have been updated.');
          this.getSchoolDuplicates();
        }).catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to update student details. Please try again later.');
        });
    },
    async removeStudent($event){
      const selectedStudent = cloneDeep($event);
      const confirmation = await this.$refs.confirmRemovalOfStudentRecord.open('Are you sure you wish to remove this student?', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Yes', rejectText: 'No'});
      if (!confirmation) {
        return;
      }

      ApiService.apiAxios.post(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${this.$route.params.schoolCollectionID}/students/remove`, selectedStudent?.sdcSchoolCollectionStudentID.split())
        .then(() => {
          setSuccessAlert('Success! Student has been removed.');
        }).catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to remove this student. Please try again later.');
        }).finally(() => {
          this.getSchoolDuplicates();
        });
    },
    markStepAsComplete() {
      let updateCollection = {
        schoolCollection: this.schoolCollectionObject,
        status: 'DUP_VRFD'
      };
      ApiService.apiAxios.put(ApiRoutes.sdc.BASE_URL + '/' + this.sdcSchoolCollectionID, updateCollection)
        .then(() => {
          this.$emit('next');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while verifying data. Please try again later.');
        });
    }
  }
};
</script>

<style scoped>

.border {
  border: 2px solid grey;
  border-radius: 5px;
  padding: 35px;
  margin-bottom: 2em;
}

.form-hint{
  color: rgb(56, 89, 138);
  font-size: 14px;
}

.divider {
  border-right: 1px solid lightgray;
  border-radius: 0px;
}

:deep(.v-data-table-footer) {
  display: none;
}

:deep(.v-data-table){
  font-size: 0.90em;
}

.divider:last-child  {
  border-right: 0
}

.icon-button{
  box-shadow: none !important;
  border: none !important;
}
</style>

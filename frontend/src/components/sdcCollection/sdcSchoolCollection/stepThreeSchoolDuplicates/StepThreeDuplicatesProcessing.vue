<template>
  <div
    v-for="duplicateStudent in duplicateStudents"
    :key="duplicateStudent.assignedPen"
  >
    <v-row>
      <v-col>
        <span style="font-weight: bold">Assigned PEN:</span> {{ duplicateStudent.assignedPen }}
      </v-col>
    </v-row>
    <v-data-table
      class="mb-6"
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
                Submitted PEN
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
                {{ props.item.raw['studentPen'] }}
              </span>

              <span v-else-if="column.key === 'legalName'">
                {{ displayName(props.item.raw['legalFirstName'], props.item.raw['legalMiddleNames'], props.item.raw['legalLastName']) }}
              </span>

              <div v-else-if="column.key === 'isAdult'">
                <span v-if="props.item.raw['isAdult'] !== null || props.item.raw['isAdult' !== undefined]">{{ props.item.raw['isAdult'] === "true" ? 'Yes' : 'No' }}</span>
              </div>

              <div v-else-if="column.key === 'fte'">
                <span>{{ props.item.raw['fte'] === 0 ? 0 : props.item.raw['fte'] }}</span>
              </div>

              <div v-else-if="column.key === 'action'">
                <v-menu
                  v-model="editOptionsOpen[props.item.raw['sdcSchoolCollectionStudentID']]"
                  transition="fab-transition"
                  location="end"
                  offset="10"
                >
                  <template #activator="{ props }">
                    <v-btn
                      id="editOptionsMenu"
                      dark
                      text="Resolve"
                      color="primary"
                      v-bind="props"
                    />
                  </template>
                  <v-list>
                    <v-list-item
                      id="newMessageToConvBtn"
                    >
                      <v-icon
                        color="#003366"
                        class="pr-1"
                      >
                        mdi-email-outline
                      </v-icon>
                      <span>Message</span>
                    </v-list-item>
                    <v-list-item
                      id="addAttachmentConvButton"
                    >
                      <v-icon
                        color="#003366"
                        class="pr-1"
                      >
                        mdi-paperclip
                      </v-icon>
                      <span>Attachment</span>
                    </v-list-item>
                    <v-list-item
                      id="addStudentConvButton"
                    >
                      <v-icon
                        color="#003366"
                        class="pr-1"
                      >
                        mdi-emoticon-happy-outline
                      </v-icon>
                      <span>Student</span>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>

              <div v-else-if="column.key === 'mappedIndigenousEnrolledProgram' || column.key === 'mappedLanguageEnrolledProgram'">
                <template v-if="props.item.raw[column.key]">
                  <span
                    v-for="(progs, idx) in props.item.raw[column.key].split(',')"
                    :key="idx"
                  >
                    <div>{{ progs }}</div>
                  </span>
                </template>
                <template v-else>
                  <div>-</div>
                </template>
              </div>
              <span v-else-if="props.item.raw[column.key]">{{ props.item.raw[column.key] }}</span>
              <span v-else-if="column.title !== 'select'">-</span>

              <div v-if="column.hasOwnProperty('subHeader')">
                <div v-if="column.subHeader.key === 'usualName'">
                  <span v-if="props.item.raw['usualLastName'] || props.item.raw['usualFirstName'] || props.item.raw['usualMiddleNames']">
                    {{ displayName(props.item.raw['usualFirstName'], props.item.raw['usualMiddleNames'], props.item.raw['usualLastName']) }}
                  </span>
                  <span v-else>-</span>
                </div>
                <div v-else-if="column.subHeader.key === 'isGraduated'">
                  <span v-if="props.item.raw['isGraduated'] !== null || props.item.raw['isGraduated'] !== undefined">{{ props.item.raw['isGraduated'] === "true" ? 'Yes' :'No' }}</span>
                </div>
                <span v-else-if="props.item.raw[column.subHeader.key]">{{ props.item.raw[column.subHeader.key] }}</span>
                <span v-else>-</span>
              </div>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>
  </div>
  
  <v-row justify="end">
    <PrimaryButton
      id="step-3-next-button-school"
      class="mr-3 mb-3"
      icon="mdi-check"
      text="Verify as Correct"
      :click-action="next"
    />
  </v-row>
</template>

<script>
import alertMixin from '../../../../mixins/alertMixin';
import PrimaryButton from '../../../util/PrimaryButton.vue';
import { mapState } from 'pinia';
import { sdcCollectionStore } from '../../../../store/modules/sdcCollection';
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';
import {displayName} from '../../../../utils/format';
import {SCH_DUPLICATES} from '../../../../utils/sdc/TableConfiguration';

export default {
  name: 'StepThreeDuplicatesProcessing',
  components: {
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
    displayName,
    markStepAsComplete() {
      let updateCollection = {
        schoolCollection: this.schoolCollectionObject,
        status: 'SCH_D_VRFD'
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

.divider:last-child  {
  border-right: 0
}
</style>

<template>
  <div v-for="duplicateStudent in duplicateStudents" :key="duplicateStudent.assignedPen">
    <v-row>
      <v-col>
        Assigned PEN: {{duplicateStudent.assignedPen}}
      </v-col>
    </v-row>
    <v-data-table
        class="mb-6"
      :items="duplicateStudent.items"
      :headers="headers"
      mobile-breakpoint="0"
    />
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
      headers: [
        { title: 'PEN', key: 'studentPen'},
        { title: 'Local ID', key: 'localID'},
        { title: 'Legal Surname, Given (Middle)', key: 'legalName'},
        { title: 'Usual Surname, Given (Middle)', key: 'usualName'},
        { title: 'error', key: 'error'},
        { title: 'fundingWarning', key: 'fundingWarning'},
        { title: 'infoWarning', key: 'infoWarning'},
      ],
      duplicateStudents: [],
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
          console.log('Students: ', JSON.stringify(response.data));
          this.duplicateStudents = response.data;
        }).catch(error => {
          console.error(error);
          this.setFailureAlert(error.response?.data?.message || error.message);
        }).finally(() => {
          this.loading = false;
        });
    },
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

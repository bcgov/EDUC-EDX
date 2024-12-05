<template>
  <ConfirmationDialog ref="confirmResolveEnrollmentDuplicateViaRemoveStudent">
    <template #message>
      <p>Are you sure that you would like to remove the selected student from the 1701 submission?</p>
    </template>
  </ConfirmationDialog>
</template>
<script>
import {displayName} from '../../../../utils/format';
import ApiService from '../../../../common/apiService';
import {ApiRoutes} from '../../../../utils/constants';
import {setFailureAlert, setSuccessAlert} from '../../../composable/alertComposable';
import ConfirmationDialog from '../../../util/ConfirmationDialog.vue';

export default {
  name: 'EnrollmentDuplicateResolveViaRemove',
  components: {
    ConfirmationDialog
  },
  emits: ['close-refresh'],
  data() {
    return {
      sdcSchoolCollectionStudent: {}
    };
  },
  methods: {
    displayName,
    async removeAndResolveStudent(sdcSchoolCollectionStudent) {
      this.sdcSchoolCollectionStudent = sdcSchoolCollectionStudent;
      let studentToRemove = [];
      studentToRemove.push(this.sdcSchoolCollectionStudent.sdcSchoolCollectionStudentID);

      const confirmation = await this.$refs.confirmResolveEnrollmentDuplicateViaRemoveStudent.open('Remove Student', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Remove', rejectText: 'Cancel'});
      if (!confirmation) {
        return;
      }
      ApiService.apiAxios.post(`${ApiRoutes.sdc.SDC_SCHOOL_COLLECTION_STUDENT}/${this.sdcSchoolCollectionStudent.sdcSchoolCollectionID}/students/remove`, studentToRemove)
        .then(() => {
          setSuccessAlert('Success! The student has been removed.');
        }).catch(error => {
          console.error(error);
          setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while trying to update student details. Please try again later.');
        }).finally(() => {
          this.$emit('close-refresh');
        });
    }
  }
};
</script>

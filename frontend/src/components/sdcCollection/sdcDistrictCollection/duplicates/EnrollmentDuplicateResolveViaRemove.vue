<template>
  <ConfirmationDialog ref="confirmResolveEnrollmentDuplicateViaRemoveStudent">
    <template #message>
      <p>Are you sure you want to remove {{ displayName(sdcSchoolCollectionStudent.legalFirstName, sdcSchoolCollectionStudent.legalMiddleNames, sdcSchoolCollectionStudent.legalLastName) }} from {{ sdcSchoolCollectionStudent.schoolName }}?</p>
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
    async removeAndResolveStudent(duplicate, sdcSchoolCollectionStudent) {
      this.sdcSchoolCollectionStudent = sdcSchoolCollectionStudent;
      const confirmation = await this.$refs.confirmResolveEnrollmentDuplicateViaRemoveStudent.open('Remove Student', null, {color: '#fff', width: 580, closeIcon: false, subtitle: false, dark: false, resolveText: 'Remove', rejectText: 'Cancel'});
      if (!confirmation) {
        return;
      }
      let payload = {
        students: [this.sdcSchoolCollectionStudent],
        duplicate: duplicate
      };
      ApiService.apiAxios.post(ApiRoutes.sdc.SDC_DUPLICATE_RESOLVE + '/'+ duplicate?.sdcDuplicateID + '/DELETE_ENROLLMENT_DUPLICATE', payload)
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

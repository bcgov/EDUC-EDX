<template>
  <div class="border">
    <v-row>
      <v-col>
        <v-alert
          density="compact"
          type="info"
          variant="tonal"
        >
          <span>Please review and verify that the details on the record for the school are accurate.</span>
        </v-alert>
      </v-col>
    </v-row>

    <SchoolContactsForm
      :function-name="type"
      :school-collection-object="schoolCollectionObject"
      :school-i-d="schoolCollectionObject?.schoolID"
      @school-contacts="checkIfRequiredSchoolContactsExists"
      @update-is-offshore="handleIsOffshoreSchool"
    />
  </div>

  <v-row
    v-if="isDisabled"
  >
    <v-col class="error-message">
      <p
        v-if="isOffshoreSchool"
        class="form-hint"
      >
        A principal with an active start date and contact information must be added.
      </p>
      <p
        v-else
        class="form-hint"
      >
        A principal, safe schools coordinator and safe schools coordinator backup<br>with an active start date and contact information must be added.
      </p>
    </v-col>
  </v-row>
  
  <v-row justify="end">
    <PrimaryButton
      v-if="!isStepComplete"
      id="step-5-next-button-school"
      class="mr-3 mb-3"
      icon="mdi-check"
      text="Verify 1601 as Correct and Continue"
      :disabled="isDisabled || !canMoveForward()"
      :click-action="next"
    />
    <PrimaryButton
      v-else
      id="step-5-next-button-school"
      class="mr-3 mb-3"
      icon="mdi-check"
      text="Next"
      :click-action="next"
    />
  </v-row>
</template>
  
<script>
import alertMixin from '../../../mixins/alertMixin';
import PrimaryButton from '../../util/PrimaryButton.vue';
import SchoolContactsForm from '../../common/forms/SchoolContactsForm.vue';
import {isContactCurrent} from '../../../utils/institute/status';
import { mapState } from 'pinia';
import { sdcCollectionStore } from '../../../store/modules/sdcCollection';
import ApiService from '../../../common/apiService';
import { ApiRoutes } from '../../../utils/constants';
import {MINISTRY_CONTACTS} from '../../../utils/constants/MinistryContactsInfo';
import {authStore} from '../../../store/modules/auth';
import {PERMISSION} from '../../../utils/constants/Permission';

export default {
  name: 'StepSixSchoolContacts',
  components: {
    PrimaryButton,
    SchoolContactsForm
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
  emits: ['next'],
  data() {
    return {
      isDisabled: false,
      type: 'SDC',
      sdcSchoolCollectionID: this.$route.params.schoolCollectionID,
      isOffshoreSchool: false,
      MINISTRY_CONTACTS: MINISTRY_CONTACTS
    };
  },
  computed: {
    ...mapState(authStore, ['userInfo']),
    ...mapState(sdcCollectionStore, ['currentStepInCollectionProcess']),
    hasEditPermission(){
      return (this.userInfo?.activeInstitutePermissions?.filter(perm => perm === PERMISSION.SCHOOL_SDC_EDIT).length > 0);
    },
  },
  created() {
        
  },
  methods: {
    next() {
      if(this.isStepComplete) {
        this.$emit('next');
      } else {
        this.markStepAsComplete();
      }
    },
    canMoveForward(){
      return this.isStepComplete || this.hasEditPermission;
    },
    markStepAsComplete() {
      let updateCollection = {
        schoolCollection: this.schoolCollectionObject,
        status: 'SCH_C_VRFD'
      };
      ApiService.apiAxios.put(ApiRoutes.sdc.BASE_URL + '/' + this.sdcSchoolCollectionID, updateCollection)
        .then(() => {
          this.$emit('next');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while verifying school contacts. Please try again later.');
        });    
    },
    checkIfRequiredSchoolContactsExists(contacts) {
      let principal = contacts.filter(contact => contact.schoolContactTypeCode === 'PRINCIPAL' && isContactCurrent(contact));

      if(this.isOffshoreSchool && (principal.length > 0 && (principal[0].phoneNumber !== null || principal[0].email !== null))){
        this.isDisabled = false;
        return;
      }else{
        let safeSchoolsCoordinator = contacts.filter(contact => contact.schoolContactTypeCode === 'SAFE_COORD' && isContactCurrent(contact));
        let safeSchoolsCoordinatorBackup = contacts.filter(contact => contact.schoolContactTypeCode === 'SFECOORDBU' && isContactCurrent(contact));
        if((principal.length > 0 && (principal[0].phoneNumber || principal[0].email))
            && (safeSchoolsCoordinator.length > 0 && (safeSchoolsCoordinator[0].phoneNumber || safeSchoolsCoordinator[0].email))
            && (safeSchoolsCoordinatorBackup.length > 0 && (safeSchoolsCoordinatorBackup[0].phoneNumber || safeSchoolsCoordinatorBackup[0].email))) {
          this.isDisabled = false;
          return;
        }
      }
      this.isDisabled = true;
    },
    handleIsOffshoreSchool(isOffshore) {
      this.isOffshoreSchool = isOffshore;
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

  .error-message {
    text-align: end;
   }
</style>
    
    
  

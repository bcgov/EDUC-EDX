<template>
  <div class="border">
    <v-row
      v-if="displayBanner"
      class="mb-0"
    >
      <v-col>
        <v-alert
          density="compact"
          type="info"
          variant="tonal"
        >
          <span>Please review and verify that the details on the record for the school are accurate.</span>
          <span v-if="isOffshoreSchool"> Require updates to school details? Please contact {{ MINISTRY_CONTACTS.OFFSHORE_ADMIN }}</span>
        </v-alert>
      </v-col>
    </v-row>

    <SchoolDetailsForm
      :function-name="type"
      :school-collection-object="schoolCollectionObject"
      :school-i-d="schoolCollectionObject?.schoolID"
      @is-form-valid="checkFormValidity"
      @edit-toggled="toggleBanner"
      @update-is-offshore="handleIsOffshoreSchool"
    />
  </div>

  <v-row
    v-if="isDisabled"
  >
    <v-col class="error-message">
      <p class="form-hint">
        Address, phone, and email must be added
      </p>
    </v-col>
  </v-row>

  <v-row justify="end">
    <PrimaryButton
      v-if="!isStepComplete && !isEditing"
      id="step-5-next-button-school"
      class="mr-3 mb-3"
      icon="mdi-check"
      text="Verify 1601 as Correct and Continue"
      :disabled="isDisabled || !canMoveForward()"
      :click-action="next"
    />
    <PrimaryButton
      v-else-if="isStepComplete && !isEditing"
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
import SchoolDetailsForm from '../../common/forms/SchoolDetailsForm.vue';
import { mapState } from 'pinia';
import { sdcCollectionStore } from '../../../store/modules/sdcCollection';
import ApiService from '../../../common/apiService';
import { ApiRoutes } from '../../../utils/constants';
import {MINISTRY_CONTACTS} from '../../../utils/constants/MinistryContactsInfo';
import {PERMISSION} from '../../../utils/constants/Permission';
import {authStore} from '../../../store/modules/auth';

export default {
  name: 'StepFiveSchoolDetails',
  components: {
    PrimaryButton,
    SchoolDetailsForm
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
      isDisabled: false,
      isEditing: false,
      sdcSchoolCollectionID: this.$route.params.schoolCollectionID,
      displayBanner: true,
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
        status: 'SCH_D_VRFD'
      };
      ApiService.apiAxios.put(ApiRoutes.sdc.BASE_URL + '/' + this.sdcSchoolCollectionID, updateCollection)
        .then(() => {
          this.$emit('next');
        })
        .catch(error => {
          console.error(error);
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while verifying school details. Please try again later.');
        });    
    },
    checkFormValidity(value) {
      this.isDisabled = !value;
    },
    toggleBanner(value) {
      this.displayBanner = !value;
      this.isEditing = value;
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
    
    
  

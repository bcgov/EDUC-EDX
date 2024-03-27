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
          <span v-if="isOffshoreSchool"> Require updates to school details? Please contact {{ MINISTRY_CONTACTS.OFFSHORE_ADMIN }}</span>
        </v-alert>
      </v-col>
    </v-row>

    <SchoolContactsForm
      :function-name="type"
      :schoolCollectionObject="schoolCollectionObject"
      @school-contacts="checkIfPrincipalContactExists"
      @update-is-offshore="handleIsOffshoreSchool"
    />
  </div>

  <v-row
    v-if="isDisabled"
  >
    <v-col class="error-message">
      <p class="form-hint">
        A principal with an active start date and contact information must be added
      </p>
    </v-col>
  </v-row>
  
  <v-row justify="end">
    <PrimaryButton
      id="step-5-next-button-school"
      class="mr-3 mb-3"
      icon="mdi-check"
      text="Verify 1601 as Correct and Continue"
      :disabled="isDisabled"
      :click-action="next"
    />
  </v-row>
</template>
  
<script>
import alertMixin from '../../mixins/alertMixin';
import PrimaryButton from '../util/PrimaryButton.vue';
import SchoolContactsForm from '../common/forms/SchoolContactsForm.vue';
import {isContactCurrent} from '../../utils/institute/status';
import { mapState } from 'pinia';
import { sdcCollectionStore } from '../../store/modules/sdcCollection';
import ApiService from '../../common/apiService';
import { ApiRoutes } from '../../utils/constants';
import {MINISTRY_CONTACTS} from '../../utils/constants/MinistryContactsInfo';

export default {
  name: 'StepFiveSchoolContacts',
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
    ...mapState(sdcCollectionStore, ['currentStepInCollectionProcess']),
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
    checkIfPrincipalContactExists(contacts) {
      let contact = contacts.filter(contact => contact.schoolContactTypeCode === 'PRINCIPAL' && isContactCurrent(contact));
      if(contact.length > 0 && (contact[0].phoneNumber || contact[0].email)) {
        this.isDisabled = false;
      } else {
        this.isDisabled = true;
      }
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
    
    
  

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
          text="Please review and verify that the details on the record for the school are accurate."
        />
      </v-col>
    </v-row>

    <SchoolDetailsForm
      :function-name="type"
      :schoolCollectionObject="schoolCollectionObject"
      @is-form-valid="checkFormValidity"
      @edit-toggled="toggleBanner"
    />
  </div>

  <v-row
    v-if="isDisabled"
  >
    <v-col class="error-message">
      <p class="form-hint">
        Address, phone, and/or email must be added
      </p>
    </v-col>
  </v-row>

  <v-row justify="end">
    <PrimaryButton
      id="step-4-next-button-school"
      class="mr-3 mb-3"
      icon="mdi-check"
      text="Verify 1601 as Correct and Continue"
      :disabled="isDisabled"
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

export default {
  name: 'StepFourSchoolDetails',
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
      sdcSchoolCollectionID: this.$route.params.schoolCollectionID,
      displayBanner: true
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
          this.setFailureAlert(error?.response?.data?.message ? error?.response?.data?.message : 'An error occurred while verifying school details. Please try again later.');
        });    
    },
    checkFormValidity(value) {
      this.isDisabled = !value;
    },
    toggleBanner(value) {
      this.displayBanner = !value;
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
    
    
  

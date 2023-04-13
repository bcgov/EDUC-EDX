<template>
  <v-container 
    class="containerSetup"
    fluid
  >
    <div class="border">
      <v-row>
        <v-col>
          <p>Please review and verify that the details on the record for the school are accurate.</p>
        </v-col>
      </v-row>

      <SchoolDetailsForm
        :function-name="type"
        @is-form-valid="checkFormValidity"
      />
    </div>
      

    <v-row justify="end">
      <PrimaryButton
        id="nextButton"
        class="mr-2 mb-3"           
        icon="mdi-check"
        text="Verify 1601 as Correct and Continue"
        :disabled="isDisabled"
        :click-action="next"
      />
    </v-row>
    <v-row
      v-if="isDisabled"
      justify="end"
    >
      <p class="form-hint">
        Address, phone, and/or email must be added
      </p>
    </v-row>
  </v-container>
</template>
  
<script>
import alertMixin from '../../mixins/alertMixin';
import PrimaryButton from '../util/PrimaryButton.vue';
import SchoolDetailsForm from '../common/forms/SchoolDetailsForm.vue';
import { mapState } from 'pinia';
import { useSldCollectionStore } from '../../store/modules/sldCollection';
import ApiService from '../../common/apiService';
import { ApiRoutes } from '../../utils/constants';

export default {
  name: 'StepOneSchoolDetails',
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
    }
  },
  emits: ['next', 'previous'],
  data() {
    return {
      type: 'SLD',
      isDisabled: false,
      sdcSchoolCollectionID: this.$route.params.schoolCollectionID
    };
  },
  computed: {
    ...mapState(useSldCollectionStore, ['currentStepInCollectionProcess']),
  },
  created() {
  },
  methods: {
    next() {
      if(this.currentStepInCollectionProcess.isComplete) {
        this.$emit('next');
      } else {
        this.markStepAsComplete();
      }
    },
    markStepAsComplete() {
      let updateCollection = {
        schoolCollection: this.schoolCollectionObject,
        status: 'SCH_D_VRFD'
      };
      ApiService.apiAxios.put(ApiRoutes.sld.BASE_URL + '/' + this.sdcSchoolCollectionID, updateCollection)
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
    }
  }
};
</script>
    
    <style scoped>
  .containerSetup{
    padding-right: 5em !important;
    padding-left: 5em !important;
  }

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
  
  @media screen and (max-width: 1200px) {
    .containerSetup{
      padding-right: 3em !important;
      padding-left: 3em !important;
    }
  } 
    </style>
    
    
  
